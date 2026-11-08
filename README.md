# STITCHY — Pure Export Clothing E-Commerce & Operations Platform

An aesthetic, minimal, luxury-styled e-commerce website designed specifically for high-end pure export clothing brands in Bangladesh selling across Facebook, Instagram, and TikTok.

---

## 🌟 Key Features & Updates

### 🛍️ Customer Storefront (PC, iOS, Android Optimized)
- **Direct WhatsApp Buttons & Floating Chat Widget**: 
  - Direct WhatsApp link: `https://api.whatsapp.com/send/?phone=8801875413743` (+880 1875-413743).
  - Prominent WhatsApp contact buttons in header, announcement ticker, hero, and footer.
  - Floating WhatsApp widget in bottom-right corner with instant inquiry prompts.
- **Official Social Channels Connected**:
  - **Facebook Page:** [https://www.facebook.com/share/1FMAwBBf6Y/](https://www.facebook.com/share/1FMAwBBf6Y/)
  - **Instagram:** [https://www.instagram.com/_stit_chy_](https://www.instagram.com/_stit_chy_?srtk=b2hmbXRhNW5leTQz)
  - **TikTok:** [https://www.tiktok.com/@stitchy710](https://www.tiktok.com/@stitchy710?_r=1&_t=ZS-9BEHb2NGgnV)
  - **Official Email:** `stitchy123007@gmail.com`
- **Customer Gmail Login & Order Tracking**:
  - Customers can sign in with their Gmail profile across any phone, tablet, or PC.
  - View real-time order history, tracking status, courier details, and 1-click WhatsApp order tracking.
- **bKash Bangla QR & Delivery System**:
  - Prepayment with official bKash Bangla QR (`01567932733`).
  - Inside Dhaka ৳70 delivery charge; Outside Dhaka ৳130 delivery charge.
  - Cash on delivery with delivery charge prepayment proof attachment.

---

### 🛡️ Protected Admin & Operations Dashboard
- **Courier Shipping Label Strip Printer (Exact 1/4 A4 Height • Full A4 Width)**:
  - Specially formatted to fit standard courier parcel pouches (Steadfast, Pathao, RedX).
  - Prominently displays recipient name, phone, full address, landmark, delivery zone, and **COD Cash Collection Amount**.
  - 1-click print directly from the Orders Manager.
- **Official Gmail SMTP Sending**:
  - Send real confirmation emails directly to customer inboxes from `stitchy123007@gmail.com`.
  - Connect via Google App Password in Admin Settings with a built-in test button.
- **1-Click WhatsApp Customer Messaging**:
  - Message any customer on WhatsApp directly from their order row with prefilled order details.
- **SEO & Google Ads Growth Suite**:
  - Google Ads conversion tag tracking and daily budget manager.
  - SEO Meta Titles, Descriptions, Keywords, OpenGraph (OG) image, and Google Search Console verification.
  - Live Google Search snippet preview.
- **Real-Time Stock Inventory & Audit Trail**:
  - Automatic stock deduction on checkout.
  - Manual adjustments for Facebook Live and TikTok DM sales.

---

## 🚀 How to Run Locally

### 1. One-Click Desktop Icon
- Double-click the **`STITCHY - Open Website`** icon on your **Windows Desktop**!
- Or open: **http://localhost:5000**

### 2. Terminal
```powershell
npm start
```

---

## 🔑 Admin Access
- **Super Admin:** `stitchy123007@gmail.com` (Password: `admin123`)
- **Secondary Admin:** `admin@stitchy.com` (Password: `admin123`)
- **Direct Admin Route:** `http://localhost:5000/#admin` or `http://localhost:5000/admin`
- **Secret Keyboard Shortcut:** `Ctrl + Shift + A`
- **Secret Click:** Double-click the footer copyright line (`© 2026 STITCHY`).
*(Note: Public links to the Admin portal are intentionally hidden from standard visitors).*

---

## 💻 Developer Architecture & Setup Guide

This project is built as a clean, decoupled full-stack JavaScript application:

```
c:\Stitchy gemini\
├── client/                 # React 18 + Vite + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/     # Storefront components (Navbar, Hero, Checkout, etc.)
│   │   │   └── admin/      # Admin modules (Inventory, Orders, Banners/Ads, SEO)
│   │   ├── App.jsx         # Main application orchestrator & routing
│   │   └── index.css       # Global styles & luxury design tokens
│   └── package.json
├── server/                 # Express backend REST API
│   ├── data/               # Persistent JSON storage (products, orders, users, settings)
│   ├── uploads/            # Uploaded product pictures, banner posters, Bangla QR
│   └── server.js           # Express API endpoints & static client serving
├── package.json            # Root scripts (`npm run build`, `npm start`)
└── .gitignore              # Ignores node_modules and build artifacts for easy sharing
```

### Quick Commands for Developers:
1. **Install Dependencies:**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```
2. **Build Client:**
   ```bash
   npm run build
   ```
3. **Start Production Server:**
   ```bash
   npm start
   ```
   *(Runs on `http://localhost:5000`)*

4. **Independent Frontend Development:**
   ```bash
   cd client
   npm run dev
   ```

---

## 🌐 How to Add to GitHub & Publish Online

### Step 1: Initialize Git & Push to GitHub
1. Create a free account at [GitHub.com](https://github.com) if you haven't already.
2. Click **New Repository**, name it `stitchy-export-clothing`, and set it to **Private** or **Public**.
3. In PowerShell in `c:\Stitchy gemini`, run:
   ```powershell
   git init
   git add .
   git commit -m "STITCHY Export Apparel launch ready"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/stitchy-export-clothing.git
   git push -u origin main
   ```

---

### Step 2: Free Hosting on Render or Railway (Supports Backend, Database & Gmail)
Because your website has a backend server to handle orders, stock deduction, Bangla QR file uploads, and Gmail sending, a full-stack node host like **Render** or **Railway** is ideal:

1. Go to [Render.com](https://render.com) and sign up with your GitHub account.
2. Click **"New +" → "Web Service"**.
3. Select your GitHub repository (`stitchy-export-clothing`).
4. Configure:
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Click **"Create Web Service"**. Render will deploy your website online for free with an HTTPS address (e.g. `stitchy-apparel.onrender.com`).

---

### Step 3: How to Connect Your Custom Domain Later (e.g. `stitchy.com.bd` or `stitchybd.com`)
When you buy your custom domain name from a registrar (such as DianaHost, ExonHost, Namecheap, or GoDaddy):

1. **In Render Dashboard**:
   - Go to your service → Click **"Settings"** → Scroll to **"Custom Domains"**.
   - Click **"Add Custom Domain"**, enter your domain (e.g. `stitchy.com.bd` or `www.stitchy.com.bd`).
2. **In Your Domain Registrar's DNS Settings**:
   - Add a **CNAME** record:
     - **Name / Host:** `www`
     - **Value / Target:** your Render service address (e.g. `stitchy-apparel.onrender.com`).
   - Add an **A record** pointing `@` to the IP address shown in your Render settings.
3. Render automatically provisions a free SSL Certificate (HTTPS) for your domain within 15–30 minutes!
