import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Sparkles, Printer, ArrowRight, Package, Clock, Phone, Mail, MapPin } from 'lucide-react';

export default function ThankYouModal({ order, onClose, onContinueShopping }) {
  if (!order) return null;

  useEffect(() => {
    // Fire festive aesthetic confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C5A880', '#121212', '#F4EFEB', '#10B981']
      });
    } catch (e) {
      // safe fallback
    }
  }, []);

  const formattedDate = new Date(order.createdAt).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E8E5DF] overflow-hidden my-auto print:shadow-none print:border-none"
      >
        
        {/* Top Header Card */}
        <div className="p-6 sm:p-8 text-center bg-gradient-to-b from-[#FAF8F5] to-white border-b border-[#E8E5DF] space-y-3">
          
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={36} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#D5CEC5] text-[#8C7A6B] text-[11px] font-bold tracking-wider uppercase">
            <Sparkles size={12} className="text-[#C5A880]" />
            <span>Order Placed Successfully</span>
          </div>

          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-neutral-900">
            Thank You, {order.customer?.name}!
          </h2>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
            We are honored by your purchase of pure export garments from <b>STITCHY</b>. 
            Our operations team is currently reviewing your payment attachment and preparing your consignment for immediate dispatch.
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-mono">
            <span className="bg-neutral-100 text-neutral-800 px-3 py-1.5 rounded-lg border border-[#E8E5DF]">
              Order ID: <b>#{order.referenceNo}</b>
            </span>
            <span className="bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-lg border border-[#E8E5DF] flex items-center gap-1">
              <Clock size={12} />
              {formattedDate}
            </span>
          </div>

        </div>

        {/* Order Details Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[55vh] overflow-y-auto">
          
          {/* Items Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <Package size={14} className="text-[#8C7A6B]" />
              <span>Purchased Export Items</span>
            </h4>

            <div className="space-y-2 border border-[#E8E5DF] rounded-2xl p-3 bg-[#FAF8F5]">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-2 border-b last:border-0 border-[#E8E5DF]">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img src={item.image} alt="" className="w-10 h-12 object-cover rounded-md border border-[#E8E5DF]" />
                    )}
                    <div>
                      <div className="font-bold text-neutral-900">{item.title}</div>
                      <div className="text-[11px] text-neutral-500">
                        Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-neutral-900">
                    ৳{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Advance vs Balance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Delivery address */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E5DF] space-y-1.5 text-xs">
              <span className="font-bold text-neutral-900 flex items-center gap-1">
                <MapPin size={13} className="text-[#8C7A6B]" />
                Delivery Information:
              </span>
              <p className="text-neutral-700">{order.customer?.address}</p>
              {order.customer?.landmark && (
                <p className="text-neutral-500">Landmark: {order.customer.landmark}</p>
              )}
              <p className="text-neutral-500">{order.customer?.city} - {order.customer?.postalCode}</p>
              <p className="font-mono text-neutral-800 pt-1">Phone: {order.customer?.phone}</p>
            </div>

            {/* Payment Summary */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E5DF] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal:</span>
                <span className="font-semibold text-neutral-900">৳{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({order.promoCode}):</span>
                  <span>-৳{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500">Delivery Charge ({order.customer?.deliveryZone === 'inside' ? 'Dhaka' : 'Outside'}):</span>
                <span className="font-semibold text-neutral-900">৳{order.deliveryFee}</span>
              </div>

              <div className="flex justify-between font-bold pt-1.5 border-t border-[#E8E5DF] text-sm text-neutral-900">
                <span>Total:</span>
                <span>৳{order.total}</span>
              </div>

              <div className="pt-2 border-t border-[#E8E5DF] space-y-1">
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Advance Paid (Bangla QR):</span>
                  <span>৳{order.advancePaid}</span>
                </div>
                {order.balanceDue > 0 ? (
                  <div className="flex justify-between text-neutral-900 font-bold bg-amber-50 px-2 py-1 rounded">
                    <span>Due on Delivery (COD):</span>
                    <span>৳{order.balanceDue}</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-700 font-medium">
                    ✓ Full Prepayment Verified via Bangla QR
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Email dispatch notice */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <Mail size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Confirmation Email Notification:</span>
              <p className="text-[11px] text-blue-800 mt-0.5">
                {order.customer?.email
                  ? `An order confirmation receipt and consignment dispatch tracking email will be sent to ${order.customer.email} shortly.`
                  : 'Our customer support will notify you via phone SMS once your payment screenshot is verified.'}
              </p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 bg-white border-t border-[#E8E5DF] flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 border border-[#D5CEC5] text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
          >
            <Printer size={15} />
            <span>Print Invoice Slip</span>
          </button>

          <button
            onClick={onContinueShopping}
            className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold tracking-wider uppercase hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-md"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={14} className="text-[#C5A880]" />
          </button>
        </div>

      </div>

    </div>
  );
}
