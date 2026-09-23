// CertiBid AI - Escalated Bids Queue & Tender-Scoped Review Management Page
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  ShieldAlert,
  Gavel,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Building2,
  FileText,
  Layers
} from 'lucide-react';

export function EscalatedBidsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tenders, setTenders] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [tenderBiddersData, setTenderBiddersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [biddersLoading, setBiddersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');

  const rawRole = String(user?.role || '').toUpperCase().trim();
  const isAdmin = rawRole === 'ADMIN';
  const isOfficer = rawRole === 'OFFICER';

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [tRes, eRes] = await Promise.all([
        apiService.getTenders(),
        apiService.getEscalations()
      ]);
      const tendersList = Array.isArray(tRes?.data) ? tRes.data : [];
      const escalationsList = Array.isArray(eRes?.data) ? eRes.data : [];
      setTenders(tendersList);
      setEscalations(escalationsList);

      const targetTenderId = searchParams.get('tender');
      const targetBidId = searchParams.get('bid');

      if (targetTenderId && tendersList.some(t => t.id === targetTenderId)) {
        const found = tendersList.find(t => t.id === targetTenderId);
        handleSelectTender(found);
      } else if (targetBidId) {
        const matchingEsc = escalationsList.find(e => e.bidId === targetBidId);
        const tenderIdFromBid = matchingEsc?.tenderId;
        const found = tendersList.find(t => t.id === tenderIdFromBid);
        if (found) {
          handleSelectTender(found);
        } else if (tendersList.length > 0) {
          handleSelectTender(tendersList[0]);
        }
      } else if (escalationsList.length > 0 && !selectedTender) {
        const firstEsc = escalationsList[0];
        const matchingTender = tendersList.find(t => t.id === firstEsc.tenderId);
        if (matchingTender) {
          handleSelectTender(matchingTender);
        } else if (tendersList.length > 0) {
          handleSelectTender(tendersList[0]);
        }
      } else if (tendersList.length > 0 && !selectedTender) {
        handleSelectTender(tendersList[0]);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load tenders and escalations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTender = async (tender) => {
    setSelectedTender(tender);
    setBiddersLoading(true);
    try {
      const res = await apiService.getTenderBidders(tender.id);
      setTenderBiddersData(res.data);
    } catch (err) {
      showToast(err.message || 'Failed to load bidders for tender', 'error');
      setTenderBiddersData({
        tenderId: tender.id,
        tenderTitle: tender.title,
        registeredBiddersCount: 0,
        escalatedBidsCount: 0,
        bidders: []
      });
    } finally {
      setBiddersLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ESCALATED_TO_ADMIN':
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#F4C95D]/10 text-[#F4C95D] border border-[#F4C95D]/30 text-[11px] font-bold inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Admin Review
          </span>
        );
      case 'ADMIN_ACCEPTED_PENDING_OFFICER':
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#06B6B4]/10 text-[#14D9D5] border border-[#06B6B4]/30 text-[11px] font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#20C997]" /> Admin Accepted • Awaiting Final Decision
          </span>
        );
      case 'ADMIN_REJECTED_PENDING_OFFICER':
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#FF6B7A]/10 text-[#FF6B7A] border border-[#FF6B7A]/30 text-[11px] font-bold inline-flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Admin Rejected • Awaiting Final Decision
          </span>
        );
      case 'FINAL_ACCEPTED':
      case 'AWARDED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#20C997]/20 text-[#20C997] border border-[#20C997]/40 text-[11px] font-black inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Awarded / Accepted
          </span>
        );
      case 'FINAL_REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#FF6B7A]/20 text-[#FF6B7A] border border-[#FF6B7A]/40 text-[11px] font-black inline-flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return <StatusBadge status={status || 'Submitted'} />;
    }
  };

  const filteredBidders = (tenderBiddersData?.bidders || []).filter(b => {
    if (activeTab === 'ESCALATED') return b.isEscalated;
    if (activeTab === 'PENDING') return b.escalationStatus === 'ESCALATED_TO_ADMIN';
    return true;
  });

  return (
    <div className="space-y-6 text-[#F0FDFA]">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0B3442] border border-[#1B5968] text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#FF6B7A] text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4 text-[#FF6B7A]" /> Senior Governance Escalations & Tender Scope
          </div>
          <h2 className="text-2xl font-extrabold text-white">Escalated Bids Review Desk</h2>
          <p className="text-xs text-[#A7C9CE] mt-1">
            Select a specific tender to inspect exclusively registered organisations and officer-escalated proposals.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-[#103D4A] border border-[#1B5968] text-xs font-bold text-[#14D9D5] flex items-center gap-2 shrink-0">
          <UserCheck className="w-4 h-4 text-[#06B6B4]" />
          <span>{isAdmin ? 'Admin Tender-Scoped Review' : 'Officer Procurement Control'}</span>
        </div>
      </div>

      {/* Tender Selector Bar / Cards */}
      <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968] shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#14D9D5]" /> Select Tender for Scoped Review:
          </h3>
          <span className="text-xs text-[#A7C9CE]">{tenders.length} Active Tenders Available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {tenders.map(t => {
            const isSelected = selectedTender?.id === t.id;
            const hasEscalations = escalations.some(e => e.tenderId === t.id);
            return (
              <div
                key={t.id}
                onClick={() => handleSelectTender(t)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#0B3442] border-[#14D9D5] shadow-md ring-1 ring-[#14D9D5]'
                    : 'bg-[#0B3442]/60 border-[#1B5968] hover:bg-[#0B3442] hover:border-[#06B6B4]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-extrabold text-[#14D9D5]">{t.id}</span>
                    {hasEscalations && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FF6B7A]/20 text-[#FF6B7A] text-[10px] font-bold border border-[#FF6B7A]/30">
                        Escalated
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-white line-clamp-1">{t.title}</h4>
                </div>
                <div className="mt-3 pt-3 border-t border-[#1B5968]/60 flex items-center justify-between text-[11px] text-[#A7C9CE]">
                  <span>{t.department || 'Government Dept'}</span>
                  <span className="font-bold text-[#20C997]">₹{((t.budget || 0) / 10000000).toFixed(1)} Cr</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Tender Scoped View */}
      {selectedTender && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0B3442] border-2 border-[#06B6B4]/50 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#14D9D5]">Active Scoped Tender Review</span>
                <h3 className="text-xl font-extrabold text-white mt-0.5">Tender: {selectedTender.title}</h3>
                <p className="text-xs text-[#A7C9CE] mt-1">
                  Tender ID: <span className="font-bold text-white">{selectedTender.id}</span> | Department: {selectedTender.department}
                </p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-[#103D4A] border border-[#1B5968] text-center">
                <p className="text-[10px] text-[#A7C9CE] uppercase font-bold">Registered Bidders</p>
                <p className="text-2xl font-black text-[#14D9D5]">
                  {tenderBiddersData ? (tenderBiddersData.registeredBiddersCount ?? tenderBiddersData.bidders?.length ?? 0) : '...'}
                </p>
              </div>
            </div>

            {/* Filter Tabs for Bidders */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1B5968] text-xs">
              {[
                { key: 'ALL', label: `All Registered Bidders (${tenderBiddersData?.registeredBiddersCount ?? tenderBiddersData?.bidders?.length ?? 0})` },
                { key: 'ESCALATED', label: `Escalated for Admin Review (${tenderBiddersData?.escalatedBidsCount || 0})` },
                { key: 'PENDING', label: 'Pending Admin Action' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    activeTab === tab.key
                      ? 'bg-[#06B6B4] text-white shadow-md'
                      : 'bg-[#103D4A] text-[#A7C9CE] hover:text-white border border-[#1B5968]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bidders Table */}
          <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968] shadow-lg">
            {biddersLoading ? (
              <div className="p-12 text-center text-xs text-[#A7C9CE]">Loading registered bidders for {selectedTender.id}...</div>
            ) : !tenderBiddersData || filteredBidders.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Building2 className="w-12 h-12 text-[#A7C9CE]/40 mx-auto" />
                <p className="text-sm font-bold text-white">
                  No bidders registered for this tender yet.
                </p>
                <p className="text-xs text-[#A7C9CE] max-w-md mx-auto">
                  There are no organisations or submitted proposals associated with Tender ID {selectedTender.id} in the database at this moment.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1B5968] text-[#A7C9CE] uppercase tracking-wider text-[10px] font-semibold bg-[#0B3442]">
                      <th className="py-3 px-3">Organisation & Bid ID</th>
                      <th className="py-3 px-3">Registration Status</th>
                      <th className="py-3 px-3">Bid Status</th>
                      <th className="py-3 px-3">Proposed Amount</th>
                      <th className="py-3 px-3">AI Risk Score</th>
                      <th className="py-3 px-3">Escalation Status</th>
                      <th className="py-3 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1B5968]">
                    {filteredBidders.map(b => (
                      <tr key={b.bidId || b.id} className="hover:bg-[#145364]/40 transition-colors">
                        <td className="py-3.5 px-3">
                          <p className="font-extrabold text-white text-sm">{b.companyName || b.organisation || b.bidderName || b.vendorName || 'Registered Organisation'}</p>
                          <p className="text-[10px] text-[#14D9D5] font-mono">Bid ID: {b.bidId || b.id}</p>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#20C997]/10 text-[#20C997] border border-[#20C997]/30 text-[10px] font-bold">
                            {b.registrationStatus || 'Registered'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          {getStatusBadge(b.bidStatus || b.status)}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-[#20C997]">
                          ₹{(b.proposedAmount || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                            (b.aiRiskScore || 0) > 30 ? 'bg-[#FF6B7A]/20 text-[#FF6B7A]' : 'bg-[#20C997]/20 text-[#20C997]'
                          }`}>
                            Score: {b.aiRiskScore || 0} ({b.riskLevel || 'Low'})
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          {b.isEscalated ? (
                            <span className="px-2.5 py-1 rounded-full bg-[#FF6B7A]/10 text-[#FF6B7A] border border-[#FF6B7A]/30 text-[10px] font-extrabold inline-flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> Escalated
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#A7C9CE] italic">Standard Proposal</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <button
                            onClick={() => navigate(`/risk-analysis?bid=${b.bidId || b.id}`)}
                            className="px-3 py-1.5 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-white font-bold text-xs shadow-md flex items-center gap-1 transition-all cursor-pointer shrink-0"
                          >
                            <span>Inspect AI Risk & Review</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

