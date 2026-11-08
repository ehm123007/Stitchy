import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Power, Check, Calendar, AlertCircle } from 'lucide-react';
import { getPromos, createPromo, updatePromo, deletePromo } from '../../services/api';

export default function PromoManager({ token }) {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percent', // 'percent' or 'flat'
    value: 10,
    minOrder: 800,
    maxUses: 200,
    description: '',
    expiryDate: '2026-12-31'
  });

  const loadPromos = async () => {
    setLoading(true);
    try {
      const data = await getPromos(token);
      setPromos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, [token]);

  const handleToggleActive = async (promo) => {
    try {
      await updatePromo(promo.id, { active: !promo.active }, token);
      loadPromos();
    } catch (err) {
      alert('Error updating promo code');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promo code?')) return;
    try {
      await deletePromo(id, token);
      loadPromos();
    } catch (err) {
      alert('Error deleting promo code');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createPromo(formData, token);
      setShowAddModal(false);
      setFormData({
        code: '',
        type: 'percent',
        value: 10,
        minOrder: 800,
        maxUses: 200,
        description: '',
        expiryDate: '2026-12-31'
      });
      loadPromos();
    } catch (err) {
      alert(err.message || 'Error creating promo code');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E5DF]">
        <div>
          <h2 className="font-serif-luxury text-xl font-bold text-neutral-900">
            Campaign Promo Codes & Offers
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Declare discount promo codes for social campaigns (Facebook Live, TikTok, Eid offers).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center gap-1.5 shadow-md"
        >
          <Plus size={16} />
          <span>Create Promo Code</span>
        </button>
      </div>

      {/* Promos Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map((p) => (
          <div
            key={p.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              p.active
                ? 'bg-white border-[#E8E5DF] shadow-xs'
                : 'bg-neutral-100/70 border-neutral-200 opacity-60'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold bg-[#FAF8F5] px-3 py-1 rounded-lg border border-[#D5CEC5] text-neutral-900">
                  {p.code}
                </span>

                <button
                  onClick={() => handleToggleActive(p)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                    p.active
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  <Power size={11} />
                  <span>{p.active ? 'Active' : 'Disabled'}</span>
                </button>
              </div>

              <div>
                <div className="text-lg font-bold text-neutral-900">
                  {p.type === 'percent' ? `${p.value}% OFF` : `৳${p.value} OFF`}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {p.description || 'Special campaign discount'}
                </p>
              </div>

              <div className="pt-2 border-t border-[#F0ECE6] space-y-1 text-[11px] text-neutral-600">
                <div className="flex justify-between">
                  <span>Minimum Cart:</span>
                  <span className="font-semibold text-neutral-900">৳{p.minOrder || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Redemptions:</span>
                  <span className="font-semibold text-neutral-900">{p.currentUses || 0} / {p.maxUses} uses</span>
                </div>
                <div className="flex justify-between">
                  <span>Valid Until:</span>
                  <span className="font-mono text-neutral-700">{p.expiryDate || 'Open'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F0ECE6] flex justify-end mt-3">
              <button
                onClick={() => handleDelete(p.id)}
                className="text-neutral-400 hover:text-red-600 text-xs flex items-center gap-1 transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal to Create Promo Code */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E8E5DF] shadow-2xl space-y-4"
          >
            <h3 className="font-serif-luxury text-lg font-bold text-neutral-900 border-b border-[#E8E5DF] pb-3">
              Create New Campaign Promo Code
            </h3>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">
                  Promo Code * (e.g. EXPORT15)
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="EID2026, EXPORT20"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-800 uppercase mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-medium"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat BDT (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 uppercase mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.value}
                    onChange={(e) => setFormData((p) => ({ ...p, value: parseInt(e.target.value) || 0 }))}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-800 uppercase mb-1">
                    Min Cart Subtotal (৳)
                  </label>
                  <input
                    type="number"
                    value={formData.minOrder}
                    onChange={(e) => setFormData((p) => ({ ...p, minOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 uppercase mb-1">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData((p) => ({ ...p, maxUses: parseInt(e.target.value) || 100 }))}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">
                  Campaign Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. 15% discount for Facebook Live viewers"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-[#D5CEC5] rounded-xl font-bold text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-neutral-900 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-neutral-800"
                >
                  Publish Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
