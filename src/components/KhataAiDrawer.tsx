import React, { useState, useRef, useEffect } from 'react';
import { UdharRecord, Expense, UserProfile, AiChatMessage, Language } from '../types';
import { calculateSummary } from '../utils/storage';
import { X, Send, Sparkles, Bot, User, RefreshCw, Lightbulb } from 'lucide-react';

interface KhataAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  udharRecords: UdharRecord[];
  expenses: Expense[];
  profile: UserProfile;
  language: Language;
}

export const KhataAiDrawer: React.FC<KhataAiDrawerProps> = ({
  isOpen,
  onClose,
  udharRecords,
  expenses,
  profile,
  language,
}) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `Assalam-o-Alaikum ${profile.name}! I am **Khata AI**, your smart Pakistani financial advisor.\n\nI have reviewed your Udhar records and daily expenses. Ask me anything like *"How can I recover my overdue Udhar faster?"* or *"Analyze my spending this month"*.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const summary = calculateSummary(udharRecords, expenses);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: AiChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/khata-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query.trim(),
          context: {
            user: profile.name,
            shopName: profile.shopName,
            isShopkeeper: profile.isShopkeeper,
            summary,
            topOverdueContacts: udharRecords
              .filter((r) => r.status === 'overdue' || r.status === 'partially_paid')
              .slice(0, 5)
              .map((r) => ({ name: r.personName, owed: r.amount - r.paidAmount, dueDate: r.dueDate })),
            expensesCount: expenses.length,
          },
        }),
      });

      const data = await response.json();

      const aiMsg: AiChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || data.error || 'I have analyzed your financial context.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'Khata AI encountered a network issue. Here is a quick summary: Your pending receivables are ' + summary.pendingReceivables + ' PKR across ' + udharRecords.length + ' contacts.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'How much am I owed total?',
    'Tips to recover overdue Udhar quickly',
    'Analyze my monthly food spending',
    'Summarize my financial health',
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Bot className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight flex items-center gap-1.5">
                Khata AI Advisor <Sparkles className="w-4 h-4 text-amber-300" />
              </h2>
              <p className="text-xs text-purple-200">Powered by Gemini AI • Pakistani Finances</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Quick Summary Bar */}
        <div className="bg-purple-50 dark:bg-slate-800/90 px-4 py-2 border-b border-purple-100 dark:border-slate-700 flex items-center justify-between text-xs">
          <span className="text-purple-900 dark:text-purple-300 font-medium">
            Pending Receivables: <strong className="text-emerald-600 dark:text-emerald-400">Rs. {summary.pendingReceivables.toLocaleString()}</strong>
          </span>
          <span className="text-purple-900 dark:text-purple-300 font-medium">
            Expenses: <strong className="text-rose-600 dark:text-rose-400">Rs. {summary.monthlyExpenses.toLocaleString()}</strong>
          </span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[10px] mt-1 text-right opacity-70 ${
                    msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 animate-pulse font-medium">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Khata AI is analyzing your Pakistani ledger...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestions Chips */}
        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap space-x-2 rtl:space-x-reverse">
          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 inline-block">
            <Lightbulb className="w-3 h-3 text-amber-400" /> Prompts:
          </span>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-slate-600 hover:bg-purple-50 transition-colors inline-block"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Khata AI in English or Urdu..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white shadow-md shadow-purple-600/20 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
