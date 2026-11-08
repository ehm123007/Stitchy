import React, { useState } from 'react';
import { X, Check, HelpCircle } from 'lucide-react';

export default function SizeGuideModal({ isOpen, onClose, selectedSize, onSelectSize, category = 'Hoodies & Jackets' }) {
  const [unit, setUnit] = useState('both'); // 'both', 'in', 'cm'

  if (!isOpen) return null;

  const hoodieSizeData = [
    { size: 'XS', chestIn: '33 – 34.3', chestCm: '84 – 87', waistCm: '72 – 75' },
    { size: 'S', chestIn: '34.6 – 36.2', chestCm: '88 – 92', waistCm: '76 – 80' },
    { size: 'M', chestIn: '36.6 – 38.6', chestCm: '93 – 98', waistCm: '81 – 86' },
    { size: 'L', chestIn: '39 – 41', chestCm: '99 – 104', waistCm: '87 – 92' },
    { size: 'XL', chestIn: '41.3 – 43.3', chestCm: '105 – 110', waistCm: '93 – 98' },
    { size: 'XXL', altSize: '2XL', chestIn: '43.7 – 45.7', chestCm: '111 – 116', waistCm: '99 – 104' },
    { size: 'XXXL', altSize: '3XL', chestIn: '46.1 – 48', chestCm: '117 – 122', waistCm: '105 – 110' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-[#FAFAF8] text-[#121212] rounded-3xl shadow-2xl border border-[#E8E5DF] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-5 bg-[#FAF8F5] border-b border-[#E8E5DF] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.jpg" 
              alt="STITCHY" 
              className="w-10 h-10 object-contain rounded-xl border border-[#E8E5DF] bg-white p-0.5 shadow-2xs" 
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-luxury text-lg font-bold text-neutral-900 tracking-wide">
                  STITCHY
                </span>
                <span className="text-[10px] tracking-widest font-bold uppercase text-[#8C7A6B] bg-[#F4EFEB] px-2 py-0.5 rounded-full border border-[#E8E5DF]">
                  Official Guide
                </span>
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 mt-0.5">
                Hoodie & Export Garment Size Guide
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#E8E5DF] text-neutral-500 hover:text-neutral-900 hover:border-neutral-900 flex items-center justify-center transition-all shadow-2xs"
            aria-label="Close size guide"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto text-xs leading-relaxed">
          
          {/* Subtle Garment Illustration & Measurement Guide Banner */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E8E5DF] shadow-2xs flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
            {/* Minimalist Hoodie Outline SVG with measurement lines */}
            <div className="w-36 h-36 shrink-0 relative flex items-center justify-center bg-[#FAF8F5] rounded-xl border border-[#E8E5DF]/80 p-2">
              <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full text-neutral-800"
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Hood */}
                <path d="M38 28 C38 16, 62 16, 62 28 C62 31, 58 33, 50 33 C42 33, 38 31, 38 28 Z" fill="#F4EFEB" strokeWidth="1.2" />
                <path d="M46 33 L45 39 M54 33 L55 39" stroke="#8C7A6B" strokeWidth="1" />
                
                {/* Shoulders & Sleeves */}
                <path d="M38 28 L20 38 L25 55 L32 52 L32 80 L68 80 L68 52 L75 55 L80 38 L62 28" />
                {/* Pocket */}
                <path d="M40 64 L60 64 L57 74 L43 74 Z" strokeWidth="1" stroke="#8C7A6B" />
                {/* Ribbed Hem & Cuffs */}
                <path d="M32 78 L68 78 M32 80 L68 80" strokeWidth="1.5" />
                <path d="M22 53 L26 55 M74 55 L78 53" strokeWidth="1" />

                {/* Measurement Line A: Chest */}
                <line x1="28" y1="46" x2="72" y2="46" stroke="#C5A880" strokeWidth="1.8" strokeDasharray="2,2" />
                <circle cx="28" cy="46" r="2" fill="#C5A880" />
                <circle cx="72" cy="46" r="2" fill="#C5A880" />
                <rect x="42" y="41" width="16" height="10" rx="3" fill="#121212" />
                <text x="50" y="48.5" fill="#FAFAF8" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">A</text>

                {/* Measurement Line B: Waist */}
                <line x1="30" y1="62" x2="70" y2="62" stroke="#8C7A6B" strokeWidth="1.8" strokeDasharray="2,2" />
                <circle cx="30" cy="62" r="2" fill="#8C7A6B" />
                <circle cx="70" cy="62" r="2" fill="#8C7A6B" />
                <rect x="42" y="57" width="16" height="10" rx="3" fill="#8C7A6B" />
                <text x="50" y="64.5" fill="#FAFAF8" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">B</text>
              </svg>
            </div>

            {/* How to Measure Descriptions */}
            <div className="flex-1 space-y-3 text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B] block">
                HOW TO MEASURE
              </span>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-neutral-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    A
                  </span>
                  <div>
                    <span className="font-bold text-neutral-900 block text-xs">Chest:</span>
                    <span className="text-neutral-600 text-[11px]">
                      Measure around the fullest part of your chest, keeping the tape comfortably horizontal under your arms.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-[#8C7A6B] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    B
                  </span>
                  <div>
                    <span className="font-bold text-neutral-900 block text-xs">Waist:</span>
                    <span className="text-neutral-600 text-[11px]">
                      Measure around your natural waistline, where your trousers normally rest.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Header with Title */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-serif-luxury text-sm sm:text-base font-bold text-neutral-900 uppercase tracking-wide">
                Hoodie Size Guide
              </h4>
              <span className="text-[11px] text-neutral-500 font-medium">
                Standard European Export Sizing
              </span>
            </div>

            {/* Official Measurement Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#E8E5DF] bg-white shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E8E5DF] text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                    <th className="py-3 px-4 sm:px-5">Size</th>
                    <th className="py-3 px-3 sm:px-4 text-right">Chest (inches)</th>
                    <th className="py-3 px-3 sm:px-4 text-right">Chest (cm)</th>
                    <th className="py-3 px-4 sm:px-5 text-right">Waist (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5DF] text-xs font-mono">
                  {hoodieSizeData.map((row) => {
                    const isRowSelected = selectedSize === row.size || (row.altSize && selectedSize === row.altSize);
                    return (
                      <tr 
                        key={row.size}
                        onClick={() => onSelectSize && onSelectSize(row.size === 'XXL' ? '2XL' : row.size === 'XXXL' ? '3XL' : row.size)}
                        className={`transition-colors cursor-pointer ${
                          isRowSelected 
                            ? 'bg-[#F4EFEB] font-bold text-neutral-950' 
                            : 'hover:bg-[#FAF8F5] text-neutral-700'
                        }`}
                      >
                        <td className="py-2.5 px-4 sm:px-5 font-bold font-sans flex items-center gap-2">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isRowSelected 
                              ? 'bg-neutral-900 text-white shadow-2xs' 
                              : 'bg-neutral-100 text-neutral-800 border border-[#E8E5DF]'
                          }`}>
                            {row.size}
                          </span>
                          {row.altSize && (
                            <span className="text-[10px] text-neutral-400 font-normal">
                              ({row.altSize})
                            </span>
                          )}
                          {isRowSelected && (
                            <span className="text-[10px] text-[#8C7A6B] font-bold font-sans uppercase tracking-wider">
                              • Your Pick
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 text-right font-medium">{row.chestIn}</td>
                        <td className="py-2.5 px-3 sm:px-4 text-right font-medium">{row.chestCm}</td>
                        <td className="py-2.5 px-4 sm:px-5 text-right font-medium">{row.waistCm}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Size Tips Box */}
          <div className="p-4 bg-[#F4EFEB] rounded-2xl border border-[#E8E5DF] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B] block">
              SIZE TIPS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-[#E8E5DF]/70">
                <span className="font-bold text-neutral-900">• Regular fit:</span>
                <span className="text-neutral-600">Choose your usual size.</span>
              </div>
              <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-[#E8E5DF]/70">
                <span className="font-bold text-neutral-900">• Oversized fit:</span>
                <span className="text-neutral-600">Consider going one size up.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#E8E5DF] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-neutral-500">
            Tap any row or close to continue ordering
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
