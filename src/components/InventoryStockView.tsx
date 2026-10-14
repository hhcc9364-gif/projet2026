import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Filter,
  Package,
} from 'lucide-react';
import { Company, Item, ErpSessionType, StockItemCategory } from '../types/erp';
import { formatTnd } from '../services/tunisianFiscal';

interface InventoryStockViewProps {
  company: Company;
  session: ErpSessionType;
  items: Item[];
  language: 'fr' | 'ar';
  onAddItem: (item: Item) => void;
}

export const InventoryStockView: React.FC<InventoryStockViewProps> = ({
  company,
  session,
  items,
  language,
  onAddItem,
}) => {
  const isAr = language === 'ar';
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [code, setCode] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [category, setCategory] = useState<Item['category']>('RAW_MATERIAL');
  const [unit, setUnit] = useState('KG');
  const [purchasePriceHt, setPurchasePriceHt] = useState(5.0);
  const [sellingPriceHt, setSellingPriceHt] = useState(6.5);
  const [stockMinimum, setStockMinimum] = useState(1000);
  const [initialStock, setInitialStock] = useState(5000);

  const filteredItems = items.filter((item) => {
    const matchesCat = filterCategory === 'ALL' || item.category === filterCategory;
    const matchesSearch =
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.nameFr.toLowerCase().includes(search.toLowerCase()) ||
      item.nameAr.includes(search);
    return matchesCat && matchesSearch;
  });

  const lowStockItems = items.filter((i) => i.stockActuel <= i.stockMinimum);
  const totalStockValue = items.reduce(
    (acc, i) => acc + i.stockActuel * i.valeurStockPmp,
    0
  );

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: Item = {
      id: `it-${Date.now()}`,
      companyId: company.id,
      code,
      nameFr,
      nameAr: nameAr || nameFr,
      category,
      unit,
      purchasePriceHt,
      sellingPriceHt,
      vatRate: 19,
      fodecApplicable: category === 'FINISHED_GOOD' && company.fodecApplicable,
      stockMinimum,
      stockActuel: initialStock,
      valeurStockPmp: purchasePriceHt,
      isActive: true,
    };
    onAddItem(newItem);
    setShowAddModal(false);
    setCode('');
    setNameFr('');
    setNameAr('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-400" />
            <span>{isAr ? 'إدارة المخزون والمواد الأولية' : 'Gestion des Stocks & Dépôts'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'تتبع المواد الأولية، المنتجات الجاهزة، التقييم بالسعر المرجح (PMP) والتنبيه بنقص المخزون'
              : 'Valorisation au Prix Moyen Pondéré (PMP), seuils de réapprovisionnement et alertes.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={isAr ? 'بحث عن مادة...' : 'Rechercher article...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0D1B36] border border-[#1B315A] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-52"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة مادة جديدة' : 'Nouvel Article'}</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0D1B36] p-4 rounded-xl border border-[#1B315A]">
          <span className="text-xs text-slate-400">
            {isAr ? 'القيمة الإجمالية للمخزون' : 'Valeur Totale du Stock (PMP)'}
          </span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {formatTnd(totalStockValue)}
          </div>
        </div>

        <div className="bg-[#0D1B36] p-4 rounded-xl border border-[#1B315A]">
          <span className="text-xs text-slate-400">
            {isAr ? 'إجمالي المواد المسجلة' : 'Références Catalogue'}
          </span>
          <div className="text-xl font-bold font-mono text-amber-300 mt-1">
            {items.length} articles
          </div>
        </div>

        <div className="bg-[#0D1B36] p-4 rounded-xl border border-[#1B315A]">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'تنبيهات نقص المخزون' : 'Articles sous seuil minimal'}</span>
          </span>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">
            {lowStockItems.length} alertes
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex gap-2">
        {['ALL', 'RAW_MATERIAL', 'FINISHED_GOOD'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterCategory === cat
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-[#0D1B36] text-slate-300 border border-[#1B315A] hover:bg-[#14264C]'
            }`}
          >
            {cat === 'ALL'
              ? isAr
                ? 'الكل'
                : 'Tous les articles'
              : cat === 'RAW_MATERIAL'
              ? isAr
                ? 'مواد أولية (MP)'
                : 'Matières Premières (MP)'
              : isAr
              ? 'منتجات جاهزة (PF)'
              : 'Produits Finis (PF)'}
          </button>
        ))}
      </div>

      {/* Items Table */}
      <div className="bg-[#0D1B36] border border-[#1B315A] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#070D1D] text-slate-400 border-b border-[#1B315A]">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Désignation</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4 text-right">Stock Actuel</th>
                <th className="py-3 px-4 text-right">Seuil Min.</th>
                <th className="py-3 px-4 text-right">P.U Achat HT</th>
                <th className="py-3 px-4 text-right">PMP</th>
                <th className="py-3 px-4 text-right">Valeur Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B315A]/60">
              {filteredItems.map((item) => {
                const isLow = item.stockActuel <= item.stockMinimum;
                const value = item.stockActuel * item.valeurStockPmp;
                return (
                  <tr key={item.id} className="hover:bg-[#122347]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-300">
                      {item.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{item.nameFr}</div>
                      <div className="text-[11px] text-slate-400 font-arabic">
                        {item.nameAr}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#14264C] text-slate-300">
                        {item.category === 'RAW_MATERIAL' ? 'Matière Première' : 'Produit Fini'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={isLow ? 'text-amber-400' : 'text-emerald-400'}>
                        {item.stockActuel.toLocaleString()} {item.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {item.stockMinimum.toLocaleString()} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {formatTnd(item.purchasePriceHt)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-300 font-semibold">
                      {formatTnd(item.valeurStockPmp)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      {formatTnd(value)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ITEM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#070D1D] border border-[#1B315A] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="font-heading font-bold text-base text-white">
              {isAr ? 'إضافة مادة أولية أو منتج جديد' : 'Créer un Nouvel Article'}
            </h3>

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Code Article *</label>
                  <input
                    type="text"
                    placeholder="ex: MP-PP-02"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Catégorie *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="RAW_MATERIAL">Matière Première (MP)</option>
                    <option value="FINISHED_GOOD">Produit Fini (PF)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Désignation Française *</label>
                <input
                  type="text"
                  placeholder="ex: Polypropylène recyclé"
                  value={nameFr}
                  onChange={(e) => setNameFr(e.target.value)}
                  className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Désignation Arabe (العربية)</label>
                <input
                  type="text"
                  placeholder="ex: بولي بروبيلين معاد تدويره"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">P.U Achat HT</label>
                  <input
                    type="number"
                    step="0.001"
                    value={purchasePriceHt}
                    onChange={(e) => setPurchasePriceHt(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white font-mono text-right"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Stock Initial</label>
                  <input
                    type="number"
                    value={initialStock}
                    onChange={(e) => setInitialStock(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white font-mono text-right"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Seuil Min.</label>
                  <input
                    type="number"
                    value={stockMinimum}
                    onChange={(e) => setStockMinimum(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white font-mono text-right"
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
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
