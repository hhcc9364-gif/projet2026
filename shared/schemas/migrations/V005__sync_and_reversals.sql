-- Migration V005: Offline Synchronization, Change Tracking, Period Closing & Reversals
-- SANDRA GESTION - Développé par Radhwen Ennaceur

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- 1. FISCAL PERIODS (Protection des exercices clôturés)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fiscal_periods (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    fiscal_year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    is_closed INTEGER NOT NULL DEFAULT 0,
    closed_at TEXT,
    closed_by TEXT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE(company_id, fiscal_year, month)
);

-- ----------------------------------------------------------------------------
-- 2. ACCOUNTING ENTRY REVERSALS (Contre-passation / Annulation contrôlée)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS accounting_entry_reversals (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    original_entry_id TEXT NOT NULL,
    reversal_entry_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    reversed_by TEXT NOT NULL,
    reversed_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (original_entry_id) REFERENCES accounting_entries(id) ON DELETE RESTRICT,
    FOREIGN KEY (reversal_entry_id) REFERENCES accounting_entries(id) ON DELETE RESTRICT,
    FOREIGN KEY (reversed_by) REFERENCES users(id) ON DELETE RESTRICT,
    UNIQUE(original_entry_id)
);

-- ----------------------------------------------------------------------------
-- 3. SYNC LOG & CHANGE TRACKING (Windows Desktop <-> Android Mobile)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sync_change_log (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    client_device_id TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL,              -- 'INSERT', 'UPDATE', 'DELETE'
    data_payload_json TEXT NOT NULL,
    change_vector INTEGER NOT NULL,
    conflict_resolved INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sync_device_registrations (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    device_name TEXT NOT NULL,
    platform TEXT NOT NULL,                -- 'WINDOWS_WPF', 'ANDROID_KOTLIN'
    registered_user_id TEXT NOT NULL,
    public_key_fingerprint TEXT,
    last_sync_at TEXT,
    is_trusted INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (registered_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    UNIQUE(company_id, device_id)
);

INSERT OR REPLACE INTO schema_migrations (version, description) VALUES ('V005', 'Synchronization tracking and accounting entry reversal controls');
