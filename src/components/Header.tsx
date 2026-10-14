import React from 'react';
import {
  ShieldCheck,
  Building2,
  HardDriveDownload,
  Languages,
  CheckCircle2,
  Factory,
  Scale,
  Sparkles,
} from 'lucide-react';
import { Company, ErpSessionType, User } from '../types/erp';

interface HeaderProps {
  companies: Company[];
  activeCompany: Company | undefined;
  onSelectCompany: (companyId: string) => void;
  activeSession: ErpSessionType;
  onToggleSession: (session: ErpSessionType) => void;
  language: 'fr' | 'ar';
  onToggleLanguage: (lang: 'fr' | 'ar') => void;
  currentUser: User | undefined;
  onOpenBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  companies,
  activeCompany,
  onSelectCompany,
  activeSession,
  onToggleSession,
  language,
  onToggleLanguage,
  currentUser,
  onOpenBackup,
}) => {
  const isAr = language === 'ar';
  const isReelle = activeSession === 'REELLE';

  return (
    <header className="sticky top-0 z-40 bg-[#070D1D]/95 backdrop-blur-md border-b border-[#1B315A] px-4 lg:px-6 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand & El Djem Visual Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#E5B85A] via-[#C59B27] to-[#8C6B14] shadow-md shadow-amber-900/30 border border-amber-300/40">
            <span className="font-heading font-black text-slate-950 text-xl tracking-tighter">
              SG
            </span>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#070D1D]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-lg font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
                SANDRA GESTION
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                PRO 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-tight flex items-center gap-1.5">
              <span>{isAr ? 'نظام التصرف والمحاسبة للمؤسسات التونسية' : 'ERP & Comptabilité Tunisienne'}</span>
              <span className="text-amber-500/60">•</span>
              <span className="text-amber-300/90 font-medium">
                {isAr ? 'تطوير رضوان الناصر' : 'Développé par Radhwen Ennaceur'}
              </span>
            </p>
          </div>
        </div>

        {/* DUAL SESSION SWITCHER (Financière vs Réelle) */}
        <div className="flex items-center bg-[#050A17] p-1 rounded-xl border border-[#1B315A]/80 shadow-inner">
          <button
            type="button"
            onClick={() => onToggleSession('FINANCIERE')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !isReelle
                ? 'bg-blue-600/90 text-white shadow-md shadow-blue-900/40 border border-blue-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isAr ? 'الجلسة المالية (القانونية SCE)' : 'Session Financière (SCE)'}</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleSession('REELLE')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isReelle
                ? 'bg-emerald-600/90 text-white shadow-md shadow-emerald-900/40 border border-emerald-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            <span>{isAr ? 'الجلسة الفعلية (المصنع والتكاليف)' : 'Session Réelle (Usine & Coûts)'}</span>
          </button>
        </div>

        {/* Tenant Selector, Language & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Active Company Selector */}
          <div className="flex items-center gap-2 bg-[#0D1B36] border border-[#1B315A] rounded-lg px-2.5 py-1 text-xs">
            <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={activeCompany?.id || ''}
              onChange={(e) => onSelectCompany(e.target.value)}
              className="bg-transparent text-slate-200 font-medium text-xs focus:outline-none cursor-pointer max-w-[190px] truncate"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0D1B36] text-white">
                  {c.tradeName || c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => onToggleLanguage(isAr ? 'fr' : 'ar')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0D1B36] hover:bg-[#14264C] text-slate-300 border border-[#1B315A] text-xs font-medium transition-colors"
            title="Basculer Français / العربية"
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'Français' : 'العربية'}</span>
          </button>

          {/* Backup Button */}
          <button
            type="button"
            onClick={onOpenBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-semibold text-xs shadow-md shadow-amber-950/40 hover:brightness-110 transition-all border border-amber-300/50 cursor-pointer"
          >
            <HardDriveDownload className="w-3.5 h-3.5" />
            <span>{isAr ? 'نسخ احتياطي' : 'Sauvegarde'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
