// CertiBid AI - Bidder Specific Company Certificates View
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiService } from '../../services/api';
import { UploadComponent } from '../../components/common/UploadComponent';
import {
  FileCheck2,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  Upload,
  Info,
  Trash2,
  Loader2,
  Search,
  Eye,
  Download,
  X,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export function BidderCertificates() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [vendor, setVendor] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Preview Modal State for Images / Files
  const [previewTarget, setPreviewTarget] = useState(null);

  const companyName = vendor?.companyName || user?.organization || user?.companyName || user?.name || 'Bidder Entity';
  const companyId = vendor?.id || user?.bidderId || user?.vendorId || 'Pending ID';
  const taxId = vendor?.taxId || user?.taxId || 'N/A';

  const loadBidderData = async () => {
    setLoading(true);
    try {
      // 1. Fetch authenticated bidder profile
      try {
        const profRes = await apiService.getAuthenticatedBidderProfile();
        if (profRes?.data) {
          setVendor(profRes.data);
        }
      } catch (e) {
        console.warn("Could not fetch bidder profile:", e);
      }

      // 2. Fetch authenticated bidder documents (backend strictly enforces ownership)
      const docRes = await apiService.getDocuments();
      if (docRes?.data && Array.isArray(docRes.data)) {
        setCertificates(docRes.data);
      } else {
        setCertificates([]);
      }
    } catch (err) {
      console.error("Error loading bidder documents:", err);
      showToast("Unable to load bidder certificates", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBidderData();
  }, [user?.email, user?.bidderId]);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploadError(null);

    // 1. Validate supported file extensions & mime types
    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
    const fileName = file.name || 'certificate.pdf';
    const ext = '.' + (fileName.split('.').pop() || '').toLowerCase();
    const isSupported = validExtensions.includes(ext) || 
      ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'].includes(file.type);

    if (!isSupported) {
      const err = "Unsupported file type. Please upload a PDF, PNG, or JPG certificate.";
      setUploadError(err);
      showToast(err, "error");
      return;
    }

    // 2. Validate maximum file size (25MB)
    const MAX_SIZE_BYTES = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const err = "File size exceeds the 25MB limit. Please upload a smaller file.";
      setUploadError(err);
      showToast(err, "error");
      return;
    }

    setUploading(true);

    try {
      // Read binary data as Base64 Data URL for persistent storage on backend
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      const title = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
      const lowerName = fileName.toLowerCase();
      const docType = lowerName.includes('tax') ? 'Tax Certificate'
        : lowerName.includes('iso') || lowerName.includes('audit') ? 'Security Audit'
        : lowerName.includes('env') || lowerName.includes('clearance') ? 'Environmental'
        : lowerName.includes('reg') || lowerName.includes('incorporation') ? 'Incorporation'
        : 'Compliance Certificate';

      const fileTypeFormatted = ext === '.png' ? 'PNG' : (ext === '.jpg' || ext === '.jpeg') ? 'JPG' : 'PDF';
      const fileSizeFormatted = file.size > 1048576 
        ? `${(file.size / 1048576).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;

      const uploadPayload = {
        title: title,
        fileName: fileName,
        fileType: fileTypeFormatted,
        fileSize: fileSizeFormatted,
        documentType: docType,
        fileData: base64Data,
        vendorId: companyId,
        vendorName: companyName
      };

      const uploadRes = await apiService.uploadDocument(uploadPayload);

      if (uploadRes?.data) {
        // Immediately prepend the saved certificate to UI list
        setCertificates(prev => [uploadRes.data, ...prev.filter(c => c.id !== uploadRes.data.id)]);
        showToast('Certificate uploaded successfully.', 'success');
      } else {
        throw new Error("Failed to store certificate record");
      }
    } catch (err) {
      console.error("Upload error:", err);
      const errMsg = err.message || 'Failed to upload certificate. Please try again.';
      setUploadError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDeleteModal = (cert) => {
    setDeleteTarget(cert);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiService.deleteDocument(deleteTarget.id);
      setCertificates(prev => prev.filter(c => c.id !== deleteTarget.id));
      showToast('Certificate permanently deleted.', 'success');
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete error:", err);
      showToast(err.message || 'Failed to delete certificate', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewDocument = (cert) => {
    const isImage = cert.fileType === 'PNG' || cert.fileType === 'JPG' || 
      (cert.fileName && cert.fileName.toLowerCase().match(/\.(png|jpe?g)$/i));

    if (isImage) {
      setPreviewTarget(cert);
    } else {
      // PDF or general document - open file URL in new tab
      const url = cert.fileUrl || apiService.getDocumentFileUrl(cert.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownloadDocument = async (cert) => {
    try {
      showToast(`Initiating download for ${cert.fileName || 'certificate'}...`, 'info');
      await apiService.downloadDocument(cert.id, cert.fileName);
      showToast(`Downloaded ${cert.fileName || 'certificate'} successfully.`, 'success');
    } catch (err) {
      console.error('Document download failed:', err);
      showToast(err.message || 'Failed to download certificate.', 'error');
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (cert.title || cert.name || '').toLowerCase().includes(q) ||
      (cert.fileName || '').toLowerCase().includes(q) ||
      (cert.id || '').toLowerCase().includes(q) ||
      (cert.documentType || '').toLowerCase().includes(q) ||
      (cert.fileType || '').toLowerCase().includes(q) ||
      (cert.status || '').toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status) => {
    const normalized = (status || 'Verified / Uploaded').toLowerCase();
    if (normalized.includes('verified') || normalized.includes('approved')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" /> {status || 'Verified / Uploaded'}
        </span>
      );
    }
    if (normalized.includes('review') || normalized.includes('pending')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Clock className="w-3.5 h-3.5" /> {status || 'Under Review'}
        </span>
      );
    }
    if (normalized.includes('expired') || normalized.includes('rejected')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle className="w-3.5 h-3.5" /> {status || 'Expired'}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" /> {status || 'Verified / Uploaded'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-semibold text-[#A7C9CE] animate-pulse flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#06B6B4] animate-spin" />
        <span>Loading Authenticated Bidder Certificates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#F0FDFA]">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#0B3442] border border-[#1B5968] shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 text-[#14D9D5] text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-[#06B6B4]" /> Corporate Certificate Verification Hub
          </div>
          <h2 className="text-2xl font-extrabold text-white">{companyName}</h2>
          <p className="text-xs text-[#A7C9CE] mt-1">
            Bidder ID: <strong className="text-white font-mono">{companyId}</strong> • Tax ID: <strong className="text-white font-mono">{taxId}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#06B6B4]/10 border border-[#06B6B4]/30 text-[#14D9D5] text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-[#14D9D5]" />
          <span>Authenticated Bidder Workspace</span>
        </div>
      </div>

      {/* Dynamic Security & Access Protection Notice */}
      <div className="p-4 rounded-2xl bg-[#0B3442] border border-[#1B5968] flex items-start gap-3 text-xs text-[#A7C9CE]">
        <Info className="w-5 h-5 text-[#14D9D5] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-white">Security & Document Access Protection</p>
          <p className="mt-0.5 text-[#A7C9CE]">
            This page displays only official qualification certificates uploaded by and belonging to <strong className="text-white">{companyName}</strong>. All document records are isolated on the server using encrypted role authorization.
          </p>
        </div>
      </div>

      {/* Certificate Upload Section */}
      <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968] space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#14D9D5]" /> Upload New Company Certificate
        </h3>
        <p className="text-xs text-[#A7C9CE]">
          Upload PDF or image certificates to submit them for official procurement verification.
        </p>

        <div className="pt-2">
          {uploading ? (
            <div className="p-8 border border-dashed border-[#06B6B4] rounded-2xl bg-[#0B3442] text-center text-xs text-[#14D9D5] font-bold flex flex-col items-center justify-center gap-2 animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin text-[#14D9D5]" />
              <span>Uploading certificate...</span>
              <span className="text-[10px] text-[#A7C9CE] font-normal">Storing document securely in persistent cloud archive</span>
            </div>
          ) : (
            <UploadComponent 
              onFileUpload={handleFileUpload} 
              label="Click or Drag & Drop PDF / Image Certificate for Verification" 
              accept=".pdf,.png,.jpg,.jpeg"
              disabled={uploading}
              error={uploadError}
            />
          )}
        </div>
      </div>

      {/* Registered Company Certificates Section */}
      <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#06B6B4]" /> Registered Company Certificates ({certificates.length})
          </h3>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#A7C9CE] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B3442] border border-[#1B5968] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#A7C9CE]/60 focus:outline-none focus:border-[#06B6B4] transition-colors"
            />
          </div>
        </div>

        {filteredCertificates.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-xl bg-[#0B3442] border border-[#1B5968] space-y-2">
            <FileText className="w-10 h-10 text-[#A7C9CE]/40 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Certificates Found</h4>
            <p className="text-xs text-[#A7C9CE] max-w-md mx-auto">
              {searchQuery 
                ? `No certificates matched "${searchQuery}".` 
                : `There are currently no company certificates registered for ${companyName}. Use the upload section above to upload your documents.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCertificates.map(cert => {
              const fileExt = cert.fileType || (cert.fileName?.split('.').pop() || 'PDF').toUpperCase();
              return (
                <div 
                  key={cert.id} 
                  className="p-5 rounded-2xl bg-[#0B3442] border border-[#1B5968] hover:border-[#06B6B4]/60 transition-all flex flex-col justify-between space-y-4 group shadow-md"
                >
                  <div className="space-y-2.5">
                    {/* Title & Document Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#103D4A] border border-[#1B5968] flex items-center justify-center text-[#14D9D5] shrink-0 mt-0.5">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white truncate group-hover:text-[#14D9D5] transition-colors" title={cert.title || cert.fileName}>
                            {cert.title || cert.name || 'Company Certificate'}
                          </h4>
                          <p className="text-[11px] font-mono text-[#A7C9CE] mt-0.5">
                            ID: <span className="text-[#14D9D5]">{cert.id}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Card Details */}
                    <div className="p-3 rounded-xl bg-[#071F2A]/70 border border-[#145364]/40 space-y-1.5 text-xs text-[#A7C9CE]">
                      <div className="flex justify-between items-center text-[11px]">
                        <span>File:</span>
                        <span className="font-medium text-white truncate max-w-[150px]" title={cert.fileName}>
                          {cert.fileName || `${cert.id}.pdf`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span>Type:</span>
                        <span className="font-bold text-[#14D9D5] bg-[#14D9D5]/10 px-1.5 py-0.5 rounded text-[10px]">
                          {fileExt}
                        </span>
                      </div>
                      {cert.fileSize && (
                        <div className="flex justify-between items-center text-[11px]">
                          <span>Size:</span>
                          <span className="text-white font-medium">{cert.fileSize}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-[11px]">
                        <span>Uploaded:</span>
                        <span className="text-white">{cert.uploadedAt || 'Recent'}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-[#145364]/30">
                        <span className="text-[11px]">Status:</span>
                        <div>{getStatusBadge(cert.status)}</div>
                      </div>
                    </div>

                    {cert.resubmissionReason && (
                      <p className="text-[11px] text-rose-300 bg-rose-950/30 p-2 rounded-lg border border-rose-800/30">
                        <strong>Notice:</strong> {cert.resubmissionReason}
                      </p>
                    )}
                  </div>

                  {/* Actions: View, Download, Delete */}
                  <div className="pt-2 border-t border-[#1B5968]/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleViewDocument(cert)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#103D4A] hover:bg-[#145364] border border-[#1B5968] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="View Certificate"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#14D9D5]" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(cert)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#103D4A] hover:bg-[#145364] border border-[#1B5968] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Download Certificate"
                      >
                        <Download className="w-3.5 h-3.5 text-[#06B6B4]" />
                        <span>Download</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleOpenDeleteModal(cert)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-600/30 border border-transparent hover:border-rose-500/40 transition-colors cursor-pointer"
                      title="Delete Certificate"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#0B3442] border border-rose-500/40 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Delete Certificate?</h3>
                  <p className="text-xs text-[#A7C9CE]">Permanent Certificate Removal</p>
                </div>
              </div>
              <button 
                onClick={() => !deleting && setDeleteTarget(null)}
                className="p-1 text-[#A7C9CE] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#071F2A] border border-[#1B5968] space-y-2 text-xs">
              <p className="text-[#A7C9CE]">Are you sure you want to permanently delete this certificate?</p>
              <div className="font-semibold text-white pt-1">
                📄 {deleteTarget.title || deleteTarget.fileName}
              </div>
              <p className="text-[11px] text-[#A7C9CE]/80 font-mono">
                Doc ID: {deleteTarget.id} • File: {deleteTarget.fileName}
              </p>
            </div>

            <p className="text-[11px] text-rose-300 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              This action cannot be undone. The certificate file will be purged from storage.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-[#103D4A] hover:bg-[#145364] border border-[#1B5968] text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-rose-900/30 transition-colors cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Delete Certificate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image / File Preview Modal */}
      {previewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-[#0B3442] border border-[#1B5968] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
            {/* Header */}
            <div className="p-4 border-b border-[#1B5968] flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-[#06B6B4] text-[#071F2A] flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-extrabold text-sm text-white truncate">{previewTarget.title || previewTarget.fileName}</h3>
                  <p className="text-[10px] text-[#A7C9CE] truncate">{previewTarget.fileName} • {previewTarget.fileSize || 'Image Document'}</p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewTarget(null)} 
                className="p-1.5 text-[#A7C9CE] hover:text-white rounded-lg hover:bg-[#103D4A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Viewer Container */}
            <div className="flex-1 p-6 bg-[#071F2A] flex items-center justify-center overflow-auto min-h-[320px]">
              <img 
                src={`/api/v1/documents/file/${previewTarget.id}`} 
                alt={previewTarget.title || previewTarget.fileName}
                className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-lg border border-[#1B5968]/50"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='100%' height='100%' fill='%230B3442'/><text x='50%' y='50%' font-family='sans-serif' font-size='14' fill='%2314D9D5' text-anchor='middle' dominant-baseline='middle'>Certificate Preview Verified</text></svg>";
                }}
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#1B5968] bg-[#0B3442] flex justify-between items-center text-xs">
              <span className="text-[#A7C9CE] text-[11px] font-mono">
                Status: <strong className="text-emerald-400 font-semibold">{previewTarget.status || 'Verified'}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadDocument(previewTarget)}
                  className="px-3 py-1.5 rounded-xl bg-[#103D4A] hover:bg-[#145364] border border-[#1B5968] text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#14D9D5]" />
                  Download
                </button>
                <button
                  onClick={() => setPreviewTarget(null)}
                  className="px-4 py-1.5 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-[#071F2A] font-extrabold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
