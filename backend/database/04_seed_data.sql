-- Seed Data for CertiBid AI Microservices

-- 1. Auth Database Seed Data
USE certibid_auth_db;

-- Passwords hashed with BCrypt for 'password123': $2a$10$2.8X86Q1vQ1S01S.1S.1S.8X86Q1vQ1S01S.1S.1S.8X86Q1vQ
-- All seed accounts password: password123
INSERT INTO users (id, email, password_hash, name, role, role_title, department, organization, status, created_at)
VALUES 
('usr-admin-001', 'admin@certibid.com', '$2a$10$2.8X86Q1vQ1S01S.1S.1S.8X86Q1vQ1S01S.1S.1S.8X86Q1vQ', 'System Administrator', 'ADMIN', 'Chief Technology Officer', 'IT Operations', 'CertiBid AI Gov', 'Active', NOW()),
('usr-officer-001', 'officer@certibid.com', '$2a$10$2.8X86Q1vQ1S01S.1S.1S.8X86Q1vQ1S01S.1S.1S.8X86Q1vQ', 'Sarah Connor', 'OFFICER', 'Senior Procurement Officer', 'Infrastructure & Public Works', 'Department of Transportation', 'Active', NOW()),
('usr-vendor-001', 'vendor@certibid.com', '$2a$10$2.8X86Q1vQ1S01S.1S.1S.8X86Q1vQ1S01S.1S.1S.8X86Q1vQ', 'Acme Construction Services', 'BIDDER', 'Managing Director', 'Commercial Bidding', 'Acme Infrastructure Inc.', 'Active', NOW())
ON DUPLICATE KEY UPDATE email=email;


-- 2. Procurement Database Seed Data
USE certibid_procurement_db;

INSERT INTO vendors (id, company_name, registration_no, contact_email, contact_phone, address, verification_status, rating, category, created_at)
VALUES
('VND-10029', 'Acme Construction Services', 'REG-2024-8891', 'vendor@certibid.com', '+1-555-0192', '100 Industrial Parkway, Metro City', 'Verified', 4.8, 'Civil Construction', NOW()),
('VND-10030', 'Apex Engineering Corp', 'REG-2024-9912', 'contact@apexeng.com', '+1-555-0188', '45 Enterprise Way, Innovation Park', 'Verified', 4.6, 'Electrical Systems', NOW()),
('VND-10031', 'Global Tech Solutions', 'REG-2024-3310', 'info@globaltech.io', '+1-555-0144', '800 Cyber Boulevard, Suite 300', 'Verified', 4.9, 'Information Technology', NOW())
ON DUPLICATE KEY UPDATE company_name=company_name;

INSERT INTO tenders (id, title, description, category, estimated_budget, currency, emd_amount, status, created_by, department, bids_count, submission_deadline, created_at)
VALUES
('TND-2026-8901', 'City Smart Highway Expansion Project', 'Construction of 12km 6-lane smart highway incorporating IoT traffic management sensors and LED lighting.', 'Civil Construction', 15000000.0, 'USD', 300000.0, 'Published', 'Sarah Connor', 'Infrastructure & Public Works', 2, '2026-09-15', NOW()),
('TND-2026-8902', 'Enterprise Cloud Migration & AI Analytics Platform', 'Full migration of legacy municipal data centers to hybrid cloud architecture with automated AI data pipelines.', 'Information Technology', 4500000.0, 'USD', 90000.0, 'Published', 'Sarah Connor', 'IT Operations', 1, '2026-09-01', NOW())
ON DUPLICATE KEY UPDATE title=title;

INSERT INTO bids (id, tender_id, vendor_id, vendor_name, proposed_amount, completion_time_days, status, proposal_summary, submitted_at)
VALUES
('BID-9901', 'TND-2026-8901', 'VND-10029', 'Acme Construction Services', 14200000.0, 180, 'Submitted', 'Comprehensive turnkey proposal leveraging pre-fabricated steel structures and IoT sensors.', NOW()),
('BID-9902', 'TND-2026-8901', 'VND-10030', 'Apex Engineering Corp', 14850000.0, 210, 'Submitted', 'State-of-the-art highway expansion with 5-year warranty on digital sensor systems.', NOW())
ON DUPLICATE KEY UPDATE proposed_amount=proposed_amount;

INSERT INTO transactions (id, transaction_ref, tender_id, tender_title, vendor_id, vendor_name, type, amount, currency, status, invoice_no, receipt_url, date, created_at)
VALUES
('TX-8801', 'TXN-EMD-2026-001', 'TND-2026-8901', 'City Smart Highway Expansion Project', 'VND-10029', 'Acme Construction Services', 'EMD Deposit', 300000.0, 'USD', 'Completed', 'INV-EMD-8801', '#', '2026-08-13', NOW())
ON DUPLICATE KEY UPDATE transaction_ref=transaction_ref;

INSERT INTO audit_logs (id, user, user_role, action, entity, timestamp, ip_address, severity)
VALUES
('LOG-1001', 'Sarah Connor', 'OFFICER', 'CREATE_TENDER', 'TND-2026-8901', '2026-08-13 10:00:00', '127.0.0.1', 'Low'),
('LOG-1002', 'Acme Construction Services', 'VENDOR', 'SUBMIT_BID', 'BID-9901', '2026-08-13 10:15:00', '127.0.0.1', 'Low')
ON DUPLICATE KEY UPDATE id=id;


-- 3. AI Risk Database Seed Data
USE certibid_risk_db;

INSERT INTO risk_analyses (id, bid_id, tender_id, vendor_id, tender_title, vendor_name, overall_risk_score, risk_level, confidence_score, price_anomaly_score, collusion_probability, financial_risk_score, compliance_score, risk_indicators_json, explainable_ai_json, timeline_json, key_factors, recommendations, analysis_summary, status, created_at, analyzed_at)
VALUES
(1, 'BID-9901', 'TND-2026-8901', 'VND-10029', 'City Smart Highway Expansion Project', 'Acme Construction Services', 18, 'Low', 96.5, 12, 3.2, 15, 95, 
'{"priceAnomaly":{"score":12,"status":"Normal","details":"Price proposal is 5.3% below estimated budget, within healthy margin."},"collusionDetection":{"score":3,"status":"Clear","details":"No bidding pattern similarities or IP address overlap detected."}}',
'{"keyFactors":["Standard price proposal within benchmark variance.","Verified corporate credentials and active tax status."],"recommendations":["Proceed to standard technical bid evaluation."]}',
'[{"step":"AI Scan & Anomaly Analysis","result":"Completed","date":"2026-08-13 10:00:00"}]',
'["Standard price proposal within benchmark variance.", "Verified corporate credentials."]',
'["Proceed to standard technical evaluation."]',
'Comprehensive AI risk scan completed successfully. Low risk score with high confidence.', 'COMPLETED', NOW(), NOW())
ON DUPLICATE KEY UPDATE bid_id=bid_id;
