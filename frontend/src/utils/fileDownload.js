// CertiBid AI - Universal Browser File Download Utility
// Triggers real, native browser file downloads directly to the user's Downloads folder

/**
 * Retrieves authentication headers for API file download requests
 */
function getAuthHeaders() {
  const headers = {};
  try {
    const savedUserStr = localStorage.getItem('certibid_user');
    if (savedUserStr) {
      const user = JSON.parse(savedUserStr);
      if (user.email) headers['X-User-Email'] = user.email;
      if (user.role) headers['X-User-Role'] = user.role;
      if (user.bidderId || user.vendorId) headers['X-Vendor-Id'] = user.bidderId || user.vendorId;
    }
    const token = localStorage.getItem('certibid_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn('Could not read auth info for download headers', e);
  }
  return headers;
}

/**
 * Triggers a real browser download from a Blob or raw data
 * @param {Blob|string} data - Blob or string content to download
 * @param {string} filename - Desired filename for the downloaded file
 * @param {string} mimeType - Optional MIME type for string content
 */
export function triggerBrowserBlobDownload(data, filename = 'download.pdf', mimeType = 'application/pdf') {
  try {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 150);
    return true;
  } catch (err) {
    console.error('Browser blob download failed:', err);
    throw err;
  }
}

/**
 * Downloads a file from an authenticated API endpoint and saves it locally
 * @param {string} url - API endpoint URL
 * @param {string} defaultFilename - Fallback filename if server doesn't provide one
 */
export async function downloadFileFromApi(url, defaultFilename = 'document.pdf') {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      let errorMessage = `Download failed with status ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson?.message || errorJson?.error) {
          errorMessage = errorJson.message || errorJson.error;
        }
      } catch (e) {}
      throw new Error(errorMessage);
    }

    // Attempt to extract filename from Content-Disposition header
    let filename = defaultFilename;
    const disposition = response.headers.get('Content-Disposition') || response.headers.get('content-disposition');
    if (disposition) {
      const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
      const standardMatch = disposition.match(/filename="?([^";]+)"?/i);
      if (utf8Match && utf8Match[1]) {
        filename = decodeURIComponent(utf8Match[1]);
      } else if (standardMatch && standardMatch[1]) {
        filename = standardMatch[1];
      }
    }

    const blob = await response.blob();
    triggerBrowserBlobDownload(blob, filename, blob.type);
    return { success: true, filename };
  } catch (err) {
    console.error(`Error downloading file from ${url}:`, err);
    throw err;
  }
}

/**
 * Downloads a company certificate by document ID
 */
export async function downloadCertificate(docId, originalFileName) {
  const safeFilename = originalFileName || `certificate_${docId}.pdf`;
  return await downloadFileFromApi(`/api/files/${docId}/download`, safeFilename);
}

/**
 * Downloads an official contract award certificate PDF
 */
export async function downloadAwardCertificate(tenderId, fileName) {
  const safeFilename = fileName || `award_certificate_${tenderId}.pdf`;
  return await downloadFileFromApi(`/api/files/award/${tenderId}/download`, safeFilename);
}

/**
 * Downloads tender notice / technical specifications PDF
 */
export async function downloadTenderDoc(tenderId, tenderTitle) {
  const sanitizedTitle = (tenderTitle || 'specifications').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  const safeFilename = `tender_${tenderId}_${sanitizedTitle}.pdf`;
  return await downloadFileFromApi(`/api/files/tender/${tenderId}/download`, safeFilename);
}

/**
 * Downloads a submitted bid proposal document PDF
 */
export async function downloadBidProposal(bidId, bidderName) {
  const sanitizedName = (bidderName || 'proposal').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  const safeFilename = `bid_${bidId}_${sanitizedName}.pdf`;
  return await downloadFileFromApi(`/api/files/bid/${bidId}/download`, safeFilename);
}

/**
 * Downloads a treasury EMD transaction receipt PDF
 */
export async function downloadReceiptPdf(receiptOrTxnId) {
  const txnId = typeof receiptOrTxnId === 'object' ? receiptOrTxnId.id : receiptOrTxnId;
  const safeFilename = `receipt_${txnId}.pdf`;
  return await downloadFileFromApi(`/api/files/receipt/${txnId}/download`, safeFilename);
}

/**
 * Downloads a statutory report in CSV or PDF format
 */
export async function downloadReport(reportType, format = 'csv') {
  const ext = format.toLowerCase() === 'pdf' ? 'pdf' : 'csv';
  const typeMap = {
    executive: 'CertiBid_Executive_Procurement_Audit_Report',
    full: 'CertiBid_Full_Procurement_Audit_Report',
    annual: 'Annual_Procurement_Audit_Summary_2024',
    risk: 'Vendor_Risk_Collusion_Log',
    emd: 'Treasury_EMD_Ledger_Export'
  };
  const baseName = typeMap[reportType] || `CertiBid_Report_${reportType}`;
  const safeFilename = `${baseName}.${ext}`;
  return await downloadFileFromApi(`/api/files/reports/${reportType}/download?format=${ext}`, safeFilename);
}
