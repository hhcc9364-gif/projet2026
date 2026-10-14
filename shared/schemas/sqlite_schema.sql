-- ============================================================================
-- SANDRA GESTION - Canonical SQLite Database Schema
-- Business ERP & Accounting for Tunisian Companies and Factories
-- Developed by Radhwen Ennaceur
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- 1. COMPANIES & FACTORIES (Multi-tenant isolation)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    trade_name TEXT,
    matricule_fiscal TEXT NOT NULL UNIQUE,  -- e.g. 1458923/A/M/000
    registre_commerce TEXT,                 -- Registre National des Entreprises (RNE)
    code_douane TEXT,                       -- Pour les sociétés industrielles totalement exportatrices
    activity_type TEXT NOT NULL,            -- 'MANUFACTURING_FACTORY', 'COMMERCIAL', 'SERVICES'
    address TEXT NOT NULL,
    governorate TEXT NOT NULL,              -- Tunis, Sfax, Sousse, Monastir, Bizerte, Nabeul, Mahdia...
    phone TEXT,
    email TEXT,
    currency TEXT NOT NULL DEFAULT 'TND',
    fodec_applicable INTEGER NOT NULL DEFAULT 0, -- 1 pour usines de fabrication (1% FODEC)
    vat_subject_type TEXT NOT NULL DEFAULT 'TOTAL', -- 'TOTAL' (Assujetti total), 'PARTIEL', 'EXONERE'
    timbre_fiscal_amount REAL NOT NULL DEFAULT 1.000, -- 1.000 TND standard
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------------------
-- 2. USERS, ROLES & PERMISSIONS (Strict RBAC & Tenant Isolation)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    company_id TEXT, -- NULL for global SuperAdmin; specific company_id for tenant users
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    password_hash TEXT NOT NULL, -- PBKDF2 with SHA-512 + Salt
    password_salt TEXT NOT NULL,
    role TEXT NOT NULL,          -- 'SUPER_ADMIN', 'COMPANY_OWNER', 'ACCOUNTANT', 'FACTORY_MANAGER', 'SALES_AGENT', 'CASHIER'
    permissions_json TEXT NOT NULL DEFAULT '[]', -- Granular permission claims
    preferred_language TEXT NOT NULL DEFAULT 'fr', -- 'fr' or 'ar'
    is_active INTEGER NOT NULL DEFAULT 1,
    last_login_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- 3. AUDIT LOG (Tamper-evident system activity trail)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,      -- 'LOGIN', 'CREATE_INVOICE', 'MODIFY_STOCK', 'SWITCH_SESSION', etc.
    session_type TEXT NOT NULL, -- 'FINANCIERE' or 'REELLE'
    entity_name TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 4. TUNISIAN SCE ACCOUNTING PLAN (Classes 1 to 7)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    account_number TEXT NOT NULL, -- e.g. '701000' (Ventes PF), '411000' (Clients)
    label_fr TEXT NOT NULL,
    label_ar TEXT NOT NULL,
    account_class INTEGER NOT NULL, -- 1 to 7
    account_type TEXT NOT NULL,     -- 'ASSET', 'LIABILITY', 'EQUITY', 'EXPENSE', 'REVENUE'
    is_reconciled INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE(company_id, account_number)
);

CREATE TABLE IF NOT EXISTS accounting_journals (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    code TEXT NOT NULL, -- 'VT' (Ventes), 'AC' (Achats), 'BQ' (Banque), 'CA' (Caisse), 'OD' (Opérations diverses)
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
    session_type TEXT NOT NULL DEFAULT 'FINANCIERE', -- Strict session tagging
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
    tiers_type TEXT, -- 'CLIENT', 'FOURNISSEUR', 'SALARIE'
    tiers_id TEXT,
    FOREIGN KEY (entry_id) REFERENCES accounting_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 5. THIRD PARTIES (Clients, Fournisseurs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS third_parties (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'CLIENT' or 'SUPPLIER'
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    matricule_fiscal TEXT,
    registre_commerce TEXT,
    address TEXT,
    governorate TEXT,
    phone TEXT,
    email TEXT,
    vat_exempt INTEGER NOT NULL DEFAULT 0, -- Exonéré de TVA (avec attestation)
    retenue_source_rate REAL NOT NULL DEFAULT 0.0, -- e.g. 1.5% ou 1.0%
    payment_terms_days INTEGER NOT NULL DEFAULT 30,
    solde_initial REAL NOT NULL DEFAULT 0.000,
    solde_actuel REAL NOT NULL DEFAULT 0.000,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE(company_id, code)
);

-- ----------------------------------------------------------------------------
-- 6. INVENTORY & WAREHOUSES (Dépôts, Articles, Matières Premières & PF)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warehouses (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    location TEXT,
    is_factory_storage INTEGER NOT NULL DEFAULT 0, -- Dépôt usine
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
    category TEXT NOT NULL, -- 'RAW_MATERIAL' (Matière Première), 'FINISHED_GOOD' (Produit Fini), 'SEMI_FINISHED', 'PACKAGING', 'MERCHANDISE'
    unit TEXT NOT NULL DEFAULT 'U', -- 'U', 'KG', 'LITRE', 'METRE', 'CARTON'
    purchase_price_ht REAL NOT NULL DEFAULT 0.000,
    selling_price_ht REAL NOT NULL DEFAULT 0.000,
    vat_rate REAL NOT NULL DEFAULT 19.0, -- 19.0, 7.0, 13.0, 0.0
    fodec_applicable INTEGER NOT NULL DEFAULT 0,
    stock_minimum REAL NOT NULL DEFAULT 0,
    stock_actuel REAL NOT NULL DEFAULT 0,
    valeur_stock_pmp REAL NOT NULL DEFAULT 0.000, -- Prix Moyen Pondéré
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    session_type TEXT NOT NULL, -- 'FINANCIERE' or 'REELLE'
    item_id TEXT NOT NULL,
    warehouse_id TEXT NOT NULL,
    movement_type TEXT NOT NULL, -- 'IN_PURCHASE', 'OUT_SALE', 'IN_PRODUCTION', 'OUT_CONSUMPTION', 'ADJUSTMENT'
    quantity REAL NOT NULL,
    unit_cost REAL NOT NULL,
    total_cost REAL NOT NULL,
    reference_document TEXT,
    movement_date TEXT NOT NULL DEFAULT (datetime('now')),
    notes TEXT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 7. SALES & PURCHASES (Facturation Tunisienne avec Timbre & Retenue)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    session_type TEXT NOT NULL DEFAULT 'FINANCIERE',
    direction TEXT NOT NULL,     -- 'SALE' (Vente) or 'PURCHASE' (Achat)
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
    timbre_fiscal REAL NOT NULL DEFAULT 1.000, -- 1 Dinar standard tunisien
    total_ttc REAL NOT NULL DEFAULT 0.000,
    retenue_source_rate REAL NOT NULL DEFAULT 0.0,
    retenue_source_amount REAL NOT NULL DEFAULT 0.000,
    net_to_pay REAL NOT NULL DEFAULT 0.000,
    amount_paid REAL NOT NULL DEFAULT 0.000,
    status TEXT NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'VALIDATED', 'PAID', 'CANCELLED'
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

-- ----------------------------------------------------------------------------
-- 8. MANUFACTURING & USINE (Session Réelle - Production, BOM, Coûts Réels)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bills_of_materials (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    finished_good_id TEXT NOT NULL,
    code TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0',
    standard_quantity REAL NOT NULL DEFAULT 1.0, -- ex: Pour fabriquer 100 unités
    labor_standard_hours REAL NOT NULL DEFAULT 0.0,
    machine_standard_hours REAL NOT NULL DEFAULT 0.0,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (finished_good_id) REFERENCES items(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS bom_components (
    id TEXT PRIMARY KEY,
    bom_id TEXT NOT NULL,
    raw_material_id TEXT NOT NULL,
    quantity REAL NOT NULL,
    loss_percentage REAL NOT NULL DEFAULT 0.0, -- Taux de perte/déchet
    FOREIGN KEY (bom_id) REFERENCES bills_of_materials(id) ON DELETE CASCADE,
    FOREIGN KEY (raw_material_id) REFERENCES items(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS production_orders (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    session_type TEXT NOT NULL DEFAULT 'REELLE', -- Usine & Fabrication réelle
    order_number TEXT NOT NULL,
    bom_id TEXT NOT NULL,
    finished_good_id TEXT NOT NULL,
    quantity_planned REAL NOT NULL,
    quantity_produced REAL NOT NULL DEFAULT 0.0,
    quantity_scrap REAL NOT NULL DEFAULT 0.0, -- Rebuts d'usine
    status TEXT NOT NULL DEFAULT 'PLANNED', -- 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    date_start TEXT,
    date_end TEXT,
    cost_raw_materials REAL NOT NULL DEFAULT 0.000,
    cost_labor REAL NOT NULL DEFAULT 0.000,
    cost_machine_overhead REAL NOT NULL DEFAULT 0.000,
    cost_total_real REAL NOT NULL DEFAULT 0.000,
    unit_cost_real REAL NOT NULL DEFAULT 0.000,
    supervisor_id TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (bom_id) REFERENCES bills_of_materials(id) ON DELETE RESTRICT,
    FOREIGN KEY (finished_good_id) REFERENCES items(id) ON DELETE RESTRICT,
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE RESTRICT,
    UNIQUE(company_id, order_number)
);

-- ----------------------------------------------------------------------------
-- 9. TREASURY, CASH & BANK (Comptes Financiers en Dinars Tunisiens)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS treasury_accounts (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'BANK' (BIAT, BNA, etc.) or 'CASH' (Caisse principale)
    bank_rib TEXT,      -- Relevé d'Identité Bancaire Tunisien (20 chiffres)
    current_balance REAL NOT NULL DEFAULT 0.000,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS treasury_transactions (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    session_type TEXT NOT NULL DEFAULT 'FINANCIERE',
    treasury_account_id TEXT NOT NULL,
    transaction_date TEXT NOT NULL,
    type TEXT NOT NULL, -- 'INFLOW' or 'OUTFLOW'
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL, -- 'CHEQUE', 'VIREMENT', 'ESPECES', 'TRAITE'
    reference_number TEXT,        -- N° Chèque, Référence Virement bancaire
    third_party_id TEXT,
    invoice_id TEXT,
    libelle TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (treasury_account_id) REFERENCES treasury_accounts(id) ON DELETE RESTRICT,
    FOREIGN KEY (third_party_id) REFERENCES third_parties(id) ON DELETE SET NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 10. INDEXES FOR HIGH PERFORMANCE & COMPANY ISOLATION
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_session ON invoices(company_id, session_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_company_session ON stock_movements(company_id, session_type);
CREATE INDEX IF NOT EXISTS idx_production_orders_company_session ON production_orders(company_id, session_type);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_company_session ON accounting_entries(company_id, session_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON audit_logs(company_id);
