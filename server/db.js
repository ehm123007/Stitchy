const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(file) {
  return path.join(DATA_DIR, file);
}

function readData(file, defaultVal = []) {
  const fp = getFilePath(file);
  if (!fs.existsSync(fp)) {
    writeData(file, defaultVal);
    return defaultVal;
  }
  try {
    const raw = fs.readFileSync(fp, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return defaultVal;
  }
}

function writeData(file, data) {
  const fp = getFilePath(file);
  const temp = `${fp}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(temp, fp);
}

// Initial Seeding
function initializeDB() {
  // 1. Settings
  const settingsFile = 'settings.json';
  if (!fs.existsSync(getFilePath(settingsFile))) {
    const defaultSettings = {
      storeName: 'STITCHY',
      tagline: 'Pure Export Apparel & Overstock Collections',
      banglaQrUrl: '/uploads/bangla-qr.jpg',
      bkashNumber: '01567-932733 (bKash Bangla QR)',
      nagadNumber: '01567-932733 (Personal)',
      rocketNumber: '01567-932733 (Personal)',
      bankInfo: 'All Bank Apps / bKash / Nagad / Rocket (Bangla QR Interoperable)',
      deliveryChargeInside: 70,
      deliveryChargeOutside: 130,
      announcement: '✨ 100% Pure Export Overstock Garments • 48-Hour Rapid Delivery Across Bangladesh',
      supportPhone: '+880 1567-932733',
      supportEmail: 'orders@stitchy.com',
      facebookUrl: 'https://facebook.com/stitchyexport',
      instagramUrl: 'https://instagram.com/stitchy.apparel',
      tiktokUrl: 'https://tiktok.com/@stitchyexport'
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
        name: 'Order Manager',
        email: 'team@stitchy.com',
        passwordHash: hash,
        role: 'Operations & Dispatch',
        createdAt: new Date().toISOString()
      }
    ];
    writeData(usersFile, defaultUsers);
  }

  // 3. Products
  const productsFile = 'products.json';
  if (!fs.existsSync(getFilePath(productsFile))) {
    const defaultProducts = [
      {
        id: 'prod_1',
        title: 'Heavyweight Drop-Shoulder Oversized Tee',
        subtitle: 'European Export Surplus • 240 GSM Organic Combed Cotton',
        category: 'T-Shirts & Tops',
        price: 890,
        originalPrice: 1250,
        badge: 'Export Bestseller',
        colors: ['Washed Charcoal', 'Vintage Ivory', 'Sage Green', 'Jet Black'],
        sizes: [
          { size: 'M', stock: 12 },
          { size: 'L', stock: 15 },
          { size: 'XL', stock: 8 },
          { size: 'XXL', stock: 4 }
        ],
        totalStock: 39,
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=80'
        ],
        description: 'Authentic pure export heavyweight tee crafted from luxury 240 GSM 100% compact combed cotton. Double-needle stitch collar, pre-shrunk fabric with subtle vintage enzyme wash finish. Designed for premium durability and relaxed streetwear comfort.',
        specs: {
          fabric: '100% Ring-Spun Combed Cotton',
          gsm: '240 GSM (Dense & Structured)',
          cut: 'Boxy Drop-Shoulder Relaxed Fit',
          washCare: 'Machine wash cold, inside out. Tumble dry low.',
          origin: 'Target Export to Scandinavia / Germany'
        },
        featured: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod_2',
        title: 'Relaxed Vintage Flannel Overshirt',
        subtitle: 'US Export Surplus • Brushed Yarn-Dyed Cotton Plaid',
        category: 'Shirts & Flannels',
        price: 1390,
        originalPrice: 1850,
        badge: 'Pure Export',
        colors: ['Earthy Forest Plaid', 'Charcoal Ombre', 'Camel Tartan'],
        sizes: [
          { size: 'S', stock: 6 },
          { size: 'M', stock: 14 },
          { size: 'L', stock: 9 },
          { size: 'XL', stock: 5 }
        ],
        totalStock: 34,
        images: [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80'
        ],
        description: 'Crafted for chilly evenings and everyday layer aesthetics. Premium brushed twill fabric with double chest utility pockets and genuine horn buttons. Pure export overstock originally tailored for North American high-street retailers.',
        specs: {
          fabric: '100% Brushed Cotton Twill',
          gsm: '210 GSM',
          cut: 'Classic Overshirt / Relaxed Layering',
          washCare: 'Cold hand or machine wash.',
          origin: 'US High-Street Brand Surplus'
        },
        featured: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod_3',
        title: 'Minimal French Terry Hoodie - 380 GSM',
        subtitle: 'Nordic Export Quality • Brushed Interior, Anti-Pilling',
        category: 'Hoodies & Jackets',
        price: 1750,
        originalPrice: 2400,
        badge: 'Limited Batch',
        colors: ['Oatmeal Heather', 'Deep Olive', 'Midnight Black'],
        sizes: [
          { size: 'M', stock: 8 },
          { size: 'L', stock: 10 },
          { size: 'XL', stock: 5 },
          { size: 'XXL', stock: 2 }
        ],
        totalStock: 25,
        images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=900&q=80'
        ],
        description: 'Luxuriously thick 380 GSM fleece with clean minimal finish without garish branding. Double-lined hood, seamless kangaroo pouch, and reinforced ribbed hems that stay snug wash after wash.',
        specs: {
          fabric: '85% Cotton, 15% Poly Fleece Anti-Pilling',
          gsm: '380 GSM Ultra-Heavy',
          cut: 'Tailored Streetwear Cut',
          washCare: 'Gentle cycle, dry flat.',
          origin: 'Northern European Winter Export'
        },
        featured: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod_4',
        title: 'Pleated Linen-Cotton Relaxed Trousers',
        subtitle: 'Italian Export Tailoring • Breathable Pre-Washed Blend',
        category: 'Pants & Bottoms',
        price: 1450,
        originalPrice: 1950,
        badge: 'Summer Essential',
        colors: ['Sand Beige', 'Natural Ecru', 'Slate Grey'],
        sizes: [
          { size: '30', stock: 7 },
          { size: '32', stock: 11 },
          { size: '34', stock: 9 },
          { size: '36', stock: 4 }
        ],
        totalStock: 31,
        images: [
          'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=900&q=80'
        ],
        description: 'Effortless Mediterranean resort aesthetics made for Bangladesh climate. Single forward pleat with elasticated waistband and internal drawstring for supreme all-day comfort.',
        specs: {
          fabric: '55% French Linen, 45% Combed Cotton',
          gsm: '180 GSM Lightweight Twill',
          cut: 'Relaxed Tapered Fit',
          washCare: 'Machine wash cold.',
          origin: 'Southern Europe Summer Export'
        },
        featured: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod_5',
        title: 'Minimal Structured Harrington Jacket',
        subtitle: 'UK Export Surplus • Water-Resistant Cotton Shell',
        category: 'Hoodies & Jackets',
        price: 2190,
        originalPrice: 2950,
        badge: 'Pure Export',
        colors: ['Matte Black', 'Khaki Stone'],
        sizes: [
          { size: 'M', stock: 5 },
          { size: 'L', stock: 7 },
          { size: 'XL', stock: 3 }
        ],
        totalStock: 15,
        images: [
          'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80'
        ],
        description: 'Classic British Harrington silhouette with stand-up dual-button collar, YKK antique brass dual zipper, and tartan lining. Timeless and versatile for meetings or casual evenings.',
        specs: {
          fabric: '100% Water-Resistant Peached Cotton Shell',
          gsm: '260 GSM',
          cut: 'Regular Smart-Casual Fit',
          washCare: 'Dry clean or cold sponge wipe.',
          origin: 'British Heritage Brand Surplus'
        },
        featured: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod_6',
        title: 'Washed Mercerized Cotton Pique Polo',
        subtitle: 'Japanese Export Line • Mother of Pearl Buttons',
        category: 'T-Shirts & Tops',
        price: 1050,
        originalPrice: 1500,
        badge: 'Export Bestseller',
        colors: ['Navy Blue', 'Off-White', 'Muted Sage'],
        sizes: [
          { size: 'M', stock: 10 },
          { size: 'L', stock: 12 },
          { size: 'XL', stock: 6 }
        ],
        totalStock: 28,
        images: [
          'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80'
        ],
        description: 'Silky smooth mercerized cotton pique with zero collar curl. Subtle contrast ribbing on cuffs with genuine mother-of-pearl buttons. Cool and breathable for all seasons.',
        specs: {
          fabric: '100% Double Mercerized Combed Cotton',
          gsm: '220 GSM Pique',
          cut: 'Modern Athletic Fit',
          washCare: 'Machine wash 30°C.',
          origin: 'Tokyo Department Store Export Line'
        },
        featured: false,
        createdAt: new Date().toISOString()
      }
    ];
    writeData(productsFile, defaultProducts);
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
        currentUses: 14,
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
        currentUses: 32,
        description: '৳50 off for first-time shoppers',
        active: true,
        expiryDate: '2026-12-31'
      },
      {
        id: 'promo_3',
        code: 'EIDVIP',
        type: 'percent',
        value: 15,
        minOrder: 2000,
        maxUses: 200,
        currentUses: 5,
        description: '15% off on VIP orders over ৳2000',
        active: true,
        expiryDate: '2026-12-31'
      }
    ];
    writeData(promoFile, defaultPromos);
  }

  // 5. Orders (Seed a couple of realistic initial orders to showcase the admin dashboard right away)
  const ordersFile = 'orders.json';
  if (!fs.existsSync(getFilePath(ordersFile))) {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const defaultOrders = [
      {
        id: 'ord_1',
        referenceNo: 'STY-2026-4821',
        createdAt: yesterday.toISOString(),
        customer: {
          name: 'Tanvir Ahmed',
          phone: '01712-345678',
          email: 'tanvir.ahmed@example.com',
          address: 'House 42, Road 11, Sector 4, Uttara',
          landmark: 'Near Sector 4 Park',
          postalCode: '1230',
          city: 'Dhaka',
          deliveryZone: 'inside'
        },
        items: [
          {
            productId: 'prod_1',
            title: 'Heavyweight Drop-Shoulder Oversized Tee',
            price: 890,
            quantity: 2,
            size: 'L',
            color: 'Vintage Ivory',
            image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'
          }
        ],
        subtotal: 1780,
        discount: 178,
        promoCode: 'EXPORT10',
        deliveryFee: 70,
        total: 1672,
        advancePaid: 70,
        balanceDue: 1602,
        paymentMethod: 'cod_advance', // COD with delivery charge prepaid
        paymentProofScreenshot: '/uploads/bangla-qr-sample.svg',
        transactionId: 'TXN982341BK',
        status: 'Pending Verification',
        adminNotes: 'Customer paid ৳70 delivery charge via bKash Bangla QR.',
        emailSent: false,
        verifiedAt: null
      },
      {
        id: 'ord_2',
        referenceNo: 'STY-2026-7719',
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        customer: {
          name: 'Nusrat Jahan',
          phone: '01819-876543',
          email: 'nusrat.jahan@example.com',
          address: 'East Nasirabad, Block B, Road 3',
          landmark: 'Opposite Khulshi Mart',
          postalCode: '4000',
          city: 'Chittagong',
          deliveryZone: 'outside'
        },
        items: [
          {
            productId: 'prod_2',
            title: 'Relaxed Vintage Flannel Overshirt',
            price: 1390,
            quantity: 1,
            size: 'M',
            color: 'Earthy Forest Plaid',
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80'
          }
        ],
        subtotal: 1390,
        discount: 0,
        promoCode: null,
        deliveryFee: 130,
        total: 1520,
        advancePaid: 1520,
        balanceDue: 0,
        paymentMethod: 'bangla_qr_full', // Full prepayment via Bangla QR
        paymentProofScreenshot: '/uploads/bangla-qr-sample.svg',
        transactionId: 'TXN771029NG',
        status: 'Confirmed',
        adminNotes: 'Full payment verified via Nagad Bangla QR. Dispatched via Steadfast Courier.',
        emailSent: true,
        verifiedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
      }
    ];
    writeData(ordersFile, defaultOrders);
  }

  // 6. Customers list
  const customersFile = 'customers.json';
  if (!fs.existsSync(getFilePath(customersFile))) {
    const defaultCustomers = [
      {
        id: 'cust_1',
        name: 'Tanvir Ahmed',
        phone: '01712-345678',
        email: 'tanvir.ahmed@example.com',
        city: 'Dhaka',
        address: 'House 42, Road 11, Sector 4, Uttara',
        totalOrders: 1,
        totalSpent: 1672,
        lastOrderDate: new Date().toISOString()
      },
      {
        id: 'cust_2',
        name: 'Nusrat Jahan',
        phone: '01819-876543',
        email: 'nusrat.jahan@example.com',
        city: 'Chittagong',
        address: 'East Nasirabad, Block B, Road 3',
        totalOrders: 1,
        totalSpent: 1520,
        lastOrderDate: new Date().toISOString()
      }
    ];
    writeData(customersFile, defaultCustomers);
  }

  // 7. Inventory Logs
  const invLogsFile = 'inventory_logs.json';
  if (!fs.existsSync(getFilePath(invLogsFile))) {
    writeData(invLogsFile, [
      {
        id: 'log_1',
        productId: 'prod_1',
        productTitle: 'Heavyweight Drop-Shoulder Oversized Tee',
        type: 'initial_stock',
        quantity: 41,
        size: 'All',
        reason: 'Initial export consignment arrival',
        date: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 'log_2',
        productId: 'prod_1',
        productTitle: 'Heavyweight Drop-Shoulder Oversized Tee',
        type: 'order_deduct',
        quantity: -2,
        size: 'L',
        reason: 'Order #STY-2026-4821 checkout',
        date: new Date(Date.now() - 86400000).toISOString()
      }
    ]);
  }

  // 8. Traffic & Device Tracking data
  const trafficFile = 'traffic.json';
  if (!fs.existsSync(getFilePath(trafficFile))) {
    // Generate some realistic past 7 days traffic with iOS, Android, and PC
    const visits = [];
    const devices = ['Mobile iOS', 'Mobile Android', 'Desktop', 'Tablet'];
    const now = Date.now();
    for (let i = 0; i < 48; i++) {
      const timeOffset = Math.floor(Math.random() * 7 * 86400000);
      const d = new Date(now - timeOffset);
      const randDev = devices[Math.floor(Math.random() * devices.length)];
      visits.push({
        id: `tr_${i + 1}`,
        timestamp: d.toISOString(),
        date: d.toISOString().split('T')[0],
        hour: d.getHours(),
        device: randDev,
        ip: `103.114.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        path: Math.random() > 0.4 ? '/' : '/product/prod_1',
        platform: randDev.includes('iOS') ? 'iPhone' : (randDev.includes('Android') ? 'Android' : 'Windows/Mac')
      });
    }
    writeData(trafficFile, visits);
  }
}

initializeDB();

module.exports = {
  readData,
  writeData
};
