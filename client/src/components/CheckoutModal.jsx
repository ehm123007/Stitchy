import React, { useState, useEffect } from 'react';
import { 
  X, Check, ShieldCheck, Upload, QrCode, Copy, CheckCircle2, 
  MapPin, Phone, Mail, User, Building, AlertCircle, ArrowLeft, Loader2, Info
} from 'lucide-react';
import { submitOrder } from '../services/api';

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  appliedPromo,
  settings,
  customerUser,
  onOrderSuccess
}) {
  if (!isOpen) return null;

  // Form states
  const [formData, setFormData] = useState({
    name: customerUser?.name || '',
    phone: customerUser?.phone || '',
    email: customerUser?.email || '',
    address: '',
    landmark: '',
    city: 'Dhaka',
    postalCode: '',
    deliveryZone: 'inside', // 'inside' = 70 TK, 'outside' = 130 TK
    paymentMethod: 'cod_advance', // 'cod_advance' or 'bangla_qr_full'
    transactionId: ''
  });

  // Keep form synced if user is already logged in
  useEffect(() => {
    if (customerUser) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || customerUser.name || '',
        email: prev.email || customerUser.email || '',
        phone: prev.phone || customerUser.phone || ''
      }));
    }
  }, [customerUser, isOpen]);

  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      discount = Math.round((subtotal * appliedPromo.value) / 100);
    } else {
      discount = Math.min(subtotal, appliedPromo.value);
    }
  }

  const deliveryFee = formData.deliveryZone === 'outside' ? 130 : 70;
  const netTotal = Math.max(0, subtotal - discount) + deliveryFee;

  // Advance to pay via Bangla QR
  const advanceRequired = formData.paymentMethod === 'bangla_qr_full' ? netTotal : deliveryFee;
  const balanceDueOnDelivery = formData.paymentMethod === 'bangla_qr_full' ? 0 : Math.max(0, subtotal - discount);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-set city if inside Dhaka selected
      if (name === 'deliveryZone' && value === 'inside' && !prev.city) {
        updated.city = 'Dhaka';
      }
      return updated;
    });
    setErrorMsg('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 12 * 1024 * 1024) {
        setErrorMsg('Proof screenshot must be under 12MB');
        return;
      }
      setPaymentProofFile(file);
      setProofPreviewUrl(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!formData.name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    const cleanPhone = formData.phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      setErrorMsg('A valid active 11-digit mobile phone number is required (e.g. 017XXXXXXXX) for delivery calls');
      return;
    }
    const cleanEmail = (formData.email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMsg('A valid email address is required (e.g. yourname@gmail.com). This is required to receive your invoice and log in to track your orders.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('Please provide your complete delivery address');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg('Please enter your city/district');
      return;
    }
    if (!paymentProofFile && !formData.transactionId.trim()) {
      setErrorMsg('Please upload your Bangla QR payment proof screenshot or enter your Transaction ID (TrxID)');
      return;
    }

    setLoading(true);

    try {
      const orderData = new FormData();
      orderData.append('name', formData.name.trim());
      orderData.append('phone', formData.phone.trim());
      orderData.append('email', (formData.email || '').trim());
      orderData.append('address', formData.address.trim());
      orderData.append('landmark', (formData.landmark || '').trim());
      orderData.append('city', formData.city.trim());
      orderData.append('postalCode', (formData.postalCode || '').trim());
      orderData.append('deliveryZone', formData.deliveryZone);
      orderData.append('paymentMethod', formData.paymentMethod);
      orderData.append('transactionId', formData.transactionId.trim());
      if (appliedPromo?.code) {
        orderData.append('promoCode', appliedPromo.code);
      }
      orderData.append('cartItems', JSON.stringify(cartItems));

      if (paymentProofFile) {
        orderData.append('paymentProof', paymentProofFile);
      }

      const res = await submitOrder(orderData);
      onOrderSuccess(res.order);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#E8E5DF] overflow-hidden my-auto"
      >
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-[#E8E5DF] bg-[#FAF8F5] flex items-center justify-between">
          <div>
            <span className="text-[10px] tracking-[0.25em] font-bold text-[#8C7A6B] uppercase block">
              Pure Export Delivery
            </span>
            <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-neutral-900 mt-0.5">
              Complete Your Order
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-black rounded-full hover:bg-neutral-200/60 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-8 max-h-[82vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-700 flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Customer & Delivery Details */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-4">
                <h3 className="font-serif-luxury text-base font-bold text-neutral-900 flex items-center gap-2">
                  <User size={16} className="text-[#C5A880]" />
                  <span>1. Customer & Delivery Contact</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                      Phone Number * (Mandatory 11-digit)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="01XXXXXXXXX"
                      className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl focus:outline-none focus:border-neutral-900 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Email Address <span className="text-red-500 font-bold">*</span></span>
                      <span className="text-[10px] text-[#C5A880] font-semibold normal-case">Mandatory for Invoice & Order Tracking</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl focus:outline-none focus:border-neutral-900 font-mono"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1.5 flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1"></span>
                      <span><b>Why mandatory:</b> You will receive your official invoice here, and you can log in anytime with this email to view all your order details and delivery updates.</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Zone Selection */}
              <div className="space-y-3 pt-4 border-t border-[#E8E5DF]">
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  2. Select Delivery Zone *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      formData.deliveryZone === 'inside'
                        ? 'border-neutral-900 bg-[#FAF8F5] shadow-xs'
                        : 'border-[#E8E5DF] hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-neutral-900">Inside Dhaka</div>
                        <div className="text-[11px] text-neutral-500">Dhaka Metropolitan Area</div>
                      </div>
                      <input
                        type="radio"
                        name="deliveryZone"
                        value="inside"
                        checked={formData.deliveryZone === 'inside'}
                        onChange={handleInputChange}
                        className="mt-0.5 accent-neutral-900"
                      />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-[#E8E5DF]/60">
                      <span className="text-[11px] text-neutral-500">Delivery Charge:</span>
                      <span className="text-sm font-bold text-neutral-900">৳70</span>
                    </div>
                  </label>

                  <label
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      formData.deliveryZone === 'outside'
                        ? 'border-neutral-900 bg-[#FAF8F5] shadow-xs'
                        : 'border-[#E8E5DF] hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-neutral-900">Outside Dhaka</div>
                        <div className="text-[11px] text-neutral-500">All Districts Across Bangladesh</div>
                      </div>
                      <input
                        type="radio"
                        name="deliveryZone"
                        value="outside"
                        checked={formData.deliveryZone === 'outside'}
                        onChange={handleInputChange}
                        className="mt-0.5 accent-neutral-900"
                      />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-[#E8E5DF]/60">
                      <span className="text-[11px] text-neutral-500">Delivery Charge:</span>
                      <span className="text-sm font-bold text-neutral-900">৳130</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Address details */}
              <div className="space-y-3.5 pt-4 border-t border-[#E8E5DF]">
                <h3 className="font-serif-luxury text-base font-bold text-neutral-900 flex items-center gap-2">
                  <MapPin size={16} className="text-[#C5A880]" />
                  <span>3. Delivery Address</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                    Street Address / House & Road / Flat *
                  </label>
                  <textarea
                    rows={2}
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House No, Road No, Sector / Area / Village"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl focus:outline-none focus:border-neutral-900 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                      Nearest Landmark
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      placeholder="e.g. Beside Jamuna Bank"
                      className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                      City / District *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Dhaka, Chittagong"
                      className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="e.g. 1212"
                      className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl focus:outline-none focus:border-neutral-900 font-mono"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Payment & Bangla QR Proof */}
            <div className="lg:col-span-5 space-y-5 bg-[#FAF8F5] p-5 sm:p-6 rounded-3xl border border-[#E8E5DF]">
              
              <div>
                <span className="text-[10px] tracking-[0.2em] font-bold text-[#8C7A6B] uppercase block">
                  Payment Method
                </span>
                <h3 className="font-serif-luxury text-base font-bold text-neutral-900 mt-0.5">
                  4. Payment: Bkash Payment or Bangla QR ( supports Credit/Debit card, Bkash, Nagad, Rocket, Upay)
                </h3>
              </div>

              {/* Payment Method Toggle */}
              <div className="space-y-2.5">
                <label
                  className={`cursor-pointer p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3 bg-white ${
                    formData.paymentMethod === 'cod_advance'
                      ? 'border-neutral-900 shadow-xs'
                      : 'border-[#E8E5DF]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod_advance"
                    checked={formData.paymentMethod === 'cod_advance'}
                    onChange={handleInputChange}
                    className="mt-1 accent-neutral-900"
                  />
                  <div>
                    <div className="font-bold text-xs text-neutral-900">
                      Cash on Delivery (Prepay Delivery Fee: ৳{deliveryFee})
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                      To prevent return fraud, pay only the delivery fee (৳{deliveryFee}) via <b>Bkash Payment or Bangla QR ( supports Credit/Debit card, Bkash, Nagad, Rocket, Upay)</b> now. 
                      The remaining <b>৳{balanceDueOnDelivery}</b> is paid in Cash on Delivery upon parcel arrival.
                    </p>
                  </div>
                </label>

                <label
                  className={`cursor-pointer p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3 bg-white ${
                    formData.paymentMethod === 'bangla_qr_full'
                      ? 'border-neutral-900 shadow-xs'
                      : 'border-[#E8E5DF]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bangla_qr_full"
                    checked={formData.paymentMethod === 'bangla_qr_full'}
                    onChange={handleInputChange}
                    className="mt-1 accent-neutral-900"
                  />
                  <div>
                    <div className="font-bold text-xs text-neutral-900">
                      Bkash Payment or Bangla QR (Full Prepayment: ৳{netTotal})
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                      <b>Bkash Payment or Bangla QR ( supports Credit/Debit card, Bkash, Nagad, Rocket, Upay)</b>. Zero cash hassle at your doorstep.
                    </p>
                  </div>
                </label>
              </div>

              {/* Bangla QR Display Box */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E5DF] space-y-3.5 text-center">
                
                <div className="space-y-1">
                  <div className="inline-block px-3 py-1 bg-[#0F5132]/10 text-[#0F5132] rounded-full text-[11px] font-bold border border-[#0F5132]/20">
                    Bkash Payment or Bangla QR ( supports Credit/Debit card, Bkash, Nagad, Rocket, Upay)
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-900 pt-1">
                    <QrCode size={16} className="text-[#0F5132]" />
                    <span>Scan to Pay ৳{advanceRequired}</span>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="relative mx-auto w-56 sm:w-64 bg-white rounded-2xl p-2 border-2 border-[#D5CEC5] shadow-sm flex items-center justify-center overflow-hidden">
                  <img
                    src={settings?.banglaQrUrl || '/uploads/bangla-qr.jpg'}
                    alt="bKash Bangla QR Code"
                    className="w-full h-auto object-contain rounded-xl"
                  />
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 font-semibold leading-relaxed">
                  Bkash Payment or Bangla QR ( supports Credit/Debit card, Bkash, Nagad, Rocket, Upay)
                </div>

                {/* Account details copy pills */}
                <div className="space-y-1.5 text-left text-xs bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8E5DF]">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-500">Bkash / Bangla QR Number:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('01567932733', 'bkash')}
                      className="font-mono font-bold text-neutral-900 flex items-center gap-1 hover:text-[#C5A880] px-2 py-0.5 rounded bg-white border border-[#D5CEC5]"
                      title="Click to copy number"
                    >
                      <span>01567-932733</span>
                      {copiedField === 'bkash' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Screenshot Attachment Dropzone */}
                <div className="space-y-2 text-left pt-1">
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Attachment: Payment Proof Screenshot *
                  </label>
                  
                  <div className="relative border-2 border-dashed border-[#D5CEC5] hover:border-neutral-900 rounded-2xl p-3 text-center transition-all bg-[#FAF8F5] cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {proofPreviewUrl ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={proofPreviewUrl}
                          alt="Proof preview"
                          className="w-12 h-12 object-cover rounded-lg border border-[#D5CEC5]"
                        />
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-xs font-bold text-emerald-800 truncate">
                            {paymentProofFile?.name || 'Screenshot attached'}
                          </p>
                          <p className="text-[10px] text-neutral-500">Click to change screenshot</p>
                        </div>
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2 text-neutral-600 space-y-1">
                        <Upload size={20} className="text-[#8C7A6B]" />
                        <span className="text-xs font-semibold text-neutral-800">
                          Upload Screenshot Proof
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          Take a screenshot after payment & attach here (PNG, JPG)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* TrxID input */}
                <div className="text-left">
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                    Transaction ID (TrxID) / Sender Number
                  </label>
                  <input
                    type="text"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleInputChange}
                    placeholder="e.g. 9J28A17X9K or 017XXXXXXXX"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl focus:outline-none focus:border-neutral-900 font-mono"
                  />
                </div>

              </div>

              {/* Order Summary Receipt Box */}
              <div className="space-y-2 pt-2 border-t border-[#E8E5DF] text-xs text-neutral-700">
                <div className="flex justify-between">
                  <span>Items Subtotal ({cartItems.reduce((a, b) => a + b.quantity, 0)} pcs):</span>
                  <span className="font-semibold text-neutral-900">৳{subtotal}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Promo Discount:</span>
                    <span>-৳{discount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery ({formData.deliveryZone === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
                  <span className="font-semibold text-neutral-900">৳{deliveryFee}</span>
                </div>

                <div className="flex justify-between font-bold text-sm text-neutral-900 pt-2 border-t border-[#E8E5DF]">
                  <span>Total Order Value:</span>
                  <span>৳{netTotal}</span>
                </div>

                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 space-y-1">
                  <div className="flex justify-between text-xs font-bold text-emerald-900">
                    <span>Prepay Now via Bangla QR:</span>
                    <span>৳{advanceRequired}</span>
                  </div>
                  {balanceDueOnDelivery > 0 && (
                    <div className="flex justify-between text-[11px] text-neutral-600">
                      <span>Balance on Cash on Delivery:</span>
                      <span className="font-bold text-neutral-900">৳{balanceDueOnDelivery}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-neutral-900 text-white rounded-2xl text-xs sm:text-sm font-bold tracking-widest uppercase hover:bg-neutral-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-[#C5A880]" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} className="text-[#C5A880]" />
                    <span>Confirm & Place Order</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-neutral-400">
                🔒 Your order is safe. Once placed, our team will review your payment attachment and send an email confirmation.
              </p>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
}
