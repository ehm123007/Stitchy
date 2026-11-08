import React, { useState } from 'react';
import { 
  Settings, QrCode, Upload, Save, CheckCircle2, Phone, 
  Mail, AlertCircle, MessageCircle, Send, Key, ExternalLink,
  HardDrive, FileSpreadsheet
} from 'lucide-react';
import { updateSettings, uploadBanglaQr, testEmailService } from '../../services/api';

export default function SettingsManager({ token, settings, onSettingsUpdated }) {
  const [formData, setFormData] = useState({
    storeName: settings?.storeName || 'STITCHY',
    tagline: settings?.tagline || 'Pure Export Apparel & Overstock Collections',
    banglaQrUrl: settings?.banglaQrUrl || '/uploads/bangla-qr.jpg',
    bkashNumber: settings?.bkashNumber || '01567-932733 (bKash Bangla QR)',
    nagadNumber: settings?.nagadNumber || '01567-932733 (Personal)',
    rocketNumber: settings?.rocketNumber || '01567-932733 (Personal)',
    bankInfo: settings?.bankInfo || 'All Bank Apps / bKash / Nagad / Rocket (Bangla QR Interoperable)',
    deliveryChargeInside: settings?.deliveryChargeInside || 70,
    deliveryChargeOutside: settings?.deliveryChargeOutside || 130,
    announcement: settings?.announcement || '✨ 100% Pure Export Overstock Garments • 48-Hour Rapid Delivery Across Bangladesh',
    supportPhone: settings?.supportPhone || '+880 1875-413743',
    supportEmail: settings?.supportEmail || 'stitchy123007@gmail.com',
    whatsappUrl: settings?.whatsappUrl || 'https://api.whatsapp.com/send/?phone=8801875413743&text&type=phone_number&app_absent=0',
    whatsappNumber: settings?.whatsappNumber || '+8801875413743',
    facebookUrl: settings?.facebookUrl || 'https://www.facebook.com/share/1FMAwBBf6Y/',
    instagramUrl: settings?.instagramUrl || 'https://www.instagram.com/_stit_chy_?srtk=b2hmbXRhNW5leTQz',
    tiktokUrl: settings?.tiktokUrl || 'https://www.tiktok.com/@stitchy710?_r=1&_t=ZS-9BEHb2NGgnV',
    gmailUser: settings?.gmailUser || 'stitchy123007@gmail.com',
    gmailAppPassword: settings?.gmailAppPassword || '',
    googleDriveFolderUrl: settings?.googleDriveFolderUrl || 'https://drive.google.com/drive/my-drive'
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [qrUploading, setQrUploading] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState('');

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
      const res = await uploadBanglaQr(file, token);
      setFormData((prev) => ({ ...prev, banglaQrUrl: res.banglaQrUrl }));
      alert('Bangla QR image uploaded successfully!');
    } catch (err) {
      alert('Failed to upload QR code');
    } finally {
      setQrUploading(false);
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

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Official Gmail Sending Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E5DF] space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-luxury text-base font-bold text-neutral-900 flex items-center gap-2">
              <Mail size={18} className="text-[#C5A880]" />
              <span>Official Google Mail (Gmail SMTP Integration)</span>
            </h3>

            {testResult && (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {testResult}
              </span>
            )}
          </div>

          <p className="text-neutral-600 leading-relaxed">
            Send order confirmation receipts and shipping updates directly from your official email <b>{formData.supportEmail}</b> to customer inboxes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">Official Sender Gmail</label>
              <input
                type="email"
                name="gmailUser"
                value={formData.gmailUser}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">
                Google 16-Character App Password
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  name="gmailAppPassword"
                  value={formData.gmailAppPassword}
                  onChange={handleInputChange}
                  placeholder="e.g. abcd efgh ijkl mnop"
                  className="flex-1 p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testingEmail || !formData.gmailAppPassword}
                  className="px-3.5 py-2 bg-neutral-900 text-white rounded-xl font-bold uppercase hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Send size={12} />
                  <span>{testingEmail ? 'Testing...' : 'Test Mail'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Guide to Google App Password */}
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E5DF] text-[11px] text-neutral-600 space-y-1">
            <span className="font-bold text-neutral-800">📌 How to generate your 16-character Google App Password:</span>
            <p>1. Go to your Google Account at <b>myaccount.google.com</b> with <b>stitchy123007@gmail.com</b>.</p>
            <p>2. Click <b>Security</b> → Enable <b>2-Step Verification</b>.</p>
            <p>3. Search for <b>"App passwords"</b> in Google settings, generate a password for "Mail / Other", and paste the 16 characters here!</p>
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
