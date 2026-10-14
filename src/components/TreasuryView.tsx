import React from 'react';
import { Landmark, ArrowDownLeft, ArrowUpRight, Plus, Wallet, CreditCard } from 'lucide-react';
import { Company, TreasuryAccount, ErpSessionType } from '../types/erp';
import { formatTnd } from '../services/tunisianFiscal';

interface TreasuryViewProps {
  company: Company;
  session: ErpSessionType;
  treasury: TreasuryAccount[];
  language: 'fr' | 'ar';
}

export const TreasuryView: React.FC<TreasuryViewProps> = ({
  company,
  session,
  treasury,
  language,
}) => {
  const isAr = language === 'ar';
  const totalBalance = treasury.reduce((acc, t) => acc + t.currentBalance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
            <Landmark className="w-5 h-5 text-amber-400" />
            <span>{isAr ? 'إدارة الخزينة، البنوك والصناديق' : 'Trésorerie & Comptes Bancaires'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'متابعة الحسابات البنكية التونسية (BIAT, BNA...)، السيولة النقدية والصندوق المركزي بالدينار'
              : 'RIB bancaires tunisiens (20 chiffres), suivi des soldes en Dinars Tunisiens et rapprochements.'}
          </p>
        </div>

        <div className="bg-[#0D1B36] border border-[#1B315A] px-4 py-2 rounded-xl text-right">
          <span className="text-[11px] text-slate-400">
            {isAr ? 'إجمالي السيولة المتاحة' : 'Solde Global Disponible'}
          </span>
          <div className="text-lg font-bold font-mono text-amber-300">
            {formatTnd(totalBalance)}
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {treasury.map((accnt) => (
          <div
            key={accnt.id}
            className="bg-[#0D1B36] border border-[#1B315A] rounded-xl p-5 space-y-4 hover:border-amber-500/40 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl ${
                    accnt.type === 'BANK'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {accnt.type === 'BANK' ? (
                    <Landmark className="w-6 h-6" />
                  ) : (
                    <Wallet className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <span className="font-mono text-xs text-slate-400 font-bold">
                    {accnt.code}
                  </span>
                  <h3 className="font-bold text-sm text-white">{accnt.name}</h3>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-emerald-400">
                ACTIF
              </span>
            </div>

            {accnt.bankRib && (
              <div className="p-2.5 bg-[#070D1D] rounded-lg border border-[#1B315A] text-xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                  RIB Tunisien (20 chiffres) :
                </span>
                <span className="font-mono text-slate-200 tracking-wider">
                  {accnt.bankRib}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-[#1B315A] flex items-center justify-between">
              <span className="text-xs text-slate-400">Solde Réel :</span>
              <span className="text-lg font-bold font-mono text-amber-300">
                {formatTnd(accnt.currentBalance)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
