import React, { useState } from 'react';
import { CheckCircle2, Clock, Phone, X } from 'lucide-react';

interface CallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CallbackModal: React.FC<CallbackModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-ink hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-plum/10 text-plum flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-medium text-ink">Ask us anything</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Questions about rooms, the restaurant, airport pickup or working from the property —
                leave your number and we will call you back.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Your name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-ink focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-paper rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-plum shrink-0" />
              <span>Reception answers between 7 AM and 10 PM local time</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-ink hover:bg-ink-soft text-white font-medium text-xs rounded-xl transition-colors cursor-pointer"
            >
              Call me back
            </button>
          </form>
        ) : (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-medium text-lg text-ink">Thanks — we will call you</h4>
            <p className="text-xs text-slate-500">Reception will be in touch shortly.</p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="mt-4 px-6 py-2.5 bg-ink text-white font-medium text-xs rounded-xl cursor-pointer hover:bg-ink-soft transition-colors"
            >
              Great
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
