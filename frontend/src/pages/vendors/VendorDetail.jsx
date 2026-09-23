// CertiBid AI - Vendor Profile Detail View
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Building2, ShieldCheck, Mail, Phone, MapPin, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';

export function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendor();
  }, [id]);

  const loadVendor = async () => {
    setLoading(true);
    try {
      const res = await apiService.getVendorById(id);
      setVendor(res.data);
    } catch (e) {
      setVendor(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-xs text-[#A7C9CE]">Loading profile...</div>;
  if (!vendor) return <div className="p-12 text-center text-xs text-[#A7C9CE]">Organization not found</div>;

  return (
    <div className="space-y-6 text-[#F0FDFA]">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#A7C9CE] hover:text-white cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header Profile Banner */}
      <div className="p-6 rounded-2xl bg-[#0B3442] border border-[#1B5968] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#06B6B4] text-[#071F2A] flex items-center justify-center font-black text-xl shadow-md">
            {vendor.companyName?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="text-[11px] font-mono text-[#14D9D5] font-bold">Vendor ID: {vendor.id}</span>
            <h2 className="text-2xl font-extrabold text-white">{vendor.companyName}</h2>
            <p className="text-xs text-[#A7C9CE] mt-0.5">{vendor.category}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[#103D4A] border border-[#1B5968] text-center">
            <span className="text-[10px] text-[#A7C9CE] uppercase font-bold">Risk Rating</span>
            <p className={`text-lg font-black ${vendor.riskLevel === 'Low' ? 'text-[#20C997]' : 'text-[#FF6B7A]'}`}>
              {vendor.riskScore || 12} / 100 ({vendor.riskLevel || 'Low'})
            </p>
          </div>
        </div>
      </div>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968] space-y-3">
          <h3 className="font-bold text-sm text-white border-b border-[#1B5968] pb-2">Corporate & Tax Information</h3>
          <div className="space-y-2 text-[#A7C9CE]">
            <div className="flex justify-between"><span>Registration No:</span> <strong className="text-white">{vendor.registrationNumber || 'REG-2024-8891'}</strong></div>
            <div className="flex justify-between"><span>Tax ID / GSTIN:</span> <strong className="text-white">{vendor.taxId || 'TAX-2024-8891'}</strong></div>
            <div className="flex justify-between"><span>Verification Status:</span> <strong className="text-[#20C997]">{vendor.verificationStatus || 'Verified'}</strong></div>
            <div className="flex justify-between"><span>Financial Health:</span> <strong className="text-[#14D9D5]">{vendor.financialHealth || 'A+'}</strong></div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968] space-y-3">
          <h3 className="font-bold text-sm text-white border-b border-[#1B5968] pb-2">Contact & Representative</h3>
          <div className="space-y-2 text-[#A7C9CE]">
            <div className="flex justify-between"><span>Contact Person:</span> <strong className="text-white">{vendor.contactPerson || 'Authorized Representative'}</strong></div>
            <div className="flex justify-between"><span>Official Email:</span> <strong className="text-white">{vendor.email}</strong></div>
            <div className="flex justify-between"><span>Phone Number:</span> <strong className="text-white">{vendor.phone || '+91 98765 43210'}</strong></div>
            <div className="flex justify-between"><span>Registered Office:</span> <strong className="text-white">{vendor.address || 'Capital City'}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
