// CertiBid AI - Bidder Role Dashboard
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RiskScoreBadge } from '../../components/common/RiskScoreBadge';
import { UploadComponent } from '../../components/common/UploadComponent';
import { formatINR } from '../../utils/formatters';
import {
  Building2,
  ShieldCheck,
  FileText,
  CreditCard,
  Gavel,
  FileCheck,
  AlertCircle
} from 'lucide-react';

export function VendorDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [vendor, setVendor] = useState(null);
  const [bids, setBids] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    apiService.getAuthenticatedBidderProfile()
      .then((vRes) => {
        if (!isMounted) return;
        const currentVendor = vRes?.data;
        if (!currentVendor) {
          throw new Error('Bidder profile not found');
        }
        setVendor(currentVendor);

        const vendorId = currentVendor.id;
        const vendorName = currentVendor.companyName;

        return Promise.all([
          apiService.getBids({ vendorId, vendorName }),
          apiService.getDocuments({ vendorId, vendorName }),
          apiService.getTenders({ status: 'Active' }),
          apiService.getTransactions({ vendorId, vendorName })
        ]);
      })
      .then((results) => {
        if (!isMounted || !results) return;
        const [bRes, dRes, tRes, txRes] = results;
        setBids(Array.isArray(bRes?.data) ? bRes.data : []);
        setCertificates(Array.isArray(dRes?.data) ? dRes.data : []);
        setTenders(Array.isArray(tRes?.data) ? tRes.data : []);
        setTransactions(Array.isArray(txRes?.data) ? txRes.data : []);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error fetching bidder profile:", err);
        setError(err.message || 'Unable to load bidder profile');
        setLoading(false);
      });

    return () => { isMounted = false; };
  }, [user?.email, user?.bidderId]);

  const handleUploadCertificate = (files) => {
    const fileName = files[0]?.name || 'Uploaded Company Certificate';
    const newDoc = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      title: fileName,
      documentType: 'Corporate Certificate',
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'Pending',
      vendorId: vendor?.id,
      vendorName: vendor?.companyName
    };
    setCertificates([newDoc, ...certificates]);
    showToast("New Company Certificate submitted for AI verification", "success");
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-semibold text-[#A7C9CE] animate-pulse flex flex-col items-center justify-center space-y-3">
        <Building2 className="w-8 h-8 text-[#06B6B4] animate-bounce" />
        <span>Loading Authenticated Bidder Profile...</span>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="p-8 rounded-3xl bg-[#0B3442] border border-red-500/30 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Unable to Load Bidder Profile</h3>
        <p className="text-xs text-[#A7C9CE]">{error || 'Please ensure you are authenticated as a registered bidder.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#06B6B4] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#14D9D5] transition-all"
        >
          Retry Loading Profile
        </button>
      </div>
    );
  }

  const totalEmdBalance = transactions.reduce((sum, tx) => sum + (tx.amount || 0), vendor.emdBalance || 0);

  return (
    <div className="space-y-6 text-[#F0FDFA]">
      {/* Bidder Welcome Header */}
      <div className="p-6 rounded-3xl bg-[#0B3442] border border-[#1B5968] text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#14D9D5] text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-[#06B6B4]" /> Bidder Corporate Portal
          </div>
          <h2 className="text-2xl font-extrabold text-white">{vendor.companyName}</h2>
          <p className="text-xs text-[#A7C9CE] mt-1">
            Bidder ID: {vendor.id || 'Pending Assignment'} • Tax ID: {vendor.taxId || 'Not provided'} • Rating: {vendor.rating ? `⭐ ${vendor.rating}/5.0` : 'Not rated yet'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={vendor.verificationStatus || 'Pending Verification'} />
          {vendor.riskScore !== undefined && vendor.riskScore !== null ? (
            <RiskScoreBadge score={vendor.riskScore} level={vendor.riskLevel || 'Low'} />
          ) : (
            <span className="px-3 py-1 rounded-full bg-[#103D4A] border border-[#1B5968] text-xs text-[#A7C9CE] font-medium">
              Risk: N/A
            </span>
          )}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Eligibility Score */}
        <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968] flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#A7C9CE]">Prequalification Eligibility Score</span>
            {vendor.eligibilityScore !== undefined && vendor.eligibilityScore !== null ? (
              <>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-[#06B6B4]">{vendor.eligibilityScore}%</span>
                  <span className="text-xs font-bold text-[#20C997]">
                    {vendor.eligibilityScore >= 90 ? 'Grade A Tier-1' : vendor.eligibilityScore >= 75 ? 'Grade B Tier-2' : 'Qualified'}
                  </span>
                </div>
                <p className="text-[11px] text-[#A7C9CE] mt-2">Qualified for government tenders up to budget ceiling.</p>
                <div className="w-full bg-[#0B3442] h-2.5 rounded-full overflow-hidden mt-4 border border-[#1B5968]">
                  <div className="bg-[#06B6B4] h-full rounded-full" style={{ width: `${vendor.eligibilityScore}%` }} />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-extrabold text-[#A7C9CE]">N/A</span>
                  <span className="text-xs font-bold text-amber-400">Evaluation Pending</span>
                </div>
                <p className="text-[11px] text-[#A7C9CE] mt-2">Score will be evaluated upon initial proposal submission.</p>
                <div className="w-full bg-[#0B3442] h-2.5 rounded-full overflow-hidden mt-4 border border-[#1B5968]">
                  <div className="bg-slate-700 h-full rounded-full w-0" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Profile & Compliance Health */}
        <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968] flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#A7C9CE]">Profile & Compliance Health</span>
            {certificates.length > 0 ? (
              <>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-[#20C997]">
                    {vendor.complianceScore !== undefined && vendor.complianceScore !== null ? `${vendor.complianceScore}%` : '100%'}
                  </span>
                  <span className="text-xs font-bold text-[#A7C9CE]">
                    {certificates.filter(c => c.status === 'Approved' || c.status === 'Verified').length} Verified Docs
                  </span>
                </div>
                <p className="text-[11px] text-[#A7C9CE] mt-2">Tax Clearance & Corporate certificates uploaded for review.</p>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-extrabold text-amber-400">Pending</span>
                  <span className="text-xs font-bold text-[#A7C9CE]">0 Certificates</span>
                </div>
                <p className="text-[11px] text-[#A7C9CE] mt-2">Upload tax clearance & company certificates to verify compliance.</p>
              </>
            )}
          </div>
          <div className="mt-4 text-xs font-bold text-[#14D9D5] flex items-center justify-between">
            <span>{certificates.length > 0 ? 'Verified Corporate Profile' : 'Pending Verification'}</span>
            <ShieldCheck className="w-4 h-4 text-[#20C997]" />
          </div>
        </div>

        {/* EMD Financial Balance */}
        <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968] flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#A7C9CE]">Active EMD Escrow Balance</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-white">{formatINR(totalEmdBalance)}</span>
              <span className="text-xs font-bold text-[#20C997]">
                {totalEmdBalance > 0 ? 'Escrow Held' : 'No Active EMD'}
              </span>
            </div>
            <p className="text-[11px] text-[#A7C9CE] mt-2">
              {totalEmdBalance > 0
                ? 'Verified EMD deposit held in official government escrow.'
                : 'No active EMD records.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/payments')}
            className="mt-4 px-3 py-2 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-white text-xs font-bold flex items-center justify-between shadow-md transition-all cursor-pointer"
          >
            <span>View EMD Receipts</span>
            <CreditCard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Company Certificates Upload & Verification Status */}
      <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#14D9D5]" /> Company Certificates & Verification Status
            </h3>
            <p className="text-xs text-[#A7C9CE]">View registered corporate certificates or submit new certificates for official verification.</p>
          </div>
          <button onClick={() => navigate('/documents')} className="text-xs font-bold text-[#14D9D5] hover:underline cursor-pointer">
            View All Certificates →
          </button>
        </div>

        {/* Upload Widget */}
        <div className="p-4 rounded-xl bg-[#071F2A] border border-[#1B5968]">
          <UploadComponent onFileUpload={handleUploadCertificate} />
        </div>

        {/* Certificates Status List */}
        {certificates.length > 0 ? (
          <div className="space-y-2.5">
            {certificates.slice(0, 5).map(cert => (
              <div key={cert.id} className="p-3.5 rounded-xl border border-[#1B5968] bg-[#0B3442] flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[#06B6B4]" />
                  <div>
                    <p className="font-bold text-white">{cert.title || cert.name}</p>
                    <p className="text-[10px] text-[#A7C9CE]">ID: {cert.id} • Type: {cert.documentType || 'Corporate Certificate'} • Date: {cert.uploadedAt || cert.date || new Date().toISOString().split('T')[0]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={cert.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center rounded-xl border border-dashed border-[#1B5968] bg-[#071F2A]">
            <FileText className="w-8 h-8 text-[#A7C9CE]/40 mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#A7C9CE]">No certificates submitted yet.</p>
            <p className="text-[11px] text-[#A7C9CE]/70 mt-1">Use the upload box above to submit tax clearance, ISO certification, or registration documents.</p>
          </div>
        )}
      </div>

      {/* Submitted Bids & Status */}
      <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">My Submitted Bids & Proposals</h3>
          <button onClick={() => navigate('/bids/compare')} className="text-xs font-bold text-[#14D9D5] hover:underline cursor-pointer">
            My Bids History →
          </button>
        </div>

        {bids.length > 0 ? (
          <div className="space-y-3">
            {bids.map(bid => (
              <div key={bid.id} className="p-4 rounded-xl border border-[#1B5968] bg-[#0B3442] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-white">
                <div>
                  <p className="font-bold text-white">{bid.tenderTitle || bid.title || 'Government Procurement Tender'}</p>
                  <p className="text-[10px] text-[#A7C9CE]">Bid ID: {bid.id} • Proposed Amount: {formatINR(bid.proposedAmount || bid.amount)} • Time: {bid.estimatedCompletionTime || `${bid.completionTimeDays || 180} days`}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={bid.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center rounded-xl border border-dashed border-[#1B5968] bg-[#071F2A]">
            <Gavel className="w-8 h-8 text-[#A7C9CE]/40 mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#A7C9CE]">No bids submitted yet.</p>
            <p className="text-[11px] text-[#A7C9CE]/70 mt-1">Browse active government tenders below to prepare and submit your first bidding proposal.</p>
          </div>
        )}
      </div>

      {/* Available Tenders Open for Bidding */}
      <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Available Government Tenders for Bidding</h3>
          <button onClick={() => navigate('/tenders')} className="text-xs font-bold text-[#14D9D5] hover:underline cursor-pointer">
            Explore All Tenders →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tenders.slice(0, 2).map(t => (
            <div key={t.id} className="p-4 rounded-2xl border border-[#1B5968] bg-[#0B3442] flex flex-col justify-between space-y-3 text-xs text-white">
              <div>
                <span className="text-[10px] font-bold text-[#14D9D5] uppercase tracking-wider">{t.category}</span>
                <h4 className="font-bold text-white mt-1">{t.title}</h4>
                <p className="text-[#A7C9CE] mt-1 line-clamp-2">{t.description}</p>
              </div>
              <div className="pt-3 border-t border-[#1B5968] flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-[#20C997]">{formatINR(t.budget)}</p>
                  <p className="text-[10px] text-[#A7C9CE]">Deadline: {t.submissionDeadline}</p>
                </div>
                <button
                  onClick={() => navigate(`/tenders/${t.id}`)}
                  className="px-4 py-2 bg-[#06B6B4] hover:bg-[#14D9D5] text-white font-bold rounded-xl shadow-md transition-all text-xs cursor-pointer"
                >
                  Submit Proposal
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

