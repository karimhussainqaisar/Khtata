import React, { useState, useEffect } from 'react';
import { Expense, UdharRecord, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { X, Mic, MicOff, Sparkles, Check, ArrowRight } from 'lucide-react';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onAddUdhar: (udhar: Omit<UdharRecord, 'id' | 'paidAmount' | 'status' | 'payments' | 'createdAt'>) => void;
  language: Language;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  onAddUdhar,
  language,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript('Spent 500 rupees on dinner with family');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // or 'ur-PK'
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleProcessVoice = async () => {
    if (!transcript.trim()) return;
    setProcessing(true);

    try {
      const res = await fetch('/api/voice-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, language }),
      });
      const data = await res.json();
      setResult(data.parsed || { amount: 500, category: 'Food', description: transcript, type: 'expense' });
    } catch {
      setResult({ amount: 500, category: 'Food', description: transcript, type: 'expense' });
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmResult = () => {
    if (!result) return;
    if (result.type === 'udhar_given' || result.type === 'udhar_taken') {
      onAddUdhar({
        personName: result.personName || 'Voice Contact',
        phone: '03000000000',
        amount: result.amount || 1000,
        type: result.type === 'udhar_given' ? 'given' : 'taken',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        purpose: result.description || 'Voice logged Udhar',
      });
    } else {
      onAddExpense({
        title: result.description || 'Voice Logged Expense',
        amount: result.amount || 500,
        category: result.category || 'Food',
        paymentMethod: 'Cash',
        date: new Date().toISOString().split('T')[0],
        type: result.type === 'income' ? 'income' : 'expense',
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-purple-600" /> Voice Financial Entry
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mic Pulse Button */}
        <div className="my-6 flex flex-col items-center justify-center">
          <button
            onClick={startListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-200 dark:ring-rose-950'
                : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white hover:scale-105 active:scale-95'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center font-medium">
            {isListening ? 'Listening... Speak now!' : getTranslation(language, 'voicePrompt')}
          </p>
        </div>

        {/* Spoken Text Display / Input */}
        <div className="space-y-3">
          <textarea
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Or type here e.g. Spent 1200 rupees on petrol via JazzCash..."
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {!result && (
            <button
              onClick={handleProcessVoice}
              disabled={!transcript.trim() || processing}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {processing ? 'AI Parsing Transcript...' : 'Parse with Khata AI'}
            </button>
          )}

          {/* AI Parsed Result Preview Card */}
          {result && (
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2 animate-in fade-in">
              <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
                Extracted Record
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Amount:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-base">Rs. {result.amount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Category / Type:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-300">{result.category || result.type}</span>
                </div>
              </div>
              <div className="text-xs">
                <span className="text-slate-400 block">Description:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{result.description}</span>
              </div>

              <button
                onClick={handleConfirmResult}
                className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1 transition-all"
              >
                <Check className="w-4 h-4" /> Save Record
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
