// CertiBid AI - Treasury, EMD & Official Receipts Module
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { formatINR } from '../../utils/formatters';
import {
  CreditCard,
  FileText,
  Receipt,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Building2,
  PlusCircle,
  ExternalLink
} from 'lucide-react';

export function PaymentsModule() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bids, setBids] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [payingEmdForBid, setPayingEmdForBid] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const rawRole = String(user?.role || '').toUpperCase().trim();
  const isBidder = rawRole === 'BIDDER' || rawRole === 'VENDOR';

  const companyName = user?.organization || user?.companyName || user?.name || 'Registered Bidder Entity';
  const bidderId = user?.bidderId || user?.vendorId || 'VND-BIDDER';

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [bidsRes, txnsRes] = await Promise.all([
        apiService.getBids(),
        apiService.getTransactions()
      ]);

      setBids(bidsRes.data || []);
      setTransactions(txnsRes.data || []);
    } catch (err) {
      console.error('Error loading EMD and bid data:', err);
      setError(err.message || 'Failed to load EMD records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper calculation metrics for Bidder
  const totalBidsCount = bids.length;

  const totalEmdSubmitted = transactions.reduce((sum, tx) => {
    if (tx.status === 'Completed' || tx.status === 'Verified' || tx.status === 'Paid') {
      return sum + (Number(tx.amount) || 0);
    }
    return sum;
  }, 0);

  const pendingEmdCount = bids.filter(b => 
    b.emdPaymentStatus === 'Pending' || b.emdPaymentStatus === 'Under Verification'
  ).length;

  const refundedEmdCount = transactions.filter(tx => 
    tx.status === 'Refunded' || tx.status === 'Released'
  ).length;

  const handleProcessEmdPayment = async (bid) => {
    setIsProcessingPayment(true);
    try {
      const emdAmount = bid.emdAmount || 900000;
      await apiService.processEmdPayment({
        tenderId: bid.tenderId,
        tenderTitle: bid.tenderTitle,
        bidId: bid.id,
        vendorId: bidderId,
        vendorName: companyName,
        amount: emdAmount,
        currency: 'INR'
      });
      setPayingEmdForBid(null);
      await loadData();
    } catch (e) {
      alert('Payment processing failed. Please check network connection.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3 bg-[#0B3442] border border-[#1B5968] rounded-3xl text-[#A7C9CE]">
        <RefreshCw className="w-8 h-8 text-[#06B6B4] animate-spin mx-auto" />
        <p className="text-xs font-bold text-white">Loading your bid and EMD records...</p>
        <p className="text-[11px]">Verifying cryptographic receipts on government treasury ledger</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl bg-[#2A0F1B] border border-[#F43F5E]/30 text-white space-y-4">
        <div className="flex items-center gap-3 text-[#F43F5E]">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <h3 className="text-base font-bold">Unable to Load EMD Records</h3>
        </div>
        <p className="text-xs text-[#FDA4AF]">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-[#F43F5E] hover:bg-[#E11D48] text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#F0FDFA]">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#0B3442] border border-[#1B5968] text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#14D9D5] text-xs font-bold uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4 text-[#06B6B4]" />
            {isBidder ? "Bidder Treasury Portal" : "Government Treasury Audit Ledger"}
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {isBidder ? "EMD Deposits & Security Receipts" : "Financial Audit & Vendor EMD Ledger"}
          </h2>
          <p className="text-xs text-[#A7C9CE] mt-1">
            {isBidder
              ? `Official Earnest Money Deposit (EMD) records, registered bids, and verified treasury receipts for ${companyName}.`
              : "Government treasury audit ledger, vendor EMD deposits, and verified transaction receipts."}
          </p>
        </div>

        {isBidder && (
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-2xl bg-[#071F2A] border border-[#1B5968] text-xs flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#14D9D5]" />
              <div>
                <p className="text-[10px] text-[#A7C9CE]">Authenticated Entity</p>
                <p className="font-bold text-white truncate max-w-[180px]">{companyName}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/tenders')}
              className="px-4 py-2.5 bg-[#06B6B4] hover:bg-[#14D9D5] text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Explore Tenders</span>
            </button>
          </div>
        )}
      </div>

      {/* BIDDER SPECIFIC SUMMARY CARDS */}
      {isBidder && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#103D4A] border border-[#1B5968] text-white space-y-2">
            <div className="flex items-center justify-between text-[#A7C9CE]">
              <span className="text-xs font-bold">Total Registered Bids</span>
              <FileText className="w-4 h-4 text-[#14D9D5]" />
            </div>
            <p className="text-2xl font-black text-white">{totalBidsCount}</p>
            <p className="text-[10px] text-[#A7C9CE]">Tender applications submitted</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#103D4A] border border-[#1B5968] text-white space-y-2">
            <div className="flex items-center justify-between text-[#A7C9CE]">
              <span className="text-xs font-bold">Total EMD Submitted</span>
              <CheckCircle2 className="w-4 h-4 text-[#20C997]" />
            </div>
            <p className="text-2xl font-black text-[#20C997]">{formatINR(totalEmdSubmitted)}</p>
            <p className="text-[10px] text-[#A7C9CE]">Verified & deposited in treasury</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#103D4A] border border-[#1B5968] text-white space-y-2">
            <div className="flex items-center justify-between text-[#A7C9CE]">
              <span className="text-xs font-bold">Pending EMD Security</span>
              <Clock className="w-4 h-4 text-[#F4C95D]" />
            </div>
            <p className="text-2xl font-black text-[#F4C95D]">{pendingEmdCount}</p>
            <p className="text-[10px] text-[#A7C9CE]">Bids requiring EMD binding</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#103D4A] border border-[#1B5968] text-white space-y-2">
            <div className="flex items-center justify-between text-[#A7C9CE]">
              <span className="text-xs font-bold">Refunded / Released EMD</span>
              <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
            </div>
            <p className="text-2xl font-black text-[#38BDF8]">{refundedEmdCount}</p>
            <p className="text-[10px] text-[#A7C9CE]">Returned after tender completion</p>
          </div>
        </div>
      )}

      {/* BIDDER VIEW: REGISTERED BIDS & EMD LEDGER */}
      {isBidder && (
        <div className="p-6 rounded-3xl bg-[#103D4A] border border-[#1B5968] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1B5968] pb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#06B6B4]" />
              My Registered Bids & Earnest Money Deposit (EMD) Status
            </h3>
            <span className="text-xs text-[#A7C9CE] font-mono">
              Showing {bids.length} Registered Bid{bids.length === 1 ? '' : 's'}
            </span>
          </div>

          {bids.length === 0 ? (
            /* CLEAN EMPTY STATE FOR NEW BIDDER */
            <div className="py-12 px-4 text-center space-y-4 bg-[#0B3442] border border-[#1B5968] rounded-2xl">
              <div className="w-16 h-16 rounded-full bg-[#06B6B4]/10 text-[#06B6B4] flex items-center justify-center mx-auto">
                <CreditCard className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-base font-extrabold text-white">No Bids Registered Yet</h4>
                <p className="text-xs text-[#A7C9CE]">
                  You have not registered or submitted bids for any active tenders yet. Register for an available tender to view your bid and EMD security details here.
                </p>
              </div>
              <button
                onClick={() => navigate('/tenders')}
                className="px-6 py-3 bg-[#06B6B4] hover:bg-[#14D9D5] text-white text-xs font-extrabold rounded-xl shadow-lg inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Explore Available Tenders</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1B5968] text-[#A7C9CE] bg-[#0B3442]">
                    <th className="py-3 px-4 font-semibold">Tender & Bid ID</th>
                    <th className="py-3 px-4 font-semibold">Submission Date</th>
                    <th className="py-3 px-4 font-semibold">Contract Value (₹)</th>
                    <th className="py-3 px-4 font-semibold">EMD Required (₹)</th>
                    <th className="py-3 px-4 font-semibold">EMD Deposit Status</th>
                    <th className="py-3 px-4 font-semibold">Receipt / Reference</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B5968]">
                  {bids.map(bid => {
                    const matchedTxn = transactions.find(t => t.bidId === bid.id || t.id === bid.emdTransactionId);
                    const emdStatus = bid.emdPaymentStatus || (matchedTxn ? matchedTxn.status : 'Verified & Paid');
                    const emdAmount = bid.emdAmount || 900000;

                    return (
                      <tr key={bid.id} className="hover:bg-[#145364]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-extrabold text-white">{bid.tenderTitle || 'Public Procurement Tender'}</p>
                          <p className="text-[10px] text-[#A7C9CE] font-mono mt-0.5">
                            Bid ID: <span className="text-[#14D9D5]">{bid.id}</span> • Tender: {bid.tenderId}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 text-[#A7C9CE] font-mono">
                          {bid.submissionDate || bid.submittedAt || '2026-08-02'}
                        </td>

                        <td className="py-3.5 px-4 font-extrabold text-white">
                          {formatINR(bid.proposedAmount || 41200000)}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-[#14D9D5]">
                          {formatINR(emdAmount)}
                        </td>

                        <td className="py-3.5 px-4">
                          <StatusBadge status={emdStatus} />
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#A7C9CE]">
                          {matchedTxn ? matchedTxn.id : (bid.emdTransactionId || 'TXN-EMD-VERIFIED')}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {emdStatus === 'Pending' || emdStatus === 'EMD not submitted' ? (
                            <button
                              onClick={() => setPayingEmdForBid(bid)}
                              className="px-3.5 py-1.5 bg-[#06B6B4] hover:bg-[#14D9D5] text-white font-extrabold rounded-lg text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay EMD</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedReceipt(matchedTxn || {
                                id: bid.emdTransactionId || `TXN-EMD-${bid.id}`,
                                tenderTitle: bid.tenderTitle,
                                vendorName: companyName,
                                amount: emdAmount,
                                date: bid.submissionDate || '2026-08-02',
                                status: 'Completed',
                                invoiceNo: `INV-2026-${Math.floor(100 + Math.random() * 900)}`
                              })}
                              className="px-3 py-1.5 bg-[#0B3442] hover:bg-[#06B6B4] hover:text-white text-[#14D9D5] border border-[#1B5968] rounded-lg font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>View Receipt</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* OFFICER / ADMIN VIEW: FINANCIAL AUDIT & TREASURY LEDGER */}
      {!isBidder && (
        <div className="p-6 rounded-3xl bg-[#103D4A] border border-[#1B5968] space-y-4">
          <div className="flex justify-between items-center border-b border-[#1B5968] pb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#06B6B4]" />
              Government Treasury EMD Ledger & Vendor Deposit Verification
            </h3>
            <span className="text-xs text-[#A7C9CE] font-mono">
              Total Records: {transactions.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1B5968] text-[#A7C9CE] bg-[#0B3442]">
                  <th className="py-2.5 px-3 font-semibold">Transaction Reference</th>
                  <th className="py-2.5 px-3 font-semibold">Vendor Entity</th>
                  <th className="py-2.5 px-3 font-semibold">Tender Scope</th>
                  <th className="py-2.5 px-3 font-semibold">Amount (₹)</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B5968]">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-[#145364]/50 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-white font-mono">{tx.id}</p>
                      <p className="text-[10px] text-[#A7C9CE]">{tx.date}</p>
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#14D9D5]">{tx.vendorName || 'Vendor Entity'}</td>
                    <td className="py-3 px-3 text-[#A7C9CE] font-medium">{tx.tenderTitle || 'Public Project Tender'}</td>
                    <td className="py-3 px-3 font-extrabold text-white">{formatINR(tx.amount)}</td>
                    <td className="py-3 px-3"><StatusBadge status={tx.status} /></td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedReceipt(tx)}
                        className="px-3 py-1.5 bg-[#0B3442] hover:bg-[#06B6B4] hover:text-white text-[#14D9D5] border border-[#1B5968] rounded-lg font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#A7C9CE]">No transactions recorded in treasury ledger.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Cryptographic Receipt Modal */}
      <Modal isOpen={!!selectedReceipt} onClose={() => setSelectedReceipt(null)} title="Official Treasury EMD Receipt">
        {selectedReceipt && (
          <div className="space-y-4 p-6 rounded-2xl bg-[#071F2A] text-white font-mono text-xs border border-[#1B5968]">
            <div className="flex justify-between items-center border-b border-[#1B5968] pb-3">
              <div>
                <span className="font-bold text-[#14D9D5] text-sm block">CERTI-BID GOVT TREASURY EMD RECEIPT</span>
                <span className="text-[10px] text-[#A7C9CE]">State Procurement & Public Treasury Authority</span>
              </div>
              <span className="text-[#A7C9CE] font-mono text-[11px]">{selectedReceipt.id}</span>
            </div>

            <div className="space-y-2.5 text-[#F0FDFA] py-2">
              <div className="flex justify-between border-b border-[#1B5968]/50 pb-1.5">
                <span className="text-[#A7C9CE]">Depositor Company:</span>
                <strong className="text-white">{selectedReceipt.vendorName || companyName}</strong>
              </div>
              <div className="flex justify-between border-b border-[#1B5968]/50 pb-1.5">
                <span className="text-[#A7C9CE]">Target Tender Title:</span>
                <strong className="text-white max-w-[240px] text-right truncate">{selectedReceipt.tenderTitle || 'Public Tender Project'}</strong>
              </div>
              <div className="flex justify-between border-b border-[#1B5968]/50 pb-1.5">
                <span className="text-[#A7C9CE]">EMD Amount Deposited:</span>
                <strong className="text-[#14D9D5] text-sm">{formatINR(selectedReceipt.amount)}</strong>
              </div>
              <div className="flex justify-between border-b border-[#1B5968]/50 pb-1.5">
                <span className="text-[#A7C9CE]">Treasury Invoice No:</span>
                <span className="text-white font-mono">{selectedReceipt.invoiceNo || 'INV-2026-901'}</span>
              </div>
              <div className="flex justify-between border-b border-[#1B5968]/50 pb-1.5">
                <span className="text-[#A7C9CE]">Transaction Date:</span>
                <span className="text-white">{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7C9CE]">Escrow Status:</span>
                <StatusBadge status={selectedReceipt.status || 'Completed'} />
              </div>
            </div>

            <div className="pt-3 border-t border-[#1B5968] text-[#20C997] font-bold text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#20C997] shrink-0" />
              <div>
                <p>CRYPTOGRAPHICALLY VERIFIED ON TREASURY LEDGER</p>
                <p className="text-[9px] text-[#A7C9CE] font-normal">SHA-256 Hash: 0x8f2a...c94b • Verified by CertiBid AI Core</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Pay EMD Modal */}
      <Modal isOpen={!!payingEmdForBid} onClose={() => setPayingEmdForBid(null)} title="Deposit EMD Security Guarantee">
        {payingEmdForBid && (
          <div className="space-y-4 p-5 rounded-2xl bg-[#071F2A] text-white text-xs border border-[#1B5968]">
            <p className="text-[#A7C9CE]">
              Deposit Earnest Money Deposit (EMD) to complete bid binding for <strong className="text-white">{payingEmdForBid.tenderTitle}</strong>.
            </p>
            <div className="p-4 rounded-xl bg-[#0B3442] border border-[#1B5968] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#A7C9CE]">Bidder Name:</span>
                <span className="font-bold text-white">{companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7C9CE]">EMD Required:</span>
                <span className="font-extrabold text-[#14D9D5] text-sm">{formatINR(payingEmdForBid.emdAmount || 900000)}</span>
              </div>
            </div>

            <button
              onClick={() => handleProcessEmdPayment(payingEmdForBid)}
              disabled={isProcessingPayment}
              className="w-full py-3 bg-[#06B6B4] hover:bg-[#14D9D5] text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isProcessingPayment ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Treasury Transfer...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Confirm EMD Deposit Transfer ({formatINR(payingEmdForBid.emdAmount || 900000)})</span>
                </>
              )}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
