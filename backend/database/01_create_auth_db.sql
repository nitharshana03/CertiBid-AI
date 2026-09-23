-- Database 1: certibid_auth_db
CREATE DATABASE IF NOT EXISTS certibid_auth_db;
USE certibid_auth_db;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL,
    role_title VARCHAR(100),
    department VARCHAR(150),
    organization VARCHAR(200),
    vendor_id VARCHAR(36),
    avatar VARCHAR(10),
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    last_login_at DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    reset_token VARCHAR(100),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL
);
