import React, { useState } from 'react';
import { 
  Sparkles, Upload, Plus, Trash2, Eye, EyeOff, Save, CheckCircle2, 
  ExternalLink, Image as ImageIcon, Layout, Tag, MoveUp, MoveDown
} from 'lucide-react';
import { updateSettings, uploadProductImage } from '../../services/api';

export default function BannersAndAdsManager({ token, settings, onSettingsUpdated }) {
  const [formData, setFormData] = useState({
    announcement: settings?.announcement || '✨ 100% Pure Export Overstock Garments • 48-Hour Rapid Delivery Across Bangladesh',
    coverUrl: settings?.coverUrl || '/cover.jpg',
    heroHeadline: settings?.heroHeadline || 'Good Fit. Better Days.',
    heroSubtitle: settings?.heroSubtitle || 'Made Stitch By Stitch • Export Overstock Ready for 24-48h Delivery Across Bangladesh',
    heroButtonText: settings?.heroButtonText || 'Shop Collection',
    showHeroBanner: settings?.showHeroBanner !== false,
    campaignBanners: settings?.campaignBanners || [
      {
        id: 'banner_1',
        title: 'Pure Export Heavyweight Cotton Collection',
        badge: 'Campaign Drop',
        subtitle: '240+ GSM Organic Combed Cotton • European Overstock Lots',
        imageUrl: '/cover.jpg',
        link: '#catalog-section',
        active: true
      }
    ],
    brandPillars: settings?.brandPillars || [
      { id: 'p1', icon: '🧵', title: 'Premium Fabric', subtitle: '240+ GSM Organic Cotton' },
      { id: 'p2', icon: '🛡️', title: 'Long Lasting', subtitle: 'Reinforced Double Stitching' },
      { id: 'p3', icon: '👔', title: 'Modern Fit', subtitle: 'Drop-Shoulder Streetwear Cuts' },
      { id: 'p4', icon: '🤍', title: 'Wear Your Story', subtitle: 'Global Brands Quality' }
    ]
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [newAdModalOpen, setNewAdModalOpen] = useState(false);

  // New Ad form state
  const [newAd, setNewAd] = useState({
    title: '',
    badge: 'Special Campaign',
    subtitle: '',
    imageUrl: '',
    link: '#catalog-section',
    active: true
  });
  const [uploadingAdImg, setUploadingAdImg] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const updated = await updateSettings(formData, token);
      onSettingsUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      alert(err.message || 'Error updating homepage banners and decorations');
    } finally {
      setSaving(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const res = await uploadProductImage(file, token);
      setFormData((prev) => ({ ...prev, coverUrl: res.url }));
    } catch (err) {
      alert('Failed to upload cover picture');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleAdImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAdImg(true);
    try {
      const res = await uploadProductImage(file, token);
      setNewAd((prev) => ({ ...prev, imageUrl: res.url }));
    } catch (err) {
      alert('Failed to upload ad image');
    } finally {
      setUploadingAdImg(false);
    }
  };

  const handleAddCampaignBanner = () => {
    if (!newAd.imageUrl) {
      alert('Please upload an image or enter an image URL for the campaign poster.');
      return;
    }
    const created = {
      ...newAd,
      id: `banner_${Date.now()}`
    };
    setFormData((prev) => ({
      ...prev,
      campaignBanners: [...(prev.campaignBanners || []), created]
    }));
    setNewAd({
      title: '',
      badge: 'Special Campaign',
      subtitle: '',
      imageUrl: '',
      link: '#catalog-section',
      active: true
    });
    setNewAdModalOpen(false);
  };

  const handleDeleteBanner = (id) => {
    if (!window.confirm('Delete this campaign poster/ad?')) return;
    setFormData((prev) => ({
      ...prev,
      campaignBanners: prev.campaignBanners.filter((b) => b.id !== id)
    }));
  };

  const handleToggleBannerActive = (id) => {
    setFormData((prev) => ({
      ...prev,
      campaignBanners: prev.campaignBanners.map((b) =>
        b.id === id ? { ...b, active: !b.active } : b
      )
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E5DF] shadow-xs">
        <div>
          <h2 className="font-serif-luxury text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Layout size={20} className="text-[#C5A880]" />
            <span>Homepage Pictures, Banners & Campaign Ads</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Full control over the hero cover photo, promotional posters, campaign ads, top announcements, and trust badges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 size={14} />
              <span>Changes Saved Live!</span>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <Save size={14} className="text-[#C5A880]" />
            <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {/* 1. Main Hero Cover Banner Section */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8E5DF] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E5DF] pb-3">
          <div>
            <h3 className="font-serif-luxury text-base font-bold text-neutral-900 flex items-center gap-2">
              <ImageIcon size={18} className="text-[#C5A880]" />
              <span>Main Hero Cover Banner & Poster</span>
            </h3>
            <p className="text-xs text-neutral-500">
              This is the large showcase poster that visitors first see when landing on the site.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-700">
            <input
              type="checkbox"
              checked={formData.showHeroBanner}
              onChange={(e) => setFormData((p) => ({ ...p, showHeroBanner: e.target.checked }))}
              className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900"
            />
            <span>Show Main Banner on Homepage</span>
          </label>
        </div>

        {/* Live Preview & Uploader */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-[#D5CEC5] shadow-md bg-neutral-900 aspect-[2.4/1]">
              <img
                src={formData.coverUrl}
                alt="Main Homepage Cover Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <div className="text-white space-y-0.5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">Live Preview</div>
                  <div className="text-base font-serif-luxury font-bold drop-shadow-sm">{formData.heroHeadline}</div>
                  <div className="text-[11px] text-neutral-200 truncate max-w-sm drop-shadow-sm">{formData.heroSubtitle}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 transition-all shadow-sm">
                <Upload size={14} className="text-[#C5A880]" />
                <span>{uploadingCover ? 'Uploading...' : 'Replace Cover Picture'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  disabled={uploadingCover}
                  className="hidden"
                />
              </label>

              <span className="text-[11px] text-neutral-400">
                Recommended: 1200x500px or panoramic landscape photo
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3 text-xs">
            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">Headline Text</label>
              <input
                type="text"
                value={formData.heroHeadline}
                onChange={(e) => setFormData((p) => ({ ...p, heroHeadline: e.target.value }))}
                placeholder="Good Fit. Better Days."
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">Subtitle / Campaign Notice</label>
              <input
                type="text"
                value={formData.heroSubtitle}
                onChange={(e) => setFormData((p) => ({ ...p, heroSubtitle: e.target.value }))}
                placeholder="Made Stitch By Stitch • Export Overstock Ready for 24-48h Delivery"
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">CTA Button Text</label>
              <input
                type="text"
                value={formData.heroButtonText}
                onChange={(e) => setFormData((p) => ({ ...p, heroButtonText: e.target.value }))}
                placeholder="Shop Collection"
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">Cover Image Direct URL</label>
              <input
                type="text"
                value={formData.coverUrl}
                onChange={(e) => setFormData((p) => ({ ...p, coverUrl: e.target.value }))}
                placeholder="/cover.jpg or https://..."
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Promotional Posters & Campaign Ads Manager */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8E5DF] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E5DF] pb-3">
          <div>
            <h3 className="font-serif-luxury text-base font-bold text-neutral-900 flex items-center gap-2">
              <Tag size={18} className="text-[#C5A880]" />
              <span>Promotional Posters, Campaign Banners & Ads</span>
            </h3>
            <p className="text-xs text-neutral-500">
              Add new campaign posters, Eid/Winter sales flyers, or special export drop promotions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setNewAdModalOpen(true)}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center gap-1.5 shadow-md"
          >
            <Plus size={15} className="text-[#C5A880]" />
            <span>Add New Campaign Poster / Ad</span>
          </button>
        </div>

        {/* Existing Campaign Banners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(!formData.campaignBanners || formData.campaignBanners.length === 0) ? (
            <div className="md:col-span-2 p-8 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-[#D5CEC5] text-xs text-neutral-500">
              No additional campaign posters added yet. Click "+ Add New Campaign Poster / Ad" above to feature new campaigns!
            </div>
          ) : (
            formData.campaignBanners.map((ad, idx) => (
              <div 
                key={ad.id || idx}
                className={`p-4 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                  ad.active 
                    ? 'bg-white border-[#D5CEC5] shadow-xs' 
                    : 'bg-[#F9F8F6] border-neutral-200 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className="relative aspect-[2.2/1] rounded-xl overflow-hidden bg-neutral-900 border border-[#E8E5DF]">
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                    {ad.badge && (
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-[#C5A880] shadow-sm">
                        {ad.badge}
                      </span>
                    )}
                    {!ad.active && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                        Hidden (Inactive)
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-serif-luxury font-bold text-sm text-neutral-900">
                      {ad.title || 'Untitled Poster'}
                    </h4>
                    {ad.subtitle && (
                      <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">
                        {ad.subtitle}
                      </p>
                    )}
                    <div className="text-[11px] font-mono text-[#8C7A6B] mt-1">
                      Link: {ad.link || '#catalog-section'}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F0ECE6] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleBannerActive(ad.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      ad.active
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                    }`}
                  >
                    {ad.active ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span>{ad.active ? 'Active' : 'Disabled'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteBanner(ad.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Poster"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Homepage Decorative Pillars / Trust Badges */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8E5DF] space-y-4 text-xs">
        <h3 className="font-serif-luxury text-base font-bold text-neutral-900">
          Homepage 4 Trust Badges / Decorative Pillars
        </h3>
        <p className="text-neutral-500">
          Customize the 4 badges shown below the hero (matching your official brand cover).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {formData.brandPillars?.map((p, idx) => (
            <div key={p.id || idx} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D5CEC5] space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={p.icon}
                  onChange={(e) => {
                    const copy = [...formData.brandPillars];
                    copy[idx].icon = e.target.value;
                    setFormData((prev) => ({ ...prev, brandPillars: copy }));
                  }}
                  className="w-10 text-center text-lg p-1 bg-white border border-[#D5CEC5] rounded-lg"
                  title="Emoji / Icon"
                />
                <input
                  type="text"
                  value={p.title}
                  onChange={(e) => {
                    const copy = [...formData.brandPillars];
                    copy[idx].title = e.target.value;
                    setFormData((prev) => ({ ...prev, brandPillars: copy }));
                  }}
                  placeholder="Badge Title"
                  className="flex-1 p-1.5 bg-white border border-[#D5CEC5] rounded-lg font-bold text-xs"
                />
              </div>

              <input
                type="text"
                value={p.subtitle}
                onChange={(e) => {
                  const copy = [...formData.brandPillars];
                  copy[idx].subtitle = e.target.value;
                  setFormData((prev) => ({ ...prev, brandPillars: copy }));
                }}
                placeholder="Badge Description"
                className="w-full p-1.5 bg-white border border-[#D5CEC5] rounded-lg text-[11px]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Top Announcement Ticker */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8E5DF] space-y-3 text-xs">
        <h3 className="font-serif-luxury text-base font-bold text-neutral-900">
          Top Header Announcement Bar Ticker
        </h3>
        <input
          type="text"
          value={formData.announcement}
          onChange={(e) => setFormData((p) => ({ ...p, announcement: e.target.value }))}
          placeholder="e.g. ✨ 100% Pure Export Overstock Garments • 48-Hour Rapid Delivery Across Bangladesh"
          className="w-full p-3 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-medium text-xs"
        />
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center gap-1.5 shadow-md"
          >
            <Save size={14} className="text-[#C5A880]" />
            <span>Save All Homepage Settings</span>
          </button>
        </div>
      </div>

      {/* Modal: Add New Campaign Poster / Ad */}
      {newAdModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full border border-[#E8E5DF] shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3">
              <h3 className="font-serif-luxury text-lg font-bold text-neutral-900">
                Add New Campaign Poster / Promo Ad
              </h3>
              <button onClick={() => setNewAdModalOpen(false)} className="text-neutral-400 hover:text-black">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">Campaign Poster Image *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAd.imageUrl}
                    onChange={(e) => setNewAd((p) => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="Upload image or paste URL https://..."
                    className="flex-1 p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono text-[11px]"
                  />
                  <label className="px-3.5 py-2.5 bg-neutral-900 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload size={14} className="text-[#C5A880]" />
                    <span>{uploadingAdImg ? 'Uploading...' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleAdImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {newAd.imageUrl && (
                <div className="aspect-[2.2/1] rounded-xl overflow-hidden border border-[#D5CEC5] bg-black">
                  <img src={newAd.imageUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={newAd.title}
                  onChange={(e) => setNewAd((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Flash Drop: 20% Off All Heavy Flannels"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-800 uppercase mb-1">Tag / Badge</label>
                  <input
                    type="text"
                    value={newAd.badge}
                    onChange={(e) => setNewAd((p) => ({ ...p, badge: e.target.value }))}
                    placeholder="e.g. Limited Offer, Flash Drop"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 uppercase mb-1">Target Link</label>
                  <input
                    type="text"
                    value={newAd.link}
                    onChange={(e) => setNewAd((p) => ({ ...p, link: e.target.value }))}
                    placeholder="#catalog-section or category"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={newAd.subtitle}
                  onChange={(e) => setNewAd((p) => ({ ...p, subtitle: e.target.value }))}
                  placeholder="e.g. Premium brushed cotton twill with authentic horn buttons. 48h delivery."
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewAdModalOpen(false)}
                  className="flex-1 py-2.5 border border-[#D5CEC5] rounded-xl text-neutral-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCampaignBanner}
                  className="flex-1 py-2.5 bg-neutral-900 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-neutral-800"
                >
                  Add Poster to Homepage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}