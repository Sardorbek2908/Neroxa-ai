import { Router } from 'express';
import { db } from '../database/db';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { agentService } from '../services/agentService';
import { geminiProvider } from '../providers/geminiProvider';
import { presentationService } from '../services/presentationService';
import { inspectPromptSecurity } from '../middleware/security';
import { Generation, Presentation } from '../database/types';

const router = Router();

// Get all chats for current user
router.get('/chats', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const chats = db.getChats(req.user.id);
  res.json({ chats });
});

// Create new chat
router.post('/chats', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const { title, model, language } = req.body;
  const chat = db.createChat(req.user.id, title || 'New Conversation', model || 'gemini-3.8-flash', language);
  res.status(201).json({ chat });
});

// Get chat by ID with its messages
router.get('/chats/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const chat = db.getChat(req.params.id, req.user.id);
  if (!chat) {
    res.status(404).json({ error: 'Not Found', message: 'Chat not found' });
    return;
  }
  const messages = db.getMessages(chat.id);
  res.json({ chat, messages });
});

// Rename chat
router.put('/chats/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const { title } = req.body;
  const chat = db.updateChat(req.params.id, req.user.id, { title });
  if (!chat) {
    res.status(404).json({ error: 'Not Found', message: 'Chat not found' });
    return;
  }
  res.json({ chat });
});

// Delete chat
router.delete('/chats/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const success = db.deleteChat(req.params.id, req.user.id);
  if (!success) {
    res.status(404).json({ error: 'Not Found', message: 'Chat not found' });
    return;
  }
  res.json({ success: true });
});

// Send message to AI Chat & NEXORA Agent
router.post('/chat', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const { chatId, message, model, attachments } = req.body;

  if (!message && (!attachments || attachments.length === 0)) {
    res.status(400).json({ error: 'Validation Error', message: 'Message or attachment is required' });
    return;
  }

  // Check prompt security
  const securityCheck = inspectPromptSecurity(message || '');
  if (!securityCheck.safe) {
    db.logSecurityEvent({
      type: 'suspicious_input',
      userId: req.user.id,
      ip: (req.ip || '127.0.0.1').toString(),
      details: securityCheck.warning || 'Flagged input',
    });
    res.status(400).json({ error: 'Security Warning', message: securityCheck.warning });
    return;
  }

  // Check user limit for chat messages
  const messageLimit = db.checkUserLimit(req.user.id, 'messages');
  if (!messageLimit.allowed) {
    res.status(403).json({
      error: 'Limit Reached',
      message: "Bepul xabarlar limitingiz (15 ta) tugadi. Cheksiz xabarlar va barcha AI imkoniyatlaridan foydalanish uchun PRO obunaga o'ting!",
      limitReached: true,
      limitType: 'messages',
    });
    return;
  }

  // Ensure chat exists or create one
  let activeChat = chatId ? db.getChat(chatId, req.user.id) : undefined;
  if (!activeChat) {
    const title = message ? message.slice(0, 35) : 'New Conversation';
    activeChat = db.createChat(req.user.id, title, model || 'gemini-3.8-flash');
  }

  // Store user message
  const userMsg = db.addMessage({
    chatId: activeChat.id,
    role: 'user',
    content: message || '',
    attachments,
  });

  // NEXORA Agent intent classification
  const classification = await agentService.classifyIntent(message || '', attachments && attachments.length > 0);

  // Retrieve previous conversation context
  const previousMessages = db.getMessages(activeChat.id).slice(-8);

  const systemInstruction = `You are NEXORA Agent, the master intelligence behind NEXORA AI — Create. Imagine. Generate.
You are deeply multilingual and natively understand Uzbek, English, Russian, Turkish, Kazakh, Arabic, and more.

STRICT LANGUAGE RULES:
- Detect the language of the user's latest query automatically.
- If the user writes in Uzbek, you MUST respond in fluent, natural Uzbek.
- If the user writes in Russian, you MUST respond in fluent, natural Russian.
- If the user writes in English, you MUST respond in fluent, natural English.
- If the user writes in Turkish, you MUST respond in fluent, natural Turkish.

TOOL & CAPABILITY ROUTING:
When users ask for specialized capabilities, acknowledge the tool and guide them directly:
- If intent is "presentation", explain that NEXORA AI has a dedicated 10-stage AI Presentation Generator ready to produce editable PPTX and PDF slides, and provide a structured preliminary outline.
- If intent is "image_generation", provide creative visual ideas and prompt refinements ready for the "Create Image" workspace.
- If intent is "video_generation", explain the camera angles, cinematic prompts, and motion dynamics for the "Create Video" workspace.
- If intent is "coding", provide high-level, production-grade, bug-free code with explanations.

Formatting: Use clean Markdown, headers, bullet points, and code blocks where helpful. Be concise, brilliant, and professional.`;

  try {
    const modelToUse = model || activeChat.model || 'gemini-3.8-flash';

    // Prepare contents adhering strictly to Gemini schema
    const rawContents: { role: 'user' | 'model'; parts: any[] }[] = [];
    for (const m of previousMessages) {
      const parts: any[] = [];
      if (m.attachments && m.attachments.length > 0) {
        for (const att of m.attachments) {
          if (att.url.startsWith('data:')) {
            const [header, base64] = att.url.split(',');
            const mime = header.split(';')[0].replace('data:', '');
            parts.push({ inlineData: { data: base64, mimeType: mime } });
          }
        }
      }
      if (m.content && m.content.trim()) {
        parts.push({ text: m.content });
      } else if (parts.length === 0) {
        parts.push({ text: ' ' });
      }

      rawContents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts,
      });
    }

    // Ensure valid alternating sequence starting with user
    const contents: { role: 'user' | 'model'; parts: any[] }[] = [];
    for (const c of rawContents) {
      if (contents.length === 0) {
        if (c.role === 'user') {
          contents.push(c);
        }
      } else {
        const last = contents[contents.length - 1];
        if (last.role === c.role) {
          last.parts.push(...c.parts);
        } else {
          contents.push(c);
        }
      }
    }

    // If still empty, ensure user prompt is present
    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: message || 'Salom' }],
      });
    }

    let aiResponseText = await geminiProvider.generateText(contents, {
      model: modelToUse,
      systemInstruction,
    });

    let generatedImage: Generation | undefined;
    let generatedPresentation: Presentation | undefined;

    // Direct Image Generation inside Chat
    const isImageRequest =
      classification.intent === 'image_generation' ||
      /\b(rasm|surat|tasvir|chizib|yaratish|chiz|image|draw|picture|photo)\b/i.test(message || '');

    if (isImageRequest && message) {
      try {
        const cleanedImagePrompt = message
          .replace(/^(rasm\s*(chiz|yarat|qilib\s*ber)?|draw|generate\s*(an?)?\s*image\s*of|create\s*image|surat\s*chiz)\s*:?/i, '')
          .trim() || message;

        const imgResult = await geminiProvider.generateImage({
          prompt: cleanedImagePrompt,
          aspectRatio: '1:1',
        });

        const outputUrl = `data:${imgResult.mimeType};base64,${imgResult.base64}`;
        generatedImage = db.addGeneration({
          userId: req.user.id,
          type: 'image',
          title: cleanedImagePrompt.slice(0, 50),
          prompt: cleanedImagePrompt,
          model: 'gemini-3.1-flash-lite-image',
          aspectRatio: '1:1',
          outputUrl,
        });

        db.incrementUsage(req.user.id, 'imagesCount', 1);

        const uzPrefix = "🎨 **Rasm tayyor!** Siz so'ragan tasvir muvaffaqiyatli chizildi. Uni to'liq hajmda ochishingiz yoki yuklab olishingiz mumkin.\n\n";
        aiResponseText = uzPrefix + aiResponseText;
      } catch (imgErr) {
        console.warn('In-chat image generation failed:', imgErr);
      }
    }

    // Direct Presentation Generation inside Chat
    const isPresentationRequest =
      classification.intent === 'presentation' ||
      /\b(prezentatsiya|taqdimot|slayd|presentation|slides|pptx)\b/i.test(message || '');

    if (isPresentationRequest && message && !generatedImage) {
      try {
        const topic = message
          .replace(/^(prezentatsiya\s*(qilib\s*ber|tayyorla|yarat)?|create\s*(a)?\s*presentation\s*on|taqdimot\s*(tayyorla)?)\s*:?/i, '')
          .trim() || message;

        // Check if student institution or group is in the prompt
        let studentInfo = undefined;
        const uniMatch = message.match(/(TATU|TDIU|O'zMU|SamDU|FarDU|litsey|maktab|institut|universitet[a-z]*)/i);
        const groupMatch = message.match(/(\d{3}[-\s]?[a-z]*|\d+[-]?guruh)/i);
        if (uniMatch || groupMatch) {
          studentInfo = {
            institution: uniMatch ? uniMatch[0] : undefined,
            group: groupMatch ? groupMatch[0] : undefined,
          };
        }

        generatedPresentation = await presentationService.generatePresentation({
          userId: req.user.id,
          topic,
          slideCount: 8,
          language: req.user.preferredLanguage || 'Uzbek',
          studentInfo,
        });

        const uzPresPrefix = `📊 **Taqdimot tayyorlandi!** "${generatedPresentation.title}" mavzusidagi ${generatedPresentation.slides.length} ta slayd yaratildi. Quyidagi karta orqali slaydlarni to'liq ko'rishingiz, tahrirlashingiz yoki PowerPoint (.pptx) formatida yuklab olishingiz mumkin.\n\n`;
        aiResponseText = uzPresPrefix + aiResponseText;
      } catch (presErr) {
        console.warn('In-chat presentation generation failed:', presErr);
      }
    }

    const assistantMsg = db.addMessage({
      chatId: activeChat.id,
      role: 'assistant',
      content: aiResponseText,
      modelUsed: modelToUse,
      toolUsed: classification.intent !== 'chat' ? classification.intent : undefined,
      generatedImage,
      generatedPresentation,
    });

    db.incrementUsage(req.user.id, 'messagesCount', 1);

    res.json({
      chat: activeChat,
      userMessage: userMsg,
      message: assistantMsg,
      classification,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Generation Error',
      message: error.message || 'Failed to process AI chat response',
    });
  }
});

export default router;
