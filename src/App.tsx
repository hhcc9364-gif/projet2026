/**
 * SANDRA GESTION - ERP & Comptabilité Tunisienne
 * Développé par Radhwen Ennaceur
 */

import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import {
  Company,
  User,
  ErpSessionType,
  Invoice,
  ProductionOrder,
  Item,
  BillOfMaterials,
  ThirdParty,
  TreasuryAccount,
  AuditLog,
  Employee,
  Payslip,
  FixedAsset,
  AccountingEntry,
} from './types/erp';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { SalesInvoicingView } from './components/SalesInvoicingView';
import { ManufacturingView } from './components/ManufacturingView';
import { AccountingSceView } from './components/AccountingSceView';
import { PayrollView } from './components/PayrollView';
import { FixedAssetsView } from './components/FixedAssetsView';
import { InventoryStockView } from './components/InventoryStockView';
import { TreasuryView } from './components/TreasuryView';
import { ThirdPartiesView } from './components/ThirdPartiesView';
import { DataSyncView } from './components/DataSyncView';
import { SuperAdminPortal } from './components/SuperAdminPortal';
import { ArchitectureExplorer } from './components/ArchitectureExplorer';
import { BackupRestoreModal } from './components/BackupRestoreModal';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [activeSession, setActiveSession] = useState<ErpSessionType>('FINANCIERE');
  const [language, setLanguage] = useState<'fr' | 'ar'>('fr');
  const [activeCompanyId, setActiveCompanyId] = useState<string>('');
  const [showBackupModal, setShowBackupModal] = useState(false);

  // Entities state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [boms, setBoms] = useState<BillOfMaterials[]>([]);
  const [thirdParties, setThirdParties] = useState<ThirdParty[]>([]);
  const [treasury, setTreasury] = useState<TreasuryAccount[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>([]);
  const [accountingEntries, setAccountingEntries] = useState<AccountingEntry[]>([]);

  // Load from local-first storage
  const reloadData = () => {
    storage.init();
    const comps = storage.getCompanies();
    setCompanies(comps);

    const savedCompanyId = storage.getActiveCompanyId();
    const currentCompId = comps.find((c) => c.id === savedCompanyId)?.id || comps[0]?.id || '';
    setActiveCompanyId(currentCompId);

    const sess = storage.getActiveSession();
    setActiveSession(sess);

    const lang = storage.getLanguage();
    setLanguage(lang);

    setUsers(storage.getUsers());
    setInvoices(storage.getInvoices(currentCompId, sess));
    setProductionOrders(storage.getProductionOrders(currentCompId, sess));
    setItems(storage.getItems(currentCompId));
    setBoms(storage.getBoms(currentCompId));
    setThirdParties(storage.getThirdParties(currentCompId));
    setTreasury(storage.getTreasuryAccounts(currentCompId));
    setAuditLogs(storage.getAuditLogs(currentCompId));
    setEmployees(storage.getEmployees(currentCompId));
    setPayslips(storage.getPayslips(currentCompId));
    setFixedAssets(storage.getFixedAssets(currentCompId));
    setAccountingEntries(storage.getAccountingEntries(currentCompId));
    setIsInitialized(true);
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Update HTML dir when language changes
  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'fr');
    }
  }, [language]);

  // When active company or session changes, reload scoped data
  useEffect(() => {
    if (!activeCompanyId) return;
    setInvoices(storage.getInvoices(activeCompanyId, activeSession));
    setProductionOrders(storage.getProductionOrders(activeCompanyId, activeSession));
    setItems(storage.getItems(activeCompanyId));
    setBoms(storage.getBoms(activeCompanyId));
    setThirdParties(storage.getThirdParties(activeCompanyId));
    setTreasury(storage.getTreasuryAccounts(activeCompanyId));
    setAuditLogs(storage.getAuditLogs(activeCompanyId));
    setEmployees(storage.getEmployees(activeCompanyId));
    setPayslips(storage.getPayslips(activeCompanyId));
    setFixedAssets(storage.getFixedAssets(activeCompanyId));
    setAccountingEntries(storage.getAccountingEntries(activeCompanyId));
  }, [activeCompanyId, activeSession]);

  const handleSelectCompany = (id: string) => {
    setActiveCompanyId(id);
    storage.setActiveCompanyId(id);
  };

  const handleToggleSession = (sess: ErpSessionType) => {
    setActiveSession(sess);
    storage.setActiveSession(sess);
  };

  const handleToggleLanguage = (lang: 'fr' | 'ar') => {
    setLanguage(lang);
    storage.setLanguage(lang);
  };

  const handleAddInvoice = (newInv: Invoice) => {
    storage.addInvoice(newInv);
    setInvoices(storage.getInvoices(activeCompanyId, activeSession));
  };

  const handleAddProductionOrder = (newOrder: ProductionOrder) => {
    storage.addProductionOrder(newOrder);
    setProductionOrders(storage.getProductionOrders(activeCompanyId, activeSession));
  };

  const handleAddItem = (newItem: Item) => {
    storage.addItem(newItem);
    setItems(storage.getItems(activeCompanyId));
  };

  const handleAddThirdParty = (newTp: ThirdParty) => {
    storage.addThirdParty(newTp);
    setThirdParties(storage.getThirdParties(activeCompanyId));
  };

  const handleAddCompany = (newComp: Company) => {
    storage.addCompany(newComp);
    setCompanies(storage.getCompanies());
    handleSelectCompany(newComp.id);
  };

  const handleUpdateCompany = (updated: Company) => {
    storage.updateCompany(updated);
    setCompanies(storage.getCompanies());
  };

  const handleAddEmployee = (newEmp: Employee) => {
    storage.addEmployee(newEmp);
    setEmployees(storage.getEmployees(activeCompanyId));
  };

  const handleAddPayslip = (newPs: Payslip) => {
    storage.addPayslip(newPs);
    setPayslips(storage.getPayslips(activeCompanyId));
  };

  const handleAddFixedAsset = (newFa: FixedAsset) => {
    storage.addFixedAsset(newFa);
    setFixedAssets(storage.getFixedAssets(activeCompanyId));
  };

  const handleAddAccountingEntry = (newEntry: AccountingEntry) => {
    storage.addAccountingEntry(newEntry);
    setAccountingEntries(storage.getAccountingEntries(activeCompanyId));
  };

  const handleReverseAccountingEntry = (entryId: string, reason: string) => {
    storage.reverseAccountingEntry(entryId, reason);
    setAccountingEntries(storage.getAccountingEntries(activeCompanyId));
  };

  const activeCompany = companies.find((c) => c.id === activeCompanyId) || companies[0];
  const currentUser = users.find((u) => u.id === storage.getActiveUserId()) || users[0];

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#070D1D] flex items-center justify-center text-amber-400 font-mono text-sm">
        Chargement du socle SANDRA GESTION...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070D1D] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <Header
        companies={companies}
        activeCompany={activeCompany}
        onSelectCompany={handleSelectCompany}
        activeSession={activeSession}
        onToggleSession={handleToggleSession}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        currentUser={currentUser}
        onOpenBackup={() => setShowBackupModal(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          activeSession={activeSession}
          currentUser={currentUser}
          language={language}
        />

        {/* Main Workstation View Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              company={activeCompany}
              session={activeSession}
              invoices={invoices}
              productionOrders={productionOrders}
              items={items}
              treasury={treasury}
              language={language}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'invoices' && (
            <SalesInvoicingView
              company={activeCompany}
              session={activeSession}
              invoices={invoices}
              thirdParties={thirdParties}
              items={items}
              language={language}
              onAddInvoice={handleAddInvoice}
            />
          )}

          {activeTab === 'manufacturing' && (
            <ManufacturingView
              company={activeCompany}
              session={activeSession}
              productionOrders={productionOrders}
              boms={boms}
              items={items}
              language={language}
              onAddProductionOrder={handleAddProductionOrder}
            />
          )}

          {activeTab === 'accounting' && (
            <AccountingSceView
              company={activeCompany}
              session={activeSession}
              invoices={invoices}
              accountingEntries={accountingEntries}
              language={language}
              onReverseEntry={handleReverseAccountingEntry}
            />
          )}

          {activeTab === 'payroll' && (
            <PayrollView
              company={activeCompany}
              session={activeSession}
              employees={employees}
              payslips={payslips}
              language={language}
              onAddEmployee={handleAddEmployee}
              onAddPayslip={handleAddPayslip}
              onPostPayrollToAccounting={handleAddAccountingEntry}
            />
          )}

          {activeTab === 'fixed_assets' && (
            <FixedAssetsView
              company={activeCompany}
              session={activeSession}
              fixedAssets={fixedAssets}
              language={language}
              onAddFixedAsset={handleAddFixedAsset}
              onPostDepreciationToAccounting={handleAddAccountingEntry}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryStockView
              company={activeCompany}
              session={activeSession}
              items={items}
              language={language}
              onAddItem={handleAddItem}
            />
          )}

          {activeTab === 'treasury' && (
            <TreasuryView
              company={activeCompany}
              session={activeSession}
              treasury={treasury}
              language={language}
            />
          )}

          {activeTab === 'third_parties' && (
            <ThirdPartiesView
              company={activeCompany}
              session={activeSession}
              thirdParties={thirdParties}
              language={language}
              onAddThirdParty={handleAddThirdParty}
            />
          )}

          {activeTab === 'sync' && (
            <DataSyncView
              company={activeCompany}
              session={activeSession}
              language={language}
            />
          )}

          {activeTab === 'super_admin' && (
            <SuperAdminPortal
              companies={companies}
              users={users}
              auditLogs={auditLogs}
              language={language}
              onAddCompany={handleAddCompany}
              onUpdateCompany={handleUpdateCompany}
            />
          )}

          {activeTab === 'architecture' && (
            <ArchitectureExplorer language={language} />
          )}
        </main>
      </div>

      {/* Backup and Restore Modal */}
      <BackupRestoreModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        onDataRestored={reloadData}
        language={language}
      />
    </div>
  );
}
