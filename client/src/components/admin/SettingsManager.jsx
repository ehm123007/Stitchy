import React, { useState, useEffect } from 'react';
import { 
  Settings, QrCode, Upload, Save, CheckCircle2, Phone, 
  Mail, AlertCircle, MessageCircle, Send, Key, ExternalLink,
  HardDrive, FileSpreadsheet, Database, Download, Sparkles
} from 'lucide-react';
import { 
  updateSettings, uploadBanglaQr, testEmailService, 
  getSystemStatus, downloadStoreBackup, restoreStoreBackup 
} from '../../services/api';
import { compressImageToBase64 } from '../../utils/imageCompressor';

export default function SettingsManager({ token, settings, onSettingsUpdated }) {
  const [formData, setFormData] = useState({
    storeName: settings?.storeName || 'STITCHY',
    motto: settings?.motto || 'MADE STITCH BY STITCH',
    tagline: settings?.tagline || '100% Exported Clothes • Global Brands',
    announcement: settings?.announcement || '✨ 100% Exported Clothes • 48-Hour Rapid Delivery Across Bangladesh',
    footerDescription: settings?.footerDescription || 'Authentic 100% exported clothes from leading global brands. Premium fabric, long-lasting construction, modern fits. Wear your story with confidence.',
    banglaQrUrl: settings?.banglaQrUrl || '/uploads/bangla-qr.jpg',
    bkashNumber: settings?.bkashNumber || '01567-932733 (bKash Bangla QR)',
    nagadNumber: settings?.nagadNumber || '01567-932733 (Personal)',
    rocketNumber: settings?.rocketNumber || '01567-932733 (Personal)',
    bankInfo: settings?.bankInfo || 'All Bank Apps / bKash / Nagad / Rocket (Bangla QR Interoperable)',
    deliveryChargeInside: settings?.deliveryChargeInside || 70,
    deliveryChargeOutside: settings?.deliveryChargeOutside || 130,
    supportPhone: settings?.supportPhone || '+880 1875-413743',
    supportEmail: settings?.supportEmail || 'stitchy123007@gmail.com',
    whatsappUrl: settings?.whatsappUrl || 'https://api.whatsapp.com/send/?phone=8801875413743&text&type=phone_number&app_absent=0',
    whatsappNumber: settings?.whatsappNumber || '+8801875413743',
    facebookUrl: settings?.facebookUrl || 'https://www.facebook.com/share/1FMAwBBf6Y/',
    instagramUrl: settings?.instagramUrl || 'https://www.instagram.com/_stit_chy_?srtk=b2hmbXRhNW5leTQz',
    tiktokUrl: settings?.tiktokUrl || 'https://www.tiktok.com/@stitchy710?_r=1&_t=ZS-9BEHb2NGgnV',
    gmailUser: settings?.gmailUser || 'stitchy123007@gmail.com',
    gmailAppPassword: settings?.gmailAppPassword || '',
    emailWebhookUrl: settings?.emailWebhookUrl || '',
    resendApiKey: settings?.resendApiKey || '',
    googleDriveFolderUrl: settings?.googleDriveFolderUrl || 'https://drive.google.com/drive/my-drive'
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [qrUploading, setQrUploading] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [systemStatus, setSystemStatus] = useState({ mongoConnected: false, storageMode: 'ephemeral_disk' });
  const [backupDownloading, setBackupDownloading] = useState(false);
  const [backupRestoring, setBackupRestoring] = useState(false);
  const [backupStatusMsg, setBackupStatusMsg] = useState('');

  useEffect(() => {
    getSystemStatus().then(setSystemStatus).catch(() => {});
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const updated = await updateSettings(formData, token);
      onSettingsUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      alert(err.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrUploading(true);
    try {
      const base64 = await compressImageToBase64(file, 800, 800, 0.88);
      setFormData((prev) => ({ ...prev, banglaQrUrl: base64 }));
      alert('Bangla QR image uploaded and saved into store settings!');
    } catch (err) {
      try {
        const res = await uploadBanglaQr(file, token);
        setFormData((prev) => ({ ...prev, banglaQrUrl: res.banglaQrUrl }));
        alert('Bangla QR image uploaded successfully!');
      } catch (uploadErr) {
        alert('Failed to upload QR code: ' + uploadErr.message);
      }
    } finally {
      setQrUploading(false);
    }
  };

  const handleDownloadBackup = async () => {
    setBackupDownloading(true);
    setBackupStatusMsg('');
    try {
      const data = await downloadStoreBackup(token);
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `stitchy_store_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setBackupStatusMsg('✅ Full store backup JSON file downloaded successfully!');
      setTimeout(() => setBackupStatusMsg(''), 4000);
    } catch (err) {
      alert('Failed to download backup: ' + err.message);
    } finally {
      setBackupDownloading(false);
    }
  };

  const handleRestoreBackup = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm('Are you sure you want to restore the store from this backup file? This will update your catalog, settings, and orders.')) {
      e.target.value = '';
      return;
    }
    setBackupRestoring(true);
    setBackupStatusMsg('');
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await restoreStoreBackup(parsed, token);
      setBackupStatusMsg(`✅ ${res.message || 'Store successfully restored!'}`);
      if (parsed.settings) {
        setFormData((prev) => ({ ...prev, ...parsed.settings }));
        if (onSettingsUpdated) onSettingsUpdated(parsed.settings);
      }
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      alert('Failed to restore backup: ' + err.message);
    } finally {
      setBackupRestoring(false);
      e.target.value = '';
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    setTestResult('');
    try {
      // Save current password first
      await updateSettings(formData, token);
      const res = await testEmailService(token);
      setTestResult(res.message);
    } catch (err) {
      alert(err.message || 'Failed to send test email');
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E5DF]">
        <div>
          <h2 className="font-serif-luxury text-xl font-bold text-neutral-900">
            Store, Official Gmail & WhatsApp Configuration
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure your official Gmail ({formData.supportEmail}), WhatsApp, social links, and Bangla QR.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle2 size={14} />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      {/* Cloud Database Persistence & Store Backup Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8E5DF] space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-serif-luxury text-base font-bold text-neutral-900 flex items-center gap-2">
            <Database size={18} className="text-[#C5A880]" />
            <span>Cloud Database Persistence & Store Backup</span>
          </h3>

          {/* Live Status Badge */}
          <div className="flex items-center gap-2">
            {systemStatus.mongoConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                MongoDB Atlas Connected (100% Persistent)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Running in Ephemeral Host Mode
              </span>
            )}
          </div>
        </div>

        <p className="text-neutral-600 leading-relaxed">
          {systemStatus.mongoConnected ? (
            <>
              ✅ Your store is connected to <b>MongoDB Atlas</b>. All products, prices, images, and orders are permanently preserved in the cloud and will <b>never</b> be lost when Render restarts or sleeps.
            </>
          ) : (
            <>
              ⚠️ Render Free Tier runs in ephemeral containers that restart from GitHub when idle. To make all your products, pricing, and images permanent forever, connect a free <b>MongoDB Atlas</b> database (512MB free, no credit card).
            </>
          )}
        </p>

        {!systemStatus.mongoConnected && (
          <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E5DF] space-y-2">
            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#C5A880]" />
              <span>How to connect Free MongoDB Atlas in 2 minutes:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-neutral-600 pl-1">
              <li>Sign up for free at <a href="https://www.mongodb.com/cloud/atlas/register" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline">mongodb.com/atlas</a> and choose the <b>M0 Free Cluster</b>.</li>
              <li>Under <b>Database Access</b>, add a database user & password.</li>
              <li>Under <b>Network Access</b>, click <i>Add IP Address</i> &gt; <i>Allow Access from Anywhere (0.0.0.0/0)</i>.</li>
              <li>Click <b>Connect &gt; Drivers</b> and copy your connection string (e.g. <code className="bg-white px-1.5 py-0.5 border rounded font-mono text-[10px]">mongodb+srv://user:pass@cluster.mongodb.net/stitchy</code>).</li>
              <li>In your <b>Render Dashboard &gt; Stitchy Service &gt; Environment</b>, add <code className="bg-white px-1.5 py-0.5 border rounded font-mono font-bold text-neutral-900">MONGODB_URI</code> = your connection string. Done! Everything persists forever!</li>
            </ol>
          </div>
        )}

        {/* Backup & Restore Controls */}
        <div className="pt-2 border-t border-[#F0ECE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-bold text-neutral-900">One-Click Store Backup & Restore</div>
            <div className="text-[11px] text-neutral-500">
              Download a complete JSON snapshot of all your products, prices, images, and settings to your computer.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadBackup}
              disabled={backupDownloading}
              className="px-4 py-2.5 bg-neutral-900 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 text-[11px]"
            >
              <Download size={14} className="text-[#C5A880]" />
              <span>{backupDownloading ? 'Exporting...' : '📥 Download Backup (JSON)'}</span>
            </button>

            <label className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F2EFE9] text-neutral-800 font-bold uppercase tracking-wider border border-[#D5CEC5] rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-2xs text-[11px]">
              <Upload size={14} className="text-neutral-600" />
              <span>{backupRestoring ? 'Restoring...' : '📤 Restore Store from File'}</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleRestoreBackup}
                disabled={backupRestoring}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {backupStatusMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-bold flex items-center gap-2">
            <CheckCircle2 size={14} />
            <span>{backupStatusMsg}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Official Google Mail / Email Dispatch Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E5DF] space-y-5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif-luxury text-base font-bold text-neutral-900 flex items-center gap-2">
                <Mail size={18} className="text-[#C5A880]" />
                <span>Official Email System (Customer Receipts & Tracking)</span>
              </h3>
              <p className="text-neutral-500 mt-0.5">
                Automatically dispatches order confirmations from <b>{formData.supportEmail}</b> to customer inboxes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {testResult && (
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {testResult}
                </span>
              )}
              <button
                type="button"
                onClick={handleTestEmail}
                disabled={testingEmail || (!formData.emailWebhookUrl && !formData.resendApiKey && !formData.gmailAppPassword)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-sm text-[11px]"
              >
                <Send size={13} className="text-[#C5A880]" />
                <span>{testingEmail ? 'Sending Test...' : 'Test Email Now'}</span>
              </button>
            </div>
          </div>

          {/* Option 1 (Primary / Recommended): Free Google Apps Script Webhook */}
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E5DF] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="font-bold text-neutral-900 flex items-center gap-1.5 text-xs">
                <Sparkles size={14} className="text-[#C5A880]" />
                <span>Option 1: Free Google Webhook (Recommended for Render Cloud)</span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full inline-block">
                ⚡ 100% Free • Bypasses Cloud Port 465 Restrictions
              </span>
            </div>

            <p className="text-neutral-600 text-[11px] leading-relaxed">
              Cloud hosts like Render block raw email ports (465/587) to prevent spam, causing <i>"Connection timeout"</i>. 
              A Google Apps Script Webhook runs over standard <b>HTTPS (Port 443)</b> directly inside your Google Account to send real emails from <b>{formData.gmailUser}</b>!
            </p>

            <div>
              <label className="block font-bold text-neutral-800 uppercase text-[10px] mb-1">
                Google Web App URL (Paste from script.google.com)
              </label>
              <input
                type="url"
                name="emailWebhookUrl"
                value={formData.emailWebhookUrl}
                onChange={handleInputChange}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full p-2.5 bg-white border border-[#D5CEC5] rounded-xl font-mono text-xs"
              />
            </div>

            {/* 1-Minute Setup Guide */}
            <details className="text-[11px] text-neutral-600 pt-1">
              <summary className="font-bold text-neutral-800 hover:text-black cursor-pointer">
                ▶ View 1-minute setup instructions for script.google.com (Click to expand)
              </summary>
              <div className="mt-2.5 p-3 bg-white border border-[#E8E5DF] rounded-xl space-y-2">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline">script.google.com</a> signed in with <b>stitchy123007@gmail.com</b>.</li>
                  <li>Click <b>New project</b>, erase any existing text, and paste this:</li>
                </ol>
                <pre className="p-2.5 bg-neutral-900 text-emerald-300 font-mono text-[10px] rounded-lg overflow-x-auto select-all">
{`function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    MailApp.sendEmail({ to: data.to, subject: data.subject, htmlBody: data.html });
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`}
                </pre>
                <ol start="3" className="list-decimal list-inside space-y-1">
                  <li>Click <b>Deploy</b> (top right) ➔ <b>New deployment</b>.</li>
                  <li>Click the Gear icon ➔ Select <b>Web app</b>.</li>
                  <li>Set <i>Execute as:</i> <b>Me</b> and <i>Who has access:</i> <b>Anyone</b>.</li>
                  <li>Click <b>Deploy</b>, authorize once, copy the <b>Web app URL</b>, and paste it into the box above!</li>
                </ol>
              </div>
            </details>
          </div>

          {/* Options 2 & 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8E5DF] space-y-2">
              <span className="font-bold text-neutral-900 block text-[11px]">Option 2: Resend API Key (Cloud HTTPS)</span>
              <p className="text-[10px] text-neutral-500">Free transactional email API (3,000 emails/month free at resend.com).</p>
              <input
                type="password"
                name="resendApiKey"
                value={formData.resendApiKey}
                onChange={handleInputChange}
                placeholder="re_123456789..."
                className="w-full p-2 bg-white border border-[#D5CEC5] rounded-lg font-mono text-xs"
              />
            </div>

            <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8E5DF] space-y-2">
              <span className="font-bold text-neutral-900 block text-[11px]">Option 3: Direct Gmail App Password (SMTP)</span>
              <p className="text-[10px] text-neutral-500">Works on local machines or cloud hosts where SMTP port 465 is unblocked.</p>
              <input
                type="password"
                name="gmailAppPassword"
                value={formData.gmailAppPassword}
                onChange={handleInputChange}
                placeholder="16-character app password"
                className="w-full p-2 bg-white border border-[#D5CEC5] rounded-lg font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Google Cloud & Drive Storage Linking Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E5DF] space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-luxury text-base font-bold text-neutral-900 flex items-center gap-2">
              <HardDrive size={18} className="text-[#4285F4]" />
              <span>Google Drive & Cloud Storage Linking</span>
            </h3>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              Cloud Backup & Sync
            </span>
          </div>

          <p className="text-neutral-600 leading-relaxed">
            Link your official Google Drive folder for saving customer payment screenshots, order backups, and courier shipment lists. You can also download the latest orders formatted for Google Sheets with a single click.
          </p>

          <div>
            <label className="block font-bold text-neutral-800 uppercase mb-1">
              Google Drive Folder / Workspace Link
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                name="googleDriveFolderUrl"
                value={formData.googleDriveFolderUrl}
                onChange={handleInputChange}
                placeholder="https://drive.google.com/drive/folders/..."
                className="flex-1 p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono text-xs"
              />
              <a
                href={formData.googleDriveFolderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#F2EFE9] text-neutral-800 font-bold border border-[#D5CEC5] rounded-xl flex items-center gap-1.5 transition-all shrink-0"
              >
                <ExternalLink size={14} className="text-[#4285F4]" />
                <span>Open Drive</span>
              </a>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => window.open(`/api/orders/export-csv?token=${encodeURIComponent(token)}`, '_blank')}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <FileSpreadsheet size={14} />
              <span>Export All Orders for Google Sheets / Excel</span>
            </button>
            <span className="text-[11px] text-neutral-500">
              Direct CSV importable into Google Drive / Google Sheets
            </span>
          </div>
        </div>

        {/* Official WhatsApp & Customer Contact Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E5DF] space-y-4 text-xs">
          <h3 className="font-serif-luxury text-base font-bold text-neutral-900 flex items-center gap-2">
            <MessageCircle size={18} className="text-[#25D366]" />
            <span>WhatsApp & Customer Messaging Integration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">WhatsApp API Direct Link</label>
              <input
                type="url"
                name="whatsappUrl"
                value={formData.whatsappUrl}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">WhatsApp Mobile Number</label>
              <input
                type="text"
                name="supportPhone"
                value={formData.supportPhone}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        {/* Bangla QR Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E5DF] space-y-4">
          <h3 className="font-serif-luxury text-base font-bold text-neutral-900 flex items-center gap-2">
            <QrCode size={18} className="text-[#0F5132]" />
            <span>Official bKash Bangla QR Code</span>
          </h3>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-44 bg-[#FAF8F5] rounded-2xl border border-[#E8E5DF] p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
              <img
                src={formData.banglaQrUrl}
                alt="Current bKash Bangla QR"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>

            <div className="space-y-3 flex-1 text-xs">
              <p className="text-neutral-600 leading-relaxed">
                Your live bKash Bangla QR code is active on the website for both full prepayments and COD delivery charge prepayments.
              </p>

              <div>
                <label className="px-4 py-2.5 bg-neutral-900 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-neutral-800 cursor-pointer inline-flex items-center gap-2 transition-all shadow-md">
                  <Upload size={14} className="text-[#C5A880]" />
                  <span>{qrUploading ? 'Uploading...' : 'Replace Bangla QR Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrUpload}
                    disabled={qrUploading}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-[11px] text-neutral-400">
                Current Number: <b>01567-932733</b>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Wallets */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E5DF] space-y-4 text-xs">
          <h3 className="font-serif-luxury text-base font-bold text-neutral-900">
            Bangla QR & Payment Numbers
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">bKash Bangla QR Number</label>
              <input
                type="text"
                name="bkashNumber"
                value={formData.bkashNumber}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">Nagad Number</label>
              <input
                type="text"
                name="nagadNumber"
                value={formData.nagadNumber}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">Delivery Charge: Inside Dhaka (৳)</label>
              <input
                type="number"
                name="deliveryChargeInside"
                value={formData.deliveryChargeInside}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">Delivery Charge: Outside Dhaka (৳)</label>
              <input
                type="number"
                name="deliveryChargeOutside"
                value={formData.deliveryChargeOutside}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Social Channels */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E5DF] space-y-4 text-xs">
          <h3 className="font-serif-luxury text-base font-bold text-neutral-900">
            Official Social Media Links
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">Facebook Page URL</label>
              <input
                type="url"
                name="facebookUrl"
                value={formData.facebookUrl}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">Instagram URL</label>
              <input
                type="url"
                name="instagramUrl"
                value={formData.instagramUrl}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">TikTok Profile URL</label>
              <input
                type="url"
                name="tiktokUrl"
                value={formData.tiktokUrl}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Store Brand Identity & Text Customization */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E5DF] space-y-4 text-xs">
          <h3 className="font-serif-luxury text-base font-bold text-neutral-900 flex items-center gap-2">
            <Settings size={18} className="text-[#C5A880]" />
            <span>Store Brand Identity, Mottos & Customer-Facing Texts</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">Store Name</label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">Official Brand Motto</label>
              <input
                type="text"
                name="motto"
                value={formData.motto}
                onChange={handleInputChange}
                placeholder="e.g. MADE STITCH BY STITCH"
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">Catalog Tagline</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleInputChange}
                placeholder="e.g. 100% Exported Clothes • Global Brands"
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">Top Announcement Ticker</label>
              <input
                type="text"
                name="announcement"
                value={formData.announcement}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-neutral-800 uppercase mb-1">Footer Brand Mission / Description</label>
              <textarea
                rows={2}
                name="footerDescription"
                value={formData.footerDescription}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Save size={16} className="text-[#C5A880]" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
