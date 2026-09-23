// CertiBid AI - User Management Page
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Users, ShieldCheck, Mail, Building2, CheckCircle2 } from 'lucide-react';

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await apiService.getUsers();
      setUsers(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-[#F0FDFA]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl bg-[#0B3442] border border-[#1B5968] text-white shadow-xl">
        <div>
          <span className="text-[11px] font-bold text-[#14D9D5] uppercase tracking-wider">Access Governance</span>
          <h2 className="text-2xl font-extrabold text-white mt-0.5">User & Officer Directory</h2>
          <p className="text-xs text-[#A7C9CE] mt-1">Manage state procurement personnel, department credentials, and system roles.</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968] shadow-lg">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#A7C9CE]">Loading system users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1B5968] text-[#A7C9CE] uppercase tracking-wider text-[10px] bg-[#0B3442]">
                  <th className="py-3 px-3">User & ID</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">System Role</th>
                  <th className="py-3 px-3">Department / Org</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B5968]">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-[#145364]/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#06B6B4] text-[#071F2A] font-bold flex items-center justify-center text-xs">
                          {u.avatar || u.name?.slice(0, 2).toUpperCase() || 'US'}
                        </div>
                        <div>
                          <p className="font-extrabold text-white text-sm">{u.name}</p>
                          <p className="text-[10px] text-[#14D9D5]">{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-[#A7C9CE]">{u.email}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        u.role === 'ADMIN' ? 'bg-[#FF6B7A]/20 text-[#FF6B7A] border-[#FF6B7A]/30' :
                        u.role === 'OFFICER' ? 'bg-[#14D9D5]/20 text-[#14D9D5] border-[#14D9D5]/30' :
                        'bg-[#20C997]/20 text-[#20C997] border-[#20C997]/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-white font-medium">{u.department || u.organization || 'Central Dept'}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-[#20C997]/20 text-[#20C997] font-bold text-[10px] border border-[#20C997]/30">
                        {u.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
