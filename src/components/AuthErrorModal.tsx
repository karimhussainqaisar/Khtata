import React, { useState } from 'react';
import { AlertTriangle, Copy, Check, ExternalLink, X, ShieldAlert, KeyRound } from 'lucide-react';

interface AuthErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: {
    code?: string;
    message?: string;
    domain?: string;
  } | null;
}

export const AuthErrorModal: React.FC<AuthErrorModalProps> = ({ isOpen, onClose, error }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !error) return null;

  const domain = error.domain || (typeof window !== 'undefined' ? window.location.hostname : 'your-app.vercel.app');
  const isUnauthorizedDomain = error.code === 'auth/unauthorized-domain' || error.message?.includes('unauthorized domain');

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(domain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden space-y-5">
        {/* Top Decorative Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                {isUnauthorizedDomain ? 'Vercel Domain Authorization Needed' : 'Google Login Error'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Firebase Authentication Domain Security
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Details */}
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            <span>Error Code:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{error.code || 'auth/unauthorized-domain'}</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            {error.message || 'This domain is not authorized for OAuth operations for your Firebase project.'}
          </p>
        </div>

        {/* Action Callout for Vercel */}
        {isUnauthorizedDomain && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Your Current Vercel Domain to Authorize:
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-950 font-mono text-xs border border-slate-800">
                <span className="truncate flex-1 text-emerald-400 font-bold">{domain}</span>
                <button
                  onClick={handleCopyDomain}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Step by Step Setup Instructions */}
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-indigo-500" />
                <span>How to Fix in Firebase Console (1 Minute Setup):</span>
              </h4>
              <ol className="list-decimal list-inside space-y-2 bg-indigo-50/60 dark:bg-indigo-950/40 p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                <li className="leading-snug">
                  Open the{' '}
                  <a
                    href="https://console.firebase.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 font-bold underline inline-flex items-center gap-1"
                  >
                    Firebase Console <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li className="leading-snug">
                  Select project: <strong className="text-indigo-700 dark:text-indigo-300">vast-tractor-mtj8l</strong>
                </li>
                <li className="leading-snug">
                  Go to <strong className="text-slate-900 dark:text-white">Authentication</strong> &rarr; <strong className="text-slate-900 dark:text-white">Settings</strong> &rarr; <strong className="text-slate-900 dark:text-white">Authorized domains</strong>
                </li>
                <li className="leading-snug">
                  Click <strong className="text-emerald-600 dark:text-emerald-400">Add domain</strong> and paste <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border text-indigo-600 dark:text-indigo-300 font-mono font-bold">{domain}</code>
                </li>
                <li className="leading-snug">
                  Save, return here, and click <strong>Google Login</strong> again!
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Bottom Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-md"
          >
            I Understand / Close
          </button>
        </div>
      </div>
    </div>
  );
};
