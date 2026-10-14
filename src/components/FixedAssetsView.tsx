import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Calendar,
  FileText,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  TrendingDown,
  Building,
} from 'lucide-react';
import { Company, FixedAsset, DepreciationScheduleItem, ErpSessionType, AccountingEntry } from '../types/erp';
import { formatTnd, roundToMillimes } from '../services/tunisianFiscal';

interface FixedAssetsViewProps {
  company: Company;
  session: ErpSessionType;
  fixedAssets: FixedAsset[];
  language: 'fr' | 'ar';
  onAddFixedAsset: (asset: FixedAsset) => void;
  onPostDepreciationToAccounting: (entry: AccountingEntry) => void;
}

export const FixedAssetsView: React.FC<FixedAssetsViewProps> = ({
  company,
  session,
  fixedAssets,
  language,
  onAddFixedAsset,
  onPostDepreciationToAccounting,
}) => {
  const isAr = language === 'ar';
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FixedAsset['category']>('INDUSTRIAL_EQUIPMENT');
  const [acquisitionCost, setAcquisitionCost] = useState(50000);
  const [additionalExpenses, setAdditionalExpenses] = useState(2500);
  const [usefulLifeYears, setUsefulLifeYears] = useState(5);
  const [commissioningDate, setCommissioningDate] = useState('2026-01-15');

  const totalGrossAssets = fixedAssets.reduce((a, x) => a + x.totalGrossValue, 0);
  const totalDepreciation = fixedAssets.reduce((a, x) => a + x.accumulatedDepreciation, 0);
  const totalNetBookValue = fixedAssets.reduce((a, x) => a + x.netBookValue, 0);

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const gross = roundToMillimes(acquisitionCost + additionalExpenses);
    const annualRate = roundToMillimes(100 / usefulLifeYears);

    const newAsset: FixedAsset = {
      id: `ast-${Date.now()}`,
      companyId: company.id,
      code: code || `IMM-${fixedAssets.length + 10}`,
      name,
      category,
      acquisitionDate: commissioningDate,
      commissioningDate,
      accountAssetCode: '223000',
      accountAmortCode: '282300',
      accountDotationCode: '681100',
      acquisitionCostHt: acquisitionCost,
      additionalExpensesHt: additionalExpenses,
      totalGrossValue: gross,
      residualValue: 0,
      depreciationMethod: 'LINEAR',
      usefulLifeYears,
      annualRate,
      accumulatedDepreciation: 0,
      netBookValue: gross,
      isRetired: false,
    };

    onAddFixedAsset(newAsset);
    setShowAddModal(false);
    setCode('');
    setName('');
  };

  const handlePostDotation = (asset: FixedAsset) => {
    const annualDotation = roundToMillimes(asset.totalGrossValue * (asset.annualRate / 100));

    const entry: AccountingEntry = {
      id: `ecr-dot-${Date.now()}`,
      companyId: company.id,
      sessionType: 'FINANCIERE',
      journalCode: 'OD',
      entryNumber: `OD-AMORT-${new Date().getFullYear()}-${asset.code}`,
      entryDate: `${new Date().getFullYear()}-12-31`,
      pieceJustificative: `TABLEAU-AMORT-${asset.code}`,
      libelle: `Dotation aux Amortissements Annuelle : ${asset.name} (Taux ${asset.annualRate}%)`,
      lines: [
        {
          id: `l-d1`,
          accountNumber: asset.accountDotationCode || '681100',
          accountLabel: 'Dotations aux Amortissements des Immobilisations',
          libelle: `Dotation ${asset.name}`,
          debit: annualDotation,
          credit: 0,
        },
        {
          id: `l-d2`,
          accountNumber: asset.accountAmortCode || '282300',
          accountLabel: 'Amortissements du Matériel Industriel',
          libelle: `Amort. cumulé ${asset.name}`,
          debit: 0,
          credit: annualDotation,
        },
      ],
      debitTotal: annualDotation,
      creditTotal: annualDotation,
      isValidated: true,
      createdBy: 'Comptable Immobilisations',
      createdAt: new Date().toISOString(),
    };

    onPostDepreciationToAccounting(entry);
    alert(`Écriture de dotation générée avec succès (Débit 681100 / Crédit 282300 : ${formatTnd(annualDotation)}) !`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>{isAr ? 'الأصول الثابتة والاهتلاكات (NCT 5)' : 'Immobilisations & Amortissements'}</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              CLASSE 2 & 681 • LINÉAIRE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'متابعة المعدات الصناعية، الآلات والقوالب، حساب أقساط الاهتلاك السنوي، وتوليد القيود المحاسبية'
              : 'Registre des immobilisations, calcul linéaire au prorata temporis, VNC et dotations aux amortissements.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold text-xs shadow hover:brightness-110 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'تسجيل أصل ثابت جديد' : 'Nouvelle Immobilisation'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0D1B36] p-4 rounded-xl border border-[#1B315A]">
          <span className="text-xs text-slate-400">Valeur Brute Totale (Classe 2)</span>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {formatTnd(totalGrossAssets)}
          </div>
        </div>

        <div className="bg-[#0D1B36] p-4 rounded-xl border border-[#1B315A]">
          <span className="text-xs text-slate-400">Amortissements Cumulés (Compte 28x)</span>
          <div className="text-lg font-bold font-mono text-amber-400 mt-1">
            {formatTnd(totalDepreciation)}
          </div>
        </div>

        <div className="bg-[#0D1B36] p-4 rounded-xl border border-[#1B315A]">
          <span className="text-xs text-slate-400">Valeur Nette Comptable Résiduelle (VNC)</span>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {formatTnd(totalNetBookValue)}
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-[#0D1B36] border border-[#1B315A] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#1B315A] flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-200">
            Fichier des Immobilisations de l'Usine
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#070D1D] text-slate-400 border-b border-[#1B315A]">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Désignation</th>
                <th className="py-3 px-4">Mise en service</th>
                <th className="py-3 px-4 text-center">Durée (Taux)</th>
                <th className="py-3 px-4 text-right">Valeur Brute HT</th>
                <th className="py-3 px-4 text-right">Amort. Cumulés</th>
                <th className="py-3 px-4 text-right">VNC Actuelle</th>
                <th className="py-3 px-4 text-center">Dotation SCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B315A]/60">
              {fixedAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-[#122347]/50">
                  <td className="py-3 px-4 font-mono font-bold text-amber-300">
                    {asset.code}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{asset.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Cpt {asset.accountAssetCode} / {asset.accountAmortCode}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-mono">
                    {asset.commissioningDate}
                  </td>
                  <td className="py-3 px-4 text-center font-mono">
                    {asset.usefulLifeYears} ans ({asset.annualRate}%)
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-white">
                    {formatTnd(asset.totalGrossValue)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-400">
                    {formatTnd(asset.accumulatedDepreciation)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    {formatTnd(asset.netBookValue)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handlePostDotation(asset)}
                      className="px-2.5 py-1 rounded bg-[#14264C] hover:bg-[#1E3A6A] text-amber-300 font-medium text-[11px] border border-amber-500/30 flex items-center gap-1 mx-auto"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Comptabiliser</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ASSET MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#070D1D] border border-[#1B315A] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="font-heading font-bold text-base text-white">
              {isAr ? 'تسجيل أصل صناعي أو معدات' : 'Acquisition d’une Nouvelle Immobilisation'}
            </h3>

            <form onSubmit={handleCreateAsset} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Code Immo *</label>
                  <input
                    type="text"
                    placeholder="IMM-PR-05"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="INDUSTRIAL_EQUIPMENT">Matériel Industriel & Outillage</option>
                    <option value="BUILDING">Bâtiments & Ateliers Usine</option>
                    <option value="VEHICLE">Matériel de Transport</option>
                    <option value="IT_EQUIPMENT">Matériel Informatique</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Désignation de l'Équipement *</label>
                <input
                  type="text"
                  placeholder="ex: Compresseur d'air 15 bars usine"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Prix d'Achat HT (TND)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={acquisitionCost}
                    onChange={(e) => setAcquisitionCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white font-mono text-right"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Frais Accessoires</label>
                  <input
                    type="number"
                    step="0.001"
                    value={additionalExpenses}
                    onChange={(e) => setAdditionalExpenses(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white font-mono text-right"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Durée (Années)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={usefulLifeYears}
                    onChange={(e) => setUsefulLifeYears(parseInt(e.target.value, 10) || 5)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white font-mono text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#1B315A]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0D1B36] text-slate-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Enregistrer l'Immobilisation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
