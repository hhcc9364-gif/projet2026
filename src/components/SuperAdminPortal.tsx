import React, { useState } from 'react';
import {
  ShieldAlert,
  Building2,
  Plus,
  Users,
  Activity,
  CheckCircle2,
  Ban,
  Lock,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { Company, User, AuditLog, CompanyActivityType } from '../types/erp';
import { isValidMatriculeFiscal } from '../services/tunisianFiscal';

interface SuperAdminPortalProps {
  companies: Company[];
  users: User[];
  auditLogs: AuditLog[];
  language: 'fr' | 'ar';
  onAddCompany: (company: Company) => void;
  onUpdateCompany: (company: Company) => void;
}

export const SuperAdminPortal: React.FC<SuperAdminPortalProps> = ({
  companies,
  users,
  auditLogs,
  language,
  onAddCompany,
  onUpdateCompany,
}) => {
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'companies' | 'users' | 'audit'>('companies');
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);

  // New Company form
  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [matriculeFiscal, setMatriculeFiscal] = useState('');
  const [registreCommerce, setRegistreCommerce] = useState('');
  const [activityType, setActivityType] = useState<CompanyActivityType>('MANUFACTURING_FACTORY');
  const [address, setAddress] = useState('');
  const [governorate, setGovernorate] = useState('Sfax');
  const [phone, setPhone] = useState('+216 ');
  const [email, setEmail] = useState('');
  const [fodecApplicable, setFodecApplicable] = useState(true);
  const [formError, setFormError] = useState('');

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!isValidMatriculeFiscal(matriculeFiscal)) {
      setFormError(
        'Format du Matricule Fiscal invalide. Exemple conforme DGI : 1458923/A/M/000 (7 chiffres / lettre / M,P,C / 3 chiffres)'
      );
      return;
    }

    const newCompany: Company = {
      id: `comp-${Date.now()}`,
      name,
      tradeName: tradeName || name,
      matriculeFiscal: matriculeFiscal.trim().toUpperCase(),
      registreCommerce,
      activityType,
      address,
      governorate,
      phone,
      email,
      currency: 'TND',
      fodecApplicable,
      timbreFiscalAmount: 1.0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    onAddCompany(newCompany);
    setShowAddCompanyModal(false);
    setName('');
    setMatriculeFiscal('');
  };

  const toggleCompanyStatus = (company: Company) => {
    onUpdateCompany({
      ...company,
      isActive: !company.isActive,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>{isAr ? 'بوابة المشرف الأعلى (Super Admin)' : 'Portail Super Administrateur Multi-Usines'}</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
              SÉCURITÉ & ISOLATION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'إنشاء وإدارة حسابات المصانع، الشركات، المالكين والمستخدمين مع الفصل المطلق للبيانات والتشفير'
              : 'Création et gestion des usines et sociétés clientes, cloisonnement strict des données et journal d’audit.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#050A17] p-1 rounded-lg border border-[#1B315A] flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('companies')}
              className={`px-3 py-1.5 rounded text-xs font-semibold ${
                activeTab === 'companies'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'المصانع والشركات' : 'Usines & Sociétés'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded text-xs font-semibold ${
                activeTab === 'users'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'المستخدمون والأدوار' : 'Comptes Utilisateurs'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded text-xs font-semibold ${
                activeTab === 'audit'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'سجل التدقيق' : 'Journal d’Audit'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddCompanyModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold text-xs shadow hover:brightness-110 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة مصنع جديد' : 'Créer un Compte Usine / Société'}</span>
          </button>
        </div>
      </div>

      {/* Tab: Companies */}
      {activeTab === 'companies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.map((comp) => (
            <div
              key={comp.id}
              className={`bg-[#0D1B36] border rounded-xl p-5 space-y-4 transition-all ${
                comp.isActive ? 'border-[#1B315A]' : 'border-red-900/50 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-amber-400">
                      {comp.matriculeFiscal}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        comp.isActive
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {comp.isActive ? 'ACTIF' : 'SUSPENDU'}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white mt-1">{comp.name}</h3>
                  <p className="text-xs text-slate-400">
                    {comp.activityType === 'MANUFACTURING_FACTORY'
                      ? 'Usine de Fabrication Industrielle'
                      : 'Société Commerciale'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleCompanyStatus(comp)}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                    comp.isActive
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                  title={comp.isActive ? 'Suspendre' : 'Activer'}
                >
                  {comp.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 bg-[#070D1D] rounded-lg border border-[#1B315A] text-xs space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Gouvernorat :</span>
                  <span className="font-medium text-white">{comp.governorate}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Régime FODEC Usine (1%) :</span>
                  <span className="font-semibold text-emerald-400">
                    {comp.fodecApplicable ? 'Oui (1%)' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Isolation des données :</span>
                  <span className="text-emerald-400 font-mono">100% Hermétique (Tenant ID)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="bg-[#0D1B36] border border-[#1B315A] rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#070D1D] text-slate-400 border-b border-[#1B315A]">
              <tr>
                <th className="py-3 px-4">Utilisateur</th>
                <th className="py-3 px-4">Nom Complet</th>
                <th className="py-3 px-4">Rôle</th>
                <th className="py-3 px-4">Entreprise Affectée</th>
                <th className="py-3 px-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B315A]/60">
              {users.map((u) => {
                const assignedCompany = companies.find((c) => c.id === u.companyId);
                return (
                  <tr key={u.id} className="hover:bg-[#122347]/50">
                    <td className="py-3 px-4 font-mono font-bold text-amber-300">
                      {u.username}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">{u.fullName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#14264C] text-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {assignedCompany ? assignedCompany.name : 'Toutes (Super Admin Global)'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        Actif
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Audit */}
      {activeTab === 'audit' && (
        <div className="bg-[#0D1B36] border border-[#1B315A] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#1B315A] text-xs font-bold text-slate-200">
            Journal Inaltérable des Actions Système & Fiscales
          </div>
          <table className="w-full text-xs text-left">
            <thead className="bg-[#070D1D] text-slate-400 border-b border-[#1B315A]">
              <tr>
                <th className="py-2.5 px-4">Horodatage</th>
                <th className="py-2.5 px-4">Opérateur</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Session</th>
                <th className="py-2.5 px-4">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B315A]/60">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#122347]/50">
                  <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-white">{log.userName}</td>
                  <td className="py-2.5 px-4 font-mono text-amber-300">{log.action}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.sessionType === 'REELLE'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {log.sessionType}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-300">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE COMPANY MODAL */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#070D1D] border border-[#1B315A] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="font-heading font-bold text-base text-white">
              {isAr ? 'تسجيل مؤسسة أو مصنع تونسي جديد' : 'Créer une Nouvelle Entreprise / Usine'}
            </h3>

            {formError && (
              <div className="p-3 bg-red-950/60 border border-red-500/30 rounded-lg text-xs text-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCompany} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Raison Sociale *</label>
                <input
                  type="text"
                  placeholder="ex: Usine Plastique du Sahel SA"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">
                    Matricule Fiscal Officiel *
                  </label>
                  <input
                    type="text"
                    placeholder="1234567/A/M/000"
                    value={matriculeFiscal}
                    onChange={(e) => setMatriculeFiscal(e.target.value)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Activité *</label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as any)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="MANUFACTURING_FACTORY">Usine de Fabrication</option>
                    <option value="COMMERCIAL">Société Commerciale</option>
                    <option value="SERVICES">Société de Services</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Gouvernorat *</label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    {['Sfax', 'Tunis', 'Sousse', 'Monastir', 'Bizerte', 'Nabeul', 'Mahdia', 'Gabès', 'Médenine'].map(
                      (g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Adresse</label>
                  <input
                    type="text"
                    placeholder="Zone Industrielle..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#0D1B36] border border-[#1B315A] rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-slate-200 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={fodecApplicable}
                  onChange={(e) => setFodecApplicable(e.target.checked)}
                  className="rounded border-[#1B315A] text-amber-500 focus:ring-0"
                />
                <span>Assujetti à la taxe FODEC 1% (Régime Usine de Production)</span>
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#1B315A]">
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0D1B36] text-slate-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Créer le Compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
