-- Database 2: certibid_procurement_db
CREATE DATABASE IF NOT EXISTS certibid_procurement_db;
USE certibid_procurement_db;

CREATE TABLE IF NOT EXISTS vendors (
    id VARCHAR(36) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    registration_no VARCHAR(100),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    address TEXT,
    verification_status VARCHAR(50) DEFAULT 'Pending',
    rating DOUBLE DEFAULT 0.0,
    category VARCHAR(100),
    eligibility_score INT DEFAULT 85,
    risk_score INT DEFAULT 20,
    risk_level VARCHAR(30) DEFAULT 'Low',
    financial_health VARCHAR(10) DEFAULT 'A',
    blacklisted BOOLEAN DEFAULT FALSE,
    completed_projects_count INT DEFAULT 0,
    tax_status VARCHAR(50) DEFAULT 'Verified',
    created_at DATETIME NOT NULL,
    updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS tenders (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    estimated_budget DOUBLE NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    emd_amount DOUBLE,
    status VARCHAR(50) DEFAULT 'Published',
    publishing_date VARCHAR(50),
    submission_deadline VARCHAR(50),
    risk_level VARCHAR(30) DEFAULT 'Low',
    ai_risk_score INT DEFAULT 15,
    eligible_vendors_count INT DEFAULT 10,
    bids_count INT DEFAULT 0,
    created_by VARCHAR(100),
    department VARCHAR(100),
    created_at DATETIME NOT NULL,
    updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS bids (
    id VARCHAR(36) PRIMARY KEY,
    tender_id VARCHAR(36) NOT NULL,
    vendor_id VARCHAR(36) NOT NULL,
    vendor_name VARCHAR(255),
    proposed_amount DOUBLE NOT NULL,
    completion_time_days INT,
    status VARCHAR(50) DEFAULT 'Submitted',
    proposal_summary TEXT,
    submission_date VARCHAR(50),
    bid_score DOUBLE DEFAULT 85.0,
    ai_risk_score INT DEFAULT 15,
    risk_level VARCHAR(30) DEFAULT 'Low',
    price_anomaly_ratio DOUBLE DEFAULT 0.0,
    collusion_probability DOUBLE DEFAULT 0.0,
    compliance_score INT DEFAULT 95,
    emd_payment_status VARCHAR(50) DEFAULT 'Verified & Paid',
    emd_transaction_id VARCHAR(100),
    submitted_at DATETIME NOT NULL,
    FOREIGN KEY (tender_id) REFERENCES tenders(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    vendor_id VARCHAR(36) NOT NULL,
    tender_id VARCHAR(36),
    bid_id VARCHAR(36),
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    status VARCHAR(30) DEFAULT 'Under Review',
    uploaded_at DATE NOT NULL,
    ai_confidence INT DEFAULT 90,
    verified_by VARCHAR(150),
    resubmission_reason TEXT,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    transaction_ref VARCHAR(100) NOT NULL UNIQUE,
    tender_id VARCHAR(36),
    tender_title VARCHAR(255),
    vendor_id VARCHAR(36),
    vendor_name VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    amount DOUBLE NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL,
    invoice_no VARCHAR(100),
    receipt_url VARCHAR(255),
    date VARCHAR(50),
    created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    user VARCHAR(150),
    user_role VARCHAR(50),
    entity VARCHAR(100),
    timestamp VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50),
    severity VARCHAR(30) DEFAULT 'Low'
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO',
    timestamp VARCHAR(100),
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL
);
