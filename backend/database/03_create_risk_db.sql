-- Database 3: certibid_risk_db
CREATE DATABASE IF NOT EXISTS certibid_risk_db;
USE certibid_risk_db;

CREATE TABLE IF NOT EXISTS risk_analyses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bid_id VARCHAR(36) NOT NULL UNIQUE,
    tender_id VARCHAR(36),
    vendor_id VARCHAR(36),
    tender_title VARCHAR(255),
    vendor_name VARCHAR(255),
    overall_risk_score INT,
    risk_level VARCHAR(30),
    confidence_score DOUBLE,
    price_anomaly_score INT,
    collusion_probability DOUBLE,
    financial_risk_score INT,
    compliance_score INT,
    risk_indicators_json TEXT,
    explainable_ai_json TEXT,
    timeline_json TEXT,
    key_factors TEXT,
    recommendations TEXT,
    flagged_items TEXT,
    analysis_summary TEXT,
    status VARCHAR(30) DEFAULT 'COMPLETED',
    is_escalated BOOLEAN DEFAULT FALSE,
    escalated_to VARCHAR(100),
    escalated_by VARCHAR(100),
    escalation_notes TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    analyzed_at DATETIME
);

CREATE TABLE IF NOT EXISTS escalation_logs (
    id VARCHAR(36) PRIMARY KEY,
    bid_id VARCHAR(36) NOT NULL,
    escalated_by VARCHAR(100) NOT NULL,
    escalated_to VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    urgency VARCHAR(30) DEFAULT 'HIGH',
    status VARCHAR(30) DEFAULT 'OPEN',
    created_at DATETIME NOT NULL
);
