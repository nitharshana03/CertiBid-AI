// CertiBid AI - Multi-Vendor Bid Comparison Matrix & Bidder My Bids
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RiskScoreBadge } from '../../components/common/RiskScoreBadge';
import { formatINR } from '../../utils/formatters';
import { Award, ShieldAlert, Gavel, FileText, Building2, Loader2, AlertCircle } from 'lucide-react';

export function BidComparison() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tenderIdParam = searchParams.get('tenderId') || 'TND-2026-8901';

  const rawRole = String(user?.role || '').toUpperCase().trim();
  const isBidder = rawRole === 'BIDDER' || rawRole === 'VENDOR';

  const [tenders, setTenders] = useState([]);
  const [selectedTenderId, setSelectedTenderId] = useState(tenderIdParam);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    if (isBidder) {
      // For Bidder, fetch ONLY authenticated bidder's registered bids directly
      apiService.getBids()
        .then(bRes => {
          if (!isMounted) return;
          setBids(Array.isArray(bRes.data) ? bRes.data : []);
          setLoading(false);
        })
        .catch(err => {
          if (!isMounted) return;
          console.error("Error loading bidder bids:", err);
          setError(err.message || 'Unable to load your bids from the server.');
          setLoading(false);
        });
    } else {
      // For Officer/Admin, fetch tenders and bids for selected tender
      apiService.getTenders().then(tRes => {
        if (!isMounted) return;
        setTenders(tRes.data || []);
        apiService.getBids({ tenderId: selectedTenderId }).then(bRes => {
          if (!isMounted) return;
          setBids(Array.isArray(bRes.data) ? bRes.data : []);
          setLoading(false);
        }).catch(err => {
          if (!isMounted) return;
          setError(err.message || 'Unable to load bids for selected tender.');
          setLoading(false);
        });
      }).catch(err => {
        if (!isMounted) return;
        setError(err.message || 'Unable to load tenders.');
        setLoading(false);
      });
    }

    return () => { isMounted = false; };
  }, [selectedTenderId, isBidder, user?.email, user?.bidderId]);

  const selectedTender = tenders.find(t => t.id === selectedTenderId);

  // BIDDER SPECIFIC "MY BIDS" VIEW
  if (isBidder) {
    const companyDisplayName = user?.organization || user?.companyName || user?.name || user?.email || 'Authenticated Bidder';

    return (
      <div className="space-y-6 max-w-5xl mx-auto text-[#F0FDFA]">
        {/* Banner Header */}
        <div className="p-6 rounded-3xl bg-[#0B3442] border border-[#1B5968] shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white">
          <div>
            <div className="flex items-center gap-2 text-[#14D9D5] text-xs font-bold uppercase tracking-wider mb-1">
              <Award className="w-4 h-4 text-[#06B6B4]" /> Bidder Corporate Portal
            </div>
            <h2 className="text-2xl font-extrabold text-white">My Bids</h2>
            <p className="text-xs text-[#A7C9CE] mt-1">
              Track your registered tenders, submitted financial proposals, and official evaluation statuses.
            </p>
          </div>
          <button
            onClick={() => navigate('/tenders')}
            className="px-4 py-2.5 bg-[#06B6B4] hover:bg-[#14D9D5] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <Gavel className="w-4 h-4" /> Browse Available Tenders
          </button>
        </div>

        {/* Authenticated Bidder Identity Bar */}
        <div className="px-5 py-3 rounded-2xl bg-[#103D4A] border border-[#1B5968] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#14D9D5]" />
            <span className="text-[#A7C9CE] font-semibold">Logged-In Bidder:</span>
            <span className="font-extrabold text-white">{companyDisplayName}</span>
          </div>
          {user?.email && (
            <span className="text-[11px] text-[#A7C9CE] bg-[#071F2A] px-3 py-1 rounded-lg border border-[#1B5968]">
              {user.email}
            </span>
          )}
        </div>

        {/* My Bids Container */}
        <div className="p-6 rounded-3xl bg-[#103D4A] border border-[#1B5968] shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#1B5968] pb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#14D9D5]" /> Submitted Tender Proposals ({loading ? '...' : bids.length})
            </h3>
          </div>

          {/* 1. LOADING STATE */}
          {loading && (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#14D9D5] animate-spin mx-auto" />
              <p className="text-sm font-extrabold text-white">Loading your bids...</p>
              <p className="text-xs text-[#A7C9CE]">Retrieving authenticated bidding records from procurement backend...</p>
            </div>
          )}

          {/* 2. ERROR STATE */}
          {!loading && error && (
            <div className="p-6 rounded-2xl bg-[#FF6B7A]/10 border border-[#FF6B7A]/30 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-[#FF6B7A] mx-auto" />
              <h4 className="text-sm font-bold text-white">Unable to Load Bids</h4>
              <p className="text-xs text-[#A7C9CE]">{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  apiService.getBids()
                    .then(bRes => { setBids(Array.isArray(bRes.data) ? bRes.data : []); setLoading(false); })
                    .catch(e => { setError(e.message || 'Failed to load bids'); setLoading(false); });
                }}
                className="px-4 py-2 bg-[#0B3442] hover:bg-[#145364] text-white font-bold text-xs rounded-xl border border-[#1B5968] cursor-pointer transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {/* 3. CLEAN EMPTY STATE */}
          {!loading && !error && bids.length === 0 && (
            <div className="py-16 px-6 text-center rounded-2xl border border-dashed border-[#1B5968] bg-[#071F2A]/60 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#0B3442] border border-[#1B5968] flex items-center justify-center text-[#14D9D5] shadow-inner">
                <Gavel className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h4 className="text-lg font-black text-white">No bids registered yet</h4>
                <p className="text-xs text-[#A7C9CE] leading-relaxed">
                  You haven't registered or submitted any bids yet. Explore available tenders to find opportunities.
                </p>
              </div>
              <button
                onClick={() => navigate('/tenders')}
                className="mt-2 px-6 py-3 bg-[#06B6B4] hover:bg-[#14D9D5] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-[#06B6B4]/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Gavel className="w-4 h-4" /> Browse Available Tenders
              </button>
            </div>
          )}

          {/* 4. REAL BIDDER BIDS TABLE */}
          {!loading && !error && bids.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1B5968] uppercase font-semibold text-[10px] tracking-wider text-[#A7C9CE] bg-[#0B3442]">
                    <th className="py-3.5 px-4">Bid Reference</th>
                    <th className="py-3.5 px-4">Tender Name & ID</th>
                    <th className="py-3.5 px-4">Proposed Amount (₹)</th>
                    <th className="py-3.5 px-4">Completion Time</th>
                    <th className="py-3.5 px-4">Submission Date</th>
                    <th className="py-3.5 px-4">EMD Status</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B5968]">
                  {bids.map(bid => (
                    <tr key={bid.id} className="hover:bg-[#145364]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-extrabold text-[#14D9D5]">
                        {bid.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white max-w-xs line-clamp-1">{bid.tenderTitle || bid.title || 'Procurement Tender'}</p>
                        <p className="text-[10px] text-[#A7C9CE] font-mono mt-0.5">{bid.tenderId}</p>
                      </td>
                      <td className="py-3.5 px-4 font-black text-sm text-white">
                        {formatINR(bid.proposedAmount || bid.amount || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-[#A7C9CE] font-medium">
                        {bid.estimatedCompletionTime || `${bid.completionTimeDays || 180} days`}
                      </td>
                      <td className="py-3.5 px-4 text-[#A7C9CE] font-medium">
                        {bid.submissionDate || bid.submittedAt || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-[#20C997]/20 border border-[#20C997]/40 text-[#20C997] text-[10px] font-bold">
                          {bid.emdPaymentStatus || 'Verified & Paid'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={bid.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // OFFICER / ADMIN VIEW (Multi-Vendor Bid Comparison Matrix)
  return (
    <div className="space-y-6 text-[#F0FDFA]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-[#F4C95D]" /> Multi-Vendor Bid Comparison Matrix
          </h2>
          <p className="text-xs text-[#A7C9CE]">Side-by-side financial, technical score, and AI collusion risk comparison.</p>
        </div>

        <select
          value={selectedTenderId}
          onChange={(e) => setSelectedTenderId(e.target.value)}
          className="px-4 py-2 rounded-xl bg-[#0B3442] text-xs font-bold text-white border border-[#1B5968] cursor-pointer focus:outline-none focus:border-[#06B6B4]"
        >
          {tenders.map(t => (
            <option key={t.id} value={t.id}>{t.id} - {t.title}</option>
          ))}
        </select>
      </div>

      {/* Tender Benchmark Summary */}
      {selectedTender && (
        <div className="p-6 rounded-2xl bg-[#0B3442] text-white border border-[#1B5968] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
          <div>
            <p className="text-xs text-[#14D9D5] font-bold uppercase">{selectedTender.category}</p>
            <h3 className="text-lg font-bold text-white">{selectedTender.title}</h3>
            <p className="text-xs text-[#A7C9CE] mt-0.5">Government Approved Benchmark: {formatINR(selectedTender.budget)}</p>
          </div>
          <button
            onClick={() => navigate(`/decision?tenderId=${selectedTender.id}`)}
            className="px-5 py-2.5 bg-[#F4C95D] hover:bg-[#F4C95D]/90 text-[#071F2A] font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all"
          >
            <Award className="w-4 h-4" /> Proceed to Winner Award Selection
          </button>
        </div>
      )}

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bids.map((bid, rank) => (
          <div
            key={bid.id}
            className={`p-6 rounded-3xl bg-[#103D4A] border transition-all flex flex-col justify-between space-y-4 relative ${
              rank === 0 ? 'ring-2 ring-[#F4C95D] border-[#F4C95D]' : 'border-[#1B5968]'
            }`}
          >
            {rank === 0 && (
              <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-[#F4C95D] text-[#071F2A] text-[10px] font-black uppercase tracking-wider shadow-md">
                ⭐ L1 Lowest Compliant Bid
              </span>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#A7C9CE]">Bid ID: {bid.id}</span>
                <StatusBadge status={bid.status} />
              </div>

              <h3 className="font-extrabold text-base text-white">{bid.vendorName}</h3>
              <p className="text-2xl font-black text-[#14D9D5] mt-2">{formatINR(bid.proposedAmount)}</p>
              <p className="text-[11px] text-[#A7C9CE] font-medium mt-0.5">Estimated Duration: {bid.estimatedCompletionTime}</p>
            </div>

            {/* Score Metrics */}
            <div className="space-y-2 pt-3 border-t border-[#1B5968] text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#A7C9CE]">Technical Score:</span>
                <span className="font-extrabold text-white">{bid.bidScore} / 100</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#A7C9CE]">Price Anomaly Ratio:</span>
                <span className={`font-bold ${bid.priceAnomalyRatio < -20 ? 'text-[#FF6B7A] font-black' : 'text-[#20C997]'}`}>
                  {bid.priceAnomalyRatio}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#A7C9CE]">Collusion Probability:</span>
                <span className={`font-bold ${bid.collusionProbability > 50 ? 'text-[#FF6B7A] font-black' : 'text-white'}`}>
                  {bid.collusionProbability}%
                </span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-[#A7C9CE]">AI Risk Rating:</span>
                <RiskScoreBadge score={bid.aiRiskScore} level={bid.riskLevel} />
              </div>
            </div>

            <button
              onClick={() => navigate(`/risk-analysis?bid=${bid.id}`)}
              className="w-full py-2.5 bg-[#0B3442] hover:bg-[#06B6B4] hover:text-white text-[#14D9D5] font-bold text-xs rounded-xl border border-[#1B5968] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" /> Deep AI Risk Analysis
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

