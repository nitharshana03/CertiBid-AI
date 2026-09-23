// CertiBid AI - Axios API Service Client
import axios from 'axios';
import {
  downloadFileFromApi,
  triggerBrowserBlobDownload,
  downloadCertificate,
  downloadAwardCertificate,
  downloadTenderDoc,
  downloadBidProposal,
  downloadReceiptPdf,
  downloadReport
} from '../utils/fileDownload';
import {
  mockTenders,
  mockVendors,
  mockBids,
  mockRiskAnalyses,
  mockUsers,
  mockDocuments,
  mockTransactions,
  mockAuditLogs,
  mockNotifications
} from './mockData';

// Base Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 5000
});

// Interceptor to add JWT token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('certibid_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Simulated in-memory database state
let tendersState = [...mockTenders];
let vendorsState = [...mockVendors];
let bidsState = [...mockBids];
let riskAnalysesState = { ...mockRiskAnalyses };
let usersState = [...mockUsers];
let documentsState = [...mockDocuments];
let transactionsState = [...mockTransactions];
let auditLogsState = [...mockAuditLogs];
let notificationsState = [...mockNotifications];
let escalationsState = [];

const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  client: apiClient,

  // --- TENDERS ---
  async getTenders(params = {}) {
    try {
      const res = await apiClient.get('/tenders', { params });
      if (res.data && Array.isArray(res.data)) return { data: res.data, status: res.status };
    } catch (e) {
      // Graceful fallback to mock data
    }
    await delay();
    let result = [...tendersState];
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }
    if (params.status && params.status !== 'All') {
      result = result.filter(t => t.status.toLowerCase() === params.status.toLowerCase());
    }
    if (params.riskLevel && params.riskLevel !== 'All') {
      result = result.filter(t => t.riskLevel.toLowerCase() === params.riskLevel.toLowerCase());
    }
    return { data: result, status: 200 };
  },

  async getTenderById(id) {
    try {
      const res = await apiClient.get(`/tenders/${id}`);
      if (res.data && typeof res.data === 'object' && !Array.isArray(res.data) && res.data.id) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay();
    const tender = tendersState.find(t => t.id === id);
    if (!tender) throw new Error('Tender not found');
    return { data: tender, status: 200 };
  },

  async createTender(tenderData) {
    try {
      const res = await apiClient.post('/tenders', tenderData);
      if (res.data && typeof res.data === 'object' && res.data.id) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay();
    const newTender = {
      id: `TND-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      publishingDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      riskLevel: 'Low',
      aiRiskScore: Math.floor(Math.random() * 25),
      eligibleVendorsCount: 12,
      bidsCount: 0,
      documents: [],
      ...tenderData
    };
    tendersState = [newTender, ...tendersState];
    return { data: newTender, status: 201 };
  },

  async updateTender(id, updates) {
    try {
      const res = await apiClient.put(`/tenders/${id}`, updates);
      if (res.data && typeof res.data === 'object' && res.data.id) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay();
    tendersState = tendersState.map(t => t.id === id ? { ...t, ...updates } : t);
    return { data: tendersState.find(t => t.id === id), status: 200 };
  },

  async getTenderBidders(tenderId) {
    try {
      const savedUserStr = localStorage.getItem('certibid_user');
      let user = null;
      if (savedUserStr) {
        try { user = JSON.parse(savedUserStr); } catch (e) {}
      }
      const headers = {};
      if (user?.email) headers['X-User-Email'] = user.email;
      if (user?.role) headers['X-User-Role'] = user.role;

      const res = await apiClient.get(`/tenders/${tenderId}/bidders`, { headers });
      if (res.data && res.data.tenderId && Array.isArray(res.data.bidders)) {
        return { data: res.data, status: res.status };
      }
    } catch (e) {
      if (e.response && (e.response.status === 403 || e.response.status === 404)) {
        throw e;
      }
    }

    await delay();

    const tender = tendersState.find(t => t.id === tenderId);
    if (!tender) {
      throw new Error(`Tender ${tenderId} not found`);
    }

    // Filter bids strictly for this tenderId only
    const tenderBids = bidsState.filter(b => b.tenderId === tenderId);
    const tenderEscalations = escalationsState.filter(e => e.tenderId === tenderId);

    const bidders = tenderBids.map(b => {
      const vendor = vendorsState.find(v => v.id === b.vendorId || v.companyName === b.vendorName);
      const escalation = tenderEscalations.find(e => e.bidId === b.id);

      return {
        bidderId: b.vendorId,
        companyName: b.vendorName || b.bidderName || (vendor ? vendor.companyName : 'Registered Enterprise'),
        vendorEmail: b.vendorEmail || (vendor ? vendor.email : ''),
        bidId: b.id,
        tenderId: tenderId,
        tenderTitle: tender.title,
        registrationStatus: b.status === 'Registered' ? 'Registered' : 'Submitted',
        bidStatus: b.status,
        proposedAmount: b.proposedAmount || 0,
        aiRiskScore: b.aiRiskScore || 0,
        riskLevel: b.riskLevel || 'Low',
        submissionDate: b.submissionDate || b.submittedAt || new Date().toISOString().split('T')[0],
        isEscalated: !!escalation,
        escalationStatus: escalation ? escalation.status : null,
        escalationId: escalation ? escalation.id : null,
        escalation: escalation || null
      };
    });

    return {
      data: {
        tenderId: tender.id,
        tenderTitle: tender.title,
        department: tender.department,
        budget: tender.budget,
        registeredBiddersCount: bidders.length,
        escalatedBidsCount: bidders.filter(b => b.isEscalated).length,
        bidders: bidders
      },
      status: 200
    };
  },

  // --- VENDORS ---
  async getVendors(params = {}) {
    try {
      const res = await apiClient.get('/vendors', { params });
      if (res.data && Array.isArray(res.data)) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay();
    let result = [...vendorsState];
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(v => v.companyName.toLowerCase().includes(q) || v.id.toLowerCase().includes(q) || v.category.toLowerCase().includes(q));
    }
    return { data: result, status: 200 };
  },

  async getVendorById(id) {
    try {
      const res = await apiClient.get(`/vendors/${id}`);
      if (res.data && typeof res.data === 'object' && !Array.isArray(res.data) && res.data.id) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay();
    const vendor = vendorsState.find(v => v.id === id);
    if (!vendor) throw new Error('Vendor not found');
    return { data: vendor, status: 200 };
  },

  async getAuthenticatedBidderProfile() {
    // 1. Try calling the backend /bidders/me or /vendors/me API endpoint
    try {
      const savedUserStr = localStorage.getItem('certibid_user');
      let userObj = null;
      if (savedUserStr) {
        try { userObj = JSON.parse(savedUserStr); } catch (e) {}
      }

      const headers = {};
      if (userObj?.email) {
        headers['X-User-Email'] = userObj.email;
      }
      if (userObj?.bidderId || userObj?.vendorId) {
        headers['X-Vendor-Id'] = userObj.bidderId || userObj.vendorId;
      }

      const res = await apiClient.get('/bidders/me', { headers });
      if (res.data && res.data.companyName) {
        return { data: res.data, status: res.status };
      }
    } catch (e) {
      // Fallback if backend API call fails
    }

    await delay();

    // 2. Client-side fallback using authenticated user context
    const savedUserStr = localStorage.getItem('certibid_user');
    if (!savedUserStr) {
      throw new Error('No authenticated user session found');
    }

    let user = {};
    try { user = JSON.parse(savedUserStr); } catch(err) {}

    const email = (user.email || '').toLowerCase().trim();
    const bidderId = user.bidderId || user.vendorId;

    // Search in local vendors state matching the authenticated user
    let vendor = vendorsState.find(v => (bidderId && v.id === bidderId) || (v.email && v.email.toLowerCase() === email));

    if (!vendor) {
      // Create fresh vendor profile specifically for this authenticated user
      vendor = {
        id: bidderId || `VND-${Math.floor(10000 + Math.random() * 90000)}`,
        companyName: user.organization || user.companyName || user.name || 'Registered Company',
        registrationNumber: user.registrationNumber || `REG-${Date.now().toString().slice(-6)}`,
        taxId: user.taxId || null,
        category: user.department || user.category || 'Information Technology & Security',
        rating: null,
        eligibilityScore: null,
        riskScore: null,
        riskLevel: null,
        verificationStatus: 'Pending Verification',
        financialHealth: null,
        blacklisted: false,
        contactPerson: user.name || user.contactPerson || 'Company Representative',
        email: user.email,
        phone: user.phone || null,
        address: 'Registered Office Address',
        completedProjectsCount: 0,
        annualTurnover: null,
        emdBalance: 0,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      vendorsState = [vendor, ...vendorsState];
    }
    return { data: vendor, status: 200 };
  },

  async registerVendor(vendorData) {
    try {
      const res = await apiClient.post('/vendors', vendorData);
      if (res.data && typeof res.data === 'object' && res.data.id) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay();
    const newVendor = {
      id: `VND-${Math.floor(10000 + Math.random() * 90000)}`,
      verificationStatus: 'Pending',
      rating: null,
      eligibilityScore: null,
      riskScore: null,
      riskLevel: null,
      financialHealth: null,
      blacklisted: false,
      completedProjectsCount: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      documents: [],
      ...vendorData
    };
    vendorsState = [newVendor, ...vendorsState];
    return { data: newVendor, status: 201 };
  },

  // --- BIDS ---
  async getBids(params = {}) {
    const savedUserStr = localStorage.getItem('certibid_user');
    let user = null;
    if (savedUserStr) {
      try { user = JSON.parse(savedUserStr); } catch (e) {}
    }

    const headers = {};
    if (user?.email) headers['X-User-Email'] = user.email;
    if (user?.bidderId || user?.vendorId) headers['X-Vendor-Id'] = user.bidderId || user.vendorId;
    if (user?.role) headers['X-User-Role'] = user.role;

    try {
      const res = await apiClient.get('/bids', { params, headers });
      if (res.data && Array.isArray(res.data)) return { data: res.data, status: res.status };
    } catch (e) {
      if (e.response && e.response.status === 403) {
        throw new Error("Access denied: You do not have permission to view other bidders' bids.");
      }
    }
    await delay();

    const rawRole = String(user?.role || '').toUpperCase().trim();
    const isBidder = rawRole === 'BIDDER' || rawRole === 'VENDOR';

    let result = [...bidsState];

    if (isBidder) {
      const bidderId = user?.bidderId || user?.vendorId;
      const userEmail = (user?.email || '').toLowerCase().trim();
      const compName = (user?.organization || user?.companyName || '').toLowerCase().trim();

      // STRICT OWNERSHIP FILTER FOR BIDDERS - Only return bids belonging to this authenticated bidder
      result = result.filter(b => 
        (bidderId && b.vendorId === bidderId) ||
        (userEmail && b.vendorEmail && b.vendorEmail.toLowerCase() === userEmail) ||
        (compName && b.vendorName && b.vendorName.toLowerCase() === compName)
      );
    } else {
      if (params.tenderId) {
        result = result.filter(b => b.tenderId === params.tenderId);
      }
      if (params.vendorId || params.vendorName) {
        result = result.filter(b => 
          (params.vendorId && b.vendorId === params.vendorId) ||
          (params.vendorName && b.vendorName?.toLowerCase() === params.vendorName?.toLowerCase())
        );
      }
    }
    if (params.tenderId && isBidder) {
      result = result.filter(b => b.tenderId === params.tenderId);
    }

    return { data: result, status: 200 };
  },

  async submitBid(bidData) {
    const savedUserStr = localStorage.getItem('certibid_user');
    let user = null;
    if (savedUserStr) {
      try { user = JSON.parse(savedUserStr); } catch (e) {}
    }

    const headers = {};
    if (user?.email) headers['X-User-Email'] = user.email;
    if (user?.bidderId || user?.vendorId) headers['X-Vendor-Id'] = user.bidderId || user.vendorId;
    if (user?.role) headers['X-User-Role'] = user.role;

    const bidderId = user?.bidderId || user?.vendorId || bidData.vendorId || `VND-${Math.floor(10000 + Math.random() * 90000)}`;
    const bidderName = user?.organization || user?.companyName || user?.name || bidData.vendorName || 'Registered Bidder';
    const email = user?.email || bidData.vendorEmail || '';

    const payload = {
      vendorId: bidderId,
      vendorName: bidderName,
      bidderName: bidderName,
      vendorEmail: email,
      ...bidData
    };

    try {
      const res = await apiClient.post('/bids', payload, { headers });
      if (res.data) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay();

    const newTxnId = `TXN-EMD-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBid = {
      id: `BID-${Math.floor(9000 + Math.random() * 1000)}`,
      submissionDate: new Date().toISOString().split('T')[0],
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'Submitted',
      bidScore: 92.5,
      aiRiskScore: Math.floor(Math.random() * 20),
      riskLevel: 'Low',
      priceAnomalyRatio: -2.2,
      collusionProbability: 1.5,
      complianceScore: 98,
      emdPaymentStatus: 'Verified & Paid',
      emdAmount: payload.emdAmount || 900000,
      emdTransactionId: newTxnId,
      proposalFiles: [{ name: 'Vendor_Proposal_Submission.pdf', size: '6.4 MB' }],
      ...payload
    };
    bidsState = [newBid, ...bidsState];

    // Create corresponding EMD transaction in transactionsState
    const newTxn = {
      id: newTxnId,
      tenderId: payload.tenderId || 'TND-2026-8901',
      tenderTitle: payload.tenderTitle || 'Public Infrastructure Project',
      bidId: newBid.id,
      vendorId: bidderId,
      vendorName: bidderName,
      userEmail: email,
      transactionType: 'EMD Deposit',
      amount: newBid.emdAmount,
      currency: 'INR',
      status: 'Completed',
      date: new Date().toISOString().split('T')[0],
      receiptUrl: '#',
      invoiceNo: `INV-2026-${Math.floor(100 + Math.random() * 900)}`
    };
    transactionsState = [newTxn, ...transactionsState];

    return { data: newBid, status: 201 };
  },

  async registerForTender(tenderId, tenderTitle) {
    const savedUserStr = localStorage.getItem('certibid_user');
    let user = null;
    if (savedUserStr) {
      try { user = JSON.parse(savedUserStr); } catch (e) {}
    }

    const headers = {};
    if (user?.email) headers['X-User-Email'] = user.email;
    if (user?.bidderId || user?.vendorId) headers['X-Vendor-Id'] = user.bidderId || user.vendorId;
    if (user?.role) headers['X-User-Role'] = user.role;

    try {
      const res = await apiClient.post(`/tenders/${tenderId}/register`, { tenderId, tenderTitle }, { headers });
      if (res.data) return { data: res.data, status: res.status };
    } catch (e) {
      if (e.response) {
        const errMsg = e.response.data?.message || e.response.data?.error || 'Registration failed';
        throw new Error(errMsg);
      }
    }

    return this.submitBid({ tenderId, tenderTitle });
  },

  // --- AI RISK ANALYZER ---
  async getRiskAnalysis(bidId) {
    try {
      const res = await apiClient.get(`/risk-analysis/${bidId}`);
      if (res.data) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay();
    const analysis = riskAnalysesState[bidId];
    if (!analysis) {
      const bid = bidsState.find(b => b.id === bidId);
      return {
        data: {
          bidId,
          tenderId: bid ? bid.tenderId : 'TND-2026-8901',
          tenderTitle: bid ? bid.tenderTitle : 'Procurement Tender',
          vendorName: bid ? bid.vendorName : 'Vendor Enterprise',
          overallRiskScore: bid ? bid.aiRiskScore : 25,
          riskLevel: bid ? bid.riskLevel : 'Low',
          confidenceScore: 96.5,
          riskIndicators: {
            priceAnomaly: { score: 15, status: 'Normal', details: 'Price within 10% benchmark variance.' },
            collusionDetection: { score: 5, status: 'Clear', details: 'No bid rigging patterns detected.' },
            vendorHistory: { score: 10, status: 'Satisfactory', details: 'Good historical completion rate.' },
            financialRisk: { score: 20, status: 'Moderate', details: 'Healthy debt-equity ratio.' },
            complianceRisk: { score: 5, status: 'Verified', details: 'Tax and legal documents valid.' }
          },
          explainableAI: {
            keyFactors: ['Standard price proposal.', 'Verified credentials.', 'No prior litigation.'],
            recommendations: ['Proceed to technical evaluation.']
          },
          timeline: [
            { step: 'Scan & Analysis', result: 'Completed', date: new Date().toLocaleString() }
          ]
        },
        status: 200
      };
    }
    return { data: analysis, status: 200 };
  },

  // --- DOCUMENTS ---
  async getDocuments(params = {}) {
    try {
      const savedUserStr = localStorage.getItem('certibid_user');
      let userObj = null;
      if (savedUserStr) {
        try { userObj = JSON.parse(savedUserStr); } catch (e) {}
      }
      const headers = {};
      if (userObj?.email) headers['X-User-Email'] = userObj.email;
      if (userObj?.bidderId || userObj?.vendorId) headers['X-Vendor-Id'] = userObj.bidderId || userObj.vendorId;
      if (userObj?.role) headers['X-User-Role'] = userObj.role;

      const res = await apiClient.get('/documents', { params, headers });
      if (res.data && Array.isArray(res.data)) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay();

    const savedUserStr = localStorage.getItem('certibid_user');
    let user = null;
    if (savedUserStr) {
      try { user = JSON.parse(savedUserStr); } catch (e) {}
    }

    const rawRole = String(user?.role || '').toUpperCase().trim();
    const isBidder = rawRole === 'BIDDER' || rawRole === 'VENDOR';

    let result = [...documentsState];

    if (isBidder) {
      const bidderId = user?.bidderId || user?.vendorId;
      const userEmail = (user?.email || '').toLowerCase().trim();
      const compName = (user?.organization || user?.companyName || '').toLowerCase().trim();

      // STRICT OWNERSHIP FILTER FOR BIDDERS
      result = result.filter(d => 
        (bidderId && d.vendorId === bidderId) ||
        (userEmail && d.uploadedByEmail && d.uploadedByEmail.toLowerCase() === userEmail) ||
        (compName && d.vendorName && d.vendorName.toLowerCase() === compName)
      );
    } else {
      if (params.vendorId || params.vendorName) {
        result = result.filter(d => 
          (params.vendorId && d.vendorId === params.vendorId) ||
          (params.vendorName && d.vendorName?.toLowerCase() === params.vendorName?.toLowerCase())
        );
      }
    }
    return { data: result, status: 200 };
  },

  async getDocumentById(id) {
    try {
      const savedUserStr = localStorage.getItem('certibid_user');
      let userObj = null;
      if (savedUserStr) {
        try { userObj = JSON.parse(savedUserStr); } catch (e) {}
      }
      const headers = {};
      if (userObj?.email) headers['X-User-Email'] = userObj.email;
      if (userObj?.bidderId || userObj?.vendorId) headers['X-Vendor-Id'] = userObj.bidderId || userObj.vendorId;
      if (userObj?.role) headers['X-User-Role'] = userObj.role;

      const res = await apiClient.get(`/documents/${id}`, { headers });
      if (res.data) return { data: res.data, status: res.status };
    } catch (e) {
      if (e.response && e.response.status === 403) {
        throw new Error("Access denied: You cannot view documents belonging to another bidder.");
      }
    }
    await delay();
    const savedUserStr = localStorage.getItem('certibid_user');
    let user = null;
    if (savedUserStr) {
      try { user = JSON.parse(savedUserStr); } catch (e) {}
    }

    const doc = documentsState.find(d => d.id === id);
    if (!doc) throw new Error("Document not found");

    const rawRole = String(user?.role || '').toUpperCase().trim();
    if (rawRole === 'BIDDER' || rawRole === 'VENDOR') {
      const bidderId = user?.bidderId || user?.vendorId;
      const userEmail = (user?.email || '').toLowerCase().trim();
      const isOwner = (bidderId && doc.vendorId === bidderId) ||
                      (userEmail && doc.uploadedByEmail && doc.uploadedByEmail.toLowerCase() === userEmail);
      if (!isOwner) {
        throw new Error("Access denied: You cannot view documents belonging to another bidder.");
      }
    }
    return { data: doc, status: 200 };
  },

  async uploadDocument(docData) {
    try {
      const savedUserStr = localStorage.getItem('certibid_user');
      let userObj = null;
      if (savedUserStr) {
        try { userObj = JSON.parse(savedUserStr); } catch (e) {}
      }
      const headers = {};
      if (userObj?.email) headers['X-User-Email'] = userObj.email;
      if (userObj?.bidderId || userObj?.vendorId) headers['X-Vendor-Id'] = userObj.bidderId || userObj.vendorId;
      if (userObj?.role) headers['X-User-Role'] = userObj.role;

      const res = await apiClient.post('/documents/upload', docData, { headers });
      if (res.data) {
        documentsState.unshift(res.data);
        return { data: res.data, status: res.status };
      }
    } catch (e) {
      console.warn("Server upload failed, using fallback:", e);
    }
    await delay();

    const savedUserStr = localStorage.getItem('certibid_user');
    let user = null;
    if (savedUserStr) {
      try { user = JSON.parse(savedUserStr); } catch (e) {}
    }

    const newDocId = `DOC-${Math.floor(1000 + Math.random() * 9000)}`;
    const title = docData.title || docData.name || (docData.fileName ? docData.fileName.replace(/\.[^/.]+$/, "") : 'Company Registration Certificate');
    const docType = docData.documentType || docData.type || 'Compliance Certificate';
    const rawFileName = docData.fileName || `${title.replace(/\s+/g, '_')}.pdf`;
    const ext = rawFileName.toLowerCase().split('.').pop() || 'pdf';
    const fileType = ext === 'png' ? 'PNG' : (ext === 'jpg' || ext === 'jpeg') ? 'JPG' : 'PDF';

    const newDoc = {
      id: newDocId,
      title: title,
      documentType: docType,
      vendorId: user?.bidderId || user?.vendorId || 'VND-10029',
      vendorName: user?.organization || user?.companyName || user?.name || 'Bidder Entity',
      uploadedByEmail: user?.email || '',
      fileName: rawFileName,
      fileType: fileType,
      fileSize: docData.fileSize || '1.2 MB',
      fileUrl: `/api/v1/documents/file/${newDocId}`,
      status: 'Verified / Uploaded',
      uploadedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      aiConfidence: 98,
      verifiedBy: 'CertiBid AI System',
      resubmissionReason: ''
    };

    documentsState.unshift(newDoc);
    return { data: newDoc, status: 201 };
  },

  getDocumentFileUrl(id, download = false) {
    return `/api/files/${id}${download ? '/download' : ''}`;
  },

  async downloadFile(fileId, defaultFilename) {
    return await downloadFileFromApi(`/api/files/${fileId}/download`, defaultFilename);
  },

  async downloadDocument(docId, fileName) {
    return await downloadCertificate(docId, fileName);
  },

  async downloadAwardCertificate(tenderId, fileName) {
    return await downloadAwardCertificate(tenderId, fileName);
  },

  async downloadTenderDoc(tenderId, tenderTitle) {
    return await downloadTenderDoc(tenderId, tenderTitle);
  },

  async downloadBidProposal(bidId, bidderName) {
    return await downloadBidProposal(bidId, bidderName);
  },

  async downloadReceiptPdf(txnOrId) {
    return await downloadReceiptPdf(txnOrId);
  },

  async downloadReport(reportType, format) {
    return await downloadReport(reportType, format);
  },

  async deleteDocument(id) {
    try {
      const savedUserStr = localStorage.getItem('certibid_user');
      let userObj = null;
      if (savedUserStr) {
        try { userObj = JSON.parse(savedUserStr); } catch (e) {}
      }
      const headers = {};
      if (userObj?.email) headers['X-User-Email'] = userObj.email;
      if (userObj?.bidderId || userObj?.vendorId) headers['X-Vendor-Id'] = userObj.bidderId || userObj.vendorId;
      if (userObj?.role) headers['X-User-Role'] = userObj.role;

      const res = await apiClient.delete(`/documents/${id}`, { headers });
      if (res.status === 200 || res.status === 204) return { success: true, status: res.status };
    } catch (e) {
      if (e.response && e.response.status === 403) {
        throw new Error("Access denied: You cannot delete a document belonging to another bidder.");
      }
    }
    await delay();

    const savedUserStr = localStorage.getItem('certibid_user');
    let user = null;
    if (savedUserStr) {
      try { user = JSON.parse(savedUserStr); } catch (e) {}
    }

    const docIndex = documentsState.findIndex(d => d.id === id);
    if (docIndex === -1) throw new Error("Document not found");

    const doc = documentsState[docIndex];
    const rawRole = String(user?.role || '').toUpperCase().trim();
    if (rawRole === 'BIDDER' || rawRole === 'VENDOR') {
      const bidderId = user?.bidderId || user?.vendorId;
      const userEmail = (user?.email || '').toLowerCase().trim();
      const isOwner = (bidderId && doc.vendorId === bidderId) ||
                      (userEmail && doc.uploadedByEmail && doc.uploadedByEmail.toLowerCase() === userEmail);
      if (!isOwner) {
        throw new Error("Access denied: You cannot delete a document belonging to another bidder.");
      }
    }

    documentsState.splice(docIndex, 1);
    return { success: true, status: 200 };
  },

  async updateDocumentStatus(id, status, resubmissionReason = '') {
    const savedUserStr = localStorage.getItem('certibid_user');
    let userObj = null;
    if (savedUserStr) {
      try { userObj = JSON.parse(savedUserStr); } catch (e) {}
    }
    const headers = {};
    if (userObj?.email) headers['X-User-Email'] = userObj.email;
    if (userObj?.role) headers['X-User-Role'] = userObj.role;

    try {
      const res = await apiClient.put(`/documents/${id}/status`, { status, resubmissionReason }, { headers });
      if (res.data) {
        const updatedDoc = res.data.document || res.data;
        documentsState = documentsState.map(d => d.id === id ? { ...d, ...updatedDoc } : d);
        return { data: updatedDoc, status: res.status };
      }
    } catch (e) {
      if (e.response && (e.response.status === 403 || e.response.status === 400)) {
        throw new Error(e.response.data?.message || 'Failed to update document audit status');
      }
    }
    await delay();
    const rawStatus = (status || 'APPROVED').toString().toUpperCase().trim();
    const normalizedStatus = rawStatus.includes('REJECT') ? 'REJECTED' : rawStatus.includes('PENDING') ? 'PENDING_REVIEW' : 'APPROVED';

    documentsState = documentsState.map(d => d.id === id ? {
      ...d,
      status: normalizedStatus,
      resubmissionReason,
      verifiedBy: `${userObj?.name || 'Officer'} (${userObj?.role || 'OFFICER'})`,
      reviewedBy: userObj?.name || 'Procurement Desk',
      reviewedByRole: userObj?.role || 'OFFICER',
      reviewedAt: new Date().toISOString()
    } : d);

    return { data: documentsState.find(d => d.id === id), status: 200 };
  },

  // --- DECISION / WINNER SELECTION & BIDDER ESCALATION ---
  async selectBidder(tenderId, bidId) {
    try {
      const res = await apiClient.post(`/tenders/${tenderId}/select-bidder`, { bidId });
      if (res.data) return { data: res.data, status: res.status };
    } catch (e) {
      if (e.response && e.response.data?.message) {
        throw new Error(e.response.data.message);
      }
    }
    await delay();
    const bid = bidsState.find(b => b.id === bidId);
    bidsState = bidsState.map(b => {
      if (b.tenderId === tenderId) {
        return b.id === bidId ? { ...b, status: 'Selected' } : (b.status === 'Selected' ? { ...b, status: 'Submitted' } : b);
      }
      return b;
    });
    tendersState = tendersState.map(t => {
      if (t.id === tenderId) {
        return {
          ...t,
          selectedBidId: bidId,
          selectedVendorName: bid?.vendorName || bid?.bidderName,
          selectedBidAmount: bid?.proposedAmount,
          selectedAt: new Date().toISOString(),
          status: t.status === 'Awarded' ? 'Awarded' : 'Bidder Selected'
        };
      }
      return t;
    });

    if (bid) {
      notificationsState.unshift({
        id: `NTF-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: bid.vendorId,
        recipientEmail: bid.vendorEmail || 'vendor@certibid.com',
        role: 'BIDDER',
        title: 'Bidder Selected',
        message: `Your bid has been selected by the Procurement Officer for further processing.\n\nTender ID: ${tenderId}\nBid ID: ${bid.id}\nBid Amount: ₹${(bid.proposedAmount || 0).toLocaleString()}\n\nPlease check CertiBid for further updates.`,
        type: 'Selection',
        tenderId,
        bidId: bid.id,
        read: false,
        timestamp: new Date().toISOString(),
        time: 'Just now'
      });
    }

    return { data: { success: true, tenderId, bidId }, status: 200 };
  },

  async escalateToAdmin(tenderId, { bidId, comment } = {}) {
    try {
      const res = await apiClient.post(`/tenders/${tenderId}/escalate-to-admin`, { bidId, comment });
      if (res.data) return { data: res.data, status: res.status };
    } catch (e) {
      if (e.response && e.response.data?.message) {
        throw new Error(e.response.data.message);
      }
    }
    await delay();
    const tender = tendersState.find(t => t.id === tenderId);
    const targetBidId = bidId || tender?.selectedBidId;
    const bid = bidsState.find(b => b.id === targetBidId);

    tendersState = tendersState.map(t => {
      if (t.id === tenderId) {
        return {
          ...t,
          status: 'Pending Admin Review',
          escalatedToAdmin: true,
          escalatedAt: new Date().toISOString(),
          escalationOfficerComment: comment || 'Tender escalated by Procurement Officer for senior governance review.'
        };
      }
      return t;
    });

    notificationsState.unshift({
      id: `NTF-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: 'ALL_ADMINS',
      recipientEmail: 'admin@certibid.com',
      role: 'ADMIN',
      title: 'Bid Escalated for Review',
      message: `Procurement Officer has escalated Tender ${tenderId} – ${tender?.title || 'Tender'} for Admin review.\n\nTender ID: ${tenderId}\nTender Title: ${tender?.title || ''}\nStatus: Pending Admin Review`,
      type: 'Escalation',
      tenderId,
      bidId: targetBidId || null,
      read: false,
      timestamp: new Date().toISOString(),
      time: 'Just now'
    });

    return { data: { success: true, tenderId, bidId: targetBidId }, status: 200 };
  },

  async approveAward(tenderId, { bidId, notes } = {}) {
    try {
      const res = await apiClient.post(`/tenders/${tenderId}/approve-award`, { bidId, notes });
      if (res.data) return { data: res.data, status: res.status };
    } catch (e) {
      if (e.response && e.response.data?.message) {
        throw new Error(e.response.data.message);
      }
    }
    await delay();
    const tender = tendersState.find(t => t.id === tenderId);
    const targetBidId = bidId || tender?.selectedBidId;
    const bid = bidsState.find(b => b.id === targetBidId);

    bidsState = bidsState.map(b => {
      if (b.tenderId === tenderId) {
        return b.id === targetBidId ? { ...b, status: 'Awarded', awardNotes: notes } : { ...b, status: 'Rejected' };
      }
      return b;
    });

    tendersState = tendersState.map(t => {
      if (t.id === tenderId) {
        return {
          ...t,
          status: 'Awarded',
          awardedBidId: targetBidId,
          awardedVendorName: bid?.vendorName || bid?.bidderName,
          awardedAmount: bid?.proposedAmount,
          awardedAt: new Date().toISOString(),
          awardNotes: notes
        };
      }
      return t;
    });

    if (bid) {
      notificationsState.unshift({
        id: `NTF-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: bid.vendorId,
        recipientEmail: bid.vendorEmail || 'vendor@certibid.com',
        role: 'BIDDER',
        title: 'Tender Awarded',
        message: `Congratulations! You have been officially awarded the tender.\n\nTender: ${tender?.title || tenderId}\nTender ID: ${tenderId}\nWinning Bid: ${bid.id}\nAward Amount: ₹${(bid.proposedAmount || 0).toLocaleString()}\n\nPlease log in to CertiBid to view the complete award details.`,
        type: 'Award',
        tenderId,
        bidId: bid.id,
        read: false,
        timestamp: new Date().toISOString(),
        time: 'Just now'
      });
    }

    return { data: { success: true, tenderId, bidId: targetBidId }, status: 200 };
  },

  async rejectAward(tenderId, { bidId, reason } = {}) {
    try {
      const res = await apiClient.post(`/tenders/${tenderId}/reject-award`, { bidId, reason });
      if (res.data) return { data: res.data, status: res.status };
    } catch (e) {
      if (e.response && e.response.data?.message) {
        throw new Error(e.response.data.message);
      }
    }
    await delay();
    tendersState = tendersState.map(t => {
      if (t.id === tenderId) {
        return {
          ...t,
          status: 'Active',
          escalatedToAdmin: false,
          adminRejectionReason: reason
        };
      }
      return t;
    });

    bidsState = bidsState.map(b => {
      if (b.tenderId === tenderId && (b.status === 'Selected' || b.status === 'PENDING_ADMIN_APPROVAL')) {
        return { ...b, status: 'Submitted' };
      }
      return b;
    });

    return { data: { success: true, tenderId }, status: 200 };
  },

  async selectWinner(tenderId, bidId, awardLetterNotes) {
    try {
      const res = await apiClient.post(`/tenders/${tenderId}/award`, { bidId, notes: awardLetterNotes });
      if (res.data) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay();
    bidsState = bidsState.map(b => {
      if (b.tenderId === tenderId) {
        return b.id === bidId ? { ...b, status: 'Selected' } : { ...b, status: 'Rejected' };
      }
      return b;
    });
    tendersState = tendersState.map(t => t.id === tenderId ? { ...t, status: 'Awarded' } : t);
    return { data: { success: true, tenderId, bidId }, status: 200 };
  },

  // --- PAYMENTS & EMD ---
  async getTransactions(params = {}) {
    const savedUserStr = localStorage.getItem('certibid_user');
    let user = null;
    if (savedUserStr) {
      try { user = JSON.parse(savedUserStr); } catch (e) {}
    }

    const headers = {};
    if (user?.email) headers['X-User-Email'] = user.email;
    if (user?.bidderId || user?.vendorId) headers['X-Vendor-Id'] = user.bidderId || user.vendorId;
    if (user?.role) headers['X-User-Role'] = user.role;

    try {
      const res = await apiClient.get('/transactions', { params, headers });
      if (res.data && Array.isArray(res.data)) return { data: res.data, status: res.status };
    } catch (e) {
      if (e.response && e.response.status === 403) {
        throw new Error("Access denied: You do not have permission to view other bidders' transactions.");
      }
    }
    await delay();

    const rawRole = String(user?.role || '').toUpperCase().trim();
    const isBidder = rawRole === 'BIDDER' || rawRole === 'VENDOR';

    let result = [...transactionsState];

    if (isBidder) {
      const bidderId = user?.bidderId || user?.vendorId;
      const userEmail = (user?.email || '').toLowerCase().trim();
      const compName = (user?.organization || user?.companyName || '').toLowerCase().trim();

      // STRICT OWNERSHIP FILTER FOR BIDDERS - Only return transactions/EMDs belonging to this bidder
      result = result.filter(t => 
        (bidderId && t.vendorId === bidderId) ||
        (userEmail && t.userEmail && t.userEmail.toLowerCase() === userEmail) ||
        (compName && t.vendorName && t.vendorName.toLowerCase() === compName)
      );
    } else {
      if (params.vendorId || params.vendorName) {
        result = result.filter(t => 
          (params.vendorId && t.vendorId === params.vendorId) ||
          (params.vendorName && t.vendorName?.toLowerCase() === params.vendorName?.toLowerCase())
        );
      }
    }
    return { data: result, status: 200 };
  },

  async processEmdPayment(paymentDetails) {
    try {
      const res = await apiClient.post('/payments/emd', paymentDetails);
      if (res.data) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay(300);
    const newTxn = {
      id: `TXN-EMD-${Math.floor(100000 + Math.random() * 900000)}`,
      transactionType: 'EMD Deposit',
      status: 'Completed',
      date: new Date().toISOString().split('T')[0],
      receiptUrl: '#',
      invoiceNo: `INV-EMD-${Math.floor(10000 + Math.random() * 90000)}`,
      ...paymentDetails
    };
    transactionsState = [newTxn, ...transactionsState];
    return { data: newTxn, status: 200 };
  },

  // --- USERS ---
  async getUsers() {
    try {
      const res = await apiClient.get('/users');
      if (res.data && Array.isArray(res.data)) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay();
    return { data: usersState, status: 200 };
  },

  async createUser(userData) {
    try {
      const res = await apiClient.post('/users', userData);
      if (res.data) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay();
    const newUser = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Active',
      lastLogin: 'Just now',
      avatar: userData.name ? userData.name.substring(0, 2).toUpperCase() : 'US',
      ...userData
    };
    usersState = [newUser, ...usersState];
    return { data: newUser, status: 201 };
  },

  // --- AUDIT LOGS & NOTIFICATIONS ---
  async getAuditLogs() {
    try {
      const res = await apiClient.get('/audit-logs');
      if (res.data && Array.isArray(res.data)) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay();
    return { data: auditLogsState, status: 200 };
  },

  async getNotifications() {
    try {
      const res = await apiClient.get('/notifications');
      if (res.data && Array.isArray(res.data)) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay();
    return { data: notificationsState, status: 200 };
  },

  async markNotificationRead(id) {
    try {
      const res = await apiClient.put(`/notifications/${id}/read`);
      if (res.data) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay(100);
    notificationsState = notificationsState.map(n => n.id === id ? { ...n, read: true } : n);
    return { data: { id, read: true }, status: 200 };
  },

  // --- ESCALATED BIDS WORKFLOW ---
  async getEscalations(params = {}) {
    const savedUserStr = localStorage.getItem('certibid_user');
    let userObj = null;
    if (savedUserStr) {
      try { userObj = JSON.parse(savedUserStr); } catch (e) {}
    }
    const headers = {};
    if (userObj?.email) headers['X-User-Email'] = userObj.email;
    if (userObj?.role) headers['X-User-Role'] = userObj.role;

    try {
      const res = await apiClient.get('/escalations', { params, headers });
      if (res.data && Array.isArray(res.data)) return { data: res.data, status: res.status };
    } catch (e) {
      if (e.response && e.response.status === 403) {
        throw new Error('Access denied: Bidders cannot access internal escalation workflows.');
      }
    }
    await delay();
    return { data: escalationsState, status: 200 };
  },

  async getEscalationByBid(bidId) {
    const savedUserStr = localStorage.getItem('certibid_user');
    let userObj = null;
    if (savedUserStr) {
      try { userObj = JSON.parse(savedUserStr); } catch (e) {}
    }
    const headers = {};
    if (userObj?.email) headers['X-User-Email'] = userObj.email;
    if (userObj?.role) headers['X-User-Role'] = userObj.role;

    try {
      const res = await apiClient.get(`/escalations/bid/${bidId}`, { headers });
      if (res.data) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay();
    const esc = escalationsState.find(e => e.bidId === bidId);
    return { data: esc || null, status: 200 };
  },

  async escalateBid({ bidId, tenderId, vendorId, comment }) {
    const savedUserStr = localStorage.getItem('certibid_user');
    let userObj = null;
    if (savedUserStr) {
      try { userObj = JSON.parse(savedUserStr); } catch (e) {}
    }
    const headers = {};
    if (userObj?.email) headers['X-User-Email'] = userObj.email;
    if (userObj?.role) headers['X-User-Role'] = userObj.role;

    const payload = { bidId, tenderId, vendorId, comment };
    try {
      const res = await apiClient.post('/escalations', payload, { headers });
      if (res.data) return { data: res.data, status: res.status };
    } catch (e) {
      if (e.response && e.response.status === 403) {
        throw new Error('Access denied: Bidders cannot escalate bids.');
      }
    }
    await delay();

    let esc = escalationsState.find(e => e.bidId === bidId);
    if (!esc) {
      esc = {
        id: `ESC-${Math.floor(1000 + Math.random() * 9000)}`,
        bidId,
        tenderId: tenderId || 'TND-2026-8901',
        tenderTitle: 'Public Tender',
        bidderId: vendorId || 'VND-10029',
        bidderName: 'Registered Bidder',
        proposedAmount: 50000000,
        aiRiskScore: 18,
        riskLevel: 'Low',
        escalatedByOfficerId: userObj?.id || 'usr-officer-001',
        escalatedByOfficerName: userObj?.name || 'Sarah Connor',
        escalatedAt: new Date().toISOString(),
        status: 'ESCALATED_TO_ADMIN',
        adminId: null,
        adminName: null,
        adminDecision: null,
        adminDecisionAt: null,
        adminComment: null,
        finalDecision: null,
        finalDecisionByOfficerId: null,
        finalDecisionByOfficerName: null,
        finalDecisionAt: null,
        finalComment: null,
        officerComment: comment || 'Escalated bid to Admin for governance risk evaluation.'
      };
      escalationsState = [esc, ...escalationsState];
    }
    return { data: esc, status: 201 };
  },

  async submitAdminDecision(escalationId, { decision, comment }) {
    const savedUserStr = localStorage.getItem('certibid_user');
    let userObj = null;
    if (savedUserStr) {
      try { userObj = JSON.parse(savedUserStr); } catch (e) {}
    }
    const headers = {};
    if (userObj?.email) headers['X-User-Email'] = userObj.email;
    if (userObj?.role) headers['X-User-Role'] = userObj.role;

    const payload = { decision, comment };
    try {
      const res = await apiClient.post(`/escalations/${escalationId}/admin-decision`, payload, { headers });
      if (res.data) return { data: res.data, status: res.status };
    } catch (e) {
      if (e.response && e.response.status === 403) {
        throw new Error('Access denied: Only Administrators can submit Admin Review decisions.');
      }
    }
    await delay();

    const normalized = decision.toUpperCase() === 'ACCEPT' || decision.toUpperCase() === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED';
    let esc = escalationsState.find(e => e.id === escalationId || e.bidId === escalationId);
    if (esc) {
      esc.adminDecision = normalized;
      esc.status = normalized === 'ACCEPTED' ? 'ADMIN_ACCEPTED_PENDING_OFFICER' : 'ADMIN_REJECTED_PENDING_OFFICER';
      esc.adminId = userObj?.id || 'usr-admin-001';
      esc.adminName = userObj?.name || 'System Administrator';
      esc.adminDecisionAt = new Date().toISOString();
      esc.adminComment = comment || (normalized === 'ACCEPTED' ? 'Admin approved risk profile.' : 'Admin flagged risk concerns.');
    }
    return { data: esc, status: 200 };
  },

  async submitFinalDecision(escalationId, { decision, comment }) {
    const savedUserStr = localStorage.getItem('certibid_user');
    let userObj = null;
    if (savedUserStr) {
      try { userObj = JSON.parse(savedUserStr); } catch (e) {}
    }
    const headers = {};
    if (userObj?.email) headers['X-User-Email'] = userObj.email;
    if (userObj?.role) headers['X-User-Role'] = userObj.role;

    const payload = { decision, comment };
    try {
      const res = await apiClient.post(`/escalations/${escalationId}/final-decision`, payload, { headers });
      if (res.data) return { data: res.data, status: res.status };
    } catch (e) {
      if (e.response && e.response.status === 403) {
        throw new Error('Access denied: Only Procurement Officers can record final procurement decisions.');
      }
    }
    await delay();

    const normalized = decision.toUpperCase() === 'ACCEPT' || decision.toUpperCase() === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED';
    let esc = escalationsState.find(e => e.id === escalationId || e.bidId === escalationId);
    if (esc) {
      esc.finalDecision = normalized;
      esc.status = normalized === 'ACCEPTED' ? 'FINAL_ACCEPTED' : 'FINAL_REJECTED';
      esc.finalDecisionByOfficerId = userObj?.id || 'usr-officer-001';
      esc.finalDecisionByOfficerName = userObj?.name || 'Sarah Connor';
      esc.finalDecisionAt = new Date().toISOString();
      esc.finalComment = comment || (normalized === 'ACCEPTED' ? 'Procurement Officer finalized award acceptance.' : 'Procurement Officer finalized rejection.');
    }
    return { data: esc, status: 200 };
  },

  // --- SETTINGS & PREFERENCES API ---
  async getSettings() {
    const savedUserStr = localStorage.getItem('certibid_user');
    let userObj = null;
    if (savedUserStr) {
      try { userObj = JSON.parse(savedUserStr); } catch (e) {}
    }
    const headers = {};
    if (userObj?.email) headers['X-User-Email'] = userObj.email;
    if (userObj?.role) headers['X-User-Role'] = userObj.role;

    try {
      const res = await apiClient.get('/settings', { headers });
      if (res.data) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay(100);

    const savedSettings = localStorage.getItem(`certibid_settings_${userObj?.email || 'default'}`);
    if (savedSettings) {
      try {
        return { data: JSON.parse(savedSettings), status: 200 };
      } catch (e) {}
    }

    return {
      data: {
        profile: {
          name: userObj?.name || 'User',
          email: userObj?.email || 'user@certibid.com',
          phone: userObj?.phone || '+91 98112 34567',
          organization: userObj?.organization || userObj?.companyName || 'Enterprise Corp',
          department: userObj?.department || 'Operations',
          roleTitle: userObj?.roleTitle || 'Authorized Representative',
          bidderId: userObj?.bidderId || '',
          taxId: userObj?.taxId || ''
        },
        notifications: {
          newBidSubmissions: true,
          highRiskEscalations: true,
          documentVerification: true,
          awardApprovals: true,
          tenderUpdates: true,
          bidStatusUpdates: true,
          emailDigest: true
        },
        preferences: {
          language: 'English (India)',
          currency: 'INR (₹)',
          dateFormat: 'DD/MM/YYYY',
          theme: 'Dark Navy (Default)'
        },
        governance: {
          autoEscalateHighRisk: true,
          riskThreshold: 70,
          enforceTwoFactor: true,
          auditLoggingLevel: 'Verbose Compliance',
          maintenanceMode: false,
          anomalySensitivity: 'High Sensitivity',
          fastTrackVerification: true,
          eSignPreference: 'DSC Class 3 (Digital Certificate)',
          autoInvoiceGeneration: true
        }
      },
      status: 200
    };
  },

  async saveSettings(settingsData) {
    const savedUserStr = localStorage.getItem('certibid_user');
    let userObj = null;
    if (savedUserStr) {
      try { userObj = JSON.parse(savedUserStr); } catch (e) {}
    }
    const headers = {};
    if (userObj?.email) headers['X-User-Email'] = userObj.email;
    if (userObj?.role) headers['X-User-Role'] = userObj.role;

    try {
      const res = await apiClient.put('/settings', settingsData, { headers });
      if (res.data) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay(200);

    const userEmail = userObj?.email || 'default';
    localStorage.setItem(`certibid_settings_${userEmail}`, JSON.stringify(settingsData));

    // Also update user profile in localStorage if profile changed
    if (settingsData.profile && userObj) {
      const updatedUser = {
        ...userObj,
        name: settingsData.profile.name || userObj.name,
        phone: settingsData.profile.phone || userObj.phone,
        department: settingsData.profile.department || userObj.department,
        organization: settingsData.profile.organization || userObj.organization,
        companyName: settingsData.profile.organization || userObj.companyName
      };
      localStorage.setItem('certibid_user', JSON.stringify(updatedUser));
    }

    return { data: { success: true, message: 'Settings saved successfully.', settings: settingsData }, status: 200 };
  },

  // --- SUPPORT & HELPDESK API ---
  async getSupportRequests(params = {}) {
    const savedUserStr = localStorage.getItem('certibid_user');
    let userObj = null;
    if (savedUserStr) {
      try { userObj = JSON.parse(savedUserStr); } catch (e) {}
    }
    const headers = {};
    if (userObj?.email) headers['X-User-Email'] = userObj.email;
    if (userObj?.role) headers['X-User-Role'] = userObj.role;

    try {
      const res = await apiClient.get('/support', { params, headers });
      if (res.data && Array.isArray(res.data)) return { data: res.data, status: res.status };
    } catch (e) {}
    await delay(100);

    return { data: [], status: 200 };
  },

  async createSupportRequest(ticketData) {
    const savedUserStr = localStorage.getItem('certibid_user');
    let userObj = null;
    if (savedUserStr) {
      try { userObj = JSON.parse(savedUserStr); } catch (e) {}
    }
    const headers = {};
    if (userObj?.email) headers['X-User-Email'] = userObj.email;
    if (userObj?.role) headers['X-User-Role'] = userObj.role;

    try {
      const res = await apiClient.post('/support', ticketData, { headers });
      if (res.data) return { data: res.data, status: res.status };
    } catch (e) {
      if (e.response?.data?.message) {
        throw new Error(e.response.data.message);
      }
    }
    await delay(200);

    const newTicket = {
      id: `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: userObj?.id || userObj?.bidderId || 'usr-vendor-001',
      userEmail: userObj?.email || 'vendor@certibid.com',
      userName: userObj?.name || 'Bidder',
      vendorId: userObj?.bidderId || userObj?.vendorId || 'VND-10029',
      vendorName: userObj?.organization || userObj?.companyName || userObj?.name || 'Bidder Entity',
      category: ticketData.category || 'General Inquiry',
      subject: ticketData.subject || 'Helpdesk Inquiry',
      priority: ticketData.priority || 'Medium',
      message: ticketData.message || '',
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: []
    };

    return { data: newTicket, status: 201 };
  },

  async updateSupportRequest(id, updates) {
    const savedUserStr = localStorage.getItem('certibid_user');
    let userObj = null;
    if (savedUserStr) {
      try { userObj = JSON.parse(savedUserStr); } catch (e) {}
    }
    const headers = {};
    if (userObj?.email) headers['X-User-Email'] = userObj.email;
    if (userObj?.role) headers['X-User-Role'] = userObj.role;

    try {
      const res = await apiClient.put(`/support/${id}`, updates, { headers });
      if (res.data) return { data: res.data.ticket || res.data, status: res.status };
    } catch (e) {
      if (e.response?.data?.message) {
        throw new Error(e.response.data.message);
      }
    }
    await delay(200);

    return { data: { id, ...updates, updatedAt: new Date().toISOString() }, status: 200 };
  }
};
