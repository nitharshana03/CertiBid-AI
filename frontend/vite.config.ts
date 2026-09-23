import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

const DB_FILE = path.join(process.cwd(), '.certibid_db.json');

const initialUsersSeed: Record<string, any> = {
  'admin@certibid.com': {
    id: 'usr-admin-001',
    name: 'System Administrator',
    email: 'admin@certibid.com',
    password: 'password123',
    role: 'ADMIN',
    roleTitle: 'Chief Technology Officer',
    department: 'IT Operations',
    organization: 'CertiBid AI Gov',
    avatar: 'SA'
  },
  'officer@certibid.com': {
    id: 'usr-officer-001',
    name: 'Sarah Connor',
    email: 'officer@certibid.com',
    password: 'password123',
    role: 'OFFICER',
    roleTitle: 'Senior Procurement Officer',
    department: 'Infrastructure & Public Works',
    organization: 'Department of Transportation',
    avatar: 'SC'
  },
  'vendor@certibid.com': {
    id: 'usr-vendor-001',
    name: 'Acme Construction Services',
    email: 'vendor@certibid.com',
    password: 'password123',
    role: 'BIDDER',
    roleTitle: 'Managing Director',
    organization: 'Acme Construction Services',
    department: 'Commercial Bidding',
    bidderId: 'VND-10029',
    taxId: 'TAX-2024-8891',
    avatar: 'AC'
  },
  'v.mehta@cybershield.org': {
    id: 'usr-vendor-002',
    name: 'Vikram Mehta',
    email: 'v.mehta@cybershield.org',
    password: 'password123',
    role: 'BIDDER',
    roleTitle: 'Managing Director',
    organization: 'CyberShield Infra Ltd',
    department: 'Cyber Security',
    bidderId: 'VND-10034',
    taxId: 'TAX-2024-3310',
    avatar: 'VM'
  },
  'm.sterling@buildcorp.org': {
    id: 'usr-vendor-003',
    name: 'Marcus Sterling',
    email: 'm.sterling@buildcorp.org',
    password: 'password123',
    role: 'BIDDER',
    roleTitle: 'Operations Director',
    organization: 'BuildCorp Heavy Industries Inc.',
    department: 'Infrastructure & Heavy Works',
    bidderId: 'VND-10030',
    taxId: 'TAX-2024-9102',
    avatar: 'MS'
  },
  's.jenkins@heliosenergy.io': {
    id: 'usr-vendor-004',
    name: 'Samuel Jenkins',
    email: 's.jenkins@heliosenergy.io',
    password: 'password123',
    role: 'BIDDER',
    roleTitle: 'Managing Director',
    organization: 'Helios Renewable Energy Solutions',
    department: 'Renewable Power Division',
    bidderId: 'VND-10031',
    taxId: 'TAX-2024-5541',
    avatar: 'SJ'
  }
};

const initialVendorsSeed: Record<string, any> = {
  'VND-10029': {
    id: 'VND-10029',
    companyName: 'Acme Construction Services',
    registrationNumber: 'REG-2024-8891',
    taxId: 'TAX-2024-8891',
    category: 'Civil Construction',
    rating: 4.8,
    eligibilityScore: 96,
    riskScore: 14,
    riskLevel: 'Low',
    verificationStatus: 'Verified',
    financialHealth: 'A+',
    blacklisted: false,
    contactPerson: 'Acme Representative',
    email: 'vendor@certibid.com',
    phone: '+1-555-0192',
    address: '100 Industrial Parkway, Metro City',
    completedProjectsCount: 12,
    annualTurnover: 15000000,
    emdBalance: 300000,
    joinedDate: '2024-01-15'
  },
  'VND-10030': {
    id: 'VND-10030',
    companyName: 'BuildCorp Heavy Industries Inc.',
    registrationNumber: 'REG-2024-9102',
    taxId: 'TAX-2024-9102',
    category: 'Infrastructure & Heavy Works',
    rating: 4.6,
    eligibilityScore: 91,
    riskScore: 28,
    riskLevel: 'Medium',
    verificationStatus: 'Verified',
    financialHealth: 'A',
    blacklisted: false,
    contactPerson: 'Marcus Sterling',
    email: 'm.sterling@buildcorp.org',
    phone: '+1-555-0842',
    address: '45 Harbour Road, Port City',
    completedProjectsCount: 8,
    annualTurnover: 28000000,
    emdBalance: 560000,
    joinedDate: '2024-03-20'
  },
  'VND-10031': {
    id: 'VND-10031',
    companyName: 'Helios Renewable Energy Solutions',
    registrationNumber: 'REG-2025-1044',
    taxId: 'TAX-2025-1044',
    category: 'Renewable Energy',
    rating: 4.9,
    eligibilityScore: 98,
    riskScore: 8,
    riskLevel: 'Low',
    verificationStatus: 'Verified',
    financialHealth: 'A+',
    blacklisted: false,
    contactPerson: 'Sarah Jenkins',
    email: 's.jenkins@heliosenergy.io',
    phone: '+1-555-0311',
    address: '12 Solar Way, Tech Valley',
    completedProjectsCount: 15,
    annualTurnover: 35000000,
    emdBalance: 700000,
    joinedDate: '2025-02-10'
  },
  'VND-10032': {
    id: 'VND-10032',
    companyName: 'Apex Technologies Ltd',
    registrationNumber: 'REG-2024-7712',
    taxId: 'TAX-2024-7712',
    category: 'Information Technology & Security',
    rating: 4.7,
    eligibilityScore: 94,
    riskScore: 12,
    riskLevel: 'Low',
    verificationStatus: 'Verified',
    financialHealth: 'A',
    blacklisted: false,
    contactPerson: 'David Vance',
    email: 'd.vance@apextech.com',
    phone: '+1-555-0922',
    address: '88 Cyber Hub, Silicon District',
    completedProjectsCount: 10,
    annualTurnover: 22000000,
    emdBalance: 440000,
    joinedDate: '2024-05-18'
  },
  'VND-10033': {
    id: 'VND-10033',
    companyName: 'XYZ Solutions Pvt Ltd',
    registrationNumber: 'REG-2025-4421',
    taxId: 'TAX-2025-4421',
    category: 'Smart Systems & Automation',
    rating: 4.5,
    eligibilityScore: 88,
    riskScore: 35,
    riskLevel: 'Medium',
    verificationStatus: 'Verified',
    financialHealth: 'B+',
    blacklisted: false,
    contactPerson: 'Priya Sharma',
    email: 'p.sharma@xyzsolutions.in',
    phone: '+1-555-0488',
    address: '20 Innovation Tower, Sector 62',
    completedProjectsCount: 6,
    annualTurnover: 18000000,
    emdBalance: 360000,
    joinedDate: '2025-01-08'
  },
  'VND-10034': {
    id: 'VND-10034',
    companyName: 'CyberShield Infra Ltd',
    registrationNumber: 'REG-2024-3310',
    taxId: 'TAX-2024-3310',
    category: 'Cyber Security & Network Defense',
    rating: 4.9,
    eligibilityScore: 97,
    riskScore: 6,
    riskLevel: 'Low',
    verificationStatus: 'Verified',
    financialHealth: 'A+',
    blacklisted: false,
    contactPerson: 'Vikram Mehta',
    email: 'v.mehta@cybershield.org',
    phone: '+1-555-0711',
    address: '5 Cyber Park, Phase 3',
    completedProjectsCount: 14,
    annualTurnover: 30000000,
    emdBalance: 600000,
    joinedDate: '2024-02-14'
  }
};

const initialDocumentsSeed: any[] = [
  {
    id: 'DOC-801',
    title: 'Corporate Tax Clearance Certificate 2026',
    vendorName: 'BuildCorp Heavy Industries Inc.',
    vendorId: 'VND-10030',
    uploadedByEmail: 'm.sterling@buildcorp.org',
    documentType: 'Tax Certificate',
    fileName: 'Tax_Clearance_FY26.pdf',
    fileUrl: '#',
    status: 'Under Review',
    uploadedAt: '2026-08-01',
    aiConfidence: 68,
    verifiedBy: 'Dr. Jonathan Thorne',
    resubmissionReason: ''
  },
  {
    id: 'DOC-802',
    title: 'ISO 27001 Cyber Security Compliance Audit',
    vendorName: 'Acme Construction Services',
    vendorId: 'VND-10029',
    uploadedByEmail: 'vendor@certibid.com',
    documentType: 'Security Audit',
    fileName: 'ISO_27001_Audit.pdf',
    fileUrl: '#',
    status: 'Approved',
    uploadedAt: '2026-07-28',
    aiConfidence: 99,
    verifiedBy: 'Sarah Lin',
    resubmissionReason: ''
  },
  {
    id: 'DOC-803',
    title: 'Environmental Clearance Certificate Sector 4',
    vendorName: 'BuildCorp Heavy Industries Inc.',
    vendorId: 'VND-10030',
    uploadedByEmail: 'm.sterling@buildcorp.org',
    documentType: 'Environmental',
    fileName: 'Environmental_Clearance.pdf',
    fileUrl: '#',
    status: 'Rejected',
    uploadedAt: '2026-07-25',
    aiConfidence: 42,
    verifiedBy: 'Dr. Jonathan Thorne',
    resubmissionReason: 'Expired validation stamp on page 4.'
  },
  {
    id: 'DOC-804',
    title: 'NABCEP Solar Contractor Accreditation',
    vendorName: 'Helios Renewable Energy Solutions',
    vendorId: 'VND-10031',
    uploadedByEmail: 's.jenkins@heliosenergy.io',
    documentType: 'Accreditation',
    fileName: 'Solar_Accreditation.pdf',
    fileUrl: '#',
    status: 'Approved',
    uploadedAt: '2026-07-30',
    aiConfidence: 96,
    verifiedBy: 'Sarah Lin',
    resubmissionReason: ''
  }
];

const initialBidsSeed: any[] = [
  // TND-2026-8901 Registered Bidders (3 total)
  {
    id: 'BID-9011',
    tenderId: 'TND-2026-8901',
    tenderTitle: 'National Smart City Traffic Surveillance System Upgrade',
    vendorId: 'VND-10029',
    vendorName: 'Acme Construction Services',
    bidderName: 'Acme Construction Services',
    vendorEmail: 'vendor@certibid.com',
    proposedAmount: 41200000,
    currency: 'INR',
    estimatedCompletionTime: '14 Months',
    bidScore: 94.5,
    aiRiskScore: 14,
    riskLevel: 'Low',
    documentStatus: 'Complete',
    eligibilityStatus: 'Eligible',
    verificationStatus: 'Verified',
    status: 'Submitted',
    emdPaymentStatus: 'Verified & Paid',
    emdAmount: 900000,
    emdTransactionId: 'TXN-EMD-882910',
    submissionDate: '2026-08-02',
    submittedAt: '2026-08-02'
  },
  {
    id: 'BID-9012',
    tenderId: 'TND-2026-8901',
    tenderTitle: 'National Smart City Traffic Surveillance System Upgrade',
    vendorId: 'VND-10032',
    vendorName: 'Apex Technologies Ltd',
    bidderName: 'Apex Technologies Ltd',
    vendorEmail: 'd.vance@apextech.com',
    proposedAmount: 43500000,
    currency: 'INR',
    estimatedCompletionTime: '12 Months',
    bidScore: 92.0,
    aiRiskScore: 12,
    riskLevel: 'Low',
    documentStatus: 'Complete',
    eligibilityStatus: 'Eligible',
    verificationStatus: 'Verified',
    status: 'Submitted',
    emdPaymentStatus: 'Verified & Paid',
    emdAmount: 900000,
    emdTransactionId: 'TXN-EMD-882911',
    submissionDate: '2026-08-03',
    submittedAt: '2026-08-03'
  },
  {
    id: 'BID-9013',
    tenderId: 'TND-2026-8901',
    tenderTitle: 'National Smart City Traffic Surveillance System Upgrade',
    vendorId: 'VND-10033',
    vendorName: 'XYZ Solutions Pvt Ltd',
    bidderName: 'XYZ Solutions Pvt Ltd',
    vendorEmail: 'p.sharma@xyzsolutions.in',
    proposedAmount: 42800000,
    currency: 'INR',
    estimatedCompletionTime: '15 Months',
    bidScore: 88.5,
    aiRiskScore: 35,
    riskLevel: 'Medium',
    documentStatus: 'Under Review',
    eligibilityStatus: 'Eligible',
    verificationStatus: 'Verified',
    status: 'Submitted',
    emdPaymentStatus: 'Verified & Paid',
    emdAmount: 900000,
    emdTransactionId: 'TXN-EMD-882912',
    submissionDate: '2026-08-04',
    submittedAt: '2026-08-04'
  },

  // TND-2026-8902 Registered Bidders (2 total)
  {
    id: 'BID-9021',
    tenderId: 'TND-2026-8902',
    tenderTitle: 'State Data Center Cyber Security Infrastructure Modernization',
    vendorId: 'VND-10034',
    vendorName: 'CyberShield Infra Ltd',
    bidderName: 'CyberShield Infra Ltd',
    vendorEmail: 'v.mehta@cybershield.org',
    proposedAmount: 26500000,
    currency: 'INR',
    estimatedCompletionTime: '8 Months',
    bidScore: 96.0,
    aiRiskScore: 6,
    riskLevel: 'Low',
    documentStatus: 'Complete',
    eligibilityStatus: 'Eligible',
    verificationStatus: 'Verified',
    status: 'Submitted',
    emdPaymentStatus: 'Verified & Paid',
    emdAmount: 560000,
    emdTransactionId: 'TXN-EMD-882921',
    submissionDate: '2026-08-01',
    submittedAt: '2026-08-01'
  },
  {
    id: 'BID-9022',
    tenderId: 'TND-2026-8902',
    tenderTitle: 'State Data Center Cyber Security Infrastructure Modernization',
    vendorId: 'VND-10030',
    vendorName: 'BuildCorp Heavy Industries Inc.',
    bidderName: 'BuildCorp Heavy Industries Inc.',
    vendorEmail: 'm.sterling@buildcorp.org',
    proposedAmount: 27800000,
    currency: 'INR',
    estimatedCompletionTime: '10 Months',
    bidScore: 89.0,
    aiRiskScore: 28,
    riskLevel: 'Medium',
    documentStatus: 'Complete',
    eligibilityStatus: 'Eligible',
    verificationStatus: 'Verified',
    status: 'Submitted',
    emdPaymentStatus: 'Verified & Paid',
    emdAmount: 560000,
    emdTransactionId: 'TXN-EMD-882922',
    submissionDate: '2026-08-03',
    submittedAt: '2026-08-03'
  },

  // TND-2026-8903 Registered Bidders (1 total)
  {
    id: 'BID-9031',
    tenderId: 'TND-2026-8903',
    tenderTitle: 'Solar Powered Microgrid Installation District 4',
    vendorId: 'VND-10031',
    vendorName: 'Helios Renewable Energy Solutions',
    bidderName: 'Helios Renewable Energy Solutions',
    vendorEmail: 's.jenkins@heliosenergy.io',
    proposedAmount: 34000000,
    currency: 'INR',
    estimatedCompletionTime: '6 Months',
    bidScore: 97.5,
    aiRiskScore: 8,
    riskLevel: 'Low',
    documentStatus: 'Complete',
    eligibilityStatus: 'Eligible',
    verificationStatus: 'Verified',
    status: 'Submitted',
    emdPaymentStatus: 'Verified & Paid',
    emdAmount: 700000,
    emdTransactionId: 'TXN-EMD-882931',
    submissionDate: '2026-08-05',
    submittedAt: '2026-08-05'
  }
];

const initialEscalationsSeed: any[] = [
  {
    id: 'ESC-8812',
    bidId: 'BID-9011',
    tenderId: 'TND-2026-8901',
    tenderTitle: 'National Smart City Traffic Surveillance System Upgrade',
    vendorId: 'VND-10029',
    vendorName: 'Acme Construction Services',
    status: 'ESCALATED_TO_ADMIN',
    escalatedByOfficerId: 'usr-officer-001',
    escalatedByOfficerName: 'Sarah Connor',
    escalatedAt: '2026-08-05T10:30:00Z',
    escalationComment: 'Flagged for pricing structure review and technical sub-component verification.'
  },
  {
    id: 'ESC-8813',
    bidId: 'BID-9013',
    tenderId: 'TND-2026-8901',
    tenderTitle: 'National Smart City Traffic Surveillance System Upgrade',
    vendorId: 'VND-10033',
    vendorName: 'XYZ Solutions Pvt Ltd',
    status: 'ESCALATED_TO_ADMIN',
    escalatedByOfficerId: 'usr-officer-001',
    escalatedByOfficerName: 'Sarah Connor',
    escalatedAt: '2026-08-06T11:15:00Z',
    escalationComment: 'Requires senior tech committee review regarding AI risk score variance.'
  },
  {
    id: 'ESC-8814',
    bidId: 'BID-9022',
    tenderId: 'TND-2026-8902',
    tenderTitle: 'State Data Center Cyber Security Infrastructure Modernization',
    vendorId: 'VND-10030',
    vendorName: 'BuildCorp Heavy Industries Inc.',
    status: 'ADMIN_ACCEPTED_PENDING_OFFICER',
    escalatedByOfficerId: 'usr-officer-001',
    escalatedByOfficerName: 'Sarah Connor',
    escalatedAt: '2026-08-04T09:00:00Z',
    adminDecision: 'ACCEPTED',
    adminDecisionAt: '2026-08-04T14:20:00Z',
    adminComment: 'All required compliance documents audited. Recommended for award consideration.'
  }
];

const initialNotificationsSeed: any[] = [
  {
    id: 'NTF-101',
    userId: 'VND-10029',
    recipientEmail: 'vendor@certibid.com',
    role: 'BIDDER',
    title: 'EMD Payment Receipt Issued',
    message: 'Your EMD deposit of ₹9,00,000 for tender TND-2026-8901 has been confirmed and verified.',
    type: 'Payment',
    read: false,
    timestamp: '2026-08-02T11:00:00Z',
    time: '2 days ago'
  },
  {
    id: 'NTF-102',
    userId: 'usr-officer-001',
    recipientEmail: 'officer@certibid.com',
    role: 'OFFICER',
    title: 'New Bid Submitted for TND-2026-8901',
    message: 'Acme Construction Services submitted proposal BID-9011 with AI Risk Score: 14.',
    type: 'Bid',
    read: false,
    timestamp: '2026-08-02T10:35:00Z',
    time: '2 days ago'
  },
  {
    id: 'NTF-103',
    userId: 'usr-admin-001',
    recipientEmail: 'admin@certibid.com',
    role: 'ADMIN',
    title: 'Escalated Bid Pending Review',
    message: 'Officer Sarah Connor escalated proposal BID-9011 for senior committee review.',
    type: 'Escalation',
    read: false,
    timestamp: '2026-08-05T10:30:00Z',
    time: 'Yesterday'
  }
];

const initialAuditLogsSeed: any[] = [
  {
    id: 'LOG-9001',
    action: 'TENDER_PUBLISHED',
    category: 'Tender',
    entityId: 'TND-2026-8901',
    performedBy: 'Sarah Connor (Senior Procurement Officer)',
    userRole: 'OFFICER',
    timestamp: '2026-07-15T09:00:00Z',
    details: 'Published National Smart City Traffic Surveillance System Upgrade with budget ₹4.50 Cr.'
  },
  {
    id: 'LOG-9002',
    action: 'BID_REGISTERED',
    category: 'Bid',
    entityId: 'BID-9011',
    performedBy: 'Acme Construction Services',
    userRole: 'BIDDER',
    timestamp: '2026-08-02T10:30:00Z',
    details: 'Submitted proposal with financial quote ₹4.12 Cr and EMD ₹9.00 Lakhs.'
  }
];

const initialSupportSeed: any[] = [
  {
    id: 'SUP-1001',
    userId: 'usr-vendor-001',
    userEmail: 'vendor@certibid.com',
    userName: 'Acme Construction Services',
    vendorId: 'VND-10029',
    vendorName: 'Acme Construction Services',
    category: 'Document Verification',
    subject: 'Corporate Tax Clearance Verification Inquiry',
    priority: 'Medium',
    message: 'We uploaded our updated FY26 Corporate Tax Clearance Certificate. Please confirm if additional digital notary attestation is required.',
    status: 'IN_PROGRESS',
    createdAt: '2026-08-10T10:30:00.000Z',
    updatedAt: '2026-08-11T14:20:00.000Z',
    responses: [
      {
        id: 'REP-101',
        authorName: 'Sarah Connor',
        authorRole: 'OFFICER',
        authorEmail: 'officer@certibid.com',
        message: 'Our compliance desk is currently validating the tax certificate against the state revenue portal. No additional notary attestation is needed.',
        createdAt: '2026-08-11T14:20:00.000Z'
      }
    ]
  },
  {
    id: 'SUP-1002',
    userId: 'usr-bidder-1786671324278',
    userEmail: 'vendor1@certibid.com',
    userName: 'Viniyoganitharsana B',
    vendorId: 'VND-26615',
    vendorName: 'vini',
    category: 'EMD Payment',
    subject: 'EMD Deposit Receipt Confirmation for TND-2026-8901',
    priority: 'High',
    message: 'We submitted the EMD payment for Smart City Traffic Surveillance tender. Kindly verify if the bank challan acknowledgment has been indexed.',
    status: 'OPEN',
    createdAt: '2026-08-12T09:15:00.000Z',
    updatedAt: '2026-08-12T09:15:00.000Z',
    responses: []
  }
];

const initialTransactionsSeed: any[] = [
  {
    id: 'TXN-EMD-882910',
    tenderId: 'TND-2026-8901',
    tenderTitle: 'National Smart City Traffic Surveillance System Upgrade',
    bidId: 'BID-9011',
    vendorId: 'VND-10029',
    vendorName: 'Acme Construction Services',
    userEmail: 'vendor@certibid.com',
    transactionType: 'EMD Deposit',
    amount: 900000,
    currency: 'INR',
    status: 'Completed',
    date: '2026-08-02',
    receiptUrl: '#',
    invoiceNo: 'INV-2026-901'
  }
];

const initialTendersSeed: any[] = [
  {
    id: 'TND-2026-8901',
    title: 'National Smart City Traffic Surveillance System Upgrade',
    department: 'Department of Transportation',
    category: 'Information Technology & Security',
    budget: 45000000,
    submissionDeadline: '2026-08-25',
    publishingDate: '2026-07-15',
    openingDate: '2026-08-26',
    status: 'Active',
    riskLevel: 'Low',
    aiRiskScore: 14,
    eligibleVendorsCount: 12,
    bidsCount: 1,
    location: 'Metro City Capital Region',
    description: 'Comprehensive AI-powered traffic camera installation, high-speed optical network deployment, automatic number plate recognition (ANPR) systems, and real-time command center integration across 12 major transit corridors.',
    requirements: [
      'ISO 27001 Cybersecurity Certification mandatory',
      'Minimum 5 years experience in municipal traffic management systems',
      'Average annual financial turnover exceeding ₹15 Crores in last 3 financial years',
      'Valid Tax Clearance Certificate FY 2025-26',
      'Bank Guarantee / EMD of 2% of budget ceiling'
    ]
  },
  {
    id: 'TND-2026-8902',
    title: 'State Data Center Cyber Security Infrastructure Modernization',
    department: 'Ministry of Electronics & IT',
    category: 'Information Technology & Security',
    budget: 28000000,
    submissionDeadline: '2026-09-05',
    publishingDate: '2026-07-20',
    openingDate: '2026-09-06',
    status: 'Active',
    riskLevel: 'Low',
    aiRiskScore: 8,
    eligibleVendorsCount: 8,
    bidsCount: 0,
    location: 'Central IT Complex, Sector 4',
    description: 'Supply, installation, testing, and commissioning of Next-Generation Firewalls (NGFW), Zero-Trust Architecture software, intrusion prevention systems, and 24/7 Managed SOC operations for 3 years.',
    requirements: [
      'CERT-In Empanelled Security Auditor Certification',
      'CMMI Level 3 or higher organizational accreditation',
      'ISO 9001 and ISO 27001 Quality & Security certifications',
      'EMD deposit of 2% of total contract value'
    ]
  },
  {
    id: 'TND-2026-8903',
    title: 'Solar Powered Microgrid Installation District 4',
    department: 'Department of Renewable Energy',
    category: 'Renewable Energy & Power',
    budget: 35000000,
    submissionDeadline: '2026-08-30',
    publishingDate: '2026-07-10',
    openingDate: '2026-08-31',
    status: 'Active',
    riskLevel: 'Medium',
    aiRiskScore: 32,
    eligibleVendorsCount: 15,
    bidsCount: 0,
    location: 'District 4 Rural Electrification Zone',
    description: 'EPC contract for 5MW decentralized ground-mounted solar microgrid, lithium-ion battery energy storage systems (BESS), smart metering, and 5-year comprehensive operation & maintenance.',
    requirements: [
      'Class-A Electrical Contractor License',
      'NABCEP or MNRE accredited solar contractor status',
      'Successful execution of at least 3 grid-interactive solar projects above 1MW capacity',
      'EMD of 2% of budget'
    ]
  },
  {
    id: 'TND-2026-8904',
    title: 'AI-Powered Smart Municipal Water Supply & Leak Detection',
    department: 'Ministry of Housing & Urban Affairs',
    category: 'Civil Construction & Water Supply',
    budget: 52000000,
    submissionDeadline: '2026-09-12',
    publishingDate: '2026-08-01',
    openingDate: '2026-09-13',
    status: 'Active',
    riskLevel: 'Low',
    aiRiskScore: 18,
    eligibleVendorsCount: 6,
    bidsCount: 0,
    location: 'Greater Metropolitan Water Works',
    description: 'Deployment of IoT flow sensors, acoustic leak detectors, pressure management valves, and centralized telemetry software across 300km municipal distribution network.',
    requirements: [
      'Experience in urban water infrastructure telemetry',
      'Clean environmental compliance record',
      'ISO 14001 Environmental Management Certification'
    ]
  },
  {
    id: 'TND-2026-8905',
    title: 'Highway Expansion & Automated Toll Management System',
    department: 'National Highways Authority',
    category: 'Civil Construction',
    budget: 120000000,
    submissionDeadline: '2026-09-20',
    publishingDate: '2026-08-05',
    openingDate: '2026-09-21',
    status: 'Active',
    riskLevel: 'Medium',
    aiRiskScore: 28,
    eligibleVendorsCount: 10,
    bidsCount: 0,
    location: 'Expressway Corridor 12-B',
    description: '4-lane highway expansion including FASTag RFID automated tolling plazas, weigh-in-motion sensors, variable message signages, and emergency call boxes.',
    requirements: [
      'Class 1-A Highway Concessionaire / Construction License',
      'Financial net worth exceeding ₹50 Crores',
      'Valid EMD bank guarantee'
    ]
  }
];

function getDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && parsed.users && parsed.tenders) {
        if (!parsed.escalations || parsed.escalations.length === 0) {
          parsed.escalations = initialEscalationsSeed;
        }
        // Ensure initial seed bids exist if bids is empty or missing
        if (!parsed.bids || parsed.bids.length < 3) {
          parsed.bids = initialBidsSeed;
        }
        if (!parsed.vendors || Object.keys(parsed.vendors).length < 3) {
          parsed.vendors = initialVendorsSeed;
        }
        if (!parsed.notifications || parsed.notifications.length === 0) {
          parsed.notifications = initialNotificationsSeed;
        }
        if (!parsed.auditLogs || parsed.auditLogs.length === 0) {
          parsed.auditLogs = initialAuditLogsSeed;
        }
        if (!parsed.supportRequests || parsed.supportRequests.length === 0) {
          parsed.supportRequests = initialSupportSeed;
        }
        if (!parsed.documents || parsed.documents.length === 0) {
          parsed.documents = initialDocumentsSeed;
        }
        saveDb(parsed);
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read database file, initializing defaults:', err);
  }

  const initialDb = {
    users: initialUsersSeed,
    vendors: initialVendorsSeed,
    documents: initialDocumentsSeed,
    bids: initialBidsSeed,
    transactions: initialTransactionsSeed,
    tenders: initialTendersSeed,
    escalations: initialEscalationsSeed,
    notifications: initialNotificationsSeed,
    auditLogs: initialAuditLogsSeed,
    supportRequests: initialSupportSeed
  };

  saveDb(initialDb);
  return initialDb;
}

function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

const apiMockPlugin = () => {
  const getAuthenticatedUser = (req: any, db: any) => {
    const authHeader = req.headers['authorization'] || '';
    const authUserHeader = req.headers['x-user-email'] || '';

    let foundEmail = '';
    if (authUserHeader) {
      foundEmail = String(authUserHeader).toLowerCase().trim();
    } else if (authHeader.includes('certibid_token_')) {
      const tokenPart = authHeader.split('certibid_token_')[1] || '';
      for (const uEmail in db.users) {
        if (tokenPart.includes(encodeURIComponent(uEmail)) || tokenPart.includes(uEmail)) {
          foundEmail = uEmail;
          break;
        }
      }
    }

    if (foundEmail && db.users[foundEmail]) {
      return db.users[foundEmail];
    }
    return null;
  };

  return {
    name: 'api-mock-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url || '';
        const db = getDb();

        // --- AUTH API ---
        if (url.startsWith('/api/v1/auth/login') || url.startsWith('/api/auth/login')) {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              let parsed: any = {};
              try { parsed = JSON.parse(body); } catch (e) {}
              const email = (parsed.email || '').toLowerCase().trim();
              const password = parsed.password || '';

              res.setHeader('Content-Type', 'application/json');

              const user = db.users[email];
              if (!user) {
                res.statusCode = 401;
                res.end(JSON.stringify({ message: 'Email not registered. Please register first.' }));
                return;
              }

              if (user.password && password && user.password !== password) {
                res.statusCode = 401;
                res.end(JSON.stringify({ message: 'Invalid password. Please try again.' }));
                return;
              }

              const role = user.role;
              res.statusCode = 200;
              res.end(JSON.stringify({
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.certibid_token_' + encodeURIComponent(email) + '_' + Date.now(),
                role: role,
                vendorId: user.bidderId || 'VND-10029',
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: role,
                  roleTitle: user.roleTitle,
                  department: user.department,
                  organization: user.organization,
                  companyName: user.organization,
                  taxId: user.taxId,
                  phone: user.phone,
                  bidderId: user.bidderId,
                  avatar: user.avatar
                }
              }));
            });
            return;
          }
        }

        if (url.startsWith('/api/v1/auth/register') || url.startsWith('/api/auth/register')) {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              let parsed: any = {};
              try { parsed = JSON.parse(body); } catch (e) {}
              const email = (parsed.email || '').toLowerCase().trim();
              const reqRole = (parsed.role || '').toUpperCase().trim();

              res.setHeader('Content-Type', 'application/json');

              if (email === 'admin@certibid.com' || email === 'officer@certibid.com' || reqRole === 'ADMIN' || reqRole === 'OFFICER') {
                res.statusCode = 400;
                res.end(JSON.stringify({ message: 'Cannot register Admin or Officer accounts. Registration is for Bidders only.' }));
                return;
              }

              if (db.users[email]) {
                res.statusCode = 400;
                res.end(JSON.stringify({ message: 'Email is already registered' }));
                return;
              }

              const newUserId = 'usr-bidder-' + Date.now();
              const bidderId = 'VND-' + Math.floor(10000 + Math.random() * 90000);
              const companyName = parsed.companyName || 'Corporate Entity';
              const contactPerson = parsed.contactPerson || companyName;
              const taxId = parsed.taxId || null;
              const category = parsed.category || 'Information Technology & Security';
              const phone = parsed.phone || null;

              const newUser = {
                id: newUserId,
                name: contactPerson,
                email: email,
                password: parsed.password || 'password123',
                role: 'BIDDER',
                roleTitle: 'Corporate Representative',
                organization: companyName,
                companyName: companyName,
                department: category,
                category: category,
                bidderId: bidderId,
                taxId: taxId,
                phone: phone,
                avatar: contactPerson.substring(0, 2).toUpperCase()
              };

              db.users[email] = newUser;

              db.vendors[bidderId] = {
                id: bidderId,
                companyName: companyName,
                registrationNumber: 'REG-' + Date.now().toString().slice(-6),
                taxId: taxId,
                category: category,
                rating: null,
                eligibilityScore: null,
                riskScore: null,
                riskLevel: null,
                verificationStatus: 'Pending Verification',
                financialHealth: null,
                blacklisted: false,
                contactPerson: contactPerson,
                email: email,
                phone: phone,
                address: 'Registered Office',
                completedProjectsCount: 0,
                annualTurnover: null,
                emdBalance: 0,
                joinedDate: new Date().toISOString().split('T')[0]
              };

              saveDb(db);

              res.statusCode = 200;
              res.end(JSON.stringify({
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.certibid_token_' + encodeURIComponent(email) + '_' + Date.now(),
                role: 'BIDDER',
                vendorId: bidderId,
                user: {
                  id: newUser.id,
                  name: newUser.name,
                  email: newUser.email,
                  role: 'BIDDER',
                  roleTitle: newUser.roleTitle,
                  department: newUser.department,
                  organization: newUser.organization,
                  companyName: newUser.organization,
                  taxId: newUser.taxId,
                  phone: newUser.phone,
                  bidderId: newUser.bidderId,
                  avatar: newUser.avatar
                }
              }));
            });
            return;
          }
        }

        // --- USERS API ---
        if (url.startsWith('/api/v1/users') || url.startsWith('/api/users')) {
          res.setHeader('Content-Type', 'application/json');
          const cleanUrl = url.split('?')[0];

          if (req.method === 'GET') {
            const usersList = Object.values(db.users).map((u: any) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              roleTitle: u.roleTitle || (u.role === 'ADMIN' ? 'Chief Technology Officer' : u.role === 'OFFICER' ? 'Procurement Officer' : 'Managing Director'),
              department: u.department || u.organization || 'General Operations',
              organization: u.organization || u.companyName || 'CertiBid AI',
              status: u.status || 'Active',
              bidderId: u.bidderId,
              avatar: u.avatar || (u.name ? u.name.slice(0, 2).toUpperCase() : 'US')
            }));
            res.statusCode = 200;
            res.end(JSON.stringify(usersList));
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              let parsed: any = {};
              try { parsed = JSON.parse(body); } catch (e) {}
              const email = (parsed.email || '').toLowerCase().trim();
              if (!email) {
                res.statusCode = 400;
                res.end(JSON.stringify({ message: 'Email is required' }));
                return;
              }
              const newUserId = 'usr-' + (parsed.role ? parsed.role.toLowerCase() : 'user') + '-' + Date.now().toString().slice(-4);
              const newUser = {
                id: newUserId,
                name: parsed.name || 'System User',
                email: email,
                password: parsed.password || 'password123',
                role: (parsed.role || 'BIDDER').toUpperCase(),
                roleTitle: parsed.roleTitle || (parsed.role === 'ADMIN' ? 'Administrator' : parsed.role === 'OFFICER' ? 'Procurement Officer' : 'Managing Director'),
                department: parsed.department || 'Operations',
                organization: parsed.organization || 'CertiBid Entity',
                status: 'Active',
                bidderId: parsed.bidderId || (parsed.role === 'BIDDER' ? ('VND-' + Math.floor(10000 + Math.random() * 90000)) : undefined),
                avatar: (parsed.name || 'US').slice(0, 2).toUpperCase()
              };
              db.users[email] = newUser;
              saveDb(db);
              res.statusCode = 201;
              res.end(JSON.stringify(newUser));
            });
            return;
          }

          if (req.method === 'DELETE') {
            const userId = cleanUrl.split('/').pop();
            let foundEmail = '';
            for (const em in db.users) {
              if (db.users[em].id === userId) {
                foundEmail = em;
                break;
              }
            }
            if (foundEmail) {
              delete db.users[foundEmail];
              saveDb(db);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, message: 'User deleted successfully' }));
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Not Found', message: 'User not found' }));
            }
            return;
          }
        }

        // --- VENDORS / ORGANIZATIONS API ---
        if (
          (url.startsWith('/api/v1/vendors') || url.startsWith('/api/vendors')) &&
          !url.includes('/me')
        ) {
          res.setHeader('Content-Type', 'application/json');
          const cleanUrl = url.split('?')[0];

          // GET /api/v1/vendors (List all)
          if (req.method === 'GET' && (cleanUrl === '/api/v1/vendors' || cleanUrl === '/api/vendors')) {
            const vendorsList = Object.values(db.vendors);
            res.statusCode = 200;
            res.end(JSON.stringify(vendorsList));
            return;
          }

          // GET /api/v1/vendors/:id (Single)
          if (req.method === 'GET') {
            const vendorId = cleanUrl.split('/').pop();
            const vendor = db.vendors[vendorId] || Object.values(db.vendors).find((v: any) => v.id === vendorId);
            if (vendor) {
              res.statusCode = 200;
              res.end(JSON.stringify(vendor));
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Not Found', message: 'Vendor organization not found' }));
            }
            return;
          }

          // PUT /api/v1/vendors/:id/verify or PUT /api/v1/vendors/:id
          if (req.method === 'PUT') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              let parsed: any = {};
              try { parsed = JSON.parse(body); } catch (e) {}

              const parts = cleanUrl.split('/');
              const vendorId = parts.includes('verify') ? parts[parts.indexOf('verify') - 1] : parts.pop();
              const vendor = db.vendors[vendorId] || Object.values(db.vendors).find((v: any) => v.id === vendorId);

              if (!vendor) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not Found', message: 'Vendor not found' }));
                return;
              }

              if (parsed.verificationStatus) vendor.verificationStatus = parsed.verificationStatus;
              if (parsed.riskLevel) vendor.riskLevel = parsed.riskLevel;
              if (parsed.riskScore !== undefined) vendor.riskScore = parsed.riskScore;
              if (parsed.rating !== undefined) vendor.rating = parsed.rating;
              if (parsed.eligibilityScore !== undefined) vendor.eligibilityScore = parsed.eligibilityScore;

              for (const uEmail in db.users) {
                if (db.users[uEmail].bidderId === vendor.id) {
                  db.users[uEmail].verificationStatus = vendor.verificationStatus;
                }
              }

              saveDb(db);
              res.statusCode = 200;
              res.end(JSON.stringify(vendor));
            });
            return;
          }
        }

        // --- BIDDER PROFILE API ---
        if (
          url.startsWith('/api/v1/bidders/me') || url.startsWith('/api/bidders/me') ||
          url.startsWith('/api/v1/vendors/me') || url.startsWith('/api/vendors/me')
        ) {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            const user = getAuthenticatedUser(req, db);

            if (!user) {
              res.statusCode = 401;
              res.end(JSON.stringify({ message: 'Unauthorized' }));
              return;
            }

            const vendorId = user.bidderId;
            let vendorProfile = db.vendors[vendorId];
            if (!vendorProfile) {
              vendorProfile = {
                id: vendorId,
                companyName: user.organization || user.companyName || user.name,
                registrationNumber: 'REG-' + Date.now().toString().slice(-6),
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
              db.vendors[vendorId] = vendorProfile;
              saveDb(db);
            }

            res.statusCode = 200;
            res.end(JSON.stringify(vendorProfile));
            return;
          }
        }

        // --- TENDERS API & TENDER REGISTRATION & AWARD ---
        if (url.startsWith('/api/v1/tenders') || url.startsWith('/api/tenders')) {
          res.setHeader('Content-Type', 'application/json');
          const user = getAuthenticatedUser(req, db);

          // POST /api/v1/tenders/:id/select-bidder (Procurement Officer selects preferred bidder)
          if (req.method === 'POST' && url.includes('/select-bidder')) {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              let parsed: any = {};
              try { parsed = JSON.parse(body); } catch (e) {}

              const parts = url.split('?')[0].split('/');
              const tenderId = parts[parts.indexOf('select-bidder') - 1];
              const bidId = parsed.bidId;

              const tender = db.tenders.find((t: any) => t.id === tenderId);
              if (!tender) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not Found', message: 'Tender not found' }));
                return;
              }

              if (tender.status === 'Awarded') {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Bad Request', message: 'This tender is already awarded.' }));
                return;
              }

              const selectedBid = db.bids.find((b: any) => b.id === bidId && b.tenderId === tenderId);
              if (!selectedBid) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not Found', message: 'Selected bid not found for this tender' }));
                return;
              }

              const oldStatus = tender.status;

              // Update Tender state
              tender.selectedBidId = selectedBid.id;
              tender.selectedVendorId = selectedBid.vendorId;
              tender.selectedVendorName = selectedBid.vendorName || selectedBid.bidderName;
              tender.selectedBidAmount = selectedBid.proposedAmount;
              tender.selectedAt = new Date().toISOString();
              tender.status = 'Bidder Selected';

              // Update Bids: set selected bid to 'Selected', revert others from 'Selected' back to 'Submitted'
              db.bids.forEach((b: any) => {
                if (b.tenderId === tenderId) {
                  if (b.id === selectedBid.id) {
                    b.status = 'Selected';
                  } else if (b.status === 'Selected') {
                    b.status = 'Submitted';
                  }
                }
              });

              // Notify Selected Bidder ONLY
              if (!db.notifications) db.notifications = [];
              const winnerVendor = db.vendors[selectedBid.vendorId] || Object.values(db.vendors).find((v: any) => v.id === selectedBid.vendorId || v.companyName === selectedBid.vendorName);
              const bidderEmail = selectedBid.vendorEmail || (winnerVendor ? winnerVendor.email : 'vendor@certibid.com');

              db.notifications.unshift({
                id: 'NTF-' + Math.floor(1000 + Math.random() * 9000),
                userId: selectedBid.vendorId,
                recipientEmail: bidderEmail,
                role: 'BIDDER',
                title: 'Bidder Selected',
                message: `Your bid for Tender ${tender.id} – ${tender.title} has been selected for award review.\n\nTender ID: ${tender.id}\nTender Title: ${tender.title}\nBid ID: ${selectedBid.id}\nBidder Name: ${selectedBid.vendorName || selectedBid.bidderName}\nProposed Amount: ₹${(selectedBid.proposedAmount || 0).toLocaleString()}\nStatus: Bidder Selected\n\nPlease check CertiBid for further updates.`,
                type: 'Selection',
                tenderId: tender.id,
                tenderTitle: tender.title,
                bidId: selectedBid.id,
                bidderName: selectedBid.vendorName || selectedBid.bidderName,
                selectedBidAmount: selectedBid.proposedAmount,
                status: 'Bidder Selected',
                read: false,
                timestamp: new Date().toISOString(),
                time: 'Just now'
              });

              // Audit Log
              if (!db.auditLogs) db.auditLogs = [];
              db.auditLogs.unshift({
                id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
                action: 'BIDDER_SELECTED',
                category: 'Evaluation',
                entityId: tender.id,
                performedBy: user ? `${user.name} (${user.roleTitle || user.role})` : 'Sarah Connor (Senior Procurement Officer)',
                userRole: 'OFFICER',
                timestamp: new Date().toISOString(),
                details: `Officer selected proposal ${selectedBid.id} (${tender.selectedVendorName}) for tender ${tender.id}.`,
                metadata: {
                  tenderId: tender.id,
                  bidId: selectedBid.id,
                  selectedBidderId: selectedBid.vendorId,
                  officerId: user?.id || 'usr-officer-001',
                  timestamp: new Date().toISOString(),
                  previousStatus: oldStatus,
                  newStatus: 'Bidder Selected'
                }
              });

              saveDb(db);

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                message: 'Bidder selected successfully. The bidder has been notified.',
                tender,
                selectedBid
              }));
            });
            return;
          }

          // POST /api/v1/tenders/:id/escalate-to-admin (Procurement Officer escalates tender to Admin)
          if (req.method === 'POST' && url.includes('/escalate-to-admin')) {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              let parsed: any = {};
              try { parsed = JSON.parse(body); } catch (e) {}

              const parts = url.split('?')[0].split('/');
              const tenderId = parts[parts.indexOf('escalate-to-admin') - 1];

              const tender = db.tenders.find((t: any) => t.id === tenderId);
              if (!tender) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not Found', message: 'Tender not found' }));
                return;
              }

              // Check if already escalated to prevent duplicate escalation
              if (
                tender.status === 'Pending Admin Review' ||
                tender.status === 'PENDING_ADMIN_REVIEW' ||
                tender.status === 'PENDING_ADMIN_APPROVAL' ||
                tender.escalatedToAdmin
              ) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Bad Request', message: 'This tender is already escalated and pending Admin review.' }));
                return;
              }

              const oldStatus = tender.status;

              // FLOW B: ESCALATE TO ADMIN
              // Update Tender state to Pending Admin Review without forcing bidder selection
              tender.status = 'Pending Admin Review';
              tender.rawStatus = 'PENDING_ADMIN_REVIEW';
              tender.escalatedToAdmin = true;
              tender.escalatedAt = new Date().toISOString();
              tender.escalatedBy = user?.name || 'Sarah Connor';
              tender.escalatedByOfficerId = user?.id || 'usr-officer-001';
              tender.escalationOfficerComment = parsed.comment || 'Tender escalated by Procurement Officer for senior governance review.';

              const bidId = parsed.bidId || tender.selectedBidId;
              const targetBid = bidId ? db.bids.find((b: any) => b.id === bidId && b.tenderId === tenderId) : null;

              // Dispatch Notification to ADMIN ONLY
              if (!db.notifications) db.notifications = [];
              db.notifications.unshift({
                id: 'NTF-' + Math.floor(1000 + Math.random() * 9000),
                userId: 'ALL_ADMINS',
                recipientEmail: 'admin@certibid.com',
                role: 'ADMIN',
                title: 'Bid Escalated for Review',
                message: `Procurement Officer has escalated Tender ${tender.id} – ${tender.title} for Admin review.\n\nTender ID: ${tender.id}\nTender Title: ${tender.title}\nEscalated By: ${tender.escalatedBy}\nStatus: Pending Admin Review\n${targetBid ? `Proposal ID: ${targetBid.id} (${targetBid.vendorName || targetBid.bidderName})` : ''}`,
                type: 'Escalation',
                tenderId: tender.id,
                tenderTitle: tender.title,
                officerName: tender.escalatedBy,
                officerId: tender.escalatedByOfficerId,
                status: 'Pending Admin Review',
                bidId: targetBid ? targetBid.id : null,
                read: false,
                timestamp: new Date().toISOString(),
                time: 'Just now'
              });

              // Audit Log
              if (!db.auditLogs) db.auditLogs = [];
              db.auditLogs.unshift({
                id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
                action: 'BID_ESCALATED',
                category: 'Escalation',
                entityId: tender.id,
                performedBy: user ? `${user.name} (${user.roleTitle || user.role})` : 'Sarah Connor (Senior Procurement Officer)',
                userRole: 'OFFICER',
                timestamp: new Date().toISOString(),
                details: `Procurement Officer escalated Tender ${tender.id} (${tender.title}) for Admin review.`,
                metadata: {
                  tenderId: tender.id,
                  bidId: targetBid ? targetBid.id : null,
                  officerId: user?.id || 'usr-officer-001',
                  timestamp: new Date().toISOString(),
                  previousStatus: oldStatus,
                  newStatus: 'Pending Admin Review',
                  reason: tender.escalationOfficerComment
                }
              });

              saveDb(db);

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                message: 'Tender escalated to Admin successfully. The Admin has been notified.',
                tender
              }));
            });
            return;
          }

          // POST /api/v1/tenders/:id/approve-award (Admin approves award)
          if (req.method === 'POST' && url.includes('/approve-award')) {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              let parsed: any = {};
              try { parsed = JSON.parse(body); } catch (e) {}

              const parts = url.split('?')[0].split('/');
              const tenderId = parts[parts.indexOf('approve-award') - 1];

              const tender = db.tenders.find((t: any) => t.id === tenderId);
              if (!tender) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not Found', message: 'Tender not found' }));
                return;
              }

              const bidId = parsed.bidId || tender.selectedBidId || (db.bids.find((b: any) => b.tenderId === tenderId && (b.status === 'Selected' || b.status === 'PENDING_ADMIN_APPROVAL'))?.id);
              const winningBid = db.bids.find((b: any) => b.id === bidId);
              if (!winningBid) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not Found', message: 'Winning bid not found' }));
                return;
              }

              const notes = parsed.notes || 'Admin approved contract award to selected bidder after committee governance review.';

              // 1. Update Tender
              tender.status = 'Awarded';
              tender.awardedBidId = winningBid.id;
              tender.awardedVendorId = winningBid.vendorId;
              tender.awardedVendorName = winningBid.vendorName || winningBid.bidderName;
              tender.awardedAmount = winningBid.proposedAmount;
              tender.awardedAt = new Date().toISOString();
              tender.awardNotes = notes;
              tender.adminApproved = true;

              // 2. Update Bids
              db.bids.forEach((b: any) => {
                if (b.tenderId === tenderId) {
                  if (b.id === winningBid.id) {
                    b.status = 'Awarded';
                    b.awardNotes = notes;
                    b.awardedAt = tender.awardedAt;
                  } else {
                    b.status = 'Rejected';
                    b.rejectionReason = 'Non-winning proposal in comparative financial/technical evaluation.';
                  }
                }
              });

              // 3. Update Escalation if exists
              if (db.escalations) {
                const esc = db.escalations.find((e: any) => e.bidId === winningBid.id || e.tenderId === tenderId);
                if (esc) {
                  esc.status = 'FINAL_ACCEPTED';
                  esc.adminDecision = 'ACCEPTED';
                  esc.adminDecisionAt = new Date().toISOString();
                  esc.adminComment = notes;
                  esc.adminId = user?.id || 'usr-admin-001';
                  esc.adminName = user?.name || 'System Administrator';
                }
              }

              // 4. Notifications
              if (!db.notifications) db.notifications = [];
              const winnerVendor = db.vendors[winningBid.vendorId] || Object.values(db.vendors).find((v: any) => v.id === winningBid.vendorId || v.companyName === winningBid.vendorName);
              const winnerEmail = winningBid.vendorEmail || (winnerVendor ? winnerVendor.email : 'vendor@certibid.com');

              // Final Award Notification to Winner
              db.notifications.unshift({
                id: 'NTF-' + Math.floor(1000 + Math.random() * 9000),
                userId: winningBid.vendorId,
                recipientEmail: winnerEmail,
                role: 'BIDDER',
                title: 'Tender Awarded',
                message: `Congratulations! You have been officially awarded the tender.\n\nTender: ${tender.title}\nTender ID: ${tender.id}\nWinning Bid: ${winningBid.id}\nAward Amount: ₹${(winningBid.proposedAmount || 0).toLocaleString()}\n\nPlease log in to CertiBid to view the complete award details.`,
                type: 'Award',
                tenderId: tender.id,
                bidId: winningBid.id,
                read: false,
                timestamp: new Date().toISOString(),
                time: 'Just now'
              });

              // Notification to Officer
              db.notifications.unshift({
                id: 'NTF-' + Math.floor(1000 + Math.random() * 9000),
                userId: 'ALL_OFFICERS',
                recipientEmail: 'officer@certibid.com',
                role: 'OFFICER',
                title: 'Tender Award Approved by Admin',
                message: `Admin has approved the contract award for "${tender.title}" to ${tender.awardedVendorName}.`,
                type: 'Award',
                tenderId: tender.id,
                bidId: winningBid.id,
                read: false,
                timestamp: new Date().toISOString(),
                time: 'Just now'
              });

              // Audit Log
              if (!db.auditLogs) db.auditLogs = [];
              db.auditLogs.unshift({
                id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
                action: 'CONTRACT_AWARDED',
                category: 'Award',
                entityId: tender.id,
                performedBy: user ? `${user.name} (${user.roleTitle || user.role})` : 'System Administrator',
                userRole: user?.role || 'ADMIN',
                timestamp: new Date().toISOString(),
                details: `Admin approved and awarded contract "${tender.title}" to ${tender.awardedVendorName} (${winningBid.id}) for ₹${(winningBid.proposedAmount || 0).toLocaleString()}.`
              });

              saveDb(db);

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                message: `Tender ${tender.id} successfully awarded to ${tender.awardedVendorName}.`,
                tender,
                winningBid
              }));
            });
            return;
          }

          // POST /api/v1/tenders/:id/reject-award (Admin rejects proposal)
          if (req.method === 'POST' && url.includes('/reject-award')) {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              let parsed: any = {};
              try { parsed = JSON.parse(body); } catch (e) {}

              const parts = url.split('?')[0].split('/');
              const tenderId = parts[parts.indexOf('reject-award') - 1];

              const tender = db.tenders.find((t: any) => t.id === tenderId);
              if (!tender) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not Found', message: 'Tender not found' }));
                return;
              }

              const reason = parsed.reason || 'Admin returned tender to Procurement Officer for further evaluation.';

              // Revert Tender status
              tender.status = 'Active';
              tender.escalatedToAdmin = false;
              tender.adminRejectionReason = reason;

              // Revert Bids
              db.bids.forEach((b: any) => {
                if (b.tenderId === tenderId && (b.status === 'Selected' || b.status === 'PENDING_ADMIN_APPROVAL')) {
                  b.status = 'Submitted';
                }
              });

              // Update Escalation
              if (db.escalations) {
                const esc = db.escalations.find((e: any) => e.tenderId === tenderId);
                if (esc) {
                  esc.status = 'ADMIN_REJECTED_PENDING_OFFICER';
                  esc.adminDecision = 'REJECTED';
                  esc.adminComment = reason;
                  esc.adminDecisionAt = new Date().toISOString();
                  esc.adminId = user?.id || 'usr-admin-001';
                  esc.adminName = user?.name || 'System Administrator';
                }
              }

              // Notify Officer
              if (!db.notifications) db.notifications = [];
              db.notifications.unshift({
                id: 'NTF-' + Math.floor(1000 + Math.random() * 9000),
                userId: 'ALL_OFFICERS',
                recipientEmail: 'officer@certibid.com',
                role: 'OFFICER',
                title: 'Tender Escalation Rejected by Admin',
                message: `Admin has rejected the proposed award for "${tender.title}".\nReason: ${reason}`,
                type: 'Escalation',
                tenderId: tender.id,
                read: false,
                timestamp: new Date().toISOString(),
                time: 'Just now'
              });

              // Audit Log
              if (!db.auditLogs) db.auditLogs = [];
              db.auditLogs.unshift({
                id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
                action: 'ADMIN_REJECTED_AWARD',
                category: 'Escalation',
                entityId: tender.id,
                performedBy: user ? `${user.name} (${user.roleTitle || user.role})` : 'System Administrator',
                userRole: user?.role || 'ADMIN',
                timestamp: new Date().toISOString(),
                details: `Admin rejected proposed award for tender ${tender.id}. Reason: ${reason}`
              });

              saveDb(db);

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                message: 'Tender award proposal rejected and returned to Procurement Officer.',
                tender
              }));
            });
            return;
          }

          // POST /api/v1/tenders/:id/award
          if (req.method === 'POST' && url.includes('/award')) {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              let parsed: any = {};
              try { parsed = JSON.parse(body); } catch (e) {}

              const parts = url.split('?')[0].split('/');
              const tenderId = parts[parts.indexOf('award') - 1];
              const bidId = parsed.bidId;
              const notes = parsed.notes || 'Evaluation committee confirmed L1 compliance and approved final contract award.';

              const tender = db.tenders.find((t: any) => t.id === tenderId);
              if (!tender) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not Found', message: 'Tender not found' }));
                return;
              }

              const winningBid = db.bids.find((b: any) => b.id === bidId);
              if (!winningBid) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not Found', message: 'Bid not found' }));
                return;
              }

              // 1. Transaction-safe Tender update
              tender.status = 'Awarded';
              tender.awardedBidId = winningBid.id;
              tender.awardedVendorId = winningBid.vendorId;
              tender.awardedVendorName = winningBid.vendorName || winningBid.bidderName;
              tender.awardedAmount = winningBid.proposedAmount;
              tender.awardedAt = new Date().toISOString();
              tender.awardNotes = notes;

              // 2. Transaction-safe Bids update
              db.bids.forEach((b: any) => {
                if (b.tenderId === tenderId) {
                  if (b.id === winningBid.id) {
                    b.status = 'Awarded';
                    b.awardNotes = notes;
                    b.awardedAt = tender.awardedAt;
                  } else {
                    b.status = 'Rejected';
                    b.rejectionReason = 'Non-winning proposal in comparative financial/technical evaluation.';
                  }
                }
              });

              // 3. Backend-driven Notifications
              if (!db.notifications) db.notifications = [];
              
              const winnerVendor = db.vendors[winningBid.vendorId] || Object.values(db.vendors).find((v: any) => v.id === winningBid.vendorId || v.companyName === winningBid.vendorName);
              const winnerEmail = winningBid.vendorEmail || (winnerVendor ? winnerVendor.email : 'vendor@certibid.com');

              db.notifications.unshift({
                id: 'NTF-' + Math.floor(1000 + Math.random() * 9000),
                userId: winningBid.vendorId,
                recipientEmail: winnerEmail,
                role: 'BIDDER',
                title: 'Contract Awarded! 🎉',
                message: `Congratulations! Your proposal for "${tender.title}" (${tender.id}) has been formally awarded. Contract Value: ₹${(winningBid.proposedAmount || 0).toLocaleString()}.`,
                type: 'Award',
                tenderId: tender.id,
                bidId: winningBid.id,
                read: false,
                timestamp: new Date().toISOString(),
                time: 'Just now'
              });

              db.notifications.unshift({
                id: 'NTF-' + Math.floor(1000 + Math.random() * 9000),
                userId: 'ALL_OFFICERS',
                recipientEmail: 'officer@certibid.com',
                role: 'OFFICER',
                title: `Tender Awarded: ${tender.id}`,
                message: `Formal award letter issued to ${tender.awardedVendorName} for ${tender.title}.`,
                type: 'Award',
                tenderId: tender.id,
                bidId: winningBid.id,
                read: false,
                timestamp: new Date().toISOString(),
                time: 'Just now'
              });

              // 4. Audit Log entry
              if (!db.auditLogs) db.auditLogs = [];
              db.auditLogs.unshift({
                id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
                action: 'CONTRACT_AWARDED',
                category: 'Award',
                entityId: tender.id,
                performedBy: user ? `${user.name} (${user.roleTitle || user.role})` : 'Procurement Committee',
                userRole: user?.role || 'OFFICER',
                timestamp: new Date().toISOString(),
                details: `Awarded contract "${tender.title}" to ${tender.awardedVendorName} (${winningBid.id}) for ₹${(winningBid.proposedAmount || 0).toLocaleString()}.`
              });

              saveDb(db);

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                message: 'Contract successfully awarded',
                tender: tender,
                winningBid: winningBid
              }));
            });
            return;
          }

          // POST /api/v1/tenders (Create new tender)
          if (req.method === 'POST' && !url.includes('/register') && !url.includes('/award')) {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              let parsed: any = {};
              try { parsed = JSON.parse(body); } catch (e) {}
              const newTenderId = 'TND-2026-' + Math.floor(1000 + Math.random() * 9000);
              const newTender = {
                id: newTenderId,
                title: parsed.title || 'New Government Procurement Tender',
                department: parsed.department || 'Ministry of Infrastructure',
                category: parsed.category || 'Civil Construction & Infrastructure',
                budget: Number(parsed.budget) || 45000000,
                submissionDeadline: parsed.deadline || parsed.submissionDeadline || '2026-09-30',
                publishingDate: new Date().toISOString().split('T')[0],
                openingDate: parsed.openingDate || '2026-10-01',
                status: 'Active',
                riskLevel: 'Low',
                aiRiskScore: 12,
                eligibleVendorsCount: 10,
                bidsCount: 0,
                location: parsed.location || 'Central Capital Region',
                description: parsed.description || 'Public procurement project requirements and specifications.',
                requirements: parsed.requirements || [
                  'Valid Tax Clearance Certificate FY 2025-26',
                  'ISO 9001 Quality Certification',
                  'EMD Deposit of 2% of budget'
                ]
              };

              db.tenders.unshift(newTender);

              if (!db.auditLogs) db.auditLogs = [];
              db.auditLogs.unshift({
                id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
                action: 'TENDER_PUBLISHED',
                category: 'Tender',
                entityId: newTender.id,
                performedBy: user ? `${user.name} (${user.roleTitle || user.role})` : 'Procurement Officer',
                userRole: user?.role || 'OFFICER',
                timestamp: new Date().toISOString(),
                details: `Published "${newTender.title}" with allocated budget ₹${(newTender.budget / 10000000).toFixed(2)} Cr.`
              });

              saveDb(db);
              res.statusCode = 201;
              res.end(JSON.stringify(newTender));
            });
            return;
          }

          // POST /api/v1/tenders/:id/register
          if (req.method === 'POST' && url.includes('/register')) {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              if (!user) {
                res.statusCode = 401;
                res.end(JSON.stringify({ error: 'Unauthorized', message: 'Please log in to register for tenders.' }));
                return;
              }

              const pathParts = url.split('?')[0].split('/');
              const registerIdx = pathParts.indexOf('register');
              const tenderId = registerIdx > 0 ? pathParts[registerIdx - 1] : 'TND-2026-8901';

              const tender = db.tenders.find((t: any) => t.id === tenderId) || {
                id: tenderId,
                title: 'Government Procurement Tender',
                budget: 45000000
              };

              const userEmail = (user.email || '').toLowerCase().trim();
              const userBidderId = user.bidderId;

              // PREVENT DUPLICATE REGISTRATION
              const existingBid = db.bids.find((b: any) =>
                b.tenderId === tenderId &&
                ((userBidderId && b.vendorId === userBidderId) ||
                 (b.vendorEmail && b.vendorEmail.toLowerCase() === userEmail))
              );

              if (existingBid) {
                res.statusCode = 409;
                res.end(JSON.stringify({ error: 'Already Registered', message: 'You are already registered for this tender.' }));
                return;
              }

              const newBidId = 'BID-' + Math.floor(1000 + Math.random() * 9000);
              const newTxnId = 'TXN-EMD-' + Math.floor(100000 + Math.random() * 900000);
              const budget = tender.budget || 50000000;
              const emdAmount = Math.round(budget * 0.02);
              const companyName = user.organization || user.companyName || user.name || 'Registered Bidder';

              const newBid = {
                id: newBidId,
                tenderId: tender.id,
                tenderTitle: tender.title,
                vendorId: userBidderId || ('VND-' + Math.floor(10000 + Math.random() * 90000)),
                vendorName: companyName,
                bidderName: companyName,
                vendorEmail: user.email,
                proposedAmount: budget,
                currency: 'INR',
                estimatedCompletionTime: '12 Months',
                bidScore: 95.0,
                aiRiskScore: 10,
                riskLevel: 'Low',
                status: 'Registered',
                emdPaymentStatus: 'Verified & Paid',
                emdAmount: emdAmount,
                emdTransactionId: newTxnId,
                submissionDate: new Date().toISOString().split('T')[0],
                submittedAt: new Date().toISOString().split('T')[0]
              };

              db.bids.unshift(newBid);

              const newTxn = {
                id: newTxnId,
                tenderId: tender.id,
                tenderTitle: tender.title,
                bidId: newBidId,
                vendorId: newBid.vendorId,
                vendorName: companyName,
                userEmail: user.email,
                transactionType: 'EMD Deposit',
                amount: emdAmount,
                currency: 'INR',
                status: 'Completed',
                date: new Date().toISOString().split('T')[0],
                receiptUrl: '#',
                invoiceNo: 'INV-2026-' + Math.floor(100 + Math.random() * 900)
              };

              db.transactions.unshift(newTxn);

              saveDb(db);

              res.statusCode = 201;
              res.end(JSON.stringify({ success: true, message: 'Successfully registered for tender', data: newBid }));
            });
            return;
          }

          // GET /api/v1/tenders/:tenderId/bidders OR /api/tenders/:tenderId/bidders
          if (req.method === 'GET' && url.includes('/bidders')) {
            const cleanUrl = url.split('?')[0];
            const parts = cleanUrl.split('/');
            const biddersIdx = parts.indexOf('bidders');
            const tenderId = biddersIdx > 0 ? parts[biddersIdx - 1] : '';

            const tender = db.tenders.find((t: any) => t.id === tenderId);
            if (!tender) {
              res.statusCode = 404;
              res.end(JSON.stringify({
                error: 'Not Found',
                message: `Tender ${tenderId} not found.`
              }));
              return;
            }

            // FILTER BIDS strictly for THIS SELECTED TENDER ID ONLY
            const tenderBids = db.bids.filter((b: any) => b.tenderId === tenderId);

            // MAP to bidder registered information
            const biddersForTender = tenderBids.map((b: any) => {
              const vendor = db.vendors[b.vendorId] || Object.values(db.vendors).find((v: any) => v.id === b.vendorId || v.companyName === b.vendorName);
              const escalation = db.escalations.find((e: any) => e.tenderId === tenderId && e.bidId === b.id);

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

            res.statusCode = 200;
            res.end(JSON.stringify({
              tenderId: tender.id,
              tenderTitle: tender.title,
              department: tender.department,
              budget: tender.budget,
              registeredBiddersCount: biddersForTender.length,
              escalatedBidsCount: biddersForTender.filter((b: any) => b.isEscalated).length,
              bidders: biddersForTender
            }));
            return;
          }

          // GET /api/v1/tenders (List)
          if (req.method === 'GET' && (url === '/api/v1/tenders' || url.startsWith('/api/v1/tenders?') || url === '/api/tenders' || url.startsWith('/api/tenders?'))) {
            res.statusCode = 200;
            res.end(JSON.stringify(db.tenders));
            return;
          }

          // GET /api/v1/tenders/:id (Single)
          if (req.method === 'GET') {
            const tenderId = url.split('?')[0].split('/').pop();
            const tender = db.tenders.find((t: any) => t.id === tenderId);
            if (tender) {
              res.statusCode = 200;
              res.end(JSON.stringify(tender));
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Not Found', message: 'Tender not found' }));
            }
            return;
          }
        }

        // --- UNIVERSAL PDF GENERATOR ENGINE FOR CERTIFICATES, TENDERS, BIDS, AWARDS & RECEIPTS ---
        function generateStandardPdf(docConfig: {
          title: string;
          subtitle?: string;
          docNumber?: string;
          statusBadge?: string;
          metadata?: Array<{ label: string; value: string }>;
          sections?: Array<{ title: string; lines: string[] }>;
          footer?: string;
        }): Buffer {
          const textOps: string[] = [];
          
          // Header background decorative bar
          textOps.push('0.04 0.20 0.26 rg'); // Primary Deep Teal
          textOps.push('BT /F1 15 Tf 45 745 Td (' + (docConfig.title || 'CertiBid AI Official Document').replace(/[\(\)\\\r\n]/g, ' ') + ') Tj ET');
          
          if (docConfig.subtitle) {
            textOps.push('0.08 0.55 0.58 rg'); // Cyan Teal
            textOps.push('BT /F2 9.5 Tf 45 728 Td (' + docConfig.subtitle.replace(/[\(\)\\\r\n]/g, ' ') + ') Tj ET');
          }

          if (docConfig.statusBadge) {
            textOps.push('0.10 0.65 0.45 rg'); // Emerald
            textOps.push('BT /F1 9 Tf 440 745 Td ([ ' + docConfig.statusBadge.replace(/[\(\)\\\r\n]/g, ' ') + ' ]) Tj ET');
          }

          // Top divider
          textOps.push('0.75 0.82 0.85 RG 1 w 45 715 m 565 715 l S');

          let y = 695;

          // Metadata Grid (2 Columns)
          if (docConfig.metadata && docConfig.metadata.length > 0) {
            textOps.push('0.15 0.22 0.28 rg');
            for (let i = 0; i < docConfig.metadata.length; i += 2) {
              const item1 = docConfig.metadata[i];
              const item2 = docConfig.metadata[i + 1];

              if (item1) {
                textOps.push('BT /F1 9 Tf 45 ' + y + ' Td (' + item1.label.replace(/[\(\)\\\r\n]/g, ' ') + ':) Tj ET');
                textOps.push('BT /F2 9 Tf 150 ' + y + ' Td (' + String(item1.value || 'N/A').replace(/[\(\)\\\r\n]/g, ' ') + ') Tj ET');
              }
              if (item2) {
                textOps.push('BT /F1 9 Tf 320 ' + y + ' Td (' + item2.label.replace(/[\(\)\\\r\n]/g, ' ') + ':) Tj ET');
                textOps.push('BT /F2 9 Tf 420 ' + y + ' Td (' + String(item2.value || 'N/A').replace(/[\(\)\\\r\n]/g, ' ') + ') Tj ET');
              }
              y -= 16;
            }
            y -= 6;
            // Divider
            textOps.push('0.85 0.88 0.90 RG 0.5 w 45 ' + y + ' m 565 ' + y + ' l S');
            y -= 16;
          }

          // Sections with titles and bullet points / paragraphs
          if (docConfig.sections && docConfig.sections.length > 0) {
            for (const sec of docConfig.sections) {
              if (y < 120) break; // page boundary protection
              textOps.push('0.04 0.20 0.26 rg');
              textOps.push('BT /F1 10.5 Tf 45 ' + y + ' Td (' + sec.title.replace(/[\(\)\\\r\n]/g, ' ') + ') Tj ET');
              y -= 14;

              textOps.push('0.20 0.25 0.30 rg');
              for (const line of sec.lines) {
                if (y < 90) break;
                textOps.push('BT /F2 8.5 Tf 50 ' + y + ' Td (' + line.replace(/[\(\)\\\r\n]/g, ' ') + ') Tj ET');
                y -= 13;
              }
              y -= 8;
            }
          }

          // Cryptographic Security Seal & Watermark Box at bottom
          textOps.push('0.92 0.96 0.97 rg 45 48 520 28 re f');
          textOps.push('0.70 0.80 0.84 RG 0.5 w 45 48 520 28 re S');
          textOps.push('0.10 0.40 0.45 rg');
          textOps.push('BT /F1 7.5 Tf 55 64 Td (CertiBid AI Digital Trust Protocol: SHA-256 Verified Immutable Record) Tj ET');
          textOps.push('0.35 0.45 0.50 rg');
          const sealDate = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
          textOps.push('BT /F2 7 Tf 55 54 Td (Audit Ledger Stamp: ' + (docConfig.docNumber || 'DOC-GEN') + ' | ' + sealDate + ' | Department of Public Procurement) Tj ET');

          // Footer
          textOps.push('0.5 0.55 0.60 rg');
          textOps.push('BT /F2 7.5 Tf 45 32 Td (' + (docConfig.footer || 'This document is generated by CertiBid AI and holds legal evidentiary validity under the Public Procurement Act.').replace(/[\(\)\\\r\n]/g, ' ') + ') Tj ET');

          const streamContent = textOps.join('\n');
          const streamLen = Buffer.byteLength(streamContent, 'utf-8');

          let out = '%PDF-1.4\n';
          const offsets: number[] = [];

          function addObj(content: string) {
            offsets.push(Buffer.byteLength(out, 'utf-8'));
            out += offsets.length + ' 0 obj\n' + content + '\nendobj\n';
          }

          addObj('<< /Type /Catalog /Pages 2 0 R >>');
          addObj('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
          addObj('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>');
          addObj('<< /Length ' + streamLen + ' >>\nstream\n' + streamContent + '\nendstream');
          addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
          addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

          const startxref = Buffer.byteLength(out, 'utf-8');
          out += 'xref\n0 ' + (offsets.length + 1) + '\n0000000000 65535 f \n';
          for (const off of offsets) {
            out += String(off).padStart(10, '0') + ' 00000 n \n';
          }
          out += 'trailer\n<< /Size ' + (offsets.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + startxref + '\n%%EOF';
          return Buffer.from(out, 'utf-8');
        }

        // --- DOCUMENTS & FILES API WITH PERSISTENT FILE STORAGE & STRICT AUTHORIZATION ---
        const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'certificates');
        if (!fs.existsSync(UPLOADS_DIR)) {
          try { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch (e) {}
        }

        // UNIVERSAL FILE DOWNLOAD ROUTE: /api/files/:id/download or /api/v1/files/:id/download
        if (req.method === 'GET' && (
          url.startsWith('/api/files/') || 
          url.startsWith('/api/v1/files/') ||
          url.startsWith('/api/v1/documents/file/') ||
          url.startsWith('/api/documents/file/')
        )) {
          const user = getAuthenticatedUser(req, db);
          const cleanUrl = url.split('?')[0];

          // 1. Specialized Tender Document Download: /api/files/tender/:tenderId/download
          if (cleanUrl.includes('/files/tender/') || (cleanUrl.split('/').pop()?.startsWith('TND-') && cleanUrl.includes('/tender/'))) {
            const tenderId = cleanUrl.replace('/download', '').split('/').pop() || '';
            const tender = db.tenders.find((t: any) => t.id === tenderId);
            if (!tender) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Not Found', message: 'Tender specification not found' }));
              return;
            }

            const pdfBuf = generateStandardPdf({
              title: 'Government of India - Notice Inviting Tender (NIT)',
              subtitle: `Tender Ref: ${tender.id} | Department: ${tender.department}`,
              docNumber: tender.id,
              statusBadge: tender.status?.toUpperCase() || 'PUBLISHED',
              metadata: [
                { label: 'Tender Title', value: tender.title },
                { label: 'Issuing Department', value: tender.department },
                { label: 'Category', value: tender.category },
                { label: 'Approved Budget Ceiling', value: `INR ${(tender.budget || 0).toLocaleString('en-IN')}` },
                { label: 'Mandatory EMD (2%)', value: `INR ${(tender.emdAmount || Math.round((tender.budget || 50000000) * 0.02)).toLocaleString('en-IN')}` },
                { label: 'Location of Works', value: tender.location || 'Central Capital Region' },
                { label: 'Publishing Date', value: tender.publishingDate || '2026-07-15' },
                { label: 'Submission Deadline', value: tender.submissionDeadline || '2026-08-25' }
              ],
              sections: [
                {
                  title: '1. Project Scope & Detailed Deliverables',
                  lines: [
                    tender.description || 'Comprehensive turnkey project execution including supply, installation, testing, and 3-year warranty maintenance.',
                    'Deliverables include hardware provisioning, software deployment, system integration, and operator training.'
                  ]
                },
                {
                  title: '2. Prequalification & Statutory Compliance Requirements',
                  lines: Array.isArray(tender.requirements) && tender.requirements.length > 0
                    ? tender.requirements.map((r: string) => `• ${r}`)
                    : [
                        '• ISO 27001 / ISO 9001 quality and cybersecurity certifications mandatory.',
                        '• Valid GSTIN and Tax Clearance Certificate for current financial year.',
                        '• Prequalification financial turnover certificate audited by Chartered Accountant.'
                      ]
                },
                {
                  title: '3. Bid Evaluation & AI Anti-Collusion Scrutiny',
                  lines: [
                    '• Bids shall be evaluated through CertiBid AI two-envelope electronic bidding system.',
                    '• Neural collusion detection and anomalous pricing models are active during opening phase.'
                  ]
                }
              ],
              footer: 'Official Tender Notice published under Public Procurement Transparency Rules 2026.'
            });

            const safeFilename = `tender_${tender.id}_specifications.pdf`;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Length', pdfBuf.length);
            res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`);
            res.end(pdfBuf);
            return;
          }

          // 2. Specialized Bid Proposal Download: /api/files/bid/:bidId/download
          if (cleanUrl.includes('/files/bid/') || (cleanUrl.split('/').pop()?.startsWith('BID-') && cleanUrl.includes('/bid/'))) {
            const bidId = cleanUrl.replace('/download', '').split('/').pop() || '';
            const bid = db.bids.find((b: any) => b.id === bidId);
            if (!bid) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Not Found', message: 'Bid proposal not found' }));
              return;
            }

            // Authorization: Bidder can only download their own bid; Officer/Admin/Auditor can download all
            if (user && (user.role === 'BIDDER' || user.role === 'VENDOR')) {
              const isOwner = (user.bidderId && bid.vendorId === user.bidderId) ||
                              (bid.vendorEmail && bid.vendorEmail.toLowerCase() === (user.email || '').toLowerCase());
              if (!isOwner) {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Forbidden', message: 'Access denied: You cannot download proposal submitted by another bidder.' }));
                return;
              }
            }

            const pdfBuf = generateStandardPdf({
              title: 'Official Sealed Commercial & Technical Bid Proposal',
              subtitle: `Bid Reference: ${bid.id} | Tender: ${bid.tenderId}`,
              docNumber: bid.id,
              statusBadge: bid.status?.toUpperCase() || 'SUBMITTED',
              metadata: [
                { label: 'Bid Proposal ID', value: bid.id },
                { label: 'Tender Reference', value: bid.tenderId },
                { label: 'Tender Title', value: bid.tenderTitle || 'National Infrastructure Upgrade' },
                { label: 'Bidder Enterprise', value: bid.vendorName || bid.bidderName || 'Registered Enterprise' },
                { label: 'Quoted Commercial Price', value: `INR ${(bid.proposedAmount || 0).toLocaleString('en-IN')}` },
                { label: 'Completion Timeline', value: bid.estimatedCompletionTime || '12 Months' },
                { label: 'EMD Guarantee Status', value: bid.emdPaymentStatus || 'Verified & Paid' },
                { label: 'Submission Timestamp', value: bid.submittedAt || bid.submissionDate || '2026-08-02' }
              ],
              sections: [
                {
                  title: '1. Commercial Quotation Breakdown',
                  lines: [
                    `• Total All-Inclusive Fixed Contract Price: INR ${(bid.proposedAmount || 0).toLocaleString('en-IN')}`,
                    '• Includes all statutory taxes, customs, transit insurance, and commissioning costs.',
                    `• Earnest Money Deposit (EMD) Reference: ${bid.emdTransactionId || 'TXN-EMD-882910'} (Verified)`
                  ]
                },
                {
                  title: '2. Technical & Governance Attestation',
                  lines: [
                    '• The bidder hereby certifies full compliance with all technical requirements specified in NIT.',
                    '• All uploaded corporate certificates, ISO audit reports, and balance sheets are genuine and current.',
                    `• AI Neural Integrity Confidence Score: ${bid.bidScore || 94}% (Low Risk Classification)`
                  ]
                }
              ],
              footer: 'Cryptographically sealed electronic bid submission record on CertiBid AI.'
            });

            const safeFilename = `bid_${bid.id}_proposal.pdf`;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Length', pdfBuf.length);
            res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`);
            res.end(pdfBuf);
            return;
          }

          // 3. Specialized Award Certificate Download: /api/files/award/:tenderId/download
          if (cleanUrl.includes('/files/award/')) {
            const tenderId = cleanUrl.replace('/download', '').split('/').pop() || '';
            const tender = db.tenders.find((t: any) => t.id === tenderId);
            if (!tender) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Not Found', message: 'Tender record not found' }));
              return;
            }

            const winningBid = db.bids.find((b: any) => b.id === tender.awardedBidId || (b.tenderId === tender.id && b.status === 'Awarded'));
            const vendorName = tender.awardedVendorName || winningBid?.vendorName || 'Acme Construction Services';
            const awardAmount = tender.awardedAmount || winningBid?.proposedAmount || tender.budget || 41200000;
            const awardDate = tender.awardedAt || new Date().toISOString().split('T')[0];

            const pdfBuf = generateStandardPdf({
              title: 'Statutory Government Contract Award & Sanction Order',
              subtitle: `Tender Ref: ${tender.id} | Department: ${tender.department}`,
              docNumber: `AWD-${tender.id}`,
              statusBadge: 'CONTRACT AWARDED & SANCTIONED',
              metadata: [
                { label: 'Tender ID', value: tender.id },
                { label: 'Project Name', value: tender.title },
                { label: 'Awarded Enterprise (L1)', value: vendorName },
                { label: 'Vendor Registration ID', value: tender.awardedVendorId || winningBid?.vendorId || 'VND-10029' },
                { label: 'Sanctioned Contract Value', value: `INR ${awardAmount.toLocaleString('en-IN')}` },
                { label: 'Issuing Department', value: tender.department },
                { label: 'Date of Sanction Order', value: awardDate.slice(0, 10) },
                { label: 'Winning Bid Reference', value: tender.awardedBidId || winningBid?.id || 'BID-9011' }
              ],
              sections: [
                {
                  title: '1. Committee Evaluation & Final Award Summary',
                  lines: [
                    '• The Evaluation Committee has concluded comprehensive technical, financial, and AI risk scrutiny.',
                    `• ${vendorName} emerged as the lowest compliant bidder (L1) with an AI Risk Confidence Score of 94%.`,
                    tender.awardNotes ? `• Committee Decision Notes: ${tender.awardNotes}` : '• Committee confirmed L1 compliance and approved final contract award.'
                  ]
                },
                {
                  title: '2. Contract Execution & Statutory Conditions',
                  lines: [
                    '• The awarded contractor is instructed to furnish the 5% Performance Bank Guarantee within 14 working days.',
                    '• Work Commencement Order shall be issued upon mutual signing of contract agreement.',
                    '• EMD of non-winning bidders has been authorized for automated treasury refund.'
                  ]
                }
              ],
              footer: 'Official Sanction Order generated by CertiBid AI Statutory Governance Registry.'
            });

            const safeFilename = `award_certificate_${tender.id}.pdf`;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Length', pdfBuf.length);
            res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`);
            res.end(pdfBuf);
            return;
          }

          // 4. Specialized Receipt Download: /api/files/receipt/:txnId/download
          if (cleanUrl.includes('/files/receipt/') || (cleanUrl.split('/').pop()?.startsWith('TXN-') && cleanUrl.includes('/receipt/'))) {
            const txnId = cleanUrl.replace('/download', '').split('/').pop() || '';
            const txn = db.transactions.find((t: any) => t.id === txnId) || {
              id: txnId,
              tenderId: 'TND-2026-8901',
              vendorName: user?.organization || user?.companyName || 'Acme Construction Services',
              amount: 900000,
              type: 'EMD Deposit',
              status: 'Completed',
              date: '2026-08-02',
              escrowAccount: 'ESCROW-SBIN-IN-8891'
            };

            const pdfBuf = generateStandardPdf({
              title: 'CertiBid AI Treasury & Escrow Guarantee Registry',
              subtitle: 'Official Earnest Money Deposit (EMD) Receipt & Proof of Payment',
              docNumber: txn.id,
              statusBadge: 'PAYMENT VERIFIED & CLEARED',
              metadata: [
                { label: 'Receipt / Transaction ID', value: txn.id },
                { label: 'Tender Reference', value: txn.tenderId || 'TND-2026-8901' },
                { label: 'Depositing Enterprise', value: txn.vendorName || 'Authenticated Bidder' },
                { label: 'Amount Paid (INR)', value: `INR ${(txn.amount || 900000).toLocaleString('en-IN')}` },
                { label: 'Transaction Type', value: txn.type || 'EMD Escrow Deposit' },
                { label: 'Payment Status', value: txn.status || 'Completed / Escrow Held' },
                { label: 'Escrow Custody Account', value: txn.escrowAccount || 'ESCROW-SBIN-IN-8891' },
                { label: 'Timestamp', value: txn.date || new Date().toISOString().split('T')[0] }
              ],
              sections: [
                {
                  title: '1. Treasury Escrow Deposit Details',
                  lines: [
                    `• Payment of INR ${(txn.amount || 900000).toLocaleString('en-IN')} has been securely credited to the Government Escrow Account.`,
                    '• Funds are held in sovereign custody under the Public Procurement Guarantee Rules.',
                    '• Automated refund will be processed to source account upon tender completion or disqualification.'
                  ]
                }
              ],
              footer: 'Official Electronic Treasury Receipt - CertiBid AI Escrow Ledger System.'
            });

            const safeFilename = `receipt_${txn.id}.pdf`;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Length', pdfBuf.length);
            res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`);
            res.end(pdfBuf);
            return;
          }

          // 5. Specialized Reports Download: /api/files/reports/:reportType/download
          if (cleanUrl.includes('/files/reports/')) {
            const reportType = cleanUrl.replace('/download', '').split('/').pop() || 'full';
            const isPdf = url.includes('format=pdf');

            if (isPdf) {
              const pdfBuf = generateStandardPdf({
                title: 'CertiBid AI - Executive Procurement Audit & Integrity Report',
                subtitle: `Report Scope: ${reportType.toUpperCase()} | Generated: ${new Date().toISOString().split('T')[0]}`,
                docNumber: `RPT-2026-${reportType.toUpperCase()}`,
                statusBadge: 'STATUTORY AUDIT CERTIFIED',
                metadata: [
                  { label: 'Audit Scope', value: 'National Public Procurement Ledger' },
                  { label: 'Total Tenders Tracked', value: String(db.tenders?.length || 8) },
                  { label: 'Total Bids Evaluated', value: String(db.bids?.length || 15) },
                  { label: 'Registered Enterprises', value: String(db.vendors?.length || 12) },
                  { label: 'Overall Collusion Index', value: '1.8% (Negligible)' },
                  { label: 'Total Treasury Volume', value: 'INR 45,80,00,000' }
                ],
                sections: [
                  {
                    title: '1. Executive Summary & Integrity Highlights',
                    lines: [
                      '• 100% of awarded tenders adhered strictly to L1 lowest-cost compliant bidding rules.',
                      '• Zero unauthorized document tampering detected across active evaluation pipelines.',
                      '• AI Neural Scan verified all statutory ISO certifications, KYC, and tax clearance certificates.'
                    ]
                  },
                  {
                    title: '2. Risk & Anomaly Scrutiny Breakdown',
                    lines: [
                      '• High-Risk Proposals Flagged: 0 (All resolved via officer escalation protocols).',
                      '• Moderate Risk / Document Resubmissions: 2 (Properly remediated).',
                      '• Automated Treasury EMD settlements completed with 100% reconciliation accuracy.'
                    ]
                  }
                ],
                footer: 'CertiBid AI Governance & Audit Ledger - Statutory Executive Export.'
              });

              const safeFilename = `CertiBid_Executive_Procurement_Audit_Report.pdf`;
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Length', pdfBuf.length);
              res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`);
              res.end(pdfBuf);
              return;
            } else {
              // CSV Export
              let csvContent = '';
              let safeFilename = 'CertiBid_Report.csv';

              if (reportType === 'annual' || reportType === 'full') {
                safeFilename = reportType === 'annual' ? 'Annual_Procurement_Audit_Summary_2024.csv' : 'CertiBid_Full_Procurement_Audit_Report.csv';
                csvContent = 'Tender ID,Tender Title,Department,Category,Budget (INR),Status,Awarded Vendor,Awarded Amount (INR),Publish Date,Opening Date\n';
                db.tenders.forEach((t: any) => {
                  csvContent += `"${t.id}","${(t.title || '').replace(/"/g, '""')}","${t.department || ''}","${t.category || ''}",${t.budget || 0},"${t.status || ''}","${t.awardedVendorName || 'N/A'}",${t.awardedAmount || 0},"${t.publishingDate || ''}","${t.openingDate || ''}"\n`;
                });
              } else if (reportType === 'risk') {
                safeFilename = 'Vendor_Risk_Collusion_Log.csv';
                csvContent = 'Vendor ID,Company Name,Category,Risk Score,Risk Level,Verification Status,Financial Health,Registration No\n';
                db.vendors.forEach((v: any) => {
                  csvContent += `"${v.id}","${(v.companyName || '').replace(/"/g, '""')}","${v.category || ''}",${v.riskScore || 0},"${v.riskLevel || 'Low'}","${v.verificationStatus || 'Verified'}","${v.financialHealth || 'A+'}","${v.registrationNumber || ''}"\n`;
                });
              } else if (reportType === 'emd') {
                safeFilename = 'Treasury_EMD_Ledger_Export.csv';
                csvContent = 'Transaction ID,Tender ID,Vendor / Entity,Amount (INR),Type,Status,Escrow Account,Date\n';
                db.transactions.forEach((tx: any) => {
                  csvContent += `"${tx.id}","${tx.tenderId || ''}","${(tx.vendorName || '').replace(/"/g, '""')}",${tx.amount || 0},"${tx.type || 'EMD'}","${tx.status || 'Completed'}","${tx.escrowAccount || ''}","${tx.date || ''}"\n`;
                });
              }

              const csvBuf = Buffer.from(csvContent, 'utf-8');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/csv; charset=utf-8');
              res.setHeader('Content-Length', csvBuf.length);
              res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`);
              res.end(csvBuf);
              return;
            }
          }

          // 6. Generic File / Certificate Download by ID: /api/files/:id/download or /api/v1/documents/file/:id
          const docId = cleanUrl.replace('/download', '').split('/').pop() || '';
          const doc = db.documents.find((d: any) => d.id === docId);

          if (!doc) {
            // Check if it's a tender, bid, or txn ID passed directly
            if (docId.startsWith('TND-')) {
              res.writeHead(302, { Location: `/api/files/tender/${docId}/download` });
              res.end();
              return;
            }
            if (docId.startsWith('BID-')) {
              res.writeHead(302, { Location: `/api/files/bid/${docId}/download` });
              res.end();
              return;
            }
            if (docId.startsWith('TXN-')) {
              res.writeHead(302, { Location: `/api/files/receipt/${docId}/download` });
              res.end();
              return;
            }

            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'File Not Found', message: `No document matching ID ${docId} was found.` }));
            return;
          }

          // Strict Authorization Check: If Bidder, only allow downloading documents belonging to that bidder
          if (user && (user.role === 'BIDDER' || user.role === 'VENDOR')) {
            const userBidderId = user.bidderId || user.vendorId;
            const userEmail = (user.email || '').toLowerCase().trim();
            const userOrg = (user.organization || user.companyName || '').toLowerCase().trim();

            const isOwner = (userBidderId && doc.vendorId === userBidderId) ||
                            (doc.uploadedByEmail && doc.uploadedByEmail.toLowerCase().trim() === userEmail) ||
                            (userOrg && doc.vendorName && doc.vendorName.toLowerCase().trim() === userOrg);

            if (!isOwner) {
              res.statusCode = 403;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Forbidden', message: 'Access denied: You do not have permission to download documents belonging to another bidder.' }));
              return;
            }
          }

          const isDownload = url.includes('download=true') || url.includes('download=1') || cleanUrl.includes('/download') || cleanUrl.startsWith('/api/files/');
          const ext = (doc.fileName || '').toLowerCase().split('.').pop() || 'pdf';
          let contentType = 'application/pdf';
          if (ext === 'png') contentType = 'image/png';
          else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
          else if (ext === 'doc' || ext === 'docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          else if (ext === 'xls' || ext === 'xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          else if (ext === 'csv') contentType = 'text/csv';
          else if (ext === 'txt') contentType = 'text/plain';

          const disposition = isDownload ? 'attachment' : 'inline';
          const safeName = doc.fileName || `${doc.id}.pdf`;

          // Check if physical file exists in uploads storage
          const relativeStoragePath = doc.storagePath || doc.path || path.join('uploads', 'certificates', `${doc.id}_${safeName}`);
          const absoluteStoragePath = path.join(process.cwd(), relativeStoragePath);

          if (fs.existsSync(absoluteStoragePath)) {
            try {
              const fileBuf = fs.readFileSync(absoluteStoragePath);
              res.statusCode = 200;
              res.setHeader('Content-Type', contentType);
              res.setHeader('Content-Length', fileBuf.length);
              res.setHeader('Content-Disposition', `${disposition}; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`);
              res.end(fileBuf);
              return;
            } catch (err) {
              console.error('Error reading physical certificate file:', err);
            }
          }

          // Fallback dynamic high-quality PDF generator for seed or simulated documents
          const pdfTitle = doc.title || 'Official Statutory Compliance Certificate';
          const pdfVendor = doc.vendorName || 'Authenticated Enterprise';
          const pdfDocId = doc.id || 'DOC-000';
          const pdfType = doc.documentType || 'Corporate KYC & Statutory Compliance';
          const pdfDate = doc.uploadedAt || new Date().toISOString().split('T')[0];

          const generatedPdfBuf = generateStandardPdf({
            title: 'CertiBid AI - Official Statutory Compliance Certificate',
            subtitle: `Document Ref: ${pdfDocId} | Type: ${pdfType}`,
            docNumber: pdfDocId,
            statusBadge: doc.status?.toUpperCase() || 'VERIFIED & REGISTERED',
            metadata: [
              { label: 'Document Title', value: pdfTitle },
              { label: 'Registered Enterprise', value: pdfVendor },
              { label: 'Document Reference', value: pdfDocId },
              { label: 'Compliance Category', value: pdfType },
              { label: 'AI Scan Confidence', value: `${doc.aiConfidence || 98}% Verified Match` },
              { label: 'Issuing Authority', value: doc.verifiedBy || 'CertiBid AI Verification Engine' },
              { label: 'Date of Registration', value: pdfDate },
              { label: 'File Specification', value: `${doc.fileName || 'certificate.pdf'} (${doc.fileSize || '1.2 MB'})` }
            ],
            sections: [
              {
                title: '1. Statutory Verification Attestation',
                lines: [
                  '• This corporate compliance document has been verified against statutory enterprise registration registries.',
                  '• AI Optical Character Recognition (OCR) and tamper-detection analysis confirmed zero document alterations.',
                  '• Validated for tender eligibility under the Central Public Procurement Portal standards.'
                ]
              }
            ],
            footer: 'CertiBid AI Automated Governance & Document Scrutiny Engine.'
          });

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Length', generatedPdfBuf.length);
          res.setHeader('Content-Disposition', `${disposition}; filename="${safeName.endsWith('.pdf') ? safeName : safeName + '.pdf'}"; filename*=UTF-8''${encodeURIComponent(safeName)}`);
          res.end(generatedPdfBuf);
          return;
        }

        if (url.startsWith('/api/v1/documents') || url.startsWith('/api/documents')) {
          res.setHeader('Content-Type', 'application/json');
          const user = getAuthenticatedUser(req, db);

          // GET /api/v1/documents/:id (Single Document)
          const docIdMatch = url.match(/^\/api(?:\/v1)?\/documents\/([^/?]+)$/);
          if (req.method === 'GET' && docIdMatch && !url.includes('/status') && !url.includes('/upload')) {
            const singleDocId = docIdMatch[1];
            const foundDoc = db.documents.find((d: any) => d.id === singleDocId);
            if (!foundDoc) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Not Found', message: 'Document not found' }));
              return;
            }

            if (user && (user.role === 'BIDDER' || user.role === 'VENDOR')) {
              const userBidderId = user.bidderId || user.vendorId;
              const userEmail = (user.email || '').toLowerCase().trim();
              const isOwner = (userBidderId && foundDoc.vendorId === userBidderId) ||
                              (foundDoc.uploadedByEmail && foundDoc.uploadedByEmail.toLowerCase().trim() === userEmail);
              if (!isOwner) {
                res.statusCode = 403;
                res.end(JSON.stringify({ error: 'Forbidden', message: 'Access denied: You cannot view documents belonging to another bidder.' }));
                return;
              }
            }

            res.statusCode = 200;
            res.end(JSON.stringify(foundDoc));
            return;
          }

          // GET /api/v1/documents (List)
          if (req.method === 'GET' && (url === '/api/v1/documents' || url.startsWith('/api/v1/documents?') || url === '/api/documents' || url.startsWith('/api/documents?'))) {
            let result = [...db.documents];

            if (user && (user.role === 'BIDDER' || user.role === 'VENDOR')) {
              const userBidderId = user.bidderId || user.vendorId;
              const userEmail = (user.email || '').toLowerCase().trim();
              const userOrg = (user.organization || user.companyName || '').toLowerCase().trim();

              result = result.filter((d: any) => 
                (userBidderId && d.vendorId === userBidderId) ||
                (d.uploadedByEmail && d.uploadedByEmail.toLowerCase().trim() === userEmail) ||
                (userOrg && d.vendorName && d.vendorName.toLowerCase().trim() === userOrg)
              );
            } else if (!user) {
              result = [];
            }

            res.statusCode = 200;
            res.end(JSON.stringify(result));
            return;
          }

          // POST /api/v1/documents/upload or POST /api/v1/documents
          if (req.method === 'POST' && !url.includes('/status') && !url.includes('/review')) {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              let parsed: any = {};
              try { parsed = JSON.parse(body); } catch (e) {}

              if (!user) {
                res.statusCode = 401;
                res.end(JSON.stringify({ message: 'Unauthorized' }));
                return;
              }

              const newDocId = 'DOC-' + Math.floor(1000 + Math.random() * 9000);
              const title = parsed.title || parsed.name || (parsed.fileName ? parsed.fileName.replace(/\.[^/.]+$/, "") : 'Company Registration Certificate');
              const docType = parsed.documentType || parsed.type || 'Compliance Certificate';
              const rawFileName = parsed.fileName || `${title.replace(/\s+/g, '_')}.pdf`;
              const safeFileName = `${newDocId}_${rawFileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
              const relativeStoragePath = path.join('uploads', 'certificates', safeFileName);
              const absoluteStoragePath = path.join(process.cwd(), relativeStoragePath);

              let calculatedSize = parsed.fileSize || '1.2 MB';
              let byteSize = 1258291;

              // Write persistent binary file to disk if base64 data provided
              if (parsed.fileData) {
                try {
                  const base64Clean = parsed.fileData.includes(',') ? parsed.fileData.split(',')[1] : parsed.fileData;
                  const fileBuffer = Buffer.from(base64Clean, 'base64');
                  fs.writeFileSync(absoluteStoragePath, fileBuffer);
                  byteSize = fileBuffer.length;
                  calculatedSize = byteSize > 1048576 
                    ? `${(byteSize / 1048576).toFixed(1)} MB` 
                    : `${Math.round(byteSize / 1024)} KB`;
                } catch (writeErr) {
                  console.error('Failed to write uploaded file to persistent storage:', writeErr);
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Storage Error', message: 'Failed to write certificate file to persistent disk' }));
                  return;
                }
              }

              const ext = rawFileName.toLowerCase().split('.').pop() || 'pdf';
              const fileTypeUpper = ext === 'png' ? 'PNG' : (ext === 'jpg' || ext === 'jpeg') ? 'JPG' : (ext === 'doc' || ext === 'docx') ? 'DOC' : (ext === 'xls' || ext === 'xlsx' || ext === 'csv') ? 'SHEET' : 'PDF';
              const mimeType = ext === 'png' ? 'image/png' : (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : ext === 'csv' ? 'text/csv' : 'application/pdf';

              const bidderVendorId = user.bidderId || user.vendorId || parsed.vendorId || 'VND-10029';
              const bidderVendorName = user.organization || user.companyName || user.name || parsed.vendorName || 'Bidder Entity';

              const newDoc = {
                id: newDocId,
                title: title,
                originalName: rawFileName,
                storedName: safeFileName,
                fileName: rawFileName,
                documentType: docType,
                vendorId: bidderVendorId,
                vendorName: bidderVendorName,
                companyId: bidderVendorId,
                companyName: bidderVendorName,
                uploadedBy: user.id || user.email || user.name,
                uploadedByName: user.name || 'Authorized Bidder',
                uploadedByEmail: user.email || '',
                mimeType: mimeType,
                fileType: fileTypeUpper,
                fileSize: calculatedSize,
                size: byteSize,
                path: relativeStoragePath,
                storagePath: relativeStoragePath,
                fileUrl: `/api/files/${newDocId}/download`,
                entityType: 'certificate',
                entityId: newDocId,
                status: 'PENDING_REVIEW',
                uploadedAt: new Date().toISOString(),
                aiConfidence: 96,
                verifiedBy: '',
                reviewedBy: '',
                reviewedByRole: '',
                reviewedAt: '',
                resubmissionReason: ''
              };

              try {
                db.documents.unshift(newDoc);

                // Add notification to Officers & Admins about new uploaded document
                if (!db.notifications) db.notifications = [];
                db.notifications.unshift({
                  id: 'NTF-' + Math.floor(1000 + Math.random() * 9000),
                  userId: 'ALL_OFFICERS',
                  recipientEmail: 'officer@certibid.com',
                  role: 'OFFICER',
                  title: 'New Document Uploaded for Review',
                  message: `Bidder ${bidderVendorName} uploaded "${newDoc.fileName}" (${docType}) awaiting verification audit.`,
                  type: 'Document',
                  read: false,
                  timestamp: new Date().toISOString(),
                  time: 'Just now'
                });

                // Add Audit Log entry
                if (!db.auditLogs) db.auditLogs = [];
                db.auditLogs.unshift({
                  id: 'LOG-' + Math.floor(10000 + Math.random() * 90000),
                  action: 'DOCUMENT_UPLOADED',
                  category: 'Document',
                  entityId: newDocId,
                  performedBy: `${user.name} (BIDDER)`,
                  userRole: 'BIDDER',
                  timestamp: new Date().toISOString(),
                  details: `Bidder ${bidderVendorName} uploaded ${rawFileName} (${docType}). Status: PENDING_REVIEW.`
                });

                saveDb(db);
              } catch (dbErr) {
                console.error('Failed to save document record in DB:', dbErr);
                // Rollback written file if db save fails
                if (fs.existsSync(absoluteStoragePath)) {
                  try { fs.unlinkSync(absoluteStoragePath); } catch (e) {}
                }
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Database Error', message: 'Failed to save certificate metadata' }));
                return;
              }

              res.statusCode = 201;
              res.end(JSON.stringify(newDoc));
            });
            return;
          }

          // DELETE /api/v1/documents/:id
          if (req.method === 'DELETE') {
            const docId = url.split('?')[0].split('/').pop();
            const docIndex = db.documents.findIndex((d: any) => d.id === docId);

            if (docIndex === -1) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Not Found', message: 'Document not found' }));
              return;
            }

            const doc = db.documents[docIndex];
            if (user && (user.role === 'BIDDER' || user.role === 'VENDOR')) {
              const userBidderId = user.bidderId || user.vendorId;
              const userEmail = (user.email || '').toLowerCase().trim();

              const isOwner = (userBidderId && doc.vendorId === userBidderId) ||
                              (doc.uploadedByEmail && doc.uploadedByEmail.toLowerCase().trim() === userEmail);

              if (!isOwner) {
                res.statusCode = 403;
                res.end(JSON.stringify({ error: 'Forbidden', message: 'Access denied: You cannot delete a document belonging to another bidder.' }));
                return;
              }
            }

            // Remove associated file from disk if present
            const relPath = doc.storagePath || doc.path;
            if (relPath) {
              const absPath = path.join(process.cwd(), relPath);
              if (fs.existsSync(absPath)) {
                try { fs.unlinkSync(absPath); } catch (e) {}
              }
            }

            db.documents.splice(docIndex, 1);
            saveDb(db);

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, message: 'Certificate permanently deleted' }));
            return;
          }
        }

        // --- BIDS API WITH STRICT BIDDER OWNERSHIP ENFORCEMENT ---
        if (url.startsWith('/api/v1/bids') || url.startsWith('/api/bids')) {
          res.setHeader('Content-Type', 'application/json');
          const user = getAuthenticatedUser(req, db);

          if (req.method === 'GET') {
            const urlObj = new URL(url, 'http://localhost');
            const reqVendorId = urlObj.searchParams.get('vendorId');
            const reqTenderId = urlObj.searchParams.get('tenderId');

            let result = [...db.bids];

            if (user && (user.role === 'BIDDER' || user.role === 'VENDOR')) {
              const userBidderId = user.bidderId;
              const userEmail = (user.email || '').toLowerCase().trim();
              const userOrg = (user.organization || user.companyName || '').toLowerCase().trim();

              if (reqVendorId && userBidderId && reqVendorId !== userBidderId) {
                res.statusCode = 403;
                res.end(JSON.stringify({ error: 'Forbidden', message: 'Access denied: You cannot view bids submitted by another bidder.' }));
                return;
              }

              result = result.filter((b: any) =>
                (userBidderId && b.vendorId === userBidderId) ||
                (b.vendorEmail && b.vendorEmail.toLowerCase() === userEmail) ||
                (userOrg && b.vendorName && b.vendorName.toLowerCase() === userOrg)
              );
            } else if (!user) {
              const authRole = String(req.headers['x-user-role'] || '').toUpperCase().trim();
              if (authRole === 'BIDDER' || authRole === 'VENDOR') {
                const headerVendorId = req.headers['x-vendor-id'];
                const headerEmail = String(req.headers['x-user-email'] || '').toLowerCase().trim();
                result = result.filter((b: any) =>
                  (headerVendorId && b.vendorId === headerVendorId) ||
                  (headerEmail && b.vendorEmail && b.vendorEmail.toLowerCase() === headerEmail)
                );
              }
            }

            if (reqTenderId) {
              result = result.filter((b: any) => b.tenderId === reqTenderId);
            }

            res.statusCode = 200;
            res.end(JSON.stringify(result));
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              let parsed: any = {};
              try { parsed = JSON.parse(body); } catch (e) {}

              const tenderId = parsed.tenderId || 'TND-2026-8901';
              const bidderId = user?.bidderId || parsed.vendorId || req.headers['x-vendor-id'] || ('VND-' + Math.floor(10000 + Math.random() * 90000));
              const email = user?.email || parsed.vendorEmail || req.headers['x-user-email'] || '';

              // PREVENT DUPLICATE REGISTRATION
              const existingBid = db.bids.find((b: any) =>
                b.tenderId === tenderId &&
                ((bidderId && b.vendorId === bidderId) ||
                 (email && b.vendorEmail && b.vendorEmail.toLowerCase() === email.toLowerCase()))
              );

              if (existingBid) {
                res.statusCode = 409;
                res.end(JSON.stringify({ error: 'Already Registered', message: 'You are already registered for this tender.' }));
                return;
              }

              const newBidId = 'BID-' + Math.floor(1000 + Math.random() * 9000);
              const newTxnId = 'TXN-EMD-' + Math.floor(100000 + Math.random() * 900000);
              const companyName = user?.organization || user?.companyName || parsed.vendorName || 'Registered Bidder';

              const newBid = {
                id: newBidId,
                tenderId: tenderId,
                tenderTitle: parsed.tenderTitle || 'Public Procurement Tender',
                vendorId: bidderId,
                vendorName: companyName,
                bidderName: companyName,
                vendorEmail: email,
                proposedAmount: parsed.proposedAmount || 50000000,
                currency: 'INR',
                estimatedCompletionTime: parsed.estimatedCompletionTime || '12 Months',
                bidScore: 92.0,
                aiRiskScore: 15,
                riskLevel: 'Low',
                status: 'Registered',
                emdPaymentStatus: 'Verified & Paid',
                emdAmount: parsed.emdAmount || Math.round((parsed.proposedAmount || 50000000) * 0.02),
                emdTransactionId: newTxnId,
                submissionDate: new Date().toISOString().split('T')[0],
                submittedAt: new Date().toISOString().split('T')[0]
              };

              db.bids.unshift(newBid);

              const newTxn = {
                id: newTxnId,
                tenderId: newBid.tenderId,
                tenderTitle: newBid.tenderTitle,
                bidId: newBidId,
                vendorId: bidderId,
                vendorName: companyName,
                userEmail: email,
                transactionType: 'EMD Deposit',
                amount: newBid.emdAmount,
                currency: 'INR',
                status: 'Completed',
                date: new Date().toISOString().split('T')[0],
                receiptUrl: '#',
                invoiceNo: 'INV-2026-' + Math.floor(100 + Math.random() * 900)
              };

              db.transactions.unshift(newTxn);
              saveDb(db);

              res.statusCode = 201;
              res.end(JSON.stringify(newBid));
            });
            return;
          }
        }

        // --- TRANSACTIONS / EMD API WITH STRICT BIDDER OWNERSHIP ENFORCEMENT ---
        if (
          url.startsWith('/api/v1/transactions') || url.startsWith('/api/transactions') ||
          url.startsWith('/api/v1/emd') || url.startsWith('/api/emd')
        ) {
          res.setHeader('Content-Type', 'application/json');
          const user = getAuthenticatedUser(req, db);

          if (req.method === 'GET') {
            const urlObj = new URL(url, 'http://localhost');
            const reqVendorId = urlObj.searchParams.get('vendorId');

            let result = [...db.transactions];

            if (user && (user.role === 'BIDDER' || user.role === 'VENDOR')) {
              const userBidderId = user.bidderId;
              const userEmail = (user.email || '').toLowerCase().trim();
              const userOrg = (user.organization || user.companyName || '').toLowerCase().trim();

              if (reqVendorId && userBidderId && reqVendorId !== userBidderId) {
                res.statusCode = 403;
                res.end(JSON.stringify({ error: 'Forbidden', message: 'Access denied: You cannot view EMD receipts belonging to another bidder.' }));
                return;
              }

              result = result.filter((t: any) =>
                (userBidderId && t.vendorId === userBidderId) ||
                (t.userEmail && t.userEmail.toLowerCase() === userEmail) ||
                (userOrg && t.vendorName && t.vendorName.toLowerCase() === userOrg)
              );
            } else if (!user) {
              const authRole = String(req.headers['x-user-role'] || '').toUpperCase().trim();
              if (authRole === 'BIDDER' || authRole === 'VENDOR') {
                const headerVendorId = req.headers['x-vendor-id'];
                const headerEmail = String(req.headers['x-user-email'] || '').toLowerCase().trim();
                result = result.filter((t: any) =>
                  (headerVendorId && t.vendorId === headerVendorId) ||
                  (headerEmail && t.userEmail && t.userEmail.toLowerCase() === headerEmail)
                );
              }
            }

            res.statusCode = 200;
            res.end(JSON.stringify(result));
            return;
          }
        }

        // --- ESCALATIONS API WITH ROLE-BASED AUTHORIZATION ---
        if (url.startsWith('/api/v1/escalations') || url.startsWith('/api/escalations')) {
          res.setHeader('Content-Type', 'application/json');
          if (!db.escalations) db.escalations = [];
          const user = getAuthenticatedUser(req, db);

          // BIDDERS ARE DENIED ACCESS TO INTERNAL ESCALATIONS
          if (user && (user.role === 'BIDDER' || user.role === 'VENDOR')) {
            res.statusCode = 403;
            res.end(JSON.stringify({ error: 'Forbidden', message: 'Access denied: Bidders cannot access internal escalation workflows.' }));
            return;
          }

          const cleanUrl = url.split('?')[0];

          // 1. GET /api/v1/escalations (List all escalations)
          if (req.method === 'GET' && (cleanUrl === '/api/v1/escalations' || cleanUrl === '/api/escalations')) {
            res.statusCode = 200;
            res.end(JSON.stringify(db.escalations));
            return;
          }

          // 2. GET /api/v1/escalations/bid/:bidId or /api/v1/escalations/:id
          if (req.method === 'GET' && cleanUrl.length > 20) {
            const parts = cleanUrl.split('/');
            const lastPart = parts.pop();
            const secondLastPart = parts.pop();

            let targetEscalation = null;
            if (secondLastPart === 'bid') {
              targetEscalation = db.escalations.find((e: any) => e.bidId === lastPart);
            } else {
              targetEscalation = db.escalations.find((e: any) => e.id === lastPart || e.bidId === lastPart);
            }

            if (!targetEscalation) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Not Found', message: 'Escalation record not found' }));
              return;
            }

            res.statusCode = 200;
            res.end(JSON.stringify(targetEscalation));
            return;
          }

          // 3. POST /api/v1/escalations (Officer escalates bid to Admin)
          if (req.method === 'POST' && (cleanUrl === '/api/v1/escalations' || cleanUrl === '/api/escalations')) {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              let parsed: any = {};
              try { parsed = JSON.parse(body); } catch (e) {}

              const bidId = parsed.bidId;
              const targetBid = db.bids.find((b: any) => b.id === bidId);

              if (!targetBid) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not Found', message: `Bid with ID ${bidId} not found.` }));
                return;
              }

              // Check if bid is already escalated
              let existingEsc = db.escalations.find((e: any) => e.bidId === bidId && (
                e.status === 'ESCALATED_TO_ADMIN' ||
                e.status === 'ADMIN_ACCEPTED_PENDING_OFFICER' ||
                e.status === 'ADMIN_REJECTED_PENDING_OFFICER'
              ));

              if (existingEsc) {
                res.statusCode = 200;
                res.end(JSON.stringify(existingEsc));
                return;
              }

              const newEscId = 'ESC-' + Math.floor(1000 + Math.random() * 9000);
              const targetTender = db.tenders.find((t: any) => t.id === targetBid.tenderId);

              const newEscalation = {
                id: newEscId,
                bidId: targetBid.id,
                tenderId: targetBid.tenderId || 'TND-2026-8901',
                tenderTitle: targetTender?.title || targetBid.tenderTitle || 'Public Procurement Tender',
                bidderId: targetBid.vendorId || 'VND-10029',
                bidderName: targetBid.vendorName || targetBid.bidderName || 'Registered Bidder',
                proposedAmount: targetBid.proposedAmount || 50000000,
                aiRiskScore: targetBid.aiRiskScore || 15,
                riskLevel: targetBid.riskLevel || 'Low',
                escalatedByOfficerId: user?.id || 'usr-officer-001',
                escalatedByOfficerName: user?.name || 'Sarah Connor',
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
                officerComment: parsed.comment || 'Escalated bid to Admin for governance risk evaluation.'
              };

              db.escalations.unshift(newEscalation);

              // Sync status in bid record
              targetBid.status = 'ESCALATED_TO_ADMIN';
              saveDb(db);

              res.statusCode = 201;
              res.end(JSON.stringify(newEscalation));
            });
            return;
          }

          // 4. POST /api/v1/escalations/:id/admin-decision
          if (req.method === 'POST' && cleanUrl.includes('/admin-decision')) {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              let parsed: any = {};
              try { parsed = JSON.parse(body); } catch (e) {}

              // Verify ADMIN Role
              if (!user || user.role !== 'ADMIN') {
                res.statusCode = 403;
                res.end(JSON.stringify({ error: 'Forbidden', message: 'Access denied: Only Administrators can record Admin Review decisions.' }));
                return;
              }

              const parts = cleanUrl.split('/');
              const escId = parts[parts.indexOf('admin-decision') - 1] || parts[parts.length - 2];

              const escalation = db.escalations.find((e: any) => e.id === escId || e.bidId === escId);
              if (!escalation) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not Found', message: 'Escalation record not found' }));
                return;
              }

              const rawDecision = String(parsed.decision || '').toUpperCase();
              const decision = rawDecision === 'ACCEPT' || rawDecision === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED';

              escalation.adminDecision = decision;
              escalation.status = decision === 'ACCEPTED' ? 'ADMIN_ACCEPTED_PENDING_OFFICER' : 'ADMIN_REJECTED_PENDING_OFFICER';
              escalation.adminId = user.id || 'usr-admin-001';
              escalation.adminName = user.name || 'System Administrator';
              escalation.adminDecisionAt = new Date().toISOString();
              escalation.adminComment = parsed.comment || (decision === 'ACCEPTED' ? 'Admin approved risk profile after forensic review.' : 'Admin flagged potential risk factors in financial audit.');

              // Update corresponding bid in db.bids
              const targetBid = db.bids.find((b: any) => b.id === escalation.bidId);
              if (targetBid) {
                targetBid.status = escalation.status;
              }

              saveDb(db);

              res.statusCode = 200;
              res.end(JSON.stringify(escalation));
            });
            return;
          }

          // 5. POST /api/v1/escalations/:id/final-decision
          if (req.method === 'POST' && cleanUrl.includes('/final-decision')) {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              let parsed: any = {};
              try { parsed = JSON.parse(body); } catch (e) {}

              // Verify OFFICER Role
              if (!user || user.role !== 'OFFICER') {
                res.statusCode = 403;
                res.end(JSON.stringify({ error: 'Forbidden', message: 'Access denied: Only Procurement Officers can record final procurement decisions.' }));
                return;
              }

              const parts = cleanUrl.split('/');
              const escId = parts[parts.indexOf('final-decision') - 1] || parts[parts.length - 2];

              const escalation = db.escalations.find((e: any) => e.id === escId || e.bidId === escId);
              if (!escalation) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not Found', message: 'Escalation record not found' }));
                return;
              }

              const rawDecision = String(parsed.decision || '').toUpperCase();
              const decision = rawDecision === 'ACCEPT' || rawDecision === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED';

              escalation.finalDecision = decision;
              escalation.status = decision === 'ACCEPTED' ? 'FINAL_ACCEPTED' : 'FINAL_REJECTED';
              escalation.finalDecisionByOfficerId = user.id || 'usr-officer-001';
              escalation.finalDecisionByOfficerName = user.name || 'Sarah Connor';
              escalation.finalDecisionAt = new Date().toISOString();
              escalation.finalComment = parsed.comment || (decision === 'ACCEPTED' ? 'Procurement Officer finalized contract award acceptance.' : 'Procurement Officer finalized bid rejection.');

              // Update corresponding bid status in db.bids
              const targetBid = db.bids.find((b: any) => b.id === escalation.bidId);
              if (targetBid) {
                targetBid.status = decision === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED';
              }

              saveDb(db);

              res.statusCode = 200;
              res.end(JSON.stringify(escalation));
            });
            return;
          }
        }

        // --- AI RISK ANALYSIS ENDPOINT ---
        if (url.startsWith('/api/v1/risk-analysis') || url.startsWith('/api/risk-analysis')) {
          res.setHeader('Content-Type', 'application/json');
          const user = getAuthenticatedUser(req, db);

          if (user && (user.role === 'BIDDER' || user.role === 'VENDOR')) {
            res.statusCode = 403;
            res.end(JSON.stringify({ error: 'Forbidden', message: 'Access denied: Bidders cannot view internal AI risk analysis reports.' }));
            return;
          }

          const bidId = url.split('?')[0].split('/').pop();
          const bid = db.bids.find((b: any) => b.id === bidId) || db.bids[0];
          const tender = db.tenders.find((t: any) => t.id === bid?.tenderId);
          const vendor = db.vendors[bid?.vendorId] || Object.values(db.vendors)[0];

          const riskAnalysis = {
            bidId: bid?.id || bidId,
            tenderId: bid?.tenderId || 'TND-2026-8901',
            tenderTitle: tender?.title || bid?.tenderTitle || 'Public Procurement Project',
            vendorName: bid?.vendorName || vendor?.companyName || 'Registered Enterprise',
            vendorId: bid?.vendorId || vendor?.id || 'VND-10029',
            overallRiskScore: bid?.aiRiskScore || 18,
            riskLevel: bid?.riskLevel || 'Low',
            confidenceScore: 97.4,
            proposedAmount: bid?.proposedAmount || 41200000,
            riskIndicators: {
              priceAnomaly: { score: 12, status: 'Normal Variance', details: 'Price within 8.5% benchmark variance.' },
              collusionDetection: { score: 4, status: 'Clear', details: 'No collusion or IP overlap patterns detected.' },
              vendorHistory: { score: 10, status: 'Verified', details: 'Positive completion record across 12 municipal projects.' },
              financialRisk: { score: 15, status: 'A+', details: 'Healthy turnover exceeding ₹15 Crores.' },
              complianceRisk: { score: 6, status: 'Verified', details: 'All mandatory tax and technical clearance documents verified.' }
            },
            explainableAI: {
              keyFactors: [
                `Quoted contract value of ₹${(bid?.proposedAmount || 41200000).toLocaleString()} evaluated against approved budget.`,
                `Entity ${bid?.vendorName || 'Bidder'} verified with active registration status.`,
                `All required compliance documents successfully audited by AI Forensics.`
              ],
              recommendations: [
                'Proceed with procurement evaluation committee sign-off.',
                'Verify bank guarantee escrow receipt prior to contract execution.'
              ]
            },
            timeline: [
              { step: 'Bid Submitted', result: 'Success', date: bid?.submissionDate || '2026-08-02' },
              { step: 'AI Forensics Audit', result: 'Completed', date: new Date().toISOString().split('T')[0] }
            ]
          };

          res.statusCode = 200;
          res.end(JSON.stringify(riskAnalysis));
          return;
        }

        // --- SETTINGS API ---
        if (url.startsWith('/api/v1/settings') || url.startsWith('/api/settings')) {
          res.setHeader('Content-Type', 'application/json');
          if (!db.settings) db.settings = {};
          const user = getAuthenticatedUser(req, db);
          const userEmail = user?.email || 'default';

          if (req.method === 'GET') {
            const userSettings = db.settings[userEmail] || {
              profile: {
                name: user?.name || 'User',
                email: user?.email || 'user@certibid.com',
                phone: user?.phone || '+91 98112 34567',
                organization: user?.organization || user?.companyName || 'Enterprise Corp',
                department: user?.department || 'Operations',
                roleTitle: user?.roleTitle || 'Authorized Representative',
                bidderId: user?.bidderId || '',
                taxId: user?.taxId || ''
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
            };
            res.statusCode = 200;
            res.end(JSON.stringify(userSettings));
            return;
          }

          if (req.method === 'PUT' || req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              let parsed: any = {};
              try { parsed = JSON.parse(body); } catch (e) {}

              db.settings[userEmail] = parsed;

              // Update user record in db.users if profile changed
              if (parsed.profile && user) {
                if (parsed.profile.name) user.name = parsed.profile.name;
                if (parsed.profile.phone) user.phone = parsed.profile.phone;
                if (parsed.profile.department) user.department = parsed.profile.department;
                if (parsed.profile.organization) {
                  user.organization = parsed.profile.organization;
                  user.companyName = parsed.profile.organization;
                }
              }

              saveDb(db);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, message: 'Settings saved successfully', settings: parsed }));
            });
            return;
          }
        }

        // --- NOTIFICATIONS API ---
        if (url.startsWith('/api/v1/notifications') || url.startsWith('/api/notifications')) {
          res.setHeader('Content-Type', 'application/json');
          if (!db.notifications) db.notifications = initialNotificationsSeed;
          const user = getAuthenticatedUser(req, db);

          // PUT /api/v1/notifications/:id/read
          if (req.method === 'PUT' && url.includes('/read')) {
            const parts = url.split('?')[0].split('/');
            const notifId = parts[parts.indexOf('read') - 1];
            const notif = db.notifications.find((n: any) => n.id === notifId);
            if (notif) notif.read = true;
            saveDb(db);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, id: notifId }));
            return;
          }

          // PUT /api/v1/notifications/read-all
          if (req.method === 'PUT' && url.includes('/read-all')) {
            db.notifications.forEach((n: any) => { n.read = true; });
            saveDb(db);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true }));
            return;
          }

          // GET /api/v1/notifications
          if (req.method === 'GET') {
            let result = [...db.notifications];
            if (user) {
              const uEmail = (user.email || '').toLowerCase().trim();
              const uRole = (user.role || '').toUpperCase().trim();
              const uBidderId = user.bidderId;

              if (uRole === 'BIDDER' || uRole === 'VENDOR') {
                result = result.filter((n: any) =>
                  (n.recipientEmail && n.recipientEmail.toLowerCase() === uEmail) ||
                  (uBidderId && n.userId === uBidderId) ||
                  n.userId === 'ALL' ||
                  (!n.recipientEmail && !n.userId && n.role === 'BIDDER')
                );
              } else if (uRole === 'OFFICER') {
                result = result.filter((n: any) =>
                  n.role === 'OFFICER' ||
                  n.userId === 'ALL_OFFICERS' ||
                  n.userId === 'ALL' ||
                  (n.recipientEmail && n.recipientEmail.toLowerCase() === uEmail)
                );
              } else if (uRole === 'ADMIN') {
                result = result.filter((n: any) =>
                  n.role === 'ADMIN' ||
                  n.userId === 'ALL_ADMINS' ||
                  n.userId === 'ALL' ||
                  (n.recipientEmail && n.recipientEmail.toLowerCase() === uEmail)
                );
              }
            }
            res.statusCode = 200;
            res.end(JSON.stringify(result));
            return;
          }

          // POST /api/v1/notifications
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              let parsed: any = {};
              try { parsed = JSON.parse(body); } catch (e) {}
              const newNotif = {
                id: 'NTF-' + Math.floor(1000 + Math.random() * 9000),
                userId: parsed.userId || 'ALL',
                recipientEmail: parsed.recipientEmail || '',
                role: parsed.role || 'ALL',
                title: parsed.title || 'System Notification',
                message: parsed.message || '',
                type: parsed.type || 'Alert',
                read: false,
                timestamp: new Date().toISOString(),
                time: 'Just now'
              };
              db.notifications.unshift(newNotif);
              saveDb(db);
              res.statusCode = 201;
              res.end(JSON.stringify(newNotif));
            });
            return;
          }
        }

        // --- AUDIT LOGS API ---
        if (url.startsWith('/api/v1/audit-logs') || url.startsWith('/api/audit-logs')) {
          res.setHeader('Content-Type', 'application/json');
          if (!db.auditLogs) db.auditLogs = initialAuditLogsSeed;
          res.statusCode = 200;
          res.end(JSON.stringify(db.auditLogs));
          return;
        }

        // --- DOCUMENT STATUS UPDATE API ---
        if (
          (url.startsWith('/api/v1/documents') || url.startsWith('/api/documents')) &&
          (req.method === 'PUT' || req.method === 'POST') && (url.includes('/status') || url.includes('/review'))
        ) {
          res.setHeader('Content-Type', 'application/json');
          const user = getAuthenticatedUser(req, db);

          if (!user) {
            res.statusCode = 401;
            res.end(JSON.stringify({ error: 'Unauthorized', message: 'Authentication required' }));
            return;
          }

          if (user.role !== 'ADMIN' && user.role !== 'OFFICER') {
            res.statusCode = 403;
            res.end(JSON.stringify({ error: 'Forbidden', message: 'Access denied: Only Procurement Officers and Administrators can audit and update document verification statuses.' }));
            return;
          }

          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            let parsed: any = {};
            try { parsed = JSON.parse(body); } catch (e) {}

            const parts = url.split('?')[0].split('/');
            // Handle both /api/v1/documents/:id/status and /api/documents/:id/status
            const statusIdx = parts.indexOf('status') !== -1 ? parts.indexOf('status') : parts.indexOf('review');
            const docId = parts[statusIdx - 1];
            const doc = db.documents.find((d: any) => d.id === docId);

            if (!doc) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Not Found', message: 'Document not found' }));
              return;
            }

            const rawStatus = (parsed.status || 'APPROVED').toString().toUpperCase().trim();
            const normalizedStatus = rawStatus.includes('REJECT') ? 'REJECTED' : rawStatus.includes('PENDING') ? 'PENDING_REVIEW' : 'APPROVED';
            const reason = parsed.resubmissionReason || parsed.reason || '';

            if (normalizedStatus === 'REJECTED' && !reason.trim()) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Bad Request', message: 'A mandatory rejection and resubmission reason is required when rejecting a document.' }));
              return;
            }

            doc.status = normalizedStatus;
            doc.resubmissionReason = reason;
            doc.verifiedBy = `${user.name} (${user.role})`;
            doc.reviewedBy = user.name;
            doc.reviewedByRole = user.role;
            doc.reviewedAt = new Date().toISOString();

            const isApproved = normalizedStatus === 'APPROVED';

            // Dispatch notification to Bidder
            if (!db.notifications) db.notifications = [];
            db.notifications.unshift({
              id: 'NTF-' + Math.floor(1000 + Math.random() * 9000),
              userId: doc.vendorId || 'ALL',
              recipientEmail: doc.uploadedByEmail || '',
              role: 'BIDDER',
              title: isApproved ? 'Document Audit: Verified & Approved' : 'Document Audit: Rejected / Action Required',
              message: isApproved
                ? `Your uploaded document "${doc.title || doc.fileName}" (${doc.documentType || 'Certificate'}) has been officially APPROVED by ${user.name} (${user.role}).`
                : `Your uploaded document "${doc.title || doc.fileName}" (${doc.documentType || 'Certificate'}) was REJECTED by ${user.name} (${user.role}). Reason: ${reason}`,
              type: isApproved ? 'Document' : 'Alert',
              read: false,
              timestamp: new Date().toISOString(),
              time: 'Just now'
            });

            // Dispatch audit log
            if (!db.auditLogs) db.auditLogs = [];
            db.auditLogs.unshift({
              id: 'LOG-' + Math.floor(10000 + Math.random() * 90000),
              action: isApproved ? 'DOCUMENT_APPROVED' : 'DOCUMENT_REJECTED',
              category: 'Document Audit',
              entityId: doc.id,
              performedBy: `${user.name} (${user.role})`,
              userRole: user.role,
              timestamp: new Date().toISOString(),
              details: `${user.role} ${user.name} ${isApproved ? 'approved' : 'rejected'} document ${doc.id} (${doc.fileName}) for bidder ${doc.vendorName || doc.vendorId}.${reason ? ' Reason: ' + reason : ''}`
            });

            saveDb(db);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, message: `Document successfully ${normalizedStatus.toLowerCase()}`, document: doc }));
          });
          return;
        }

        // --- SUPPORT & HELPDESK API ---
        if (url.startsWith('/api/v1/support') || url.startsWith('/api/support')) {
          res.setHeader('Content-Type', 'application/json');
          if (!db.supportRequests) db.supportRequests = initialSupportSeed;
          const user = getAuthenticatedUser(req, db);

          // GET /api/v1/support
          if (req.method === 'GET' && (url === '/api/v1/support' || url.startsWith('/api/v1/support?') || url === '/api/support' || url.startsWith('/api/support?'))) {
            let result = [...db.supportRequests];

            if (user && (user.role === 'BIDDER' || user.role === 'VENDOR')) {
              const userBidderId = user.bidderId || user.vendorId;
              const userEmail = (user.email || '').toLowerCase().trim();
              const userOrg = (user.organization || user.companyName || '').toLowerCase().trim();

              result = result.filter((s: any) =>
                (userBidderId && s.vendorId === userBidderId) ||
                (s.userEmail && s.userEmail.toLowerCase().trim() === userEmail) ||
                (userOrg && s.vendorName && s.vendorName.toLowerCase().trim() === userOrg)
              );
            } else if (!user) {
              result = [];
            }

            res.statusCode = 200;
            res.end(JSON.stringify(result));
            return;
          }

          // POST /api/v1/support (Create new Support Ticket)
          if (req.method === 'POST' && (url === '/api/v1/support' || url === '/api/support')) {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              let parsed: any = {};
              try { parsed = JSON.parse(body); } catch (e) {}

              if (!user) {
                res.statusCode = 401;
                res.end(JSON.stringify({ error: 'Unauthorized', message: 'Authentication required' }));
                return;
              }

              const newTicketId = 'SUP-' + Math.floor(1000 + Math.random() * 9000);
              const vendorId = user.bidderId || user.vendorId || parsed.vendorId || 'VND-10029';
              const vendorName = user.organization || user.companyName || user.name || parsed.vendorName || 'Bidder Entity';

              const newTicket = {
                id: newTicketId,
                userId: user.id || vendorId,
                userEmail: user.email || 'vendor@certibid.com',
                userName: user.name || vendorName,
                vendorId: vendorId,
                vendorName: vendorName,
                category: parsed.category || 'General Inquiry',
                subject: parsed.subject || 'Helpdesk Inquiry',
                priority: parsed.priority || 'Medium',
                message: parsed.message || '',
                status: 'OPEN',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                responses: []
              };

              db.supportRequests.unshift(newTicket);

              // Notify Officers & Admins
              if (!db.notifications) db.notifications = [];
              db.notifications.unshift({
                id: 'NTF-' + Math.floor(1000 + Math.random() * 9000),
                userId: 'ALL_OFFICERS',
                recipientEmail: 'officer@certibid.com',
                role: 'OFFICER',
                title: 'New Support Ticket Logged',
                message: `Bidder ${vendorName} submitted ticket #${newTicketId}: "${newTicket.subject}" (${newTicket.category})`,
                type: 'Alert',
                read: false,
                timestamp: new Date().toISOString(),
                time: 'Just now'
              });

              // Audit Log
              if (!db.auditLogs) db.auditLogs = [];
              db.auditLogs.unshift({
                id: 'LOG-' + Math.floor(10000 + Math.random() * 90000),
                action: 'SUPPORT_TICKET_CREATED',
                category: 'Support',
                entityId: newTicketId,
                performedBy: `${user.name} (${user.role})`,
                userRole: user.role,
                timestamp: new Date().toISOString(),
                details: `Support ticket #${newTicketId} created by ${vendorName}: ${newTicket.subject}`
              });

              saveDb(db);
              res.statusCode = 201;
              res.end(JSON.stringify(newTicket));
            });
            return;
          }

          // PUT /api/v1/support/:id (Update status or post response)
          const ticketIdMatch = url.match(/^\/api(?:\/v1)?\/support\/([^/?]+)/);
          if ((req.method === 'PUT' || req.method === 'POST') && ticketIdMatch) {
            const ticketId = ticketIdMatch[1];
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              let parsed: any = {};
              try { parsed = JSON.parse(body); } catch (e) {}

              if (!user) {
                res.statusCode = 401;
                res.end(JSON.stringify({ error: 'Unauthorized', message: 'Authentication required' }));
                return;
              }

              const ticket = db.supportRequests.find((s: any) => s.id === ticketId);
              if (!ticket) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not Found', message: 'Support ticket not found' }));
                return;
              }

              if (parsed.status) {
                ticket.status = parsed.status;
              }
              if (parsed.priority) {
                ticket.priority = parsed.priority;
              }
              ticket.updatedAt = new Date().toISOString();

              // Add response message if provided
              const replyText = parsed.reply || parsed.message || parsed.responseMessage;
              if (replyText && replyText.trim()) {
                const responseObj = {
                  id: 'REP-' + Math.floor(100 + Math.random() * 900),
                  authorName: user.name,
                  authorRole: user.role,
                  authorEmail: user.email,
                  message: replyText.trim(),
                  createdAt: new Date().toISOString()
                };
                if (!ticket.responses) ticket.responses = [];
                ticket.responses.push(responseObj);

                // Notify bidder if replied by Officer/Admin
                if (user.role === 'OFFICER' || user.role === 'ADMIN') {
                  if (!db.notifications) db.notifications = [];
                  db.notifications.unshift({
                    id: 'NTF-' + Math.floor(1000 + Math.random() * 9000),
                    userId: ticket.vendorId || 'ALL',
                    recipientEmail: ticket.userEmail || '',
                    role: 'BIDDER',
                    title: `Support Ticket Response: #${ticket.id}`,
                    message: `${user.name} (${user.role}) replied to "${ticket.subject}": "${replyText.substring(0, 100)}..."`,
                    type: 'Alert',
                    read: false,
                    timestamp: new Date().toISOString(),
                    time: 'Just now'
                  });
                }
              }

              saveDb(db);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, message: 'Support ticket updated', ticket }));
            });
            return;
          }
        }

        next();
      });
    }
  };
};

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiMockPlugin()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },

    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: ['**/.certibid_db.json'],
      },
    },
  };
});
