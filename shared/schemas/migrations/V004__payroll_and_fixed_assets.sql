-- Migration V004: Tunisian Payroll (Paie Tunisienne) & Fixed Assets (Immobilisations)
-- SANDRA GESTION - Développé par Radhwen Ennaceur

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- 1. EMPLOYEES & PAYROLL (Régime CNSS, IRPP, FOPROLOS, TFP)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    matricule TEXT NOT NULL,
    cin TEXT NOT NULL,                     -- Carte d'Identité Nationale Tunisienne (8 chiffres)
    cnss_number TEXT,                      -- Numéro d'Affiliation CNSS (8 chiffres + 2 clé)
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT,
    hire_date TEXT NOT NULL,
    department TEXT NOT NULL,              -- Usine / Atelier, Administration, Commercial, Maintenance
    job_title TEXT NOT NULL,
    contract_type TEXT NOT NULL DEFAULT 'CDI', -- CDI, CDD, SIVP, CIVP, APPRENTI
    marital_status TEXT NOT NULL DEFAULT 'SINGLE', -- SINGLE, MARRIED, DIVORCED, WIDOWED
    children_count INTEGER NOT NULL DEFAULT 0,
    base_salary_monthly REAL NOT NULL DEFAULT 0.000,
    hourly_rate REAL NOT NULL DEFAULT 0.000,
    bank_name TEXT,
    bank_rib TEXT,                         -- RIB 20 chiffres
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE(company_id, matricule)
);

CREATE TABLE IF NOT EXISTS payroll_runs (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL,
    run_date TEXT NOT NULL,
    total_gross REAL NOT NULL DEFAULT 0.000,
    total_cnss_employee REAL NOT NULL DEFAULT 0.000,
    total_taxable_gross REAL NOT NULL DEFAULT 0.000,
    total_irpp REAL NOT NULL DEFAULT 0.000,
    total_net REAL NOT NULL DEFAULT 0.000,
    total_cnss_employer REAL NOT NULL DEFAULT 0.000,
    total_foprolos REAL NOT NULL DEFAULT 0.000,
    total_tfp REAL NOT NULL DEFAULT 0.000,
    total_employer_cost REAL NOT NULL DEFAULT 0.000,
    is_posted_to_accounting INTEGER NOT NULL DEFAULT 0,
    accounting_entry_id TEXT,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (accounting_entry_id) REFERENCES accounting_entries(id) ON DELETE SET NULL,
    UNIQUE(company_id, period_year, period_month)
);

CREATE TABLE IF NOT EXISTS payslips (
    id TEXT PRIMARY KEY,
    payroll_run_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    base_salary REAL NOT NULL DEFAULT 0.000,
    overtime_hours REAL NOT NULL DEFAULT 0.0,
    overtime_amount REAL NOT NULL DEFAULT 0.000,
    bonuses_taxable REAL NOT NULL DEFAULT 0.000,
    bonuses_exempt REAL NOT NULL DEFAULT 0.000,
    gross_salary REAL NOT NULL DEFAULT 0.000,
    cnss_rate_employee REAL NOT NULL DEFAULT 9.18,  -- 9.18% régime général
    cnss_employee_amount REAL NOT NULL DEFAULT 0.000,
    taxable_gross REAL NOT NULL DEFAULT 0.000,
    professional_expenses_deduction REAL NOT NULL DEFAULT 0.000, -- 10% plafonné
    family_deduction REAL NOT NULL DEFAULT 0.000,
    net_taxable REAL NOT NULL DEFAULT 0.000,
    irpp_amount REAL NOT NULL DEFAULT 0.000,
    advances_deduction REAL NOT NULL DEFAULT 0.000,
    net_salary REAL NOT NULL DEFAULT 0.000,
    cnss_employer_rate REAL NOT NULL DEFAULT 16.57, -- 16.57%
    cnss_employer_amount REAL NOT NULL DEFAULT 0.000,
    work_accident_rate REAL NOT NULL DEFAULT 1.5,   -- Variable selon activité industrielle usine
    work_accident_amount REAL NOT NULL DEFAULT 0.000,
    foprolos_amount REAL NOT NULL DEFAULT 0.000,    -- 1%
    tfp_amount REAL NOT NULL DEFAULT 0.000,         -- 1% usine ou 2% commercial
    total_employer_cost REAL NOT NULL DEFAULT 0.000,
    FOREIGN KEY (payroll_run_id) REFERENCES payroll_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- 2. FIXED ASSETS & DEPRECIATION (Immobilisations & Amortissements SCE)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fixed_assets (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,               -- 'INDUSTRIAL_EQUIPMENT', 'BUILDING', 'VEHICLE', 'IT_EQUIPMENT', 'FIXTURES'
    acquisition_date TEXT NOT NULL,
    commissioning_date TEXT NOT NULL,     -- Date de mise en service
    account_asset_code TEXT NOT NULL,     -- e.g. '223000' Matériel industriel
    account_amort_code TEXT NOT NULL,     -- e.g. '282300' Amortissement matériel
    account_dotation_code TEXT NOT NULL,  -- e.g. '681100' Dotations aux amortissements
    acquisition_cost_ht REAL NOT NULL,
    additional_expenses_ht REAL NOT NULL DEFAULT 0.000,
    total_gross_value REAL NOT NULL,
    residual_value REAL NOT NULL DEFAULT 0.000,
    depreciation_method TEXT NOT NULL DEFAULT 'LINEAR', -- 'LINEAR', 'DECLINING'
    useful_life_years INTEGER NOT NULL,   -- e.g. 5, 10 ans
    annual_rate REAL NOT NULL,            -- e.g. 20.0%, 10.0%
    accumulated_depreciation REAL NOT NULL DEFAULT 0.000,
    net_book_value REAL NOT NULL,         -- Valeur Nette Comptable (VNC)
    is_retired INTEGER NOT NULL DEFAULT 0,
    disposal_date TEXT,
    disposal_proceeds REAL DEFAULT 0.000,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS asset_depreciation_schedules (
    id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL,
    fiscal_year INTEGER NOT NULL,
    depreciation_base REAL NOT NULL,
    depreciation_amount REAL NOT NULL,
    cumulative_depreciation REAL NOT NULL,
    net_book_value_end REAL NOT NULL,
    is_posted INTEGER NOT NULL DEFAULT 0,
    accounting_entry_id TEXT,
    FOREIGN KEY (asset_id) REFERENCES fixed_assets(id) ON DELETE CASCADE,
    FOREIGN KEY (accounting_entry_id) REFERENCES accounting_entries(id) ON DELETE SET NULL,
    UNIQUE(asset_id, fiscal_year)
);

INSERT OR REPLACE INTO schema_migrations (version, description) VALUES ('V004', 'Tunisian payroll system and fixed assets depreciation');
