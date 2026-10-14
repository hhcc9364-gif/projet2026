import React from 'react';
import {
  TrendingUp,
  Receipt,
  Factory,
  Boxes,
  Landmark,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Scale,
  Sparkles,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import {
  Company,
  ErpSessionType,
  Invoice,
  ProductionOrder,
  Item,
  TreasuryAccount,
} from '../types/erp';
import { formatTnd } from '../services/tunisianFiscal';

interface DashboardViewProps {
  company: Company;
  session: ErpSessionType;
  invoices: Invoice[];
  productionOrders: ProductionOrder[];
  items: Item[];
  treasury: TreasuryAccount[];
  language: 'fr' | 'ar';
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  company,
  session,
  invoices,
  productionOrders,
  items,
  treasury,
  language,
  onNavigateTab,
}) => {
  const isAr = language === 'ar';
  const isReelle = session === 'REELLE';

  // Compute metrics
  const totalRevenueHt = invoices
    .filter((i) => i.direction === 'SALE' && i.status !== 'CANCELLED')
    .reduce((acc, curr) => acc + curr.totalHt, 0);

  const totalVat = invoices
    .filter((i) => i.direction === 'SALE' && i.status !== 'CANCELLED')
    .reduce((acc, curr) => acc + curr.totalVat, 0);

  const totalTimbre = invoices
    .filter((i) => i.direction === 'SALE' && i.status !== 'CANCELLED')
    .reduce((acc, curr) => acc + curr.timbreFiscal, 0);

  const totalStockValue = items.reduce(
    (acc, item) => acc + item.stockActuel * item.valeurStockPmp,
    0
  );

  const totalTreasury = treasury.reduce(
    (acc, accnt) => acc + accnt.currentBalance,
    0
  );

  const rawMaterials = items.filter((i) => i.category === 'RAW_MATERIAL');
  const finishedGoods = items.filter((i) => i.category === 'FINISHED_GOOD');

  const totalUnitsProduced = productionOrders.reduce(
    (acc, curr) => acc + curr.quantityProduced,
    0
  );
  const totalUnitsScrap = productionOrders.reduce(
    (acc, curr) => acc + curr.quantityScrap,
    0
  );
  const scrapRate =
    totalUnitsProduced + totalUnitsScrap > 0
      ? (totalUnitsScrap / (totalUnitsProduced + totalUnitsScrap)) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Session Context Banner */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          isReelle
            ? 'bg-gradient-to-r from-emerald-950/80 via-[#0B2419] to-emerald-950/40 border-emerald-500/30 text-emerald-100'
            : 'bg-gradient-to-r from-blue-950/80 via-[#0D1D3E] to-blue-950/40 border-blue-500/30 text-blue-100'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg ${
                isReelle
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
              }`}
            >
              {isReelle ? <Factory className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm tracking-wide uppercase">
                  {isReelle
                    ? isAr
                      ? 'الجلسة الفعلية النشطة (المصنع، التكاليف الحقيقية والإنتاج)'
                      : 'Session Réelle Active (Gestion Industrielle & Coûts de Revient)'
                    : isAr
                    ? 'الجلسة المالية النشطة (المحاسبة القانونية SCE والجبايات)'
                    : 'Session Financière Active (Cadre Légal SCE & Fiscalité Tunisienne)'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-black/40 border border-white/10 font-bold">
                  {company.matriculeFiscal}
                </span>
              </div>
              <p className="text-xs text-slate-300/90 mt-0.5">
                {isReelle
                  ? 'Calcul précis du coût de revient réel, consommation matière, rebuts d’usine et rentabilité brute.'
                  : 'Conforme à la loi SCE 96-112 : TVA (19%, 7%, 13%), Droit de Timbre (1,000 DT), Retenue à la source.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-black/50 border border-amber-500/30 text-amber-300">
              {isAr ? 'العملة : الدينار التونسي (3 مليمات)' : 'Devise : Dinar Tunisien (TND)'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Chiffre d'Affaires */}
        <div className="bg-[#0D1B36] border border-[#1B315A] rounded-xl p-4 shadow-sm hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">
              {isAr ? 'رقم المعاملات الصافي الخاضع للأداء' : "Chiffre d'Affaires HT"}
            </span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-heading text-xl font-bold text-amber-300">
            {formatTnd(totalRevenueHt)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>{isAr ? 'الفواتير المصادق عليها' : 'Ventes validées'}</span>
            <span className="text-emerald-400 font-semibold font-mono">
              {invoices.filter((i) => i.direction === 'SALE').length} factures
            </span>
          </div>
        </div>

        {/* KPI 2: TVA & Timbre Fiscal */}
        <div className="bg-[#0D1B36] border border-[#1B315A] rounded-xl p-4 shadow-sm hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">
              {isAr ? 'الأداء على القيمة المضافة والطابع الجبائي' : 'TVA Collectée & Timbre'}
            </span>
            <Receipt className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-heading text-xl font-bold text-blue-300">
            {formatTnd(totalVat)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>{isAr ? 'طابع جبائي مستوجب' : 'Droit de timbre (1 DT)'}</span>
            <span className="text-amber-300 font-mono font-semibold">
              {formatTnd(totalTimbre)}
            </span>
          </div>
        </div>

        {/* KPI 3: Stock PMP */}
        <div className="bg-[#0D1B36] border border-[#1B315A] rounded-xl p-4 shadow-sm hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">
              {isAr ? 'القيمة الإجمالية للمخزون (PMP)' : 'Valeur Stock Réel (PMP)'}
            </span>
            <Boxes className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-heading text-xl font-bold text-emerald-300">
            {formatTnd(totalStockValue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>
              {rawMaterials.length} MP • {finishedGoods.length} PF
            </span>
            <span className="text-emerald-400 font-mono font-semibold">
              {items.reduce((acc, i) => acc + i.stockActuel, 0).toLocaleString()} unités
            </span>
          </div>
        </div>

        {/* KPI 4: Trésorerie Disponible */}
        <div className="bg-[#0D1B36] border border-[#1B315A] rounded-xl p-4 shadow-sm hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">
              {isAr ? 'السيولة المتاحة (بنوك وخزينة)' : 'Trésorerie Disponible'}
            </span>
            <Landmark className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-heading text-xl font-bold text-amber-200">
            {formatTnd(totalTreasury)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>{treasury.length} comptes actifs</span>
            <span className="text-slate-300 font-mono">BIAT + Caisse</span>
          </div>
        </div>
      </div>

      {/* Production & Workshop Special Panel (Crucial for Factory Session Réelle) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Manufacturing Performance & Scrap Rate */}
        <div className="lg:col-span-1 bg-[#0D1B36] border border-[#1B315A] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Factory className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'مؤشرات أداء المصنع' : "Performance de l'Usine"}</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
              SESSION RÉELLE
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">
                  {isAr ? 'إجمالي القطع المصنوعة' : 'Unités fabriquées conformes'}
                </span>
                <span className="font-mono font-bold text-white">
                  {totalUnitsProduced.toLocaleString()} U
                </span>
              </div>
              <div className="w-full bg-[#050A17] rounded-full h-2 overflow-hidden border border-[#1B315A]">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (totalUnitsProduced / 25000) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <span>{isAr ? 'نسبة النفايات والتلف' : 'Taux de rebuts / Pertes atelier'}</span>
                  {scrapRate > 3 && (
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                  )}
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {scrapRate.toFixed(2)}% ({totalUnitsScrap} U)
                </span>
              </div>
              <div className="w-full bg-[#050A17] rounded-full h-2 overflow-hidden border border-[#1B315A]">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, scrapRate * 10)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#070D1D] rounded-lg border border-[#1B315A] text-xs space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>{isAr ? 'قانون الفوديك (FODEC 1%)' : 'Régime FODEC Usine'} :</span>
              <span className="font-semibold text-emerald-400">
                {company.fodecApplicable ? 'Applicable (1%)' : 'Non applicable'}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>{isAr ? 'طريقة حساب تكلفة الصنع' : 'Méthode Coût de Revient'} :</span>
              <span className="font-mono text-amber-300">Matières + MO + Machine</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('manufacturing')}
            className="w-full py-2 px-3 rounded-lg bg-[#14264C] hover:bg-[#1C356A] text-xs font-semibold text-amber-300 border border-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{isAr ? 'فتح ورشة التصنيع والـ BOM' : 'Gérer les Ordres de Fabrication (OF)'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Recent Invoices & Fiscal Operations */}
        <div className="lg:col-span-2 bg-[#0D1B36] border border-[#1B315A] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-400" />
              <span>{isAr ? 'آخر الفواتير الصادرة والعمليات الجبائية' : 'Facturation Récente & Fiscalité Tunisienne'}</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('invoices')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>{isAr ? 'عرض كل الفواتير' : 'Voir tout'}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#070D1D] text-slate-400 border-b border-[#1B315A]">
                <tr>
                  <th className="py-2.5 px-3">{isAr ? 'رقم الفاتورة' : 'N° Facture'}</th>
                  <th className="py-2.5 px-3">{isAr ? 'الحريف' : 'Client'}</th>
                  <th className="py-2.5 px-3">{isAr ? 'المبلغ الخام' : 'Total HT'}</th>
                  <th className="py-2.5 px-3">{isAr ? 'الأداء 19%' : 'TVA'}</th>
                  <th className="py-2.5 px-3">{isAr ? 'طابع' : 'Timbre'}</th>
                  <th className="py-2.5 px-3">{isAr ? 'الصافي للدفع' : 'Net à Payer'}</th>
                  <th className="py-2.5 px-3">{isAr ? 'الحالة' : 'Statut'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B315A]/60">
                {invoices.slice(0, 4).map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#122347]/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-300">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-200 truncate max-w-[150px]">
                      {inv.thirdPartyName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">
                      {formatTnd(inv.totalHt)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-blue-300">
                      {formatTnd(inv.totalVat)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-amber-400/90">
                      {formatTnd(inv.timbreFiscal)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                      {formatTnd(inv.netToPay)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1B315A]/80 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'قاعدة بيانات محلية مؤمنة' : 'Stockage local-first & sauvegarde chiffrée'}</span>
            </span>
            <span className="font-mono text-amber-300/80">
              SANDRA GESTION V1.0 • Radhwen Ennaceur
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
