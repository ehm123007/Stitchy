import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

export default function FloatingWhatsApp({ whatsappUrl, whatsappNumber }) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultUrl = whatsappUrl || "https://api.whatsapp.com/send/?phone=8801875413743&text&type=phone_number&app_absent=0";
  const displayNum = whatsappNumber || "+880 1875-413743";

  const presetMessages = [
    "Assalamu Alaikum! I would like to know more about the Pure Export collection.",
    "Hi STITCHY, do you have size advice for drop-shoulder tees?",
    "Hello! I have a question about delivery charge and Bangla QR payment."
  ];

  const handleOpenWhatsApp = (customText = "") => {
    let url = defaultUrl;
    if (customText) {
      url = `https://api.whatsapp.com/send/?phone=8801875413743&text=${encodeURIComponent(customText)}&type=phone_number&app_absent=0`;
    }
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* WhatsApp Chat Popup */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#E8E5DF] overflow-hidden animate-slideUp">
          
          {/* Header */}
          <div className="bg-[#128C7E] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white text-[#128C7E] flex items-center justify-center font-bold text-sm shadow-sm">
                ST
              </div>
              <div>
                <h4 className="font-bold text-sm">STITCHY Export Apparel</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                  <span>Online • Instant Customer Support</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-black/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body message */}
          <div className="p-4 bg-[#ECE5DD]/40 space-y-3">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-xs text-xs text-neutral-800 leading-relaxed border border-neutral-100">
              <p className="font-semibold text-neutral-900 mb-1">
                Assalamu Alaikum! Welcome to STITCHY Pure Export 👕
              </p>
              <p>
                Have a question about sizes, export fabric quality, or ordering with Bangla QR? Send us a message on WhatsApp!
              </p>
              <span className="text-[9px] text-neutral-400 block text-right mt-1">Just now</span>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                Quick Inquiries:
              </span>
              {presetMessages.map((msg, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOpenWhatsApp(msg)}
                  className="w-full text-left p-2 rounded-xl bg-white border border-[#D5CEC5] hover:border-[#128C7E] text-[11px] text-neutral-700 hover:text-neutral-900 transition-all flex items-center justify-between group shadow-2xs"
                >
                  <span className="truncate pr-2">{msg}</span>
                  <Send size={11} className="text-neutral-400 group-hover:text-[#128C7E] shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-3 bg-white border-t border-[#E8E5DF]">
            <button
              onClick={() => handleOpenWhatsApp()}
              className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
            >
              <MessageCircle size={16} />
              <span>Chat on WhatsApp ({displayNum})</span>
            </button>
          </div>

        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 p-3.5 sm:px-4 sm:py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white animate-pulse"></span>
        <MessageCircle size={24} className="fill-white" />
        <span className="hidden sm:inline text-xs font-bold tracking-wider uppercase pr-1">
          WhatsApp Support
        </span>
      </button>

    </div>
  );
}
