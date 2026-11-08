import React, { useState } from 'react';
import { 
  ShoppingBag, Package, Tag, BarChart3, Users, Settings, 
  LogOut, ExternalLink, ShieldCheck, UserCheck, Bell, ChevronRight, Globe, Layout 
} from 'lucide-react';
import OrdersManager from './admin/OrdersManager';
import InventoryManager from './admin/InventoryManager';
import PromoManager from './admin/PromoManager';
import AnalyticsView from './admin/AnalyticsView';
import CustomersManager from './admin/CustomersManager';
import TeamManager from './admin/TeamManager';
import SettingsManager from './admin/SettingsManager';
import SeoAndAdsManager from './admin/SeoAndAdsManager';
import BannersAndAdsManager from './admin/BannersAndAdsManager';

export default function AdminDashboard({ token, user, onLogout, onBackToStore, settings, onSettingsUpdated }) {
  const [activeTab, setActiveTab] = useState('orders');

  const navItems = [
    { id: 'orders', label: 'Orders & Proofs', icon: ShoppingBag, badge: 'Incoming' },
    { id: 'inventory', label: 'Clothes & Stock', icon: Package },
    { id: 'banners', label: 'Homepage Ads & Posters', icon: Layout, badge: 'Design' },
    { id: 'promos', label: 'Promo Campaigns', icon: Tag },
    { id: 'analytics', label: 'Device & Traffic', icon: BarChart3 },
    { id: 'customers', label: 'Customers CRM', icon: Users },
    { id: 'seo_ads', label: 'SEO & Google Ads', icon: Globe },
    { id: 'team', label: 'Team Access', icon: UserCheck },
    { id: 'settings', label: 'Bangla QR & Mail Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col md:flex-row text-neutral-900">
      
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-[#121212] text-[#FDFBF7] flex flex-col justify-between shrink-0 border-r border-neutral-800">
        <div>
          {/* Brand Logo in sidebar */}
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.jpg" 
                alt="Stitchy" 
                className="w-10 h-10 object-contain rounded-xl border border-neutral-700 bg-white p-0.5 shrink-0"
              />
              <div>
                <span className="font-serif-luxury text-xl font-bold tracking-wide text-white block leading-tight">
                  Stitchy
                </span>
                <span className="text-[9px] tracking-[0.2em] font-bold text-[#C5A880] uppercase block">
                  MADE STITCH BY STITCH
                </span>
              </div>
            </div>
            <span className="p-1.5 rounded-lg bg-neutral-800 text-[#C5A880]">
              <ShieldCheck size={16} />
            </span>
          </div>

          {/* Current Staff User Card */}
          <div className="p-4 mx-4 my-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C5A880] text-neutral-950 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-white truncate">{user?.name || 'Administrator'}</div>
              <div className="text-[10px] text-[#8C7A6B] truncate">{user?.role || 'Super Admin'}</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#C5A880] text-neutral-950 font-bold shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? 'text-neutral-950' : 'text-[#8C7A6B]'} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-neutral-800 space-y-2">
          <button
            onClick={onBackToStore}
            className="w-full py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink size={14} className="text-[#C5A880]" />
            <span>View Live Storefront</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full py-2 px-3 text-neutral-400 hover:text-red-400 text-xs font-medium transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header bar */}
        <header className="bg-white border-b border-[#E8E5DF] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Dashboard</span>
            <span className="text-neutral-300">/</span>
            <span className="text-xs font-bold text-neutral-900 capitalize">
              {navItems.find((n) => n.id === activeTab)?.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="px-3.5 py-1.5 bg-[#F4EFEB] hover:bg-[#EAE4DC] text-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#D5CEC5]"
            >
              <ExternalLink size={13} className="text-[#8C7A6B]" />
              <span className="hidden sm:inline">Go to Website</span>
            </button>
          </div>
        </header>

        {/* View Container */}
        <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'orders' && <OrdersManager token={token} />}
          {activeTab === 'inventory' && <InventoryManager token={token} />}
          {activeTab === 'banners' && (
            <BannersAndAdsManager
              token={token}
              settings={settings}
              onSettingsUpdated={onSettingsUpdated}
            />
          )}
          {activeTab === 'promos' && <PromoManager token={token} />}
          {activeTab === 'analytics' && <AnalyticsView token={token} />}
          {activeTab === 'customers' && <CustomersManager token={token} />}
          {activeTab === 'seo_ads' && <SeoAndAdsManager token={token} />}
          {activeTab === 'team' && <TeamManager token={token} currentUser={user} />}
          {activeTab === 'settings' && (
            <SettingsManager
              token={token}
              settings={settings}
              onSettingsUpdated={onSettingsUpdated}
            />
          )}
        </div>

      </main>

    </div>
  );
}
