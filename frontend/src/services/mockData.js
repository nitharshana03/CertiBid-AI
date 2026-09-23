// CertiBid AI - Enterprise Procurement Mock Dataset

export const mockTenders = [
  {
    id: "TND-2026-8901",
    title: "National Smart City Traffic Surveillance System Upgrade",
    department: "Ministry of Transportation & Infrastructure",
    category: "Information Technology & Security",
    location: "Capital District",
    budget: 45000000,
    currency: "USD",
    publishingDate: "2026-07-10",
    submissionDeadline: "2026-08-25",
    openingDate: "2026-08-26",
    status: "Active", // Draft, Active, Under Evaluation, Awarded, Cancelled
    riskLevel: "Low",
    aiRiskScore: 18,
    eligibleVendorsCount: 14,
    bidsCount: 5,
    description: "Deployment of AI-powered traffic camera networks, optical sensor arrays, and centralized traffic management software across 12 urban sectors.",
    requirements: [
      "Minimum 5 years experience in municipal IT infrastructure",
      "ISO 27001 Security Certification required",
      "Financial turnover exceeding $100M over last 3 fiscal years",
      "Valid EMD Security Deposit ($900,000)"
    ],
    documents: [
      { name: "Tender_RFP_Specification_v2.pdf", size: "4.2 MB", date: "2026-07-10" },
      { name: "Technical_Requirement_Grid.xlsx", size: "1.8 MB", date: "2026-07-10" }
    ]
  },
  {
    id: "TND-2026-8902",
    title: "Regional Highway Expansion & Paving (Sector 4-B)",
    department: "Department of Highways & Public Works",
    category: "Civil Engineering & Construction",
    location: "Western Province",
    budget: 82000000,
    currency: "USD",
    publishingDate: "2026-06-15",
    submissionDeadline: "2026-08-10",
    openingDate: "2026-08-11",
    status: "Under Evaluation",
    riskLevel: "High",
    aiRiskScore: 78,
    eligibleVendorsCount: 8,
    bidsCount: 4,
    description: "Multi-lane asphalt widening, bridge reinforcement, and drainage culvert installation along 45 kilometers of Interstate Corridor 8.",
    requirements: [
      "Class-A Heavy Civil Contractor License",
      "Proven track record of completing >3 highway projects",
      "Equipment fleet verification required"
    ],
    documents: [
      { name: "Highway_Expansion_Blueprint.pdf", size: "18.5 MB", date: "2026-06-15" }
    ]
  },
  {
    id: "TND-2026-8903",
    title: "Government Data Center Solar Power Infrastructure",
    department: "Ministry of Energy & Renewable Resources",
    category: "Renewable Energy",
    location: "Northern Hub",
    budget: 18500000,
    currency: "USD",
    publishingDate: "2026-07-01",
    submissionDeadline: "2026-08-30",
    openingDate: "2026-08-31",
    status: "Active",
    riskLevel: "Medium",
    aiRiskScore: 42,
    eligibleVendorsCount: 20,
    bidsCount: 7,
    description: "Installation of 12MW photovoltaic panels, battery energy storage systems (BESS), and microgrid controls for critical state data facilities.",
    requirements: [
      "NABCEP Certified Solar Installers",
      "Tier 1 Solar Panel Manufacturer partnership verification"
    ],
    documents: [
      { name: "Solar_Grid_Specs.pdf", size: "6.1 MB", date: "2026-07-01" }
    ]
  },
  {
    id: "TND-2026-8904",
    title: "State Public Healthcare Electronic Records Integration",
    department: "Department of Public Health",
    category: "Healthcare & IT",
    location: "Statewide",
    budget: 29000000,
    currency: "USD",
    publishingDate: "2026-05-10",
    submissionDeadline: "2026-07-20",
    openingDate: "2026-07-21",
    status: "Awarded",
    riskLevel: "Low",
    aiRiskScore: 12,
    eligibleVendorsCount: 11,
    bidsCount: 6,
    description: "Unification of medical health records across 45 regional hospitals with HIPAA-compliant cloud synchronization.",
    requirements: [
      "HIPAA / GDPR Compliance Audit pass",
      "Zero-downtime migration protocol"
    ],
    documents: [
      { name: "Health_EHR_RFP.pdf", size: "3.9 MB", date: "2026-05-10" }
    ]
  },
  {
    id: "TND-2026-8905",
    title: "Metropolitan Water Treatment Facility Modernization",
    department: "Water Resources & Public Utilities Authority",
    category: "Environmental Engineering",
    location: "Metro Area",
    budget: 54000000,
    currency: "USD",
    publishingDate: "2026-08-01",
    submissionDeadline: "2026-09-15",
    openingDate: "2026-09-16",
    status: "Draft",
    riskLevel: "Medium",
    aiRiskScore: 35,
    eligibleVendorsCount: 15,
    bidsCount: 0,
    description: "Filtration system upgrades, SCADA integration, and chemical dosing automation for Central Water Works Plant #3.",
    requirements: [
      "Water Quality ISO 14001 certification",
      "Environmental Impact Assessment clearance"
    ],
    documents: []
  }
];

export const mockVendors = [
  {
    id: "VND-10028",
    companyName: "ABC Infrastructure Pvt Ltd",
    registrationNumber: "REG-1098234-2020",
    taxId: "TAX-10928374",
    category: "Civil Engineering & Smart Infrastructure",
    rating: 4.9,
    eligibilityScore: 98,
    riskScore: 10,
    riskLevel: "Low",
    verificationStatus: "Verified",
    financialHealth: "A+",
    blacklisted: false,
    contactPerson: "Rajesh Kumar",
    email: "info@abcinfra.com",
    phone: "+91 98765 43210",
    address: "702 Infrastructure House, Tech Corridor, New Delhi",
    completedProjectsCount: 32,
    annualTurnover: 250000000,
    joinedDate: "2020-05-10",
    documents: [
      { id: "DOC-099", title: "Corporate Tax Clearance 2025-2026", type: "Tax Document", status: "Approved", date: "2026-01-10" },
      { id: "DOC-100", title: "ISO 9001 Quality Certificate", type: "Certification", status: "Approved", date: "2025-11-04" }
    ]
  },
  {
    id: "VND-10029",
    companyName: "Apex Cybertech Infrastructure Ltd.",
    registrationNumber: "REG-8821940-2021",
    taxId: "TAX-991204812",
    category: "Information Technology & Security",
    rating: 4.8,
    eligibilityScore: 96,
    riskScore: 14,
    riskLevel: "Low",
    verificationStatus: "Verified", // Verified, Pending, Suspended, Under Audit
    financialHealth: "A+",
    blacklisted: false,
    contactPerson: "Dr. Elena Rostova",
    email: "e.rostova@apexcyber.com",
    phone: "+91 98112 34567",
    address: "450 Technology Parkway, Suite 800, Tech City",
    completedProjectsCount: 24,
    annualTurnover: 145000000,
    joinedDate: "2021-03-15",
    documents: [
      { id: "DOC-101", title: "Corporate Tax Clearance 2025-2026", type: "Tax Document", status: "Approved", date: "2026-01-10" },
      { id: "DOC-102", title: "ISO 27001 Security Audit Certificate", type: "Certification", status: "Approved", date: "2025-11-04" },
      { id: "DOC-103", title: "Audited Financial Report FY25", type: "Financial", status: "Approved", date: "2026-02-18" }
    ]
  },
  {
    id: "VND-10030",
    companyName: "BuildCorp Heavy Industries Inc.",
    registrationNumber: "REG-4410923-2018",
    taxId: "TAX-441029311",
    category: "Civil Engineering & Construction",
    rating: 3.2,
    eligibilityScore: 78,
    riskScore: 82,
    riskLevel: "High",
    verificationStatus: "Under Audit",
    financialHealth: "B-",
    blacklisted: false,
    contactPerson: "Marcus Sterling",
    email: "m.sterling@buildcorp.org",
    phone: "+91 98223 45678",
    address: "120 Industrial Boulevard, Construction Hub",
    completedProjectsCount: 18,
    annualTurnover: 92000000,
    joinedDate: "2019-07-22",
    documents: [
      { id: "DOC-201", title: "Tax Compliance Form 2025", type: "Tax Document", status: "Flagged", date: "2026-06-12" },
      { id: "DOC-202", title: "Civil Contractors Class-A License", type: "License", status: "Approved", date: "2025-09-01" },
      { id: "DOC-203", title: "Financial Audit Report FY25", type: "Financial", status: "Needs Resubmission", date: "2026-05-30" }
    ]
  },
  {
    id: "VND-10031",
    companyName: "Helios Renewable Energy Solutions",
    registrationNumber: "REG-7719203-2022",
    taxId: "TAX-339102844",
    category: "Renewable Energy",
    rating: 4.6,
    eligibilityScore: 92,
    riskScore: 28,
    riskLevel: "Low",
    verificationStatus: "Verified",
    financialHealth: "A",
    blacklisted: false,
    contactPerson: "Sarah Jenkins",
    email: "s.jenkins@heliosenergy.io",
    phone: "+91 98334 56789",
    address: "88 Solar Way, Clean Power Park",
    completedProjectsCount: 15,
    annualTurnover: 68000000,
    joinedDate: "2022-09-10",
    documents: [
      { id: "DOC-301", title: "NABCEP Solar Certification", type: "Certification", status: "Approved", date: "2025-10-15" }
    ]
  },
  {
    id: "VND-10032",
    companyName: "Vanguard Defence Systems & Tech",
    registrationNumber: "REG-1192834-2017",
    taxId: "TAX-772819034",
    category: "Information Technology & Security",
    rating: 4.9,
    eligibilityScore: 98,
    riskScore: 9,
    riskLevel: "Low",
    verificationStatus: "Verified",
    financialHealth: "A++",
    blacklisted: false,
    contactPerson: "General (Ret.) Thomas Vance",
    email: "tvance@vanguarddef.com",
    phone: "+91 98445 67890",
    address: "1 Pentagon Plaza, Defense Sector",
    completedProjectsCount: 42,
    annualTurnover: 320000000,
    joinedDate: "2017-01-05",
    documents: [
      { id: "DOC-401", title: "Security Clearance Clearance Pass", type: "Security", status: "Approved", date: "2026-01-01" }
    ]
  },
  {
    id: "VND-10033",
    companyName: "OmniRoad Infrastructure Group",
    registrationNumber: "REG-9930129-2020",
    taxId: "TAX-661029384",
    category: "Civil Engineering & Construction",
    rating: 2.9,
    eligibilityScore: 65,
    riskScore: 89,
    riskLevel: "Critical",
    verificationStatus: "Suspended",
    financialHealth: "C",
    blacklisted: true,
    contactPerson: "Robert Vance Jr.",
    email: "r.vance@omniroad.net",
    phone: "+91 98556 78901",
    address: "99 Quarry Road, Industrial Zone",
    completedProjectsCount: 9,
    annualTurnover: 41000000,
    joinedDate: "2020-04-12",
    documents: [
      { id: "DOC-501", title: "Court Litigation Disclosure Notice", type: "Legal", status: "Rejected", date: "2026-04-10" }
    ]
  }
];

export const mockBids = [
  {
    id: "BID-1024",
    tenderId: "TND-2026-8901",
    tenderTitle: "Smart City Traffic System",
    vendorId: "VND-10028",
    vendorName: "ABC Infrastructure Pvt Ltd",
    bidderName: "ABC Infrastructure Pvt Ltd",
    vendorEmail: "info@abcinfra.com",
    proposedAmount: 4950000,
    currency: "INR",
    estimatedCompletionTime: "12 Months",
    bidScore: 96.0,
    aiRiskScore: 10,
    riskLevel: "Low",
    documentStatus: "Complete",
    eligibilityStatus: "Eligible",
    verificationStatus: "Verified",
    status: "Verified",
    submissionDate: "10/08/2026",
    submittedAt: "10/08/2026"
  },
  {
    id: "BID-1045",
    tenderId: "TND-2026-8903",
    tenderTitle: "Government Data Center",
    vendorId: "VND-10028",
    vendorName: "ABC Infrastructure Pvt Ltd",
    bidderName: "ABC Infrastructure Pvt Ltd",
    vendorEmail: "info@abcinfra.com",
    proposedAmount: 18500000,
    currency: "INR",
    estimatedCompletionTime: "8 Months",
    bidScore: 94.2,
    aiRiskScore: 12,
    riskLevel: "Low",
    documentStatus: "Complete",
    eligibilityStatus: "Eligible",
    verificationStatus: "Verified",
    status: "Verified",
    submissionDate: "08/08/2026",
    submittedAt: "08/08/2026"
  },
  {
    id: "BID-1081",
    tenderId: "TND-2026-8902",
    tenderTitle: "Road Infrastructure Upgrade",
    vendorId: "VND-10028",
    vendorName: "ABC Infrastructure Pvt Ltd",
    bidderName: "ABC Infrastructure Pvt Ltd",
    vendorEmail: "info@abcinfra.com",
    proposedAmount: 58000000,
    currency: "INR",
    estimatedCompletionTime: "18 Months",
    bidScore: 92.8,
    aiRiskScore: 15,
    riskLevel: "Low",
    documentStatus: "Complete",
    eligibilityStatus: "Eligible",
    verificationStatus: "Verified",
    status: "Verified",
    submissionDate: "05/08/2026",
    submittedAt: "05/08/2026"
  },
  {
    id: "BID-9011",
    tenderId: "TND-2026-8901",
    tenderTitle: "National Smart City Traffic Surveillance System Upgrade",
    vendorId: "VND-10029",
    vendorName: "Apex Cybertech Infrastructure Ltd.",
    bidderName: "Apex Cybertech Infrastructure Ltd.",
    vendorEmail: "e.rostova@apexcyber.com",
    proposedAmount: 41200000,
    currency: "INR",
    estimatedCompletionTime: "14 Months",
    bidScore: 94.5,
    aiRiskScore: 14,
    riskLevel: "Low",
    documentStatus: "Complete",
    eligibilityStatus: "Eligible",
    verificationStatus: "Verified",
    status: "Verified",
    submissionDate: "02/08/2026",
    submittedAt: "02/08/2026"
  },
  {
    id: "BID-9012",
    tenderId: "TND-2026-8901",
    tenderTitle: "National Smart City Traffic Surveillance System Upgrade",
    vendorId: "VND-10032",
    vendorName: "Vanguard Defence Systems & Tech",
    bidderName: "Vanguard Defence Systems & Tech",
    vendorEmail: "tvance@vanguarddef.com",
    proposedAmount: 43800000,
    currency: "INR",
    estimatedCompletionTime: "12 Months",
    bidScore: 92.1,
    aiRiskScore: 11,
    riskLevel: "Low",
    documentStatus: "Complete",
    eligibilityStatus: "Eligible",
    verificationStatus: "Pending Verification",
    status: "Pending Verification",
    submissionDate: "04/08/2026",
    submittedAt: "04/08/2026"
  },
  {
    id: "BID-9013",
    tenderId: "TND-2026-8902",
    tenderTitle: "Regional Highway Expansion & Paving (Sector 4-B)",
    vendorId: "VND-10030",
    vendorName: "BuildCorp Heavy Industries Inc.",
    bidderName: "BuildCorp Heavy Industries Inc.",
    vendorEmail: "m.sterling@buildcorp.org",
    proposedAmount: 58000000,
    currency: "INR",
    estimatedCompletionTime: "10 Months",
    bidScore: 61.0,
    aiRiskScore: 88,
    riskLevel: "High",
    documentStatus: "Missing",
    eligibilityStatus: "Under Review",
    verificationStatus: "Rejected",
    status: "Rejected",
    submissionDate: "01/08/2026",
    submittedAt: "01/08/2026"
  },
  {
    id: "BID-9014",
    tenderId: "TND-2026-8903",
    tenderTitle: "Government Data Center Solar Power Infrastructure",
    vendorId: "VND-10031",
    vendorName: "Helios Renewable Energy Solutions",
    bidderName: "Helios Renewable Energy Solutions",
    vendorEmail: "s.jenkins@heliosenergy.io",
    proposedAmount: 17200000,
    currency: "INR",
    estimatedCompletionTime: "8 Months",
    bidScore: 91.0,
    aiRiskScore: 22,
    riskLevel: "Low",
    documentStatus: "Complete",
    eligibilityStatus: "Eligible",
    verificationStatus: "Verified",
    status: "Verified",
    submissionDate: "03/08/2026",
    submittedAt: "03/08/2026"
  }
];

export const mockRiskAnalyses = {
  "BID-9013": {
    bidId: "BID-9013",
    tenderId: "TND-2026-8902",
    tenderTitle: "Regional Highway Expansion & Paving (Sector 4-B)",
    vendorName: "BuildCorp Heavy Industries Inc.",
    overallRiskScore: 88,
    riskLevel: "High",
    confidenceScore: 94.2,
    riskIndicators: {
      priceAnomaly: {
        score: 92,
        status: "Critical Anomaly",
        details: "Bid amount ($58M) is 29.2% lower than government benchmark ($82M). High probability of cost overrun or substandard materials."
      },
      collusionDetection: {
        score: 75,
        status: "High Suspicions",
        details: "IP address and metadata match pattern shared with suspended vendor 'OmniRoad Infrastructure Group'. Similar line-item pricing ratio."
      },
      vendorHistory: {
        score: 80,
        status: "Adverse Records",
        details: "2 project delays exceeding 180 days in state highway contracts between 2022 and 2024."
      },
      financialRisk: {
        score: 68,
        status: "Elevated Debt Ratio",
        details: "FY25 debt-to-equity ratio of 3.8:1. Working capital reserves below 5% of bid value."
      },
      complianceRisk: {
        score: 72,
        status: "Incomplete Docs",
        details: "Tax clearance document is currently under audit due to discrepancy in declared revenue."
      }
    },
    explainableAI: {
      keyFactors: [
        "Unusually aggressive bid pricing (-29.2% variance from department cost estimate).",
        "Overlapping subcontractor entity with blacklisted parent group.",
        "Pending tax clarification notice issued by State Treasury."
      ],
      recommendations: [
        "Mandatory financial audit before tender committee evaluation.",
        "Request detailed rate-analysis breakdown for asphalt raw material supply.",
        "Require enhanced performance bank guarantee (15% instead of standard 10%)."
      ]
    },
    timeline: [
      { step: "Automated Document Scan", result: "Completed - 1 Flag", date: "2026-08-01 10:14" },
      { step: "Price Anomaly Engine", result: "High Deviation (-29.2%)", date: "2026-08-01 10:15" },
      { step: "Collusion Pattern Graph Analysis", result: "74.8% Network Affinity", date: "2026-08-01 10:16" },
      { step: "Auditor Referral Triggered", result: "Queued for Manual Review", date: "2026-08-01 10:18" }
    ]
  },
  "BID-9011": {
    bidId: "BID-9011",
    tenderId: "TND-2026-8901",
    tenderTitle: "National Smart City Traffic Surveillance System Upgrade",
    vendorName: "Apex Cybertech Infrastructure Ltd.",
    overallRiskScore: 14,
    riskLevel: "Low",
    confidenceScore: 98.1,
    riskIndicators: {
      priceAnomaly: { score: 12, status: "Normal Range", details: "Bid price is within optimal benchmark range (-8.4%)." },
      collusionDetection: { score: 4, status: "No Indicators", details: "Independent bidding pattern confirmed across 12 tenders." },
      vendorHistory: { score: 8, status: "Exemplary", details: "24 completed contracts with 100% on-time completion record." },
      financialRisk: { score: 10, status: "Very Strong", details: "Debt-to-equity ratio 0.4:1. High liquid asset reserves." },
      complianceRisk: { score: 2, status: "Fully Compliant", details: "All ISO and tax clearance certificates verified & valid." }
    },
    explainableAI: {
      keyFactors: [
        "Vendor possesses verified ISO 27001 and Tier-A government security clearances.",
        "Pricing methodology matches historical market averages for optical sensors.",
        "Strong liquidity and proven track record in similar municipal IT contracts."
      ],
      recommendations: [
        "Fast-track technical evaluation committee review.",
        "Approved for final winner selection matrix consideration."
      ]
    },
    timeline: [
      { step: "Automated Document Scan", result: "100% Passed", date: "2026-08-02 14:20" },
      { step: "Price Anomaly Engine", result: "Optimal (-8.4%)", date: "2026-08-02 14:21" },
      { step: "Collusion Pattern Graph Analysis", result: "Clear", date: "2026-08-02 14:22" }
    ]
  }
};

export const mockUsers = [
  { id: "USR-001", name: "Alexander Vance", email: "a.vance@gov.procure.org", role: "Admin", department: "Central Procurement Authority", status: "Active", lastLogin: "10 mins ago", avatar: "AV" },
  { id: "USR-002", name: "Sarah Lin", email: "s.lin@gov.procure.org", role: "Procurement Officer", department: "Ministry of Transportation", status: "Active", lastLogin: "1 hour ago", avatar: "SL" },
  { id: "USR-003", name: "Dr. Jonathan Thorne", email: "j.thorne@audit.gov", role: "Auditor", department: "National Anti-Corruption & Audit Board", status: "Active", lastLogin: "30 mins ago", avatar: "JT" },
  { id: "USR-004", name: "Elena Rostova", email: "e.rostova@apexcyber.com", role: "Vendor", department: "Apex Cybertech Infrastructure Ltd.", status: "Active", lastLogin: "5 mins ago", avatar: "ER" },
  { id: "USR-005", name: "Marcus Sterling", email: "m.sterling@buildcorp.org", role: "Vendor", department: "BuildCorp Heavy Industries", status: "Pending Audit", lastLogin: "2 days ago", avatar: "MS" }
];

export const mockDocuments = [
  { id: "DOC-801", title: "Corporate Tax Clearance Certificate 2026", vendorName: "BuildCorp Heavy Industries Inc.", vendorId: "VND-10030", uploadedByEmail: "m.sterling@buildcorp.org", documentType: "Tax Certificate", fileUrl: "#", status: "Under Review", uploadedAt: "2026-08-01", aiConfidence: 68, verifiedBy: "Dr. Jonathan Thorne", resubmissionReason: "" },
  { id: "DOC-802", title: "ISO 27001 Cyber Security Compliance Audit", vendorName: "Acme Construction Services", vendorId: "VND-10029", uploadedByEmail: "vendor@certibid.com", documentType: "Security Audit", fileUrl: "#", status: "Approved", uploadedAt: "2026-07-28", aiConfidence: 99, verifiedBy: "Sarah Lin", resubmissionReason: "" },
  { id: "DOC-803", title: "Environmental Clearance Certificate Sector 4", vendorName: "BuildCorp Heavy Industries Inc.", vendorId: "VND-10030", uploadedByEmail: "m.sterling@buildcorp.org", documentType: "Environmental", fileUrl: "#", status: "Rejected", uploadedAt: "2026-07-25", aiConfidence: 42, verifiedBy: "Dr. Jonathan Thorne", resubmissionReason: "Expired validation stamp on page 4." },
  { id: "DOC-804", title: "NABCEP Solar Contractor Accreditation", vendorName: "Helios Renewable Energy Solutions", vendorId: "VND-10031", uploadedByEmail: "s.jenkins@heliosenergy.io", documentType: "Accreditation", fileUrl: "#", status: "Approved", uploadedAt: "2026-07-30", aiConfidence: 96, verifiedBy: "Sarah Lin", resubmissionReason: "" },
  { id: "DOC-805", title: "Audited Financial Statement FY25", vendorName: "OmniRoad Infrastructure Group", vendorId: "VND-10033", uploadedByEmail: "r.vance@omniroad.com", documentType: "Financial Report", fileUrl: "#", status: "Needs Resubmission", uploadedAt: "2026-07-15", aiConfidence: 51, verifiedBy: "Dr. Jonathan Thorne", resubmissionReason: "Missing independent auditor signature on page 12." }
];

export const mockTransactions = [
  { id: "TXN-EMD-882910", tenderTitle: "National Smart City Traffic Surveillance System", vendorName: "Apex Cybertech Infrastructure Ltd.", transactionType: "EMD Deposit", amount: 900000, currency: "USD", status: "Completed", date: "2026-08-02", receiptUrl: "#", invoiceNo: "INV-2026-901" },
  { id: "TXN-EMD-882915", tenderTitle: "National Smart City Traffic Surveillance System", vendorName: "Vanguard Defence Systems & Tech", transactionType: "EMD Deposit", amount: 900000, currency: "USD", status: "Completed", date: "2026-08-04", receiptUrl: "#", invoiceNo: "INV-2026-902" },
  { id: "TXN-EMD-771029", tenderTitle: "Regional Highway Expansion & Paving (Sector 4-B)", vendorName: "BuildCorp Heavy Industries Inc.", transactionType: "EMD Deposit", amount: 1640000, currency: "USD", status: "On Hold (Audit)", date: "2026-08-01", receiptUrl: "#", invoiceNo: "INV-2026-880" },
  { id: "TXN-AWARD-1002", tenderTitle: "State Public Healthcare Electronic Records Integration", vendorName: "Apex Cybertech Infrastructure Ltd.", transactionType: "Performance Bank Guarantee", amount: 2900000, currency: "USD", status: "Completed", date: "2026-07-22", receiptUrl: "#", invoiceNo: "INV-2026-750" }
];

export const mockAuditLogs = [
  { id: "LOG-5001", action: "Flagged High Risk Bid", user: "CertiBid AI System", userRole: "AI Risk Engine", entity: "BID-9013 (BuildCorp)", timestamp: "2026-08-01 10:18:22", ipAddress: "10.0.4.12", severity: "High" },
  { id: "LOG-5002", action: "Document Status Changed to Rejected", user: "Dr. Jonathan Thorne", userRole: "Auditor", entity: "DOC-803 (BuildCorp)", timestamp: "2026-08-01 11:45:01", ipAddress: "192.168.1.104", severity: "Medium" },
  { id: "LOG-5003", action: "Tender Published", user: "Sarah Lin", userRole: "Procurement Officer", entity: "TND-2026-8901", timestamp: "2026-07-10 09:00:00", ipAddress: "192.168.1.112", severity: "Low" },
  { id: "LOG-5004", action: "User Role Updated to Suspended", user: "Alexander Vance", userRole: "Admin", entity: "VND-10033 (OmniRoad)", timestamp: "2026-07-05 16:30:10", ipAddress: "10.0.1.2", severity: "Critical" }
];

export const mockNotifications = [
  { id: "NTF-101", title: "Critical Price Anomaly Detected", category: "Risk", message: "Bid BID-9013 from BuildCorp is 29.2% under baseline benchmark.", timestamp: "2 hours ago", read: false, priority: "High" },
  { id: "NTF-102", title: "New Bid Submitted for Smart City Upgrade", category: "Tender", message: "Apex Cybertech submitted proposal BID-9011.", timestamp: "5 hours ago", read: false, priority: "Medium" },
  { id: "NTF-103", title: "EMD Payment Verified", category: "Payment", message: "$900,000 EMD deposit confirmed for Vanguard Defence Systems.", timestamp: "1 day ago", read: true, priority: "Low" },
  { id: "NTF-104", title: "Document Resubmission Request", category: "Vendor", message: "Auditor requested financial audit resubmission from BuildCorp.", timestamp: "2 days ago", read: true, priority: "Medium" },
  { id: "NTF-105", title: "System Model Update Deployed", category: "System", message: "CertiBid AI Collusion Detection model updated to v4.2 with enhanced IP graph analysis.", timestamp: "3 days ago", read: true, priority: "Low" }
];
