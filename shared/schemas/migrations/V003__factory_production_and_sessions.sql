-- Migration V003: Factory Manufacturing, BOM, Stock Movements & Treasury
-- SANDRA GESTION - Développé par Radhwen Ennaceur

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    session_type TEXT NOT NULL, -- 'FINANCIERE' or 'REELLE'
    item_id TEXT NOT NULL,
    warehouse_id TEXT NOT NULL,
    movement_type TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS bills_of_materials (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    finished_good_id TEXT NOT NULL,
    code TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0',
    standard_quantity REAL NOT NULL DEFAULT 1.0,
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
    loss_percentage REAL NOT NULL DEFAULT 0.0,
    FOREIGN KEY (bom_id) REFERENCES bills_of_materials(id) ON DELETE CASCADE,
    FOREIGN KEY (raw_material_id) REFERENCES items(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS production_orders (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    session_type TEXT NOT NULL DEFAULT 'REELLE',
    order_number TEXT NOT NULL,
    bom_id TEXT NOT NULL,
    finished_good_id TEXT NOT NULL,
    quantity_planned REAL NOT NULL,
    quantity_produced REAL NOT NULL DEFAULT 0.0,
    quantity_scrap REAL NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'PLANNED',
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

CREATE TABLE IF NOT EXISTS treasury_accounts (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    bank_rib TEXT,
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
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    reference_number TEXT,
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

INSERT OR REPLACE INTO schema_migrations (version, description) VALUES ('V003', 'Factory manufacturing BOM, production orders and treasury');
