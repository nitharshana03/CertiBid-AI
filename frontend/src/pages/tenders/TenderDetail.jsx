// CertiBid AI - Tender Detail View
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RiskScoreBadge } from '../../components/common/RiskScoreBadge';
import { Timeline } from '../../components/common/Timeline';
import { formatINR } from '../../utils/formatters';
import { ArrowLeft, Award, Plus, CheckCircle2, Loader2, FileText, ShieldCheck } from 'lucide-react';

export function TenderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tender, setTender] = useState(null);
  const [bids, setBids] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const rawRole = String(user?.role || '').toUpperCase();
  const isBidder = rawRole === 'BIDDER' || rawRole === 'VENDOR';

  useEffect(() => {
    const targetId = id || 'TND-2026-8901';
    Promise.all([
      apiService.getTenderById(targetId),
      apiService.getBids({ tenderId: targetId })
    ]).then(([tRes, bRes]) => {
      setTender(tRes.data);
      const fetchedBids = bRes.data || [];
      setBids(fetchedBids);

      if (isBidder) {
        const bidderId = user?.bidderId || user?.vendorId;
        const userEmail = (user?.email || '').toLowerCase().trim();
        const userOrg = (user?.organization || user?.companyName || '').toLowerCase().trim();

        const hasRegistered = fetchedBids.some(b => 
          b.tenderId === targetId && (
            (bidderId && b.vendorId === bidderId) ||
            (b.vendorEmail && b.vendorEmail.toLowerCase() === userEmail) ||
            (userOrg && b.vendorName && b.vendorName.toLowerCase() === userOrg)
          )
        );
        setIsRegistered(hasRegistered);
      }
      setLoading(false);
    }).catch((err) => {
      console.error("Failed to load tender details:", err);
      setLoading(false);
    });
  }, [id, user]);

  const handleRegister = () => {
    if (!tender) return;
    navigate(`/tenders/${tender.id}/register`);
  };

  if (loading || !tender) {
    return (
      <div className="p-12 text-center text-xs font-semibold text-[#A7C9CE] animate-pulse flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#06B6B4] animate-spin" />
        <span>Loading Tender Information...</span>
      </div>
    );
  }

  const emdAmount = tender.emdAmount || Math.round((tender.budget || 50000000) * 0.02);

  return (
    <div className="space-y-6 text-[#F0FDFA]">
      <button onClick={() => navigate('/tenders')} className="flex items-center gap-1.5 text-xs font-bold text-[#A7C9CE] hover:text-white cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back to Tenders Directory
      </button>

      {/* Header Banner */}
      <div className="p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0B3442] border-[#1B5968] text-white">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-[#14D9D5] uppercase tracking-wider">{tender.category}</span>
            <StatusBadge status={tender.status} />
          </div>
          <h2 className="text-2xl font-extrabold">{tender.title}</h2>
          <p className="text-xs mt-1 text-[#A7C9CE]">
            Tender ID: <strong className="text-white font-mono">{tender.id}</strong> • Department: <strong className="text-white">{tender.department}</strong> • Published: {tender.publishingDate} • Location: {tender.location}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Bidder options: Register for Tender or Already Registered */}
          {isBidder && (
            isRegistered ? (
              <div className="flex items-center gap-3">
                <span className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 font-extrabold text-xs border border-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Already Registered
                </span>
                <button
                  onClick={() => navigate('/bids/my-bids')}
                  className="px-4 py-2.5 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-white text-xs font-extrabold shadow-lg transition-all cursor-pointer"
                >
                  View My Bids
                </button>
              </div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="px-5 py-2.5 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-white text-xs font-extrabold shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {registering ? 'Registering...' : 'Register for Tender'}
              </button>
            )
          )}

          {/* Admin & Officer get Compare / Evaluate Bids */}
          {!isBidder && (
            <button
              onClick={() => navigate(`/decision?tenderId=${tender.id}`)}
              className="px-5 py-2.5 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#F4C95D]" /> Evaluate Bids ({bids.length})
            </button>
          )}
        </div>
      </div>

      {/* Procurement Lifecycle Progress */}
      <div className="p-6 rounded-2xl border bg-[#0B3442] border-[#1B5968]">
        <h3 className="text-xs font-bold text-[#A7C9CE] uppercase tracking-wider mb-3">Procurement Lifecycle Stage</h3>
        <Timeline currentStepIndex={tender.status === 'Awarded' ? 9 : 4} />
      </div>

      {/* Scope Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-6 rounded-2xl border space-y-4 bg-[#103D4A] border-[#1B5968]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#14D9D5]" /> Project Scope & Deliverables
          </h3>
          <p className="text-xs leading-relaxed text-[#F0FDFA]">{tender.description}</p>

          <h4 className="text-xs font-bold pt-2 text-white">Prequalification Requirements</h4>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-[#A7C9CE]">
            {tender.requirements && tender.requirements.length > 0 ? (
              tender.requirements.map((req, idx) => (
                <li key={idx} className="leading-relaxed">{req}</li>
              ))
            ) : (
              <li>Standard technical & financial eligibility compliance.</li>
            )}
          </ul>
        </div>

        {/* Financial & Specifications Box */}
        <div className="p-6 rounded-2xl border space-y-4 bg-[#103D4A] border-[#1B5968]">
          <h3 className="text-sm font-bold text-white">Financial Specifications</h3>
          <div className="p-4 rounded-xl border text-xs bg-[#0B3442] border-[#1B5968] space-y-2">
            <div>
              <span className="text-[#A7C9CE] text-[10px] uppercase font-bold tracking-wider">Approved Budget Ceiling</span>
              <p className="text-2xl font-black text-[#14D9D5] mt-0.5">{formatINR(tender.budget)}</p>
            </div>
            <div className="pt-2 border-t border-[#1B5968]">
              <span className="text-[#A7C9CE] text-[10px] uppercase font-bold tracking-wider">Required EMD Deposit (2%)</span>
              <p className="text-lg font-bold text-white mt-0.5">{formatINR(emdAmount)}</p>
            </div>
          </div>

          <div className="text-xs space-y-2 pt-1">
            <div className="flex justify-between py-1 border-b border-[#1B5968]">
              <span className="text-[#A7C9CE]">Submission Deadline:</span>
              <span className="font-bold text-white">{tender.submissionDeadline}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1B5968]">
              <span className="text-[#A7C9CE]">Bid Opening Date:</span>
              <span className="font-bold text-white">{tender.openingDate || '2026-08-26'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#A7C9CE]">Issuing Authority:</span>
              <span className="font-bold text-[#14D9D5]">{tender.department}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submitted Bids Matrix - HIDDEN for Bidders */}
      {!isBidder && (
        <div className="p-6 rounded-2xl border bg-[#103D4A] border-[#1B5968]">
          <h3 className="text-sm font-bold mb-4 text-white">Submitted Bids for Evaluation</h3>
          <div className="space-y-3">
            {bids.length === 0 ? (
              <p className="text-xs text-[#A7C9CE] py-4 text-center">No bids submitted yet for this tender.</p>
            ) : (
              bids.map(bid => (
                <div key={bid.id} className="p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs bg-[#0B3442] border-[#1B5968]">
                  <div>
                    <p className="font-bold text-white">{bid.vendorName || bid.bidderName}</p>
                    <p className="text-[10px] text-[#A7C9CE]">Bid ID: {bid.id} • Proposed Amount: {formatINR(bid.proposedAmount)} • Delivery: {bid.estimatedCompletionTime}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <RiskScoreBadge score={bid.aiRiskScore} level={bid.riskLevel} />
                    <StatusBadge status={bid.status} />
                    <button
                      onClick={() => navigate(`/risk-analysis?bid=${bid.id}`)}
                      className="px-3 py-1 bg-[#06B6B4] hover:bg-[#14D9D5] text-white rounded-lg font-extrabold transition-colors cursor-pointer"
                    >
                      AI Risk Report
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

