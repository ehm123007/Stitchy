import React, { useState } from 'react';
import { Lock, Mail, Key, ShieldCheck, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { loginAdmin } from '../services/api';

export default function AdminLogin({ onLoginSuccess, onBackToStore }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const data = await loginAdmin(email.trim(), password);
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-neutral-100 px-4">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <button
          onClick={onBackToStore}
          className="inline-flex items-center gap-1.5 text-xs text-[#C5A880] hover:text-white transition-colors mb-2"
        >
          <ArrowLeft size={14} />
          <span>Return to Customer Storefront</span>
        </button>

        <img
          src="/logo.jpg"
          alt="Stitchy Official Logo"
          className="w-16 h-16 rounded-2xl mx-auto shadow-xl border border-neutral-700 bg-white p-1"
        />

        <div>
          <span className="font-serif-luxury text-3xl font-bold tracking-wide text-white">
            Stitchy
          </span>
          <p className="text-[10px] tracking-[0.25em] font-bold text-[#C5A880] uppercase mt-1">
            MADE STITCH BY STITCH • Management Portal
          </p>
        </div>

        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Private team access. Double-authentication enabled for inventory and orders.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-neutral-900 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-neutral-800 space-y-6">
          
          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Admin / Team Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email..."
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:border-[#C5A880] text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Key size={16} className="absolute left-3.5 top-3 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:border-[#C5A880] text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#C5A880] text-neutral-950 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-[#d8bc94] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
