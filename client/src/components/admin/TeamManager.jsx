import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Trash2, Key, Mail, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getTeam, addTeamMember, deleteTeamMember } from '../../services/api';

export default function TeamManager({ token, currentUser }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Operations & Dispatch'
  });

  const loadTeam = async () => {
    setLoading(true);
    try {
      const data = await getTeam(token);
      setTeam(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await addTeamMember(formData, token);
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', role: 'Operations & Dispatch' });
      loadTeam();
    } catch (err) {
      alert(err.message || 'Error adding team member');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Revoke access for this team member?')) return;
    try {
      await deleteTeamMember(id, token);
      loadTeam();
    } catch (err) {
      alert(err.message || 'Error revoking access');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E5DF]">
        <div>
          <h2 className="font-serif-luxury text-xl font-bold text-neutral-900">
            Team & Staff Access Control
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Only authorized team members can log into the STITCHY admin panel.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center gap-1.5 shadow-md"
        >
          <UserPlus size={16} />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => {
          const isPrimaryAdmin = member.email === 'admin@stitchy.com';

          return (
            <div
              key={member.id}
              className="bg-white p-5 rounded-2xl border border-[#E8E5DF] shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F4EFEB] text-[#8C7A6B] flex items-center justify-center font-bold text-sm">
                    {member.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">{member.name}</h3>
                    <p className="text-xs text-neutral-500 font-mono mt-0.5">{member.email}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                  {member.role}
                </span>
              </div>

              <div className="pt-3 border-t border-[#F0ECE6] flex items-center justify-between text-xs">
                <span className="text-[11px] text-neutral-400">
                  Added: {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}
                </span>

                {!isPrimaryAdmin && (
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="text-neutral-400 hover:text-red-600 transition-colors flex items-center gap-1"
                    title="Revoke access"
                  >
                    <Trash2 size={13} />
                    <span className="text-[11px]">Revoke</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E8E5DF] shadow-2xl space-y-4"
          >
            <h3 className="font-serif-luxury text-lg font-bold text-neutral-900 border-b border-[#E8E5DF] pb-3">
              Grant New Team Member Access
            </h3>

            <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Asif Karim"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="asif@stitchy.com"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">
                  Staff Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CEC5] rounded-xl font-medium"
                >
                  <option value="Operations & Dispatch">Operations & Dispatch</option>
                  <option value="Inventory Manager">Inventory Manager</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-[#D5CEC5] rounded-xl font-bold text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-neutral-900 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-neutral-800"
                >
                  Authorize Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
