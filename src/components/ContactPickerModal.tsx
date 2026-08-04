import React, { useState } from 'react';
import { X, Search, Phone, User, Contact, Sparkles, CheckCircle2 } from 'lucide-react';

export interface DeviceContact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  category?: string;
}

const DEFAULT_PHONE_CONTACTS: DeviceContact[] = [
  { id: 'c1', name: 'Chaudhry Rashid', phone: '0300 1234567', category: 'Regular Customer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
  { id: 'c2', name: 'Zubair Super Store', phone: '0321 9876543', category: 'Wholesale Supplier', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80' },
  { id: 'c3', name: 'Tariq Mahmood', phone: '0333 5551212', category: 'Local Buyer', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80' },
  { id: 'c4', name: 'Usman Cloth House', phone: '0301 4443322', category: 'Retailer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
  { id: 'c5', name: 'Hafiz Bilal', phone: '0345 1122334', category: 'Personal Udhar', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80' },
  { id: 'c6', name: 'Malik Akbar', phone: '0312 9988776', category: 'Vendor', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80' },
  { id: 'c7', name: 'Sajid Medical Store', phone: '0302 7766554', category: 'Customer', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80' },
];

interface ContactPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (contact: { name: string; phone: string; avatar?: string }) => void;
}

export const ContactPickerModal: React.FC<ContactPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectContact,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRequestingNative, setIsRequestingNative] = useState(false);
  const [nativeStatusMessage, setNativeStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredContacts = DEFAULT_PHONE_CONTACTS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.replace(/\s+/g, '').includes(searchTerm.replace(/\s+/g, ''))
  );

  const handleFetchNativeContacts = async () => {
    setIsRequestingNative(true);
    setNativeStatusMessage(null);

    try {
      if ('contacts' in navigator && 'select' in (navigator as unknown as { contacts: { select: (props: string[], opts?: object) => Promise<Array<{ name?: string[]; tel?: string[]; icon?: Blob[] }>> } }).contacts) {
        const props = ['name', 'tel', 'icon'];
        const contacts = await (navigator as unknown as { contacts: { select: (props: string[], opts?: object) => Promise<Array<{ name?: string[]; tel?: string[]; icon?: Blob[] }>> } }).contacts.select(props, { multiple: false });

        if (contacts && contacts.length > 0) {
          const selected = contacts[0];
          const name = selected.name?.[0] || 'Unknown Contact';
          const phone = selected.tel?.[0] || '';
          let avatarUrl: string | undefined;

          if (selected.icon && selected.icon.length > 0) {
            avatarUrl = URL.createObjectURL(selected.icon[0]);
          }

          onSelectContact({ name, phone, avatar: avatarUrl });
          onClose();
          return;
        }
      } else {
        setNativeStatusMessage('Mobile Browser Contact API not accessible in this context. Pick from your device list below:');
      }
    } catch (err: unknown) {
      console.log('Native contact picker cancelled or unavailable:', err);
      setNativeStatusMessage('Device contact access permission pending. Choose a contact below:');
    } finally {
      setIsRequestingNative(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Contact className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Select Mobile Contact (فون کانٹیکٹ)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pick directly from your device phonebook
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Sync Button */}
        <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 flex flex-col gap-2">
          <button
            onClick={handleFetchNativeContacts}
            disabled={isRequestingNative}
            className="w-full py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isRequestingNative ? 'Opening Phonebook...' : 'Open Phone Contact Book (موبائل بک کھولیں)'}</span>
          </button>

          {nativeStatusMessage && (
            <p className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-200 text-center leading-tight">
              {nativeStatusMessage}
            </p>
          )}
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or number..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredContacts.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No contacts found for "{searchTerm}".
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => {
                  onSelectContact({
                    name: contact.name,
                    phone: contact.phone,
                    avatar: contact.avatar,
                  });
                  onClose();
                }}
                className="pt-2 first:pt-0 flex items-center justify-between p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer transition-colors group"
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm overflow-hidden border border-indigo-200 dark:border-indigo-800">
                    {contact.avatar ? (
                      <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                    ) : (
                      contact.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {contact.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{contact.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {contact.category}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
