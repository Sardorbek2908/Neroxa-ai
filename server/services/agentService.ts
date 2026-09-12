import { geminiProvider } from '../providers/geminiProvider';
import { db } from '../database/db';

export type AgentIntent =
  | 'chat'
  | 'image_generation'
  | 'video_generation'
  | 'image_editing'
  | 'presentation'
  | 'coding'
  | 'file_analysis';

export interface AgentClassification {
  intent: AgentIntent;
  detectedLanguage: string;
  confidence: number;
  extractedParameters: {
    prompt?: string;
    topic?: string;
    slideCount?: number;
    style?: string;
    aspectRatio?: string;
    targetLanguage?: string;
  };
  reasoning: string;
}

export class AgentService {
  /**
   * Intelligently classifies user input and detects language.
   */
  async classifyIntent(userInput: string, hasAttachments = false): Promise<AgentClassification> {
    const text = userInput.trim();

    // Fast heuristic checks for rapid routing
    const isUzbek = /[ўқғҳ]|salom|yordam|yarat|qil|mavzusida|slayd|rasm|prezentatsiya/i.test(text);
    const isRussian = /[а-яё]/i.test(text) && !isUzbek;
    const isTurkish = /[ğüşöçı]|merhaba|oluştur|sunum|resim/i.test(text);
    const isArabic = /[\u0600-\u06FF]/.test(text);
    const isKazakh = /[әғқңөұүһі]/i.test(text);

    let defaultLang = 'en';
    if (isUzbek) defaultLang = 'uz';
    else if (isRussian) defaultLang = 'ru';
    else if (isTurkish) defaultLang = 'tr';
    else if (isArabic) defaultLang = 'ar';
    else if (isKazakh) defaultLang = 'kk';

    // Check presentation intent
    if (/(prezentatsiya|presentation|slayd|slides?|слайд|презентаци|sunum|taye?rla|tarkib)/i.test(text)) {
      const countMatch = text.match(/(\d+)\s*(ta\s*)?(slayd|slide|слайд)/i);
      const slideCount = countMatch ? parseInt(countMatch[1], 10) : 10;
      return {
        intent: 'presentation',
        detectedLanguage: defaultLang,
        confidence: 0.95,
        extractedParameters: {
          topic: text,
          slideCount,
        },
        reasoning: 'User requested a presentation with structured slides.',
      };
    }

    // Check video intent
    if (/(video|jonlantir|animat|motion|видео|harakatlantir)/i.test(text)) {
      return {
        intent: 'video_generation',
        detectedLanguage: defaultLang,
        confidence: 0.9,
        extractedParameters: { prompt: text },
        reasoning: 'User requested video generation or animation.',
      };
    }

    // Check image editing intent
    if (/(fonini\s*olib|background|remove\s*bg|tahrirlash|o'zgartir|edit|удали\s*фон|измени\s*фото)/i.test(text)) {
      return {
        intent: 'image_editing',
        detectedLanguage: defaultLang,
        confidence: 0.92,
        extractedParameters: { prompt: text },
        reasoning: 'User requested image editing or background modification.',
      };
    }

    // Check image generation intent
    if (/(rasm(i)?\s*(yarat|chiz|chiqar)|generate\s*image|draw|illustration|cyberpunk|картинк|нарисуй|создай\s*фото|resim\s*oluştur)/i.test(text)) {
      return {
        intent: 'image_generation',
        detectedLanguage: defaultLang,
        confidence: 0.94,
        extractedParameters: { prompt: text },
        reasoning: 'User requested generative image synthesis.',
      };
    }

    // Check file analysis
    if (hasAttachments && /(tushuntir|tahlil|analiz|xulosa|summarize|explain|pdf|что\s*в\s*файле|analiz\s*et)/i.test(text)) {
      return {
        intent: 'file_analysis',
        detectedLanguage: defaultLang,
        confidence: 0.95,
        extractedParameters: { prompt: text },
        reasoning: 'User requested analysis or summarization of attached document.',
      };
    }

    // Check coding assistance
    if (/(kod|code|python|javascript|typescript|bug|error|xato|funksiya|class|ошибк|исправь|algoritm)/i.test(text)) {
      return {
        intent: 'coding',
        detectedLanguage: defaultLang,
        confidence: 0.88,
        extractedParameters: { prompt: text },
        reasoning: 'User requested programming or debugging assistance.',
      };
    }

    return {
      intent: 'chat',
      detectedLanguage: defaultLang,
      confidence: 0.85,
      extractedParameters: { prompt: text },
      reasoning: 'General AI conversation request.',
    };
  }
}

export const agentService = new AgentService();
