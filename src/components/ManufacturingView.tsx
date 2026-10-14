import React, { useState } from 'react';
import {
  Factory,
  Layers,
  Plus,
  Play,
  CheckCircle,
  AlertOctagon,
  Clock,
  Sparkles,
  Search,
  Boxes,
  ArrowRight,
} from 'lucide-react';
import {
  Company,
  ProductionOrder,
  BillOfMaterials,
  Item,
  ErpSessionType,
} from '../types/erp';
import { formatTnd, roundToMillimes } from '../services/tunisianFiscal';

interface ManufacturingViewProps {
  company: Company;
  session: ErpSessionType;
  productionOrders: ProductionOrder[];
  boms: BillOfMaterials[];
  items: Item[];
  language: 'fr' | 'ar';
  onAddProductionOrder: (order: ProductionOrder) => void;
}

export const ManufacturingView: React.FC<ManufacturingViewProps> = ({
  company,
  session,
  productionOrders,
  boms,
  items,
  language,
  onAddProductionOrder,
}) => {
  const isAr = language === 'ar';
  const finishedGoods = items.filter((i) => i.category === 'FINISHED_GOOD');
  const rawMaterials = items.filter((i) => i.category === 'RAW_MATERIAL');

  const [activeTab, setActiveTab] = useState<'orders' | 'boms'>('orders');
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Form State
  const [selectedBomId, setSelectedBomId] = useState(boms[0]?.id || '');
  const [quantityPlanned, setQuantityPlanned] = useState(10000);
  const [supervisorName, setSupervisorName] = useState('Khaled Karray');
  const [notes, setNotes] = useState('Production Lot usine standard');

  const selectedBom = boms.find((b) => b.id === selectedBomId);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBom) return;

    const orderNumber = `OF-${new Date().getFullYear()}-${String(
      productionOrders.length + 101
    ).padStart(3, '0')}`;

    // Calculate estimated real cost from BOM
    const rawMaterialsCost = selectedBom.components.reduce((acc, c) => {
      const requiredQty = (c.quantity / selectedBom.standardQuantity) * quantityPlanned;
      return acc + requiredQty * c.unitCost;
    }, 0);

    const laborCost =
      (selectedBom.laborStandardHours / selectedBom.standardQuantity) *
      quantityPlanned *
      12.0; // 12 DT/h ouvrier d'usine
    const machineCost =
      (selectedBom.machineStandardHours / selectedBom.standardQuantity) *
      quantityPlanned *
      15.0; // 15 DT/h presse

    const totalRealCost = roundToMillimes(rawMaterialsCost + laborCost + machineCost);
    const unitRealCost = roundToMillimes(totalRealCost / quantityPlanned);

    const newOrder: ProductionOrder = {
      id: `of-${Date.now()}`,
      companyId: company.id,
      sessionType: 'REELLE', // Strict Session Réelle
      orderNumber,
      bomId: selectedBom.id,
      finishedGoodId: selectedBom.finishedGoodId,
      finishedGoodName: selectedBom.finishedGoodName,
      quantityPlanned,
      quantityProduced: 0,
      quantityScrap: 0,
      status: 'IN_PROGRESS',
      dateStart: new Date().toISOString(),
      costRawMaterials: rawMaterialsCost,
      costLabor: laborCost,
      costMachineOverhead: machineCost,
      costTotalReal: totalRealCost,
      unitCostReal: unitRealCost,
      supervisorName,
      notes,
      createdAt: new Date().toISOString(),
    };

    onAddProductionOrder(newOrder);
    setShowOrderModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Session Tag */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
              <Factory className="w-5 h-5 text-emerald-400" />
              <span>{isAr ? 'إدارة الإنتاج، الورشة وتكاليف الصنع' : 'Gestion Industrielle & Atelier de Production'}</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              SESSION RÉELLE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'متابعة تصنيع المنتجات، كميات المواد المستهلكة، حساب نسبة الهدر، وتحديد تكلفة الصنع الفعلية للقطعة'
              : 'Nomenclature (BOM), suivi des ordres de fabrication (OF), consommation matière et marge brute industrielle.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#050A17] p-1 rounded-lg border border-[#1B315A]">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'أوامر التصنيع (OF)' : 'Ordres de Fabrication'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('boms')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                activeTab === 'boms'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'مخطط الصنع (BOM)' : 'Nomenclatures (BOM)'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowOrderModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-xs shadow hover:brightness-110 transition-all border border-emerald-400/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'أمر تصنيع جديد' : 'Lancer un Ordre de Fabrication'}</span>
          </button>
        </div>
      </div>

      {/* Production Orders List */}
      {activeTab === 'orders' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0D1B36] p-4 rounded-xl border border-[#1B315A]">
              <span className="text-xs text-slate-400">
                {isAr ? 'أوامر التصنيع الجارية' : 'Ordres en cours d’exécution'}
              </span>
              <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
                {productionOrders.filter((o) => o.status === 'IN_PROGRESS').length} OF
              </div>
            </div>

            <div className="bg-[#0D1B36] p-4 rounded-xl border border-[#1B315A]">
              <span className="text-xs text-slate-400">
                {isAr ? 'الكمية الإجمالية المخططة' : 'Volume planifié mensuel'}
              </span>
              <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                {productionOrders
                  .reduce((acc, o) => acc + o.quantityPlanned, 0)
                  .toLocaleString()}{' '}
                U
              </div>
            </div>

            <div className="bg-[#0D1B36] p-4 rounded-xl border border-[#1B315A]">
              <span className="text-xs text-slate-400">
                {isAr ? 'إجمالي تكلفة الصنع الحقيقية' : 'Coût réel cumulé atelier'}
              </span>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {formatTnd(
                  productionOrders.reduce((acc, o) => acc + o.costTotalReal, 0)
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#0D1B36] border border-[#1B315A] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#1B315A] flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200">
                {isAr ? 'سجل أوامر التصنيع' : 'Suivi des Ordres de Fabrication Usine'}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#070D1D] text-slate-400 border-b border-[#1B315A]">
                  <tr>
                    <th className="py-3 px-4">N° OF</th>
                    <th className="py-3 px-4">Produit Fini</th>
                    <th className="py-3 px-4 text-right">Qté Planifiée</th>
                    <th className="py-3 px-4 text-right">Qté Produite</th>
                    <th className="py-3 px-4 text-right">Rebuts</th>
                    <th className="py-3 px-4 text-right">Coût Réel Total</th>
                    <th className="py-3 px-4 text-right">Coût Unitaire</th>
                    <th className="py-3 px-4">Responsable</th>
                    <th className="py-3 px-4 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B315A]/60">
                  {productionOrders.map((order) => {
                    const progress =
                      order.quantityPlanned > 0
                        ? Math.min(
                            100,
                            (order.quantityProduced / order.quantityPlanned) * 100
                          )
                        : 0;

                    return (
                      <tr key={order.id} className="hover:bg-[#122347]/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">
                            {order.finishedGoodName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {order.notes}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                          {order.quantityPlanned.toLocaleString()} U
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-300">
                          {order.quantityProduced.toLocaleString()} U
                          <div className="text-[10px] text-slate-400">
                            {progress.toFixed(0)}%
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-amber-400">
                          {order.quantityScrap} U
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-200">
                          {formatTnd(order.costTotalReal)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-amber-300">
                          {formatTnd(order.unitCostReal)}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {order.supervisorName}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              order.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Bill of Materials (Nomenclatures) View */
        <div className="space-y-4">
          {boms.map((bom) => (
            <div
              key={bom.id}
              className="bg-[#0D1B36] border border-[#1B315A] rounded-xl p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1B315A] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {bom.code}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300">
                      Version {bom.version}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white mt-1">
                    {bom.finishedGoodName}
                  </h3>
                </div>

                <div className="text-right text-xs">
                  <div className="text-slate-400">Base standard :</div>
                  <div className="font-mono font-bold text-emerald-400">
                    {bom.standardQuantity.toLocaleString()} unités
                  </div>
                </div>
              </div>

              {/* Components */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  {isAr ? 'المواد الأولية المستوجبة' : 'Matières Premières Requises (BOM)'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {bom.components.map((comp) => (
                    <div
                      key={comp.id}
                      className="bg-[#070D1D] p-3 rounded-lg border border-[#1B315A] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">
                          {comp.rawMaterialName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Perte machine autorisée : {comp.lossPercentage}%
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-amber-300 font-bold">
                          {comp.quantity} KG
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Coût: {formatTnd(comp.unitCost)}/KG
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PRODUCTION ORDER MODAL */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#070D1D] border border-[#1B315A] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#1B315A] pb-3">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Factory className="w-5 h-5 text-emerald-400" />
                <span>{isAr ? 'إطلاق أمر تصنيع جديد' : 'Lancer un Ordre de Fabrication'}</span>
              </h3>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {isAr ? 'مخطط الصنع (Nomenclature BOM)' : 'Nomenclature (BOM)'} *
                </label>
                <select
                  value={selectedBomId}
                  onChange={(e) => setSelectedBomId(e.target.value)}
                  className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white focus:outline-none"
                  required
                >
                  {boms.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.finishedGoodName} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {isAr ? 'الكمية المراد إنتاجها (بالقطعة)' : 'Quantité à Fabriquer (Unités)'} *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantityPlanned}
                  onChange={(e) => setQuantityPlanned(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white font-mono text-right focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {isAr ? 'مسؤول الورشة' : "Chef d'atelier / Superviseur"}
                </label>
                <input
                  type="text"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {isAr ? 'ملاحظات الدفعة' : 'Observations de fabrication'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#1B315A]">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0D1B36] text-slate-300 font-semibold"
                >
                  {isAr ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow"
                >
                  {isAr ? 'تأكيد وإطلاق في الورشة' : 'Confirmer le Lancement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
