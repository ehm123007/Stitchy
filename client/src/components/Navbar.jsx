import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Shield, Sparkles, MessageCircle, User } from 'lucide-react';

export default function Navbar({
  cartCount,
  onOpenCart,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenAdmin,
  onOpenAccount,
  customerUser,
  settings
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const categoryItems = [
    {
      id: 'All',
      label: 'All Collection',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      )
    },
    {
      id: 'T-Shirts & Tops',
      label: 'T-Shirts & Tops',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.5a2 2 0 0 0 2 1.67h1.14v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10.86h1.14a2 2 0 0 0 2-1.67l.58-3.5a2 2 0 0 0-1.34-2.23z"/>
        </svg>
      )
    },
    {
      id: 'Shirts & Flannels',
      label: 'Shirts & Flannels',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l3 5-3 2v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V10L3 8l3-5z"/>
          <line x1="12" y1="3" x2="12" y2="22"/>
          <circle cx="12" cy="7.5" r="0.75" fill="currentColor"/>
          <circle cx="12" cy="11.5" r="0.75" fill="currentColor"/>
          <circle cx="12" cy="15.5" r="0.75" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 'Hoodies & Jackets',
      label: 'Hoodies & Jackets',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16l-2 18H6L4 4z"/>
          <path d="M4 4l8 4 8-4"/>
          <line x1="12" y1="8" x2="12" y2="22"/>
          <path d="M8.5 13.5h2m3 0h2"/>
        </svg>
      )
    },
    {
      id: 'Pants & Bottoms',
      label: 'Pants & Bottoms',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 3h14l-1 18-5-1-2-12-2 12-5 1L5 3z"/>
          <line x1="12" y1="3" x2="12" y2="8"/>
        </svg>
      )
    }
  ];

  const whatsappLink = settings?.whatsappUrl || "https://api.whatsapp.com/send/?phone=8801875413743&text&type=phone_number&app_absent=0";

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#E8E5DF] transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-[#121212] text-[#FDFBF7] text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-block w-2 h-2 rounded-full bg-[#C5A880] animate-pulse"></span>
            <span className="font-medium tracking-wide">
              {settings?.announcement || '100% Pure Export Overstock Garments • 48-Hour Delivery Across Bangladesh'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs text-neutral-300">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-[#25D366] transition-colors"
            >
              <MessageCircle size={13} className="text-[#25D366]" />
              <span className="font-medium">WhatsApp: +880 1875-413743</span>
            </a>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-400">Dhaka ৳70 • Outside ৳130</span>
          </div>
        </div>
      </div>

      {/* Main Brand Navbar Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Atelier Subtitle */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => onSelectCategory('All')}
          >
            <img 
              src="/logo.jpg" 
              alt="Stitchy Logo" 
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-xl border border-[#E8E5DF] shadow-xs bg-white p-0.5 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col items-start">
              <span className="font-serif-luxury text-2xl sm:text-3xl tracking-wide font-bold text-neutral-900 group-hover:text-[#8C7A6B] transition-colors leading-none">
                Stitchy
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.25em] font-bold text-[#8C7A6B] uppercase mt-1 group-hover:text-neutral-900 transition-colors">
                MADE STITCH BY STITCH
              </span>
            </div>
          </div>

          {/* Actions: Search, WhatsApp, Customer Account, Cart */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Search Input toggle */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center bg-white border border-[#E8E5DF] rounded-full px-3 py-1 shadow-sm">
                  <Search size={16} className="text-neutral-400 mr-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search export wear..."
                    autoFocus
                    className="w-28 sm:w-44 text-xs bg-transparent focus:outline-none text-neutral-800"
                  />
                  <button onClick={() => { setSearchOpen(false); onSearchChange(''); }} className="text-neutral-400 hover:text-neutral-600 ml-1">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-neutral-700 hover:text-black transition-colors rounded-full hover:bg-neutral-100"
                  title="Search products"
                >
                  <Search size={19} />
                </button>
              )}
            </div>

            {/* Direct WhatsApp Button in Navbar */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-all border border-[#25D366]/30 shadow-2xs"
              title="Chat on WhatsApp"
            >
              <MessageCircle size={14} className="text-[#25D366]" />
              <span>WhatsApp</span>
            </a>

            {/* Customer Account / Order Tracking Button (Gmail login) */}
            <button
              onClick={onOpenAccount}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#D5CEC5] bg-white text-neutral-800 hover:bg-[#FAF8F5] transition-all shadow-2xs"
              title="Customer Profile & Track Orders"
            >
              {customerUser ? (
                <span className="w-4 h-4 rounded-full bg-neutral-900 text-[#C5A880] text-[9px] flex items-center justify-center font-bold">
                  {customerUser.name?.charAt(0) || 'U'}
                </span>
              ) : (
                <User size={14} className="text-[#8C7A6B]" />
              )}
              <span className="hidden sm:inline">
                {customerUser ? customerUser.name?.split(' ')[0] : 'My Orders'}
              </span>
            </button>

            {/* Shopping Bag Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 p-2.5 sm:px-4 sm:py-2 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 active:scale-95 transition-all shadow-md cursor-pointer"
              aria-label="View Cart"
            >
              <ShoppingBag size={18} className="text-[#FDFBF7]" />
              <span className="hidden sm:inline text-xs font-semibold tracking-wider uppercase">Bag</span>
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold text-neutral-900 bg-[#C5A880] rounded-full">
                {cartCount}
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* Refined Classy Category Top Bar (Attractive, Aesthetic & Responsive on both PC and Phone) */}
      <div className="bg-[#FAF8F5]/90 border-t border-[#E8E5DF] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
            {categoryItems.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    const el = document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`group shrink-0 inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#121212] text-[#FDFBF7] shadow-md ring-1 ring-[#C5A880]/50 scale-[1.02]'
                      : 'bg-white/85 text-neutral-700 hover:text-neutral-950 hover:bg-white border border-[#E8E5DF] hover:border-[#C5A880]/60 shadow-2xs'
                  }`}
                >
                  <span className={`transition-colors ${isActive ? 'text-[#C5A880]' : 'text-neutral-400 group-hover:text-neutral-900'}`}>
                    {cat.icon}
                  </span>
                  <span>{cat.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </header>
  );
}