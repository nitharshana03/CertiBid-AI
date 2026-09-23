// CertiBid AI - AI Procurement Risk Analyzer Dashboard & Escalated Bid Review Workflow
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
  UserCheck,
  Clock,
  AlertTriangle,
  Gavel,
  FileText,
  ArrowLeft,
  Lock,
  ChevronRight,
  Search,
  Building2,
  User,
  Filter,
  RotateCcw,
  ChevronDown,
  Briefcase,
  Check,
  Layers,
  AlertCircle,
  Download,
  Loader2
} from 'lucide-react';

export function AIRiskDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const bidIdParam = searchParams.get('bid') || 'BID-9013';

  // Selection & search states
  const [selectedBidId, setSelectedBidId] = useState(bidIdParam);
  const [companySearch, setCompanySearch] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [bidderSearch, setBidderSearch] = useState('');
  const [selectedBidderId, setSelectedBidderId] = useState('');

  // Dropdown open states
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isBidderDropdownOpen, setIsBidderDropdownOpen] = useState(false);

  // Data states
  const [vendorsList, setVendorsList] = useState([]);
  const [allBidsList, setAllBidsList] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Active risk & escalation data
  const [riskData, setRiskData] = useState(null);
  const [escalation, setEscalation] = useState(null);
  const [loadingRisk, setLoadingRisk] = useState(true);
  const [downloadingReport, setDownloadingReport] = useState(false);

  const handleDownloadRiskReport = async () => {
    if (!selectedBidId) return;
    setDownloadingReport(true);
    try {
      showToast(`Generating official AI Risk Audit Report PDF (${selectedBidId})...`, 'info');
      await apiService.downloadReport('risk', 'pdf');
      showToast('AI Risk Audit Report PDF downloaded successfully.', 'success');
    } catch (e) {
      console.error('Failed to download risk report:', e);
      showToast(e.message || 'Failed to download risk report.', 'error');
    } finally {
      setDownloadingReport(false);
    }
  };

  // Modals state
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showAdminDecisionModal, setShowAdminDecisionModal] = useState(false);
  const [adminSelectedDecision, setAdminSelectedDecision] = useState(null); // 'ACCEPT' or 'REJECT'
  const [showOfficerFinalModal, setShowOfficerFinalModal] = useState(false);
  const [officerSelectedDecision, setOfficerSelectedDecision] = useState(null); // 'ACCEPT' or 'REJECT'

  // Comment inputs
  const [escalateComment, setEscalateComment] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [officerComment, setOfficerComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const companyDropdownRef = useRef(null);
  const bidderDropdownRef = useRef(null);

  const rawRole = String(user?.role || '').toUpperCase().trim();
  const isAdmin = rawRole === 'ADMIN';
  const isOfficer = rawRole === 'OFFICER';

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
        setIsCompanyDropdownOpen(false);
      }
      if (bidderDropdownRef.current && !bidderDropdownRef.current.contains(event.target)) {
        setIsBidderDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial load of vendors and bids
  useEffect(() => {
    async function initOptions() {
      try {
        const [vRes, bRes] = await Promise.all([
          apiService.getVendors(),
          apiService.getBids()
        ]);
        const vendors = vRes.data || [];
        const bids = bRes.data || [];
        setVendorsList(vendors);
        setAllBidsList(bids);

        // If bidIdParam is present, initialize company & bidder selections
        if (bidIdParam) {
          const matchBid = bids.find(b => b.id === bidIdParam);
          if (matchBid) {
            setSelectedBidId(matchBid.id);
            if (matchBid.vendorId) {
              setSelectedCompanyId(matchBid.vendorId);
              setSelectedBidderId(matchBid.vendorId);
              const matchingVendor = vendors.find(v => v.id === matchBid.vendorId);
              if (matchingVendor) {
                setCompanySearch(matchingVendor.companyName || '');
                setBidderSearch(matchingVendor.contactPerson || matchingVendor.companyName || '');
              } else {
                setCompanySearch(matchBid.vendorName || matchBid.bidderName || '');
                setBidderSearch(matchBid.bidderName || matchBid.vendorName || '');
              }
            }
          }
        }
        setDataLoaded(true);
      } catch (err) {
        console.error('Failed to load initial search options:', err);
        setDataLoaded(true);
      }
    }
    initOptions();
  }, []);

  // Update selectedBidId when URL param changes
  useEffect(() => {
    const urlBid = searchParams.get('bid');
    if (urlBid && urlBid !== selectedBidId) {
      setSelectedBidId(urlBid);
    }
  }, [searchParams]);

  // Load Risk Analysis whenever selectedBidId changes
  useEffect(() => {
    if (selectedBidId) {
      loadRiskForBid(selectedBidId);
    } else {
      setRiskData(null);
      setEscalation(null);
      setLoadingRisk(false);
    }
  }, [selectedBidId]);

  const loadRiskForBid = async (targetBidId) => {
    setLoadingRisk(true);
    try {
      const riskRes = await apiService.getRiskAnalysis(targetBidId);
      setRiskData(riskRes.data || null);

      const escRes = await apiService.getEscalationByBid(targetBidId);
      setEscalation(escRes.data || null);
    } catch (err) {
      console.error('Failed to load risk analysis or escalation data:', err);
      showToast('Failed to load risk analysis for proposal', 'error');
    } finally {
      setLoadingRisk(false);
    }
  };

  // Switch active bid and sync URL
  const handleSelectBid = (newBidId) => {
    setSelectedBidId(newBidId);
    setSearchParams({ bid: newBidId });
    
    // Find bid and sync company/bidder fields if not already matched
    const bidObj = allBidsList.find(b => b.id === newBidId);
    if (bidObj) {
      const v = vendorsList.find(v => v.id === bidObj.vendorId || v.companyName?.toLowerCase() === bidObj.vendorName?.toLowerCase());
      if (v) {
        setSelectedCompanyId(v.id);
        setSelectedBidderId(v.id);
        setCompanySearch(v.companyName || '');
        setBidderSearch(v.contactPerson || v.companyName || '');
      }
    }
  };

  // Company selection handler
  const handleSelectCompany = (vendor) => {
    setSelectedCompanyId(vendor.id);
    setCompanySearch(vendor.companyName);
    setIsCompanyDropdownOpen(false);

    // Auto-align bidder
    setSelectedBidderId(vendor.id);
    setBidderSearch(vendor.contactPerson ? `${vendor.contactPerson} (${vendor.companyName})` : vendor.companyName);

    // Filter bids for this company and select the first bid if available
    const compBids = allBidsList.filter(
      b => b.vendorId === vendor.id || b.vendorName?.toLowerCase() === vendor.companyName?.toLowerCase()
    );
    if (compBids.length > 0) {
      handleSelectBid(compBids[0].id);
    } else {
      setSelectedBidId('');
      setSearchParams({});
    }
  };

  // Bidder selection handler
  const handleSelectBidder = (vendorOrBid) => {
    const vId = vendorOrBid.vendorId || vendorOrBid.id;
    const vName = vendorOrBid.companyName || vendorOrBid.vendorName || vendorOrBid.bidderName;
    const contact = vendorOrBid.contactPerson;

    setSelectedBidderId(vId);
    setBidderSearch(contact ? `${contact} (${vName})` : vName);
    setIsBidderDropdownOpen(false);

    if (vId) {
      setSelectedCompanyId(vId);
      const matchingVendor = vendorsList.find(v => v.id === vId);
      if (matchingVendor) {
        setCompanySearch(matchingVendor.companyName);
      } else {
        setCompanySearch(vName);
      }
    }

    // Filter bids for this bidder and select the first one
    const bidderBids = allBidsList.filter(
      b => b.vendorId === vId || b.vendorName?.toLowerCase() === vName?.toLowerCase()
    );
    if (bidderBids.length > 0) {
      handleSelectBid(bidderBids[0].id);
    } else {
      setSelectedBidId('');
      setSearchParams({});
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setCompanySearch('');
    setSelectedCompanyId('');
    setBidderSearch('');
    setSelectedBidderId('');
    if (allBidsList.length > 0) {
      handleSelectBid(allBidsList[0].id);
    } else {
      handleSelectBid('BID-9013');
    }
  };

  // Filtered Company suggestions
  const filteredCompanies = useMemo(() => {
    if (!companySearch.trim()) return vendorsList;
    const q = companySearch.toLowerCase().trim();
    return vendorsList.filter(
      v =>
        v.companyName?.toLowerCase().includes(q) ||
        v.id?.toLowerCase().includes(q) ||
        v.category?.toLowerCase().includes(q) ||
        v.registrationNumber?.toLowerCase().includes(q)
    );
  }, [vendorsList, companySearch]);

  // Filtered Bidder suggestions
  const filteredBidders = useMemo(() => {
    let baseList = vendorsList;
    if (selectedCompanyId) {
      baseList = vendorsList.filter(v => v.id === selectedCompanyId);
    }
    if (!bidderSearch.trim()) return baseList;
    const q = bidderSearch.toLowerCase().trim();
    return baseList.filter(
      v =>
        v.contactPerson?.toLowerCase().includes(q) ||
        v.companyName?.toLowerCase().includes(q) ||
        v.id?.toLowerCase().includes(q) ||
        v.email?.toLowerCase().includes(q)
    );
  }, [vendorsList, selectedCompanyId, bidderSearch]);

  // Available bids based on company / bidder selection
  const availableBids = useMemo(() => {
    let list = allBidsList;
    if (selectedCompanyId || selectedBidderId) {
      const targetId = selectedCompanyId || selectedBidderId;
      const targetVendor = vendorsList.find(v => v.id === targetId);
      const targetName = targetVendor?.companyName?.toLowerCase();

      list = allBidsList.filter(
        b => b.vendorId === targetId || (targetName && b.vendorName?.toLowerCase() === targetName)
      );
    }
    return list;
  }, [allBidsList, selectedCompanyId, selectedBidderId, vendorsList]);

  // 1. OFFICER ESCALATES BID TO ADMIN
  const handleConfirmEscalate = async () => {
    if (!selectedBidId) return;
    setSubmitting(true);
    try {
      const res = await apiService.escalateBid({
        bidId: selectedBidId,
        tenderId: riskData?.tenderId,
        vendorId: riskData?.vendorId,
        comment: escalateComment
      });
      setEscalation(res.data);
      setShowEscalateModal(false);
      showToast(`Bid ${selectedBidId} successfully escalated to Admin for review.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to escalate bid', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. ADMIN SUBMITS REVIEW DECISION (ACCEPT or REJECT)
  const handleOpenAdminModal = (decision) => {
    setAdminSelectedDecision(decision);
    setShowAdminDecisionModal(true);
  };

  const handleConfirmAdminDecision = async () => {
    if (!escalation) return;
    setSubmitting(true);
    try {
      const res = await apiService.submitAdminDecision(escalation.id, {
        decision: adminSelectedDecision,
        comment: adminComment
      });
      setEscalation(res.data);
      setShowAdminDecisionModal(false);
      showToast(
        `Admin decision recorded as ${adminSelectedDecision}. Bid returned to Procurement Officer for final decision.`,
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Failed to record Admin decision', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. OFFICER SUBMITS FINAL PROCUREMENT DECISION (ACCEPT or REJECT)
  const handleOpenOfficerModal = (decision) => {
    setOfficerSelectedDecision(decision);
    setShowOfficerFinalModal(true);
  };

  const handleConfirmOfficerFinalDecision = async () => {
    if (!escalation) return;
    setSubmitting(true);
    try {
      const res = await apiService.submitFinalDecision(escalation.id, {
        decision: officerSelectedDecision,
        comment: officerComment
      });
      setEscalation(res.data);
      setShowOfficerFinalModal(false);
      showToast(
        `Final procurement decision recorded as ${officerSelectedDecision}. Bid status updated in database.`,
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Failed to record final procurement decision', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const currentStatus = escalation?.status || 'NORMAL';
  const overallRiskScore = riskData?.overallRiskScore ?? 20;
  const riskIndicators = riskData?.riskIndicators || {};
  const explainableAI = riskData?.explainableAI || { keyFactors: [], recommendations: [] };
  const vendorName = riskData?.vendorName || (selectedCompanyId ? vendorsList.find(v => v.id === selectedCompanyId)?.companyName : 'Registered Bidder');
  const tenderTitle = riskData?.tenderTitle || 'Public Infrastructure Procurement';
  const confidenceScore = riskData?.confidenceScore ?? 96.5;
  const aiGenerated = riskData?.aiGenerated === true;
  const aiModel = riskData?.aiModel || 'gemini-2.5-flash';
  const analysisSummary = riskData?.analysisSummary || '';
  const proposedAmount = riskData?.proposedAmount;

  return (
    <div className="space-y-6 text-[#F0FDFA]">
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#A7C9CE] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {escalation && (
          <button
            onClick={() => navigate('/dashboard/escalated-bids')}
            className="px-3.5 py-1.5 rounded-xl bg-[#103D4A] hover:bg-[#103D4A]/80 border border-[#1B5968] text-xs font-bold text-[#14D9D5] flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Gavel className="w-4 h-4" /> View Escalated Bids Queue
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SEARCH / FILTER SECTION (Company + Bidder + Bid/Tender Selector)           */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-2xl border bg-[#0B3442] border-[#1B5968] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1B5968]/70 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#06B6B4]" />
            <h3 className="text-sm font-extrabold text-white">
              AI Risk Evaluation Query & Bid Filter
            </h3>
          </div>
          {(selectedCompanyId || selectedBidderId || companySearch || bidderSearch) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14D9D5] hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
            </button>
          )}
        </div>

        {/* Search Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {/* 1. COMPANY / ORGANISATION SEARCH */}
          <div className="relative" ref={companyDropdownRef}>
            <label className="block text-xs font-bold text-[#A7C9CE] mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#06B6B4]" /> Search Company / Organisation
            </label>
            <div className="relative">
              <input
                type="text"
                value={companySearch}
                onFocus={() => setIsCompanyDropdownOpen(true)}
                onChange={(e) => {
                  setCompanySearch(e.target.value);
                  setIsCompanyDropdownOpen(true);
                  if (!e.target.value) {
                    setSelectedCompanyId('');
                  }
                }}
                placeholder="Search company or organisation..."
                className="w-full bg-[#103D4A] border border-[#1B5968] rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder-[#A7C9CE]/50 focus:outline-hidden focus:border-[#06B6B4] transition-all"
              />
              <Search className="w-4 h-4 text-[#A7C9CE] absolute left-3 top-3 pointer-events-none" />
              {companySearch && (
                <button
                  type="button"
                  onClick={() => {
                    setCompanySearch('');
                    setSelectedCompanyId('');
                  }}
                  className="absolute right-3 top-2.5 text-[#A7C9CE] hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Company Dropdown Suggestions */}
            {isCompanyDropdownOpen && (
              <div className="absolute z-40 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl bg-[#0B3442] border border-[#1B5968] shadow-2xl p-1.5 divide-y divide-[#1B5968]/50">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((vendor) => (
                    <div
                      key={vendor.id}
                      onClick={() => handleSelectCompany(vendor)}
                      className={`p-2.5 rounded-lg hover:bg-[#103D4A] cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                        selectedCompanyId === vendor.id ? 'bg-[#103D4A] border border-[#06B6B4]/50' : ''
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          {vendor.companyName}
                          {selectedCompanyId === vendor.id && (
                            <Check className="w-3.5 h-3.5 text-[#20C997]" />
                          )}
                        </p>
                        <p className="text-[10px] text-[#A7C9CE]">
                          ID: <span className="text-[#14D9D5] font-semibold">{vendor.id}</span> • {vendor.category || 'Vendor'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                          vendor.riskScore > 60
                            ? 'bg-[#FF6B7A]/20 text-[#FF6B7A]'
                            : 'bg-[#20C997]/20 text-[#20C997]'
                        }`}
                      >
                        Risk: {vendor.riskScore || vendor.riskLevel || 'Low'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-[#A7C9CE] italic">
                    No matching companies found for "{companySearch}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. BIDDER SEARCH */}
          <div className="relative" ref={bidderDropdownRef}>
            <label className="block text-xs font-bold text-[#A7C9CE] mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#06B6B4]" /> Search Bidder
            </label>
            <div className="relative">
              <input
                type="text"
                value={bidderSearch}
                onFocus={() => setIsBidderDropdownOpen(true)}
                onChange={(e) => {
                  setBidderSearch(e.target.value);
                  setIsBidderDropdownOpen(true);
                  if (!e.target.value) {
                    setSelectedBidderId('');
                  }
                }}
                placeholder="Search bidder name or ID..."
                className="w-full bg-[#103D4A] border border-[#1B5968] rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder-[#A7C9CE]/50 focus:outline-hidden focus:border-[#06B6B4] transition-all"
              />
              <Search className="w-4 h-4 text-[#A7C9CE] absolute left-3 top-3 pointer-events-none" />
              {bidderSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setBidderSearch('');
                    setSelectedBidderId('');
                  }}
                  className="absolute right-3 top-2.5 text-[#A7C9CE] hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Bidder Dropdown Suggestions */}
            {isBidderDropdownOpen && (
              <div className="absolute z-40 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl bg-[#0B3442] border border-[#1B5968] shadow-2xl p-1.5 divide-y divide-[#1B5968]/50">
                {filteredBidders.length > 0 ? (
                  filteredBidders.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => handleSelectBidder(b)}
                      className={`p-2.5 rounded-lg hover:bg-[#103D4A] cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                        selectedBidderId === b.id ? 'bg-[#103D4A] border border-[#06B6B4]/50' : ''
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          {b.contactPerson || b.companyName}
                          {selectedBidderId === b.id && (
                            <Check className="w-3.5 h-3.5 text-[#20C997]" />
                          )}
                        </p>
                        <p className="text-[10px] text-[#A7C9CE]">
                          {b.companyName} • {b.email || b.id}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1B5968] text-[#14D9D5] shrink-0">
                        {b.id}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-[#A7C9CE] italic">
                    No matching bidders found for "{bidderSearch}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. SELECT BID / TENDER PROPOSAL */}
          <div>
            <label className="block text-xs font-bold text-[#A7C9CE] mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#06B6B4]" /> Select Bid / Tender
            </label>
            <div className="relative">
              <select
                value={selectedBidId || ''}
                onChange={(e) => handleSelectBid(e.target.value)}
                disabled={availableBids.length === 0}
                className="w-full bg-[#103D4A] border border-[#1B5968] rounded-xl px-3.5 py-2.5 text-xs font-medium text-white focus:outline-hidden focus:border-[#06B6B4] appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {availableBids.length > 0 ? (
                  availableBids.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#0B3442] text-white py-1">
                      {b.id} — {b.tenderTitle ? (b.tenderTitle.length > 32 ? b.tenderTitle.substring(0, 32) + '...' : b.tenderTitle) : 'Tender'} (₹{(b.proposedAmount || 0).toLocaleString()})
                    </option>
                  ))
                ) : (
                  <option value="" className="bg-[#0B3442] text-[#A7C9CE]">
                    No submitted proposals found
                  </option>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-[#A7C9CE] absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Selected Context Summary Strip */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#A7C9CE]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-white">Active Proposal:</span>
            {selectedBidId ? (
              <span className="px-2.5 py-0.5 rounded-full bg-[#06B6B4]/20 text-[#14D9D5] border border-[#06B6B4]/40 font-black">
                {selectedBidId}
              </span>
            ) : (
              <span className="text-[#FF6B7A] italic">No proposal selected</span>
            )}
            {vendorName && (
              <span className="text-[#F0FDFA] font-medium">• {vendorName}</span>
            )}
          </div>

          <div className="text-[10px] text-[#A7C9CE]">
            Showing <span className="text-white font-bold">{availableBids.length}</span> matching proposal{availableBids.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RISK ANALYSIS RESULTS VIEW                                                */}
      {/* ========================================================================= */}

      {loadingRisk ? (
        <div className="p-16 text-center text-xs text-[#A7C9CE] flex flex-col items-center justify-center gap-3 bg-[#0B3442] border border-[#1B5968] rounded-2xl shadow-xl">
          <Sparkles className="w-9 h-9 text-[#06B6B4] animate-pulse" />
          <span className="font-bold text-white text-sm">Running AI Neural Risk Analysis Engine...</span>
          <span className="text-[11px] text-[#A7C9CE]">Evaluating price anomalies, collusion graph networks, and vendor compliance records</span>
        </div>
      ) : !riskData ? (
        <div className="p-12 text-center bg-[#0B3442] border border-[#1B5968] rounded-2xl space-y-3 shadow-xl">
          <AlertCircle className="w-10 h-10 text-[#F4C95D] mx-auto" />
          <h4 className="text-base font-extrabold text-white">No Proposal Selected or Data Not Available</h4>
          <p className="text-xs text-[#A7C9CE] max-w-md mx-auto">
            Please search for a company, select a bidder, or choose a submitted proposal from the filter section above to display the real-time AI Risk Analysis.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-white text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            Reset Filters & View Default Risk Analysis
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl bg-[#0B3442] border-[#1B5968] text-white">
            <div>
              <div className="flex items-center gap-2 text-[#FF6B7A] text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldAlert className="w-4 h-4 text-[#FF6B7A]" /> CertiBid Explainable AI Forensics & Risk Evaluation
              </div>
              <h2 className="text-2xl font-extrabold text-white">{vendorName}</h2>
              <p className="text-xs mt-1 text-[#A7C9CE]">
                Proposal Bid ID: <span className="text-[#14D9D5] font-bold">{selectedBidId}</span> • Tender: {tenderTitle}
                {proposedAmount && ` • Quoted: ₹${Number(proposedAmount).toLocaleString()}`}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <button
                onClick={handleDownloadRiskReport}
                disabled={downloadingReport}
                className="px-4 py-2.5 bg-[#103D4A] hover:bg-[#145364] border border-[#1B5968] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                title="Download AI Risk Assessment Audit Report (PDF)"
              >
                {downloadingReport ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#14D9D5]" />
                ) : (
                  <Download className="w-4 h-4 text-[#14D9D5]" />
                )}
                <span>{downloadingReport ? 'Downloading...' : 'Export PDF'}</span>
              </button>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A7C9CE]">AI Model</span>
                <p className="text-sm font-black text-[#14D9D5]">{aiModel}</p>
                <p className={`text-[10px] font-bold ${aiGenerated ? 'text-[#20C997]' : 'text-[#F4C95D]'}`}>
                  {aiGenerated ? 'LIVE GEMINI ANALYSIS' : 'FALLBACK ANALYSIS'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A7C9CE]">AI Confidence</span>
                <p className="text-lg font-black text-[#20C997]">{confidenceScore}%</p>
              </div>
              <div className={`p-4 rounded-2xl border text-center ${
                overallRiskScore > 70 ? 'bg-[#FF6B7A]/10 border-[#FF6B7A]/30 text-[#FF6B7A]' : 'bg-[#20C997]/10 border-[#20C997]/30 text-[#20C997]'
              }`}>
                <span className="text-[10px] uppercase font-bold tracking-wider">Overall Risk Score</span>
                <p className="text-3xl font-black">{overallRiskScore} / 100</p>
              </div>
            </div>
          </div>

          {/* Workflow Status Banner if Escalated */}
          {escalation && (
            <div className="p-4 rounded-2xl bg-[#103D4A] border border-[#1B5968] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#0B3442] border border-[#1B5968]">
                  <Gavel className="w-5 h-5 text-[#14D9D5]" />
                </div>
                <div>
                  <p className="font-extrabold text-white text-sm">Escalation Governance Tracker</p>
                  <p className="text-[11px] text-[#A7C9CE]">
                    Escalated by <span className="text-white font-bold">{escalation.escalatedByOfficerName || 'Officer'}</span> on {escalation.escalatedAt ? new Date(escalation.escalatedAt).toLocaleDateString() : 'Recent'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#A7C9CE] font-bold text-[11px]">Workflow Phase:</span>
                {currentStatus === 'ESCALATED_TO_ADMIN' && (
                  <span className="px-3 py-1 rounded-full bg-[#F4C95D]/20 text-[#F4C95D] border border-[#F4C95D]/40 font-extrabold text-xs inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Pending Admin Review
                  </span>
                )}
                {currentStatus === 'ADMIN_ACCEPTED_PENDING_OFFICER' && (
                  <span className="px-3 py-1 rounded-full bg-[#06B6B4]/20 text-[#14D9D5] border border-[#06B6B4]/40 font-extrabold text-xs inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#20C997]" /> Admin Accepted • Pending Officer Final Decision
                  </span>
                )}
                {currentStatus === 'ADMIN_REJECTED_PENDING_OFFICER' && (
                  <span className="px-3 py-1 rounded-full bg-[#FF6B7A]/20 text-[#FF6B7A] border border-[#FF6B7A]/40 font-extrabold text-xs inline-flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Admin Rejected • Pending Officer Final Decision
                  </span>
                )}
                {currentStatus === 'FINAL_ACCEPTED' && (
                  <span className="px-3 py-1 rounded-full bg-[#20C997]/20 text-[#20C997] border border-[#20C997]/40 font-black text-xs inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Final Status: ACCEPTED
                  </span>
                )}
                {currentStatus === 'FINAL_REJECTED' && (
                  <span className="px-3 py-1 rounded-full bg-[#FF6B7A]/20 text-[#FF6B7A] border border-[#FF6B7A]/40 font-black text-xs inline-flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Final Status: REJECTED
                  </span>
                )}
              </div>
            </div>
          )}

          {/* AI Risk Indicators Breakdown Grid */}
          {analysisSummary && (
            <div className="mb-4 p-4 rounded-2xl border bg-[#103D4A] border-[#1B5968] shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#14D9D5]" />
                <span className="text-xs font-bold text-white">Gemini AI Assessment Summary</span>
              </div>
              <p className="text-xs leading-relaxed text-[#A7C9CE]">{analysisSummary}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(riskIndicators).map(([key, item]) => (
              <div key={key} className="p-4 rounded-2xl border space-y-2 bg-[#103D4A] border-[#1B5968] shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold capitalize text-[#A7C9CE]">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded ${
                      (item.score || 0) > 70
                        ? 'bg-[#FF6B7A]/10 text-[#FF6B7A] border border-[#FF6B7A]/20'
                        : 'bg-[#20C997]/10 text-[#20C997] border border-[#20C997]/20'
                    }`}
                  >
                    {item.score || 0}/100
                  </span>
                </div>
                <p className="text-xs font-extrabold text-white">{item.status || 'Evaluated'}</p>
                <p className="text-[10px] leading-snug text-[#A7C9CE]">{item.details || 'Verified by model.'}</p>
              </div>
            ))}
          </div>

          {/* Explainable AI Deep Dive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Factor Triggers */}
            <div className="p-6 rounded-2xl border space-y-4 bg-[#103D4A] border-[#1B5968] shadow-md">
              <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                <Sparkles className="w-4 h-4 text-[#14D9D5]" /> Explainable AI (XAI) Key Decision Factors
              </h3>
              <div className="space-y-2.5">
                {(explainableAI.keyFactors || []).map((factor, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border text-xs flex items-start gap-3 bg-[#0B3442] border-[#1B5968] text-[#F0FDFA]">
                    <span className="w-5 h-5 rounded-full bg-[#06B6B4] text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed font-medium">{factor}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="p-6 rounded-2xl border space-y-4 bg-[#103D4A] border-[#1B5968] text-white shadow-md">
              <h3 className="text-sm font-bold flex items-center gap-2 text-[#22C7D6]">
                <ShieldCheck className="w-4 h-4 text-[#22C7D6]" /> AI System Recommendations
              </h3>
              <div className="space-y-2 text-xs">
                {(explainableAI.recommendations || []).map((rec, idx) => (
                  <div key={idx} className="p-3 rounded-xl border flex items-center gap-2 bg-[#0B3442] border-[#1B5968] text-[#F0FDFA]">
                    <CheckCircle2 className="w-4 h-4 text-[#20C997] shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* WORKFLOW DECISION CONTROL PANELS                                          */}
          {/* ========================================================================= */}

          {/* CASE 1: UN-ESCALATED BID -> OFFICER CAN ESCALATE */}
          {!escalation && isOfficer && (
            <div className="p-6 rounded-2xl bg-[#0B3442] border border-[#1B5968] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#06B6B4]" /> Procurement Officer Action Desk
                </h4>
                <p className="text-xs text-[#A7C9CE] mt-0.5">
                  If this bid requires senior governance review or exhibits elevated risk, escalate it to the System Administrator.
                </p>
              </div>
              <button
                onClick={() => setShowEscalateModal(true)}
                className="px-6 py-3 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-white font-extrabold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer shrink-0"
              >
                <UserCheck className="w-4 h-4" />
                <span>Escalate Bid to Admin</span>
              </button>
            </div>
          )}

          {/* CASE 2: STEP 2 - ADMIN REVIEW (PERFORMED BY ADMIN) */}
          {escalation && currentStatus === 'ESCALATED_TO_ADMIN' && (
            <div className="p-6 rounded-2xl bg-[#0B3442] border-2 border-[#F4C95D]/40 space-y-4 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#F4C95D] text-xs font-bold uppercase tracking-wider mb-1">
                    <Gavel className="w-4 h-4" /> Escalated Bid - Step 2: Admin Governance Review
                  </div>
                  <h4 className="text-lg font-extrabold text-white">Admin Review & Governance Recommendation</h4>
                  <p className="text-xs text-[#A7C9CE] mt-1">
                    Escalated by <span className="text-white font-bold">{escalation.escalatedByOfficerName || 'Procurement Officer'}</span>: "{escalation.officerComment || 'Governance review requested.'}"
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#F4C95D]/20 text-[#F4C95D] border border-[#F4C95D]/40 font-extrabold text-xs shrink-0">
                  Awaiting Admin Action
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#103D4A] border border-[#1B5968] text-[11px] text-[#A7C9CE]">
                <p className="font-semibold text-white mb-0.5">Important Governance Note:</p>
                <p>
                  As System Administrator, your decision (ACCEPT or REJECT) provides an administrative risk review. The Procurement Officer will receive your decision and make the final, binding procurement award decision.
                </p>
              </div>

              {isAdmin ? (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                  <button
                    onClick={() => handleOpenAdminModal('REJECT')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FF6B7A] hover:bg-[#FF6B7A]/80 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>ADMIN REJECT (Governance Risk Flag)</span>
                  </button>
                  <button
                    onClick={() => handleOpenAdminModal('ACCEPT')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#20C997] hover:bg-[#20C997]/80 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ADMIN ACCEPT (Governance Clearance)</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#103D4A] text-center text-xs text-[#A7C9CE] italic">
                  Currently awaiting System Administrator review. Once Admin submits a decision, the Procurement Officer will issue the final decision.
                </div>
              )}
            </div>
          )}

          {/* CASE 3: STEP 3 - OFFICER FINAL DECISION (PERFORMED BY OFFICER) */}
          {escalation && (currentStatus === 'ADMIN_ACCEPTED_PENDING_OFFICER' || currentStatus === 'ADMIN_REJECTED_PENDING_OFFICER') && (
            <div className="space-y-4">
              {/* Admin Decision Outcome Box */}
              <div className="p-5 rounded-2xl bg-[#103D4A] border border-[#1B5968] space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-[#14D9D5]" /> Step 2 Outcome: Admin Governance Review Decision
                  </div>
                  <span className={`px-3 py-1 rounded-full font-black text-xs uppercase ${
                    escalation.adminDecision === 'ACCEPTED'
                      ? 'bg-[#20C997]/20 text-[#20C997] border border-[#20C997]/40'
                      : 'bg-[#FF6B7A]/20 text-[#FF6B7A] border border-[#FF6B7A]/40'
                  }`}>
                    Admin Recommendation: {escalation.adminDecision}
                  </span>
                </div>
                <p className="text-xs text-[#A7C9CE]">
                  Reviewed by Admin <span className="text-white font-bold">{escalation.adminName || 'System Administrator'}</span> on {escalation.adminDecisionAt ? new Date(escalation.adminDecisionAt).toLocaleString() : 'Recent'}
                </p>
                {escalation.adminComment && (
                  <div className="p-3 rounded-xl bg-[#0B3442] border border-[#1B5968] text-xs text-[#F0FDFA] mt-2 italic">
                    "{escalation.adminComment}"
                  </div>
                )}
              </div>

              {/* Officer Final Decision Control Card */}
              <div className="p-6 rounded-2xl bg-[#0B3442] border-2 border-[#06B6B4] space-y-4 shadow-xl">
                <div>
                  <div className="flex items-center gap-2 text-[#14D9D5] text-xs font-bold uppercase tracking-wider mb-1">
                    <Gavel className="w-4 h-4" /> Escalated Bid - Step 3: Officer Final Procurement Decision
                  </div>
                  <h4 className="text-lg font-extrabold text-white">Final Contract Award Authority Desk</h4>
                  <p className="text-xs text-[#A7C9CE] mt-1">
                    Review the Admin's governance recommendation above and issue the binding final procurement decision for this proposal.
                  </p>
                </div>

                {isOfficer ? (
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                    <button
                      onClick={() => handleOpenOfficerModal('REJECT')}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FF6B7A] hover:bg-[#FF6B7A]/80 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>FINAL REJECT (Contract Rejection)</span>
                    </button>
                    <button
                      onClick={() => handleOpenOfficerModal('ACCEPT')}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#20C997] hover:bg-[#20C997]/80 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>FINAL ACCEPT (Contract Award Approval)</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#103D4A] text-center text-xs text-[#A7C9CE] italic">
                    Admin review complete. Currently awaiting Procurement Officer final decision.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CASE 4: FINALIZED AUDIT TRAIL */}
          {escalation && (currentStatus === 'FINAL_ACCEPTED' || currentStatus === 'FINAL_REJECTED') && (
            <div className="p-6 rounded-2xl bg-[#0B3442] border border-[#1B5968] space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1B5968] pb-3">
                <div>
                  <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#20C997]" /> Completed Escalation Audit Trail & Final Decision
                  </h4>
                  <p className="text-xs text-[#A7C9CE] mt-0.5">
                    This escalated bid review has been finalized and recorded in the immutable database audit ledger.
                  </p>
                </div>
                <span className={`px-4 py-1.5 rounded-full font-black text-xs uppercase ${
                  escalation.finalDecision === 'ACCEPTED'
                    ? 'bg-[#20C997]/20 text-[#20C997] border border-[#20C997]/40'
                    : 'bg-[#FF6B7A]/20 text-[#FF6B7A] border border-[#FF6B7A]/40'
                }`}>
                  FINAL STATUS: {escalation.finalDecision}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Step 1 Officer Escalation */}
                <div className="p-4 rounded-xl bg-[#103D4A] border border-[#1B5968] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#A7C9CE]">Step 1 • Officer Escalation</span>
                  <p className="font-extrabold text-white">{escalation.escalatedByOfficerName}</p>
                  <p className="text-[10px] text-[#A7C9CE]">{escalation.escalatedAt ? new Date(escalation.escalatedAt).toLocaleString() : 'Recent'}</p>
                  <p className="text-[11px] text-[#F0FDFA] italic">"{escalation.officerComment || 'Escalated for governance review.'}"</p>
                </div>

                {/* Step 2 Admin Review */}
                <div className="p-4 rounded-xl bg-[#103D4A] border border-[#1B5968] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#A7C9CE]">Step 2 • Admin Review Recommendation</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white">{escalation.adminName || 'System Administrator'}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      escalation.adminDecision === 'ACCEPTED' ? 'bg-[#20C997]/20 text-[#20C997]' : 'bg-[#FF6B7A]/20 text-[#FF6B7A]'
                    }`}>
                      {escalation.adminDecision}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A7C9CE]">{escalation.adminDecisionAt ? new Date(escalation.adminDecisionAt).toLocaleString() : 'Recent'}</p>
                  <p className="text-[11px] text-[#F0FDFA] italic">"{escalation.adminComment || 'Governance review completed.'}"</p>
                </div>

                {/* Step 3 Officer Final Decision */}
                <div className="p-4 rounded-xl bg-[#103D4A] border border-[#1B5968] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#A7C9CE]">Step 3 • Officer Final Decision</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white">{escalation.finalDecisionByOfficerName || escalation.escalatedByOfficerName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      escalation.finalDecision === 'ACCEPTED' ? 'bg-[#20C997]/20 text-[#20C997]' : 'bg-[#FF6B7A]/20 text-[#FF6B7A]'
                    }`}>
                      FINAL {escalation.finalDecision}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A7C9CE]">{escalation.finalDecisionAt ? new Date(escalation.finalDecisionAt).toLocaleString() : 'Recent'}</p>
                  <p className="text-[11px] text-[#F0FDFA] italic">"{escalation.finalComment || 'Final procurement decision recorded.'}"</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}

      {/* 1. ESCALATION MODAL */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0B3442] border border-[#1B5968] rounded-2xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-[#FF6B7A]">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-lg font-extrabold">Escalate Bid to System Administrator</h3>
            </div>
            <p className="text-xs text-[#A7C9CE]">
              You are escalating proposal <span className="font-bold text-white">{selectedBidId}</span> from bidder <span className="font-bold text-white">{vendorName}</span> to the System Administrator for governance risk evaluation.
            </p>
            <div>
              <label className="block text-xs font-bold text-[#A7C9CE] mb-1">
                Escalation Rationale / Officer Remarks
              </label>
              <textarea
                value={escalateComment}
                onChange={(e) => setEscalateComment(e.target.value)}
                placeholder="Specify the risk concerns or reasons for requesting Admin governance review..."
                rows={3}
                className="w-full bg-[#103D4A] border border-[#1B5968] rounded-xl p-3 text-xs text-white placeholder-[#A7C9CE]/50 focus:outline-hidden focus:border-[#06B6B4]"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowEscalateModal(false)}
                className="px-4 py-2 rounded-xl bg-[#103D4A] hover:bg-[#103D4A]/80 text-xs font-bold text-[#A7C9CE] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEscalate}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-xs font-bold text-white shadow-md cursor-pointer"
              >
                {submitting ? 'Escalating...' : 'Confirm Escalation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADMIN REVIEW DECISION MODAL */}
      {showAdminDecisionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0B3442] border border-[#1B5968] rounded-2xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              {adminSelectedDecision === 'ACCEPT' ? (
                <CheckCircle2 className="w-6 h-6 text-[#20C997]" />
              ) : (
                <XCircle className="w-6 h-6 text-[#FF6B7A]" />
              )}
              <h3 className="text-lg font-extrabold">
                Confirm Admin Governance Review: {adminSelectedDecision}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-[#103D4A] border border-[#1B5968] text-xs text-[#A7C9CE] space-y-1">
              <p><span className="font-bold text-white">Bid ID:</span> {selectedBidId}</p>
              <p><span className="font-bold text-white">Bidder:</span> {vendorName}</p>
              <p><span className="font-bold text-white">Selected Admin Recommendation:</span> <span className={`font-extrabold uppercase ${adminSelectedDecision === 'ACCEPT' ? 'text-[#20C997]' : 'text-[#FF6B7A]'}`}>{adminSelectedDecision}ED</span></p>
              <p className="text-[10px] text-[#14D9D5] pt-1 italic">
                Note: This Admin decision will be sent back to the Procurement Officer, who will make the final, binding procurement decision.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A7C9CE] mb-1">
                Admin Review Rationale / Forensics Notes
              </label>
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Provide governance rationale or details regarding your review decision..."
                rows={3}
                className="w-full bg-[#103D4A] border border-[#1B5968] rounded-xl p-3 text-xs text-white placeholder-[#A7C9CE]/50 focus:outline-hidden focus:border-[#06B6B4]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAdminDecisionModal(false)}
                className="px-4 py-2 rounded-xl bg-[#103D4A] hover:bg-[#103D4A]/80 text-xs font-bold text-[#A7C9CE] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAdminDecision}
                disabled={submitting}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs text-white shadow-md cursor-pointer ${
                  adminSelectedDecision === 'ACCEPT' ? 'bg-[#20C997] hover:bg-[#20C997]/80' : 'bg-[#FF6B7A] hover:bg-[#FF6B7A]/80'
                }`}
              >
                {submitting ? 'Submitting...' : `Submit Admin ${adminSelectedDecision}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. OFFICER FINAL DECISION MODAL */}
      {showOfficerFinalModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0B3442] border border-[#1B5968] rounded-2xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              {officerSelectedDecision === 'ACCEPT' ? (
                <CheckCircle2 className="w-6 h-6 text-[#20C997]" />
              ) : (
                <XCircle className="w-6 h-6 text-[#FF6B7A]" />
              )}
              <h3 className="text-lg font-extrabold">
                Confirm Final Procurement Decision: {officerSelectedDecision}
              </h3>
            </div>

            <div className="p-3 rounded-xl bg-[#103D4A] border border-[#1B5968] text-xs text-[#A7C9CE] space-y-1">
              <p><span className="font-bold text-white">Bid ID:</span> {selectedBidId}</p>
              <p><span className="font-bold text-white">Bidder:</span> {vendorName}</p>
              <p><span className="font-bold text-white">Admin Recommendation:</span> <span className="font-extrabold text-[#14D9D5]">{escalation?.adminDecision}</span></p>
              <p><span className="font-bold text-white">Your Final Decision:</span> <span className={`font-extrabold uppercase ${officerSelectedDecision === 'ACCEPT' ? 'text-[#20C997]' : 'text-[#FF6B7A]'}`}>{officerSelectedDecision}ED</span></p>
              <p className="text-[10px] text-[#20C997] pt-1 italic font-semibold">
                This is the binding final procurement decision and will be persisted in the system database.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A7C9CE] mb-1">
                Final Procurement Award Rationale
              </label>
              <textarea
                value={officerComment}
                onChange={(e) => setOfficerComment(e.target.value)}
                placeholder="State final procurement award or rejection rationale..."
                rows={3}
                className="w-full bg-[#103D4A] border border-[#1B5968] rounded-xl p-3 text-xs text-white placeholder-[#A7C9CE]/50 focus:outline-hidden focus:border-[#06B6B4]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowOfficerFinalModal(false)}
                className="px-4 py-2 rounded-xl bg-[#103D4A] hover:bg-[#103D4A]/80 text-xs font-bold text-[#A7C9CE] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOfficerFinalDecision}
                disabled={submitting}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs text-white shadow-md cursor-pointer ${
                  officerSelectedDecision === 'ACCEPT' ? 'bg-[#20C997] hover:bg-[#20C997]/80' : 'bg-[#FF6B7A] hover:bg-[#FF6B7A]/80'
                }`}
              >
                {submitting ? 'Submitting...' : `Submit Final ${officerSelectedDecision}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
