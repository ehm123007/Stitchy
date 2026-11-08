import React, { useState } from 'react';
import { X, Trash2, Tag, ShoppingBag, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { validatePromoCode } from '../services/api';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onProceedCheckout,
  appliedPromo,
  onApplyPromo,
  onRemovePromo
}) {
  if (!isOpen) return null;

  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      discountAmount = Math.round((subtotal * appliedPromo.value) / 100);
    } else {
      discountAmount = Math.min(subtotal, appliedPromo.value);
    }
  }

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await validatePromoCode(promoInput.trim(), subtotal);
      onApplyPromo(res);
      setPromoInput('');
    } catch (err) {
      setPromoError(err.message || 'Invalid promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAFAF8] shadow-2xl border-l border-[#E8E5DF] flex flex-col justify-between animate-slideLeft">
          
          {/* Header */}
          <div className="p-5 border-b border-[#E8E5DF] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-neutral-900" />
              <h2 className="font-serif-luxury text-lg font-bold text-neutral-900">
                Your Bag ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                <div className="w-16 h-16 rounded-full bg-[#F4EFEB] flex items-center justify-center text-[#8C7A6B]">
                  <ShoppingBag size={28} />
                </div>
                <div>
                  <h3 className="font-serif-luxury text-lg font-semibold text-neutral-900">Your bag is empty</h3>
                  <p className="text-xs text-neutral-500 max-w-xs mt-1">
                    Discover 100% exported clothes from leading global brands crafted with heavyweight combed cotton.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-neutral-900 text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-all shadow-md"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <>
                {cartItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex gap-3.5 bg-white p-3.5 rounded-2xl border border-[#E8E5DF] shadow-xs relative"
                  >
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-[#F4EFEB] shrink-0 border border-[#E8E5DF]">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="font-serif-luxury text-sm font-semibold text-neutral-900 line-clamp-1">
                            {item.title}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.productId, item.size, item.color)}
                            className="text-neutral-400 hover:text-red-600 transition-colors ml-2"
                            title="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500">
                          <span className="font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                            Size: {item.size}
                          </span>
                          <span>•</span>
                          <span>{item.color}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F0ECE6]">
                        <div className="flex items-center border border-[#D5CEC5] rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => onUpdateQty(item.productId, item.size, item.color, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-100 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-0.5 text-xs font-bold text-neutral-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQty(item.productId, item.size, item.color, item.quantity + 1)}
                            disabled={item.quantity >= (item.maxAvailable || 20)}
                            className="px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-100 font-bold disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-sm font-bold text-neutral-900">
                          ৳{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Promo Code Input Box */}
                <div className="bg-white p-4 rounded-2xl border border-[#E8E5DF] space-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    <Tag size={14} className="text-[#8C7A6B]" />
                    <span>Have a Promo Code?</span>
                  </div>

                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs text-emerald-800">
                      <div className="flex items-center gap-1.5">
                        <Check size={14} className="text-emerald-600" />
                        <div>
                          <span className="font-bold">{appliedPromo.code}</span> applied:
                          <span className="ml-1 font-semibold">
                            -৳{discountAmount}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={onRemovePromo}
                        className="text-neutral-500 hover:text-red-600 font-medium text-[11px] underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value);
                          setPromoError('');
                        }}
                        placeholder="e.g. EXPORT10, WELCOME50"
                        className="flex-1 text-xs px-3 py-2 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl focus:outline-none focus:border-neutral-900 uppercase font-mono"
                      />
                      <button
                        type="submit"
                        disabled={promoLoading || !promoInput.trim()}
                        className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-xs"
                      >
                        {promoLoading ? '...' : 'Apply'}
                      </button>
                    </form>
                  )}

                  {promoError && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">
                      {promoError}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cartItems.length > 0 && (
            <div className="p-5 bg-white border-t border-[#E8E5DF] space-y-3">
              
              <div className="space-y-1.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-neutral-900">৳{subtotal}</span>
                </div>

                {appliedPromo && discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({appliedPromo.code}):</span>
                    <span>-৳{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-500 text-[11px]">
                  <span>Delivery Charge:</span>
                  <span>Calculated at checkout (৳70 / ৳130)</span>
                </div>

                <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-[#F0ECE6]">
                  <span>Estimated Total:</span>
                  <span>৳{Math.max(0, subtotal - discountAmount)} + Delivery</span>
                </div>
              </div>

              <button
                onClick={onProceedCheckout}
                className="w-full py-4 bg-neutral-900 text-white rounded-2xl text-xs sm:text-sm font-bold tracking-widest uppercase hover:bg-neutral-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} className="text-[#C5A880]" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400">
                <ShieldCheck size={13} className="text-[#C5A880]" />
                <span>Bangla QR Prepayment & Cash on Delivery Available</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
