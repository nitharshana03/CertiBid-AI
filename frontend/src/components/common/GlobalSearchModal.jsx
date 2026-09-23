// CertiBid AI - Global Spotlight Search Modal
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Search, X, Gavel, Building2, ShieldAlert, ArrowRight } from 'lucide-react';

export function GlobalSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tenders, setTenders] = useState([]);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    if (isOpen) {
      apiService.getTenders().then(r => setTenders(r?.data || []));
      apiService.getVendors().then(r => setVendors(r?.data || []));
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();
  const matchedTenders = q ? tenders.filter(t => t.title?.toLowerCase().includes(q) || t.id?.toLowerCase().includes(q)).slice(0, 4) : tenders.slice(0, 3);
  const matchedVendors = q ? vendors.filter(v => v.companyName?.toLowerCase().includes(q) || v.id?.toLowerCase().includes(q)).slice(0, 4) : vendors.slice(0, 3);

  const handleSelectTender = (tender) => {
    onClose();
    navigate(`/tenders/${tender.id}`);
  };

  const handleSelectVendor = (vendor) => {
    onClose();
    navigate(`/vendors/${vendor.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-[#0B3442] border border-[#1B5968] rounded-2xl shadow-2xl overflow-hidden text-[#F0FDFA]">
        {/* Search Bar */}
        <div className="p-4 border-b border-[#1B5968] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#14D9D5]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tenders, vendor organizations, risk analyses..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-[#A7C9CE]"
            autoFocus
          />
          <button onClick={onClose} className="p-1 text-[#A7C9CE] hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Tenders */}
          <div>
            <span className="text-[10px] uppercase font-bold text-[#A7C9CE] tracking-wider">Tenders</span>
            <div className="mt-2 space-y-1.5">
              {matchedTenders.map(t => (
                <div
                  key={t.id}
                  onClick={() => handleSelectTender(t)}
                  className="p-2.5 rounded-xl bg-[#103D4A] hover:bg-[#103D4A]/80 border border-[#1B5968] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Gavel className="w-4 h-4 text-[#14D9D5]" />
                    <div>
                      <p className="font-bold text-white text-xs">{t.title}</p>
                      <p className="text-[10px] text-[#A7C9CE]">{t.id} • {t.department}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#A7C9CE]" />
                </div>
              ))}
            </div>
          </div>

          {/* Vendors */}
          <div>
            <span className="text-[10px] uppercase font-bold text-[#A7C9CE] tracking-wider">Organizations / Bidders</span>
            <div className="mt-2 space-y-1.5">
              {matchedVendors.map(v => (
                <div
                  key={v.id}
                  onClick={() => handleSelectVendor(v)}
                  className="p-2.5 rounded-xl bg-[#103D4A] hover:bg-[#103D4A]/80 border border-[#1B5968] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-[#20C997]" />
                    <div>
                      <p className="font-bold text-white text-xs">{v.companyName}</p>
                      <p className="text-[10px] text-[#A7C9CE]">{v.id} • {v.category}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#A7C9CE]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
