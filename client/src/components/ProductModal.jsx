import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, ShieldCheck, Truck, RotateCcw, Ruler, AlertCircle } from 'lucide-react';
import SizeGuideModal from './SizeGuideModal';

export default function ProductModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState(product.images?.[0] || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    setSelectedImage(product.images?.[0] || '');
    // Auto-select first in-stock size
    const firstInStock = product.sizes?.find((s) => s.stock > 0);
    if (firstInStock) {
      setSelectedSize(firstInStock.size);
    } else {
      setSelectedSize('');
    }
    setSelectedColor(product.colors?.[0] || 'Standard');
    setQuantity(1);
    setErrorMsg('');
    setAddedSuccess(false);
  }, [product]);

  const currentSizeObj = product.sizes?.find((s) => s.size === selectedSize);
  const maxAvailable = currentSizeObj ? currentSizeObj.stock : 0;

  const handleAdd = () => {
    if (!selectedSize) {
      setErrorMsg('Please select a size first.');
      return;
    }
    if (maxAvailable <= 0) {
      setErrorMsg('This size is currently sold out.');
      return;
    }
    if (quantity > maxAvailable) {
      setErrorMsg(`Only ${maxAvailable} pieces available in size ${selectedSize}.`);
      return;
    }

    onAddToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      originalPrice: product.originalPrice,
      image: selectedImage,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
      maxAvailable: maxAvailable
    });

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/70 backdrop-blur-sm animate-fadeIn">
      
      {/* Modal Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-[#E8E5DF] flex flex-col"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-neutral-500 hover:text-black bg-white/90 backdrop-blur-md rounded-full shadow-md transition-all hover:scale-105"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 sm:p-8">
          
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 space-y-4">
            
            {/* Main Showcase Image */}
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#F4EFEB] border border-[#E8E5DF]">
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-full object-cover object-top"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 px-3 py-1 text-xs font-bold tracking-wider uppercase bg-neutral-900 text-white rounded-md shadow-md">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImage === img
                        ? 'border-neutral-900 ring-2 ring-neutral-900/10'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Export Guarantee snippet */}
            <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8E5DF] text-xs text-neutral-600 space-y-1.5">
              <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#C5A880]" />
                <span>100% Exported Clothes Inspection</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Direct 100% exported clothes from leading global brands. Authentic factory quality. 100% pre-shrunk combed cotton.
              </p>
            </div>

          </div>

          {/* Right Column: Garment Specs & Ordering */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              
              <div>
                <span className="text-xs font-bold tracking-widest text-[#8C7A6B] uppercase">
                  {product.category}
                </span>
                <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-neutral-900 mt-1">
                  {product.title}
                </h2>
                <p className="text-xs text-neutral-500 mt-1 font-medium">
                  {product.subtitle || '100% Ring-Spun Pure Export Garment'}
                </p>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 py-2 border-y border-[#F0ECE6]">
                <span className="text-2xl sm:text-3xl font-bold text-neutral-900">
                  ৳{product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm sm:text-base text-neutral-400 line-through">
                    ৳{product.originalPrice}
                  </span>
                )}
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-[#C5A880] text-neutral-950 rounded">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {product.description}
              </p>

              {/* Fabric & Fit Specs */}
              {product.specs && (
                <div className="grid grid-cols-2 gap-2 text-xs bg-[#F4EFEB]/60 p-3 rounded-xl border border-[#E8E5DF]">
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">Fabric</span>
                    <span className="font-medium text-neutral-800">{product.specs.fabric || '100% Combed Cotton'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">Density</span>
                    <span className="font-medium text-neutral-800">{product.specs.gsm || 'Heavyweight 240+ GSM'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">Cut / Fit</span>
                    <span className="font-medium text-neutral-800">{product.specs.cut || 'Relaxed Comfort Fit'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">Export To</span>
                    <span className="font-medium text-neutral-800">{product.specs.origin || 'EU / US Consignment'}</span>
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-800 uppercase tracking-wider">
                      Color: <span className="font-normal text-neutral-600">{selectedColor}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedColor === c
                            ? 'bg-neutral-900 text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-[#E8E5DF]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-800 uppercase tracking-wider">
                    Select Size:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[#8C7A6B] hover:text-neutral-900 font-bold flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#F4EFEB] border border-[#E8E5DF] rounded-lg transition-all text-[11px] shadow-2xs"
                  >
                    <Ruler size={13} className="text-[#8C7A6B]" />
                    <span>Official Size Guide (XS–3XL)</span>
                  </button>
                </div>

                {/* Size Tip helper */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#FAF8F5] rounded-xl border border-[#E8E5DF] text-[11px] text-neutral-600">
                  <span className="truncate">
                    <strong className="text-neutral-900">Size Tip:</strong> Regular fit = usual size • Oversized = size up
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="font-bold text-neutral-900 underline hover:text-[#8C7A6B] shrink-0 text-[10px] uppercase tracking-wider ml-2"
                  >
                    View Chart
                  </button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {product.sizes?.map((s) => {
                    const isAvailable = s.stock > 0;
                    const isSelected = selectedSize === s.size;
                    return (
                      <button
                        key={s.size}
                        disabled={!isAvailable}
                        onClick={() => {
                          setSelectedSize(s.size);
                          setErrorMsg('');
                        }}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all relative flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-neutral-900 text-white ring-2 ring-neutral-900 shadow-md'
                            : isAvailable
                            ? 'bg-white border border-[#E8E5DF] text-neutral-800 hover:border-neutral-900'
                            : 'bg-neutral-100 border border-neutral-200 text-neutral-300 cursor-not-allowed line-through'
                        }`}
                      >
                        <span>{s.size}</span>
                        <span className={`text-[9px] mt-0.5 font-normal ${isSelected ? 'text-[#C5A880]' : isAvailable ? 'text-neutral-500' : 'text-neutral-300'}`}>
                          {isAvailable ? `${s.stock} left` : 'Out'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedSize && maxAvailable > 0 && maxAvailable <= 4 && (
                  <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle size={12} />
                    Only {maxAvailable} pieces left in size {selectedSize}!
                  </p>
                )}
              </div>

              {/* Quantity Picker */}
              <div className="flex items-center gap-4 pt-1">
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="flex items-center border border-[#D5CEC5] rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-neutral-900 min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(maxAvailable || 10, quantity + 1))}
                    disabled={quantity >= maxAvailable}
                    className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 font-bold disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded-lg border border-red-200">
                  {errorMsg}
                </p>
              )}

            </div>

            {/* Bottom Actions */}
            <div className="space-y-3 pt-4 border-t border-[#E8E5DF]">
              <button
                onClick={handleAdd}
                disabled={product.totalStock <= 0}
                className={`w-full py-4 rounded-2xl text-xs sm:text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-lg ${
                  addedSuccess
                    ? 'bg-emerald-700 text-white'
                    : product.totalStock <= 0
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.98]'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check size={18} />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} className="text-[#C5A880]" />
                    <span>Add to Bag • ৳{product.price * quantity}</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-500 text-center">
                <span className="flex items-center justify-center gap-1">
                  <Truck size={12} className="text-[#8C7A6B]" />
                  Dhaka: ৳70 • Outside: ৳130
                </span>
                <span className="flex items-center justify-center gap-1">
                  <ShieldCheck size={12} className="text-[#8C7A6B]" />
                  100% Authentic Export
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Official Hoodie & Apparel Size Guide Modal */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        selectedSize={selectedSize}
        onSelectSize={(sz) => {
          setSelectedSize(sz);
          setErrorMsg('');
        }}
        category={product.category}
      />
    </div>
  );
}
