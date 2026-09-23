// CertiBid AI - Tender List Page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Gavel, Search, ArrowRight, ShieldCheck, Calendar, IndianRupee } from 'lucide-react';

export function TenderList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tenders, setTenders] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('AVAILABLE'); // 'AVAILABLE' | 'AWARD_HISTORY' | 'ALL'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTenders();
  }, []);

  const loadTenders = async () => {
    setLoading(true);
    try {
      const res = await apiService.getTenders();
      setTenders(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      setTenders([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = tenders.filter(t => {
    const matchesSearch =
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.id?.toLowerCase().includes(search.toLowerCase()) ||
      t.department?.toLowerCase().includes(search.toLowerCase()) ||
      (t.awardedVendorName && t.awardedVendorName.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'AVAILABLE') {
      return t.status !== 'Awarded' && t.status !== 'Closed';
    } else if (activeTab === 'AWARD_HISTORY') {
      return t.status === 'Awarded' || t.status === 'Closed';
    }
    return true;
  });

  const availableCount = tenders.filter(t => t.status !== 'Awarded' && t.status !== 'Closed').length;
  const awardedCount = tenders.filter(t => t.status === 'Awarded' || t.status === 'Closed').length;

  return (
    <div className="space-y-6 text-[#F0FDFA]">
      <div className="p-6 rounded-2xl bg-[#0B3442] border border-[#1B5968] text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#14D9D5] uppercase tracking-wider">Public Procurement Pipeline</span>
          <h2 className="text-2xl font-extrabold text-white mt-0.5">Government Tenders & Procurement</h2>
          <p className="text-xs text-[#A7C9CE] mt-1">Explore open procurement tenders, review bid submissions, or inspect historical contract awards.</p>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-2 p-1 bg-[#0B3442] rounded-2xl border border-[#1B5968] text-xs">
          <button
            onClick={() => setActiveTab('AVAILABLE')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'AVAILABLE'
                ? 'bg-[#20C997] text-[#071F2A] shadow-md'
                : 'text-[#A7C9CE] hover:text-white'
            }`}
          >
            Available Tenders ({availableCount})
          </button>
          <button
            onClick={() => setActiveTab('AWARD_HISTORY')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'AWARD_HISTORY'
                ? 'bg-[#14D9D5] text-[#071F2A] shadow-md'
                : 'text-[#A7C9CE] hover:text-white'
            }`}
          >
            Award History ({awardedCount})
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#1B5968] text-white shadow-md'
                : 'text-[#A7C9CE] hover:text-white'
            }`}
          >
            All Tenders ({tenders.length})
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#103D4A] border border-[#1B5968] flex items-center gap-3 flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6F9BA3]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter tenders by title, ID, vendor, department..."
            className="flex-1 bg-transparent text-xs text-white placeholder-[#A7C9CE] outline-none"
          />
        </div>
      </div>

      {/* Tenders Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#A7C9CE]">Loading procurement tenders...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0B3442] border border-[#1B5968] text-[#A7C9CE] text-xs">
          {activeTab === 'AWARD_HISTORY' ? 'No awarded tenders found in history.' : 'No available tenders matching the current filter.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <div
              key={t.id}
              onClick={() => navigate(`/tenders/${t.id}`)}
              className={`p-5 rounded-2xl bg-[#0B3442] border transition-all cursor-pointer shadow-lg flex flex-col justify-between space-y-4 ${
                t.status === 'Awarded'
                  ? 'border-[#20C997]/60 hover:border-[#20C997]'
                  : 'border-[#1B5968] hover:border-[#06B6B4]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#14D9D5] font-bold">{t.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    t.status === 'Awarded'
                      ? 'bg-[#20C997]/20 text-[#20C997] border border-[#20C997]/40'
                      : t.status === 'Active'
                      ? 'bg-[#14D9D5]/20 text-[#14D9D5]'
                      : 'bg-[#103D4A] text-[#A7C9CE]'
                  }`}>
                    {t.status || 'Active'}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-white line-clamp-2">{t.title}</h3>
                <p className="text-xs text-[#A7C9CE] mt-1">{t.department}</p>
                {t.status === 'Awarded' && t.awardedVendorName && (
                  <div className="mt-2.5 p-2 rounded-xl bg-[#103D4A] border border-[#1B5968] text-[11px]">
                    <span className="text-[10px] text-[#A7C9CE] block">Awarded Winning Vendor:</span>
                    <span className="font-bold text-[#20C997]">{t.awardedVendorName}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#1B5968] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#A7C9CE] block">
                    {t.status === 'Awarded' ? 'Awarded Value' : 'Approved Budget'}
                  </span>
                  <span className="font-bold text-[#20C997]">
                    ₹{(((t.status === 'Awarded' ? t.awardedAmount : t.budget) || t.budget || 0) / 10000000).toFixed(2)} Cr
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[#14D9D5] font-bold hover:underline">
                  View Details <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
