import React, { useState, useEffect } from 'react';
import { 
  Globe, Megaphone, Search, Save, CheckCircle2, ExternalLink, 
  Sparkles, Eye, TrendingUp, AlertCircle, DollarSign, Target, Copy, Check 
} from 'lucide-react';
import { getSeoAndAds, updateSeo, updateGoogleAds } from '../../services/api';

export default function SeoAndAdsManager({ token }) {
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('seo'); // 'seo' or 'ads'

  const [seoData, setSeoData] = useState({
    metaTitle: 'STITCHY | Pure Export Clothing & Apparel Bangladesh',
    metaDescription: 'Authentic pure export overstock garments in Bangladesh. Heavyweight combed cotton tees, vintage flannels, 380 GSM hoodies, and relaxed trousers. Fast delivery inside Dhaka ৳70 & outside Dhaka ৳130.',
    metaKeywords: 'pure export clothing bangladesh, export t-shirts dhaka, heavyweight 240 gsm cotton, flannel overshirts, export hoodies bangladesh, stitchy apparel',
    ogImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
    canonicalUrl: 'https://stitchy.com.bd',
    googleSearchConsoleTag: 'google-site-verification-stitchy-export'
  });

  const [adsData, setAdsData] = useState({
    id: 'AW-11598234-STITCHY',
    active: true,
    budget: '৳500 / day'
  });

  const [savingSeo, setSavingSeo] = useState(false);
  const [savingAds, setSavingAds] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');
  const [copiedKeyword, setCopiedKeyword] = useState('');

  const recommendedKeywords = [
    "pure export clothes bangladesh",
    "heavyweight drop shoulder t-shirt dhaka",
    "240 gsm organic combed cotton tee",
    "export surplus flannel shirts bd",
    "380 gsm fleece hoodie bangladesh",
    "pure export clothing online shop",
    "bangla qr cash on delivery clothing"
  ];

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getSeoAndAds();
        if (res.seo && Object.keys(res.seo).length > 0) setSeoData(res.seo);
        if (res.googleAds) setAdsData(res.googleAds);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSaveSeo = async (e) => {
    e.preventDefault();
    setSavingSeo(true);
    setSuccessNotice('');
    try {
      await updateSeo(seoData, token);
      setSuccessNotice('SEO configuration saved and published to search engines!');
      setTimeout(() => setSuccessNotice(''), 3000);
    } catch (err) {
      alert(err.message || 'Error updating SEO');
    } finally {
      setSavingSeo(false);
    }
  };

  const handleSaveAds = async (e) => {
    e.preventDefault();
    setSavingAds(true);
    setSuccessNotice('');
    try {
      await updateGoogleAds(adsData, token);
      setSuccessNotice('Google Ads tracking tag and campaign parameters updated!');
      setTimeout(() => setSuccessNotice(''), 3000);
    } catch (err) {
      alert(err.message || 'Error updating Google Ads');
    } finally {
      setSavingAds(false);
    }
  };

  const copyKeyword = (kw) => {
    navigator.clipboard.writeText(kw);
    setCopiedKeyword(kw);
    setTimeout(() => setCopiedKeyword(''), 2000);
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-neutral-400">Loading SEO and Ads parameters...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E5DF]">
        <div>
          <h2 className="font-serif-luxury text-xl font-bold text-neutral-900">
            SEO & Google Ads Growth Suite
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Optimize your store for Google Search, Facebook/TikTok link previews, and run targeted Google Ads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {successNotice && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>{successNotice}</span>
            </span>
          )}

          <div className="flex bg-[#F4EFEB] p-1 rounded-xl border border-[#E8E5DF] text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('seo')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'seo' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500'
              }`}
            >
              Search Engine (SEO)
            </button>
            <button
              onClick={() => setActiveSubTab('ads')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'ads' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500'
              }`}
            >
              Google Ads Campaigns
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'seo' ? (
        /* SEO View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* SEO Form (7 cols) */}
          <form onSubmit={handleSaveSeo} className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E8E5DF] space-y-4 text-xs">
            <h3 className="font-serif-luxury text-base font-bold text-neutral-900 flex items-center gap-2">
              <Globe size={16} className="text-[#C5A880]" />
              <span>Google Search & Social Metadata</span>
            </h3>

            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">
                Website Meta Title (50-60 characters recommended)
              </label>
              <input
                type="text"
                required
                value={seoData.metaTitle}
                onChange={(e) => setSeoData((p) => ({ ...p, metaTitle: e.target.value }))}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-medium"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Current length: {seoData.metaTitle.length} characters
              </span>
            </div>

            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">
                Meta Description (Search summary shown on Google)
              </label>
              <textarea
                rows={3}
                required
                value={seoData.metaDescription}
                onChange={(e) => setSeoData((p) => ({ ...p, metaDescription: e.target.value }))}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl leading-relaxed resize-none font-medium"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Current length: {seoData.metaDescription.length} characters (150-160 recommended)
              </span>
            </div>

            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">
                Meta Keywords (Comma-separated)
              </label>
              <input
                type="text"
                value={seoData.metaKeywords}
                onChange={(e) => setSeoData((p) => ({ ...p, metaKeywords: e.target.value }))}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono text-[11px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">
                  Canonical URL / Target Domain
                </label>
                <input
                  type="url"
                  value={seoData.canonicalUrl}
                  onChange={(e) => setSeoData((p) => ({ ...p, canonicalUrl: e.target.value }))}
                  placeholder="https://stitchy.com.bd"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">
                  Google Search Console Verification Tag
                </label>
                <input
                  type="text"
                  value={seoData.googleSearchConsoleTag}
                  onChange={(e) => setSeoData((p) => ({ ...p, googleSearchConsoleTag: e.target.value }))}
                  placeholder="google-site-verification=..."
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">
                Social Share Image URL (OG Image for Facebook/TikTok links)
              </label>
              <input
                type="url"
                value={seoData.ogImage}
                onChange={(e) => setSeoData((p) => ({ ...p, ogImage: e.target.value }))}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono text-[11px]"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={savingSeo}
                className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-md"
              >
                <Save size={14} className="text-[#C5A880]" />
                <span>{savingSeo ? 'Updating...' : 'Save & Publish SEO'}</span>
              </button>
            </div>
          </form>

          {/* Right Column: Google Live Snippet Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            <div className="bg-white p-5 rounded-2xl border border-[#E8E5DF] shadow-xs space-y-3">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <Eye size={13} className="text-[#8C7A6B]" />
                <span>Live Google Search Result Preview</span>
              </span>

              {/* Google Search Result Card */}
              <div className="p-4 bg-[#FFFFFF] rounded-xl border border-neutral-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-xs text-neutral-700">
                  <span className="w-5 h-5 rounded-full bg-neutral-900 text-[#C5A880] flex items-center justify-center font-bold text-[10px]">
                    S
                  </span>
                  <div>
                    <span className="text-[11px] text-[#202124] font-medium block">STITCHY Pure Export</span>
                    <span className="text-[10px] text-[#5f6368] font-mono">{seoData.canonicalUrl || 'https://stitchy.com.bd'}</span>
                  </div>
                </div>

                <h4 className="text-base font-semibold text-[#1a0dab] hover:underline cursor-pointer line-clamp-1 pt-1">
                  {seoData.metaTitle}
                </h4>

                <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                  {seoData.metaDescription}
                </p>
              </div>

              <p className="text-[11px] text-neutral-500">
                This preview updates instantly when you edit titles or descriptions.
              </p>
            </div>

            {/* Recommended High-Volume Clothing Keywords */}
            <div className="bg-white p-5 rounded-2xl border border-[#E8E5DF] shadow-xs space-y-3 text-xs">
              <span className="font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#C5A880]" />
                <span>High-Converting Bangladesh Clothing Keywords</span>
              </span>
              <p className="text-[11px] text-neutral-500">
                Click any keyword to copy into your campaign or product tags:
              </p>

              <div className="flex flex-wrap gap-1.5">
                {recommendedKeywords.map((kw, i) => (
                  <button
                    key={i}
                    onClick={() => copyKeyword(kw)}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#D5CEC5] text-[11px] font-medium text-neutral-800 hover:border-neutral-900 transition-all flex items-center gap-1"
                  >
                    <span>{kw}</span>
                    {copiedKeyword === kw ? <Check size={11} className="text-emerald-600" /> : <Copy size={10} className="text-neutral-400" />}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Google Ads Campaigns View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <form onSubmit={handleSaveAds} className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E8E5DF] space-y-4 text-xs">
            <h3 className="font-serif-luxury text-base font-bold text-neutral-900 flex items-center gap-2">
              <Megaphone size={16} className="text-[#C5A880]" />
              <span>Google Ads Tracking & Budget Parameters</span>
            </h3>

            <div>
              <label className="block font-bold text-neutral-800 uppercase mb-1">
                Google Ads Conversion ID / Measurement Tag
              </label>
              <input
                type="text"
                required
                value={adsData.id}
                onChange={(e) => setAdsData((p) => ({ ...p, id: e.target.value }))}
                placeholder="AW-11598234-XXXX"
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono text-xs"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Found in your Google Ads dashboard under Tools & Settings → Conversions.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">
                  Daily Campaign Budget Target
                </label>
                <input
                  type="text"
                  value={adsData.budget}
                  onChange={(e) => setAdsData((p) => ({ ...p, budget: e.target.value }))}
                  placeholder="৳500 / day"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">
                  Campaign Status
                </label>
                <select
                  value={adsData.active ? 'active' : 'paused'}
                  onChange={(e) => setAdsData((p) => ({ ...p, active: e.target.value === 'active' }))}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-medium"
                >
                  <option value="active">Active & Tracking Conversions</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={savingAds}
                className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-md"
              >
                <Save size={14} className="text-[#C5A880]" />
                <span>{savingAds ? 'Updating...' : 'Save Google Ads Settings'}</span>
              </button>
            </div>
          </form>

          {/* Google Ads Direct Launch Guide (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-white p-5 rounded-2xl border border-[#E8E5DF] shadow-xs space-y-3 text-xs">
              <span className="font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Target size={14} className="text-[#C5A880]" />
                <span>Promote Directly on Google Ads</span>
              </span>

              <p className="text-neutral-600 leading-relaxed text-[11px]">
                You can create targeted Search and Display ads that show your pure export clothing to shoppers in Dhaka, Chittagong, and across Bangladesh.
              </p>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E5DF] space-y-1.5 text-[11px]">
                <div className="font-bold text-neutral-800">Recommended Campaign Strategy:</div>
                <p className="text-neutral-600">• Goal: <b>Sales / Website Traffic</b></p>
                <p className="text-neutral-600">• Location: <b>Bangladesh (Dhaka, Chittagong, Sylhet)</b></p>
                <p className="text-neutral-600">• Target: <b>Age 18-35 (FB & Instagram Fashion shoppers)</b></p>
              </div>

              <a
                href="https://ads.google.com/home/"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-[#4285F4] hover:bg-[#3367d6] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span>Open Google Ads Portal</span>
                <ExternalLink size={14} />
              </a>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
