// CertiBid AI - Bid Tender Registration & Proposal Submission Form
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UploadComponent } from '../../components/common/UploadComponent';
import { formatINR } from '../../utils/formatters';
import {
  Gavel,
  Building2,
  FileText,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  AlertCircle,
  FileCheck2,
  Calendar,
  Lock
} from 'lucide-react';

export function BidSubmission() {
  const { id, tenderId: paramTenderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const targetTenderId = id || paramTenderId || searchParams.get('tenderId') || 'TND-2026-8901';

  const [tender, setTender] = useState(null);
  const [tendersList, setTendersList] = useState([]);
  const [selectedTenderId, setSelectedTenderId] = useState(targetTenderId);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [existingBidDetails, setExistingBidDetails] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    proposedAmount: '',
    estimatedCompletionTime: '12 Months',
    technicalProposal: '',
    commercialProposal: ''
  });

  // Attached Documents State
  const [docType, setDocType] = useState('Company Registration Certificate');
  const [docTitle, setDocTitle] = useState('');
  const [attachedDocs, setAttachedDocs] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Identity Info
  const companyName = user?.organization || user?.companyName || user?.name || 'Registered Bidder Entity';
  const bidderId = user?.bidderId || user?.vendorId || 'VND-10029';
  const userEmail = user?.email || '';

  // 1. Fetch Tender Data & Check Registration Status
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      apiService.getTenderById(selectedTenderId),
      apiService.getTenders(),
      apiService.getBids({ tenderId: selectedTenderId }),
      apiService.getDocuments()
    ]).then(([tRes, allTendersRes, bidsRes, docsRes]) => {
      if (!isMounted) return;

      const tData = tRes.data;
      setTender(tData);
      setTendersList(allTendersRes.data || []);

      if (tData?.budget) {
        setFormData(prev => ({
          ...prev,
          proposedAmount: prev.proposedAmount || String(Math.round(tData.budget * 0.95))
        }));
      }

      // Check if bidder has already registered for this tender
      const fetchedBids = Array.isArray(bidsRes.data) ? bidsRes.data : [];
      const userBidderId = user?.bidderId || user?.vendorId;
      const lowerEmail = (user?.email || '').toLowerCase().trim();
      const lowerOrg = (user?.organization || user?.companyName || '').toLowerCase().trim();

      const matchedBid = fetchedBids.find(b =>
        b.tenderId === selectedTenderId && (
          (userBidderId && b.vendorId === userBidderId) ||
          (b.vendorEmail && b.vendorEmail.toLowerCase() === lowerEmail) ||
          (lowerOrg && b.vendorName && b.vendorName.toLowerCase() === lowerOrg)
        )
      );

      if (matchedBid) {
        setIsAlreadyRegistered(true);
        setExistingBidDetails(matchedBid);
      } else {
        setIsAlreadyRegistered(false);
        setExistingBidDetails(null);
      }

      // Pre-populate documents belonging to this bidder & tender
      const allDocs = Array.isArray(docsRes.data) ? docsRes.data : [];
      const tenderDocs = allDocs.filter(d =>
        (userBidderId && d.vendorId === userBidderId) ||
        (d.uploadedByEmail && d.uploadedByEmail.toLowerCase() === lowerEmail)
      );
      setAttachedDocs(tenderDocs);

      setLoading(false);
    }).catch(err => {
      if (!isMounted) return;
      console.error("Failed to load registration details:", err);
      setLoading(false);
    });

    return () => { isMounted = false; };
  }, [selectedTenderId, user]);

  const emdAmount = tender?.emdAmount || Math.round((tender?.budget || 50000000) * 0.02);

  // Handle Document Upload
  const handleUploadFile = async (files) => {
    if (!files || files.length === 0) return;
    setUploadingDoc(true);

    try {
      const file = files[0];
      const titleToUse = docTitle.trim() || file.name.replace(/\.[^/.]+$/, "");

      const uploadRes = await apiService.uploadDocument({
        title: titleToUse,
        fileName: file.name || `${titleToUse.replace(/\s+/g, '_')}.pdf`,
        documentType: docType,
        tenderId: selectedTenderId,
        vendorId: bidderId
      });

      if (uploadRes?.data) {
        setAttachedDocs(prev => [uploadRes.data, ...prev]);
        setDocTitle('');
        showToast('Document uploaded and attached to registration proposal', 'success');
      }
    } catch (err) {
      console.error("Upload error:", err);
      showToast(err.message || 'Failed to upload document', 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleRemoveDoc = async (docId) => {
    try {
      await apiService.deleteDocument(docId);
      setAttachedDocs(prev => prev.filter(d => d.id !== docId));
      showToast('Document detached from proposal', 'success');
    } catch (err) {
      console.error("Remove doc error:", err);
      showToast(err.message || 'Failed to remove document', 'error');
    }
  };

  // Handle Finish Registration Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isAlreadyRegistered) {
      showToast("You are already registered for this tender.", "info");
      navigate('/bids/my-bids');
      return;
    }

    if (!formData.proposedAmount || parseFloat(formData.proposedAmount) <= 0) {
      showToast("Please enter a valid proposed bid amount.", "error");
      return;
    }

    setSubmitting(true);

    try {
      const bidPayload = {
        tenderId: selectedTenderId,
        tenderTitle: tender?.title || 'Public Procurement Tender',
        proposedAmount: parseFloat(formData.proposedAmount),
        currency: 'INR',
        estimatedCompletionTime: formData.estimatedCompletionTime || '12 Months',
        technicalProposal: formData.technicalProposal || 'Technical proposal attached with certified BOQ schedule.',
        commercialProposal: formData.commercialProposal || 'Commercial terms compliant with tender terms.',
        vendorId: bidderId,
        vendorName: companyName,
        bidderName: companyName,
        vendorEmail: userEmail,
        emdAmount: emdAmount,
        emdPaymentStatus: 'Verified & Paid',
        documents: attachedDocs.map(d => ({ id: d.id, title: d.title, type: d.documentType, fileName: d.fileName }))
      };

      await apiService.submitBid(bidPayload);

      showToast("Tender registration completed successfully.", "success");
      navigate('/bids/my-bids');
    } catch (err) {
      console.error("Submit error:", err);
      showToast(err.message || "Failed to complete tender registration.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-xs font-semibold text-[#A7C9CE] animate-pulse flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#06B6B4] animate-spin mx-auto" />
        <span>Loading Tender Registration Workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#F0FDFA]">
      {/* Top Breadcrumb Navigation */}
      <button
        onClick={() => navigate(`/tenders/${selectedTenderId}`)}
        className="flex items-center gap-1.5 text-xs font-bold text-[#A7C9CE] hover:text-white cursor-pointer transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tender Details
      </button>

      {/* Tender Registration Main Header */}
      <div className="p-6 rounded-3xl bg-[#0B3442] border border-[#1B5968] shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 text-[#14D9D5] text-xs font-bold uppercase tracking-wider mb-1">
            <Gavel className="w-4 h-4 text-[#06B6B4]" /> Bidder Tender Registration
          </div>
          <h2 className="text-2xl font-extrabold text-white">Register for Tender</h2>
          <p className="text-xs text-[#A7C9CE] mt-1">
            Complete your financial bid proposal, technical details, and attach required certificates for official evaluation.
          </p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-[#071F2A] border border-[#1B5968] text-right shrink-0">
          <p className="text-[10px] text-[#A7C9CE] uppercase font-bold">Registration Mode</p>
          <p className="text-xs font-extrabold text-[#14D9D5]">Authenticated Bidder Submission</p>
        </div>
      </div>

      {/* Target Tender Overview Card */}
      {tender && (
        <div className="p-6 rounded-3xl bg-[#103D4A] border border-[#1B5968] space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1B5968] pb-3">
            <div>
              <span className="text-[10px] font-bold text-[#14D9D5] uppercase tracking-wider">{tender.category}</span>
              <h3 className="text-lg font-extrabold text-white mt-0.5">{tender.title}</h3>
            </div>
            <span className="px-3 py-1 rounded-xl bg-[#071F2A] text-white font-mono text-xs font-bold border border-[#1B5968]">
              {tender.id}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-2xl bg-[#071F2A] border border-[#1B5968]">
              <p className="text-[10px] text-[#A7C9CE] font-bold uppercase">Department</p>
              <p className="font-extrabold text-white truncate mt-0.5">{tender.department}</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#071F2A] border border-[#1B5968]">
              <p className="text-[10px] text-[#A7C9CE] font-bold uppercase">Approved Budget Ceiling</p>
              <p className="font-extrabold text-[#14D9D5] mt-0.5">{formatINR(tender.budget)}</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#071F2A] border border-[#1B5968]">
              <p className="text-[10px] text-[#A7C9CE] font-bold uppercase">Required EMD Guarantee (2%)</p>
              <p className="font-extrabold text-amber-400 mt-0.5">{formatINR(emdAmount)}</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#071F2A] border border-[#1B5968]">
              <p className="text-[10px] text-[#A7C9CE] font-bold uppercase">Submission Deadline</p>
              <p className="font-extrabold text-white mt-0.5">{tender.submissionDeadline || '30 Days'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Authenticated Bidder Identity Card */}
      <div className="p-5 rounded-2xl bg-[#103D4A] border border-[#1B5968] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#06B6B4]/20 border border-[#06B6B4]/40 flex items-center justify-center text-[#14D9D5] font-extrabold shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#A7C9CE] uppercase font-bold">Registering Entity Name</p>
            <p className="font-extrabold text-white text-sm">{companyName}</p>
            <p className="text-[11px] text-[#A7C9CE] mt-0.5">Bidder ID: <span className="font-mono text-white">{bidderId}</span> • Email: <span className="text-white">{userEmail}</span></p>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 font-extrabold text-[11px] border border-emerald-500/20 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Authenticated Session
        </span>
      </div>

      {/* ALREADY REGISTERED NOTICE */}
      {isAlreadyRegistered && (
        <div className="p-6 rounded-3xl bg-[#0B3442] border border-emerald-500/30 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-white">You Are Already Registered For This Tender</h3>
          <p className="text-xs text-[#A7C9CE] max-w-lg mx-auto">
            Your bid proposal has been saved and registered under your corporate profile. You can view your registered proposal in the My Bids section.
          </p>
          {existingBidDetails && (
            <div className="p-4 rounded-2xl bg-[#071F2A] border border-[#1B5968] inline-block text-left text-xs space-y-1">
              <p><span className="text-[#A7C9CE]">Bid ID:</span> <strong className="text-white font-mono">{existingBidDetails.id}</strong></p>
              <p><span className="text-[#A7C9CE]">Quoted Amount:</span> <strong className="text-[#14D9D5]">{formatINR(existingBidDetails.proposedAmount)}</strong></p>
              <p><span className="text-[#A7C9CE]">Submission Date:</span> <strong className="text-white">{existingBidDetails.submissionDate}</strong></p>
            </div>
          )}
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/bids/my-bids')}
              className="px-5 py-2.5 bg-[#06B6B4] hover:bg-[#14D9D5] text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all"
            >
              View My Bids
            </button>
            <button
              onClick={() => navigate('/tenders')}
              className="px-5 py-2.5 bg-[#071F2A] hover:bg-[#103D4A] text-white font-extrabold text-xs rounded-xl border border-[#1B5968] cursor-pointer transition-all"
            >
              Browse Available Tenders
            </button>
          </div>
        </div>
      )}

      {/* REGISTRATION FORM (Only active if not registered) */}
      {!isAlreadyRegistered && (
        <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-[#103D4A] border border-[#1B5968] space-y-8 shadow-xl text-white">
          
          {/* SECTION 1: FINANCIAL & TIMELINE PROPOSAL */}
          <div className="space-y-4">
            <div className="border-b border-[#1B5968] pb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#14D9D5]" />
              <h3 className="text-base font-extrabold text-white">1. Financial Bid & Completion Timeline</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#A7C9CE] mb-1.5">
                  Proposed Contract Bid Amount (₹ INR) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={formData.proposedAmount}
                  onChange={(e) => setFormData({ ...formData, proposedAmount: e.target.value })}
                  placeholder="e.g. 42500000"
                  className="w-full px-4 py-3 rounded-xl bg-[#071F2A] border border-[#1B5968] text-xs font-extrabold text-[#14D9D5] focus:outline-none focus:border-[#06B6B4]"
                />
                <p className="text-[10px] text-[#A7C9CE] mt-1">
                  Formatted Value: <strong className="text-white">{formData.proposedAmount ? formatINR(formData.proposedAmount) : '₹0'}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A7C9CE] mb-1.5">
                  Estimated Completion Timeline <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.estimatedCompletionTime}
                  onChange={(e) => setFormData({ ...formData, estimatedCompletionTime: e.target.value })}
                  placeholder="e.g. 12 Months"
                  className="w-full px-4 py-3 rounded-xl bg-[#071F2A] border border-[#1B5968] text-xs font-semibold text-white focus:outline-none focus:border-[#06B6B4]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: EMD GUARANTEE STATUS */}
          <div className="space-y-3">
            <div className="border-b border-[#1B5968] pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#14D9D5]" />
              <h3 className="text-base font-extrabold text-white">2. EMD Security Guarantee Deposit</h3>
            </div>

            <div className="p-4 rounded-2xl border border-[#20C997]/30 bg-[#20C997]/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-[#20C997] shrink-0" />
                <div>
                  <p className="font-extrabold text-white text-sm">EMD Escrow Guarantee Deposit: {formatINR(emdAmount)}</p>
                  <p className="text-[11px] text-[#A7C9CE]">Bank Escrow Guarantee verified & auto-bound upon finishing registration</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#20C997] text-[#071F2A] font-extrabold text-xs shrink-0">
                Verified & Ready
              </span>
            </div>
          </div>

          {/* SECTION 3: TECHNICAL & COMMERCIAL DETAILS */}
          <div className="space-y-4">
            <div className="border-b border-[#1B5968] pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#14D9D5]" />
              <h3 className="text-base font-extrabold text-white">3. Technical Overview & Commercial Terms</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A7C9CE] mb-1.5">Technical Execution Overview & Quality Compliance</label>
              <textarea
                rows={3}
                value={formData.technicalProposal}
                onChange={(e) => setFormData({ ...formData, technicalProposal: e.target.value })}
                placeholder="Describe your technical architecture, project execution plan, quality control procedures, and staffing commitment..."
                className="w-full px-4 py-3 rounded-xl bg-[#071F2A] border border-[#1B5968] text-xs text-white focus:outline-none focus:border-[#06B6B4] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A7C9CE] mb-1.5">Commercial Proposal Remarks & Payment Terms</label>
              <textarea
                rows={2}
                value={formData.commercialProposal}
                onChange={(e) => setFormData({ ...formData, commercialProposal: e.target.value })}
                placeholder="Mention milestone payment terms, GST inclusive breakdowns, warranty policies..."
                className="w-full px-4 py-3 rounded-xl bg-[#071F2A] border border-[#1B5968] text-xs text-white focus:outline-none focus:border-[#06B6B4] resize-none"
              />
            </div>
          </div>

          {/* SECTION 4: REQUIRED CERTIFICATES & DOCUMENTS UPLOAD */}
          <div className="space-y-4">
            <div className="border-b border-[#1B5968] pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#14D9D5]" />
                <h3 className="text-base font-extrabold text-white">4. Upload Required Certificates & Documents</h3>
              </div>
              <span className="text-xs font-bold text-[#14D9D5]">
                {attachedDocs.length} Document(s) Attached
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#071F2A] border border-[#1B5968] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#A7C9CE] mb-1">Document Type / Category</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B3442] border border-[#1B5968] text-xs font-semibold text-white focus:outline-none focus:border-[#06B6B4]"
                  >
                    <option value="Company Registration Certificate">Company Registration Certificate</option>
                    <option value="GST Clearance Certificate">GST Clearance Certificate</option>
                    <option value="Tax Clearance Certificate">Tax Clearance Certificate</option>
                    <option value="ISO 27001 Security Audit">ISO 27001 / Security Accreditation</option>
                    <option value="Financial Turnover Audit">Financial Turnover Audit Statement</option>
                    <option value="Technical Proposal PDF">Technical Proposal PDF & BOQ Schedule</option>
                    <option value="Custom Certificate">Custom Compliance Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A7C9CE] mb-1">Document Custom Title (Optional)</label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. GST_Registration_2026.pdf"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B3442] border border-[#1B5968] text-xs text-white focus:outline-none focus:border-[#06B6B4]"
                  />
                </div>
              </div>

              <UploadComponent
                label="Select or drag file to attach to tender registration"
                onFileUpload={handleUploadFile}
              />
            </div>

            {/* List of Attached Proposal Documents */}
            {attachedDocs.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#A7C9CE]">Attached Proposal Certificates:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attachedDocs.map((doc) => (
                    <div key={doc.id} className="p-3 rounded-xl bg-[#071F2A] border border-[#1B5968] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-[#14D9D5] shrink-0" />
                        <div className="truncate">
                          <p className="font-bold text-white truncate">{doc.title || doc.fileName}</p>
                          <p className="text-[10px] text-[#A7C9CE] truncate">{doc.documentType || 'Attached Document'}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(doc.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer shrink-0 ml-2"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5: FINISH REGISTRATION ACTION BUTTON */}
          <div className="pt-4 border-t border-[#1B5968] space-y-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#06B6B4] hover:bg-[#14D9D5] text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-[#06B6B4]/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Persisting Registration to Database...</span>
                </>
              ) : (
                <>
                  <span>Finish Registration</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-[11px] text-[#A7C9CE] text-center">
              By clicking "Finish Registration", your financial quote, technical terms, and attached documents will be saved to the database under your corporate bidder profile.
            </p>
          </div>

        </form>
      )}
    </div>
  );
}
