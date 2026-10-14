import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Factory,
  BookOpenCheck,
  Boxes,
  Landmark,
  Users2,
  ShieldAlert,
  Binary,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { ErpSessionType, User } from '../types/erp';

export type ActiveTab =
  | 'dashboard'
  | 'invoices'
  | 'manufacturing'
  | 'accounting'
  | 'inventory'
  | 'payroll'
  | 'fixed_assets'
  | 'treasury'
  | 'third_parties'
  | 'sync'
  | 'super_admin'
  | 'architecture';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  activeSession: ErpSessionType;
  currentUser: User | undefined;
  language: 'fr' | 'ar';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeSession,
  currentUser,
  language,
}) => {
  const isAr = language === 'ar';
  const isReelle = activeSession === 'REELLE';

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      labelFr: 'Tableau de bord',
      labelAr: 'لوحة القيادة',
      icon: LayoutDashboard,
      badge: null,
      sessionSpecific: null,
    },
    {
      id: 'invoices' as ActiveTab,
      labelFr: 'Factures & Ventes',
      labelAr: 'الفواتير والمبيعات',
      icon: ReceiptText,
      badge: 'TND',
      sessionSpecific: 'FINANCIERE' as const,
    },
    {
      id: 'manufacturing' as ActiveTab,
      labelFr: 'Usine & Production',
      labelAr: 'المصنع والإنتاج',
      icon: Factory,
      badge: 'BOM / OF',
      sessionSpecific: 'REELLE' as const,
    },
    {
      id: 'accounting' as ActiveTab,
      labelFr: 'Comptabilité SCE',
      labelAr: 'المحاسبة التونسية',
      icon: BookOpenCheck,
      badge: 'Classes 1-7',
      sessionSpecific: 'FINANCIERE' as const,
    },
    {
      id: 'payroll' as ActiveTab,
      labelFr: 'Paie Tunisienne',
      labelAr: 'التصرف في الأجور والـ CNSS',
      icon: Users2,
      badge: '9.18% / IRPP',
      sessionSpecific: 'FINANCIERE' as const,
    },
    {
      id: 'fixed_assets' as ActiveTab,
      labelFr: 'Immobilisations (NCT 5)',
      labelAr: 'الأصول والاهتلاكات',
      icon: Layers,
      badge: 'Classe 2',
      sessionSpecific: 'FINANCIERE' as const,
    },
    {
      id: 'inventory' as ActiveTab,
      labelFr: 'Stocks & Matières',
      labelAr: 'المخزون والمواد الأولية',
      icon: Boxes,
      badge: 'MP / PF',
      sessionSpecific: null,
    },
    {
      id: 'treasury' as ActiveTab,
      labelFr: 'Trésorerie & Banques',
      labelAr: 'الخزينة والبنوك',
      icon: Landmark,
      badge: 'BIAT/BNA',
      sessionSpecific: null,
    },
    {
      id: 'third_parties' as ActiveTab,
      labelFr: 'Tiers (Clients/Fourn.)',
      labelAr: 'الحرفاء والمزودون',
      icon: Users2,
      badge: null,
      sessionSpecific: null,
    },
    {
      id: 'sync' as ActiveTab,
      labelFr: 'Synchronisation Mobile',
      labelAr: 'المزامنة المؤمنة',
      icon: Binary,
      badge: 'Local-First',
      sessionSpecific: null,
    },
    {
      id: 'super_admin' as ActiveTab,
      labelFr: 'Administration Usines',
      labelAr: 'إدارة المصانع والشركات',
      icon: ShieldAlert,
      badge: 'Super Admin',
      sessionSpecific: null,
    },
    {
      id: 'architecture' as ActiveTab,
      labelFr: 'Architecture & Binaires',
      labelAr: 'البنية البرمجية والملفات',
      icon: Binary,
      badge: 'EXE / APK',
      sessionSpecific: null,
    },
  ];

  return (
    <aside className="w-64 bg-[#070D1D] border-r border-[#1B315A] flex flex-col shrink-0 min-h-[calc(100vh-57px)]">
      {/* Session Scope Indicator in Sidebar */}
      <div className="p-3.5 border-b border-[#1B315A]/70">
        <div
          className={`p-2.5 rounded-lg border transition-all ${
            isReelle
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-blue-950/40 border-blue-500/30 text-blue-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                isReelle ? 'bg-emerald-400' : 'bg-blue-400'
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider">
              {isReelle
                ? isAr
                  ? 'جلسة المصنع الفعلية'
                  : 'Session Réelle (Usine)'
                : isAr
                ? 'الجلسة المالية الرسمية'
                : 'Session Financière (SCE)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-tight">
            {isReelle
              ? isAr
                ? 'تتبع المواد الخام، تكاليف الصنع الفعلية والنفايات'
                : 'Gestion des fabrications, BOM, rebuts et coûts de revient réels.'
              : isAr
                ? 'محاسبة قانونية تونسية، أداءات، طابع جبائي واقتطاع من المورد'
                : 'Comptabilité légale, déclarations TVA, Timbre fiscal 1 DT & RS.'}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isSessionHighlight =
            (item.sessionSpecific === 'REELLE' && isReelle) ||
            (item.sessionSpecific === 'FINANCIERE' && !isReelle);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-[#0D1B36] hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-amber-400'
                      : isSessionHighlight
                      ? isReelle
                        ? 'text-emerald-400'
                        : 'text-blue-400'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{isAr ? item.labelAr : item.labelFr}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-[#14264C] text-slate-300 border border-[#1B315A]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Badge & Credit Footer in Sidebar */}
      <div className="p-3.5 border-t border-[#1B315A]/80 bg-[#050A17]/60">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-xs shadow">
            {currentUser?.fullName.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {currentUser?.fullName || 'Utilisateur'}
            </p>
            <p className="text-[10px] text-amber-400/90 font-mono">
              {currentUser?.role === 'SUPER_ADMIN' ? 'SUPER ADMINISTRATEUR' : currentUser?.role}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 text-center">
          <p className="text-[10px] text-slate-500">
            {isAr ? 'تطوير رضوان الناصر' : 'Développé par'}{' '}
            <strong className="text-amber-400/90 font-medium">Radhwen Ennaceur</strong>
          </p>
        </div>
      </div>
    </aside>
  );
};
