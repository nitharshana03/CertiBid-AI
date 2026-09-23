// CertiBid AI - Vendor & Organization List Page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Building2, Search, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

export function VendorList() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const res = await apiService.getVendors();
      setVendors(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = vendors.filter(v =>
    v.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    v.id?.toLowerCase().includes(search.toLowerCase()) ||
    v.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-[#F0FDFA]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl bg-[#0B3442] border border-[#1B5968] text-white shadow-xl">
        <div>
          <span className="text-[11px] font-bold text-[#14D9D5] uppercase tracking-wider">Enterprise Directory</span>
          <h2 className="text-2xl font-extrabold text-white mt-0.5">Registered Organizations & Bidders</h2>
          <p className="text-xs text-[#A7C9CE] mt-1">Audit verified bidder KYC profiles, risk ratings, and project histories.</p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-[#103D4A] border border-[#1B5968] text-xs font-bold text-[#14D9D5]">
          {vendors.length} Total Verified Entities
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#103D4A] border border-[#1B5968] flex items-center gap-3">
        <Search className="w-4 h-4 text-[#6F9BA3]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter organizations by name, vendor ID, or category..."
          className="flex-1 bg-transparent text-xs text-white placeholder-[#A7C9CE] outline-none"
        />
      </div>

      {/* Vendors Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#A7C9CE]">Loading organization records...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(v => (
            <div
              key={v.id}
              onClick={() => navigate(`/vendors/${v.id}`)}
              className="p-5 rounded-2xl bg-[#0B3442] border border-[#1B5968] hover:border-[#06B6B4] transition-all cursor-pointer shadow-lg flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#14D9D5] font-bold">{v.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    v.riskLevel === 'Low' ? 'bg-[#20C997]/20 text-[#20C997]' : 'bg-[#FF6B7A]/20 text-[#FF6B7A]'
                  }`}>
                    {v.riskLevel || 'Low'} Risk
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-white">{v.companyName}</h3>
                <p className="text-xs text-[#A7C9CE] mt-1 line-clamp-1">{v.category}</p>
              </div>

              <div className="pt-3 border-t border-[#1B5968] flex items-center justify-between text-xs text-[#A7C9CE]">
                <span>Completed: <strong className="text-white">{v.completedProjectsCount || 0}</strong></span>
                <span className="flex items-center gap-1 text-[#14D9D5] font-bold hover:underline">
                  View Profile <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
