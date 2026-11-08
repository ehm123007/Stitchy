import React, { useState, useEffect } from 'react';
import { 
  Users, Smartphone, Monitor, Tablet, TrendingUp, DollarSign, 
  ShoppingBag, Clock, Calendar, BarChart3, Activity 
} from 'lucide-react';
import { getAnalytics } from '../../services/api';

export default function AnalyticsView({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('daily'); // 'daily', 'weekly', 'monthly'

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getAnalytics(token);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading || !data) {
    return <div className="p-12 text-center text-xs text-neutral-400">Loading site analytics...</div>;
  }

  const { overview, deviceBreakdown, dailyVisits, recentTraffic } = data;
  const totalVisits = overview.totalVisits || 1;

  // Calculate percentages
  const iosCount = deviceBreakdown['Mobile iOS'] || 0;
  const androidCount = deviceBreakdown['Mobile Android'] || 0;
  const desktopCount = deviceBreakdown['Desktop'] || 0;
  const tabletCount = deviceBreakdown['Tablet'] || 0;

  const iosPct = Math.round((iosCount / totalVisits) * 100);
  const androidPct = Math.round((androidCount / totalVisits) * 100);
  const desktopPct = Math.round((desktopCount / totalVisits) * 100);
  const tabletPct = Math.round((tabletCount / totalVisits) * 100);

  // Daily visits chart bars
  const visitDates = Object.keys(dailyVisits || {});
  const maxVisits = Math.max(...Object.values(dailyVisits || {}), 10);

  return (
    <div className="space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-[#E8E5DF] shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Sales</span>
            <DollarSign size={16} className="text-[#C5A880]" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">
            ৳{overview.totalRevenue.toLocaleString()}
          </div>
          <p className="text-[10px] text-emerald-700 font-medium mt-1">
            Pure export consignment orders
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E5DF] shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag size={16} className="text-[#C5A880]" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">
            {overview.totalOrders}
          </div>
          <p className="text-[10px] text-neutral-500 font-medium mt-1">
            {overview.pendingOrders} pending verification
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E5DF] shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Store Visits</span>
            <Users size={16} className="text-[#C5A880]" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">
            {overview.totalVisits}
          </div>
          <p className="text-[10px] text-neutral-500 font-medium mt-1">
            Logged across FB, Insta & TikTok ads
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E5DF] shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Mobile Dominance</span>
            <Smartphone size={16} className="text-[#C5A880]" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">
            {overview.mobileSharePercent}%
          </div>
          <p className="text-[10px] text-emerald-700 font-medium mt-1">
            iOS & Android shoppers
          </p>
        </div>

      </div>

      {/* Device Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Device breakdown card */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E8E5DF] shadow-xs space-y-5">
          <div>
            <h3 className="font-serif-luxury text-base font-bold text-neutral-900 flex items-center gap-2">
              <Smartphone size={16} className="text-[#C5A880]" />
              <span>Device & Platform Share</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Breakdown of customer hardware accessing your store
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* iOS */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="flex items-center gap-1.5 text-neutral-800">
                  <Smartphone size={14} className="text-neutral-900" />
                  <span>Apple iPhone / iOS</span>
                </span>
                <span className="font-bold text-neutral-900">{iosCount} ({iosPct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-neutral-900 rounded-full" style={{ width: `${iosPct}%` }} />
              </div>
            </div>

            {/* Android */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="flex items-center gap-1.5 text-neutral-800">
                  <Smartphone size={14} className="text-emerald-700" />
                  <span>Google Android Phones</span>
                </span>
                <span className="font-bold text-neutral-900">{androidCount} ({androidPct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${androidPct}%` }} />
              </div>
            </div>

            {/* Desktop */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="flex items-center gap-1.5 text-neutral-800">
                  <Monitor size={14} className="text-blue-700" />
                  <span>Desktop PC & Mac</span>
                </span>
                <span className="font-bold text-neutral-900">{desktopCount} ({desktopPct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${desktopPct}%` }} />
              </div>
            </div>

            {/* Tablet */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="flex items-center gap-1.5 text-neutral-800">
                  <Tablet size={14} className="text-purple-700" />
                  <span>iPads & Android Tablets</span>
                </span>
                <span className="font-bold text-neutral-900">{tabletCount} ({tabletPct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: `${tabletPct}%` }} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E5DF] text-[11px] text-neutral-600">
            💡 <b>Insight:</b> Over 75% of shoppers browse your export collection on mobile devices (Instagram/Facebook in-app browsers and TikTok). Mobile checkout flow is fully optimized.
          </div>
        </div>

        {/* Traffic Chart over Time */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E8E5DF] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif-luxury text-base font-bold text-neutral-900 flex items-center gap-2">
                <BarChart3 size={16} className="text-[#C5A880]" />
                <span>Store Traffic Over Time</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Daily and weekly visitors comparison
              </p>
            </div>

            <div className="flex bg-[#F4EFEB] p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setTimeRange('daily')}
                className={`px-3 py-1 rounded-lg ${timeRange === 'daily' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500'}`}
              >
                Past 7 Days
              </button>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4 space-y-4">
            <div className="flex items-end justify-between gap-2 h-44 px-2">
              {visitDates.map((date) => {
                const count = dailyVisits[date] || 0;
                const heightPct = Math.max(12, Math.round((count / maxVisits) * 100));
                const dayLabel = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });

                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold bg-neutral-900 text-white px-1.5 py-0.5 rounded">
                      {count}
                    </div>
                    <div className="w-full bg-[#FAF8F5] rounded-t-lg h-36 flex items-end justify-center p-1">
                      <div
                        className="w-full bg-[#C5A880] hover:bg-neutral-900 rounded-t-md transition-all duration-300"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-neutral-500">{dayLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#F0ECE6] text-center text-xs">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold">Today's Visits</span>
              <div className="font-bold text-neutral-900 text-sm mt-0.5">
                {visitDates.length > 0 ? dailyVisits[visitDates[visitDates.length - 1]] || 0 : 0}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold">Avg. Daily</span>
              <div className="font-bold text-neutral-900 text-sm mt-0.5">
                {Math.round(totalVisits / 7)}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold">Conversion Rate</span>
              <div className="font-bold text-emerald-700 text-sm mt-0.5">
                {Math.round((overview.totalOrders / Math.max(totalVisits, 1)) * 100)}%
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Real-time Visitor Stream */}
      <div className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#E8E5DF] bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[#C5A880]" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900">
              Live Visitor Traffic Stream (Device & IP Log)
            </h3>
          </div>
          <span className="text-[10px] text-neutral-500">Auto-logged</span>
        </div>

        <div className="divide-y divide-[#F0ECE6] max-h-60 overflow-y-auto">
          {recentTraffic.map((t) => (
            <div key={t.id} className="p-3 flex items-center justify-between text-xs hover:bg-neutral-50">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  t.device.includes('iOS') ? 'bg-neutral-900 text-white' :
                  t.device.includes('Android') ? 'bg-emerald-100 text-emerald-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {t.device}
                </span>
                <span className="font-mono text-neutral-600 text-[11px]">{t.ip}</span>
                <span className="text-neutral-400 text-[11px]">visited {t.path}</span>
              </div>
              <span className="text-neutral-400 font-mono text-[10px]">
                {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
