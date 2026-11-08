import React from 'react';
import { Printer, X, CheckCircle2, ShieldCheck, Phone, MapPin, Package } from 'lucide-react';

export default function CourierSlipModal({ order, settings, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isFullPaid = order.balanceDue === 0;

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white animate-fadeIn">
      
      {/* Modal Box */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-4xl w-full border border-[#E8E5DF] shadow-2xl overflow-hidden print:border-none print:shadow-none print:rounded-none"
      >
        
        {/* Top toolbar (Hidden in print) */}
        <div className="p-4 bg-[#FAF8F5] border-b border-[#E8E5DF] flex items-center justify-between print:hidden">
          <div>
            <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
              Courier Label Strip Generator (1/4 A4 Height • Full A4 Width)
            </span>
            <h3 className="font-serif-luxury text-base font-bold text-neutral-900">
              Steadfast / Pathao / RedX Ready Dispatch Label
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center gap-1.5 shadow-md"
            >
              <Printer size={15} />
              <span>Print Courier Strip</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-500 hover:text-black rounded-full hover:bg-neutral-200"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PRINTABLE SLIP CONTAINER: EXACT 1/4 A4 HEIGHT & FULL A4 WIDTH   */}
        {/* ============================================================== */}
        <div className="p-6 print:p-0 flex justify-center bg-neutral-100 print:bg-transparent">
          
          <div 
            id="courier-slip-printable"
            className="w-full bg-white text-black border-2 border-black p-4 rounded-xl print:rounded-none print:border-2 print:border-black font-sans relative"
            style={{
              width: '100%',
              maxWidth: '210mm',
              minHeight: '74mm', // Exactly 1/4 of A4 (297 / 4 ≈ 74.25mm)
              boxSizing: 'border-box'
            }}
          >
            
            {/* Header: Brand & Consignment Strip */}
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <div className="flex items-center gap-2.5">
                <img 
                  src="/logo.jpg" 
                  alt="Stitchy Logo" 
                  className="w-9 h-9 object-contain border border-neutral-400 rounded-lg p-0.5 shrink-0" 
                />
                <div>
                  <h1 className="text-xl font-black tracking-wide leading-none font-serif m-0">
                    Stitchy
                  </h1>
                  <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-neutral-800 block">
                    MADE STITCH BY STITCH
                  </span>
                </div>
                <div className="border-l-2 border-black pl-3 text-[10px] leading-tight">
                  <p className="m-0 font-bold">Sender: STITCHY BD</p>
                  <p className="m-0 text-neutral-700">WhatsApp: +880 1875-413743</p>
                  <p className="m-0 text-neutral-700">stitchy123007@gmail.com</p>
                </div>
              </div>

              {/* Order Reference & Barcode Simulator */}
              <div className="text-right">
                <div className="text-xs font-mono font-black bg-black text-white px-2 py-0.5 rounded">
                  ORDER: #{order.referenceNo}
                </div>
                <div className="text-[9px] text-neutral-600 mt-1 font-mono">
                  {formattedDate}
                </div>
                {/* Visual Barcode Pattern */}
                <div className="mt-1 flex justify-end gap-[1.5px] h-5 items-end">
                  {[3,1,4,2,1,5,2,3,1,4,2,5,1,3,2,4,1,2,5,3,1,4,2,1,3,5].map((h, i) => (
                    <div key={i} className="bg-black w-[2px]" style={{ height: `${h * 4}px` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Main Delivery & COD Row */}
            <div className="grid grid-cols-12 gap-3 pt-2 items-start">
              
              {/* Left Column: Customer Delivery Address (7 cols) */}
              <div className="col-span-7 pr-2 border-r-2 border-black space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-1.5 py-0.5 rounded">
                    DELIVER TO
                  </span>
                  <span className="text-[10px] font-black uppercase text-neutral-900 border border-black px-1.5 py-0.5 rounded">
                    {order.customer?.deliveryZone === 'inside' ? '📍 INSIDE DHAKA (৳70)' : '🚚 OUTSIDE DHAKA (৳130)'}
                  </span>
                </div>

                <div className="text-sm font-black text-black">
                  {order.customer?.name}
                </div>

                {/* Prominent phone number for courier delivery agent */}
                <div className="text-sm font-mono font-black text-black bg-neutral-100 p-1 rounded border border-neutral-300 inline-block">
                  📞 {order.customer?.phone}
                </div>

                <div className="text-[11px] font-semibold text-neutral-800 leading-snug">
                  {order.customer?.address}
                </div>

                {order.customer?.landmark && (
                  <div className="text-[10px] font-bold text-neutral-700">
                    Landmark: <span className="underline">{order.customer.landmark}</span>
                  </div>
                )}

                <div className="text-[10px] font-bold text-neutral-600">
                  {order.customer?.city} {order.customer?.postalCode ? ` - ${order.customer.postalCode}` : ''}
                </div>
              </div>

              {/* Right Column: Courier Cash Collection Box (5 cols) */}
              <div className="col-span-5 space-y-1.5">
                
                {/* Big COD Amount Box */}
                <div className={`p-2 rounded-lg border-2 text-center ${
                  isFullPaid 
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-900' 
                    : 'border-black bg-neutral-100 text-black'
                }`}>
                  <span className="text-[9px] font-black uppercase tracking-wider block">
                    {isFullPaid ? 'PAID IN FULL (PREPAID)' : 'CASH TO COLLECT (COD)'}
                  </span>
                  <div className="text-xl font-black font-mono leading-none my-1">
                    {isFullPaid ? '৳0 (DO NOT COLLECT)' : `৳${order.balanceDue}`}
                  </div>
                  <span className="text-[9px] font-bold text-neutral-600 block">
                    Advance Paid: ৳{order.advancePaid} via Bangla QR
                  </span>
                </div>

                {/* Items in parcel */}
                <div className="text-[10px] border border-neutral-300 p-1.5 rounded bg-white">
                  <span className="font-bold text-neutral-700 block text-[9px] uppercase">
                    Package Items ({order.items?.length || 1} pcs):
                  </span>
                  <div className="truncate font-semibold text-neutral-900">
                    {order.items?.map((it) => `${it.title} [${it.size}] x${it.quantity}`).join(', ')}
                  </div>
                </div>

                <div className="text-[8px] text-neutral-500 text-center leading-tight">
                  Please hand over parcel only after collecting designated COD cash amount.
                </div>

              </div>

            </div>

            {/* Bottom cutting line indicator */}
            <div className="mt-2 pt-1 border-t border-dashed border-neutral-400 flex items-center justify-between text-[8px] text-neutral-400">
              <span>✂️ Cut along line to attach to courier parcel bag</span>
              <span>1/4 A4 Format • STITCHY Export Bangladesh</span>
            </div>

          </div>

        </div>

        {/* Footer print prompt (Hidden in print) */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#E8E5DF] flex items-center justify-between print:hidden text-xs text-neutral-500">
          <span>Tip: In print settings, select paper size <b>A4</b> with margins set to <b>None / Minimum</b>.</span>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center gap-1.5 shadow-md"
          >
            <Printer size={15} />
            <span>Print Now</span>
          </button>
        </div>

      </div>

      {/* Embedded CSS for 1/4 A4 print style */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #courier-slip-printable, #courier-slip-printable * {
            visibility: visible;
          }
          #courier-slip-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 210mm !important;
            min-height: 74mm !important;
            padding: 8mm !important;
            margin: 0 !important;
            border: 2px solid black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 5mm;
          }
        }
      `}</style>

    </div>
  );
}
