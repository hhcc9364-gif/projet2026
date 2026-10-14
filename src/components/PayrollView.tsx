import React, { useState } from 'react';
import {
  Users,
  Plus,
  Printer,
  Calculator,
  ShieldCheck,
  CheckCircle,
  FileText,
  Building,
  UserCheck,
  Percent,
} from 'lucide-react';
import { Company, Employee, Payslip, ErpSessionType, AccountingEntry } from '../types/erp';
import { formatTnd, roundToMillimes } from '../services/tunisianFiscal';

interface PayrollViewProps {
  company: Company;
  session: ErpSessionType;
  employees: Employee[];
  payslips: Payslip[];
  language: 'fr' | 'ar';
  onAddEmployee: (employee: Employee) => void;
  onAddPayslip: (payslip: Payslip) => void;
  onPostPayrollToAccounting: (entry: AccountingEntry) => void;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  company,
  session,
  employees,
  payslips,
  language,
  onAddEmployee,
  onAddPayslip,
  onPostPayrollToAccounting,
}) => {
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'employees' | 'payslips'>('payslips');
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  // New Employee Form
  const [empMatricule, setEmpMatricule] = useState('');
  const [empCin, setEmpCin] = useState('');
  const [empCnss, setEmpCnss] = useState('');
  const [empFirstName, setEmpFirstName] = useState('');
  const [empLastName, setEmpLastName] = useState('');
  const [empDepartment, setEmpDepartment] = useState('Atelier Usine');
  const [empJobTitle, setEmpJobTitle] = useState('Opérateur Presse');
  const [empMarital, setEmpMarital] = useState<'SINGLE' | 'MARRIED'>('SINGLE');
  const [empChildren, setEmpChildren] = useState(0);
  const [empBaseSalary, setEmpBaseSalary] = useState(1200);

  // New Payslip Form
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [periodMonth, setPeriodMonth] = useState(10);
  const [periodYear, setPeriodYear] = useState(2026);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [bonusesTaxable, setBonusesTaxable] = useState(0);

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId) || employees[0];
  const baseSalary = selectedEmployee?.baseSalaryMonthly || 1200;
  const hourlyRate = selectedEmployee?.hourlyRate || 7.5;

  // Live calculation of Tunisian payroll
  const overtimeAmount = roundToMillimes(overtimeHours * hourlyRate * 1.25);
  const grossSalary = roundToMillimes(baseSalary + overtimeAmount + bonusesTaxable);
  const cnssEmployeeAmount = roundToMillimes(grossSalary * 0.0918); // 9.18%
  const taxableGross = roundToMillimes(grossSalary - cnssEmployeeAmount);

  // Frais professionnels: 10% plafonné à 166.666 TND/mois
  const maxProf = 166.666;
  const rawProf = roundToMillimes(taxableGross * 0.1);
  const profExpensesDeduction = Math.min(rawProf, maxProf);

  // Déductions familiales: Marié = 25 DT/mois (300/an), Enfants = 8.333 DT/mois (100/an)
  let familyDeduction = 0;
  if (selectedEmployee?.maritalStatus === 'MARRIED') familyDeduction += 25.0;
  familyDeduction += Math.min(selectedEmployee?.childrenCount || 0, 4) * 8.333;
  familyDeduction = roundToMillimes(familyDeduction);

  const netTaxable = Math.max(0, roundToMillimes(taxableGross - profExpensesDeduction - familyDeduction));

  // IRPP barème progressif annuel converti en mensuel
  const annualNet = netTaxable * 12;
  let annualIrpp = 0;
  if (annualNet > 5000) {
    const t1 = Math.min(annualNet, 20000) - 5000;
    annualIrpp += t1 * 0.26;
  }
  if (annualNet > 20000) {
    const t2 = Math.min(annualNet, 30000) - 20000;
    annualIrpp += t2 * 0.28;
  }
  if (annualNet > 30000) {
    const t3 = Math.min(annualNet, 50000) - 30000;
    annualIrpp += t3 * 0.32;
  }
  if (annualNet > 50000) {
    const t4 = annualNet - 50000;
    annualIrpp += t4 * 0.35;
  }
  const irppMonthly = roundToMillimes(annualIrpp / 12);
  const netSalary = roundToMillimes(grossSalary - cnssEmployeeAmount - irppMonthly);

  // Charges patronales
  const cnssEmployerAmount = roundToMillimes(grossSalary * 0.1657); // 16.57%
  const foprolosAmount = roundToMillimes(grossSalary * 0.01); // 1%
  const tfpRate = company.activityType === 'MANUFACTURING_FACTORY' ? 0.01 : 0.02; // 1% usine
  const tfpAmount = roundToMillimes(grossSalary * tfpRate);
  const totalEmployerCost = roundToMillimes(grossSalary + cnssEmployerAmount + foprolosAmount + tfpAmount);

  const handleSavePayslip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const newPayslip: Payslip = {
      id: `ps-${Date.now()}`,
      payrollRunId: `pr-${periodYear}-${periodMonth}`,
      employeeId: selectedEmployee.id,
      employeeName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
      companyId: company.id,
      periodMonth,
      periodYear,
      baseSalary,
      overtimeHours,
      overtimeAmount,
      bonusesTaxable,
      grossSalary,
      cnssRateEmployee: 9.18,
      cnssEmployeeAmount,
      taxableGross,
      professionalExpensesDeduction: profExpensesDeduction,
      familyDeduction,
      netTaxable,
      irppAmount: irppMonthly,
      netSalary,
      cnssEmployerAmount,
      foprolosAmount,
      tfpAmount,
      totalEmployerCost,
    };

    onAddPayslip(newPayslip);
    setShowPayslipModal(false);
    setSelectedPayslip(newPayslip);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      companyId: company.id,
      matricule: empMatricule || `EMP-${employees.length + 10}`,
      cin: empCin,
      cnssNumber: empCnss,
      firstName: empFirstName,
      lastName: empLastName,
      department: empDepartment,
      jobTitle: empJobTitle,
      contractType: 'CDI',
      maritalStatus: empMarital,
      childrenCount: empChildren,
      baseSalaryMonthly: empBaseSalary,
      hourlyRate: roundToMillimes(empBaseSalary / 160),
      isActive: true,
      hireDate: new Date().toISOString().split('T')[0],
    };
    onAddEmployee(newEmp);
    setShowEmployeeModal(false);
  };

  const postPayrollToOd = () => {
    const totalGrossAll = payslips.reduce((a, p) => a + p.grossSalary, 0);
    const totalCnssPatAll = payslips.reduce((a, p) => a + p.cnssEmployerAmount, 0);
    const totalFoprolosAll = payslips.reduce((a, p) => a + p.foprolosAmount, 0);
    const totalTfpAll = payslips.reduce((a, p) => a + p.tfpAmount, 0);

    const totalCnssDue = payslips.reduce((a, p) => a + p.cnssEmployeeAmount + p.cnssEmployerAmount, 0);
    const totalIrppDue = payslips.reduce((a, p) => a + p.irppAmount, 0);
    const totalNetDue = payslips.reduce((a, p) => a + p.netSalary, 0);
    const totalTaxesDue = totalFoprolosAll + totalTfpAll;

    const totalDebit = roundToMillimes(totalGrossAll + totalCnssPatAll + totalFoprolosAll + totalTfpAll);
    const totalCredit = roundToMillimes(totalCnssDue + totalIrppDue + totalNetDue + totalTaxesDue);

    const entry: AccountingEntry = {
      id: `ecr-paie-${Date.now()}`,
      companyId: company.id,
      sessionType: 'FINANCIERE',
      journalCode: 'OD',
      entryNumber: `OD-PAIE-${new Date().getFullYear()}-${periodMonth}`,
      entryDate: new Date().toISOString().split('T')[0],
      pieceJustificative: `ETAT-PAIE-${periodMonth}/${periodYear}`,
      libelle: `Comptabilisation Paie Mois ${periodMonth}/${periodYear} (CNSS, IRPP, FOPROLOS, TFP)`,
      lines: [
        {
          id: `l-p1`,
          accountNumber: '641000',
          accountLabel: 'Rémunérations du Personnel Ouvrier & Cadres',
          libelle: 'Salaires Bruts',
          debit: totalGrossAll,
          credit: 0,
        },
        {
          id: `l-p2`,
          accountNumber: '645100',
          accountLabel: 'Charges Sociales CNSS Patronales (16.57%)',
          libelle: 'CNSS Patronale',
          debit: totalCnssPatAll,
          credit: 0,
        },
        {
          id: `l-p3`,
          accountNumber: '642100',
          accountLabel: 'Taxes sur Salaires (FOPROLOS 1% & TFP 1%)',
          libelle: 'FOPROLOS & TFP',
          debit: totalTaxesDue,
          credit: 0,
        },
        {
          id: `l-p4`,
          accountNumber: '431000',
          accountLabel: 'CNSS à Payer (Salariale 9.18% + Patronale 16.57%)',
          libelle: 'Total Cotisations CNSS',
          debit: 0,
          credit: totalCnssDue,
        },
        {
          id: `l-p5`,
          accountNumber: '447100',
          accountLabel: 'État - Retenue à la source IRPP sur Salaires',
          libelle: 'Retenue IRPP',
          debit: 0,
          credit: totalIrppDue,
        },
        {
          id: `l-p6`,
          accountNumber: '442000',
          accountLabel: 'État - FOPROLOS & TFP à Décaisser',
          libelle: 'Taxes formation & logement',
          debit: 0,
          credit: totalTaxesDue,
        },
        {
          id: `l-p7`,
          accountNumber: '421000',
          accountLabel: 'Personnel - Rémunérations Dues (Salaires Nets)',
          libelle: 'Nets à Payer aux Salariés',
          debit: 0,
          credit: totalNetDue,
        },
      ],
      debitTotal: totalDebit,
      creditTotal: totalCredit,
      isValidated: true,
      createdBy: 'Direction RH & Paie',
      createdAt: new Date().toISOString(),
    };

    onPostPayrollToAccounting(entry);
    alert('Écriture d’Opérations Diverses de Paie générée avec succès dans le Journal SCE !');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>{isAr ? 'التصرف في الأجور والعملة (Paie Tunisienne)' : 'Gestion de la Paie & Ressources Humaines'}</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              CNSS 9.18% • IRPP • FOPROLOS • TFP
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'حساب دقيق للأجور حسب التشريع التونسي: الضمان الاجتماعي (CNSS)، الخصم من المورد (IRPP)، والأعباء المؤجرة'
              : 'Barème progressif officiel IRPP, déductions familiales, charges patronales usine et intégration comptable OD.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#050A17] p-1 rounded-lg border border-[#1B315A] flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('payslips')}
              className={`px-3 py-1.5 rounded text-xs font-semibold ${
                activeTab === 'payslips'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'بطاقات الخلاص' : 'Bulletins de Paie'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('employees')}
              className={`px-3 py-1.5 rounded text-xs font-semibold ${
                activeTab === 'employees'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'سجل العملة والعمال' : 'Registre des Salariés'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowPayslipModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold text-xs shadow hover:brightness-110 cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>{isAr ? 'إصدار بطاقة خلاص' : 'Générer un Bulletin'}</span>
          </button>

          <button
            type="button"
            onClick={postPayrollToOd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#14264C] hover:bg-[#1E3A6A] text-amber-300 font-semibold text-xs border border-amber-500/30 cursor-pointer"
            title="Générer l'écriture comptable d'OD"
          >
            <FileText className="w-4 h-4" />
            <span>Intégrer OD Paie</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0D1B36] p-4 rounded-xl border border-[#1B315A]">
          <span className="text-xs text-slate-400">Total Salaires Bruts</span>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {formatTnd(payslips.reduce((a, p) => a + p.grossSalary, 0))}
          </div>
        </div>

        <div className="bg-[#0D1B36] p-4 rounded-xl border border-[#1B315A]">
          <span className="text-xs text-slate-400">Cotisations CNSS (9.18% Salariale)</span>
          <div className="text-lg font-bold font-mono text-blue-300 mt-1">
            {formatTnd(payslips.reduce((a, p) => a + p.cnssEmployeeAmount, 0))}
          </div>
        </div>

        <div className="bg-[#0D1B36] p-4 rounded-xl border border-[#1B315A]">
          <span className="text-xs text-slate-400">Retenues IRPP État</span>
          <div className="text-lg font-bold font-mono text-amber-400 mt-1">
            {formatTnd(payslips.reduce((a, p) => a + p.irppAmount, 0))}
          </div>
        </div>

        <div className="bg-[#0D1B36] p-4 rounded-xl border border-[#1B315A]">
          <span className="text-xs text-slate-400">Coût Total Usine (Charges comprises)</span>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {formatTnd(payslips.reduce((a, p) => a + p.totalEmployerCost, 0))}
          </div>
        </div>
      </div>

      {/* Payslips Table */}
      {activeTab === 'payslips' ? (
        <div className="bg-[#0D1B36] border border-[#1B315A] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#1B315A] flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200">
              État Mensuel des Salaires et Fiches de Paie
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#070D1D] text-slate-400 border-b border-[#1B315A]">
                <tr>
                  <th className="py-3 px-4">Salarié</th>
                  <th className="py-3 px-4">Période</th>
                  <th className="py-3 px-4 text-right">Salaire Brut</th>
                  <th className="py-3 px-4 text-right">CNSS (9.18%)</th>
                  <th className="py-3 px-4 text-right">Brut Imposable</th>
                  <th className="py-3 px-4 text-right">IRPP</th>
                  <th className="py-3 px-4 text-right">Net à Payer</th>
                  <th className="py-3 px-4 text-right">Coût Usine</th>
                  <th className="py-3 px-4 text-center">Fiche de Paie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B315A]/60">
                {payslips.map((ps) => (
                  <tr key={ps.id} className="hover:bg-[#122347]/50">
                    <td className="py-3 px-4 font-semibold text-white">
                      {ps.employeeName}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {ps.periodMonth}/{ps.periodYear}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-200">
                      {formatTnd(ps.grossSalary)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-blue-300">
                      {formatTnd(ps.cnssEmployeeAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {formatTnd(ps.taxableGross)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-400">
                      {formatTnd(ps.irppAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {formatTnd(ps.netSalary)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {formatTnd(ps.totalEmployerCost)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedPayslip(ps)}
                        className="px-2.5 py-1 rounded bg-[#14264C] hover:bg-[#1E3A6A] text-amber-300 font-medium text-[11px] border border-amber-500/30 flex items-center gap-1 mx-auto"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Imprimer</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Employees List */
        <div className="bg-[#0D1B36] border border-[#1B315A] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#1B315A] flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200">
              Registre Unique du Personnel
            </h3>
            <button
              type="button"
              onClick={() => setShowEmployeeModal(true)}
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau Salarié</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#070D1D] text-slate-400 border-b border-[#1B315A]">
                <tr>
                  <th className="py-3 px-4">Matricule</th>
                  <th className="py-3 px-4">Nom & Prénom</th>
                  <th className="py-3 px-4">CIN</th>
                  <th className="py-3 px-4">N° CNSS</th>
                  <th className="py-3 px-4">Département</th>
                  <th className="py-3 px-4">Poste</th>
                  <th className="py-3 px-4">Situation</th>
                  <th className="py-3 px-4 text-right">Salaire Base HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B315A]/60">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-[#122347]/50">
                    <td className="py-3 px-4 font-mono font-bold text-amber-300">
                      {emp.matricule}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{emp.cin}</td>
                    <td className="py-3 px-4 font-mono text-blue-300">{emp.cnssNumber || '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{emp.department}</td>
                    <td className="py-3 px-4 text-slate-300">{emp.jobTitle}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {emp.maritalStatus === 'MARRIED' ? `Marié (${emp.childrenCount} enf.)` : 'Célibataire'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {formatTnd(emp.baseSalaryMonthly)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GENERATE PAYSLIP MODAL */}
      {showPayslipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#070D1D] border border-[#1B315A] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <span>Générer un Bulletin de Paie Tunisien</span>
            </h3>

            <form onSubmit={handleSavePayslip} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Salarié *</label>
                  <select
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white focus:outline-none"
                    required
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.firstName} {e.lastName} ({e.matricule})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Mois</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={periodMonth}
                    onChange={(e) => setPeriodMonth(parseInt(e.target.value, 10))}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Année</label>
                  <input
                    type="number"
                    value={periodYear}
                    onChange={(e) => setPeriodYear(parseInt(e.target.value, 10))}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white font-mono text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Heures Supplémentaires (+25%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white font-mono text-right"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Primes Imposables (TND)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={bonusesTaxable}
                    onChange={(e) => setBonusesTaxable(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white font-mono text-right"
                  />
                </div>
              </div>

              {/* Live Preview Summary */}
              <div className="bg-[#050A17] p-4 rounded-xl border border-[#1B315A] space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Salaire Brut :</span>
                  <span className="font-mono text-white font-bold">{formatTnd(grossSalary)}</span>
                </div>
                <div className="flex justify-between text-blue-300">
                  <span>Retenue CNSS (9.18%) :</span>
                  <span className="font-mono">-{formatTnd(cnssEmployeeAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Frais Professionnels (10% déduits) :</span>
                  <span className="font-mono">-{formatTnd(profExpensesDeduction)}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>Retenue IRPP :</span>
                  <span className="font-mono">-{formatTnd(irppMonthly)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold pt-2 border-t border-[#1B315A] text-sm">
                  <span>Salaire Net à Payer (TND) :</span>
                  <span className="font-mono text-base">{formatTnd(netSalary)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#1B315A]">
                <button
                  type="button"
                  onClick={() => setShowPayslipModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0D1B36] text-slate-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Enregistrer le Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE PAYSLIP SHEET MODAL */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 p-8 border border-slate-300 text-xs">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-300">
              <span className="font-bold text-sm text-slate-800">
                BULLETIN DE PAIE TUNISIEN • {selectedPayslip.periodMonth}/{selectedPayslip.periodYear}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-slate-900 text-white rounded font-semibold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPayslip(null)}
                  className="px-2 py-1 bg-slate-200 rounded font-semibold text-slate-700"
                >
                  Fermer
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
              <div>
                <p className="font-bold text-sm">{company.name}</p>
                <p className="text-slate-600">Matricule Fiscal : {company.matriculeFiscal}</p>
                <p className="text-slate-600">Régime : {company.activityType}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <p className="font-bold">{selectedPayslip.employeeName}</p>
                <p className="text-slate-600">Période : {selectedPayslip.periodMonth}/{selectedPayslip.periodYear}</p>
              </div>
            </div>

            <table className="w-full mt-4 border border-slate-300 text-left">
              <thead className="bg-slate-100 font-bold">
                <tr>
                  <th className="p-2">Rubrique</th>
                  <th className="p-2 text-right">Base</th>
                  <th className="p-2 text-right">Taux</th>
                  <th className="p-2 text-right">Gains</th>
                  <th className="p-2 text-right">Retenues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                <tr>
                  <td className="p-2">Salaire de Base</td>
                  <td className="p-2 text-right">{formatTnd(selectedPayslip.baseSalary)}</td>
                  <td className="p-2 text-right">-</td>
                  <td className="p-2 text-right">{formatTnd(selectedPayslip.baseSalary)}</td>
                  <td className="p-2 text-right">-</td>
                </tr>
                {selectedPayslip.overtimeAmount > 0 && (
                  <tr>
                    <td className="p-2">Heures Supplémentaires</td>
                    <td className="p-2 text-right">{selectedPayslip.overtimeHours} h</td>
                    <td className="p-2 text-right">125%</td>
                    <td className="p-2 text-right">{formatTnd(selectedPayslip.overtimeAmount)}</td>
                    <td className="p-2 text-right">-</td>
                  </tr>
                )}
                <tr>
                  <td className="p-2 text-blue-800">Cotisation Salariale CNSS</td>
                  <td className="p-2 text-right">{formatTnd(selectedPayslip.grossSalary)}</td>
                  <td className="p-2 text-right">9.18%</td>
                  <td className="p-2 text-right">-</td>
                  <td className="p-2 text-right text-red-600">{formatTnd(selectedPayslip.cnssEmployeeAmount)}</td>
                </tr>
                <tr>
                  <td className="p-2 text-amber-800">Retenue IRPP (Impôt)</td>
                  <td className="p-2 text-right">{formatTnd(selectedPayslip.netTaxable)}</td>
                  <td className="p-2 text-right">Barème</td>
                  <td className="p-2 text-right">-</td>
                  <td className="p-2 text-right text-red-600">{formatTnd(selectedPayslip.irppAmount)}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4 flex justify-end">
              <div className="w-64 bg-slate-100 p-3 rounded border border-slate-300 font-mono text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Total Brut :</span>
                  <span>{formatTnd(selectedPayslip.grossSalary)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Total Retenues :</span>
                  <span>-{formatTnd(selectedPayslip.cnssEmployeeAmount + selectedPayslip.irppAmount)}</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-300 text-slate-950">
                  <span>NET À PAYER :</span>
                  <span>{formatTnd(selectedPayslip.netSalary)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-500">
              SANDRA GESTION • Développé par Radhwen Ennaceur • Logiciel ERP & Comptabilité Tunisienne
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
