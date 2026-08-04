import React, { useState } from 'react';
import { UdharRecord, UdharType, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { ContactPickerModal } from './ContactPickerModal';
import { X, User, Phone, Banknote, Calendar, FileText, ArrowUpRight, ArrowDownLeft, Camera, Contact, Sparkles } from 'lucide-react';

interface AddUdharModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<UdharRecord, 'id' | 'paidAmount' | 'status' | 'payments' | 'createdAt'>) => void;
  defaultType?: UdharType;
  language: Language;
}

export const AddUdharModal: React.FC<AddUdharModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultType = 'given',
  language,
}) => {
  const [type, setType] = useState<UdharType>(defaultType);
  const [personName, setPersonName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [purpose, setPurpose] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [isContactPickerOpen, setIsContactPickerOpen] = useState(false);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfilePhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!personName.trim() || isNaN(numAmount) || numAmount <= 0) return;

    onSave({
      personName: personName.trim(),
      phone: phone.trim() || '03000000000',
      amount: numAmount,
      type,
      date: new Date().toISOString().split('T')[0],
      dueDate,
      purpose: purpose.trim() || (type === 'given' ? 'Grocery & Goods Udhar' : 'Personal Loan'),
      profilePhoto: profilePhoto || undefined,
    });

    // Reset
    setPersonName('');
    setPhone('');
    setAmount('');
    setPurpose('');
    setProfilePhoto('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {type === 'given' ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="w-5 h-5" /> Udhar Dena (Maine Diya)
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <ArrowDownLeft className="w-5 h-5" /> Udhar Lena (Maine Liya)
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('given')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                type === 'given'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" /> Maine Diya (Lent)
            </button>
            <button
              type="button"
              onClick={() => setType('taken')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                type === 'taken'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" /> Maine Liya (Borrowed)
            </button>
          </div>

          {/* Phone Contact Fetcher Banner */}
          <button
            type="button"
            onClick={() => setIsContactPickerOpen(true)}
            className="w-full py-2.5 px-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-2">
              <Contact className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>Fetch Customer from Mobile Contacts (کانٹیکٹس سے چنیں)</span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </button>

          {/* Person Name & Photo Upload */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Person / Customer Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g. Ahmed Khan, Bilal Mobiles"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Customer Photo (گاہک کی تصویر)
              </label>
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold overflow-hidden shadow-sm flex-shrink-0">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Customer Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>

                <label className="flex-1 cursor-pointer py-2.5 px-3 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
                  <Camera className="w-4 h-4 text-indigo-500" />
                  <span>{profilePhoto ? 'Change Photo' : 'Upload Customer Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {profilePhoto && (
                  <button
                    type="button"
                    onClick={() => setProfilePhoto('')}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl text-xs font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              WhatsApp / Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300 1234567"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Amount (PKR) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount (Rs. PKR) *
            </label>
            <div className="relative">
              <Banknote className="absolute left-3 top-3 w-4 h-4 text-emerald-500" />
              <input
                type="number"
                required
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10000"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Repayment Due Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Purpose / Item details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Purpose / Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Grocery items, Mobile repair, Cement bags"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center space-x-3 rtl:space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {getTranslation(language, 'cancel')}
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 rounded-xl text-white font-bold text-sm shadow-md transition-all active:scale-98 ${
                type === 'given'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              }`}
            >
              {getTranslation(language, 'save')}
            </button>
          </div>
        </form>
      </div>

      {/* Contact Picker Modal */}
      <ContactPickerModal
        isOpen={isContactPickerOpen}
        onClose={() => setIsContactPickerOpen(false)}
        onSelectContact={(c) => {
          if (c.name) setPersonName(c.name);
          if (c.phone) setPhone(c.phone);
          if (c.avatar) setProfilePhoto(c.avatar);
        }}
      />
    </div>
  );
};
