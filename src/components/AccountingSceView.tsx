import React, { useState } from 'react';
import {
  BookOpenCheck,
  CheckCircle2,
  Scale,
  FileSpreadsheet,
  AlertCircle,
  Search,
  Filter,
  RotateCcw,
  ShieldCheck,
  X,
  FileText,
} from 'lucide-react';
import { Company, ErpSessionType, Invoice, AccountingEntry } from '../types/erp';
import { formatTnd } from '../services/tunisianFiscal';

interface AccountingSceViewProps {
  company: Company;
  session: ErpSessionType;
  invoices: Invoice[];
  accountingEntries: AccountingEntry[];
  language: 'fr' | 'ar';
  onReverseEntry: (entryId: string, reason: string) => void;
}

interface SceAccount {
  code: string;
  classNum: number;
  labelFr: string;
  labelAr: string;
  debit: number;
  credit: number;
}

export const AccountingSceView: React.FC<AccountingSceViewProps> = ({
  company,
  session,
  invoices,
  accountingEntries,
  language,
  onReverseEntry,
}) => {
  const isAr = language === 'ar';
  const [selectedClass, setSelectedClass] = useState<number | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'chart' | 'journal' | 'balance'>('chart');
  const [reversalTarget, setReversalTarget] = useState<AccountingEntry | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  // Compute live balances from invoices for Tunisian SCE accounts
  const totalSalesHt = invoices.reduce((acc, i) => acc + i.totalHt, 0);
  const totalVatColl = invoices.reduce((acc, i) => acc + i.totalVat, 0);
  const totalTimbre = invoices.reduce((acc, i) => acc + i.timbreFiscal, 0);
  const totalClients = invoices.reduce((acc, i) => acc + i.totalTtc, 0);

  const sceAccounts: SceAccount[] = [
    // Classe 1
    {
      code: '101000',
      classNum: 1,
      labelFr: 'Capital Social Souscrit',
      labelAr: 'رأس المال الاجتماعي المكتتب',
      debit: 0,
      credit: 500000.0,
    },
    {
      code: '111000',
      classNum: 1,
      labelFr: 'Réserve Légale',
      labelAr: 'الاحتياطي القانوني',
      debit: 0,
      credit: 50000.0,
    },
    // Classe 2
    {
      code: '223000',
      classNum: 2,
      labelFr: 'Matériel Industriel et Outillage d’Usine',
      labelAr: 'المعدات الصناعية وآلات المصنع',
      debit: 320000.0,
      credit: 0,
    },
    {
      code: '282300',
      classNum: 2,
      labelFr: 'Amortissement du Matériel Industriel',
      labelAr: 'اهتلاك المعدات الصناعية',
      debit: 0,
      credit: 64000.0,
    },
    // Classe 3
    {
      code: '311000',
      classNum: 3,
      labelFr: 'Matières Premières (Polypropylène & Colorants)',
      labelAr: 'المواد الأولية البلاستيكية والملونات',
      debit: 114850.0,
      credit: 0,
    },
    {
      code: '355000',
      classNum: 3,
      labelFr: 'Produits Finis en Magasin',
      labelAr: 'المنتجات التامة الصنع بالمستودع',
      debit: 42100.0,
      credit: 0,
    },
    // Classe 4 (Tiers & État)
    {
      code: '411000',
      classNum: 4,
      labelFr: 'Clients (Créances d’exploitation)',
      labelAr: 'الحرفاء (الديون التجارية)',
      debit: totalClients,
      credit: 0,
    },
    {
      code: '445700',
      classNum: 4,
      labelFr: 'État - TVA Collectée sur Ventes (19%/7%/13%)',
      labelAr: 'الدولة - الأداء على القيمة المضافة المقبوض',
      debit: 0,
      credit: totalVatColl,
    },
    {
      code: '446000',
      classNum: 4,
      labelFr: 'État - Droits de Timbre Fiscal à Décaisser',
      labelAr: 'الدولة - معاليم الطابع الجبائي المستوجبة',
      debit: 0,
      credit: totalTimbre,
    },
    // Classe 5 (Trésorerie)
    {
      code: '512000',
      classNum: 5,
      labelFr: 'Banque BIAT - Compte Courant Dinars',
      labelAr: 'بنك تونس العربي الدولي - حساب جاري',
      debit: 84320.65,
      credit: 0,
    },
    {
      code: '531000',
      classNum: 5,
      labelFr: 'Caisse Centrale Usine (Espèces TND)',
      labelAr: 'الصندوق المركزي للمصنع بالدينار',
      debit: 4610.2,
      credit: 0,
    },
    // Classe 6 (Charges)
    {
      code: '601000',
      classNum: 6,
      labelFr: 'Achats Consommés de Matières Premières',
      labelAr: 'شراءات مستهلكة للمواد الأولية',
      debit: 78500.0,
      credit: 0,
    },
    {
      code: '641000',
      classNum: 6,
      labelFr: 'Rémunérations du Personnel Ouvrier & Cadres',
      labelAr: 'أجور ومرتبات العملة والإطارات',
      debit: 36200.0,
      credit: 0,
    },
    // Classe 7 (Produits)
    {
      code: '701000',
      classNum: 7,
      labelFr: 'Ventes de Produits Finis Industriels',
      labelAr: 'مبيعات المنتجات الصناعية الجاهزة',
      debit: 0,
      credit: totalSalesHt,
    },
  ];

  const filteredAccounts =
    selectedClass === 'ALL'
      ? sceAccounts
      : sceAccounts.filter((a) => a.classNum === selectedClass);

  const totalDebit = sceAccounts.reduce((acc, a) => acc + a.debit, 0);
  const totalCredit = sceAccounts.reduce((acc, a) => acc + a.credit, 0);

  const handleConfirmReversal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reversalTarget || !reversalReason.trim()) return;
    onReverseEntry(reversalTarget.id, reversalReason.trim());
    setReversalTarget(null);
    setReversalReason('');
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
              <BookOpenCheck className="w-5 h-5 text-amber-400" />
              <span>{isAr ? 'النظام المحاسبي للمؤسسات التونسية (SCE)' : 'Comptabilité Générale SCE (Loi 96-112)'}</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
              SESSION FINANCIÈRE LÉGALE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'مخطط الحسابات العام التونسي، ميزان المراجعة، يومية القيود مع إمكانية القيد العكسي (Contre-passation)'
              : 'Conformité NCT 1996 : Plan des 7 Classes, Grand-Livre, journal et contre-passation inaltérable.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#050A17] p-1 rounded-lg border border-[#1B315A] flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('chart')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === 'chart'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'مخطط الحسابات' : 'Plan Comptable (1-7)'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('journal')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === 'journal'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'دفتر اليومية (Journal)' : 'Journal des Écritures'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('balance')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === 'balance'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'ميزان المراجعة' : 'Balance Générale'}
          </button>
        </div>
      </div>

      {/* Tab: Chart of Accounts */}
      {activeTab === 'chart' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 bg-[#0D1B36] p-2 rounded-xl border border-[#1B315A]">
            <span className="text-xs text-slate-400 font-semibold px-2">
              Classes SCE :
            </span>
            <button
              type="button"
              onClick={() => setSelectedClass('ALL')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                selectedClass === 'ALL'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:bg-[#14264C]'
              }`}
            >
              Toutes (1 à 7)
            </button>
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSelectedClass(num)}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  selectedClass === num
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-[#14264C]'
                }`}
              >
                Cl. {num}
              </button>
            ))}
          </div>

          <div className="bg-[#0D1B36] border border-[#1B315A] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#070D1D] text-slate-400 border-b border-[#1B315A]">
                <tr>
                  <th className="py-3 px-4">N° Compte</th>
                  <th className="py-3 px-4">Classe</th>
                  <th className="py-3 px-4">Intitulé Officiel SCE</th>
                  <th className="py-3 px-4 text-right">Total Débit (TND)</th>
                  <th className="py-3 px-4 text-right">Total Crédit (TND)</th>
                  <th className="py-3 px-4 text-right">Solde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B315A]/60">
                {filteredAccounts.map((acc) => {
                  const solde = acc.debit - acc.credit;
                  return (
                    <tr key={acc.code} className="hover:bg-[#122347]/50">
                      <td className="py-3 px-4 font-mono font-bold text-amber-300">
                        {acc.code}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#14264C] text-slate-300">
                          Classe {acc.classNum}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{acc.labelFr}</div>
                        <div className="text-[11px] text-amber-300/80 font-arabic">
                          {acc.labelAr}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-200">
                        {acc.debit > 0 ? formatTnd(acc.debit) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-200">
                        {acc.credit > 0 ? formatTnd(acc.credit) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span className={solde >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {formatTnd(solde)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Real Journal Entries with Reversal Controls */}
      {activeTab === 'journal' && (
        <div className="space-y-4">
          <div className="bg-[#0D1B36] border border-[#1B315A] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#1B315A] flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200">
                Livre Journal Général des Écritures
              </h3>
              <span className="text-xs font-mono text-emerald-400">
                {accountingEntries.length} écritures validées
              </span>
            </div>

            <div className="divide-y divide-[#1B315A]">
              {accountingEntries.map((entry) => (
                <div key={entry.id} className="p-4 space-y-3 bg-[#0D1B36]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {entry.journalCode}
                      </span>
                      <span className="font-mono font-bold text-xs text-amber-300">
                        {entry.entryNumber}
                      </span>
                      <span className="text-slate-400 text-xs font-mono">
                        ({entry.entryDate})
                      </span>
                      <span className="text-white font-semibold text-xs ml-2">
                        {entry.libelle}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {entry.isReversed ? (
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold">
                          ANNULÉE / CONTRE-PASSÉE
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReversalTarget(entry)}
                          className="px-2.5 py-1 rounded bg-[#14264C] hover:bg-[#1E3A6A] text-amber-300 text-[11px] font-medium border border-amber-500/30 flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Contre-passer</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lines */}
                  <table className="w-full text-[11px] text-left border border-[#1B315A]/60 rounded overflow-hidden">
                    <thead className="bg-[#070D1D] text-slate-400">
                      <tr>
                        <th className="py-1.5 px-3">Compte</th>
                        <th className="py-1.5 px-3">Intitulé</th>
                        <th className="py-1.5 px-3 text-right">Débit (TND)</th>
                        <th className="py-1.5 px-3 text-right">Crédit (TND)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1B315A]/40 font-mono">
                      {entry.lines.map((line, idx) => (
                        <tr key={idx} className="hover:bg-[#122347]/30">
                          <td className="py-1.5 px-3 text-amber-300 font-bold">
                            {line.accountNumber}
                          </td>
                          <td className="py-1.5 px-3 text-slate-200">
                            {line.accountLabel}
                          </td>
                          <td className="py-1.5 px-3 text-right text-emerald-300">
                            {line.debit > 0 ? formatTnd(line.debit) : '-'}
                          </td>
                          <td className="py-1.5 px-3 text-right text-blue-300">
                            {line.credit > 0 ? formatTnd(line.credit) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Balance Générale */}
      {activeTab === 'balance' && (
        <div className="bg-[#0D1B36] border border-[#1B315A] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#1B315A] text-xs font-bold text-slate-200">
            Balance Générale des Comptes (Vérification Équilibre Débit / Crédit)
          </div>
          <table className="w-full text-xs text-left">
            <thead className="bg-[#070D1D] text-slate-400 border-b border-[#1B315A]">
              <tr>
                <th className="py-3 px-4">Compte</th>
                <th className="py-3 px-4">Libellé</th>
                <th className="py-3 px-4 text-right">Débit</th>
                <th className="py-3 px-4 text-right">Crédit</th>
                <th className="py-3 px-4 text-right">Solde Débiteur</th>
                <th className="py-3 px-4 text-right">Solde Créditeur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B315A]/60 font-mono">
              {sceAccounts.map((a) => {
                const solde = a.debit - a.credit;
                return (
                  <tr key={a.code} className="hover:bg-[#122347]/50">
                    <td className="py-2.5 px-4 font-bold text-amber-300">{a.code}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-200">{a.labelFr}</td>
                    <td className="py-2.5 px-4 text-right">{a.debit > 0 ? formatTnd(a.debit) : '-'}</td>
                    <td className="py-2.5 px-4 text-right">{a.credit > 0 ? formatTnd(a.credit) : '-'}</td>
                    <td className="py-2.5 px-4 text-right text-emerald-400">
                      {solde > 0 ? formatTnd(solde) : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right text-blue-400">
                      {solde < 0 ? formatTnd(-solde) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* REVERSAL MODAL (Contre-passation contrôlée) */}
      {reversalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#070D1D] border border-[#1B315A] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              <span>Contre-passer l'Écriture {reversalTarget.entryNumber}</span>
            </h3>

            <p className="text-xs text-slate-300">
              Conformément à la règle d'immutabilité comptable SCE, l'écriture originale ne sera pas supprimée. Une écriture miroir inverse (Débit &harr; Crédit) sera insérée avec traçabilité complète.
            </p>

            <form onSubmit={handleConfirmReversal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Motif de la contre-passation (Obligatoire) *
                </label>
                <textarea
                  rows={3}
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder="ex: Erreur d'affectation compte tiers exercice 2026..."
                  className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg p-2.5 text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#1B315A]">
                <button
                  type="button"
                  onClick={() => setReversalTarget(null)}
                  className="px-4 py-2 rounded-lg bg-[#0D1B36] text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Confirmer la Contre-passation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
