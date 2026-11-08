import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import ThankYouModal from './components/ThankYouModal';
import CustomerAccountModal from './components/CustomerAccountModal';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Footer from './components/Footer';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { getProducts, getSettings, trackVisit } from './services/api';
import { SlidersHorizontal, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  // Store Settings & Products
  const [settings, setSettings] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Customer Cart & Modals
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('stitchy_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [appliedPromo, setAppliedPromo] = useState(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [customerAccountModalOpen, setCustomerAccountModalOpen] = useState(false);

  // Customer Gmail User Session
  const [customerUser, setCustomerUser] = useState(() => {
    try {
      const saved = localStorage.getItem('stitchy_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const handleCustomerLoginSuccess = (user) => {
    setCustomerUser(user);
    localStorage.setItem('stitchy_customer_user', JSON.stringify(user));
  };

  const handleCustomerLogout = () => {
    setCustomerUser(null);
    localStorage.removeItem('stitchy_customer_user');
  };

  // Admin Auth & Portal View
  const [viewMode, setViewMode] = useState('store'); // 'store', 'admin_login', 'admin_dashboard'
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('stitchy_admin_token') || '');
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const u = localStorage.getItem('stitchy_admin_user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  });

  // Load Settings and Initial Products
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [sets, prods] = await Promise.all([
          getSettings().catch(() => null),
          getProducts().catch(() => [])
        ]);
        if (sets) setSettings(sets);
        if (prods) setProducts(prods);
        // Track visitor device
        trackVisit(window.location.pathname);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('stitchy_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  // Cart Operations
  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        const newQty = copy[existingIdx].quantity + item.quantity;
        copy[existingIdx].quantity = Math.min(newQty, item.maxAvailable || 10);
        return copy;
      } else {
        return [...prev, item];
      }
    });
    setCartDrawerOpen(true);
  };

  const handleUpdateQty = (productId, size, color, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId, size, color);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId && item.size === size && item.color === color
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const handleRemoveItem = (productId, size, color) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.size === size && item.color === color)
      )
    );
  };

  const handleOrderSuccess = (order) => {
    setCheckoutModalOpen(false);
    setCart([]);
    setAppliedPromo(null);
    setCompletedOrder(order);
    // Reload products to reflect deducted stock
    getProducts().then(setProducts).catch(console.error);
  };

  // Admin Auth Handlers
  const handleLoginSuccess = (token, user) => {
    setAdminToken(token);
    setAdminUser(user);
    localStorage.setItem('stitchy_admin_token', token);
    localStorage.setItem('stitchy_admin_user', JSON.stringify(user));
    setViewMode('admin_dashboard');
  };

  const handleLogout = () => {
    setAdminToken('');
    setAdminUser(null);
    localStorage.removeItem('stitchy_admin_token');
    localStorage.removeItem('stitchy_admin_user');
    try {
      window.history.pushState(null, '', '/');
    } catch (e) {}
    setViewMode('store');
  };

  const handleOpenAdminPortal = () => {
    try {
      window.history.pushState(null, '', '/admin');
    } catch (e) {}
    if (adminToken && adminUser) {
      setViewMode('admin_dashboard');
    } else {
      setViewMode('admin_login');
    }
  };

  const handleBackToStore = () => {
    try {
      window.history.pushState(null, '', '/');
    } catch (e) {}
    setViewMode('store');
  };

  // Listen for direct URL routes (/admin, #admin, ?admin=true) and secret keyboard shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const checkAdminRoute = () => {
      const isPathAdmin = 
        window.location.pathname.startsWith('/admin') ||
        window.location.hash === '#admin' ||
        window.location.search.includes('admin=true');
      if (isPathAdmin) {
        if (adminToken && adminUser) {
          setViewMode('admin_dashboard');
        } else {
          setViewMode('admin_login');
        }
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);

    const handleKeyDown = (e) => {
      // Secret key combination: Ctrl + Shift + A (or Cmd + Shift + A)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        handleOpenAdminPortal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [adminToken, adminUser]);

  // Filtered & Sorted Products
  let displayedProducts = [...products];

  if (selectedCategory && selectedCategory !== 'All') {
    displayedProducts = displayedProducts.filter(
      (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedProducts = displayedProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
  }

  if (sortBy === 'price_asc') {
    displayedProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    displayedProducts.sort((a, b) => b.price - a.price);
  }

  // ==================== ADMIN VIEW ROUTING ====================
  if (viewMode === 'admin_login') {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        onBackToStore={handleBackToStore}
      />
    );
  }

  if (viewMode === 'admin_dashboard') {
    return (
      <AdminDashboard
        token={adminToken}
        user={adminUser}
        onLogout={handleLogout}
        onBackToStore={handleBackToStore}
        settings={settings}
        onSettingsUpdated={(updated) => setSettings(updated)}
      />
    );
  }

  // ==================== STOREFRONT CUSTOMER VIEW ====================
  const totalCartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAFAF8] text-neutral-900">
      
      {/* Sticky Header & Navbar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setCartDrawerOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAdmin={handleOpenAdminPortal}
        onOpenAccount={() => setCustomerAccountModalOpen(true)}
        customerUser={customerUser}
        settings={settings}
      />

      {/* Main Content */}
      <main className="flex-1">
        
        {/* Editorial Hero */}
        <Hero
          onExplore={() => {
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          settings={settings}
        />

        {/* Catalog Section */}
        <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          
          {/* Section Header & Filters */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E8E5DF]">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#8C7A6B] uppercase mb-1">
                <Sparkles size={13} className="text-[#C5A880]" />
                <span>Export Consignment Surplus</span>
              </div>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-neutral-900">
                {selectedCategory === 'All' ? 'All Pure Export Pieces' : selectedCategory}
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Showing {displayedProducts.length} authentic export garments ready for 24-48h dispatch.
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-medium px-3 py-2 bg-white border border-[#D5CEC5] rounded-xl focus:outline-none focus:border-neutral-900 text-neutral-800 shadow-2xs"
              >
                <option value="featured">Featured Export Pieces</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="mt-8">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="aspect-[4/5] bg-neutral-200 rounded-2xl"></div>
                ))}
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#F4EFEB] flex items-center justify-center mx-auto text-[#8C7A6B]">
                  <AlertCircle size={28} />
                </div>
                <h3 className="font-serif-luxury text-lg font-bold text-neutral-900">
                  No export garments found
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  No items matched your current filter or search criteria.
                </p>
                <button
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                  className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
                    onQuickAdd={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>

        </section>

      </main>

      {/* Customer Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenAdmin={handleOpenAdminPortal}
        settings={settings}
      />

      {/* Modals & Drawers */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onProceedCheckout={() => {
          setCartDrawerOpen(false);
          setCheckoutModalOpen(true);
        }}
        appliedPromo={appliedPromo}
        onApplyPromo={(promo) => setAppliedPromo(promo)}
        onRemovePromo={() => setAppliedPromo(null)}
      />

      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        cartItems={cart}
        appliedPromo={appliedPromo}
        settings={settings}
        onOrderSuccess={handleOrderSuccess}
      />

      <ThankYouModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        onContinueShopping={() => setCompletedOrder(null)}
      />

      {/* Customer Account & Order Tracking with Gmail */}
      <CustomerAccountModal
        isOpen={customerAccountModalOpen}
        onClose={() => setCustomerAccountModalOpen(false)}
        customerUser={customerUser}
        onLoginSuccess={handleCustomerLoginSuccess}
        onLogout={handleCustomerLogout}
        settings={settings}
      />

      {/* Floating WhatsApp Widget */}
      <FloatingWhatsApp
        whatsappUrl={settings?.whatsappUrl}
        whatsappNumber={settings?.whatsappNumber}
      />

      {/* Mobile Sticky Bottom Bar (when cart has items) */}
      {totalCartCount > 0 && !cartDrawerOpen && !checkoutModalOpen && (
        <div className="md:hidden fixed bottom-4 inset-x-4 z-40 animate-slideUp">
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="w-full py-3.5 px-5 bg-neutral-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl flex items-center justify-between border border-neutral-700 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#C5A880] text-neutral-950 font-bold text-xs flex items-center justify-center">
                {totalCartCount}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">View Bag</span>
            </div>
            <div className="text-xs font-bold text-[#C5A880]">
              ৳{cart.reduce((a, b) => a + b.price * b.quantity, 0)} • Checkout →
            </div>
          </button>
        </div>
      )}

    </div>
  );
}
