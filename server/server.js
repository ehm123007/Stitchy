const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { readData, writeData, connectDB, isMongoConnected } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'stitchy-super-secret-key-2026';

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads & client build
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure upload directories exist
const receiptsDir = path.join(__dirname, 'uploads', 'receipts');
const productsDir = path.join(__dirname, 'uploads', 'products');
if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir, { recursive: true });
if (!fs.existsSync(productsDir)) fs.mkdirSync(productsDir, { recursive: true });

// Multer Storage Configuration
const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, receiptsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `proof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    cb(null, uniqueName);
  }
});

const productImgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `cloth_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    cb(null, uniqueName);
  }
});

const uploadReceipt = multer({
  storage: receiptStorage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

const uploadProductImg = multer({
  storage: productImgStorage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired session token.' });
    req.user = user;
    next();
  });
}

// Device detection helper
function detectDevice(userAgent = '') {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'Mobile iOS';
  if (/android/.test(ua)) return 'Mobile Android';
  if (/tablet|ipad/.test(ua)) return 'Tablet';
  if (/mobile/.test(ua)) return 'Mobile Other';
  return 'Desktop';
}

// Visitor Tracking Endpoint
app.post('/api/analytics/track', (req, res) => {
  try {
    const { path: visitPath = '/', referer = '' } = req.body;
    const ua = req.headers['user-agent'] || '';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const device = detectDevice(ua);
    const now = new Date();

    const traffic = readData('traffic.json', []);
    traffic.push({
      id: `tr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
      hour: now.getHours(),
      device,
      ip: typeof ip === 'string' ? ip.split(',')[0].trim() : '127.0.0.1',
      path: visitPath,
      referer
    });

    // Retain past 10,000 records
    if (traffic.length > 10000) traffic.splice(0, traffic.length - 10000);
    writeData('traffic.json', traffic);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== AUTH & TEAM ====================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const users = readData('users.json', []);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const validPassword = bcrypt.compareSync(password, user.passwordHash);
  if (!validPassword) return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const users = readData('users.json', []);
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.get('/api/auth/team', authenticateToken, (req, res) => {
  const users = readData('users.json', []);
  const safeUsers = users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }));
  res.json(safeUsers);
});

app.post('/api/auth/team', authenticateToken, (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });

  const users = readData('users.json', []);
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: role || 'Order Manager',
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  writeData('users.json', users);

  res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
});

app.delete('/api/auth/team/:id', authenticateToken, (req, res) => {
  const users = readData('users.json', []);
  const target = users.find(u => u.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found' });
  if (target.email === 'admin@stitchy.com') {
    return res.status(400).json({ error: 'Primary admin cannot be deleted' });
  }
  const filtered = users.filter(u => u.id !== req.params.id);
  writeData('users.json', filtered);
  res.json({ success: true, message: 'User access revoked' });
});

// ==================== STORE SETTINGS ====================
app.get('/api/settings', (req, res) => {
  const settings = readData('settings.json', {});
  res.json(settings);
});

app.put('/api/settings', authenticateToken, (req, res) => {
  const settings = readData('settings.json', {});
  const updated = { ...settings, ...req.body };
  writeData('settings.json', updated);
  res.json(updated);
});

app.post('/api/settings/upload-qr', authenticateToken, uploadReceipt.single('qrImage'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const qrUrl = `/uploads/receipts/${req.file.filename}`;
  const settings = readData('settings.json', {});
  settings.banglaQrUrl = qrUrl;
  writeData('settings.json', settings);
  res.json({ success: true, banglaQrUrl: qrUrl });
});

// ==================== PRODUCTS & INVENTORY ====================
app.get('/api/products', (req, res) => {
  let products = readData('products.json', []);
  const { category, search, featured, in_stock } = req.query;

  if (category && category !== 'All') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }
  if (featured === 'true') {
    products = products.filter(p => p.featured);
  }
  if (in_stock === 'true') {
    products = products.filter(p => p.totalStock > 0);
  }

  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const products = readData('products.json', []);
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Upload product image
app.post('/api/upload/product', authenticateToken, uploadProductImg.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/products/${req.file.filename}`;
  res.json({ url });
});

// Create product
app.post('/api/products', authenticateToken, (req, res) => {
  const {
    title,
    subtitle,
    category,
    price,
    originalPrice,
    badge,
    colors,
    sizes,
    images,
    description,
    specs,
    featured
  } = req.body;

  if (!title || !price || !category) {
    return res.status(400).json({ error: 'Title, category and price are required' });
  }

  const parsedSizes = Array.isArray(sizes) ? sizes : [
    { size: 'M', stock: 10 },
    { size: 'L', stock: 10 },
    { size: 'XL', stock: 5 }
  ];

  const totalStock = parsedSizes.reduce((acc, curr) => acc + (parseInt(curr.stock) || 0), 0);

  const newProduct = {
    id: `prod_${Date.now()}`,
    title,
    subtitle: subtitle || '100% Exported Clothes',
    category,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : Math.round(Number(price) * 1.35),
    badge: badge || 'Global Brand',
    colors: Array.isArray(colors) ? colors : (typeof colors === 'string' ? colors.split(',').map(c => c.trim()) : ['Standard']),
    sizes: parsedSizes,
    totalStock,
    images: Array.isArray(images) && images.length > 0 ? images : [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'
    ],
    description: description || 'Premium export standard clothing made with highest GSM and stitching quality.',
    specs: specs ? {
      fabric: specs.fabric || '100% Export Grade Cotton',
      gsm: specs.gsm || '240 GSM',
      cut: specs.cut || 'Modern Comfort Fit',
      origin: specs.origin || 'European Export Consignment',
      washCare: specs.washCare || 'Machine wash cold'
    } : {
      fabric: '100% Export Grade Cotton',
      gsm: '240 GSM',
      cut: 'Modern Comfort Fit',
      origin: 'European Export Consignment',
      washCare: 'Machine wash cold'
    },
    sizeChart: req.body.sizeChart || null,
    featured: !!featured,
    createdAt: new Date().toISOString()
  };

  const products = readData('products.json', []);
  products.unshift(newProduct);
  writeData('products.json', products);

  // Log inventory entry
  const invLogs = readData('inventory_logs.json', []);
  invLogs.unshift({
    id: `log_${Date.now()}`,
    productId: newProduct.id,
    productTitle: newProduct.title,
    type: 'initial_stock',
    quantity: totalStock,
    size: 'All',
    reason: 'New product entry to catalog',
    date: new Date().toISOString()
  });
  writeData('inventory_logs.json', invLogs);

  res.status(201).json(newProduct);
});

// Update product
app.put('/api/products/:id', authenticateToken, (req, res) => {
  const products = readData('products.json', []);
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  const existing = products[index];
  const updatedSizes = req.body.sizes || existing.sizes;
  const newTotalStock = updatedSizes.reduce((acc, curr) => acc + (parseInt(curr.stock) || 0), 0);

  const updatedProduct = {
    ...existing,
    ...req.body,
    sizes: updatedSizes,
    totalStock: newTotalStock,
    price: Number(req.body.price ?? existing.price),
    originalPrice: Number(req.body.originalPrice ?? existing.originalPrice),
    updatedAt: new Date().toISOString()
  };

  products[index] = updatedProduct;
  writeData('products.json', products);
  res.json(updatedProduct);
});

// Delete product
app.delete('/api/products/:id', authenticateToken, (req, res) => {
  let products = readData('products.json', []);
  const target = products.find(p => p.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Product not found' });

  products = products.filter(p => p.id !== req.params.id);
  writeData('products.json', products);
  res.json({ success: true, message: 'Product deleted' });
});

// Manual Stock Adjustment (Add stock or deduct when sold outside website, e.g. Facebook/TikTok)
app.post('/api/products/:id/adjust-stock', authenticateToken, (req, res) => {
  const { size, quantity, type, reason } = req.body;
  // type: 'add' | 'deduct'
  const qty = parseInt(quantity);
  if (!qty || qty <= 0) return res.status(400).json({ error: 'Valid quantity required' });

  const products = readData('products.json', []);
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  let sizeObj = product.sizes.find(s => s.size === size);
  if (!sizeObj) {
    // If size doesn't exist, create it if adding
    if (type === 'add') {
      sizeObj = { size, stock: 0 };
      product.sizes.push(sizeObj);
    } else {
      return res.status(400).json({ error: `Size ${size} does not exist for this product` });
    }
  }

  if (type === 'deduct') {
    if (sizeObj.stock < qty) {
      return res.status(400).json({ error: `Cannot deduct ${qty}. Only ${sizeObj.stock} left in stock for size ${size}` });
    }
    sizeObj.stock -= qty;
  } else {
    sizeObj.stock += qty;
  }

  product.totalStock = product.sizes.reduce((acc, curr) => acc + curr.stock, 0);
  writeData('products.json', products);

  // Add to inventory audit log
  const invLogs = readData('inventory_logs.json', []);
  invLogs.unshift({
    id: `log_${Date.now()}`,
    productId: product.id,
    productTitle: product.title,
    type: type === 'add' ? 'restock' : 'manual_sale',
    quantity: type === 'add' ? qty : -qty,
    size: size,
    reason: reason || (type === 'add' ? 'Manual stock re-order' : 'Sold outside website (FB/TikTok/Offline)'),
    date: new Date().toISOString()
  });
  writeData('inventory_logs.json', invLogs);

  res.json({
    success: true,
    message: `Stock successfully ${type === 'add' ? 'added' : 'deducted'}`,
    product
  });
});

// ==================== PROMO CODES ====================
app.post('/api/promo/validate', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ error: 'Please enter a promo code' });

  const promos = readData('promo_codes.json', []);
  const promo = promos.find(p => p.code.toUpperCase() === code.trim().toUpperCase());

  if (!promo || !promo.active) {
    return res.status(400).json({ valid: false, error: 'Invalid or expired promo code.' });
  }

  const sub = Number(subtotal) || 0;
  if (promo.minOrder && sub < promo.minOrder) {
    return res.status(400).json({
      valid: false,
      error: `Minimum order amount of ৳${promo.minOrder} is required for this code.`
    });
  }

  if (promo.maxUses && promo.currentUses >= promo.maxUses) {
    return res.status(400).json({ valid: false, error: 'This promo code campaign has reached maximum usage limit.' });
  }

  let discount = 0;
  if (promo.type === 'percent') {
    discount = Math.round((sub * promo.value) / 100);
  } else {
    discount = Math.min(sub, promo.value);
  }

  res.json({
    valid: true,
    code: promo.code,
    type: promo.type,
    value: promo.value,
    discount,
    description: promo.description
  });
});

app.get('/api/promo', authenticateToken, (req, res) => {
  const promos = readData('promo_codes.json', []);
  res.json(promos);
});

app.post('/api/promo', authenticateToken, (req, res) => {
  const { code, type, value, minOrder, maxUses, description, expiryDate } = req.body;
  if (!code || !value) return res.status(400).json({ error: 'Code and discount value required' });

  const promos = readData('promo_codes.json', []);
  if (promos.some(p => p.code.toUpperCase() === code.trim().toUpperCase())) {
    return res.status(400).json({ error: 'A promo code with this name already exists' });
  }

  const newPromo = {
    id: `promo_${Date.now()}`,
    code: code.trim().toUpperCase(),
    type: type || 'percent',
    value: Number(value),
    minOrder: Number(minOrder) || 0,
    maxUses: Number(maxUses) || 500,
    currentUses: 0,
    description: description || `Campaign promo code: ${code.toUpperCase()}`,
    active: true,
    expiryDate: expiryDate || '2026-12-31',
    createdAt: new Date().toISOString()
  };

  promos.unshift(newPromo);
  writeData('promo_codes.json', promos);
  res.status(201).json(newPromo);
});

app.put('/api/promo/:id', authenticateToken, (req, res) => {
  const promos = readData('promo_codes.json', []);
  const index = promos.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Promo code not found' });

  promos[index] = { ...promos[index], ...req.body };
  writeData('promo_codes.json', promos);
  res.json(promos[index]);
});

app.delete('/api/promo/:id', authenticateToken, (req, res) => {
  let promos = readData('promo_codes.json', []);
  promos = promos.filter(p => p.id !== req.params.id);
  writeData('promo_codes.json', promos);
  res.json({ success: true, message: 'Promo code removed' });
});

function generateOrderEmailHtml(order, settings, isVerification = false) {
  const senderEmail = settings.gmailUser || 'stitchy123007@gmail.com';
  const whatsappUrl = settings.whatsappUrl || 'https://api.whatsapp.com/send/?phone=8801875413743';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 28px; border: 1px solid #E8E5DF; border-radius: 16px; background-color: #FAFAF8;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #E8E5DF; padding-bottom: 16px;">
        <h1 style="color: #121212; margin: 0; font-size: 26px; letter-spacing: 2px;">STITCHY</h1>
        <p style="color: #8C7A6B; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin: 4px 0 0;">Pure Export Apparel</p>
      </div>

      <p style="color: #1A1A1A; font-size: 15px;">Assalamu Alaikum <b>${order.customer.name}</b>,</p>
      <p style="color: #4B5563; font-size: 14px; line-height: 1.6;">
        ${isVerification 
          ? `Your payment has been verified and order <b>#${order.referenceNo}</b> is officially confirmed! Our team is preparing your pure export pieces for rapid courier dispatch.`
          : `Thank you for your order <b>#${order.referenceNo}</b> from STITCHY! We have received your order details and payment attachment.`}
      </p>
      
      <div style="background: #FFFFFF; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #E8E5DF;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #111827; text-transform: uppercase; letter-spacing: 1px;">Order Summary</h3>
        <p style="margin: 4px 0; font-size: 13px; color: #4B5563;"><b>Total Items:</b> ${order.items?.length || 1} pcs</p>
        <p style="margin: 4px 0; font-size: 13px; color: #4B5563;"><b>Delivery Zone:</b> ${order.customer.deliveryZone === 'inside' ? 'Inside Dhaka Metropolitan (৳70)' : 'Outside Dhaka (৳130)'}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #047857;"><b>Advance Prepaid (Bangla QR):</b> ৳${order.advancePaid}</p>
        <p style="margin: 8px 0 0; font-size: 15px; color: #111827;"><b>Cash on Delivery (COD) Due: ৳${order.balanceDue}</b></p>
      </div>

      <div style="background: #FAF8F5; padding: 14px 18px; border-radius: 10px; font-size: 12px; color: #4B5563; border: 1px solid #E8E5DF;">
        <p style="margin: 0 0 4px; font-weight: bold; color: #1F2937;">Delivery Destination:</p>
        <p style="margin: 0;">${order.customer.address}, ${order.customer.city} - ${order.customer.postalCode || ''}</p>
        ${order.customer.landmark ? `<p style="margin: 2px 0 0;">Landmark: ${order.customer.landmark}</p>` : ''}
        <p style="margin: 4px 0 0; font-family: monospace;">Recipient Phone: ${order.customer.phone}</p>
      </div>

      <div style="margin-top: 24px; text-align: center; border-top: 1px solid #E8E5DF; padding-top: 18px;">
        <p style="font-size: 12px; color: #6B7280; margin: 0 0 8px;">Track your order directly or inquire via WhatsApp:</p>
        <a href="${whatsappUrl}" style="display: inline-block; background: #25D366; color: #FFFFFF; text-decoration: none; padding: 10px 20px; border-radius: 999px; font-size: 12px; font-weight: bold;">
          Chat with STITCHY on WhatsApp (+880 1875-413743)
        </a>
      </div>

      <p style="margin-top: 24px; font-size: 11px; text-align: center; color: #9CA3AF;">
        STITCHY Pure Export • Official Email: ${senderEmail}
      </p>
    </div>
  `;
}

// ==================== ORDERS & CHECKOUT ====================
// Order submission endpoint with screenshot upload
app.post('/api/orders', uploadReceipt.single('paymentProof'), (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      landmark,
      postalCode,
      city,
      deliveryZone, // 'inside' or 'outside'
      paymentMethod, // 'bangla_qr_full' or 'cod_advance'
      transactionId,
      promoCode,
      cartItems
    } = req.body;

    if (!name || !phone || !address || !deliveryZone) {
      return res.status(400).json({ error: 'Name, phone number, address and delivery zone are required.' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      return res.status(400).json({ error: 'A valid active 11-digit mobile number is mandatory for courier dispatch and delivery calls.' });
    }

    const items = typeof cartItems === 'string' ? JSON.parse(cartItems) : (cartItems || []);
    if (!items.length) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    // Verify and deduct stock from products
    const products = readData('products.json', []);
    const invLogs = readData('inventory_logs.json', []);

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) {
        return res.status(400).json({ error: `Product "${item.title || item.productId}" no longer available.` });
      }

      // Check size stock
      const sizeObj = prod.sizes.find(s => s.size === item.size);
      if (!sizeObj || sizeObj.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${prod.title}" in size ${item.size}. Only ${sizeObj ? sizeObj.stock : 0} available.`
        });
      }

      // Deduct stock
      sizeObj.stock -= item.quantity;
      prod.totalStock = prod.sizes.reduce((acc, curr) => acc + curr.stock, 0);

      const itemTotal = prod.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: prod.id,
        title: prod.title,
        price: prod.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color || (prod.colors && prod.colors[0]) || 'Standard',
        image: prod.images[0] || ''
      });
    }

    // Write updated product stock back to DB
    writeData('products.json', products);

    // Calculate delivery fee
    const deliveryFee = deliveryZone === 'outside' ? 130 : 70;

    // Calculate promo discount
    let discount = 0;
    let appliedPromo = null;
    if (promoCode) {
      const promos = readData('promo_codes.json', []);
      const p = promos.find(pr => pr.code.toUpperCase() === promoCode.trim().toUpperCase() && pr.active);
      if (p) {
        if (!p.minOrder || subtotal >= p.minOrder) {
          if (p.type === 'percent') {
            discount = Math.round((subtotal * p.value) / 100);
          } else {
            discount = Math.min(subtotal, p.value);
          }
          appliedPromo = p.code;
          p.currentUses = (p.currentUses || 0) + 1;
          writeData('promo_codes.json', promos);
        }
      }
    }

    const total = Math.max(0, subtotal - discount) + deliveryFee;

    // Payment amounts calculation
    let advancePaid = 0;
    let balanceDue = 0;

    if (paymentMethod === 'bangla_qr_full') {
      advancePaid = total;
      balanceDue = 0;
    } else {
      // Cash on delivery: delivery charge prepaid via Bangla QR
      advancePaid = deliveryFee;
      balanceDue = total - deliveryFee;
    }

    const proofScreenshotPath = req.file ? `/uploads/receipts/${req.file.filename}` : null;
    const now = new Date();
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const referenceNo = `STY-${now.getFullYear()}-${randCode}`;

    const newOrder = {
      id: `ord_${Date.now()}`,
      referenceNo,
      createdAt: now.toISOString(),
      customer: {
        name: name.trim(),
        phone: phone.trim(),
        email: (email || '').trim(),
        address: address.trim(),
        landmark: (landmark || '').trim(),
        postalCode: (postalCode || '').trim(),
        city: (city || (deliveryZone === 'inside' ? 'Dhaka' : '')).trim(),
        deliveryZone
      },
      items: validatedItems,
      subtotal,
      discount,
      promoCode: appliedPromo,
      deliveryFee,
      total,
      advancePaid,
      balanceDue,
      paymentMethod,
      paymentProofScreenshot: proofScreenshotPath,
      transactionId: (transactionId || '').trim(),
      status: 'Pending Verification',
      adminNotes: '',
      emailSent: false,
      verifiedAt: null
    };

    const orders = readData('orders.json', []);
    orders.unshift(newOrder);
    writeData('orders.json', orders);

    // Record inventory log
    validatedItems.forEach(item => {
      invLogs.unshift({
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        productId: item.productId,
        productTitle: item.title,
        type: 'order_deduct',
        quantity: -item.quantity,
        size: item.size,
        reason: `Order #${referenceNo} placed by ${name}`,
        date: now.toISOString()
      });
    });
    writeData('inventory_logs.json', invLogs);

    // Update customer registry
    const customers = readData('customers.json', []);
    const existingCust = customers.find(c => c.phone === phone.trim());
    if (existingCust) {
      existingCust.totalOrders += 1;
      existingCust.totalSpent += total;
      existingCust.lastOrderDate = now.toISOString();
      if (email) existingCust.email = email.trim();
      existingCust.address = address.trim();
    } else {
      customers.push({
        id: `cust_${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        email: (email || '').trim(),
        city: city || (deliveryZone === 'inside' ? 'Dhaka' : 'Outside Dhaka'),
        address: address.trim(),
        totalOrders: 1,
        totalSpent: total,
        lastOrderDate: now.toISOString()
      });
    }
    writeData('customers.json', customers);

    // Automatic email dispatch if customer provided email
    if (email && email.trim().includes('@')) {
      const settings = readData('settings.json', {});
      const senderEmail = settings.gmailUser || 'stitchy123007@gmail.com';
      if (settings.gmailAppPassword) {
        try {
          const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
              user: senderEmail,
              pass: settings.gmailAppPassword.trim()
            }
          });
          const htmlContent = generateOrderEmailHtml(newOrder, settings, false);
          transporter.sendMail({
            from: `"STITCHY Pure Export" <${senderEmail}>`,
            to: email.trim(),
            subject: `Order Received: #${referenceNo} - STITCHY Pure Export`,
            html: htmlContent
          }).then(() => {
            newOrder.emailSent = true;
            writeData('orders.json', orders);
          }).catch(err => console.error('Auto order email error:', err));
        } catch (err) {
          console.error('Nodemailer init error on checkout:', err);
        }
      }
    }

    res.status(201).json({
      success: true,
      order: newOrder
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message || 'Error processing order' });
  }
});

// Export Orders to CSV (Google Drive & Google Sheets compatible)
app.get('/api/orders/export-csv', authenticateToken, (req, res) => {
  const orders = readData('orders.json', []);
  const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Email', 'Delivery Zone', 'Address', 'Landmark', 'City', 'Subtotal', 'Delivery Fee', 'Total', 'Advance Paid', 'Balance Due (COD)', 'Payment Method', 'Status', 'Transaction ID'];
  
  const csvRows = [headers.join(',')];
  orders.forEach(o => {
    const row = [
      `"${o.referenceNo}"`,
      `"${new Date(o.createdAt).toLocaleString()}"`,
      `"${(o.customer?.name || '').replace(/"/g, '""')}"`,
      `"${o.customer?.phone || ''}"`,
      `"${o.customer?.email || ''}"`,
      `"${o.customer?.deliveryZone === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}"`,
      `"${(o.customer?.address || '').replace(/"/g, '""')}"`,
      `"${(o.customer?.landmark || '').replace(/"/g, '""')}"`,
      `"${(o.customer?.city || '').replace(/"/g, '""')}"`,
      o.subtotal || 0,
      o.deliveryFee || 0,
      o.total || 0,
      o.advancePaid || 0,
      o.balanceDue || 0,
      `"${o.paymentMethod || ''}"`,
      `"${o.status || ''}"`,
      `"${o.transactionId || ''}"`
    ];
    csvRows.push(row.join(','));
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=stitchy_orders_${Date.now()}.csv`);
  res.status(200).send(csvRows.join('\r\n'));
});

// Google Drive Settings endpoint
app.post('/api/settings/google-drive', authenticateToken, (req, res) => {
  const { folderUrl, enabled } = req.body;
  const settings = readData('settings.json', {});
  if (folderUrl !== undefined) settings.googleDriveFolderUrl = folderUrl;
  if (enabled !== undefined) settings.googleServicesEnabled = !!enabled;
  writeData('settings.json', settings);
  res.json({
    success: true,
    googleDriveFolderUrl: settings.googleDriveFolderUrl,
    googleServicesEnabled: settings.googleServicesEnabled
  });
});

// Admin Orders list
app.get('/api/orders', authenticateToken, (req, res) => {
  let orders = readData('orders.json', []);
  const { status, search } = req.query;

  if (status && status !== 'All') {
    orders = orders.filter(o => o.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    orders = orders.filter(o =>
      o.referenceNo.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.phone.toLowerCase().includes(q) ||
      (o.customer.email && o.customer.email.toLowerCase().includes(q)) ||
      (o.transactionId && o.transactionId.toLowerCase().includes(q))
    );
  }

  res.json(orders);
});

// Get single order
app.get('/api/orders/:id', (req, res) => {
  const orders = readData('orders.json', []);
  const order = orders.find(o => o.id === req.params.id || o.referenceNo === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Update order status & verify payment
app.put('/api/orders/:id/status', authenticateToken, (req, res) => {
  const { status, adminNotes } = req.body;
  const orders = readData('orders.json', []);
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (status) order.status = status;
  if (adminNotes !== undefined) order.adminNotes = adminNotes;

  if (status === 'Confirmed' && !order.verifiedAt) {
    order.verifiedAt = new Date().toISOString();
    order.emailSent = true; // Mark email sent upon verification
  }

  writeData('orders.json', orders);
  res.json({ success: true, order });
});

// Delete single order
app.delete('/api/orders/:id', authenticateToken, (req, res) => {
  let orders = readData('orders.json', []);
  const initialCount = orders.length;
  orders = orders.filter(o => o.id !== req.params.id && o.referenceNo !== req.params.id);
  if (orders.length === initialCount) {
    return res.status(404).json({ error: 'Order not found' });
  }
  writeData('orders.json', orders);
  res.json({ success: true, message: 'Order deleted successfully' });
});

// Clear all sample/test orders
app.post('/api/orders/clear-all', authenticateToken, (req, res) => {
  writeData('orders.json', []);
  res.json({ success: true, message: 'All orders cleared successfully' });
});

// Clear all sample products
app.post('/api/products/clear-all', authenticateToken, (req, res) => {
  writeData('products.json', []);
  res.json({ success: true, message: 'All products cleared successfully' });
});

// Dispatch Confirmation Email (Gmail SMTP + Preview)
app.post('/api/orders/:id/send-email', authenticateToken, async (req, res) => {
  const orders = readData('orders.json', []);
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const settings = readData('settings.json', {});
  const senderEmail = settings.gmailUser || 'stitchy123007@gmail.com';
  const customerEmail = order.customer?.email;

  order.emailSent = true;
  writeData('orders.json', orders);

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 28px; border: 1px solid #E8E5DF; border-radius: 16px; background-color: #FAFAF8;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #E8E5DF; padding-bottom: 16px;">
        <h1 style="color: #121212; margin: 0; font-size: 26px; letter-spacing: 2px;">STITCHY</h1>
        <p style="color: #8C7A6B; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin: 4px 0 0;">Pure Export Apparel</p>
      </div>

      <p style="color: #1A1A1A; font-size: 15px;">Assalamu Alaikum <b>${order.customer.name}</b>,</p>
      <p style="color: #4B5563; font-size: 14px; line-height: 1.6;">
        Your order <b>#${order.referenceNo}</b> has been verified and confirmed! Our operations team is preparing your pure export pieces for rapid courier dispatch.
      </p>
      
      <div style="background: #FFFFFF; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #E8E5DF;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #111827; text-transform: uppercase; letter-spacing: 1px;">Consignment Summary</h3>
        <p style="margin: 4px 0; font-size: 13px; color: #4B5563;"><b>Total Items:</b> ${order.items?.length || 1} pcs</p>
        <p style="margin: 4px 0; font-size: 13px; color: #4B5563;"><b>Delivery Zone:</b> ${order.customer.deliveryZone === 'inside' ? 'Inside Dhaka Metropolitan (৳70)' : 'Outside Dhaka (৳130)'}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #047857;"><b>Advance Prepaid (Bangla QR):</b> ৳${order.advancePaid}</p>
        <p style="margin: 8px 0 0; font-size: 15px; color: #111827;"><b>Cash on Delivery (COD) Due: ৳${order.balanceDue}</b></p>
      </div>

      <div style="background: #FAF8F5; padding: 14px 18px; border-radius: 10px; font-size: 12px; color: #4B5563; border: 1px solid #E8E5DF;">
        <p style="margin: 0 0 4px; font-weight: bold; color: #1F2937;">Delivery Destination:</p>
        <p style="margin: 0;">${order.customer.address}, ${order.customer.city} - ${order.customer.postalCode || ''}</p>
        ${order.customer.landmark ? `<p style="margin: 2px 0 0;">Landmark: ${order.customer.landmark}</p>` : ''}
        <p style="margin: 4px 0 0; font-family: monospace;">Recipient Phone: ${order.customer.phone}</p>
      </div>

      <div style="margin-top: 24px; text-align: center; border-top: 1px solid #E8E5DF; padding-top: 18px;">
        <p style="font-size: 12px; color: #6B7280; margin: 0 0 8px;">Need instant help or order inquiries? Contact our WhatsApp team:</p>
        <a href="${settings.whatsappUrl || 'https://api.whatsapp.com/send/?phone=8801875413743'}" style="display: inline-block; background: #25D366; color: #FFFFFF; text-decoration: none; padding: 10px 20px; border-radius: 999px; font-size: 12px; font-weight: bold;">
          Chat with STITCHY on WhatsApp (+880 1875-413743)
        </a>
      </div>

      <p style="margin-top: 24px; font-size: 11px; text-align: center; color: #9CA3AF;">
        STITCHY Pure Export • Official Email: ${senderEmail}
      </p>
    </div>
  `;

  let sentViaGmail = false;
  let gmailError = null;

  if (settings.gmailAppPassword && customerEmail) {
    try {
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: senderEmail,
          pass: settings.gmailAppPassword.trim()
        }
      });

      await transporter.sendMail({
        from: `"STITCHY Pure Export" <${senderEmail}>`,
        to: customerEmail,
        subject: `Order Confirmed: #${order.referenceNo} - STITCHY Pure Export`,
        html: emailHtml
      });
      sentViaGmail = true;
    } catch (err) {
      console.error('Nodemailer Gmail dispatch error:', err);
      gmailError = err.message;
    }
  }

  res.json({
    success: true,
    sentViaGmail,
    gmailError,
    recipient: customerEmail || order.customer.phone,
    message: sentViaGmail 
      ? `Real email successfully dispatched to ${customerEmail} from ${senderEmail}!`
      : `Email confirmation recorded for ${customerEmail || order.customer.phone}. (To send actual live emails directly from Gmail, add your Gmail App Password in Admin Settings).`,
    emailPreviewHtml: emailHtml
  });
});

// Test Gmail SMTP configuration endpoint
app.post('/api/settings/test-email', authenticateToken, async (req, res) => {
  const settings = readData('settings.json', {});
  const senderEmail = settings.gmailUser || 'stitchy123007@gmail.com';
  const appPassword = settings.gmailAppPassword;

  if (!appPassword) {
    return res.status(400).json({
      success: false,
      error: 'Gmail App Password is not configured yet. Please enter your 16-character Google App Password in settings.'
    });
  }

  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: senderEmail,
        pass: appPassword.trim()
      }
    });

    await transporter.verify();
    await transporter.sendMail({
      from: `"STITCHY Export Apparel" <${senderEmail}>`,
      to: senderEmail,
      subject: '✅ STITCHY Gmail SMTP Integration Verified!',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>STITCHY Mail Service is LIVE</h2>
          <p>Your official email <b>${senderEmail}</b> is now connected to the STITCHY platform.</p>
          <p>Customer order confirmation receipts and tracking updates will be dispatched automatically.</p>
        </div>
      `
    });

    res.json({ success: true, message: `Test email successfully sent to ${senderEmail}!` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== CUSTOMER GOOGLE / GMAIL LOGIN & PROFILE ====================
app.post('/api/customer/google-login', (req, res) => {
  const { email, name, picture } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required for Google login' });

  const accounts = readData('customer_accounts.json', []);
  let user = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    user = {
      id: `gusr_${Date.now()}`,
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      picture: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=121212&color=C5A880`,
      createdAt: new Date().toISOString()
    };
    accounts.push(user);
    writeData('customer_accounts.json', accounts);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: 'customer' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({ token, user });
});

// Get customer's orders across devices
app.get('/api/customer/orders', (req, res) => {
  const { email, phone } = req.query;
  if (!email && !phone) return res.status(400).json({ error: 'Email or phone required' });

  const orders = readData('orders.json', []);
  const matching = orders.filter(o => {
    const emailMatch = email && o.customer?.email && o.customer.email.toLowerCase() === email.toLowerCase();
    const phoneMatch = phone && o.customer?.phone && o.customer.phone.replace(/[^0-9]/g, '').endsWith(phone.replace(/[^0-9]/g, '').slice(-10));
    return emailMatch || phoneMatch;
  });

  res.json(matching);
});

// ==================== SEO & GOOGLE ADS ====================
app.get('/api/seo', (req, res) => {
  const settings = readData('settings.json', {});
  res.json({
    seo: settings.seo || {},
    googleAds: {
      id: settings.googleAdsId || '',
      active: settings.googleAdsActive ?? true,
      budget: settings.googleAdsBudget || '৳500 / day'
    }
  });
});

app.put('/api/settings/seo', authenticateToken, (req, res) => {
  const settings = readData('settings.json', {});
  settings.seo = { ...(settings.seo || {}), ...req.body };
  writeData('settings.json', settings);
  res.json({ success: true, seo: settings.seo });
});

app.put('/api/settings/google-ads', authenticateToken, (req, res) => {
  const settings = readData('settings.json', {});
  if (req.body.googleAdsId !== undefined) settings.googleAdsId = req.body.googleAdsId;
  if (req.body.googleAdsActive !== undefined) settings.googleAdsActive = req.body.googleAdsActive;
  if (req.body.googleAdsBudget !== undefined) settings.googleAdsBudget = req.body.googleAdsBudget;
  writeData('settings.json', settings);
  res.json({
    success: true,
    googleAds: {
      id: settings.googleAdsId,
      active: settings.googleAdsActive,
      budget: settings.googleAdsBudget
    }
  });
});

// ==================== CUSTOMERS & INVENTORY LOGS ====================
app.get('/api/customers', authenticateToken, (req, res) => {
  const customers = readData('customers.json', []);
  res.json(customers);
});

app.get('/api/inventory/logs', authenticateToken, (req, res) => {
  const logs = readData('inventory_logs.json', []);
  res.json(logs);
});

// ==================== ANALYTICS & DEVICE STATS ====================
app.get('/api/analytics', authenticateToken, (req, res) => {
  const traffic = readData('traffic.json', []);
  const orders = readData('orders.json', []);
  const products = readData('products.json', []);

  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending Verification').length;
  const lowStockCount = products.filter(p => p.totalStock <= 5).length;

  // Device Breakdown
  const deviceCounts = {
    'Mobile iOS': 0,
    'Mobile Android': 0,
    'Desktop': 0,
    'Tablet': 0,
    'Mobile Other': 0
  };

  traffic.forEach(t => {
    const dev = t.device || 'Desktop';
    deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
  });

  // Calculate daily visits past 7 days
  const dailyVisits = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000).toISOString().split('T')[0];
    dailyVisits[d] = 0;
  }

  traffic.forEach(t => {
    if (dailyVisits[t.date] !== undefined) {
      dailyVisits[t.date] += 1;
    }
  });

  // Calculate weekly & monthly aggregations
  const totalTrafficVisits = traffic.length;
  const mobileVisits = (deviceCounts['Mobile iOS'] || 0) + (deviceCounts['Mobile Android'] || 0) + (deviceCounts['Mobile Other'] || 0);
  const mobileSharePercent = totalTrafficVisits > 0 ? Math.round((mobileVisits / totalTrafficVisits) * 100) : 0;

  res.json({
    overview: {
      totalRevenue,
      totalOrders,
      pendingOrders,
      lowStockCount,
      totalVisits: totalTrafficVisits,
      mobileSharePercent
    },
    deviceBreakdown: deviceCounts,
    dailyVisits,
    recentTraffic: traffic.slice(-20).reverse()
  });
});

// ==================== SYSTEM STATUS & BACKUP ====================
app.get('/api/system/status', (req, res) => {
  res.json({
    mongoConnected: isMongoConnected(),
    storageMode: isMongoConnected() ? 'mongodb_atlas' : 'ephemeral_disk',
    timestamp: new Date().toISOString()
  });
});

// Full Store Backup Export (Products, Settings, Promos, Orders, Customers)
app.get('/api/backup/export', authenticateToken, (req, res) => {
  try {
    const backup = {
      stitchyBackupVersion: '2.0',
      exportedAt: new Date().toISOString(),
      storeName: 'STITCHY',
      products: readData('products.json', []),
      settings: readData('settings.json', {}),
      promoCodes: readData('promo_codes.json', []),
      orders: readData('orders.json', []),
      customers: readData('customers.json', [])
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=stitchy_store_backup_${Date.now()}.json`);
    res.json(backup);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate store backup: ' + err.message });
  }
});

// Full Store Backup Restore
app.post('/api/backup/import', authenticateToken, (req, res) => {
  try {
    const backup = req.body;
    if (!backup || typeof backup !== 'object') {
      return res.status(400).json({ error: 'Invalid backup file format.' });
    }
    let restoredCount = 0;
    if (Array.isArray(backup.products)) {
      writeData('products.json', backup.products);
      restoredCount += backup.products.length;
    }
    if (backup.settings && typeof backup.settings === 'object') {
      writeData('settings.json', backup.settings);
    }
    if (Array.isArray(backup.promoCodes)) {
      writeData('promo_codes.json', backup.promoCodes);
    }
    if (Array.isArray(backup.orders)) {
      writeData('orders.json', backup.orders);
    }
    if (Array.isArray(backup.customers)) {
      writeData('customers.json', backup.customers);
    }
    res.json({
      success: true,
      message: `Store backup restored successfully! (${restoredCount} products, settings, and orders updated)`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore store backup: ' + err.message });
  }
});

// Health check for Render / Cloud monitors
app.get('/health', (req, res) => {
  res.status(200).send('STITCHY OK');
});

// Production client serving
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('STITCHY Storefront initializing... please refresh in a moment.');
  });
}

// Start Server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`STITCHY Apparel Server listening on port ${PORT}`);
  await connectDB();
});
