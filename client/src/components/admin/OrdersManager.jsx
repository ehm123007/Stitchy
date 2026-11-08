import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, CheckCircle2, Clock, Truck, XCircle, AlertTriangle, 
  ExternalLink, Mail, Phone, MapPin, Printer, Filter, ZoomIn, Check, MessageCircle, Trash2
} from 'lucide-react';
import { getOrders, updateOrderStatus, sendOrderEmail, deleteOrder, clearAllOrders } from '../../services/api';
import CourierSlipModal from '../CourierSlipModal';

export default function OrdersManager({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [courierPrintOrder, setCourierPrintOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [screenshotLightbox, setScreenshotLightbox] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [emailSuccessModal, setEmailSuccessModal] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders({ status: statusFilter, search: searchQuery }, token);
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, token]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await updateOrderStatus(orderId, newStatus, selectedOrder?.adminNotes || '', token);
      setSelectedOrder(res.order);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
    } catch (err) {
      alert(err.message || 'Error updating order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendEmail = async (orderId) => {
    try {
      const res = await sendOrderEmail(orderId, token);
      setEmailSuccessModal(res);
      // reload order to reflect emailSent: true
      const updated = { ...selectedOrder, emailSent: true };
      setSelectedOrder(updated);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      alert(err.message || 'Failed to dispatch email');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    try {
      await deleteOrder(orderId, token);
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      alert(err.message || 'Failed to delete order');
    }
  };

  const handleClearAllOrders = async () => {
    if (!window.confirm('⚠️ Are you sure you want to delete ALL orders? This will wipe all sample/test orders permanently.')) return;
    try {
      await clearAllOrders(token);
      setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      alert(err.message || 'Failed to clear orders');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending Verification':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock size={12} />
            Pending Verification
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={12} />
            Confirmed
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Truck size={12} />
            Shipped
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-900 border border-green-300">
            <Check size={12} />
            Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
            <XCircle size={12} />
            Cancelled
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded text-xs bg-neutral-100 text-neutral-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E5DF]">
        <div>
          <h2 className="font-serif-luxury text-xl font-bold text-neutral-900">
            Customer Orders & Proof Verifications
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage incoming orders, verify Bangla QR screenshot proofs, and confirm shipments.
          </p>
        </div>

        {/* Filter Pills & Google Export */}
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Pending Verification', 'Confirmed', 'Shipped', 'Delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                statusFilter === st
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200'
              }`}
            >
              {st}
            </button>
          ))}

          <a
            href="/api/orders/export-csv"
            target="_blank"
            download
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#121212] text-white hover:bg-neutral-800 transition-all flex items-center gap-1.5 shadow-xs"
            title="Export orders for Google Sheets / Google Drive"
          >
            <ExternalLink size={12} className="text-[#C5A880]" />
            <span>Export to Google Sheets / Drive</span>
          </a>

          {orders.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllOrders}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all flex items-center gap-1.5 shadow-xs"
              title="Delete all sample/test orders"
            >
              <Trash2 size={12} />
              <span>Clear Test Orders</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID (e.g. STY-2026), customer name, phone, or TrxID..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-[#D5CEC5] rounded-xl focus:outline-none focus:border-neutral-900"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-all"
        >
          Search
        </button>
      </form>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-600">
            <thead className="bg-[#FAF8F5] text-neutral-900 uppercase font-bold text-[10px] tracking-wider border-b border-[#E8E5DF]">
              <tr>
                <th className="py-3.5 px-4">Order ID & Date/Time</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Zone & Address</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Payment & Proof</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0ECE6]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const dateStr = new Date(order.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  });

                  return (
                    <tr key={order.id} className="hover:bg-neutral-50/80 transition-colors">
                      {/* ID & Date */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-neutral-900">#{order.referenceNo}</div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          <Clock size={11} />
                          {dateStr}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900">{order.customer?.name}</div>
                        <div className="text-neutral-500 font-mono text-[11px] flex items-center gap-1">
                          <Phone size={10} />
                          {order.customer?.phone}
                        </div>
                        {order.customer?.email ? (
                          <a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(order.customer.email)}&su=${encodeURIComponent(`Order Update #${order.referenceNo} - STITCHY Pure Export`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-red-700 hover:text-red-900 text-[10px] truncate max-w-[140px] flex items-center gap-1 font-medium underline mt-0.5"
                            title="Compose directly in Gmail"
                          >
                            <Mail size={10} className="shrink-0" />
                            <span className="truncate">{order.customer.email}</span>
                          </a>
                        ) : (
                          <span className="text-neutral-400 text-[10px] italic">No email</span>
                        )}
                      </td>

                      {/* Zone & Address */}
                      <td className="py-3.5 px-4 max-w-[180px]">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1 ${
                          order.customer?.deliveryZone === 'inside'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}>
                          {order.customer?.deliveryZone === 'inside' ? 'Dhaka Metro (৳70)' : 'Outside Dhaka (৳130)'}
                        </span>
                        <div className="truncate text-neutral-700" title={order.customer?.address}>
                          {order.customer?.address}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-neutral-800">
                          {order.items?.length} item{order.items?.length > 1 ? 's' : ''}
                        </div>
                        <div className="text-[10px] text-neutral-400 line-clamp-1 max-w-[120px]">
                          {order.items?.map(i => `${i.title} (${i.size})`).join(', ')}
                        </div>
                      </td>

                      {/* Payment Proof */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {order.paymentProofScreenshot ? (
                            <button
                              onClick={() => setScreenshotLightbox(order.paymentProofScreenshot)}
                              className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#D5CEC5] hover:opacity-80 transition-opacity group"
                              title="Click to view payment proof screenshot"
                            >
                              <img src={order.paymentProofScreenshot} alt="Proof" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white">
                                <ZoomIn size={12} />
                              </div>
                            </button>
                          ) : (
                            <span className="text-[10px] text-neutral-400 italic">No file</span>
                          )}

                          <div>
                            <div className="text-[11px] font-bold text-neutral-800">
                              {order.paymentMethod === 'bangla_qr_full' ? 'Full Prepay' : 'COD Advance'}
                            </div>
                            {order.transactionId && (
                              <div className="font-mono text-[10px] text-emerald-700 font-semibold truncate max-w-[100px]">
                                {order.transactionId}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900 text-sm">৳{order.total}</div>
                        <div className="text-[10px] text-emerald-700">Paid: ৳{order.advancePaid}</div>
                        {order.balanceDue > 0 && (
                          <div className="text-[10px] text-neutral-500">Due: ৳{order.balanceDue}</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setCourierPrintOrder(order)}
                          className="px-2.5 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition-all inline-flex items-center gap-1 shadow-xs"
                          title="Print Courier Strip (1/4 A4 size)"
                        >
                          <Printer size={12} className="text-[#C5A880]" />
                          <span>Slip</span>
                        </button>

                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-800 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 shadow-xs"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>

                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center"
                          title="Delete Order"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Order Inspector Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#E8E5DF] overflow-hidden my-auto max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 bg-[#FAF8F5] border-b border-[#E8E5DF] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-luxury text-xl font-bold text-neutral-900">
                    Order #{selectedOrder.referenceNo}
                  </h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-neutral-500 hover:text-black rounded-full hover:bg-neutral-200"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Payment Verification Highlight Card */}
              <div className="p-4 bg-[#F4EFEB] rounded-2xl border border-[#D5CEC5] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                
                {/* Proof screenshot preview */}
                <div className="md:col-span-4 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Bangla QR Payment Attachment
                  </span>
                  {selectedOrder.paymentProofScreenshot ? (
                    <div 
                      onClick={() => setScreenshotLightbox(selectedOrder.paymentProofScreenshot)}
                      className="cursor-pointer relative w-36 h-36 rounded-xl overflow-hidden border-2 border-neutral-800 shadow-md group"
                    >
                      <img
                        src={selectedOrder.paymentProofScreenshot}
                        alt="Proof screenshot"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn size={24} />
                      </div>
                    </div>
                  ) : (
                    <div className="w-36 h-36 rounded-xl border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 text-xs text-center p-2">
                      No screenshot uploaded
                    </div>
                  )}
                  {selectedOrder.paymentProofScreenshot && (
                    <a
                      href={selectedOrder.paymentProofScreenshot}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-neutral-800 underline mt-1.5 flex items-center gap-1 font-medium"
                    >
                      <ExternalLink size={11} />
                      Open Full Size
                    </a>
                  )}
                </div>

                {/* Payment info & One-Click Verification */}
                <div className="md:col-span-8 space-y-3">
                  <div>
                    <div className="text-xs text-neutral-500">Method:</div>
                    <div className="text-sm font-bold text-neutral-900">
                      {selectedOrder.paymentMethod === 'bangla_qr_full'
                        ? 'Bangla QR (Full Prepayment)'
                        : 'Cash on Delivery (Delivery Charge Prepaid)'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-neutral-500 block">Advance Prepaid:</span>
                      <span className="font-bold text-emerald-800 text-base">৳{selectedOrder.advancePaid}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Balance Due on COD:</span>
                      <span className="font-bold text-neutral-900 text-base">৳{selectedOrder.balanceDue}</span>
                    </div>
                  </div>

                  {selectedOrder.transactionId && (
                    <div className="text-xs bg-white p-2 rounded-lg border border-[#D5CEC5]">
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold">TrxID / Sender:</span>
                      <span className="font-mono font-bold text-emerald-900">{selectedOrder.transactionId}</span>
                    </div>
                  )}

                  {/* Verification action button */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    {selectedOrder.status === 'Pending Verification' ? (
                      <button
                        onClick={() => handleStatusChange(selectedOrder.id, 'Confirmed')}
                        disabled={updatingStatus}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md"
                      >
                        <CheckCircle2 size={14} />
                        <span>Verify Payment & Confirm Order</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 size={14} />
                        <span>Payment Verified</span>
                      </div>
                    )}

                    <button
                      onClick={() => handleSendEmail(selectedOrder.id)}
                      className="px-3 py-2 bg-white border border-[#D5CEC5] text-neutral-800 hover:bg-neutral-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Mail size={13} className="text-[#8C7A6B]" />
                      <span>{selectedOrder.emailSent ? 'Re-send Auto Email' : 'Send Auto Email'}</span>
                    </button>

                    {selectedOrder.customer?.email && (
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedOrder.customer.email)}&su=${encodeURIComponent(`Order Update #${selectedOrder.referenceNo} - STITCHY Pure Export`)}&body=${encodeURIComponent(`Assalamu Alaikum ${selectedOrder.customer.name},\n\nRegarding your pure export order #${selectedOrder.referenceNo} with STITCHY...\n\nTotal: ৳${selectedOrder.total}\nDue at Delivery (COD): ৳${selectedOrder.balanceDue}\n\nThank you,\nSTITCHY Apparel Operations`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                        title="Open Gmail to email customer directly"
                      >
                        <ExternalLink size={12} />
                        <span>Compose in Gmail Web</span>
                      </a>
                    )}
                  </div>
                </div>

              </div>

              {/* Customer and Delivery details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="p-4 bg-white rounded-2xl border border-[#E8E5DF] space-y-2">
                  <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
                    <Phone size={13} className="text-[#8C7A6B]" />
                    Customer Details
                  </h4>
                  <div className="space-y-1">
                    <p><span className="text-neutral-400">Name:</span> <b className="text-neutral-800">{selectedOrder.customer?.name}</b></p>
                    <p><span className="text-neutral-400">Phone:</span> <b className="font-mono text-neutral-800">{selectedOrder.customer?.phone}</b></p>
                    <p><span className="text-neutral-400">Email:</span> <span className="text-neutral-700">{selectedOrder.customer?.email || 'N/A'}</span></p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E8E5DF] space-y-2">
                  <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
                    <MapPin size={13} className="text-[#8C7A6B]" />
                    Delivery Destination
                  </h4>
                  <div className="space-y-1">
                    <p><span className="text-neutral-400">Zone:</span> <b className="text-neutral-800">{selectedOrder.customer?.deliveryZone === 'inside' ? 'Inside Dhaka Metropolitan' : 'Outside Dhaka'}</b></p>
                    <p><span className="text-neutral-400">Address:</span> <span className="text-neutral-800">{selectedOrder.customer?.address}</span></p>
                    {selectedOrder.customer?.landmark && (
                      <p><span className="text-neutral-400">Landmark:</span> <span className="text-neutral-700">{selectedOrder.customer.landmark}</span></p>
                    )}
                    <p><span className="text-neutral-400">City / Postal:</span> <span className="text-neutral-700">{selectedOrder.customer?.city} - {selectedOrder.customer?.postalCode}</span></p>
                  </div>
                </div>

              </div>

              {/* Items List */}
              <div className="p-4 bg-white rounded-2xl border border-[#E8E5DF] space-y-3">
                <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">
                  Ordered Items ({selectedOrder.items?.length})
                </h4>

                <div className="divide-y divide-[#F0ECE6]">
                  {selectedOrder.items?.map((it, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        {it.image && (
                          <img src={it.image} alt="" className="w-12 h-14 object-cover rounded-lg border border-[#E8E5DF]" />
                        )}
                        <div>
                          <div className="font-bold text-neutral-900">{it.title}</div>
                          <div className="text-[11px] text-neutral-500">
                            Size: <span className="font-semibold text-neutral-800">{it.size}</span> • Color: {it.color} • Qty: {it.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-neutral-900">৳{it.price * it.quantity}</div>
                        <div className="text-[10px] text-neutral-400">৳{it.price} each</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#E8E5DF] space-y-1 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal:</span>
                    <span>৳{selectedOrder.subtotal}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Promo Discount ({selectedOrder.promoCode}):</span>
                      <span>-৳{selectedOrder.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-600">
                    <span>Delivery Fee:</span>
                    <span>৳{selectedOrder.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-neutral-900 pt-1 border-t border-[#E8E5DF]">
                    <span>Total Order:</span>
                    <span>৳{selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Dropdown & Admin Notes */}
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E5DF] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                      Change Order Fulfillment Status:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Pending Verification', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(selectedOrder.id, st)}
                          disabled={updatingStatus || selectedOrder.status === st}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            selectedOrder.status === st
                              ? 'bg-neutral-900 text-white shadow-xs'
                              : 'bg-white border border-[#D5CEC5] text-neutral-700 hover:bg-neutral-100'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-[#E8E5DF] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCourierPrintOrder(selectedOrder)}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Printer size={14} className="text-[#C5A880]" />
                  <span>Print Courier Strip (1/4 A4)</span>
                </button>

                <a
                  href={`https://wa.me/880${selectedOrder.customer?.phone?.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(`Assalamu Alaikum ${selectedOrder.customer?.name}! This is STITCHY regarding your pure export order #${selectedOrder.referenceNo}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-[#25D366] text-white rounded-xl text-xs font-bold hover:opacity-90 flex items-center gap-1.5 shadow-xs"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp Customer</span>
                </a>

                <button
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  className="px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  title="Permanently remove this order"
                >
                  <Trash2 size={14} />
                  <span>Delete Order</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Courier Slip Modal (Exact 1/4 A4 Format) */}
      {courierPrintOrder && (
        <CourierSlipModal
          order={courierPrintOrder}
          onClose={() => setCourierPrintOrder(null)}
        />
      )}

      {/* Screenshot Lightbox Modal */}
      {screenshotLightbox && (
        <div 
          onClick={() => setScreenshotLightbox(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <button
              onClick={() => setScreenshotLightbox(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
            >
              <XCircle size={24} />
            </button>
            <img
              src={screenshotLightbox}
              alt="Payment screenshot full view"
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Email Dispatch Confirmation Modal */}
      {emailSuccessModal && (
        <div 
          onClick={() => setEmailSuccessModal(null)}
          className="fixed inset-0 z-60 bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 border border-[#E8E5DF] shadow-2xl"
          >
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle2 size={24} />
              <h3 className="font-serif-luxury text-lg font-bold text-neutral-900">
                Email Dispatch Recorded!
              </h3>
            </div>
            <p className="text-xs text-neutral-600">
              {emailSuccessModal.message}
            </p>

            {emailSuccessModal.emailPreviewHtml && (
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs max-h-48 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: emailSuccessModal.emailPreviewHtml }} />
              </div>
            )}

            <button
              onClick={() => setEmailSuccessModal(null)}
              className="w-full py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
