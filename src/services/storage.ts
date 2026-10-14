/**
 * SANDRA GESTION - Moteur de Persistance Local-First & Isolation Multi-Sociétés (Phase 2)
 * Développé par Radhwen Ennaceur
 */

import {
  Company,
  User,
  ThirdParty,
  Item,
  BillOfMaterials,
  ProductionOrder,
  Invoice,
  TreasuryAccount,
  AuditLog,
  ErpSessionType,
  Employee,
  Payslip,
  FixedAsset,
  AccountingEntry,
  AccountingEntryReversal,
} from '../types/erp';
import {
  initialCompanies,
  initialUsers,
  initialThirdParties,
  initialItems,
  initialBoms,
  initialProductionOrders,
  initialInvoices,
  initialTreasuryAccounts,
  initialAuditLogs,
  initialEmployees,
  initialPayslips,
  initialFixedAssets,
  initialAccountingEntries,
} from './seedData';

const STORAGE_KEYS = {
  COMPANIES: 'sandra_companies_v2',
  USERS: 'sandra_users_v2',
  THIRD_PARTIES: 'sandra_third_parties_v2',
  ITEMS: 'sandra_items_v2',
  BOMS: 'sandra_boms_v2',
  PRODUCTION_ORDERS: 'sandra_production_orders_v2',
  INVOICES: 'sandra_invoices_v2',
  TREASURY: 'sandra_treasury_v2',
  AUDIT_LOGS: 'sandra_audit_logs_v2',
  EMPLOYEES: 'sandra_employees_v2',
  PAYSLIPS: 'sandra_payslips_v2',
  FIXED_ASSETS: 'sandra_fixed_assets_v2',
  ACCOUNTING_ENTRIES: 'sandra_accounting_entries_v2',
  REVERSALS: 'sandra_reversals_v2',
  ACTIVE_COMPANY_ID: 'sandra_active_company_id_v2',
  ACTIVE_USER_ID: 'sandra_active_user_id_v2',
  ACTIVE_SESSION: 'sandra_active_session_v2',
  LANGUAGE: 'sandra_language_v2',
};

class StorageEngine {
  private get<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  public init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.COMPANIES)) {
      this.set(STORAGE_KEYS.COMPANIES, initialCompanies);
      this.set(STORAGE_KEYS.USERS, initialUsers);
      this.set(STORAGE_KEYS.THIRD_PARTIES, initialThirdParties);
      this.set(STORAGE_KEYS.ITEMS, initialItems);
      this.set(STORAGE_KEYS.BOMS, initialBoms);
      this.set(STORAGE_KEYS.PRODUCTION_ORDERS, initialProductionOrders);
      this.set(STORAGE_KEYS.INVOICES, initialInvoices);
      this.set(STORAGE_KEYS.TREASURY, initialTreasuryAccounts);
      this.set(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
      this.set(STORAGE_KEYS.EMPLOYEES, initialEmployees);
      this.set(STORAGE_KEYS.PAYSLIPS, initialPayslips);
      this.set(STORAGE_KEYS.FIXED_ASSETS, initialFixedAssets);
      this.set(STORAGE_KEYS.ACCOUNTING_ENTRIES, initialAccountingEntries);
      this.set(STORAGE_KEYS.REVERSALS, []);
      this.set(STORAGE_KEYS.ACTIVE_COMPANY_ID, initialCompanies[0].id);
      this.set(STORAGE_KEYS.ACTIVE_USER_ID, initialUsers[1].id); // Mounir Trabelsi (Owner)
      this.set(STORAGE_KEYS.ACTIVE_SESSION, 'FINANCIERE');
      this.set(STORAGE_KEYS.LANGUAGE, 'fr');
    }
  }

  // Active Context
  public getActiveCompanyId(): string {
    return this.get(STORAGE_KEYS.ACTIVE_COMPANY_ID, initialCompanies[0].id);
  }

  public setActiveCompanyId(id: string): void {
    this.set(STORAGE_KEYS.ACTIVE_COMPANY_ID, id);
  }

  public getActiveUserId(): string {
    return this.get(STORAGE_KEYS.ACTIVE_USER_ID, initialUsers[1].id);
  }

  public setActiveUserId(id: string): void {
    this.set(STORAGE_KEYS.ACTIVE_USER_ID, id);
  }

  public getActiveSession(): ErpSessionType {
    return this.get(STORAGE_KEYS.ACTIVE_SESSION, 'FINANCIERE');
  }

  public setActiveSession(session: ErpSessionType): void {
    this.set(STORAGE_KEYS.ACTIVE_SESSION, session);
  }

  public getLanguage(): 'fr' | 'ar' {
    return this.get(STORAGE_KEYS.LANGUAGE, 'fr');
  }

  public setLanguage(lang: 'fr' | 'ar'): void {
    this.set(STORAGE_KEYS.LANGUAGE, lang);
  }

  // Companies
  public getCompanies(): Company[] {
    return this.get(STORAGE_KEYS.COMPANIES, initialCompanies);
  }

  public addCompany(company: Company): void {
    const list = this.getCompanies();
    list.push(company);
    this.set(STORAGE_KEYS.COMPANIES, list);
    this.logAudit('CREATE_COMPANY', 'COMPANY', company.id, `Création société/usine ${company.name}`);
  }

  public updateCompany(updated: Company): void {
    const list = this.getCompanies().map((c) => (c.id === updated.id ? updated : c));
    this.set(STORAGE_KEYS.COMPANIES, list);
    this.logAudit('UPDATE_COMPANY', 'COMPANY', updated.id, `Mise à jour société ${updated.name}`);
  }

  // Users
  public getUsers(): User[] {
    return this.get(STORAGE_KEYS.USERS, initialUsers);
  }

  public getUsersByCompany(companyId: string | null): User[] {
    const all = this.getUsers();
    if (!companyId) return all;
    return all.filter((u) => u.companyId === null || u.companyId === companyId);
  }

  // Third Parties (Strict company isolation)
  public getThirdParties(companyId: string): ThirdParty[] {
    return this.get<ThirdParty[]>(STORAGE_KEYS.THIRD_PARTIES, initialThirdParties)
      .filter((t) => t.companyId === companyId);
  }

  public addThirdParty(thirdParty: ThirdParty): void {
    const all = this.get<ThirdParty[]>(STORAGE_KEYS.THIRD_PARTIES, initialThirdParties);
    all.push(thirdParty);
    this.set(STORAGE_KEYS.THIRD_PARTIES, all);
    this.logAudit('CREATE_THIRD_PARTY', 'THIRD_PARTY', thirdParty.id, `Ajout ${thirdParty.type}: ${thirdParty.name}`);
  }

  // Items
  public getItems(companyId: string): Item[] {
    return this.get<Item[]>(STORAGE_KEYS.ITEMS, initialItems)
      .filter((i) => i.companyId === companyId);
  }

  public addItem(item: Item): void {
    const all = this.get<Item[]>(STORAGE_KEYS.ITEMS, initialItems);
    all.push(item);
    this.set(STORAGE_KEYS.ITEMS, all);
    this.logAudit('CREATE_ITEM', 'ITEM', item.id, `Création article ${item.code} - ${item.nameFr}`);
  }

  // BOMs
  public getBoms(companyId: string): BillOfMaterials[] {
    return this.get<BillOfMaterials[]>(STORAGE_KEYS.BOMS, initialBoms)
      .filter((b) => b.companyId === companyId);
  }

  // Production Orders (Session Réelle)
  public getProductionOrders(companyId: string, session?: ErpSessionType): ProductionOrder[] {
    const list = this.get<ProductionOrder[]>(STORAGE_KEYS.PRODUCTION_ORDERS, initialProductionOrders)
      .filter((p) => p.companyId === companyId);
    if (session) {
      return list.filter((p) => p.sessionType === session);
    }
    return list;
  }

  public addProductionOrder(order: ProductionOrder): void {
    const all = this.get<ProductionOrder[]>(STORAGE_KEYS.PRODUCTION_ORDERS, initialProductionOrders);
    all.unshift(order);
    this.set(STORAGE_KEYS.PRODUCTION_ORDERS, all);
    this.logAudit('CREATE_PRODUCTION_ORDER', 'PRODUCTION_ORDER', order.id, `Lancement OF ${order.orderNumber} pour ${order.finishedGoodName}`);
  }

  // Invoices (Session Financière vs Réelle)
  public getInvoices(companyId: string, session?: ErpSessionType): Invoice[] {
    const list = this.get<Invoice[]>(STORAGE_KEYS.INVOICES, initialInvoices)
      .filter((i) => i.companyId === companyId);
    if (session) {
      return list.filter((i) => i.sessionType === session);
    }
    return list;
  }

  public addInvoice(invoice: Invoice): void {
    const all = this.get<Invoice[]>(STORAGE_KEYS.INVOICES, initialInvoices);
    all.unshift(invoice);
    this.set(STORAGE_KEYS.INVOICES, all);
    this.logAudit('CREATE_INVOICE', 'INVOICE', invoice.id, `Émission facture ${invoice.invoiceNumber} à ${invoice.thirdPartyName}`);
  }

  // Treasury
  public getTreasuryAccounts(companyId: string): TreasuryAccount[] {
    return this.get<TreasuryAccount[]>(STORAGE_KEYS.TREASURY, initialTreasuryAccounts)
      .filter((t) => t.companyId === companyId);
  }

  // Employees & Payroll (Phase 2)
  public getEmployees(companyId: string): Employee[] {
    return this.get<Employee[]>(STORAGE_KEYS.EMPLOYEES, initialEmployees)
      .filter((e) => e.companyId === companyId);
  }

  public addEmployee(emp: Employee): void {
    const all = this.get<Employee[]>(STORAGE_KEYS.EMPLOYEES, initialEmployees);
    all.push(emp);
    this.set(STORAGE_KEYS.EMPLOYEES, all);
    this.logAudit('CREATE_EMPLOYEE', 'EMPLOYEE', emp.id, `Embauche salarié ${emp.firstName} ${emp.lastName}`);
  }

  public getPayslips(companyId: string): Payslip[] {
    return this.get<Payslip[]>(STORAGE_KEYS.PAYSLIPS, initialPayslips)
      .filter((p) => p.companyId === companyId);
  }

  public addPayslip(ps: Payslip): void {
    const all = this.get<Payslip[]>(STORAGE_KEYS.PAYSLIPS, initialPayslips);
    all.unshift(ps);
    this.set(STORAGE_KEYS.PAYSLIPS, all);
    this.logAudit('RUN_PAYROLL', 'PAYSLIP', ps.id, `Bulletin de paie généré pour ${ps.employeeName}`);
  }

  // Fixed Assets (Phase 2)
  public getFixedAssets(companyId: string): FixedAsset[] {
    return this.get<FixedAsset[]>(STORAGE_KEYS.FIXED_ASSETS, initialFixedAssets)
      .filter((a) => a.companyId === companyId);
  }

  public addFixedAsset(asset: FixedAsset): void {
    const all = this.get<FixedAsset[]>(STORAGE_KEYS.FIXED_ASSETS, initialFixedAssets);
    all.push(asset);
    this.set(STORAGE_KEYS.FIXED_ASSETS, all);
    this.logAudit('CREATE_ASSET', 'FIXED_ASSET', asset.id, `Immobilisation acquise : ${asset.name}`);
  }

  // Accounting Entries & Controlled Reversal (Phase 2)
  public getAccountingEntries(companyId: string): AccountingEntry[] {
    return this.get<AccountingEntry[]>(STORAGE_KEYS.ACCOUNTING_ENTRIES, initialAccountingEntries)
      .filter((e) => e.companyId === companyId);
  }

  public addAccountingEntry(entry: AccountingEntry): void {
    const all = this.get<AccountingEntry[]>(STORAGE_KEYS.ACCOUNTING_ENTRIES, initialAccountingEntries);
    all.unshift(entry);
    this.set(STORAGE_KEYS.ACCOUNTING_ENTRIES, all);
    this.logAudit('CREATE_ENTRY', 'ACCOUNTING_ENTRY', entry.id, `Écriture comptable ${entry.entryNumber}: ${entry.libelle}`);
  }

  public reverseAccountingEntry(originalId: string, reason: string): boolean {
    const all = this.getAccountingEntries(this.getActiveCompanyId());
    const original = all.find((e) => e.id === originalId);
    if (!original || original.isReversed) return false;

    // Create balanced reversal lines (inverted debit & credit)
    const reversalLines = original.lines.map((l) => ({
      ...l,
      id: `rev-line-${Date.now()}-${Math.random()}`,
      libelle: `ANNULATION: ${l.libelle || original.libelle}`,
      debit: l.credit,
      credit: l.debit,
    }));

    const reversalEntry: AccountingEntry = {
      id: `rev-ecr-${Date.now()}`,
      companyId: original.companyId,
      sessionType: original.sessionType,
      journalCode: original.journalCode,
      entryNumber: `REV-${original.entryNumber}`,
      entryDate: new Date().toISOString().split('T')[0],
      pieceJustificative: original.pieceJustificative,
      libelle: `CONTRE-PASSATION: ${original.libelle} (Motif: ${reason})`,
      lines: reversalLines,
      debitTotal: original.creditTotal,
      creditTotal: original.debitTotal,
      isValidated: true,
      createdBy: this.getActiveUserId(),
      createdAt: new Date().toISOString(),
    };

    original.isReversed = true;
    original.reversalEntryId = reversalEntry.id;

    const allEntries = this.get<AccountingEntry[]>(STORAGE_KEYS.ACCOUNTING_ENTRIES, initialAccountingEntries);
    const updated = allEntries.map((e) => (e.id === original.id ? original : e));
    updated.unshift(reversalEntry);
    this.set(STORAGE_KEYS.ACCOUNTING_ENTRIES, updated);

    this.logAudit('REVERSE_ENTRY', 'ACCOUNTING_ENTRY', original.id, `Contre-passation de ${original.entryNumber}: ${reason}`);
    return true;
  }

  // Audit Logs
  public getAuditLogs(companyId?: string): AuditLog[] {
    const all = this.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
    if (!companyId) return all;
    return all.filter((l) => !l.companyId || l.companyId === companyId);
  }

  public logAudit(action: string, entityName: string, entityId: string, details: string): void {
    const all = this.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
    const users = this.getUsers();
    const activeUserId = this.getActiveUserId();
    const activeUser = users.find((u) => u.id === activeUserId);

    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      companyId: this.getActiveCompanyId(),
      userId: activeUserId,
      userName: activeUser?.fullName || 'Utilisateur Système',
      action,
      sessionType: this.getActiveSession(),
      entityName,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    all.unshift(log);
    this.set(STORAGE_KEYS.AUDIT_LOGS, all.slice(0, 100));
  }

  // Backup & Restore
  public createBackupJson(): string {
    const backup = {
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      generator: 'SANDRA GESTION V2.0 - Développé par Radhwen Ennaceur',
      data: {
        companies: this.getCompanies(),
        users: this.getUsers(),
        thirdParties: this.get(STORAGE_KEYS.THIRD_PARTIES, initialThirdParties),
        items: this.get(STORAGE_KEYS.ITEMS, initialItems),
        boms: this.get(STORAGE_KEYS.BOMS, initialBoms),
        productionOrders: this.get(STORAGE_KEYS.PRODUCTION_ORDERS, initialProductionOrders),
        invoices: this.get(STORAGE_KEYS.INVOICES, initialInvoices),
        treasury: this.get(STORAGE_KEYS.TREASURY, initialTreasuryAccounts),
        employees: this.get(STORAGE_KEYS.EMPLOYEES, initialEmployees),
        payslips: this.get(STORAGE_KEYS.PAYSLIPS, initialPayslips),
        fixedAssets: this.get(STORAGE_KEYS.FIXED_ASSETS, initialFixedAssets),
        accountingEntries: this.get(STORAGE_KEYS.ACCOUNTING_ENTRIES, initialAccountingEntries),
        auditLogs: this.get(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs),
      },
    };
    return JSON.stringify(backup, null, 2);
  }

  public restoreBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data || !parsed.data.companies) {
        throw new Error('Structure de sauvegarde invalide');
      }
      this.set(STORAGE_KEYS.COMPANIES, parsed.data.companies);
      this.set(STORAGE_KEYS.USERS, parsed.data.users);
      this.set(STORAGE_KEYS.THIRD_PARTIES, parsed.data.thirdParties);
      this.set(STORAGE_KEYS.ITEMS, parsed.data.items);
      this.set(STORAGE_KEYS.BOMS, parsed.data.boms);
      this.set(STORAGE_KEYS.PRODUCTION_ORDERS, parsed.data.productionOrders);
      this.set(STORAGE_KEYS.INVOICES, parsed.data.invoices);
      this.set(STORAGE_KEYS.TREASURY, parsed.data.treasury);
      if (parsed.data.employees) this.set(STORAGE_KEYS.EMPLOYEES, parsed.data.employees);
      if (parsed.data.payslips) this.set(STORAGE_KEYS.PAYSLIPS, parsed.data.payslips);
      if (parsed.data.fixedAssets) this.set(STORAGE_KEYS.FIXED_ASSETS, parsed.data.fixedAssets);
      if (parsed.data.accountingEntries) this.set(STORAGE_KEYS.ACCOUNTING_ENTRIES, parsed.data.accountingEntries);
      if (parsed.data.auditLogs) this.set(STORAGE_KEYS.AUDIT_LOGS, parsed.data.auditLogs);
      return true;
    } catch (e) {
      console.error('Erreur restauration:', e);
      return false;
    }
  }
}

export const storage = new StorageEngine();
