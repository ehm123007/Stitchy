import React, { useState, useEffect } from 'react';
import { 
  X, User, ShoppingBag, Clock, CheckCircle2, Truck, 
  MapPin, LogOut, ExternalLink, Mail, MessageCircle, AlertCircle, Loader2 
} from 'lucide-react';
import { customerGoogleLogin, getCustomerOrders } from '../services/api';

export default function CustomerAccountModal({
  isOpen,
  onClose,
  customerUser,
  onLoginSuccess,
  onLogout,
  settings
}) {
  if (!isOpen) return null;

  const [inputEmail, setInputEmail] = useState('');
  const [inputName, setInputName] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // When logged in, fetch orders
  useEffect(() => {
    if (customerUser?.email) {
      setOrdersLoading(true);
      getCustomerOrders(customerUser.email)
        .then(setOrders)
        .catch(console.error)
        .finally(() => setOrdersLoading(false));
    }
  }, [customerUser]);

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    if (!inputEmail.trim()) {
      setErrorMsg('Please enter your Gmail address');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await customerGoogleLogin({
        email: inputEmail.trim(),
        name: inputName.trim() || inputEmail.split('@')[0],
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(inputName || inputEmail)}&background=121212&color=C5A880`
      });
      onLoginSuccess(res.user);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const whatsappLink = (order) => {
    const text = encodeURIComponent(
      `Assalamu Alaikum STITCHY! Inquiring about my order #${order.referenceNo} (${order.customer?.name}). Status: ${order.status}`
    );
    return `https://api.whatsapp.com/send/?phone=8801875413743&text=${text}&type=phone_number&app_absent=0`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full border border-[#E8E5DF] shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#FAF8F5] border-b border-[#E8E5DF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-900 text-[#C5A880] flex items-center justify-center font-bold">
              {customerUser ? (
                <img src={customerUser.picture} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User size={18} />
              )}
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg font-bold text-neutral-900">
                {customerUser ? `Welcome, ${customerUser.name}` : 'Customer Account & Order Tracking'}
              </h3>
              <p className="text-xs text-neutral-500">
                {customerUser ? customerUser.email : 'Log in with Gmail to view and track your orders across all your devices.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-black rounded-full hover:bg-neutral-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {!customerUser ? (
            /* Login Form */
            <div className="max-w-md mx-auto space-y-6 py-4">
              
              {/* Google Sign-in Card */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-[#D5CEC5] shadow-xs">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <h4 className="font-serif-luxury text-xl font-bold text-neutral-900">
                  Instant Google / Gmail Login
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Enter your Gmail to automatically access all orders you placed on Facebook, Instagram, or TikTok from any mobile phone or PC.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleGoogleSignIn} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-neutral-800 uppercase tracking-wider mb-1">
                    Your Gmail Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full p-3 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 uppercase tracking-wider mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full p-3 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-neutral-900 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin text-[#C5A880]" />
                  ) : (
                    <span>Sign In With Gmail Profile</span>
                  )}
                </button>
              </form>

              <div className="text-[11px] text-center text-neutral-400">
                🔒 Synced with your order history across phone, tablet, and PC.
              </div>

            </div>
          ) : (
            /* Logged in view: Orders List */
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                  <ShoppingBag size={15} className="text-[#8C7A6B]" />
                  <span>My Pure Export Orders ({orders.length})</span>
                </h4>

                <button
                  onClick={onLogout}
                  className="text-xs text-neutral-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>

              {ordersLoading ? (
                <div className="p-12 text-center text-xs text-neutral-400">Loading your orders...</div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF8F5] rounded-2xl border border-[#E8E5DF] space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto text-neutral-400 border border-[#D5CEC5]">
                    <ShoppingBag size={20} />
                  </div>
                  <h5 className="font-bold text-sm text-neutral-800">No orders found for this email</h5>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    When you order with <b>{customerUser.email}</b>, your shipments, tracking, and receipts will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E5DF] space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E5DF] pb-2.5">
                        <div>
                          <span className="font-mono font-bold text-sm text-neutral-900">
                            #{order.referenceNo}
                          </span>
                          <span className="text-[10px] text-neutral-500 ml-2">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Delivered' ? 'bg-green-100 text-green-900' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5 text-xs">
                        {order.items?.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-neutral-800">
                              {it.title} <span className="text-neutral-500 font-semibold">({it.size}, {it.color})</span> x{it.quantity}
                            </span>
                            <span className="font-bold font-mono text-neutral-900">৳{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Price & COD info */}
                      <div className="pt-2 border-t border-[#E8E5DF] flex flex-wrap items-center justify-between text-xs gap-2">
                        <div className="text-[11px] text-neutral-600">
                          Total: <b>৳{order.total}</b> • Advance Paid: <b className="text-emerald-700">৳{order.advancePaid}</b>
                          {order.balanceDue > 0 && (
                            <span className="ml-2 font-bold text-neutral-900">Due at Doorstep: ৳{order.balanceDue}</span>
                          )}
                        </div>

                        {/* WhatsApp support trigger */}
                        <a
                          href={whatsappLink(order)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 hover:opacity-90 transition-opacity shadow-xs"
                        >
                          <MessageCircle size={13} />
                          <span>Track via WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
