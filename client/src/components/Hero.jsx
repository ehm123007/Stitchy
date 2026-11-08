import React from 'react';
import { ArrowDown, Sparkles, CheckCircle2, ShieldCheck, Truck, MessageCircle, Heart, Layers, Tag, ArrowRight } from 'lucide-react';

export default function Hero({ onExplore, onSelectCategory, settings }) {
  const coverImg = settings?.coverUrl || settings?.heroCoverUrl || '/cover.jpg';
  const headline = settings?.heroHeadline || 'Good Fit. Better Days.';
  const subtitle = settings?.heroSubtitle || 'Made Stitch By Stitch • Export Overstock Ready for 24-48h Delivery Across Bangladesh';
  const buttonText = settings?.heroButtonText || 'Shop Collection';
  const showHeroBanner = settings?.showHeroBanner !== false;

  const defaultPillars = [
    { id: 'p1', icon: '🧵', title: 'Premium Fabric', subtitle: '240+ GSM Organic Cotton' },
    { id: 'p2', icon: '🛡️', title: 'Long Lasting', subtitle: 'Reinforced Double Stitching' },
    { id: 'p3', icon: '👔', title: 'Modern Fit', subtitle: 'Drop-Shoulder Streetwear Cuts' },
    { id: 'p4', icon: '🤍', title: 'Wear Your Story', subtitle: 'Global Brands Quality' }
  ];

  const brandPillars = settings?.brandPillars && settings.brandPillars.length > 0 
    ? settings.brandPillars 
    : defaultPillars;

  const activeBanners = (settings?.campaignBanners || []).filter((b) => b.active);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#F4EFEB] to-[#FAFAF8] border-b border-[#E8E5DF]">
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 sm:pt-12 sm:pb-20 space-y-8">
        
        {/* Official Brand Cover Banner Showcase */}
        {showHeroBanner && (
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#D5CEC5] group">
            <img
              src={coverImg}
              alt="Stitchy - Made Stitch By Stitch Official Cover"
              className="w-full h-auto object-cover max-h-[480px] group-hover:scale-[1.01] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent flex items-end p-5 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 w-full text-white">
                <div className="space-y-1 max-w-2xl">
                  <span className="text-[10px] sm:text-xs tracking-[0.25em] uppercase font-bold text-[#C5A880] drop-shadow-sm flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#C5A880]" />
                    <span>Premium Clothing Brand • Pure Export</span>
                  </span>
                  <h2 className="font-serif-luxury text-2xl sm:text-4xl font-bold drop-shadow-md">
                    {headline}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-200 drop-shadow-sm font-medium leading-relaxed">
                    {subtitle}
                  </p>
                </div>

                <button
                  onClick={onExplore}
                  className="px-5 py-2.5 sm:px-6 sm:py-3 bg-white text-neutral-900 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#FAF8F5] active:scale-95 transition-all shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <span>{buttonText}</span>
                  <ArrowDown size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Promotional Campaign Ads & Posters (Configured from Admin Panel) */}
        {activeBanners.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8C7A6B] uppercase tracking-wider">
              <Tag size={13} className="text-[#C5A880]" />
              <span>Special Campaigns & Featured Posters</span>
            </div>

            <div className={`grid gap-4 ${activeBanners.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              {activeBanners.map((banner, idx) => (
                <div
                  key={banner.id || idx}
                  onClick={() => {
                    if (banner.link?.startsWith('http')) {
                      window.open(banner.link, '_blank');
                    } else {
                      onExplore();
                    }
                  }}
                  className="relative rounded-2xl overflow-hidden shadow-lg border border-[#D5CEC5] group cursor-pointer aspect-[2.3/1] bg-neutral-900"
                >
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex items-end p-4 sm:p-6 text-white">
                    <div className="space-y-1 w-full">
                      {banner.badge && (
                        <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#C5A880] text-neutral-950 shadow-sm">
                          {banner.badge}
                        </span>
                      )}
                      <h3 className="font-serif-luxury text-lg sm:text-xl font-bold">
                        {banner.title}
                      </h3>
                      {banner.subtitle && (
                        <p className="text-xs text-neutral-300 line-clamp-1 max-w-md">
                          {banner.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4 Brand Pillars (From the Official Cover) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2 border-t border-[#E8E5DF] text-xs">
          {brandPillars.map((p, idx) => (
            <div key={p.id || idx} className="bg-white p-3.5 rounded-2xl border border-[#E8E5DF] shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] flex items-center justify-center text-lg shrink-0 font-bold">
                {p.icon || '🧵'}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] truncate">
                  {p.title}
                </div>
                <div className="text-[11px] text-neutral-500 truncate">
                  {p.subtitle}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
