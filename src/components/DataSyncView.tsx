import React, { useState } from 'react';
import {
  RefreshCw,
  Smartphone,
  Laptop,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Lock,
  Download,
  Upload,
} from 'lucide-react';
import { Company, ErpSessionType, SyncPacket } from '../types/erp';

interface DataSyncViewProps {
  company: Company;
  session: ErpSessionType;
  language: 'fr' | 'ar';
}

export const DataSyncView: React.FC<DataSyncViewProps> = ({
  company,
  session,
  language,
}) => {
  const isAr = language === 'ar';
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SUCCESS'>('IDLE');

  const registeredDevices = [
    {
      id: 'dev-01',
      name: 'Tablette Atelier Injection Usine (Khaled K.)',
      platform: 'ANDROID_KOTLIN' as const,
      deviceId: 'android-samsung-tab-a8-01',
      lastSync: 'Il y a 14 minutes',
      status: 'AUTORISÉ & ACTIF',
      pendingChanges: 3,
    },
    {
      id: 'dev-02',
      name: 'Poste Comptabilité & Finance Bureau (Samia B.)',
      platform: 'WINDOWS_WPF' as const,
      deviceId: 'win11-workstation-compta-02',
      lastSync: 'Il y a 2 minutes',
      status: 'AUTORISÉ & ACTIF',
      pendingChanges: 0,
    },
  ];

  const syncPackets: SyncPacket[] = [
    {
      id: 'pkt-9b1deb4d-3b7d-4bad',
      companyId: company.id,
      clientDeviceId: 'android-samsung-tab-a8-01',
      deviceName: 'Tablette Atelier Usine',
      platform: 'ANDROID_KOTLIN',
      operationCount: 4,
      timestamp: '2026-10-14 11:42:15',
      status: 'SYNCED',
    },
    {
      id: 'pkt-7c2eaa3c-1a2f-4e9a',
      companyId: company.id,
      clientDeviceId: 'win11-workstation-compta-02',
      deviceName: 'Poste Windows Bureau',
      platform: 'WINDOWS_WPF',
      operationCount: 1,
      timestamp: '2026-10-14 11:48:30',
      status: 'SYNCED',
    },
  ];

  const handleTriggerSync = () => {
    setSyncStatus('SYNCING');
    setTimeout(() => {
      setSyncStatus('SUCCESS');
      setTimeout(() => setSyncStatus('IDLE'), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-400" />
              <span>{isAr ? 'بروتوكول المزامنة المؤمنة (Windows / Android)' : 'Synchronisation Hors-Ligne & Appareils'}</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              LOCAL-FIRST • ZERO-DATA LOSS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'مزامنة المعطيات بين حواسيب الإدارة وتطبيقات الأندرويد لمديري الورشات مع الحفاظ على سرية المؤسسة'
              : 'Échanges bidirectionnels chiffrés, détection des conflits par vecteurs de version et idempotence.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleTriggerSync}
          disabled={syncStatus === 'SYNCING'}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-xs shadow hover:brightness-110 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
          <span>
            {syncStatus === 'SYNCING'
              ? 'Synchronisation en cours...'
              : syncStatus === 'SUCCESS'
              ? 'Synchronisé avec Succès !'
              : 'Lancer Synchronisation'}
          </span>
        </button>
      </div>

      {/* Trust & Protocol Specs Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0D1B36] p-4 rounded-xl border border-[#1B315A] space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Isolation Multi-Sociétés</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Validation cryptographique du <code>CompanyId</code> sur chaque paquet : aucun transit inter-entreprises n'est possible.
          </p>
        </div>

        <div className="bg-[#0D1B36] p-4 rounded-xl border border-[#1B315A] space-y-1">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
            <Lock className="w-4 h-4" />
            <span>Immutabilité Financière</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Les écritures et factures comptabilisées sont inaltérables hors-ligne. Les modifications nécessitent une contre-passation.
          </p>
        </div>

        <div className="bg-[#0D1B36] p-4 rounded-xl border border-[#1B315A] space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <ArrowRightLeft className="w-4 h-4" />
            <span>Idempotence Garantie</span>
          </div>
          <p className="text-[11px] text-slate-300">
            La soumission répétée d’un paquet réseau n'entraîne aucun doublon de mouvements de stock ou de factures.
          </p>
        </div>
      </div>

      {/* Registered Devices */}
      <div className="bg-[#0D1B36] border border-[#1B315A] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#1B315A] flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-200">
            Périphériques Enregistrés de l'Usine
          </h3>
        </div>
        <div className="divide-y divide-[#1B315A]/60">
          {registeredDevices.map((dev) => (
            <div key={dev.id} className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#070D1D] text-amber-400 border border-[#1B315A]">
                  {dev.platform === 'ANDROID_KOTLIN' ? (
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Laptop className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">{dev.name}</h4>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ID : {dev.deviceId} • Plateforme : {dev.platform}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Dernier échange :</span>
                  <span className="text-slate-300">{dev.lastSync}</span>
                </div>
                <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {dev.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync Packets Audit Trail */}
      <div className="bg-[#0D1B36] border border-[#1B315A] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#1B315A] flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-200">
            Journal des Paquets Synchronisés (Audit Trail)
          </h3>
        </div>
        <table className="w-full text-xs text-left">
          <thead className="bg-[#070D1D] text-slate-400 border-b border-[#1B315A]">
            <tr>
              <th className="py-2.5 px-4">Packet ID</th>
              <th className="py-2.5 px-4">Périphérique Émetteur</th>
              <th className="py-2.5 px-4">Plateforme</th>
              <th className="py-2.5 px-4">Horodatage</th>
              <th className="py-2.5 px-4 text-right">Opérations</th>
              <th className="py-2.5 px-4 text-center">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1B315A]/60">
            {syncPackets.map((pkt) => (
              <tr key={pkt.id} className="hover:bg-[#122347]/50 font-mono">
                <td className="py-2.5 px-4 font-bold text-amber-300">{pkt.id}</td>
                <td className="py-2.5 px-4 text-white">{pkt.deviceName}</td>
                <td className="py-2.5 px-4 text-slate-300">{pkt.platform}</td>
                <td className="py-2.5 px-4 text-slate-400">{pkt.timestamp}</td>
                <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">
                  {pkt.operationCount} modifications
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    CONFORME
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
