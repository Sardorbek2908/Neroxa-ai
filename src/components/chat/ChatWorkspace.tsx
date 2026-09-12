import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Cpu,
  FileText,
  AlertTriangle,
  X,
  Download,
  ExternalLink,
  Maximize2,
  Image as ImageIcon,
  Presentation as PresentationIcon,
  Play,
  GraduationCap,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Chat, ChatMessage, AIModelConfig } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { ImageLightbox } from '../common/ImageLightbox';

interface ChatWorkspaceProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  onOpenPresentation?: (topic: string) => void;
  onOpenAdminPortal?: () => void;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  initialPrompt,
  onClearInitialPrompt,
  onOpenPresentation,
  onOpenAdminPortal,
}) => {
  const { t, language } = useLanguage();

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState(initialPrompt || '');
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [models, setModels] = useState<AIModelConfig[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [lastClassification, setLastClassification] = useState<any | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; prompt?: string } | null>(null);
  const [exportingPptxId, setExportingPptxId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadPptx = async (presentationId: string, title: string) => {
    setExportingPptxId(presentationId);
    try {
      await api.exportPptx(presentationId, `${title}.pptx`);
    } catch (err) {
      console.error('Failed to export PPTX:', err);
    } finally {
      setExportingPptxId(null);
    }
  };

  // Load chats & models
  useEffect(() => {
    loadChats();
    api.getModels().then(res => {
      const textModels = res.models.filter(m => m.type === 'text' || m.type === 'multimodal');
      setModels(textModels);
    }).catch(() => {});
  }, []);

  // Handle initial prompt from Dashboard chips
  useEffect(() => {
    if (initialPrompt) {
      setInputMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const loadChats = async () => {
    try {
      const res = await api.getChats();
      setChats(res.chats);
      if (res.chats.length > 0 && !activeChatId) {
        selectChat(res.chats[0].id);
      }
    } catch (err) {
      console.error('Failed to load chats:', err);
    }
  };

  const selectChat = async (chatId: string) => {
    setActiveChatId(chatId);
    try {
      const res = await api.getChat(chatId);
      setMessages(res.messages);
      setSelectedModel(res.chat.model || 'gemini-3.8-flash');
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    }
  };

  const handleNewChat = async () => {
    try {
      const res = await api.createChat('New Conversation', selectedModel, language);
      setChats([res.chat, ...chats]);
      setActiveChatId(res.chat.id);
      setMessages([]);
      setLastClassification(null);
    } catch (err) {
      console.error('Failed to create new chat:', err);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteChat(chatId);
      const remaining = chats.filter(c => c.id !== chatId);
      setChats(remaining);
      if (activeChatId === chatId) {
        if (remaining.length > 0) {
          selectChat(remaining[0].id);
        } else {
          setActiveChatId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputMessage.trim() && attachments.length === 0) || isSending) return;

    const userText = inputMessage.trim();
    if (userText.toLowerCase() === '/admin' || userText.toLowerCase() === '#admin' || userText.toLowerCase() === 'admin:secret') {
      setInputMessage('');
      if (onOpenAdminPortal) {
        onOpenAdminPortal();
      }
      return;
    }

    setInputMessage('');
    const currentAttachments = [...attachments];
    setAttachments([]);
    setIsSending(true);

    // Optimistic user message preview
    const tempUserMsg: ChatMessage = {
      id: `tmp_${Date.now()}`,
      chatId: activeChatId || 'temp',
      role: 'user',
      content: userText,
      attachments: currentAttachments,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await api.sendMessage({
        chatId: activeChatId || undefined,
        message: userText,
        model: selectedModel,
        attachments: currentAttachments,
      });

      if (!activeChatId) {
        setActiveChatId(res.chat.id);
        setChats([res.chat, ...chats]);
      } else {
        setChats(prev => prev.map(c => (c.id === res.chat.id ? res.chat : c)));
      }

      setLastClassification(res.classification);
      // Replace optimistic message and append assistant message
      setMessages(prev => [...prev.slice(0, -1), res.userMessage, res.message]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        chatId: activeChatId || 'temp',
        role: 'assistant',
        content: `⚠️ ${err.message || 'Failed to generate response. Please try again.'}`,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    try {
      const file = files[0];
      const res = await api.uploadFile(file);
      setAttachments(prev => [
        ...prev,
        {
          id: res.file.id,
          name: res.file.originalName,
          type: res.file.mimeType,
          url: res.file.url,
          size: res.file.size,
        },
      ]);
    } catch (err: any) {
      alert(`File upload failed: ${err.message}`);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  return (
    <div className="flex-1 flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      {/* Chats Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-slate-950/90 flex-shrink-0">
        <div className="p-3 border-b border-slate-800/80">
          <button
            onClick={handleNewChat}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t.chat.newChat}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => selectChat(chat.id)}
              className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                activeChatId === chat.id
                  ? 'bg-indigo-600/15 text-white font-medium border border-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <span className="truncate pr-2">{chat.title}</span>
              <button
                onClick={e => handleDeleteChat(chat.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {chats.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-500">
              {t.chat.noChats}
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages and Input */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Model Bar */}
        <div className="h-12 border-b border-slate-800/80 px-3 sm:px-4 flex items-center justify-between bg-slate-950/60 backdrop-blur-sm gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Cpu className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 py-1 px-2 focus:outline-none focus:border-indigo-500 truncate max-w-[180px] xs:max-w-[230px] sm:max-w-none"
            >
              <option value="gemini-3.8-flash">Gemini 3.8 Flash (Tezkor)</option>
              <option value="gemini-3.8-pro">Gemini 3.8 Pro (Mantiqiy)</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleNewChat}
              className="md:hidden px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1 text-xs cursor-pointer active:scale-95"
              title={t.chat.newChat}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] font-medium">{t.chat.newChat}</span>
            </button>

            {lastClassification && (
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800 text-indigo-300 font-semibold uppercase text-[9px]">
                  Intent: {lastClassification.intent}
                </span>
                <span>Lang: {lastClassification.detectedLanguage.toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/30">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">NEXORA Agent Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Natively speaks Uzbek, English, Russian, Turkish, Kazakh, and Arabic. Ask any questions, upload data, or instruct it to design 10-slide presentations!
              </p>
            </div>
          )}

          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id || idx}
                className={`flex gap-3 max-w-4xl mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/20">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative group rounded-2xl px-4 py-3 max-w-[85%] sm:max-w-[75%] ${
                    isUser
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-900 border border-slate-800/90 text-slate-200'
                  }`}
                >
                  {/* Tool used badge */}
                  {m.toolUsed && (
                    <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-[10px] text-indigo-300 font-semibold">
                      <Sparkles className="w-3 h-3" />
                      <span>Executed Tool: {m.toolUsed}</span>
                    </div>
                  )}

                  {/* Attachments preview */}
                  {m.attachments && m.attachments.length > 0 && (
                    <div className="mb-2 space-y-1">
                      {m.attachments.map((att, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-1.5 rounded-lg bg-black/20 text-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="truncate">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Markdown Content */}
                  <div className="text-xs sm:text-sm leading-relaxed prose prose-invert max-w-none break-words">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>

                  {/* Generated Image in-chat Card */}
                  {m.generatedImage && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                      <div
                        onClick={() =>
                          setLightboxImage({
                            url: m.generatedImage!.outputUrl,
                            title: m.generatedImage!.title,
                            prompt: m.generatedImage!.prompt,
                          })
                        }
                        className="relative group rounded-xl overflow-hidden cursor-pointer border border-slate-700 bg-slate-950 shadow-lg"
                        title="To'liq o'lchamda ochish"
                      >
                        <img
                          src={m.generatedImage.outputUrl}
                          alt={m.generatedImage.title}
                          className="w-full max-h-72 object-contain bg-slate-950 group-hover:scale-[1.02] transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <span className="px-3 py-1.5 rounded-xl bg-indigo-600/90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>To'liq ochish</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-400 truncate max-w-[200px]">{m.generatedImage.title}</span>
                        <a
                          href={m.generatedImage.outputUrl}
                          download={`${m.generatedImage.title}.png`}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1 transition-colors font-medium text-[11px]"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Yuklab olish</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Generated Presentation in-chat Card */}
                  {m.generatedPresentation && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 p-3.5 rounded-xl border border-indigo-900/50 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 flex-shrink-0">
                            <PresentationIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate max-w-[240px]">
                              {m.generatedPresentation.title}
                            </div>
                            <div className="text-[10px] text-indigo-300">
                              {m.generatedPresentation.slides?.length || 0} ta slayd • {m.generatedPresentation.theme}
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex-shrink-0">
                          Tayyor
                        </span>
                      </div>

                      {m.generatedPresentation.studentInfo && (
                        <div className="text-[11px] text-slate-300 bg-black/25 p-2.5 rounded-lg space-y-1 border border-slate-800">
                          <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-xs mb-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Talaba ma'lumotlari biriktirildi</span>
                          </div>
                          {m.generatedPresentation.studentInfo.institution && (
                            <div><strong>Muassasa:</strong> {m.generatedPresentation.studentInfo.institution}</div>
                          )}
                          {m.generatedPresentation.studentInfo.fieldOfStudy && (
                            <div><strong>Yo'nalish:</strong> {m.generatedPresentation.studentInfo.fieldOfStudy}</div>
                          )}
                          {m.generatedPresentation.studentInfo.group && (
                            <div><strong>Guruh:</strong> {m.generatedPresentation.studentInfo.group}</div>
                          )}
                          {m.generatedPresentation.studentInfo.studentName && (
                            <div><strong>Talaba:</strong> {m.generatedPresentation.studentInfo.studentName}</div>
                          )}
                          {m.generatedPresentation.studentInfo.advisor && (
                            <div><strong>Rahbar:</strong> {m.generatedPresentation.studentInfo.advisor}</div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          onClick={() => handleDownloadPptx(m.generatedPresentation!.id, m.generatedPresentation!.title)}
                          disabled={exportingPptxId === m.generatedPresentation.id}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-md shadow-indigo-600/20"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>
                            {exportingPptxId === m.generatedPresentation.id ? 'Yuklanmoqda...' : 'PowerPoint (.pptx)'}
                          </span>
                        </button>

                        {onOpenPresentation && (
                          <button
                            onClick={() => onOpenPresentation(m.generatedPresentation!.topic)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Tahrirlash</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Copy Button */}
                  {!isUser && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{m.modelUsed || selectedModel}</span>
                      <button
                        onClick={() => copyToClipboard(m.content, m.id)}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">{t.chat.copied}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{t.chat.copy}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isSending && (
            <div className="flex gap-3 max-w-4xl mx-auto items-center text-xs text-slate-400">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span>NEXORA Agent reasoning...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto space-y-2">
            {/* Attachment Chips */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((att, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-indigo-300"
                  >
                    <FileText className="w-3 h-3" />
                    <span className="truncate max-w-xs">{att.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                      className="text-slate-500 hover:text-rose-400 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative flex items-center bg-slate-900 border border-slate-800 focus-within:border-indigo-500/80 rounded-2xl shadow-xl transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="p-3 text-slate-400 hover:text-indigo-400 transition-colors"
                title={t.chat.attachFile}
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <textarea
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={t.chat.placeholder}
                rows={1}
                className="flex-1 bg-transparent py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-32"
              />

              <button
                type="submit"
                disabled={(!inputMessage.trim() && attachments.length === 0) || isSending}
                className="m-1.5 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all shadow-md shadow-indigo-600/30"
                title={t.chat.send}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {lightboxImage && (
        <ImageLightbox
          isOpen={!!lightboxImage}
          onClose={() => setLightboxImage(null)}
          imageUrl={lightboxImage.url}
          title={lightboxImage.title}
          prompt={lightboxImage.prompt}
        />
      )}
    </div>
  );
};
