const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache for ultra-fast, synchronous readData operations
const memoryStore = new Map();

// Schema for cloud document storage in MongoDB Atlas
const StoreDocumentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
});

let StoreDocument = null;
let isMongoConnected = false;

function getFilePath(file) {
  return path.join(DATA_DIR, file);
}

// Dual-mode read: in-memory first, local file second
function readData(file, defaultVal = []) {
  if (memoryStore.has(file)) {
    return memoryStore.get(file);
  }
  const fp = getFilePath(file);
  if (!fs.existsSync(fp)) {
    writeData(file, defaultVal);
    return defaultVal;
  }
  try {
    const raw = fs.readFileSync(fp, 'utf8');
    const parsed = JSON.parse(raw);
    memoryStore.set(file, parsed);
    return parsed;
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return defaultVal;
  }
}

// Dual-mode write: memory + local file + cloud MongoDB Atlas (if connected)
function writeData(file, data) {
  // 1. Update in-memory store
  memoryStore.set(file, data);

  // 2. Update local disk file (atomic safe write)
  try {
    const fp = getFilePath(file);
    const temp = `${fp}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(temp, fp);
  } catch (err) {
    console.error(`Error writing local file ${file}:`, err.message);
  }

  // 3. Persist to MongoDB Atlas if connected
  if (isMongoConnected && StoreDocument) {
    StoreDocument.findOneAndUpdate(
      { key: file },
      { key: file, data, updatedAt: new Date() },
      { upsert: true, new: true }
    ).catch((err) => {
      console.error(`[DB] Error saving ${file} to MongoDB:`, err.message);
    });
  }
}

// Synchronize all collections from MongoDB Atlas
async function syncFromMongo() {
  if (!isMongoConnected || !StoreDocument) return;
  try {
    const docs = await StoreDocument.find({});
    if (docs.length === 0) {
      console.log('ℹ️ [DB] MongoDB is empty. Seeding MongoDB with current store data...');
      const seedFiles = [
        'settings.json',
        'products.json',
        'orders.json',
        'users.json',
        'promo_codes.json',
        'customers.json',
        'inventory_logs.json',
        'traffic.json'
      ];
      for (const f of seedFiles) {
        const fp = getFilePath(f);
        if (fs.existsSync(fp)) {
          try {
            const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
            await StoreDocument.create({ key: f, data, updatedAt: new Date() });
            memoryStore.set(f, data);
          } catch (e) {
            console.error(`Error seeding ${f} to MongoDB:`, e.message);
          }
        }
      }
      console.log('✅ [DB] Initial seed to MongoDB completed successfully.');
      return;
    }

    // Hydrate memory cache & local files from MongoDB Atlas
    for (const doc of docs) {
      memoryStore.set(doc.key, doc.data);
      try {
        const fp = getFilePath(doc.key);
        fs.writeFileSync(fp, JSON.stringify(doc.data, null, 2), 'utf8');
      } catch (e) {
        // Safe fail for read-only environments
      }
    }
    console.log(`✅ [DB] Loaded ${docs.length} persistent store collections from MongoDB Atlas.`);
  } catch (err) {
    console.error('❌ [DB] Error during MongoDB sync:', err.message);
  }
}

// Connect to MongoDB Atlas (called at server boot)
async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.log('ℹ️ [DB] No MONGODB_URI found in environment. Running in local file-system mode.');
    return;
  }

  try {
    console.log('🔄 [DB] Connecting to MongoDB Atlas cloud database...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    isMongoConnected = true;
    StoreDocument = mongoose.model('StoreDocument', StoreDocumentSchema);
    console.log('✅ [DB] Connected to MongoDB Atlas! All products, prices, and orders are 100% cloud persistent.');
    await syncFromMongo();
  } catch (err) {
    console.error('❌ [DB] Failed to connect to MongoDB Atlas:', err.message);
    console.log('⚠️ [DB] Continuing with local file storage.');
  }
}

// Initial Seeding
function initializeDB() {
  // 1. Settings (Stitchy official brand defaults)
  const settingsFile = 'settings.json';
  if (!fs.existsSync(getFilePath(settingsFile))) {
    const defaultSettings = {
      storeName: 'STITCHY',
      motto: 'MADE STITCH BY STITCH',
      tagline: '100% Exported Clothes • Global Brands',
      logoUrl: '/uploads/logo.jpg',
      coverUrl: '/cover.jpg',
      banglaQrUrl: '/uploads/bangla-qr.jpg',
      bkashNumber: '01567-932733 (bKash Bangla QR)',
      nagadNumber: '01567-932733 (Personal)',
      rocketNumber: '01567-932733 (Personal)',
      bankInfo: 'All Bank Apps / bKash / Nagad / Rocket (Bangla QR Interoperable)',
      deliveryChargeInside: 70,
      deliveryChargeOutside: 130,
      announcement: '✨ 100% Exported Clothes • 48-Hour Rapid Delivery Across Bangladesh',
      footerDescription: 'Authentic 100% exported clothes from leading global brands. Premium fabric, long-lasting construction, modern fits. Wear your story with confidence.',
      valuePillars: [
        {
          id: 'vp1',
          icon: 'ShieldCheck',
          title: '100% Exported Clothes',
          description: 'Authentic export consignments crafted from 240+ GSM organic combed cotton, double-stitched for enduring wear.'
        },
        {
          id: 'vp2',
          icon: 'Globe',
          title: 'Global Brands',
          description: 'Original collections from leading global retail fashion houses and international apparel consignments.'
        },
        {
          id: 'vp3',
          icon: 'Truck',
          title: 'Rapid Nationwide Delivery',
          description: 'Flat ৳70 within Dhaka Metropolitan (24-48h) and ৳130 across all Bangladesh districts (48-72h).'
        }
      ],
      supportPhone: '+880 1875-413743',
      supportEmail: 'stitchy123007@gmail.com',
      whatsappUrl: 'https://api.whatsapp.com/send/?phone=8801875413743&text&type=phone_number&app_absent=0',
      whatsappNumber: '+8801875413743',
      facebookUrl: 'https://www.facebook.com/share/1FMAwBBf6Y/',
      instagramUrl: 'https://www.instagram.com/_stit_chy_?srtk=b2hmbXRhNW5leTQz',
      tiktokUrl: 'https://www.tiktok.com/@stitchy710?_r=1&_t=ZS-9BEHb2NGgnV',
      gmailUser: 'stitchy123007@gmail.com',
      gmailAppPassword: '',
      googleAdsId: 'AW-11598234-STITCHY',
      googleAdsActive: true,
      googleAdsBudget: '৳500 / day',
      googleDriveFolderUrl: 'https://drive.google.com/drive/folders/1StitchyExportReceiptsBackup',
      googleServicesEnabled: true
    };
    writeData(settingsFile, defaultSettings);
  }

  // 2. Admin Users
  const usersFile = 'users.json';
  if (!fs.existsSync(getFilePath(usersFile))) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin123', salt);
    const defaultUsers = [
      {
        id: 'usr_1',
        name: 'Emdadul Haque (Admin)',
        email: 'admin@stitchy.com',
        passwordHash: hash,
        role: 'Super Admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_2',
        name: 'Stitchy Admin',
        email: 'stitchy123007@gmail.com',
        passwordHash: hash,
        role: 'Super Admin',
        createdAt: new Date().toISOString()
      }
    ];
    writeData(usersFile, defaultUsers);
  }

  // 3. Products: default to empty array [] so fake demo products NEVER auto-populate
  const productsFile = 'products.json';
  if (!fs.existsSync(getFilePath(productsFile))) {
    writeData(productsFile, []);
  }

  // 4. Promo codes
  const promoFile = 'promo_codes.json';
  if (!fs.existsSync(getFilePath(promoFile))) {
    const defaultPromos = [
      {
        id: 'promo_1',
        code: 'EXPORT10',
        type: 'percent',
        value: 10,
        minOrder: 800,
        maxUses: 500,
        currentUses: 0,
        description: '10% discount on pure export collection',
        active: true,
        expiryDate: '2026-12-31'
      },
      {
        id: 'promo_2',
        code: 'WELCOME50',
        type: 'flat',
        value: 50,
        minOrder: 500,
        maxUses: 1000,
        currentUses: 0,
        description: '৳50 off for first-time shoppers',
        active: true,
        expiryDate: '2026-12-31'
      }
    ];
    writeData(promoFile, defaultPromos);
  }

  // 5. Orders (Clean real orders list, no demo orders)
  const ordersFile = 'orders.json';
  if (!fs.existsSync(getFilePath(ordersFile))) {
    writeData(ordersFile, []);
  }

  // 6. Customers list
  const customersFile = 'customers.json';
  if (!fs.existsSync(getFilePath(customersFile))) {
    writeData(customersFile, []);
  }

  // 7. Inventory Logs
  const invLogsFile = 'inventory_logs.json';
  if (!fs.existsSync(getFilePath(invLogsFile))) {
    writeData(invLogsFile, []);
  }

  // 8. Traffic & Device Tracking data
  const trafficFile = 'traffic.json';
  if (!fs.existsSync(getFilePath(trafficFile))) {
    writeData(trafficFile, []);
  }
}

initializeDB();

module.exports = {
  readData,
  writeData,
  connectDB,
  syncFromMongo,
  isMongoConnected: () => isMongoConnected
};
