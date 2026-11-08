import React from 'react';
import { ShieldCheck, Truck, Globe, Heart, Phone, Mail, Lock } from 'lucide-react';

const FacebookIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function Footer({ onSelectCategory, onOpenAdmin, settings }) {
  return (
    <footer className="bg-[#121212] text-[#FDFBF7] pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-neutral-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-[#C5A880] shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-serif-luxury text-base font-semibold text-white">100% Exported Clothes</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Authentic export consignments crafted from 240+ GSM organic combed cotton, double-stitched for enduring wear.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-[#C5A880] shrink-0">
              <Globe size={24} />
            </div>
            <div>
              <h4 className="font-serif-luxury text-base font-semibold text-white">Global Brands</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Original collections from leading global retail fashion houses and international apparel consignments.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-[#C5A880] shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-serif-luxury text-base font-semibold text-white">Rapid Nationwide Delivery</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Flat ৳70 within Dhaka Metropolitan (24-48h) and ৳130 across all Bangladesh districts (48-72h).
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.jpg" 
                alt="Stitchy Logo" 
                className="w-12 h-12 object-contain rounded-xl border border-neutral-700 bg-white p-0.5"
              />
              <div className="flex flex-col">
                <span className="font-serif-luxury text-2xl font-bold tracking-wide text-white">
                  Stitchy
                </span>
                <span className="text-[10px] tracking-[0.28em] font-bold text-[#C5A880] uppercase">
                  MADE STITCH BY STITCH
                </span>
              </div>
            </div>
            
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Authentic pure export overstock garments from global fashion brands. Premium fabric, long-lasting construction, modern fits. Wear your story with confidence.
            </p>

            <div className="text-[11px] text-[#C5A880] font-medium tracking-wide">
              Good Fit. Better Days.
            </div>

            <div className="flex items-center gap-3 pt-1">
              <a
                href={settings?.facebookUrl || 'https://facebook.com'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-[#C5A880] hover:text-neutral-900 text-neutral-300 flex items-center justify-center transition-all"
                title="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href={settings?.instagramUrl || 'https://instagram.com'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-[#C5A880] hover:text-neutral-900 text-neutral-300 flex items-center justify-center transition-all"
                title="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href={settings?.tiktokUrl || 'https://tiktok.com'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-[#C5A880] hover:text-neutral-900 text-neutral-300 flex items-center justify-center transition-all"
                title="TikTok"
              >
                <span className="text-xs font-bold">TT</span>
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-widest text-[#C5A880]">
              Collections
            </h5>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button onClick={() => onSelectCategory('T-Shirts & Tops')} className="hover:text-white transition-colors">
                  Heavyweight T-Shirts & Tops
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Shirts & Flannels')} className="hover:text-white transition-colors">
                  Vintage Flannels & Overshirts
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Hoodies & Jackets')} className="hover:text-white transition-colors">
                  380 GSM Hoodies & Jackets
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Pants & Bottoms')} className="hover:text-white transition-colors">
                  Linen & Cotton Relaxed Trousers
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Support & Delivery */}
          <div className="md:col-span-4 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-widest text-[#C5A880]">
              Customer Care & Prepayment
            </h5>
            <div className="space-y-2 text-xs text-neutral-400">
              <a
                href={settings?.whatsappUrl || "https://api.whatsapp.com/send/?phone=8801875413743&text&type=phone_number&app_absent=0"}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-white hover:text-[#25D366] transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-[10px]">
                  WA
                </span>
                <span className="font-semibold">WhatsApp: +880 1875-413743</span>
              </a>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-[#C5A880]" />
                <a href={`mailto:${settings?.supportEmail || 'stitchy123007@gmail.com'}`} className="hover:text-white">
                  {settings?.supportEmail || 'stitchy123007@gmail.com'}
                </a>
              </p>
              <p className="text-[11px] text-neutral-500 pt-1">
                bKash Bangla QR • Interoperable with Nagad, Rocket & All Bangladesh Banks.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom copyright & Discreet Admin Access */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p 
            onDoubleClick={onOpenAdmin}
            className="cursor-default select-none hover:text-neutral-400 transition-colors"
            title="STITCHY Pure Export Quality Guaranteed"
          >
            © {new Date().getFullYear()} STITCHY • MADE STITCH BY STITCH. Pure Export Quality Guaranteed.
          </p>
          
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-neutral-600">
              Premium Export Garments • 48-Hour Rapid Delivery
            </span>
            {/* Secret discreet dot for admin access if you ever need a click target */}
            <button
              onClick={onOpenAdmin}
              className="w-1.5 h-1.5 rounded-full bg-neutral-800 hover:bg-[#C5A880] transition-colors cursor-default"
              title=""
              aria-label="Staff"
            />
          </div>
        </div>

      </div>
    </footer>
  );
}
