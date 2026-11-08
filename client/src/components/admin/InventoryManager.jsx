import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Sliders, AlertCircle, CheckCircle2, 
  Upload, Search, History, ArrowDown, ArrowUp, X, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { 
  getProducts, createProduct, updateProduct, deleteProduct, 
  adjustStock, getInventoryLogs, uploadProductImage, clearAllProducts 
} from '../../services/api';

const defaultSizeChart = {
  'XS': { chest: '36-38"', length: '26"', sleeve: '8.5"' },
  'S': { chest: '38-40"', length: '27"', sleeve: '9.0"' },
  'M': { chest: '40-42"', length: '28"', sleeve: '9.5"' },
  'L': { chest: '42-44"', length: '29"', sleeve: '10.0"' },
  'XL': { chest: '44-46"', length: '30"', sleeve: '10.5"' },
  '2XL': { chest: '46-48"', length: '31"', sleeve: '11.0"' },
  '3XL': { chest: '48-50"', length: '32"', sleeve: '11.5"' }
};

const categorySpecPresets = {
  'T-Shirts & Tops': {
    fabric: '100% Ring-Spun Combed Cotton',
    gsm: '240 GSM (Dense & Structured)',
    cut: 'Boxy Drop-Shoulder Relaxed Fit',
    origin: 'Target Export to Europe / Scandinavia',
    washCare: 'Machine wash cold, inside out. Tumble dry low.'
  },
  'Shirts & Flannels': {
    fabric: '100% Brushed Cotton Twill',
    gsm: '210 GSM (Yarn-Dyed Plaid)',
    cut: 'Classic Overshirt / Relaxed Layering',
    origin: 'US High-Street Global Brand',
    washCare: 'Cold hand or machine wash.'
  },
  'Hoodies & Jackets': {
    fabric: '85% Cotton, 15% Poly Fleece Anti-Pilling',
    gsm: '380 GSM Ultra-Heavy',
    cut: 'Tailored Streetwear Cut',
    origin: 'Northern European Winter Export',
    washCare: 'Gentle cycle, dry flat.'
  },
  'Pants & Bottoms': {
    fabric: '55% French Linen, 45% Combed Cotton',
    gsm: '180-220 GSM Breathable Twill',
    cut: 'Relaxed Tapered Fit with Drawstring',
    origin: 'Southern Europe Summer Export',
    washCare: 'Machine wash cold.'
  }
};

export default function InventoryManager({ token }) {
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' or 'logs'
  const [searchQuery, setSearchQuery] = useState('');

  // Product Create/Edit Modal state
  const [editingProduct, setEditingProduct] = useState(null); // null = add new or object = edit
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Manual Stock Adjust Modal state
  const [stockAdjustModal, setStockAdjustModal] = useState(null);
  const [adjustFormData, setAdjustFormData] = useState({
    size: '',
    quantity: 1,
    type: 'deduct', // 'add' or 'deduct'
    reason: 'Sold on Facebook Live / Instagram'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const prods = await getProducts({ search: searchQuery });
      setProducts(prods);
      const auditLogs = await getInventoryLogs(token);
      setLogs(auditLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, token]);

  const handleOpenAddModal = () => {
    const initialCategory = 'T-Shirts & Tops';
    const initialSpecs = categorySpecPresets[initialCategory] || {
      fabric: '100% Ring-Spun Combed Cotton',
      gsm: '240 GSM (Dense & Structured)',
      cut: 'Boxy Drop-Shoulder Relaxed Fit',
      origin: 'Target Export to Europe / Scandinavia',
      washCare: 'Machine wash cold, inside out. Tumble dry low.'
    };

    setEditingProduct({
      title: '',
      subtitle: '100% Exported Clothes',
      category: initialCategory,
      price: '',
      originalPrice: '',
      badge: 'Global Brand',
      colors: 'Charcoal, Ivory',
      sizes: [
        { size: 'XS', stock: 5 },
        { size: 'S', stock: 10 },
        { size: 'M', stock: 15 },
        { size: 'L', stock: 15 },
        { size: 'XL', stock: 10 },
        { size: '2XL', stock: 5 },
        { size: '3XL', stock: 5 }
      ],
      images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'],
      description: 'Crafted with heavyweight 240+ GSM pure export combed cotton from global retail brands.',
      specs: { ...initialSpecs },
      sizeChart: { ...defaultSizeChart },
      featured: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct({
      ...prod,
      colors: Array.isArray(prod.colors) ? prod.colors.join(', ') : prod.colors,
      specs: {
        fabric: prod.specs?.fabric || '',
        gsm: prod.specs?.gsm || '',
        cut: prod.specs?.cut || '',
        origin: prod.specs?.origin || '',
        washCare: prod.specs?.washCare || ''
      },
      sizeChart: prod.sizeChart || { ...defaultSizeChart }
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editingProduct,
        price: Number(editingProduct.price),
        originalPrice: Number(editingProduct.originalPrice || editingProduct.price),
        specs: {
          fabric: editingProduct.specs?.fabric || '100% Export Grade Cotton',
          gsm: editingProduct.specs?.gsm || '240 GSM',
          cut: editingProduct.specs?.cut || 'Modern Comfort Fit',
          origin: editingProduct.specs?.origin || 'Global Brand Consignment',
          washCare: editingProduct.specs?.washCare || 'Machine wash cold'
        },
        colors: typeof editingProduct.colors === 'string'
          ? editingProduct.colors.split(',').map((c) => c.trim()).filter(Boolean)
          : editingProduct.colors
      };

      if (editingProduct.id) {
        await updateProduct(editingProduct.id, payload, token);
      } else {
        await createProduct(payload, token);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Error saving product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id, token);
      loadData();
    } catch (err) {
      alert(err.message || 'Error deleting product');
    }
  };

  const handleClearAllProducts = async () => {
    if (!window.confirm('⚠️ Are you sure you want to delete ALL sample products? This will completely empty the catalog so you can start fresh.')) return;
    try {
      await clearAllProducts(token);
      loadData();
    } catch (err) {
      alert(err.message || 'Error clearing products');
    }
  };

  const handleStockAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!stockAdjustModal) return;
    try {
      await adjustStock(stockAdjustModal.id, adjustFormData, token);
      setStockAdjustModal(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Error adjusting stock');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadProductImage(file, token);
      setEditingProduct((prev) => ({
        ...prev,
        images: [res.url, ...(prev.images || [])]
      }));
    } catch (err) {
      alert('Failed to upload image');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E5DF]">
        <div>
          <h2 className="font-serif-luxury text-xl font-bold text-neutral-900">
            Inventory & Catalog Management
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Automatic stock deduction upon checkout. Manual additions or deductions for Facebook Live & TikTok sales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#F4EFEB] p-1 rounded-xl border border-[#E8E5DF]">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'catalog' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500'
              }`}
            >
              Clothes Catalog ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'logs' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500'
              }`}
            >
              Stock Audit Trail ({logs.length})
            </button>
          </div>

          {products.length > 0 && (
            <button
              onClick={handleClearAllProducts}
              className="px-3.5 py-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              title="Delete all sample products from store"
            >
              <Trash2 size={14} />
              <span>Clear Sample Products</span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center gap-1.5 shadow-md"
          >
            <Plus size={16} />
            <span>Add New Clothes</span>
          </button>
        </div>
      </div>

      {activeTab === 'catalog' ? (
        <>
          {/* Search bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter clothes by title, fabric, or category..."
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-[#D5CEC5] rounded-xl focus:outline-none focus:border-neutral-900"
            />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((prod) => {
              const isOut = prod.totalStock <= 0;
              const isLow = prod.totalStock > 0 && prod.totalStock <= 5;

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* Image & Quick badges */}
                    <div className="relative h-48 bg-[#F4EFEB] overflow-hidden">
                      <img
                        src={prod.images?.[0] || ''}
                        alt={prod.title}
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-neutral-900 text-white rounded">
                          {prod.category}
                        </span>
                        {prod.badge && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-[#C5A880] text-neutral-950 rounded">
                            {prod.badge}
                          </span>
                        )}
                      </div>

                      {/* Stock Pill */}
                      <div className="absolute bottom-2 right-2">
                        {isOut ? (
                          <span className="px-2 py-1 text-[10px] font-bold bg-red-600 text-white rounded-full">
                            Sold Out (0)
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-1 text-[10px] font-bold bg-amber-500 text-white rounded-full flex items-center gap-1">
                            <AlertCircle size={10} />
                            Low Stock ({prod.totalStock})
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-[10px] font-bold bg-emerald-600 text-white rounded-full">
                            {prod.totalStock} in stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-serif-luxury text-base font-bold text-neutral-900 line-clamp-1">
                          {prod.title}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                          {prod.subtitle || prod.specs?.gsm || '100% Exported Clothes'}
                        </p>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-neutral-900">৳{prod.price}</span>
                        {prod.originalPrice && (
                          <span className="text-xs text-neutral-400 line-through">৳{prod.originalPrice}</span>
                        )}
                      </div>

                      {/* Size Stock Breakdown */}
                      <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8E5DF] space-y-1.5">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                          Stock Levels per Size:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {prod.sizes?.map((s) => (
                            <span
                              key={s.size}
                              className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                                s.stock <= 0
                                  ? 'bg-red-50 text-red-600 border border-red-200 line-through'
                                  : s.stock <= 3
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-white text-neutral-800 border border-[#D5CEC5]'
                              }`}
                            >
                              <b>{s.size}:</b> {s.stock} pcs
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Garment Specifications Preview */}
                      {prod.specs && (
                        <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-white p-2.5 rounded-xl border border-[#E8E5DF]">
                          <div>
                            <span className="text-neutral-400 block font-bold uppercase text-[9px]">Fabric</span>
                            <span className="font-semibold text-neutral-800 line-clamp-1">{prod.specs.fabric || '—'}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block font-bold uppercase text-[9px]">Density / GSM</span>
                            <span className="font-semibold text-neutral-800 line-clamp-1 font-mono">{prod.specs.gsm || '—'}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block font-bold uppercase text-[9px]">Cut / Fit</span>
                            <span className="font-semibold text-neutral-800 line-clamp-1">{prod.specs.cut || '—'}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block font-bold uppercase text-[9px]">Export To</span>
                            <span className="font-semibold text-[#8C7A6B] line-clamp-1">{prod.specs.origin || '—'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-3 bg-[#FAF8F5] border-t border-[#E8E5DF] flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setStockAdjustModal(prod);
                        setAdjustFormData({
                          size: prod.sizes?.[0]?.size || 'M',
                          quantity: 1,
                          type: 'deduct',
                          reason: 'Sold on Facebook Live / TikTok DM'
                        });
                      }}
                      className="px-3 py-1.5 bg-[#C5A880] text-neutral-950 rounded-lg text-xs font-bold hover:bg-[#d8bc94] transition-all flex items-center gap-1 shadow-xs"
                      title="Adjust Stock for Outside Website Sales"
                    >
                      <Sliders size={13} />
                      <span>Adjust Stock</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(prod)}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Inventory Audit Trail Tab */
        <div className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E8E5DF] bg-[#FAF8F5] flex items-center gap-2">
            <History size={16} className="text-[#8C7A6B]" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800">
              Audit Logs of All Automatic & Manual Stock Movements
            </h3>
          </div>
          <div className="divide-y divide-[#F0ECE6]">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">No logs recorded yet.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-neutral-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      log.quantity > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {log.quantity > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </div>
                    <div>
                      <div className="font-bold text-neutral-900">{log.productTitle}</div>
                      <div className="text-[11px] text-neutral-500">
                        {log.reason} • Size: <span className="font-bold text-neutral-700">{log.size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-mono font-bold ${log.quantity > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {log.quantity > 0 ? `+${log.quantity}` : log.quantity} pcs
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      {new Date(log.date).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Manual Stock Adjust Modal */}
      {stockAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E8E5DF] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3">
              <div>
                <h3 className="font-serif-luxury text-lg font-bold text-neutral-900">
                  Manual Stock Adjustment
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5 truncate max-w-xs">
                  {stockAdjustModal.title}
                </p>
              </div>
              <button onClick={() => setStockAdjustModal(null)} className="text-neutral-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStockAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">
                  Adjustment Type:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustFormData((p) => ({ ...p, type: 'deduct' }))}
                    className={`py-2 rounded-xl font-bold uppercase transition-all ${
                      adjustFormData.type === 'deduct'
                        ? 'bg-red-600 text-white'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    Deduct (Sold Outside)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustFormData((p) => ({ ...p, type: 'add' }))}
                    className={`py-2 rounded-xl font-bold uppercase transition-all ${
                      adjustFormData.type === 'add'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    Add (Restock)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">
                  Choose Size:
                </label>
                <select
                  value={adjustFormData.size}
                  onChange={(e) => setAdjustFormData((p) => ({ ...p, size: e.target.value }))}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-medium"
                >
                  {stockAdjustModal.sizes?.map((s) => (
                    <option key={s.size} value={s.size}>
                      Size {s.size} (Current: {s.stock} pcs left)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">
                  Quantity:
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustFormData.quantity}
                  onChange={(e) => setAdjustFormData((p) => ({ ...p, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">
                  Reason for Adjustment:
                </label>
                <input
                  type="text"
                  required
                  value={adjustFormData.reason}
                  onChange={(e) => setAdjustFormData((p) => ({ ...p, reason: e.target.value }))}
                  placeholder="e.g. Sold on Facebook Live, TikTok DM, Showroom sale, New factory lot"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStockAdjustModal(null)}
                  className="flex-1 py-2.5 border border-[#D5CEC5] rounded-xl text-neutral-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-neutral-900 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-neutral-800"
                >
                  Confirm Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full border border-[#E8E5DF] shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
          >
            <div className="p-5 border-b border-[#E8E5DF] bg-[#FAF8F5] flex items-center justify-between">
              <h3 className="font-serif-luxury text-lg font-bold text-neutral-900">
                {editingProduct.id ? 'Edit Clothes Listing' : 'Add New Pure Export Clothes'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-800 uppercase mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Heavyweight Drop-Shoulder Oversized Tee"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 uppercase mb-1">Subtitle / Fabric Tag</label>
                  <input
                    type="text"
                    value={editingProduct.subtitle}
                    onChange={(e) => setEditingProduct((p) => ({ ...p, subtitle: e.target.value }))}
                    placeholder="e.g. 240 GSM Combed Cotton • EU Consignment"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-neutral-800 uppercase">Category *</label>
                    {categorySpecPresets[editingProduct.category] && (
                      <button
                        type="button"
                        onClick={() => {
                          const preset = categorySpecPresets[editingProduct.category];
                          setEditingProduct(p => ({
                            ...p,
                            specs: { ...(p.specs || {}), ...preset }
                          }));
                        }}
                        className="text-[10px] text-[#8C7A6B] hover:text-black font-bold underline"
                        title="Auto-fill recommended specs for this category"
                      >
                        ⚡ Apply Category Specs
                      </button>
                    )}
                  </div>
                  <select
                    value={['T-Shirts & Tops', 'Shirts & Flannels', 'Hoodies & Jackets', 'Pants & Bottoms'].includes(editingProduct.category) ? editingProduct.category : 'Custom'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Custom') {
                        setEditingProduct(p => ({ ...p, category: '' }));
                      } else {
                        const preset = categorySpecPresets[val] || {};
                        setEditingProduct(p => ({
                          ...p,
                          category: val,
                          specs: { ...(p.specs || {}), ...preset }
                        }));
                      }
                    }}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-medium"
                  >
                    <option value="T-Shirts & Tops">T-Shirts & Tops</option>
                    <option value="Shirts & Flannels">Shirts & Flannels</option>
                    <option value="Hoodies & Jackets">Hoodies & Jackets</option>
                    <option value="Pants & Bottoms">Pants & Bottoms</option>
                    <option value="Custom">+ Custom Category...</option>
                  </select>
                  {!['T-Shirts & Tops', 'Shirts & Flannels', 'Hoodies & Jackets', 'Pants & Bottoms'].includes(editingProduct.category) && (
                    <input
                      type="text"
                      required
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct(p => ({ ...p, category: e.target.value }))}
                      placeholder="Type custom category name..."
                      className="w-full mt-2 p-2 bg-white border border-[#D5CEC5] rounded-xl text-xs"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 uppercase mb-1">Selling Price (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct((p) => ({ ...p, price: e.target.value }))}
                    placeholder="890"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 uppercase mb-1">Original Price (Strikethrough)</label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice}
                    onChange={(e) => setEditingProduct((p) => ({ ...p, originalPrice: e.target.value }))}
                    placeholder="1250"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-800 uppercase mb-1">Colors (Comma separated)</label>
                  <input
                    type="text"
                    value={editingProduct.colors}
                    onChange={(e) => setEditingProduct((p) => ({ ...p, colors: e.target.value }))}
                    placeholder="Vintage Charcoal, Muted Sage, Off-White"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl"
                  />
                </div>

                {/* Stock per size inputs */}
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-neutral-800 uppercase">
                      Stock by Size (XS to 3XL):
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const standardSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
                        const existingMap = new Map((editingProduct.sizes || []).map(s => [s.size, s.stock]));
                        const newSizes = standardSizes.map(sz => ({
                          size: sz,
                          stock: existingMap.has(sz) ? existingMap.get(sz) : 5
                        }));
                        setEditingProduct(p => ({ ...p, sizes: newSizes }));
                      }}
                      className="text-[11px] font-bold text-[#8C7A6B] hover:text-black underline"
                    >
                      Fill Standard XS-3XL Sizes
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {editingProduct.sizes?.map((sz, idx) => (
                      <div key={idx} className="bg-[#FAF8F5] p-2 rounded-xl border border-[#D5CEC5]">
                        <span className="font-bold text-neutral-700 block text-[11px]">Size {sz.size}:</span>
                        <input
                          type="number"
                          min="0"
                          value={sz.stock}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const copy = [...editingProduct.sizes];
                            copy[idx].stock = val;
                            setEditingProduct((p) => ({ ...p, sizes: copy }));
                          }}
                          className="w-full mt-1 p-1.5 bg-white border border-[#D5CEC5] rounded font-mono font-bold text-center"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Garment Specifications: Fabric, Density GSM, Cut/Fit, Export To */}
                <div className="sm:col-span-2 space-y-3 bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-[#D5CEC5]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#E8E5DF] pb-2.5">
                    <div>
                      <span className="font-bold text-neutral-900 uppercase block text-xs flex items-center gap-1.5">
                        🧵 Garment Specifications (Customer Viewable):
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        Shown to customers in the product details modal (Fabric, GSM, Fit, and Export destination).
                      </span>
                    </div>
                    {categorySpecPresets[editingProduct.category] && (
                      <button
                        type="button"
                        onClick={() => {
                          const preset = categorySpecPresets[editingProduct.category];
                          setEditingProduct(p => ({
                            ...p,
                            specs: { ...(p.specs || {}), ...preset }
                          }));
                        }}
                        className="text-[11px] font-bold text-[#8C7A6B] hover:text-black underline shrink-0"
                      >
                        Reset to {editingProduct.category} Defaults
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    {/* Fabric / Material */}
                    <div>
                      <label className="block font-bold text-neutral-800 uppercase text-[11px] mb-1">
                        Fabric / Material *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProduct.specs?.fabric || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingProduct((p) => ({
                            ...p,
                            specs: { ...(p.specs || {}), fabric: val }
                          }));
                        }}
                        placeholder="e.g. 100% Ring-Spun Combed Cotton"
                        className="w-full p-2.5 bg-white border border-[#D5CEC5] rounded-xl text-xs font-medium"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {['100% Combed Cotton', 'Brushed Cotton Twill', 'Cotton-Poly Fleece', 'Linen-Cotton Blend', 'Peached Cotton Shell'].map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setEditingProduct((p) => ({ ...p, specs: { ...(p.specs || {}), fabric: f } }))}
                            className="text-[9px] px-2 py-0.5 bg-white hover:bg-neutral-900 hover:text-white text-neutral-700 rounded-md border border-[#D5CEC5] transition-colors"
                          >
                            + {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Density / GSM */}
                    <div>
                      <label className="block font-bold text-neutral-800 uppercase text-[11px] mb-1">
                        Density / GSM *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProduct.specs?.gsm || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingProduct((p) => ({
                            ...p,
                            specs: { ...(p.specs || {}), gsm: val }
                          }));
                        }}
                        placeholder="e.g. 240 GSM (Dense & Structured)"
                        className="w-full p-2.5 bg-white border border-[#D5CEC5] rounded-xl text-xs font-mono font-bold text-neutral-900"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {['180 GSM (Lightweight)', '210 GSM', '240 GSM (Heavyweight)', '280 GSM', '380 GSM Ultra-Heavy'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setEditingProduct((p) => ({ ...p, specs: { ...(p.specs || {}), gsm: g } }))}
                            className="text-[9px] px-2 py-0.5 bg-white hover:bg-neutral-900 hover:text-white text-neutral-700 rounded-md border border-[#D5CEC5] transition-colors"
                          >
                            + {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cut / Fit */}
                    <div>
                      <label className="block font-bold text-neutral-800 uppercase text-[11px] mb-1">
                        Cut / Fit *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProduct.specs?.cut || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingProduct((p) => ({
                            ...p,
                            specs: { ...(p.specs || {}), cut: val }
                          }));
                        }}
                        placeholder="e.g. Boxy Drop-Shoulder Relaxed Fit"
                        className="w-full p-2.5 bg-white border border-[#D5CEC5] rounded-xl text-xs font-medium"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {['Boxy Drop-Shoulder', 'Classic Overshirt Fit', 'Tailored Streetwear Cut', 'Relaxed Tapered Fit', 'Regular Smart-Casual'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setEditingProduct((p) => ({ ...p, specs: { ...(p.specs || {}), cut: c } }))}
                            className="text-[9px] px-2 py-0.5 bg-white hover:bg-neutral-900 hover:text-white text-neutral-700 rounded-md border border-[#D5CEC5] transition-colors"
                          >
                            + {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Export To / Origin */}
                    <div>
                      <label className="block font-bold text-neutral-800 uppercase text-[11px] mb-1">
                        Export To / Origin Destination *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProduct.specs?.origin || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingProduct((p) => ({
                            ...p,
                            specs: { ...(p.specs || {}), origin: val }
                          }));
                        }}
                        placeholder="e.g. Target Export to Scandinavia / Germany"
                        className="w-full p-2.5 bg-white border border-[#D5CEC5] rounded-xl text-xs font-medium"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {['Target Export to Europe / Scandinavia', 'US High-Street Global Brand', 'UK / British Heritage Brand', 'Southern Europe Summer Export'].map((o) => (
                          <button
                            key={o}
                            type="button"
                            onClick={() => setEditingProduct((p) => ({ ...p, specs: { ...(p.specs || {}), origin: o } }))}
                            className="text-[9px] px-2 py-0.5 bg-white hover:bg-neutral-900 hover:text-white text-neutral-700 rounded-md border border-[#D5CEC5] transition-colors"
                          >
                            + {o}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Wash Care Instructions */}
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-neutral-800 uppercase text-[11px] mb-1">
                        Wash Care Instructions (Optional)
                      </label>
                      <input
                        type="text"
                        value={editingProduct.specs?.washCare || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingProduct((p) => ({
                            ...p,
                            specs: { ...(p.specs || {}), washCare: val }
                          }));
                        }}
                        placeholder="e.g. Machine wash cold, inside out. Tumble dry low."
                        className="w-full p-2.5 bg-white border border-[#D5CEC5] rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Individual Size Chart Measurements for this product */}
                <div className="sm:col-span-2 space-y-2 bg-[#FAF8F5] p-4 rounded-2xl border border-[#D5CEC5]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="font-bold text-neutral-900 uppercase block text-xs">
                        📏 Individual Size Chart Measurements (Inches):
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        Customize exact measurements for this specific garment shown to customers.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingProduct((p) => ({ ...p, sizeChart: { ...defaultSizeChart } }))}
                      className="text-[11px] font-bold text-[#8C7A6B] hover:text-black underline shrink-0"
                    >
                      Pre-fill Standard Measurements
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs bg-white rounded-xl border border-[#E8E5DF] overflow-hidden">
                      <thead className="bg-neutral-100 font-bold text-[10px] uppercase text-neutral-700 border-b border-[#E8E5DF]">
                        <tr>
                          <th className="py-2 px-3">Size</th>
                          <th className="py-2 px-3">Chest / Waist</th>
                          <th className="py-2 px-3">Body Length</th>
                          <th className="py-2 px-3">Sleeve / Inseam</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E5DF]">
                        {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].map((sz) => {
                          const chart = editingProduct.sizeChart || defaultSizeChart;
                          const current = chart[sz] || defaultSizeChart[sz] || { chest: '', length: '', sleeve: '' };
                          return (
                            <tr key={sz} className="hover:bg-neutral-50">
                              <td className="py-1.5 px-3 font-bold text-neutral-900 text-xs">{sz}</td>
                              <td className="py-1.5 px-3">
                                <input
                                  type="text"
                                  value={current.chest || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditingProduct((p) => ({
                                      ...p,
                                      sizeChart: {
                                        ...(p.sizeChart || defaultSizeChart),
                                        [sz]: { ...((p.sizeChart || defaultSizeChart)[sz] || {}), chest: val }
                                      }
                                    }));
                                  }}
                                  placeholder="e.g. 40-42&quot;"
                                  className="w-full p-1 bg-[#FAF8F5] border border-[#D5CEC5] rounded text-xs font-mono"
                                />
                              </td>
                              <td className="py-1.5 px-3">
                                <input
                                  type="text"
                                  value={current.length || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditingProduct((p) => ({
                                      ...p,
                                      sizeChart: {
                                        ...(p.sizeChart || defaultSizeChart),
                                        [sz]: { ...((p.sizeChart || defaultSizeChart)[sz] || {}), length: val }
                                      }
                                    }));
                                  }}
                                  placeholder="e.g. 28&quot;"
                                  className="w-full p-1 bg-[#FAF8F5] border border-[#D5CEC5] rounded text-xs font-mono"
                                />
                              </td>
                              <td className="py-1.5 px-3">
                                <input
                                  type="text"
                                  value={current.sleeve || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditingProduct((p) => ({
                                      ...p,
                                      sizeChart: {
                                        ...(p.sizeChart || defaultSizeChart),
                                        [sz]: { ...((p.sizeChart || defaultSizeChart)[sz] || {}), sleeve: val }
                                      }
                                    }));
                                  }}
                                  placeholder="e.g. 9.5&quot;"
                                  className="w-full p-1 bg-[#FAF8F5] border border-[#D5CEC5] rounded text-xs font-mono"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Multiple Pictures Manager */}
                <div className="sm:col-span-2 space-y-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#D5CEC5]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-neutral-900 uppercase block text-xs">
                        📸 Product Photos Gallery ({editingProduct.images?.length || 0}):
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        First picture is used as the main display cover on the store. Click photo star to set as main cover.
                      </span>
                    </div>

                    <label className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shadow-xs transition-all shrink-0">
                      <Upload size={14} className="text-[#C5A880]" />
                      <span>Upload New Photo</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>

                  {/* Existing Photos Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    {editingProduct.images?.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#D5CEC5] bg-white aspect-[4/5] shadow-xs">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        
                        {/* Badges / Actions */}
                        {idx === 0 ? (
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-neutral-900 text-[#C5A880] text-[9px] font-bold rounded uppercase tracking-wider shadow">
                            Main Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...editingProduct.images];
                              const [picked] = copy.splice(idx, 1);
                              copy.unshift(picked);
                              setEditingProduct((p) => ({ ...p, images: copy }));
                            }}
                            className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 hover:bg-neutral-900 hover:text-[#C5A880] text-neutral-800 text-[9px] font-bold rounded uppercase tracking-wider shadow opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Set as Cover
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const copy = editingProduct.images.filter((_, i) => i !== idx);
                            setEditingProduct((p) => ({ ...p, images: copy }));
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove photo"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add via URL field */}
                  <div className="flex gap-2 pt-2 border-t border-[#E8E5DF]">
                    <input
                      type="text"
                      id="new-photo-url-input"
                      placeholder="Paste online image URL (https://...) and click '+ Add URL'"
                      className="flex-1 p-2 bg-white border border-[#D5CEC5] rounded-xl text-xs font-mono"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.target.value.trim();
                          if (val) {
                            setEditingProduct((p) => ({ ...p, images: [...(p.images || []), val] }));
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('new-photo-url-input');
                        if (el && el.value.trim()) {
                          setEditingProduct((p) => ({ ...p, images: [...(p.images || []), el.value.trim()] }));
                          el.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-neutral-200 hover:bg-neutral-900 hover:text-white rounded-xl text-xs font-bold transition-all shrink-0"
                    >
                      + Add URL
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-800 uppercase mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct((p) => ({ ...p, description: e.target.value }))}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E5DF] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-[#D5CEC5] text-neutral-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-neutral-800"
                >
                  Save Clothes Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
