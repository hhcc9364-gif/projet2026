import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Printer,
  Download,
  CheckCircle,
  FileText,
  Search,
  Building,
  Calendar,
  Trash2,
  X,
} from 'lucide-react';
import {
  Company,
  Invoice,
  InvoiceLine,
  ThirdParty,
  Item,
  VatRate,
  ErpSessionType,
} from '../types/erp';
import {
  formatTnd,
  calculateInvoiceFinancials,
  LEGAL_TIMBRE_FISCAL,
} from '../services/tunisianFiscal';

interface SalesInvoicingViewProps {
  company: Company;
  session: ErpSessionType;
  invoices: Invoice[];
  thirdParties: ThirdParty[];
  items: Item[];
  language: 'fr' | 'ar';
  onAddInvoice: (invoice: Invoice) => void;
}

export const SalesInvoicingView: React.FC<SalesInvoicingViewProps> = ({
  company,
  session,
  invoices,
  thirdParties,
  items,
  language,
  onAddInvoice,
}) => {
  const isAr = language === 'ar';
  const clients = thirdParties.filter((t) => t.type === 'CLIENT');

  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Invoice Form State
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [formLines, setFormLines] = useState<
    Array<{
      itemId: string;
      description: string;
      quantity: number;
      unitPriceHt: number;
      discountPct: number;
      vatRate: VatRate;
    }>
  >([
    {
      itemId: items[0]?.id || '',
      description: items[0]?.nameFr || 'Article industriel',
      quantity: 100,
      unitPriceHt: items[0]?.sellingPriceHt || 1.5,
      discountPct: 0,
      vatRate: (items[0]?.vatRate as VatRate) || 19,
    },
  ]);
  const [applyTimbre, setApplyTimbre] = useState(true);
  const [applyRetenue, setApplyRetenue] = useState(true);

  const selectedClient = thirdParties.find((t) => t.id === selectedClientId);
  const retenueRate = applyRetenue ? selectedClient?.retenueSourceRate || 1.5 : 0;

  // Live calculations
  const previewCalculation = calculateInvoiceFinancials(
    formLines,
    company.fodecApplicable,
    retenueRate,
    applyTimbre
  );

  const handleAddLine = () => {
    setFormLines([
      ...formLines,
      {
        itemId: items[0]?.id || '',
        description: items[0]?.nameFr || 'Nouvel article',
        quantity: 1,
        unitPriceHt: items[0]?.sellingPriceHt || 0,
        discountPct: 0,
        vatRate: 19,
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    if (formLines.length === 1) return;
    setFormLines(formLines.filter((_, i) => i !== idx));
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(
      invoices.length + 101
    ).padStart(4, '0')}`;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      companyId: company.id,
      sessionType: session,
      direction: 'SALE',
      invoiceNumber,
      invoiceDate,
      dueDate,
      thirdPartyId: selectedClient.id,
      thirdPartyName: selectedClient.name,
      thirdPartyMatricule: selectedClient.matriculeFiscal,
      lines: previewCalculation.updatedLines.map((l, idx) => ({
        ...l,
        id: `line-${Date.now()}-${idx}`,
      })),
      totalHt: previewCalculation.totalHt,
      totalFodec: previewCalculation.totalFodec,
      totalVat19: previewCalculation.totalVat19,
      totalVat7: previewCalculation.totalVat7,
      totalVat13: previewCalculation.totalVat13,
      totalVat: previewCalculation.totalVat,
      timbreFiscal: previewCalculation.timbreFiscal,
      totalTtc: previewCalculation.totalTtc,
      retenueSourceRate: retenueRate,
      retenueSourceAmount: previewCalculation.retenueSourceAmount,
      netToPay: previewCalculation.netToPay,
      amountPaid: 0,
      status: 'VALIDATED',
      createdBy: 'Direction Commerciale',
      createdAt: new Date().toISOString(),
    };

    onAddInvoice(newInvoice);
    setShowCreateModal(false);
    setSelectedInvoice(newInvoice);
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.thirdPartyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <span>{isAr ? 'إدارة الفواتير والمبيعات' : 'Facturation Commerciale & Fiscale'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'تطبيق القوانين الجبائية التونسية: أداء 19%، 7%، 13%، طابع جبائي 1.000 د.ت، واقتطاع من المورد'
              : 'Conforme au droit fiscal tunisien : Timbre 1.000 TND, FODEC usine 1%, TVA 19%/7%/13%, et Retenue à la source.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={isAr ? 'بحث عن فاتورة أو حريف...' : 'Rechercher facture, client...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0D1B36] border border-[#1B315A] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-56"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow hover:brightness-110 transition-all border border-amber-300/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'فاتورة تونسية جديدة' : 'Nouvelle Facture Tunisienne'}</span>
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-[#0D1B36] border border-[#1B315A] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#070D1D] text-slate-400 border-b border-[#1B315A]">
              <tr>
                <th className="py-3 px-4">{isAr ? 'رقم الفاتورة' : 'N° Facture'}</th>
                <th className="py-3 px-4">{isAr ? 'التاريخ' : 'Date'}</th>
                <th className="py-3 px-4">{isAr ? 'الحريف' : 'Client & Matricule'}</th>
                <th className="py-3 px-4 text-right">{isAr ? 'المبلغ الخام' : 'Total HT'}</th>
                {company.fodecApplicable && (
                  <th className="py-3 px-4 text-right">FODEC (1%)</th>
                )}
                <th className="py-3 px-4 text-right">{isAr ? 'الأداء' : 'TVA'}</th>
                <th className="py-3 px-4 text-right">{isAr ? 'طابع' : 'Timbre'}</th>
                <th className="py-3 px-4 text-right">{isAr ? 'الإجمالي' : 'Total TTC'}</th>
                <th className="py-3 px-4 text-right">{isAr ? 'الصافي للدفع' : 'Net à Payer'}</th>
                <th className="py-3 px-4 text-center">{isAr ? 'معاينة وطباعة' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B315A]/60">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#122347]/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-amber-300">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{inv.invoiceDate}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{inv.thirdPartyName}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {inv.thirdPartyMatricule || 'Matricule non spécifié'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {formatTnd(inv.totalHt)}
                  </td>
                  {company.fodecApplicable && (
                    <td className="py-3 px-4 text-right font-mono text-amber-400/90">
                      {formatTnd(inv.totalFodec)}
                    </td>
                  )}
                  <td className="py-3 px-4 text-right font-mono text-blue-300">
                    {formatTnd(inv.totalVat)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-300">
                    {formatTnd(inv.timbreFiscal)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-200">
                    {formatTnd(inv.totalTtc)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    {formatTnd(inv.netToPay)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-2.5 py-1 rounded bg-[#14264C] hover:bg-[#1E3A6A] text-amber-300 text-[11px] font-medium border border-amber-500/30 transition-all flex items-center gap-1 mx-auto cursor-pointer"
                    >
                      <Printer className="w-3 h-3" />
                      <span>{isAr ? 'طباعة' : 'Imprimer'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#070D1D] border border-[#1B315A] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
            <div className="bg-[#0D1B36] p-4 border-b border-[#1B315A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-bold text-base text-white">
                  {isAr ? 'إنشاء فاتورة بيع تونسية قانونية' : 'Créer une Facture Commerciale Tunisienne'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="p-6 space-y-6">
              {/* Header Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {isAr ? 'الحريف' : 'Client'} *
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.matriculeFiscal || 'Sans Matricule'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {isAr ? 'تاريخ الفاتورة' : 'Date Facture'} *
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {isAr ? 'تاريخ الاستحقاق' : "Date d'échéance"} *
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              {/* Items Lines */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    {isAr ? 'بنود الفاتورة والأسعار' : 'Lignes de Facturation'}
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="px-2.5 py-1 rounded bg-[#14264C] text-amber-300 text-xs font-semibold hover:bg-[#1E3A6A] transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة سطر' : 'Ajouter ligne'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formLines.map((line, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 bg-[#0D1B36]/80 p-3 rounded-lg border border-[#1B315A] items-center text-xs"
                    >
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="Désignation de l'article..."
                          value={line.description}
                          onChange={(e) => {
                            const copy = [...formLines];
                            copy[idx].description = e.target.value;
                            setFormLines(copy);
                          }}
                          className="w-full bg-[#070D1D] border border-[#1B315A] rounded px-2.5 py-1.5 text-white focus:outline-none"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Quantité"
                          step="0.01"
                          min="0.01"
                          value={line.quantity}
                          onChange={(e) => {
                            const copy = [...formLines];
                            copy[idx].quantity = parseFloat(e.target.value) || 0;
                            setFormLines(copy);
                          }}
                          className="w-full bg-[#070D1D] border border-[#1B315A] rounded px-2.5 py-1.5 text-white font-mono text-right focus:outline-none"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="P.U HT"
                          step="0.001"
                          min="0"
                          value={line.unitPriceHt}
                          onChange={(e) => {
                            const copy = [...formLines];
                            copy[idx].unitPriceHt = parseFloat(e.target.value) || 0;
                            setFormLines(copy);
                          }}
                          className="w-full bg-[#070D1D] border border-[#1B315A] rounded px-2.5 py-1.5 text-white font-mono text-right focus:outline-none"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <select
                          value={line.vatRate}
                          onChange={(e) => {
                            const copy = [...formLines];
                            copy[idx].vatRate = parseInt(e.target.value, 10) as VatRate;
                            setFormLines(copy);
                          }}
                          className="w-full bg-[#070D1D] border border-[#1B315A] rounded px-2 py-1.5 text-white focus:outline-none"
                        >
                          <option value="19">TVA 19%</option>
                          <option value="7">TVA 7%</option>
                          <option value="13">TVA 13%</option>
                          <option value="0">TVA 0% (Exonéré)</option>
                        </select>
                      </div>

                      <div className="col-span-2 flex items-center justify-between pl-2">
                        <span className="font-mono font-bold text-amber-300">
                          {formatTnd(line.quantity * line.unitPriceHt)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Checkboxes & Summary Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#1B315A]">
                <div className="space-y-3 bg-[#0D1B36] p-4 rounded-xl border border-[#1B315A]">
                  <h4 className="text-xs font-bold text-slate-300 uppercase">
                    {isAr ? 'الخيارات الجبائية القانونية' : 'Options Fiscales Tunisiennes'}
                  </h4>

                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyTimbre}
                      onChange={(e) => setApplyTimbre(e.target.checked)}
                      className="rounded border-[#1B315A] text-amber-500 focus:ring-0"
                    />
                    <span>
                      {isAr
                        ? 'تطبيق الطابع الجبائي الإجباري (1.000 د.ت)'
                        : 'Droit de Timbre Fiscal obligatoire (1,000 TND)'}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyRetenue}
                      onChange={(e) => setApplyRetenue(e.target.checked)}
                      className="rounded border-[#1B315A] text-amber-500 focus:ring-0"
                    />
                    <span>
                      {isAr
                        ? `خصم من المورد (${selectedClient?.retenueSourceRate || 1.5}%)`
                        : `Retenue à la source (${selectedClient?.retenueSourceRate || 1.5}%)`}
                    </span>
                  </label>

                  {company.fodecApplicable && (
                    <div className="text-[11px] text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-500/20">
                      Régime Usine : Taxe FODEC 1% appliquée automatiquement.
                    </div>
                  )}
                </div>

                {/* Totals Table */}
                <div className="bg-[#050A17] p-4 rounded-xl border border-[#1B315A] text-xs space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Total HT :</span>
                    <span className="font-mono text-white">
                      {formatTnd(previewCalculation.totalHt)}
                    </span>
                  </div>

                  {company.fodecApplicable && (
                    <div className="flex justify-between text-slate-400">
                      <span>FODEC (1%) :</span>
                      <span className="font-mono text-amber-400">
                        {formatTnd(previewCalculation.totalFodec)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400">
                    <span>Total TVA (19%/7%/13%) :</span>
                    <span className="font-mono text-blue-400">
                      {formatTnd(previewCalculation.totalVat)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Timbre Fiscal :</span>
                    <span className="font-mono text-amber-300">
                      {formatTnd(previewCalculation.timbreFiscal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-200 font-semibold pt-1 border-t border-[#1B315A]">
                    <span>Total TTC :</span>
                    <span className="font-mono text-amber-200">
                      {formatTnd(previewCalculation.totalTtc)}
                    </span>
                  </div>

                  {previewCalculation.retenueSourceAmount > 0 && (
                    <div className="flex justify-between text-red-400 font-medium">
                      <span>Retenue à la source ({retenueRate}%) :</span>
                      <span className="font-mono">
                        -{formatTnd(previewCalculation.retenueSourceAmount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-bold text-emerald-400 pt-2 border-t border-[#1B315A]">
                    <span>Net à Payer (TND) :</span>
                    <span className="font-mono font-black text-base">
                      {formatTnd(previewCalculation.netToPay)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#1B315A]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0D1B36] text-slate-300 text-xs font-semibold hover:bg-[#14264C]"
                >
                  {isAr ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 text-xs font-bold shadow hover:brightness-110"
                >
                  {isAr ? 'تسجيل وإصدار الفاتورة' : 'Enregistrer & Émettre la Facture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVOICE OFFICIAL PRINTABLE VIEW MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 p-8 border border-slate-300">
            {/* Action Bar (Top) */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-bold text-xs">
                  FACTURE TUNISIENNE OFFICIELLE
                </span>
                <span className="font-mono font-bold text-xs text-slate-600">
                  {selectedInvoice.invoiceNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-800"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Invoice Printable Sheet */}
            <div className="space-y-6 text-xs">
              {/* Company & Client Header */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-heading">
                    {company.name}
                  </h3>
                  <p className="text-slate-600 mt-1">{company.address}</p>
                  <p className="text-slate-600">{company.governorate}, Tunisie</p>
                  <div className="mt-3 pt-3 border-t border-slate-200 font-mono text-[11px] space-y-0.5">
                    <p>
                      <strong>Matricule Fiscal :</strong> {company.matriculeFiscal}
                    </p>
                    <p>
                      <strong>RNE :</strong> {company.registreCommerce || 'En cours'}
                    </p>
                    <p>
                      <strong>Tél :</strong> {company.phone}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Facturé à :
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">
                    {selectedInvoice.thirdPartyName}
                  </h4>
                  <p className="font-mono text-slate-700 mt-1">
                    <strong>Matricule Fiscal :</strong>{' '}
                    {selectedInvoice.thirdPartyMatricule || 'Non mentionné'}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-200 text-slate-600 space-y-0.5">
                    <p>
                      <strong>Date d'émission :</strong> {selectedInvoice.invoiceDate}
                    </p>
                    <p>
                      <strong>Date d'échéance :</strong> {selectedInvoice.dueDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full border border-slate-200 text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Désignation</th>
                    <th className="p-2.5 text-right">Qté</th>
                    <th className="p-2.5 text-right">P.U HT</th>
                    <th className="p-2.5 text-right">Total HT</th>
                    <th className="p-2.5 text-right">TVA</th>
                    <th className="p-2.5 text-right">Total TTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedInvoice.lines.map((line, i) => (
                    <tr key={i}>
                      <td className="p-2.5 font-medium">{line.description}</td>
                      <td className="p-2.5 text-right font-mono">{line.quantity}</td>
                      <td className="p-2.5 text-right font-mono">
                        {formatTnd(line.unitPriceHt)}
                      </td>
                      <td className="p-2.5 text-right font-mono">
                        {formatTnd(line.totalHt)}
                      </td>
                      <td className="p-2.5 text-right font-mono">{line.vatRate}%</td>
                      <td className="p-2.5 text-right font-mono font-semibold">
                        {formatTnd(line.totalTtc)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Breakdown & Totals */}
              <div className="flex justify-end">
                <div className="w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span>Total Brut HT :</span>
                    <span>{formatTnd(selectedInvoice.totalHt)}</span>
                  </div>
                  {selectedInvoice.totalFodec > 0 && (
                    <div className="flex justify-between text-amber-800">
                      <span>FODEC (1%) :</span>
                      <span>{formatTnd(selectedInvoice.totalFodec)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Total TVA :</span>
                    <span>{formatTnd(selectedInvoice.totalVat)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Droit de Timbre :</span>
                    <span>{formatTnd(selectedInvoice.timbreFiscal)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t border-slate-300 text-slate-900">
                    <span>Total TTC :</span>
                    <span>{formatTnd(selectedInvoice.totalTtc)}</span>
                  </div>
                  {selectedInvoice.retenueSourceAmount > 0 && (
                    <div className="flex justify-between text-red-600 font-semibold">
                      <span>Retenue Source ({selectedInvoice.retenueSourceRate}%) :</span>
                      <span>-{formatTnd(selectedInvoice.retenueSourceAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-300 text-slate-950">
                    <span>Net à Payer :</span>
                    <span>{formatTnd(selectedInvoice.netToPay)}</span>
                  </div>
                </div>
              </div>

              {/* Official Legal Footer */}
              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-500 space-y-1">
                <p>
                  Arrêtée la présente facture à la somme nette de :{' '}
                  <strong className="text-slate-900">
                    {formatTnd(selectedInvoice.netToPay)}
                  </strong>
                </p>
                <p>
                  SANDRA GESTION • Développé par Radhwen Ennaceur • Logiciel ERP & Comptabilité Tunisienne
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
