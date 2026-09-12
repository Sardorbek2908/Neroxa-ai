import React, { useState, useEffect } from 'react';
import {
  Crown,
  Check,
  Copy,
  CreditCard,
  Send,
  Zap,
  ShieldCheck,
  X,
  Clock,
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
  Presentation,
  CheckCircle2,
  Upload,
  Trash2,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PaymentSettings, UsageLimitStatus } from '../../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [limitStatus, setLimitStatus] = useState<UsageLimitStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [note, setNote] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Rasm hajmi 5MB dan oshmasligi kerak");
      return;
    }

    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Rasm hajmi 5MB dan oshmasligi kerak");
      return;
    }

    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsRes, limitsRes] = await Promise.all([
        api.getPaymentSettings(),
        api.getMyLimits().catch(() => null),
      ]);
      setSettings(settingsRes.settings);
      if (limitsRes) setLimitStatus(limitsRes);
    } catch (err) {
      console.error('Failed to load subscription info:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCopyCard = () => {
    if (!settings?.cardNumber) return;
    navigator.clipboard.writeText(settings.cardNumber.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyId = () => {
    const code = user?.userCode || limitStatus?.userCode;
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      const res = await api.requestPro(note, receiptImage || undefined);
      setSuccessMsg(res.message || "To'lov so'rovi va chek qabul qilindi! Administrator tez orada PRO rejasini faollashtiradi.");
      setNote('');
      setReceiptImage(null);
      setReceiptFileName('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "So'rov yuborishda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const isPro = user?.plan === 'PRO' || limitStatus?.isPro;
  const userCode = user?.userCode || limitStatus?.userCode || 'NX-0000';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-amber-500/10 via-indigo-600/10 to-slate-900 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Crown className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">NEXORA AI PRO Obuna</h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isPro
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {isPro ? 'FAOL PRO' : 'BEPUL REJA'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Barcha sun'iy intellekt modellaridan cheksiz va tezkor foydalaning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
          {/* User ID & Status Card */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Sizning Maxsus Foydalanuvchi ID
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-mono font-black text-amber-400">{userCode}</span>
                <button
                  onClick={handleCopyId}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="ID dan nusxa olish"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId ? 'Nusxalandi' : 'Nusxa olish'}</span>
                </button>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Email: <strong className="text-slate-200">{user?.email}</strong>
              </span>
            </div>

            {/* Current Limit Badges */}
            {limitStatus && (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Xabarlar</span>
                  <span className="text-xs font-bold text-white">
                    {limitStatus.usage.messagesCount} / {isPro ? '∞' : limitStatus.limits.messages}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Rasmlar</span>
                  <span className="text-xs font-bold text-white">
                    {limitStatus.usage.imagesCount} / {isPro ? '∞' : limitStatus.limits.images}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Slaydlar</span>
                  <span className="text-xs font-bold text-white">
                    {limitStatus.usage.presentationsCount} / {isPro ? '∞' : limitStatus.limits.presentations}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* PRO Advantages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 space-y-1">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Cheksiz Chat</h4>
              <p className="text-[11px] text-slate-400">
                Gemini 2.5 Pro & Flash bilan cheksiz muloqot va yordam.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-800/40 space-y-1">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Cheksiz Rasmlar</h4>
              <p className="text-[11px] text-slate-400">
                Ultra-sifatli 4K tasvirlar yaratish va tahrirlash.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-1">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Presentation className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Cheksiz Taqdimotlar</h4>
              <p className="text-[11px] text-slate-400">
                O'zbek tilida tayyor slaydlar va PowerPoint (.pptx) yuklab olish.
              </p>
            </div>
          </div>

          {/* Payment Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">To'lov va Karta ma'lumotlari</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Oylik Obuna Narxi</span>
                <span className="text-lg font-black text-amber-400">
                  {settings?.proPriceUzs ? settings.proPriceUzs.toLocaleString('uz-UZ') : '49 000'} so'm / oy
                </span>
              </div>
            </div>

            {/* Card Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Karta raqami:</span>
                <span className="text-xs font-semibold text-sky-400">{settings?.bankName || 'O\'zbekiston Banki'}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xl font-mono font-bold text-white tracking-widest">
                  {settings?.cardNumber || '8600 0000 0000 0000'}
                </span>
                <button
                  onClick={handleCopyCard}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Nusxalandi!' : 'Nusxa olish'}</span>
                </button>
              </div>
              <div className="text-xs text-slate-400 pt-1">
                Karta egasi: <strong className="text-slate-200">{settings?.cardHolder || 'Administrator'}</strong>
              </div>
            </div>

            {/* Instruction Warning */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                Muhim to'lov qoidasi:
              </p>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Kartaga to'lov o'tkazayotganda, to'lov izohiga (sms/xabar) o'zingizning{' '}
                <strong className="text-white underline">{userCode}</strong> kodingizni yozib qoldiring. To'lov qilgach, quyidagi tugma orqali so'rov yuboring!
              </p>
            </div>

            {/* Telegram Direct Send Option (User requested: if receipt doesn't go through here, send to Telegram) */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 border border-sky-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Telegram orqali chekni yuborish</h4>
                    <p className="text-[10px] text-slate-400">Tezkor va 100% ishonchli usul</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Tavsiya etiladi
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Agar bu yerdan chek yuborishda qiyinchilik bo'lsa yoki to'g'ridan-to'g'ri bog'lanmoqchi bo'lsangiz, Telegram orqali adminga chekni yuboring. Administrator 2 daqiqa ichida PRO beradi!
              </p>

              {(() => {
                const tgUser = (settings?.telegramSupport || '@nexora_admin').replace('@', '').replace('https://t.me/', '');
                const tgText = encodeURIComponent(
                  `Salom! Men NEXORA PRO uchun to'lov qildim.\nIsmim: ${user?.name || 'Talaba'}\nMening ID kodim: ${userCode}\nChekimni ilova qildim. Iltimos, PRO faollashtirib bering!`
                );
                const tgUrl = `https://t.me/${tgUser}?text=${tgText}`;
                return (
                  <a
                    id="telegram-receipt-send-btn"
                    href={tgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all active:scale-[0.99]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegramda chek yuborish (@{tgUser})</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                );
              })()}
            </div>

            {/* Submit Payment Confirmation In-App */}
            <form onSubmit={handleSubmitProof} className="space-y-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Sayt orqali chek yuborish</span>
              </div>

              {/* Receipt File Upload */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  To'lov cheki (skrinshot yoki rasm):
                </label>
                {!receiptImage ? (
                  <label
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-400 bg-slate-950/80 cursor-pointer transition-all hover:bg-slate-900 group"
                  >
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-amber-400 transition-colors mb-1.5" />
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-white">
                      Chek rasmini yuklash uchun bosing yoki shu yerga tashlang
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, JPEG (maks. 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative p-2.5 rounded-xl bg-slate-950 border border-amber-500/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={receiptImage}
                        alt="Chek skrinshoti"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-700 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {receiptFileName || 'chek_rasmi.jpg'}
                        </div>
                        <span className="text-[10px] text-emerald-400 font-medium">✓ Rasm biriktirildi</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptImage(null);
                        setReceiptFileName('');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  To'lov izohi yoki tranzaksiya raqami (ixtiyoriy):
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder={`Masalan: ${userCode} orqali to'lov qilindi yoki tranzaksiya ID`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                id="submit-pro-proof-btn"
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Yuborilmoqda...' : 'Chekni adminga yuborish (Aktivlashtirishni so\'rash)'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
