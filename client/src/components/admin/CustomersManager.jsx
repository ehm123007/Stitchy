import React, { useState, useEffect } from 'react';
import { Users, Phone, MapPin, Mail, ShoppingBag, Search, ExternalLink } from 'lucide-react';
import { getCustomers } from '../../services/api';

export default function CustomersManager({ token }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getCustomers(token);
        setCustomers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E5DF]">
        <div>
          <h2 className="font-serif-luxury text-xl font-bold text-neutral-900">
            Customer Directory (CRM)
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Complete database of all clothing buyers, contact info, total spend, and repeat order history.
          </p>
        </div>

        <div className="text-xs font-semibold text-neutral-700 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#D5CEC5]">
          Total Registered Customers: <b>{customers.length}</b>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-3 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, phone number, city, or email..."
          className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-[#D5CEC5] rounded-xl focus:outline-none focus:border-neutral-900"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-600">
            <thead className="bg-[#FAF8F5] text-neutral-900 uppercase font-bold text-[10px] tracking-wider border-b border-[#E8E5DF]">
              <tr>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Contact Phone</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Location / Address</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Lifetime Spend</th>
                <th className="py-3.5 px-4">Last Order</th>
                <th className="py-3.5 px-4 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0ECE6]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">Loading customer database...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">No customers found.</td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-neutral-900">{c.name}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-neutral-800">
                      {c.phone}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500">
                      {c.email || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="font-semibold text-neutral-800">{c.city}</div>
                      <div className="truncate text-neutral-500 text-[11px]" title={c.address}>
                        {c.address}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-neutral-900 bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E8E5DF]">
                        {c.totalOrders} {c.totalOrders > 1 ? 'orders' : 'order'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-800 text-sm">
                      ৳{c.totalSpent?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-neutral-400">
                      {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`https://wa.me/880${c.phone.replace(/[^0-9]/g, '').slice(-10)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      >
                        <span>WhatsApp</span>
                        <ExternalLink size={10} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
