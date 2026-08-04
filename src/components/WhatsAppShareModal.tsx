import React, { useState, useEffect } from 'react';
import { UdharRecord, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { generateUdharShareMessage, generateReminderMessage, getWhatsAppLink } from '../utils/whatsapp';
import { X, Send, Copy, Check, MessageSquare, Globe, Calendar } from 'lucide-react';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: UdharRecord | null;
  mode: 'statement' | 'reminder';
  language: Language;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  record,
  mode,
  language,
}) => {
  const [msgLang, setMsgLang] = useState<Language>(language);
  const [timing, setTiming] = useState<'before_due' | 'on_due' | 'overdue'>('on_due');
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!record) return;
    if (mode === 'statement') {
      setCustomText(generateUdharShareMessage(record, msgLang));
    } else {
      setCustomText(generateReminderMessage(record, timing, msgLang));
    }
  }, [record, mode, msgLang, timing]);

  if (!isOpen || !record) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const link = getWhatsAppLink(record.phone, customText);
    window.open(link, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {mode === 'statement' ? 'Share Udhar Details' : 'WhatsApp Payment Reminder'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                To: <span className="font-semibold text-slate-800 dark:text-slate-200">{record.personName}</span> ({record.phone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="mt-4 space-y-3">
          {/* Language Selection */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-500" /> Template Language:
            </span>
            <div className="flex bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg text-xs font-bold">
              <button
                onClick={() => setMsgLang('en')}
                className={`px-3 py-1 rounded-md transition-all ${
                  msgLang === 'en' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setMsgLang('ur')}
                className={`px-3 py-1 rounded-md transition-all ${
                  msgLang === 'ur' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                اردو (Urdu)
              </button>
            </div>
          </div>

          {/* Reminder Type options (only if mode === 'reminder') */}
          {mode === 'reminder' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Reminder Timing:
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setTiming('before_due')}
                  className={`py-1.5 px-2 rounded-xl font-medium border text-center transition-all ${
                    timing === 'before_due'
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Before Due
                </button>
                <button
                  type="button"
                  onClick={() => setTiming('on_due')}
                  className={`py-1.5 px-2 rounded-xl font-medium border text-center transition-all ${
                    timing === 'on_due'
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  On Due Date
                </button>
                <button
                  type="button"
                  onClick={() => setTiming('overdue')}
                  className={`py-1.5 px-2 rounded-xl font-medium border text-center transition-all ${
                    timing === 'overdue'
                      ? 'bg-rose-600 text-white border-rose-600 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Overdue Urgence
                </button>
              </div>
            </div>
          )}

          {/* Message Preview & Edit */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Message Content (Editable)
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              rows={6}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-emerald-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500"
              dir={msgLang === 'ur' ? 'rtl' : 'ltr'}
            />
          </div>
        </div>

        {/* Send Button */}
        <div className="mt-5 flex items-center space-x-3 rtl:space-x-reverse">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {getTranslation(language, 'cancel')}
          </button>
          <button
            onClick={handleSendWhatsApp}
            className="flex-1 py-3 rounded-xl text-white font-bold text-sm bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Send className="w-4 h-4" />
            Send on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
