/**
 * SANDRA GESTION - Shared TypeScript Contracts & Domain Models (Phase 2)
 * Developed by Radhwen Ennaceur
 */

export type ErpSessionType = 'FINANCIERE' | 'REELLE';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'COMPANY_OWNER'
  | 'ACCOUNTANT'
  | 'FACTORY_MANAGER'
  | 'SALES_AGENT'
  | 'CASHIER'
  | 'AUDITOR';

export type CompanyActivityType =
  | 'MANUFACTURING_FACTORY'
  | 'COMMERCIAL'
  | 'SERVICES';

export type StockItemCategory =
  | 'RAW_MATERIAL'
  | 'FINISHED_GOOD'
  | 'SEMI_FINISHED'
  | 'PACKAGING'
  | 'MERCHANDISE';

export type VatRate = 19 | 7 | 13 | 0;

export interface Company {
  id: string;
  name: string;
  tradeName?: string;
  matriculeFiscal: string; // e.g. 1458923/A/M/000
  registreCommerce?: string; // RNE
  codeDouane?: string;
  activityType: CompanyActivityType;
  address: string;
  governorate: string;
  phone?: string;
  email?: string;
  currency: 'TND';
  fodecApplicable: boolean; // 1% for factories
  timbreFiscalAmount: number; // 1.000 DT
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  companyId: string | null; // null for SuperAdmin
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: UserRole;
  preferredLanguage: 'fr' | 'ar';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface ThirdParty {
  id: string;
  companyId: string;
  type: 'CLIENT' | 'SUPPLIER';
  code: string;
  name: string;
  matriculeFiscal?: string;
  registreCommerce?: string;
  address?: string;
  governorate?: string;
  phone?: string;
  email?: string;
  vatExempt: boolean;
  retenueSourceRate: number; // e.g. 1.5, 1.0, 15.0
  paymentTermsDays: number;
  soldeActuel: number;
  isActive: boolean;
}

export interface Item {
  id: string;
  companyId: string;
  code: string;
  barcode?: string;
  nameFr: string;
  nameAr: string;
  category: StockItemCategory;
  unit: string;
  purchasePriceHt: number;
  sellingPriceHt: number;
  vatRate: VatRate;
  fodecApplicable: boolean;
  stockMinimum: number;
  stockActuel: number;
  valeurStockPmp: number; // Prix Moyen Pondéré
  warehouseId?: string;
  isActive: boolean;
}

export interface InvoiceLine {
  id: string;
  itemId?: string;
  description: string;
  quantity: number;
  unitPriceHt: number;
  discountPct: number;
  totalHt: number;
  vatRate: VatRate;
  vatAmount: number;
  fodecAmount: number;
  totalTtc: number;
}

export interface Invoice {
  id: string;
  companyId: string;
  sessionType: ErpSessionType;
  direction: 'SALE' | 'PURCHASE';
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  thirdPartyId: string;
  thirdPartyName: string;
  thirdPartyMatricule?: string;
  lines: InvoiceLine[];
  totalHt: number;
  totalFodec: number;
  totalVat19: number;
  totalVat7: number;
  totalVat13: number;
  totalVat: number;
  timbreFiscal: number; // 1.000 DT
  totalTtc: number;
  retenueSourceRate: number;
  retenueSourceAmount: number;
  netToPay: number;
  amountPaid: number;
  status: 'DRAFT' | 'VALIDATED' | 'PAID' | 'CANCELLED';
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface BomComponent {
  id: string;
  rawMaterialId: string;
  rawMaterialName: string;
  quantity: number;
  unitCost: number;
  lossPercentage: number;
}

export interface BillOfMaterials {
  id: string;
  companyId: string;
  finishedGoodId: string;
  finishedGoodName: string;
  code: string;
  version: string;
  standardQuantity: number;
  components: BomComponent[];
  laborStandardHours: number;
  machineStandardHours: number;
  isActive: boolean;
}

export interface ProductionOrder {
  id: string;
  companyId: string;
  sessionType: ErpSessionType; // REELLE
  orderNumber: string;
  bomId: string;
  finishedGoodId: string;
  finishedGoodName: string;
  quantityPlanned: number;
  quantityProduced: number;
  quantityScrap: number; // Rebuts
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dateStart?: string;
  dateEnd?: string;
  costRawMaterials: number;
  costLabor: number;
  costMachineOverhead: number;
  costTotalReal: number;
  unitCostReal: number;
  supervisorName: string;
  notes?: string;
  createdAt: string;
}

export interface AccountingEntryLine {
  id: string;
  accountNumber: string;
  accountLabel: string;
  libelle?: string;
  debit: number;
  credit: number;
}

export interface AccountingEntry {
  id: string;
  companyId: string;
  sessionType: ErpSessionType;
  journalCode: string; // VT, AC, BQ, CA, OD
  entryNumber: string;
  entryDate: string;
  pieceJustificative?: string;
  libelle: string;
  lines: AccountingEntryLine[];
  debitTotal: number;
  creditTotal: number;
  isValidated: boolean;
  isReversed?: boolean;
  reversalEntryId?: string;
  createdBy: string;
  createdAt: string;
}

export interface AccountingEntryReversal {
  id: string;
  companyId: string;
  originalEntryId: string;
  reversalEntryId: string;
  reason: string;
  reversedBy: string;
  reversedAt: string;
}

export interface TreasuryAccount {
  id: string;
  companyId: string;
  code: string;
  name: string;
  type: 'BANK' | 'CASH';
  bankRib?: string;
  currentBalance: number;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  companyId?: string | null;
  userId: string;
  userName: string;
  action: string;
  sessionType: ErpSessionType;
  entityName: string;
  entityId: string;
  details: string;
  timestamp: string;
}

// ----------------------------------------------------------------------------
// PHASE 2 ADDITIONS: PAYROLL & FIXED ASSETS & SYNC
// ----------------------------------------------------------------------------

export interface Employee {
  id: string;
  companyId: string;
  matricule: string;
  cin: string; // CIN 8 chiffres
  cnssNumber?: string;
  firstName: string;
  lastName: string;
  department: string;
  jobTitle: string;
  contractType: 'CDI' | 'CDD' | 'SIVP' | 'CIVP';
  maritalStatus: 'SINGLE' | 'MARRIED';
  childrenCount: number;
  baseSalaryMonthly: number;
  hourlyRate: number;
  bankName?: string;
  bankRib?: string;
  isActive: boolean;
  hireDate: string;
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  companyId: string;
  periodMonth: number;
  periodYear: number;
  baseSalary: number;
  overtimeHours: number;
  overtimeAmount: number;
  bonusesTaxable: number;
  grossSalary: number;
  cnssRateEmployee: number; // 9.18%
  cnssEmployeeAmount: number;
  taxableGross: number;
  professionalExpensesDeduction: number; // 10% plafonné
  familyDeduction: number;
  netTaxable: number;
  irppAmount: number;
  netSalary: number;
  cnssEmployerAmount: number; // 16.57%
  foprolosAmount: number; // 1%
  tfpAmount: number; // 1% usine ou 2% négoce
  totalEmployerCost: number;
}

export interface FixedAsset {
  id: string;
  companyId: string;
  code: string;
  name: string;
  category: 'INDUSTRIAL_EQUIPMENT' | 'BUILDING' | 'VEHICLE' | 'IT_EQUIPMENT' | 'FIXTURES';
  acquisitionDate: string;
  commissioningDate: string;
  accountAssetCode: string; // 223000
  accountAmortCode: string; // 282300
  accountDotationCode: string; // 681100
  acquisitionCostHt: number;
  additionalExpensesHt: number;
  totalGrossValue: number;
  residualValue: number;
  depreciationMethod: 'LINEAR' | 'DECLINING';
  usefulLifeYears: number;
  annualRate: number;
  accumulatedDepreciation: number;
  netBookValue: number; // VNC
  isRetired: boolean;
}

export interface DepreciationScheduleItem {
  id: string;
  assetId: string;
  fiscalYear: number;
  depreciationBase: number;
  depreciationAmount: number;
  cumulativeDepreciation: number;
  netBookValueEnd: number;
  isPosted: boolean;
}

export interface SyncPacket {
  id: string;
  companyId: string;
  clientDeviceId: string;
  deviceName: string;
  platform: 'WINDOWS_WPF' | 'ANDROID_KOTLIN';
  operationCount: number;
  timestamp: string;
  status: 'PENDING' | 'SYNCED' | 'CONFLICT';
}
