import React from 'react';
import { Eye, ShoppingBag, AlertCircle } from 'lucide-react';

export default function ProductCard({ product, onSelect, onQuickAdd }) {
  const isOutOfStock = product.totalStock <= 0;
  const isLowStock = product.totalStock > 0 && product.totalStock <= 5;
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const displayImage = product.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80';
  const hoverImage = product.images?.[1] || displayImage;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden hover:shadow-xl transition-all duration-300">
      
      {/* Product Image Area */}
      <div 
        onClick={() => onSelect(product)}
        className="relative w-full aspect-[4/5] bg-[#F4EFEB] overflow-hidden cursor-pointer"
      >
        <img
          src={displayImage}
          alt={product.title}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-neutral-900/90 backdrop-blur-sm text-[#FDFBF7] rounded-md shadow-sm">
              {product.badge}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-[#C5A880] text-neutral-900 rounded-md shadow-sm">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-red-600 text-white rounded-full">
              Sold Out
            </span>
          </div>
        ) : isLowStock ? (
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 text-[10px] font-bold bg-amber-500/90 text-white rounded-md flex items-center gap-1 shadow-sm">
              <AlertCircle size={10} />
              Only {product.totalStock} left
            </span>
          </div>
        ) : null}

        {/* Desktop Hover Quick Action */}
        <div className="absolute inset-x-3 bottom-3 hidden sm:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="flex-1 py-2.5 bg-white/95 backdrop-blur-md text-neutral-900 text-xs font-bold rounded-xl shadow-md hover:bg-neutral-900 hover:text-white transition-all flex items-center justify-center gap-1.5"
          >
            <Eye size={14} />
            <span>View Details</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#8C7A6B] font-semibold tracking-wider uppercase">
            <span>{product.category}</span>
            <span className="text-neutral-500 font-normal">
              {product.totalStock > 0 ? `${product.totalStock} in stock` : 'Out of stock'}
            </span>
          </div>

          <h3 
            onClick={() => onSelect(product)}
            className="font-serif-luxury text-base sm:text-lg font-semibold text-neutral-900 hover:text-[#C5A880] cursor-pointer transition-colors line-clamp-1"
          >
            {product.title}
          </h3>

          <p className="text-xs text-neutral-500 line-clamp-1 font-normal">
            {product.subtitle || (product.specs?.gsm ? `${product.specs.gsm} • ${product.specs.fabric}` : 'Pure export garment')}
          </p>
        </div>

        {/* Sizes preview */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Sizes:</span>
          {product.sizes?.map((s) => (
            <span
              key={s.size}
              className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${
                s.stock > 0
                  ? 'bg-neutral-100 text-neutral-800 border border-[#E8E5DF]'
                  : 'bg-neutral-100 text-neutral-300 line-through'
              }`}
            >
              {s.size}
            </span>
          ))}
        </div>

        {/* Price & CTA */}
        <div className="pt-2 border-t border-[#F0ECE6] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-bold text-neutral-900">
                ৳{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-neutral-400 line-through font-normal">
                  ৳{product.originalPrice}
                </span>
              )}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium">Export Standard</div>
          </div>

          <button
            onClick={() => onSelect(product)}
            disabled={isOutOfStock}
            className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 ${
              isOutOfStock
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : 'bg-neutral-900 text-white hover:bg-neutral-800 active:scale-95 shadow-xs'
            }`}
          >
            <ShoppingBag size={13} />
            <span>Select</span>
          </button>
        </div>

      </div>

    </div>
  );
}
