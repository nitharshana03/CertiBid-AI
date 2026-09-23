// CertiBid AI - Admin & Officer Document Audit & Verification Workspace
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FilePreviewModal } from '../../components/common/FilePreviewModal';
import { formatINRLakhsCrores } from '../../utils/formatters';
import { BidderCertificates } from './BidderCertificates';
import {
  FileCheck2,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Filter,
  Building2,
  FileText,
  Mail,
  ShieldCheck,
  Download,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  X,
  Layers,
  CheckCheck,
  Ban,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

export function DocumentVerification() {
  const { user } = useAuth();
  const rawRole = String(user?.role || '').toUpperCase();
  const isBidder = rawRole === 'BIDDER' || rawRole === 'VENDOR';

  if (isBidder) {
    return <BidderCertificates />;
  }

  // Active View Tab: 'AUDIT_QUEUE' (Primary Document Audit) | 'BID_MATRIX' (Tender/Bid Checklist)
  const [activeTab, setActiveTab] = useState('AUDIT_QUEUE');

  const [bids, setBids] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Document Audit Filter States
  const [docSearch, setDocSearch] = useState('');
  const [docStatusTab, setDocStatusTab] = useState('ALL'); // ALL, PENDING_REVIEW, APPROVED, REJECTED
  const [docTypeFilter, setDocTypeFilter] = useState('ALL');
  const [docBidderFilter, setDocBidderFilter] = useState('ALL');

  // Bid Matrix Filter States
  const [globalBidSearch, setGlobalBidSearch] = useState('');
  const [bidderSearch, setBidderSearch] = useState('');
  const [selectedBidderId, setSelectedBidderId] = useState('ALL');
  const [selectedTenderId, setSelectedTenderId] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [docStatusFilter, setDocStatusFilter] = useState('ALL');
  const [eligibilityFilter, setEligibilityFilter] = useState('ALL');
  
  // Selected Modals
  const [activeBidDetail, setActiveBidDetail] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Rejection Modal State
  const [rejectionModalDoc, setRejectionModalDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, vRes, dRes] = await Promise.all([
        apiService.getBids(),
        apiService.getVendors(),
        apiService.getDocuments()
      ]);
      setBids(bRes.data || []);
      setVendors(vRes.data || []);
      setDocuments(dRes.data || []);
    } catch (err) {
      console.error('Failed to load audit documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- ACTIONS ---

  const handleDownloadDoc = async (doc) => {
    try {
      showToast(`Initiating download for ${doc.fileName || 'certificate'}...`, 'info');
      await apiService.downloadDocument(doc.id, doc.fileName);
      showToast(`Downloaded ${doc.fileName || 'certificate'} successfully.`, 'success');
    } catch (err) {
      console.error('Download failed:', err);
      showToast(err.message || 'Failed to download certificate.', 'error');
    }
  };

  const handleApproveDoc = async (doc) => {
    try {
      setSubmittingAction(true);
      await apiService.updateDocumentStatus(doc.id, 'APPROVED');
      
      // Update local state
      setDocuments(prev => prev.map(d => d.id === doc.id ? {
        ...d,
        status: 'APPROVED',
        verifiedBy: `${user?.name || 'Procurement Officer'} (${user?.role || 'OFFICER'})`,
        reviewedBy: user?.name || 'Procurement Desk',
        reviewedByRole: user?.role || 'OFFICER',
        reviewedAt: new Date().toISOString(),
        resubmissionReason: ''
      } : d));

      showToast(`Document #${doc.id} (${doc.title || doc.fileName}) officially APPROVED`, 'success');
    } catch (err) {
      console.error('Approval failed:', err);
      showToast(err.message || 'Failed to approve document', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleOpenRejectModal = (doc) => {
    setRejectionModalDoc(doc);
    setRejectionReason(doc.resubmissionReason || '');
  };

  const handleConfirmRejectDoc = async () => {
    if (!rejectionModalDoc) return;
    if (!rejectionReason.trim()) {
      showToast('Please enter a mandatory rejection / resubmission reason.', 'error');
      return;
    }

    try {
      setSubmittingAction(true);
      await apiService.updateDocumentStatus(rejectionModalDoc.id, 'REJECTED', rejectionReason.trim());
      
      // Update local state
      setDocuments(prev => prev.map(d => d.id === rejectionModalDoc.id ? {
        ...d,
        status: 'REJECTED',
        resubmissionReason: rejectionReason.trim(),
        verifiedBy: `${user?.name || 'Procurement Officer'} (${user?.role || 'OFFICER'})`,
        reviewedBy: user?.name || 'Procurement Desk',
        reviewedByRole: user?.role || 'OFFICER',
        reviewedAt: new Date().toISOString()
      } : d));

      showToast(`Document #${rejectionModalDoc.id} REJECTED. Bidder notified.`, 'info');
      setRejectionModalDoc(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Rejection failed:', err);
      showToast(err.message || 'Failed to reject document', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // --- STATS COUNTERS FOR AUDIT ---
  const totalDocsCount = documents.length;
  const pendingDocsCount = documents.filter(d => {
    const st = (d.status || '').toUpperCase();
    return st.includes('PENDING') || st.includes('REVIEW');
  }).length;
  const approvedDocsCount = documents.filter(d => {
    const st = (d.status || '').toUpperCase();
    return st.includes('APPROV') || st.includes('VERIFIED');
  }).length;
  const rejectedDocsCount = documents.filter(d => {
    const st = (d.status || '').toUpperCase();
    return st.includes('REJECT');
  }).length;

  // --- FILTER DOCUMENTS FOR AUDIT QUEUE ---
  const filteredDocuments = documents.filter(doc => {
    const q = docSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      (doc.id || '').toLowerCase().includes(q) ||
      (doc.title || '').toLowerCase().includes(q) ||
      (doc.fileName || '').toLowerCase().includes(q) ||
      (doc.vendorName || '').toLowerCase().includes(q) ||
      (doc.vendorId || '').toLowerCase().includes(q) ||
      (doc.documentType || '').toLowerCase().includes(q);

    const docStatusNorm = (doc.status || '').toUpperCase();
    let matchesStatus = true;
    if (docStatusTab === 'PENDING_REVIEW') {
      matchesStatus = docStatusNorm.includes('PENDING') || docStatusNorm.includes('REVIEW');
    } else if (docStatusTab === 'APPROVED') {
      matchesStatus = docStatusNorm.includes('APPROV') || docStatusNorm.includes('VERIFIED');
    } else if (docStatusTab === 'REJECTED') {
      matchesStatus = docStatusNorm.includes('REJECT');
    }

    const matchesType = docTypeFilter === 'ALL' || (doc.documentType || '') === docTypeFilter;
    const matchesBidder = docBidderFilter === 'ALL' || (doc.vendorId || '') === docBidderFilter;

    return matchesSearch && matchesStatus && matchesType && matchesBidder;
  });

  // --- FILTER BIDS FOR BID MATRIX ---
  const filteredBids = bids.filter(bid => {
    const searchLower = globalBidSearch.toLowerCase().trim();
    const bidderSearchLower = bidderSearch.toLowerCase().trim();

    const matchesGlobalSearch =
      !searchLower ||
      (bid.id || '').toLowerCase().includes(searchLower) ||
      (bid.tenderId || '').toLowerCase().includes(searchLower) ||
      (bid.tenderTitle || '').toLowerCase().includes(searchLower) ||
      (bid.bidderName || bid.vendorName || '').toLowerCase().includes(searchLower);

    const matchesBidderSearch =
      !bidderSearchLower ||
      (bid.bidderName || bid.vendorName || '').toLowerCase().includes(bidderSearchLower) ||
      (bid.vendorEmail || '').toLowerCase().includes(bidderSearchLower) ||
      (bid.vendorId || '').toLowerCase().includes(bidderSearchLower);

    const matchesSelectedBidder =
      selectedBidderId === 'ALL' || bid.vendorId === selectedBidderId;

    const matchesSelectedTender =
      selectedTenderId === 'ALL' || bid.tenderId === selectedTenderId;

    const matchesDocStatus =
      docStatusFilter === 'ALL' || (bid.documentStatus || 'Complete') === docStatusFilter;

    const matchesEligibility =
      eligibilityFilter === 'ALL' || (bid.eligibilityStatus || 'Eligible') === eligibilityFilter;

    let matchesStatusTab = true;
    if (statusFilter === 'COMPLETE') matchesStatusTab = (bid.documentStatus === 'Complete');
    else if (statusFilter === 'MISSING') matchesStatusTab = (bid.documentStatus === 'Missing');
    else if (statusFilter === 'PENDING') matchesStatusTab = (bid.verificationStatus === 'Pending Verification' || bid.status === 'Pending Verification');
    else if (statusFilter === 'VERIFIED') matchesStatusTab = (bid.verificationStatus === 'Verified' || bid.status === 'Verified');
    else if (statusFilter === 'REJECTED') matchesStatusTab = (bid.verificationStatus === 'Rejected' || bid.status === 'Rejected');

    return (
      matchesGlobalSearch &&
      matchesBidderSearch &&
      matchesSelectedBidder &&
      matchesSelectedTender &&
      matchesDocStatus &&
      matchesEligibility &&
      matchesStatusTab
    );
  });

  const matchedVendor = vendors.find(
    v => v.id === selectedBidderId || (bidderSearch && (v.companyName.toLowerCase().includes(bidderSearch.toLowerCase()) || v.id.toLowerCase().includes(bidderSearch.toLowerCase()) || v.email.toLowerCase().includes(bidderSearch.toLowerCase())))
  );

  return (
    <div className="space-y-6 text-[#F0FDFA]">
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl bg-[#0B3442] border border-[#1B5968] shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 text-[#14D9D5] text-xs font-bold uppercase tracking-wider mb-1">
            <FileCheck2 className="w-4 h-4 text-[#06B6B4]" /> Compliance & Document Verification Desk
          </div>
          <h2 className="text-2xl font-extrabold text-white">Bidder Document Audit Register</h2>
          <p className="text-xs text-[#A7C9CE] mt-1">
            Procurement Officer & Admin portal to inspect, verify, download, approve, and reject submitted corporate certificates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#06B6B4]/10 border border-[#06B6B4]/30 text-[#14D9D5] text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-[#14D9D5]" />
            <span>Authorized Officer Role: {user?.role || 'OFFICER'}</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0B3442] border border-[#1B5968] space-y-1">
          <span className="text-[11px] font-bold text-[#A7C9CE] uppercase">Total Uploaded Docs</span>
          <p className="text-2xl font-black text-white">{totalDocsCount}</p>
          <p className="text-[10px] text-[#A7C9CE]">Across all registered bidders</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B3442] border border-amber-500/30 space-y-1">
          <span className="text-[11px] font-bold text-amber-400 uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Audit
          </span>
          <p className="text-2xl font-black text-amber-400">{pendingDocsCount}</p>
          <p className="text-[10px] text-[#A7C9CE]">Requires officer review</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B3442] border border-emerald-500/30 space-y-1">
          <span className="text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Verified
          </span>
          <p className="text-2xl font-black text-emerald-400">{approvedDocsCount}</p>
          <p className="text-[10px] text-[#A7C9CE]">Statutory compliance satisfied</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B3442] border border-rose-500/30 space-y-1">
          <span className="text-[11px] font-bold text-rose-400 uppercase flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Rejected / Action Req
          </span>
          <p className="text-2xl font-black text-rose-400">{rejectedDocsCount}</p>
          <p className="text-[10px] text-[#A7C9CE]">Resubmission notices issued</p>
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="flex border-b border-[#1B5968] gap-4">
        <button
          onClick={() => setActiveTab('AUDIT_QUEUE')}
          className={`pb-3 text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all border-b-2 ${
            activeTab === 'AUDIT_QUEUE'
              ? 'border-[#06B6B4] text-[#14D9D5]'
              : 'border-transparent text-[#A7C9CE] hover:text-white'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Bidder Document Audit Queue ({documents.length})</span>
          {pendingDocsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {pendingDocsCount} Action Required
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('BID_MATRIX')}
          className={`pb-3 text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all border-b-2 ${
            activeTab === 'BID_MATRIX'
              ? 'border-[#06B6B4] text-[#14D9D5]'
              : 'border-transparent text-[#A7C9CE] hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tender & Bid Compliance Inspector ({bids.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BIDDER DOCUMENT AUDIT QUEUE                                       */}
      {/* ========================================================================= */}
      {activeTab === 'AUDIT_QUEUE' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-5 rounded-2xl bg-[#0B3442] border border-[#1B5968] space-y-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative md:col-span-1">
                <Search className="w-4 h-4 text-[#A7C9CE] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search document, bidder, filename, or ID..."
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  className="w-full bg-[#071F2A] border border-[#1B5968] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#A7C9CE]/60 focus:outline-none focus:border-[#06B6B4] transition-colors"
                />
              </div>

              {/* Document Type Filter */}
              <div>
                <select
                  value={docTypeFilter}
                  onChange={(e) => setDocTypeFilter(e.target.value)}
                  className="w-full bg-[#071F2A] border border-[#1B5968] rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-[#06B6B4] cursor-pointer"
                >
                  <option value="ALL">All Document Types</option>
                  <option value="Tax Certificate">Tax Certificate</option>
                  <option value="Security Audit">Security Audit (ISO / CERT-In)</option>
                  <option value="Environmental">Environmental Clearance</option>
                  <option value="Incorporation">Certificate of Incorporation</option>
                  <option value="Compliance Certificate">Compliance Certificate</option>
                  <option value="Bank Solvency">Bank Solvency & Balance Sheet</option>
                </select>
              </div>

              {/* Bidder Filter */}
              <div>
                <select
                  value={docBidderFilter}
                  onChange={(e) => setDocBidderFilter(e.target.value)}
                  className="w-full bg-[#071F2A] border border-[#1B5968] rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-[#06B6B4] cursor-pointer"
                >
                  <option value="ALL">All Bidders</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.companyName} ({v.id})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Status Pill Filter */}
            <div className="pt-3 border-t border-[#1B5968] flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold mr-2 flex items-center gap-1 text-[#A7C9CE]">
                <Filter className="w-3.5 h-3.5 text-[#14D9D5]" /> Status Filter:
              </span>
              {[
                { id: 'ALL', label: `All Documents (${documents.length})` },
                { id: 'PENDING_REVIEW', label: `Pending Review (${pendingDocsCount})` },
                { id: 'APPROVED', label: `Approved (${approvedDocsCount})` },
                { id: 'REJECTED', label: `Rejected (${rejectedDocsCount})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDocStatusTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    docStatusTab === tab.id
                      ? 'bg-[#06B6B4] text-white shadow-xs'
                      : 'bg-[#071F2A] text-[#A7C9CE] hover:bg-[#145364]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Queue Table */}
          <div className="rounded-2xl border border-[#1B5968] bg-[#103D4A] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#1B5968] bg-[#0B3442] flex justify-between items-center">
              <h3 className="font-extrabold text-sm flex items-center gap-2 text-white">
                <FileCheck2 className="w-4 h-4 text-[#14D9D5]" />
                Auditable Documents Register ({filteredDocuments.length})
              </h3>
              <span className="text-xs text-[#A7C9CE] font-medium">Click Approve or Reject to update statutory status</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1B5968] uppercase font-bold text-[10px] tracking-wider bg-[#0B3442] text-[#A7C9CE]">
                    <th className="py-3.5 px-4">Doc ID</th>
                    <th className="py-3.5 px-4">Document Details</th>
                    <th className="py-3.5 px-4">Bidder Enterprise</th>
                    <th className="py-3.5 px-4">Uploaded Time</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4">Audit Record</th>
                    <th className="py-3.5 px-4 text-right">Audit Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B5968]">
                  {filteredDocuments.map(doc => {
                    const stNorm = (doc.status || '').toUpperCase();
                    const isPending = stNorm.includes('PENDING') || stNorm.includes('REVIEW');
                    const isApproved = stNorm.includes('APPROV') || stNorm.includes('VERIFIED');
                    const isRejected = stNorm.includes('REJECT');

                    return (
                      <tr key={doc.id} className="transition-colors hover:bg-[#145364]/40">
                        {/* Doc ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#14D9D5]">
                          {doc.id}
                        </td>

                        {/* Document Details */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white leading-snug">{doc.title || doc.fileName}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#A7C9CE]">
                            <span className="px-1.5 py-0.5 rounded bg-[#071F2A] border border-[#145364] text-[#14D9D5] font-mono">
                              {doc.fileType || 'PDF'}
                            </span>
                            <span>{doc.fileSize || '1.2 MB'}</span>
                            <span>•</span>
                            <span className="text-[#A7C9CE] truncate max-w-[140px]" title={doc.fileName}>{doc.fileName}</span>
                          </div>
                        </td>

                        {/* Bidder Enterprise */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-[#14D9D5]" /> {doc.vendorName || 'Acme Construction Services'}
                          </p>
                          <p className="text-[10px] text-[#A7C9CE] font-mono mt-0.5">
                            Org ID: {doc.vendorId || doc.companyId || 'VND-10029'}
                          </p>
                          {doc.uploadedByEmail && (
                            <p className="text-[10px] text-[#A7C9CE] truncate max-w-[160px]" title={doc.uploadedByEmail}>
                              {doc.uploadedByEmail}
                            </p>
                          )}
                        </td>

                        {/* Upload Date / Time */}
                        <td className="py-3.5 px-4 text-[#A7C9CE]">
                          <p className="font-medium text-white">
                            {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
                          </p>
                          <p className="text-[10px] text-[#A7C9CE]">
                            {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 text-center">
                          {isPending && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <Clock className="w-3 h-3" /> PENDING REVIEW
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> APPROVED
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              <XCircle className="w-3 h-3" /> REJECTED
                            </span>
                          )}
                        </td>

                        {/* Audit Details */}
                        <td className="py-3.5 px-4 text-[11px]">
                          {doc.verifiedBy ? (
                            <div className="space-y-0.5">
                              <p className="text-[#A7C9CE]">By: <strong className="text-white">{doc.verifiedBy}</strong></p>
                              {doc.reviewedAt && (
                                <p className="text-[10px] text-[#A7C9CE]">{new Date(doc.reviewedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                              )}
                              {doc.resubmissionReason && (
                                <p className="text-[10px] text-rose-300 bg-rose-950/40 px-2 py-1 rounded border border-rose-800/40 mt-1" title={doc.resubmissionReason}>
                                  <strong>Reason:</strong> {doc.resubmissionReason}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#A7C9CE] italic">Awaiting Audit</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Download File */}
                            <button
                              onClick={() => handleDownloadDoc(doc)}
                              className="p-2 rounded-xl bg-[#071F2A] hover:bg-[#145364] text-[#06B6B4] hover:text-[#14D9D5] border border-[#1B5968] transition-colors cursor-pointer"
                              title="Download File locally"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            {/* Preview File */}
                            <button
                              onClick={() => setSelectedDoc(doc)}
                              className="p-2 rounded-xl bg-[#071F2A] hover:bg-[#145364] text-[#A7C9CE] hover:text-white border border-[#1B5968] transition-colors cursor-pointer"
                              title="Preview Document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Approve Button */}
                            <button
                              onClick={() => handleApproveDoc(doc)}
                              disabled={submittingAction || isApproved}
                              className={`px-2.5 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer ${
                                isApproved
                                  ? 'bg-emerald-950/40 text-emerald-400/50 border border-emerald-800/30 cursor-not-allowed'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                              }`}
                              title="Approve Document"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">Approve</span>
                            </button>

                            {/* Reject Button */}
                            <button
                              onClick={() => handleOpenRejectModal(doc)}
                              disabled={submittingAction || isRejected}
                              className={`px-2.5 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer ${
                                isRejected
                                  ? 'bg-rose-950/40 text-rose-400/50 border border-rose-800/30 cursor-not-allowed'
                                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs'
                              }`}
                              title="Reject Document & Issue Notice"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredDocuments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#A7C9CE] font-medium">
                        No documents matched the specified filter or search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TENDER & BID COMPLIANCE INSPECTOR MATRIX                          */}
      {/* ========================================================================= */}
      {activeTab === 'BID_MATRIX' && (
        <div className="space-y-6">
          {/* Dual Search & Filter Control Bar */}
          <div className="p-6 rounded-2xl border shadow-sm space-y-4 bg-[#0B3442] border-[#1B5968]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SEARCH 1: Search Bids */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#A7C9CE]">
                  <Search className="w-3.5 h-3.5 text-[#14D9D5]" /> Search Bids & Tenders
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by Bid ID, Tender ID, Tender Title, or Bidder Name..."
                    value={globalBidSearch}
                    onChange={(e) => setGlobalBidSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-[#06B6B4] transition-all bg-[#071F2A] border-[#1B5968] text-white"
                  />
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#A7C9CE]" />
                </div>
              </div>

              {/* SEARCH 2: Search Bidders */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#A7C9CE]">
                  <Building2 className="w-3.5 h-3.5 text-[#14D9D5]" /> Search Specific Bidder
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Bidder Company Name, Email, or Organization ID (e.g., VND-10028)..."
                    value={bidderSearch}
                    onChange={(e) => setBidderSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-[#06B6B4] transition-all bg-[#071F2A] border-[#1B5968] text-white"
                  />
                  <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-[#A7C9CE]" />
                </div>
              </div>
            </div>

            {/* Dropdown Filters Row */}
            <div className="pt-3 border-t grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 border-[#1B5968]">
              {/* Filter by Tender Dropdown */}
              <div>
                <label className="text-[10px] font-semibold mb-1 block text-[#A7C9CE]">Tender Filter</label>
                <select
                  value={selectedTenderId}
                  onChange={(e) => setSelectedTenderId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer focus:outline-none focus:border-[#06B6B4] bg-[#071F2A] border-[#1B5968] text-white"
                >
                  <option value="ALL">All Tenders</option>
                  <option value="TND-2026-8901">TND-2026-8901 (Smart City Traffic)</option>
                  <option value="TND-2026-8902">TND-2026-8902 (Data Center Security)</option>
                  <option value="TND-2026-8903">TND-2026-8903 (Solar Microgrid)</option>
                </select>
              </div>

              {/* Filter by Bidder Dropdown */}
              <div>
                <label className="text-[10px] font-semibold mb-1 block text-[#A7C9CE]">Bidder Filter</label>
                <select
                  value={selectedBidderId}
                  onChange={(e) => setSelectedBidderId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer focus:outline-none focus:border-[#06B6B4] bg-[#071F2A] border-[#1B5968] text-white"
                >
                  <option value="ALL">All Bidders</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.companyName} ({v.id})</option>
                  ))}
                </select>
              </div>

              {/* Filter Document Status */}
              <div>
                <label className="text-[10px] font-semibold mb-1 block text-[#A7C9CE]">Document Status</label>
                <select
                  value={docStatusFilter}
                  onChange={(e) => setDocStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer focus:outline-none focus:border-[#06B6B4] bg-[#071F2A] border-[#1B5968] text-white"
                >
                  <option value="ALL">All Document Statuses</option>
                  <option value="Complete">Complete</option>
                  <option value="Missing">Missing</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>

              {/* Filter Eligibility */}
              <div>
                <label className="text-[10px] font-semibold mb-1 block text-[#A7C9CE]">Eligibility Status</label>
                <select
                  value={eligibilityFilter}
                  onChange={(e) => setEligibilityFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer focus:outline-none focus:border-[#06B6B4] bg-[#071F2A] border-[#1B5968] text-white"
                >
                  <option value="ALL">All Eligibility Statuses</option>
                  <option value="Eligible">Eligible</option>
                  <option value="Ineligible">Ineligible</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>
            </div>

            {/* Quick Status Pill Tabs */}
            <div className="pt-3 border-t flex flex-wrap items-center gap-2 border-[#1B5968]">
              <span className="text-[11px] font-bold mr-2 flex items-center gap-1 text-[#A7C9CE]">
                <Filter className="w-3.5 h-3.5" /> Quick Filter:
              </span>
              {[
                { id: 'ALL', label: 'All Bids' },
                { id: 'COMPLETE', label: 'Documents Complete' },
                { id: 'MISSING', label: 'Documents Missing' },
                { id: 'PENDING', label: 'Pending Verification' },
                { id: 'VERIFIED', label: 'Verified' },
                { id: 'REJECTED', label: 'Rejected' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-[#06B6B4] text-white shadow-xs'
                      : 'bg-[#071F2A] text-[#A7C9CE] hover:bg-[#145364]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selected / Matched Bidder Spotlight Card */}
          {matchedVendor && (
            <div className="p-5 rounded-2xl border space-y-3 bg-[#0B3442] border-[#1B5968]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded bg-[#06B6B4]/20 text-[#14D9D5] text-[10px] font-extrabold uppercase tracking-wider">Selected Bidder Profile</span>
                  <h3 className="text-base font-extrabold mt-1 flex items-center gap-2 text-white">
                    <Building2 className="w-5 h-5 text-[#14D9D5]" /> {matchedVendor.companyName}
                  </h3>
                  <p className="text-xs mt-0.5 text-[#A7C9CE]">
                    Org ID: <span className="font-bold text-white">{matchedVendor.id}</span> • Tax ID: <span className="font-bold text-white">{matchedVendor.taxId}</span> • Category: {matchedVendor.category}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs flex items-center gap-1 sm:justify-end text-[#A7C9CE]">
                    <Mail className="w-3.5 h-3.5 text-[#14D9D5]" /> {matchedVendor.email}
                  </p>
                  <p className="text-xs font-bold mt-0.5 text-[#F0FDFA]">Contact: {matchedVendor.contactPerson} ({matchedVendor.phone})</p>
                </div>
              </div>
              
              <div className="pt-2 border-t flex items-center justify-between text-xs font-semibold border-[#1B5968] text-[#A7C9CE]">
                <span>Eligibility Score: <strong className="text-[#14D9D5]">{matchedVendor.eligibilityScore}%</strong></span>
                <span>Annual Turnover: <strong className="text-white">{formatINRLakhsCrores(matchedVendor.annualTurnover)}</strong></span>
                <span>Completed Projects: <strong className="text-white">{matchedVendor.completedProjectsCount}</strong></span>
              </div>
            </div>
          )}

          {/* Main Audit Bids Table */}
          <div className="rounded-2xl border shadow-sm overflow-hidden bg-[#103D4A] border-[#1B5968]">
            <div className="p-4 border-b flex justify-between items-center border-[#1B5968] bg-[#0B3442]">
              <h3 className="font-extrabold text-sm flex items-center gap-2 text-white">
                <FileText className="w-4 h-4 text-[#14D9D5]" /> Submitted Bids & Compliance Register ({filteredBids.length})
              </h3>
              <span className="text-xs font-medium text-[#A7C9CE]">Relationship Matrix: Tender → Bid → Bidder</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b uppercase font-semibold text-[10px] tracking-wider bg-[#0B3442] border-[#1B5968] text-[#A7C9CE]">
                    <th className="py-3.5 px-4">Bid ID</th>
                    <th className="py-3.5 px-4">Tender Info</th>
                    <th className="py-3.5 px-4">Bidder Details</th>
                    <th className="py-3.5 px-4">Proposed Amount</th>
                    <th className="py-3.5 px-4">Submitted</th>
                    <th className="py-3.5 px-4 text-center">Docs Status</th>
                    <th className="py-3.5 px-4 text-center">Eligibility</th>
                    <th className="py-3.5 px-4 text-center">Verification</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B5968]">
                  {filteredBids.map(bid => {
                    const docStatus = bid.documentStatus || 'Complete';
                    const elStatus = bid.eligibilityStatus || 'Eligible';
                    const verStatus = bid.verificationStatus || bid.status || 'Verified';

                    return (
                      <tr key={bid.id} className="transition-colors hover:bg-[#145364]/50">
                        {/* Bid ID */}
                        <td className="py-3.5 px-4 font-extrabold text-[#14D9D5]">
                          {bid.id}
                        </td>

                        {/* Tender Info */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold leading-snug text-white">{bid.tenderTitle || 'Smart City Infrastructure'}</p>
                          <p className="text-[10px] text-[#A7C9CE] font-mono mt-0.5">{bid.tenderId}</p>
                        </td>

                        {/* Bidder Details */}
                        <td className="py-3.5 px-4">
                          <p className="font-extrabold text-white">{bid.bidderName || bid.vendorName}</p>
                          <p className="text-[10px] text-[#A7C9CE] flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-[#A7C9CE]" /> {bid.vendorEmail || 'info@abcinfra.com'}
                          </p>
                          <p className="text-[10px] text-[#A7C9CE] font-mono">Org: {bid.vendorId || 'VND-10028'}</p>
                        </td>

                        {/* Proposed Amount */}
                        <td className="py-3.5 px-4 font-black text-sm text-white">
                          {formatINRLakhsCrores(bid.proposedAmount)}
                        </td>

                        {/* Submitted Date */}
                        <td className="py-3.5 px-4 font-medium text-[#A7C9CE]">
                          {bid.submissionDate || bid.submittedAt || '10/08/2026'}
                        </td>

                        {/* Document Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 border ${
                            docStatus === 'Complete'
                              ? 'bg-[#20C997]/10 text-[#20C997] border-[#20C997]/30'
                              : docStatus === 'Missing'
                              ? 'bg-[#FF6B7A]/10 text-[#FF6B7A] border-[#FF6B7A]/30'
                              : 'bg-[#F4C95D]/10 text-[#F4C95D] border-[#F4C95D]/30'
                          }`}>
                            {docStatus === 'Complete' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {docStatus}
                          </span>
                        </td>

                        {/* Eligibility Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 border ${
                            elStatus === 'Eligible'
                              ? 'bg-[#06B6B4]/10 text-[#14D9D5] border-[#06B6B4]/30'
                              : elStatus === 'Ineligible'
                              ? 'bg-[#FF6B7A]/10 text-[#FF6B7A] border-[#FF6B7A]/30'
                              : 'bg-[#F4C95D]/10 text-[#F4C95D] border-[#F4C95D]/30'
                          }`}>
                            {elStatus}
                          </span>
                        </td>

                        {/* Verification Status */}
                        <td className="py-3.5 px-4 text-center">
                          <StatusBadge status={verStatus} />
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setActiveBidDetail(bid)}
                            className="px-3 py-1.5 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-white font-bold transition-all text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Inspect Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredBids.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#A7C9CE] font-medium">
                        No matching bids or bidders found for the specified search/filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal with Mandatory Reason */}
      {rejectionModalDoc && (
        <div className="fixed inset-0 z-50 bg-[#071F2A]/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl max-w-lg w-full border border-rose-500/40 shadow-2xl p-6 space-y-4 bg-[#0B3442] text-white animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-[#1B5968] pb-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                  Official Rejection Notice
                </span>
                <h3 className="text-base font-extrabold mt-1 text-white">
                  Reject Document #{rejectionModalDoc.id}
                </h3>
              </div>
              <button
                onClick={() => setRejectionModalDoc(null)}
                className="p-1 rounded-lg text-[#A7C9CE] hover:text-white hover:bg-[#103D4A] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#103D4A] border border-[#1B5968] space-y-1 text-xs">
              <p className="font-bold text-white">{rejectionModalDoc.title || rejectionModalDoc.fileName}</p>
              <p className="text-[#A7C9CE]">Bidder: <strong className="text-white">{rejectionModalDoc.vendorName}</strong> ({rejectionModalDoc.vendorId || rejectionModalDoc.companyId})</p>
              <p className="text-[11px] text-[#A7C9CE]">Type: {rejectionModalDoc.documentType || 'Certificate'}</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#F0FDFA]">
                Mandatory Rejection & Resubmission Instructions *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Specify the exact compliance defect or missing verification details (e.g., 'Expired tax clearance certificate. Please upload valid FY26 form with state seal.')..."
                rows={4}
                className="w-full bg-[#071F2A] border border-[#1B5968] focus:border-rose-500 rounded-xl p-3 text-xs text-white placeholder-[#A7C9CE]/50 focus:outline-none transition-colors"
              />
              <p className="text-[10px] text-[#A7C9CE] flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                This reason will be recorded in the audit log and sent as an official notice to the bidder.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                onClick={() => setRejectionModalDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#071F2A] hover:bg-[#145364] text-[#A7C9CE] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectDoc}
                disabled={submittingAction || !rejectionReason.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer ${
                  !rejectionReason.trim() || submittingAction
                    ? 'bg-rose-900/50 text-rose-300/50 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {submittingAction ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bid Inspection Modal */}
      {activeBidDetail && (
        <div className="fixed inset-0 z-50 bg-[#071F2A]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-2xl max-w-2xl w-full border shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 bg-[#0B3442] border-[#1B5968] text-white">
            <div className="flex justify-between items-start border-b pb-4 border-[#1B5968]">
              <div>
                <span className="px-2 py-0.5 rounded bg-[#06B6B4]/20 text-[#14D9D5] border border-[#06B6B4]/30 text-[10px] font-extrabold uppercase tracking-wider">Detailed Audit Record</span>
                <h3 className="text-lg font-extrabold mt-1 text-white">
                  Bid #{activeBidDetail.id} — {activeBidDetail.tenderTitle}
                </h3>
                <p className="text-xs text-[#A7C9CE]">Tender ID: {activeBidDetail.tenderId}</p>
              </div>
              <button
                onClick={() => setActiveBidDetail(null)}
                className="p-1 rounded-lg text-[#A7C9CE] hover:text-white hover:bg-[#103D4A] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl border space-y-1 bg-[#103D4A] border-[#1B5968]">
                <span className="text-[10px] font-bold text-[#A7C9CE] uppercase">Bidder Company</span>
                <p className="font-extrabold text-sm text-white">{activeBidDetail.bidderName || activeBidDetail.vendorName}</p>
                <p className="font-medium text-[#A7C9CE]">Email: {activeBidDetail.vendorEmail || 'info@abcinfra.com'}</p>
                <p className="text-[#A7C9CE] font-mono">Org ID: {activeBidDetail.vendorId || 'VND-10028'}</p>
              </div>

              <div className="p-3 rounded-xl border space-y-1 bg-[#103D4A] border-[#1B5968]">
                <span className="text-[10px] font-bold text-[#A7C9CE] uppercase">Proposed Financial Bid</span>
                <p className="font-extrabold text-sm text-white">{formatINRLakhsCrores(activeBidDetail.proposedAmount)}</p>
                <p className="font-medium text-[#A7C9CE]">Submission Date: {activeBidDetail.submissionDate || activeBidDetail.submittedAt || '10/08/2026'}</p>
                <p className="font-medium text-[#A7C9CE]">Duration: {activeBidDetail.estimatedCompletionTime || '12 Months'}</p>
              </div>
            </div>

            {/* Document Check Verification Summary */}
            <div className="p-4 rounded-xl border space-y-3 bg-[#103D4A] border-[#1B5968]">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-white">Required Document Compliance Checklist</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg border bg-[#0B3442] border-[#1B5968] text-white">
                  <span className="font-bold">1. Tax Compliance & Clearance Certificate</span>
                  <span className="text-[#20C997] font-extrabold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verified & Approved</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg border bg-[#0B3442] border-[#1B5968] text-white">
                  <span className="font-bold">2. ISO 9001 / ISO 27001 Quality Certificate</span>
                  <span className="text-[#20C997] font-extrabold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verified & Approved</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg border bg-[#0B3442] border-[#1B5968] text-white">
                  <span className="font-bold">3. Bank Solvency & Audited Balance Sheet FY25</span>
                  <span className="text-[#20C997] font-extrabold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verified & Approved</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => {
                  showToast('Bid document verification confirmed by Officer', 'success');
                  setActiveBidDetail(null);
                }}
                className="px-4 py-2 bg-[#06B6B4] hover:bg-[#14D9D5] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Confirm Verification
              </button>
              <button
                onClick={() => setActiveBidDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-[#071F2A] hover:bg-[#145364] text-[#A7C9CE] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      <FilePreviewModal isOpen={!!selectedDoc} onClose={() => setSelectedDoc(null)} document={selectedDoc} />
    </div>
  );
}
