import React, { useState } from 'react';
import { Users2, Plus, Search, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { Company, ThirdParty, ErpSessionType } from '../types/erp';
import { formatTnd, isValidMatriculeFiscal } from '../services/tunisianFiscal';

interface ThirdPartiesViewProps {
  company: Company;
  session: ErpSessionType;
  thirdParties: ThirdParty[];
  language: 'fr' | 'ar';
  onAddThirdParty: (thirdParty: ThirdParty) => void;
}

export const ThirdPartiesView: React.FC<ThirdPartiesViewProps> = ({
  company,
  session,
  thirdParties,
  language,
  onAddThirdParty,
}) => {
  const isAr = language === 'ar';
  const [filterType, setFilterType] = useState<'ALL' | 'CLIENT' | 'SUPPLIER'>('ALL');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [type, setType] = useState<'CLIENT' | 'SUPPLIER'>('CLIENT');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [matriculeFiscal, setMatriculeFiscal] = useState('');
  const [address, setAddress] = useState('');
  const [governorate, setGovernorate] = useState('Sfax');
  const [phone, setPhone] = useState('+216 ');
  const [email, setEmail] = useState('');
  const [retenueRate, setRetenueRate] = useState(1.5);
  const [formError, setFormError] = useState('');

  const filtered = thirdParties.filter((t) => {
    const matchesType = filterType === 'ALL' || t.type === filterType;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      (t.matriculeFiscal && t.matriculeFiscal.includes(search));
    return matchesType && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (matriculeFiscal && !isValidMatriculeFiscal(matriculeFiscal)) {
      setFormError(
        'Format du Matricule Fiscal invalide. Exemple conforme DGI : 1458923/A/M/000'
      );
      return;
    }

    const newThirdParty: ThirdParty = {
      id: `tp-${Date.now()}`,
      companyId: company.id,
      type,
      code: code.trim().toUpperCase(),
      name,
      matriculeFiscal: matriculeFiscal.trim().toUpperCase() || undefined,
      address,
      governorate,
      phone,
      email,
      vatExempt: false,
      retenueSourceRate: retenueRate,
      paymentTermsDays: 30,
      soldeActuel: 0,
      isActive: true,
    };

    onAddThirdParty(newThirdParty);
    setShowAddModal(false);
    setCode('');
    setName('');
    setMatriculeFiscal('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
            <Users2 className="w-5 h-5 text-amber-400" />
            <span>{isAr ? 'إدارة الحرفاء والمزودين' : 'Tiers : Clients & Fournisseurs'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'المعرف الجبائي التونسي، نسب الخصم من المورد (1.5% أو 1%) ومتابعة الديون التجارية'
              : 'Matricule fiscal DGI, taux de retenue à la source et balances âgées.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={isAr ? 'بحث عن حريف أو مزود...' : 'Rechercher tiers...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0D1B36] border border-[#1B315A] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-52"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold text-xs shadow hover:brightness-110 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة حريف أو مزود' : 'Nouveau Tiers'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['ALL', 'CLIENT', 'SUPPLIER'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === t
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-[#0D1B36] text-slate-300 border border-[#1B315A] hover:bg-[#14264C]'
            }`}
          >
            {t === 'ALL'
              ? isAr
                ? 'الكل'
                : 'Tous les Tiers'
              : t === 'CLIENT'
              ? isAr
                ? 'الحرفاء (Clients)'
                : 'Clients'
              : isAr
              ? 'المزودون (Fournisseurs)'
              : 'Fournisseurs'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#0D1B36] border border-[#1B315A] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#070D1D] text-slate-400 border-b border-[#1B315A]">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Raison Sociale</th>
                <th className="py-3 px-4">Matricule Fiscal DGI</th>
                <th className="py-3 px-4">Gouvernorat</th>
                <th className="py-3 px-4">Taux RS</th>
                <th className="py-3 px-4 text-right">Solde Actuel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B315A]/60">
              {filtered.map((tp) => (
                <tr key={tp.id} className="hover:bg-[#122347]/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-amber-300">
                    {tp.code}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tp.type === 'CLIENT'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {tp.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">{tp.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {tp.matriculeFiscal || '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{tp.governorate || '-'}</td>
                  <td className="py-3 px-4 font-mono text-amber-400">
                    {tp.retenueSourceRate > 0 ? `${tp.retenueSourceRate}%` : '0%'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    <span
                      className={tp.soldeActuel >= 0 ? 'text-emerald-400' : 'text-red-400'}
                    >
                      {formatTnd(tp.soldeActuel)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#070D1D] border border-[#1B315A] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="font-heading font-bold text-base text-white">
              {isAr ? 'إضافة حريف أو مزود جديد' : 'Nouveau Tiers Commercial'}
            </h3>

            {formError && (
              <div className="p-3 bg-red-950/60 border border-red-500/30 rounded-lg text-xs text-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="CLIENT">Client</option>
                    <option value="SUPPLIER">Fournisseur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Code Tiers *</label>
                  <input
                    type="text"
                    placeholder="ex: CL-0030"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Raison Sociale / Nom *</label>
                <input
                  type="text"
                  placeholder="ex: Société Industrielle Moderne SARL"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Matricule Fiscal</label>
                  <input
                    type="text"
                    placeholder="1234567/A/M/000"
                    value={matriculeFiscal}
                    onChange={(e) => setMatriculeFiscal(e.target.value)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Taux Retenue à la source</label>
                  <select
                    value={retenueRate}
                    onChange={(e) => setRetenueRate(parseFloat(e.target.value))}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="1.5">1.5% (Prestations de services)</option>
                    <option value="1.0">1.0% (Vente marchandises étatiques)</option>
                    <option value="15.0">15.0% (Loyers / Honoraires non assujettis)</option>
                    <option value="0">0% (Aucune retenue)</option>
                  </select>
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
