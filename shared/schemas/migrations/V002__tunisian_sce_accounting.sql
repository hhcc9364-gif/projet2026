-- Migration V002: Tunisian SCE Accounting, Third Parties, Inventory and Invoicing
-- SANDRA GESTION - Développé par Radhwen Ennaceur

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    account_number TEXT NOT NULL,
    label_fr TEXT NOT NULL,
    label_ar TEXT NOT NULL,
    account_class INTEGER NOT NULL,
    account_type TEXT NOT NULL,
    is_reconciled INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE(company_id, account_number)
);

CREATE TABLE IF NOT EXISTS accounting_journals (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    session_type TEXT NOT NULL DEFAULT 'FINANCIERE',
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS accounting_entries (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    journal_id TEXT NOT NULL,
    entry_number TEXT NOT NULL,
    entry_date TEXT NOT NULL,
    session_type TEXT NOT NULL DEFAULT 'FINANCIERE',
    piece_justificative TEXT,
    libelle TEXT NOT NULL,
    debit_total REAL NOT NULL DEFAULT 0.000,
    credit_total REAL NOT NULL DEFAULT 0.000,
    is_validated INTEGER NOT NULL DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (journal_id) REFERENCES accounting_journals(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS accounting_entry_lines (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    libelle TEXT,
    debit REAL NOT NULL DEFAULT 0.000,
    credit REAL NOT NULL DEFAULT 0.000,
    tiers_type TEXT,
    tiers_id TEXT,
    FOREIGN KEY (entry_id) REFERENCES accounting_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS third_parties (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    type TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    matricule_fiscal TEXT,
    registre_commerce TEXT,
    address TEXT,
    governorate TEXT,
    phone TEXT,
    email TEXT,
    vat_exempt INTEGER NOT NULL DEFAULT 0,
    retenue_source_rate REAL NOT NULL DEFAULT 0.0,
    payment_terms_days INTEGER NOT NULL DEFAULT 30,
    solde_initial REAL NOT NULL DEFAULT 0.000,
    solde_actuel REAL NOT NULL DEFAULT 0.000,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS warehouses (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    location TEXT,
    is_factory_storage INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    code TEXT NOT NULL,
    barcode TEXT,
    name_fr TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'U',
    purchase_price_ht REAL NOT NULL DEFAULT 0.000,
    selling_price_ht REAL NOT NULL DEFAULT 0.000,
    vat_rate REAL NOT NULL DEFAULT 19.0,
    fodec_applicable INTEGER NOT NULL DEFAULT 0,
    stock_minimum REAL NOT NULL DEFAULT 0,
    stock_actuel REAL NOT NULL DEFAULT 0,
    valeur_stock_pmp REAL NOT NULL DEFAULT 0.000,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    session_type TEXT NOT NULL DEFAULT 'FINANCIERE',
    direction TEXT NOT NULL,
    invoice_number TEXT NOT NULL,
    invoice_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    third_party_id TEXT NOT NULL,
    total_ht REAL NOT NULL DEFAULT 0.000,
    total_fodec REAL NOT NULL DEFAULT 0.000,
    total_vat_19 REAL NOT NULL DEFAULT 0.000,
    total_vat_7 REAL NOT NULL DEFAULT 0.000,
    total_vat_13 REAL NOT NULL DEFAULT 0.000,
    total_vat REAL NOT NULL DEFAULT 0.000,
    timbre_fiscal REAL NOT NULL DEFAULT 1.000,
    total_ttc REAL NOT NULL DEFAULT 0.000,
    retenue_source_rate REAL NOT NULL DEFAULT 0.0,
    retenue_source_amount REAL NOT NULL DEFAULT 0.000,
    net_to_pay REAL NOT NULL DEFAULT 0.000,
    amount_paid REAL NOT NULL DEFAULT 0.000,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    notes TEXT,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (third_party_id) REFERENCES third_parties(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    UNIQUE(company_id, direction, invoice_number)
);

CREATE TABLE IF NOT EXISTS invoice_lines (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    item_id TEXT,
    description TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 1,
    unit_price_ht REAL NOT NULL DEFAULT 0.000,
    discount_pct REAL NOT NULL DEFAULT 0.0,
    total_ht REAL NOT NULL DEFAULT 0.000,
    vat_rate REAL NOT NULL DEFAULT 19.0,
    vat_amount REAL NOT NULL DEFAULT 0.000,
    fodec_amount REAL NOT NULL DEFAULT 0.000,
    total_ttc REAL NOT NULL DEFAULT 0.000,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL
);

INSERT OR REPLACE INTO schema_migrations (version, description) VALUES ('V002', 'Tunisian SCE accounting, third parties and sales invoicing');
