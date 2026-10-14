-- Migration V001: Tenants (Companies/Factories), Authentication, Users & Audit
-- SANDRA GESTION - Développé par Radhwen Ennaceur

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    trade_name TEXT,
    matricule_fiscal TEXT NOT NULL UNIQUE,
    registre_commerce TEXT,
    code_douane TEXT,
    activity_type TEXT NOT NULL,
    address TEXT NOT NULL,
    governorate TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    currency TEXT NOT NULL DEFAULT 'TND',
    fodec_applicable INTEGER NOT NULL DEFAULT 0,
    vat_subject_type TEXT NOT NULL DEFAULT 'TOTAL',
    timbre_fiscal_amount REAL NOT NULL DEFAULT 1.000,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    role TEXT NOT NULL,
    permissions_json TEXT NOT NULL DEFAULT '[]',
    preferred_language TEXT NOT NULL DEFAULT 'fr',
    is_active INTEGER NOT NULL DEFAULT 1,
    last_login_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    session_type TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

INSERT OR REPLACE INTO schema_migrations (version, description) VALUES ('V001', 'Initial tenant management, authentication and audit logging');
