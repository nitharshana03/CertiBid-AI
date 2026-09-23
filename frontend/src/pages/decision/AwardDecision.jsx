// CertiBid AI - Bid Evaluation, Bidder Selection & Contract Award Module
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Award,
  Gavel,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Send,
  Building2,
  DollarSign,
  AlertTriangle,
  FileCheck2,
  Clock,
  UserCheck,
  Check,
  X,
  Search,
  ChevronRight,
  ShieldCheck,
  FileText,
  Download,
  RefreshCw,
  Loader2
} from 'lucide-react';

export function AwardDecision() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const rawRole = String(user?.role || '').toUpperCase().trim();
  const isAdmin = rawRole === 'ADMIN';
  const isOfficer = rawRole === 'OFFICER';

  const [tenders, setTenders] = useState([]);
  const [bids, setBids] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Modal States
  const [isSelectBidderModalOpen, setIsSelectBidderModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [targetBidForModal, setTargetBidForModal] = useState(null);
  const [escalateComment, setEscalateComment] = useState('');
  const [awardNotes, setAwardNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const [tRes, bRes] = await Promise.all([
        apiService.getTenders(),
        apiService.getBids()
      ]);
      const tList = Array.isArray(tRes?.data) ? tRes.data : [];
      const bList = Array.isArray(bRes?.data) ? bRes.data : [];
      setTenders(tList);
      setBids(bList);

      if (tList.length > 0) {
        setSelectedTender(prev => {
          if (!prev) return tList[0];
          return tList.find(t => t && t.id === prev.id) || tList[0];
        });
      } else {
        setSelectedTender(null);
      }
    } catch (e) {
      console.error('Error loading tender evaluation data:', e);
      setFetchError(e?.message || 'Unable to load tender evaluation.');
      showToast('Failed to load evaluation data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentTenderBids = Array.isArray(bids) && selectedTender
    ? bids.filter(b => b && b.tenderId === selectedTender.id)
    : [];
  
  // Identify currently selected bidder for this tender
  const selectedBid = currentTenderBids.find(
    b => b && (b.id === selectedTender?.selectedBidId || b.status === 'Selected' || b.status === 'PENDING_ADMIN_APPROVAL' || b.status === 'Awarded')
  ) || null;

  // Filtered Tenders list
  const filteredTenders = (Array.isArray(tenders) ? tenders : []).filter(t => {
    if (!t) return false;
    const matchesSearch =
      (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.department || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return t.status === 'Active' || t.status === 'Under Evaluation';
    if (statusFilter === 'SELECTED') return t.status === 'Bidder Selected';
    if (statusFilter === 'PENDING_ADMIN') return t.status === 'Pending Admin Review' || t.status === 'PENDING_ADMIN_REVIEW' || t.status === 'PENDING_ADMIN_APPROVAL' || t.escalatedToAdmin;
    if (statusFilter === 'AWARDED') return t.status === 'Awarded';
    return true;
  });

  // Open Select Bidder Modal
  const openSelectBidderModal = (bid) => {
    if (!selectedTender) return;
    if (selectedTender.status === 'Awarded') {
      showToast('This tender has already been awarded.', 'warning');
      return;
    }
    setTargetBidForModal(bid);
    setIsSelectBidderModalOpen(true);
  };

  // Action 1: Confirm Select Bidder (Officer)
  const handleConfirmSelectBidder = async () => {
    if (!selectedTender || !targetBidForModal) return;
    setActionInProgress(true);
    try {
      await apiService.selectBidder(selectedTender.id, targetBidForModal.id);
      showToast(
        'Bidder selected successfully. The bidder has been notified.',
        'success'
      );
      setIsSelectBidderModalOpen(false);
      await fetchData();
    } catch (e) {
      console.error('Error selecting bidder:', e);
      showToast(e?.message || 'Unable to select bidder. Please try again.', 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  // Open Escalate to Admin Modal
  const openEscalateModal = (bid = null) => {
    if (!selectedTender) {
      showToast('Please select a tender first.', 'info');
      return;
    }
    if (
      selectedTender.status === 'Pending Admin Review' ||
      selectedTender.status === 'PENDING_ADMIN_REVIEW' ||
      selectedTender.status === 'PENDING_ADMIN_APPROVAL' ||
      selectedTender.escalatedToAdmin
    ) {
      showToast('This tender is already escalated and pending Admin review.', 'info');
      return;
    }
    if (selectedTender.status === 'Awarded') {
      showToast('This tender has already been awarded.', 'warning');
      return;
    }
    setTargetBidForModal(bid || selectedBid || null);
    setIsEscalateModalOpen(true);
  };

  // Action 2: Confirm Escalate to Admin (Officer)
  const handleConfirmEscalation = async () => {
    if (!selectedTender) return;
    setActionInProgress(true);
    try {
      await apiService.escalateToAdmin(selectedTender.id, {
        bidId: targetBidForModal?.id || selectedBid?.id || null,
        comment: escalateComment || 'Tender escalated by Procurement Officer for senior governance review.'
      });
      showToast('Tender escalated to Admin successfully. The Admin has been notified.', 'success');
      setIsEscalateModalOpen(false);
      await fetchData();
    } catch (e) {
      console.error('Error escalating tender to Admin:', e);
      showToast(e?.message || 'Unable to escalate tender. Please try again.', 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  // Action 3: Admin Approves Award
  const handleAdminApproveAward = async () => {
    if (!selectedTender) return;
    const targetBidId = selectedTender.selectedBidId || selectedBid?.id;
    if (!targetBidId) {
      showToast('No selected bidder found to approve.', 'error');
      return;
    }
    setActionInProgress(true);
    try {
      await apiService.approveAward(selectedTender.id, {
        bidId: targetBidId,
        notes: awardNotes || 'Admin approved contract award to selected bidder after committee governance review.'
      });
      showToast('Contract officially awarded! Winner notification dispatched.', 'success');
      setIsApproveModalOpen(false);
      await fetchData();
    } catch (e) {
      console.error('Error approving award:', e);
      showToast(e?.message || 'Failed to approve contract award', 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  // Action 4: Admin Rejects Award Proposal
  const handleAdminRejectAward = async () => {
    if (!selectedTender) return;
    if (!rejectReason.trim()) {
      showToast('Please provide a reason for returning the tender.', 'warning');
      return;
    }
    setActionInProgress(true);
    try {
      await apiService.rejectAward(selectedTender.id, {
        bidId: selectedBid?.id,
        reason: rejectReason
      });
      showToast('Proposal returned to Procurement Officer for re-evaluation.', 'info');
      setIsRejectModalOpen(false);
      await fetchData();
    } catch (e) {
      console.error('Error rejecting award proposal:', e);
      showToast(e?.message || 'Failed to reject proposal', 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  // Helper for AI Risk badge color
  const getRiskBadge = (score = 15) => {
    const numericScore = typeof score === 'number' ? score : 15;
    if (numericScore < 25) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#20C997]/15 text-[#20C997] border border-[#20C997]/30 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Low Risk ({numericScore}/100)
        </span>
      );
    }
    if (numericScore < 50) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFB020]/15 text-[#FFB020] border border-[#FFB020]/30 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Medium Risk ({numericScore}/100)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B7A]/15 text-[#FF6B7A] border border-[#FF6B7A]/30 flex items-center gap-1">
        <ShieldAlert className="w-3 h-3" /> High Risk ({numericScore}/100)
      </span>
    );
  };

  // Loading View
  if (loading && tenders.length === 0) {
    return (
      <div className="space-y-6 text-[#F0FDFA]">
        <div className="p-6 rounded-2xl bg-[#0B3442] border border-[#1B5968] text-white shadow-xl flex items-center gap-3">
          <Award className="w-6 h-6 text-[#14D9D5]" />
          <div>
            <h2 className="text-xl font-extrabold text-white">Bid Evaluation & Contract Award</h2>
            <p className="text-xs text-[#A7C9CE]">Loading tender evaluation...</p>
          </div>
        </div>
        <div className="p-12 rounded-2xl bg-[#103D4A] border border-[#1B5968] text-center space-y-4 shadow-xl">
          <Loader2 className="w-10 h-10 text-[#14D9D5] animate-spin mx-auto" />
          <p className="text-sm font-semibold text-white">Loading tender evaluation details...</p>
          <p className="text-xs text-[#A7C9CE]">Fetching competitive bids, forensic scoring, and procurement workflows.</p>
        </div>
      </div>
    );
  }

  // Error View with Retry
  if (fetchError && tenders.length === 0) {
    return (
      <div className="space-y-6 text-[#F0FDFA]">
        <div className="p-6 rounded-2xl bg-[#0B3442] border border-[#1B5968] text-white shadow-xl flex items-center gap-3">
          <Award className="w-6 h-6 text-[#14D9D5]" />
          <div>
            <h2 className="text-xl font-extrabold text-white">Bid Evaluation & Contract Award</h2>
            <p className="text-xs text-[#A7C9CE]">Procurement Governance Portal</p>
          </div>
        </div>
        <div className="p-8 rounded-2xl bg-[#0B3442] border border-[#FF6B7A]/40 text-[#F0FDFA] shadow-xl text-center space-y-4 max-w-xl mx-auto">
          <AlertTriangle className="w-10 h-10 text-[#FF6B7A] mx-auto" />
          <h3 className="text-lg font-bold text-white">Unable to load tender evaluation.</h3>
          <p className="text-xs text-[#A7C9CE]">{fetchError}</p>
          <button
            onClick={fetchData}
            className="px-5 py-2.5 rounded-xl bg-[#14D9D5] hover:bg-[#14D9D5]/90 text-[#071F2A] font-extrabold text-xs shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#F0FDFA]">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0B3442] border border-[#1B5968] text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#14D9D5] uppercase tracking-wider">
              {isAdmin ? 'Senior Governance Board' : 'Procurement Evaluation Committee'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#06B6B4]/20 text-[#14D9D5] text-[10px] font-bold border border-[#06B6B4]/30">
              {isAdmin ? 'Admin Approval Console' : 'Officer Evaluation & Escalation'}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
            <Award className="w-6 h-6 text-[#14D9D5]" /> Bid Evaluation & Contract Award
          </h2>
          <p className="text-xs text-[#A7C9CE] mt-1 max-w-2xl">
            Select verified vendor proposals, escalate recommendations to Admin for governance approval, and finalize legally binding contract awards.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-[#103D4A] p-3 rounded-xl border border-[#1B5968] shrink-0">
          <div className="text-center px-3 border-r border-[#1B5968]">
            <p className="text-[10px] text-[#A7C9CE]">Tenders</p>
            <p className="text-base font-extrabold text-white">{tenders.length}</p>
          </div>
          <div className="text-center px-3 border-r border-[#1B5968]">
            <p className="text-[10px] text-[#A7C9CE]">Pending Review</p>
            <p className="text-base font-extrabold text-[#FFB020]">
              {tenders.filter(t => t && (t.status === 'PENDING_ADMIN_APPROVAL' || t.status === 'Pending Admin Review' || t.status === 'PENDING_ADMIN_REVIEW' || t.escalatedToAdmin)).length}
            </p>
          </div>
          <div className="text-center px-3">
            <p className="text-[10px] text-[#A7C9CE]">Awarded</p>
            <p className="text-base font-extrabold text-[#20C997]">
              {tenders.filter(t => t && t.status === 'Awarded').length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Tender Navigator, Right Evaluation Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tenders List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-[#103D4A] border border-[#1B5968] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Gavel className="w-4 h-4 text-[#14D9D5]" /> Select Tender
              </h3>
              <span className="text-[11px] font-bold text-[#A7C9CE]">{filteredTenders.length} Found</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6F9BA3]" />
              <input
                type="text"
                placeholder="Search tender ID or title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0B3442] border border-[#1B5968] text-white text-xs placeholder-[#6F9BA3] focus:outline-none focus:border-[#14D9D5]"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'ACTIVE', label: 'Active' },
                { id: 'SELECTED', label: 'Selected' },
                { id: 'PENDING_ADMIN', label: 'Pending Admin' },
                { id: 'AWARDED', label: 'Awarded' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                    statusFilter === tab.id
                      ? 'bg-[#14D9D5] text-[#071F2A]'
                      : 'bg-[#0B3442] text-[#A7C9CE] hover:text-white border border-[#1B5968]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Tender Cards */}
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {filteredTenders.length === 0 ? (
                <p className="text-xs text-[#A7C9CE] text-center py-8">No tenders match criteria</p>
              ) : (
                filteredTenders.map(t => {
                  const isSelected = selectedTender?.id === t.id;
                  const isAwarded = t.status === 'Awarded';
                  const isPendingAdmin = t.status === 'PENDING_ADMIN_APPROVAL' || t.status === 'Pending Admin Review' || t.status === 'PENDING_ADMIN_REVIEW' || t.escalatedToAdmin;
                  const isBidderSelected = t.status === 'Bidder Selected';

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTender(t)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-[#0B3442] border-[#14D9D5] text-white shadow-lg ring-1 ring-[#14D9D5]/50'
                          : 'bg-[#0B3442]/60 border-[#1B5968] text-[#A7C9CE] hover:border-[#14D9D5]/50 hover:bg-[#0B3442]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold text-[#14D9D5]">{t.id}</span>
                        {isAwarded ? (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-[#20C997]/20 text-[#20C997] border border-[#20C997]/30">
                            Awarded
                          </span>
                        ) : isPendingAdmin ? (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-[#FFB020]/20 text-[#FFB020] border border-[#FFB020]/30 animate-pulse">
                            Pending Admin
                          </span>
                        ) : isBidderSelected ? (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-[#06B6B4]/20 text-[#14D9D5] border border-[#06B6B4]/30">
                            Bidder Selected
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#103D4A] text-[#A7C9CE] border border-[#1B5968]">
                            {t.status || 'Active'}
                          </span>
                        )}
                      </div>

                      <p className="font-bold text-xs text-white mt-1 line-clamp-1">{t.title}</p>
                      <p className="text-[10px] text-[#A7C9CE] mt-0.5 truncate">{t.department}</p>

                      <div className="flex justify-between items-center text-[10px] mt-2 pt-2 border-t border-[#1B5968]/60">
                        <span className="text-[#6F9BA3]">Budget: ₹{(Number(t.budget || 0) / 10000000).toFixed(2)} Cr</span>
                        {t.selectedVendorName && (
                          <span className="font-semibold text-[#14D9D5] truncate max-w-[120px]">
                            {t.selectedVendorName}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Tender Details & Submitted Proposals (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {selectedTender ? (
            <>
              {/* Tender Active Header Card */}
              <div className="p-5 rounded-2xl bg-[#103D4A] border border-[#1B5968] space-y-3 shadow-lg">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#14D9D5]">{selectedTender.id}</span>
                      <span className="text-xs text-[#A7C9CE]">• {selectedTender.category || 'General Procurement'}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-0.5">{selectedTender.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-[#A7C9CE] mt-0.5">
                      <span>{selectedTender.department}</span>
                      <span>•</span>
                      <span>Budget: <strong className="text-white">₹{Number(selectedTender.budget || 0).toLocaleString()}</strong></span>
                    </div>
                  </div>

                  {/* Status Badge & Escalate Action */}
                  <div className="flex items-center gap-2">
                    {selectedTender.status === 'Awarded' ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-black bg-[#20C997]/20 text-[#20C997] border border-[#20C997]/40 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Formally Awarded
                      </span>
                    ) : selectedTender.status === 'PENDING_ADMIN_APPROVAL' || selectedTender.status === 'Pending Admin Review' || selectedTender.status === 'PENDING_ADMIN_REVIEW' || selectedTender.escalatedToAdmin ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-black bg-[#FFB020]/20 text-[#FFB020] border border-[#FFB020]/40 flex items-center gap-1.5 animate-pulse">
                        <Clock className="w-4 h-4" /> Pending Admin Approval
                      </span>
                    ) : selectedBid ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-black bg-[#06B6B4]/20 text-[#14D9D5] border border-[#06B6B4]/40 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4" /> Bidder Selected
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#0B3442] text-[#A7C9CE] border border-[#1B5968]">
                        Evaluation Open
                      </span>
                    )}
                  </div>
                </div>

                {/* Lifecycle Pipeline Bar */}
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-[#1B5968] text-[10px]">
                  <div className="p-2 rounded-lg bg-[#0B3442] border border-[#14D9D5]/40 text-center">
                    <span className="font-bold text-[#14D9D5] block">1. Proposals Open</span>
                    <span className="text-[#A7C9CE]">{currentTenderBids.length} Submitted</span>
                  </div>
                  <div className={`p-2 rounded-lg border text-center ${
                    selectedBid ? 'bg-[#0B3442] border-[#14D9D5] text-[#14D9D5]' : 'bg-[#0B3442]/40 border-[#1B5968] text-[#6F9BA3]'
                  }`}>
                    <span className="font-bold block">2. Select Bidder</span>
                    <span className="truncate">{selectedBid ? '✓ Selected' : 'Pending'}</span>
                  </div>
                  <div className={`p-2 rounded-lg border text-center ${
                    selectedTender.status === 'PENDING_ADMIN_APPROVAL' || selectedTender.status === 'Pending Admin Review' || selectedTender.status === 'PENDING_ADMIN_REVIEW' || selectedTender.escalatedToAdmin || selectedTender.status === 'Awarded'
                      ? 'bg-[#0B3442] border-[#FFB020] text-[#FFB020]'
                      : 'bg-[#0B3442]/40 border-[#1B5968] text-[#6F9BA3]'
                  }`}>
                    <span className="font-bold block">3. Admin Review</span>
                    <span>{selectedTender.status === 'PENDING_ADMIN_APPROVAL' || selectedTender.status === 'Pending Admin Review' || selectedTender.status === 'PENDING_ADMIN_REVIEW' || selectedTender.escalatedToAdmin ? '⏳ Under Review' : selectedTender.status === 'Awarded' ? '✓ Approved' : 'Pending'}</span>
                  </div>
                  <div className={`p-2 rounded-lg border text-center ${
                    selectedTender.status === 'Awarded'
                      ? 'bg-[#0B3442] border-[#20C997] text-[#20C997]'
                      : 'bg-[#0B3442]/40 border-[#1B5968] text-[#6F9BA3]'
                  }`}>
                    <span className="font-bold block">4. Contract Award</span>
                    <span>{selectedTender.status === 'Awarded' ? '✓ Completed' : 'Pending'}</span>
                  </div>
                </div>
              </div>

              {/* ADMIN REVIEW ACTION BANNER (When Admin logs in and tender is pending approval) */}
              {isAdmin && (selectedTender.status === 'PENDING_ADMIN_APPROVAL' || selectedTender.status === 'Pending Admin Review' || selectedTender.status === 'PENDING_ADMIN_REVIEW' || selectedTender.escalatedToAdmin) && selectedTender.status !== 'Awarded' && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0B3442] to-[#103D4A] border-2 border-[#FFB020]/60 space-y-3 shadow-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#FFB020]/20 text-[#FFB020]">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-white">Admin Approval Required</h4>
                        <p className="text-xs text-[#A7C9CE]">
                          The Procurement Officer has evaluated competitive proposals and nominated the following preferred bidder.
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedBid && (
                    <div className="p-3.5 rounded-xl bg-[#071F2A] border border-[#1B5968] flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] text-[#A7C9CE]">Nominated Vendor</p>
                        <p className="font-extrabold text-sm text-white">{selectedBid.vendorName || selectedBid.bidderName}</p>
                        <p className="text-[10px] text-[#6F9BA3]">Bid ID: {selectedBid.id} • AI Risk: <strong className="text-[#20C997]">{selectedBid.aiRiskScore || 15}/100</strong></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-[#A7C9CE]">Proposed Contract Value</p>
                        <p className="font-black text-base text-[#20C997]">₹{(selectedBid.proposedAmount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {selectedTender.escalationOfficerComment && (
                    <p className="text-xs text-[#F0FDFA] italic bg-[#0B3442] p-3 rounded-xl border border-[#1B5968]">
                      <strong>Officer Note:</strong> "{selectedTender.escalationOfficerComment}"
                    </p>
                  )}

                  {/* Admin Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setIsRejectModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-[#FF6B7A]/15 hover:bg-[#FF6B7A]/25 text-[#FF6B7A] border border-[#FF6B7A]/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" /> Reject / Return to Officer
                    </button>
                    <button
                      onClick={() => setIsApproveModalOpen(true)}
                      className="px-5 py-2 rounded-xl bg-[#20C997] hover:bg-[#20C997]/80 text-[#071F2A] font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Approve Contract Award
                    </button>
                  </div>
                </div>
              )}

              {/* AWARDED STATE BANNER */}
              {selectedTender.status === 'Awarded' ? (
                <div className="p-6 rounded-2xl bg-[#0B3442] border border-[#20C997]/50 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-[#20C997]/20 text-[#20C997] ring-1 ring-[#20C997]/30">
                        <Award className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#20C997] bg-[#20C997]/10 px-2.5 py-0.5 rounded-md border border-[#20C997]/20">
                          Contract Formally Awarded
                        </span>
                        <h4 className="text-xl font-black text-white mt-1">
                          {selectedTender.awardedVendorName || selectedTender.selectedVendorName || 'Winning Enterprise'}
                        </h4>
                        <p className="text-xs text-[#A7C9CE]">Tender Ref: {selectedTender.id} • Bid ID: {selectedTender.awardedBidId || selectedTender.selectedBidId}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => showToast('Award Certificate generated and downloaded.', 'success')}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#103D4A] hover:bg-[#103D4A]/80 border border-[#1B5968] text-white text-xs font-bold cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-[#14D9D5]" /> Certificate PDF
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-4 border-t border-[#1B5968]">
                    <div className="p-3 rounded-xl bg-[#103D4A] border border-[#1B5968]">
                      <span className="text-[#A7C9CE] text-[10px] block">Contract Value</span>
                      <p className="font-black text-[#20C997] text-base">
                        ₹{(selectedTender.awardedAmount || selectedTender.selectedBidAmount || selectedTender.budget || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#103D4A] border border-[#1B5968]">
                      <span className="text-[#A7C9CE] text-[10px] block">Execution Timeline</span>
                      <p className="font-bold text-white text-sm">
                        {selectedBid?.estimatedCompletionTime || '12 Months'}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#103D4A] border border-[#1B5968]">
                      <span className="text-[#A7C9CE] text-[10px] block">Sanction Date</span>
                      <p className="font-bold text-white text-sm">
                        {selectedTender.awardedAt ? new Date(selectedTender.awardedAt).toLocaleDateString() : 'August 2026'}
                      </p>
                    </div>
                  </div>

                  {selectedTender.awardNotes && (
                    <div className="p-3.5 rounded-xl bg-[#103D4A] border border-[#1B5968] text-xs">
                      <span className="text-[#A7C9CE] text-[10px] font-bold block mb-1">Administrative Remarks / Committee Rationale</span>
                      <p className="text-[#F0FDFA] italic">{selectedTender.awardNotes}</p>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Submitted Proposals Section */}
              <div className="p-5 rounded-2xl bg-[#103D4A] border border-[#1B5968] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#14D9D5]" /> Submitted Proposals
                    </h3>
                    <p className="text-xs text-[#A7C9CE]">
                      Review candidate submissions, compare financial terms, and select the preferred bidder.
                    </p>
                  </div>

                  {/* Officer Action 2: "Escalate to Admin" Top Button */}
                  {isOfficer && selectedTender.status !== 'Awarded' && (
                    <button
                      onClick={() => openEscalateModal(null)}
                      disabled={
                        actionInProgress ||
                        selectedTender.status === 'PENDING_ADMIN_APPROVAL' ||
                        selectedTender.status === 'Pending Admin Review' ||
                        selectedTender.status === 'PENDING_ADMIN_REVIEW' ||
                        selectedTender.escalatedToAdmin
                      }
                      className={`px-4 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                        selectedTender.status === 'PENDING_ADMIN_APPROVAL' ||
                        selectedTender.status === 'Pending Admin Review' ||
                        selectedTender.status === 'PENDING_ADMIN_REVIEW' ||
                        selectedTender.escalatedToAdmin
                          ? 'bg-[#103D4A] text-[#6F9BA3] border border-[#1B5968] cursor-not-allowed'
                          : selectedBid
                          ? 'bg-[#FFB020] hover:bg-[#FFB020]/90 text-[#071F2A]'
                          : 'bg-[#FFB020]/40 text-[#071F2A] hover:bg-[#FFB020]/60'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      {selectedTender.status === 'PENDING_ADMIN_APPROVAL' ||
                      selectedTender.status === 'Pending Admin Review' ||
                      selectedTender.status === 'PENDING_ADMIN_REVIEW' ||
                      selectedTender.escalatedToAdmin
                        ? 'Escalated to Admin'
                        : 'Escalate to Admin'}
                    </button>
                  )}
                </div>

                {currentTenderBids.length === 0 ? (
                  <div className="py-12 text-center text-[#A7C9CE] space-y-2">
                    <Building2 className="w-10 h-10 mx-auto text-[#6F9BA3]" />
                    <p className="text-xs">No submitted proposals available.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentTenderBids.map(b => {
                      if (!b) return null;
                      const isThisSelected = selectedBid?.id === b.id;
                      const isAwarded = b.status === 'Awarded';
                      const isPendingAdmin = b.status === 'PENDING_ADMIN_APPROVAL' || (isThisSelected && (selectedTender.status === 'PENDING_ADMIN_APPROVAL' || selectedTender.status === 'Pending Admin Review' || selectedTender.status === 'PENDING_ADMIN_REVIEW' || selectedTender.escalatedToAdmin));

                      return (
                        <div
                          key={b.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isAwarded
                              ? 'bg-[#0B3442] border-[#20C997] shadow-lg ring-1 ring-[#20C997]/50'
                              : isThisSelected
                              ? 'bg-[#0B3442] border-[#14D9D5] shadow-lg ring-2 ring-[#14D9D5]/40'
                              : 'bg-[#0B3442]/70 border-[#1B5968] hover:border-[#14D9D5]/40'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Left: Bidder Profile & IDs */}
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-extrabold text-base text-white">
                                  {b.vendorName || b.bidderName || 'Registered Enterprise'}
                                </span>

                                {isAwarded ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#20C997]/20 text-[#20C997] border border-[#20C997]/30 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Awarded
                                  </span>
                                ) : isPendingAdmin ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFB020]/20 text-[#FFB020] border border-[#FFB020]/30 flex items-center gap-1 animate-pulse">
                                    <Clock className="w-3 h-3" /> Pending Admin Approval
                                  </span>
                                ) : isThisSelected ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#14D9D5]/20 text-[#14D9D5] border border-[#14D9D5]/40 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Selected Bidder
                                  </span>
                                ) : null}
                              </div>

                              <div className="flex items-center gap-3 text-[11px] text-[#A7C9CE] flex-wrap">
                                <span>Bid ID: <strong className="font-mono text-white">{b.id}</strong></span>
                                <span>•</span>
                                <span>Vendor ID: <strong className="font-mono text-white">{b.vendorId || b.bidderId || 'VND-10029'}</strong></span>
                                <span>•</span>
                                <span>Timeline: <strong className="text-white">{b.estimatedCompletionTime || '12 Months'}</strong></span>
                              </div>

                              {/* AI Risk Score Pill */}
                              <div className="pt-1 flex items-center gap-2">
                                <span className="text-[10px] text-[#6F9BA3]">Forensic Analysis:</span>
                                {getRiskBadge(b.aiRiskScore || 15)}
                              </div>
                            </div>

                            {/* Right: Amount & Actions */}
                            <div className="flex md:flex-col items-end justify-between md:justify-center gap-3 shrink-0">
                              <div className="text-right">
                                <span className="text-[10px] text-[#A7C9CE] block">Proposed Bid Amount</span>
                                <span className="text-lg font-black text-[#20C997]">
                                  ₹{(Number(b.proposedAmount || 0)).toLocaleString()}
                                </span>
                              </div>

                              {/* Action Buttons */}
                              {selectedTender.status !== 'Awarded' && isOfficer && (
                                <div className="flex items-center gap-2 pt-2 md:pt-0">
                                  {/* Action 2: Escalate to Admin */}
                                  <button
                                    onClick={() => openEscalateModal(b)}
                                    disabled={
                                      actionInProgress ||
                                      selectedTender.status === 'Pending Admin Review' ||
                                      selectedTender.status === 'PENDING_ADMIN_REVIEW' ||
                                      selectedTender.status === 'PENDING_ADMIN_APPROVAL' ||
                                      selectedTender.escalatedToAdmin
                                    }
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                      selectedTender.status === 'Pending Admin Review' ||
                                      selectedTender.status === 'PENDING_ADMIN_REVIEW' ||
                                      selectedTender.status === 'PENDING_ADMIN_APPROVAL' ||
                                      selectedTender.escalatedToAdmin
                                        ? 'bg-[#103D4A] text-[#6F9BA3] border border-[#1B5968] cursor-not-allowed opacity-60'
                                        : 'bg-[#FFB020]/20 hover:bg-[#FFB020] text-[#FFB020] hover:text-[#071F2A] border border-[#FFB020]/40'
                                    }`}
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    {selectedTender.status === 'Pending Admin Review' ||
                                    selectedTender.status === 'PENDING_ADMIN_REVIEW' ||
                                    selectedTender.status === 'PENDING_ADMIN_APPROVAL' ||
                                    selectedTender.escalatedToAdmin
                                      ? '✓ Escalated to Admin'
                                      : 'Escalate to Admin'}
                                  </button>

                                  {/* Action 1: Select Bidder */}
                                  <button
                                    onClick={() => openSelectBidderModal(b)}
                                    disabled={actionInProgress || isThisSelected}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                      isThisSelected
                                        ? 'bg-[#14D9D5]/20 text-[#14D9D5] border border-[#14D9D5]/40 cursor-default'
                                        : 'bg-[#103D4A] hover:bg-[#14D9D5] hover:text-[#071F2A] text-white border border-[#1B5968]'
                                    }`}
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    {isThisSelected ? '✓ Bidder Selected' : 'Select Bidder'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 rounded-2xl bg-[#103D4A] border border-[#1B5968] text-center text-[#A7C9CE]">
              <Gavel className="w-12 h-12 mx-auto text-[#6F9BA3] mb-3" />
              <h4 className="font-bold text-white text-base">Select a Tender to View Submitted Bids</h4>
              <p className="text-xs mt-1">Choose a tender from the left panel to review proposals and manage contract award actions.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: SELECT BIDDER CONFIRMATION */}
      {isSelectBidderModalOpen && selectedTender && targetBidForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-[#0B3442] border border-[#1B5968] rounded-2xl p-6 shadow-2xl text-[#F0FDFA] space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#1B5968] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#14D9D5]/20 text-[#14D9D5]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Select Bidder</h3>
                  <p className="text-xs text-[#A7C9CE]">Confirm preferred vendor proposal for this tender.</p>
                </div>
              </div>
              <button onClick={() => setIsSelectBidderModalOpen(false)} className="text-[#A7C9CE] hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#A7C9CE]">Are you sure you want to select:</p>
              
              <div className="p-4 rounded-xl bg-[#103D4A] border border-[#14D9D5]/40 space-y-2">
                <div>
                  <span className="text-[10px] text-[#A7C9CE] block">Bidder Name:</span>
                  <span className="font-extrabold text-sm text-white">
                    {targetBidForModal.vendorName || targetBidForModal.bidderName || 'Selected Vendor'}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#1B5968]">
                  <span className="text-[10px] text-[#A7C9CE] block">As the preferred bidder for:</span>
                  <span className="font-bold text-white text-xs">{selectedTender.title}</span>
                  <span className="text-[11px] text-[#A7C9CE] block">{selectedTender.department}</span>
                </div>
                <div className="pt-2 border-t border-[#1B5968] flex justify-between items-center">
                  <span className="text-[#A7C9CE]">Bid Amount:</span>
                  <span className="font-black text-[#20C997] text-base">
                    ₹{(Number(targetBidForModal.proposedAmount || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#071F2A] border border-[#1B5968] flex items-center gap-2 text-xs text-[#14D9D5]">
                <FileCheck2 className="w-4 h-4 shrink-0" />
                <span>This action will notify the selected bidder.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsSelectBidderModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-[#103D4A] hover:bg-[#103D4A]/80 text-[#A7C9CE] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelectBidder}
                disabled={actionInProgress}
                className="px-5 py-2.5 rounded-xl bg-[#14D9D5] hover:bg-[#14D9D5]/90 text-[#071F2A] font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                {actionInProgress ? 'Selecting Bidder...' : 'Confirm Selection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ESCALATE TO ADMIN CONFIRMATION */}
      {isEscalateModalOpen && selectedTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-[#0B3442] border border-[#1B5968] rounded-2xl p-6 shadow-2xl text-[#F0FDFA] space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#1B5968] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FFB020]/20 text-[#FFB020]">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Escalate to Admin</h3>
                  <p className="text-xs text-[#A7C9CE]">Escalate tender to Admin for review.</p>
                </div>
              </div>
              <button onClick={() => setIsEscalateModalOpen(false)} className="text-[#A7C9CE] hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#A7C9CE]">Are you sure you want to escalate this tender to the Admin for review?</p>

              <div className="p-4 rounded-xl bg-[#103D4A] border border-[#FFB020]/40 space-y-2">
                <div>
                  <span className="text-[10px] text-[#A7C9CE] block">Tender ID:</span>
                  <span className="font-mono font-bold text-white text-xs">{selectedTender.id}</span>
                </div>
                <div className="pt-2 border-t border-[#1B5968]">
                  <span className="text-[10px] text-[#A7C9CE] block">Tender:</span>
                  <span className="font-extrabold text-sm text-white">{selectedTender.title}</span>
                  <span className="text-[11px] text-[#A7C9CE] block">{selectedTender.department}</span>
                </div>
                {targetBidForModal && (
                  <div className="pt-2 border-t border-[#1B5968] flex justify-between items-center text-xs">
                    <span className="text-[#A7C9CE]">Associated Proposal:</span>
                    <span className="font-bold text-[#14D9D5]">{targetBidForModal.vendorName || targetBidForModal.bidderName} ({targetBidForModal.id})</span>
                  </div>
                )}
              </div>

              {/* Optional Comment Input */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-[#A7C9CE]">Reason / Remarks for Admin Review (Optional)</label>
                <textarea
                  rows={2}
                  value={escalateComment}
                  onChange={e => setEscalateComment(e.target.value)}
                  placeholder="State the reason or recommendation for Admin governance review..."
                  className="w-full px-3 py-2 rounded-xl bg-[#103D4A] border border-[#1B5968] text-white text-xs placeholder-[#6F9BA3] focus:outline-none focus:border-[#14D9D5]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#071F2A] border border-[#1B5968] flex items-center gap-2 text-xs text-[#FFB020]">
                <Send className="w-4 h-4 shrink-0" />
                <span>The Admin will receive a notification and must review this tender.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsEscalateModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-[#103D4A] hover:bg-[#103D4A]/80 text-[#A7C9CE] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEscalation}
                disabled={actionInProgress}
                className="px-5 py-2.5 rounded-xl bg-[#FFB020] hover:bg-[#FFB020]/90 text-[#071F2A] font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {actionInProgress ? 'Escalating...' : 'Escalate to Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADMIN APPROVE AWARD */}
      {isApproveModalOpen && selectedTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-[#0B3442] border border-[#20C997]/50 rounded-2xl p-6 shadow-2xl text-[#F0FDFA] space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#1B5968] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#20C997]/20 text-[#20C997]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Approve Contract Award</h3>
                  <p className="text-xs text-[#A7C9CE]">Issue final contract award and notify winning bidder.</p>
                </div>
              </div>
              <button onClick={() => setIsApproveModalOpen(false)} className="text-[#A7C9CE] hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#103D4A] border border-[#1B5968] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#A7C9CE]">Tender:</span>
                <span className="font-bold text-white text-right max-w-[280px] truncate">{selectedTender.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7C9CE]">Winning Bidder:</span>
                <span className="font-black text-[#20C997]">{selectedBid?.vendorName || selectedBid?.bidderName || selectedTender.selectedVendorName || 'Selected Vendor'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7C9CE]">Contract Amount:</span>
                <span className="font-black text-[#20C997] text-sm">
                  ₹{(Number(selectedBid?.proposedAmount || selectedTender.selectedBidAmount || 0)).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#A7C9CE]">Contract Sanction Notes / Letter Remarks</label>
              <textarea
                rows={3}
                value={awardNotes}
                onChange={e => setAwardNotes(e.target.value)}
                placeholder="Specify contract sanction reference and formal award rationale..."
                className="w-full px-3 py-2 rounded-xl bg-[#103D4A] border border-[#1B5968] text-white text-xs placeholder-[#6F9BA3] focus:outline-none focus:border-[#20C997]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-[#103D4A] hover:bg-[#103D4A]/80 text-[#A7C9CE] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminApproveAward}
                disabled={actionInProgress}
                className="px-5 py-2.5 rounded-xl bg-[#20C997] hover:bg-[#20C997]/90 text-[#071F2A] font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {actionInProgress ? 'Awarding Contract...' : 'Confirm & Issue Award'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADMIN REJECT AWARD PROPOSAL */}
      {isRejectModalOpen && selectedTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-[#0B3442] border border-[#FF6B7A]/50 rounded-2xl p-6 shadow-2xl text-[#F0FDFA] space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#1B5968] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FF6B7A]/20 text-[#FF6B7A]">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Return Proposal to Officer</h3>
                  <p className="text-xs text-[#A7C9CE]">Reject the nominated bidder and return tender for re-evaluation.</p>
                </div>
              </div>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-[#A7C9CE] hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#A7C9CE]">Reason for Rejection / Return <span className="text-[#FF6B7A]">*</span></label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Explain why the proposal is being returned for officer review..."
                className="w-full px-3 py-2 rounded-xl bg-[#103D4A] border border-[#1B5968] text-white text-xs placeholder-[#6F9BA3] focus:outline-none focus:border-[#FF6B7A]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-[#103D4A] hover:bg-[#103D4A]/80 text-[#A7C9CE] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminRejectAward}
                disabled={actionInProgress}
                className="px-5 py-2.5 rounded-xl bg-[#FF6B7A] hover:bg-[#FF6B7A]/90 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                {actionInProgress ? 'Returning...' : 'Return to Officer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
