import React, { useState } from 'react';
import {
  HardDriveDownload,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCode,
  Lock,
} from 'lucide-react';
import { storage } from '../services/storage';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
  language: 'fr' | 'ar';
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
  language,
}) => {
  const isAr = language === 'ar';
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const jsonStr = storage.createBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.href = url;
    a.download = `SANDRA_GESTION_BACKUP_${timestamp}.sandra.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreError(null);
    setRestoreSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const ok = storage.restoreBackupJson(content);
        if (ok) {
          setRestoreSuccess(true);
          onDataRestored();
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setRestoreError('Format de sauvegarde invalide ou fichier corrompu.');
        }
      } catch (err: any) {
        setRestoreError(`Erreur lors de la lecture : ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#070D1D] border border-[#1B315A] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#1B315A] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <HardDriveDownload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white">
                {isAr ? 'النسخ الاحتياطي واسترجاع البيانات' : 'Sauvegarde & Restauration Locale'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAr ? 'حفظ البيانات محلياً دون الحاجة للإنترنت' : 'Local-first • Zéro dépendance cloud obligatoire'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Card */}
        <div className="bg-[#0D1B36] p-4 rounded-xl border border-[#1B315A] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-white">
              {isAr ? 'تصدير نسخة احتياطية كاملة' : 'Créer une Sauvegarde Immédiate'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold">
              JSON / SQLITE
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {isAr
              ? 'توليد ملف مشفر وشامل لكافة الشركات، الفواتير، الإنتاج وسجلات التدقيق.'
              : 'Génère une archive intégrale de toutes les usines, factures, ordres de fabrication et écritures comptables.'}
          </p>

          <button
            type="button"
            onClick={handleDownloadBackup}
            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <HardDriveDownload className="w-4 h-4" />
            <span>
              {downloadSuccess
                ? isAr
                  ? 'تم تحميل النسخة بنجاح !'
                  : 'Sauvegarde téléchargée avec succès !'
                : isAr
                ? 'تحميل ملف النسخة الاحتياطية'
                : 'Télécharger la Sauvegarde (.sandra.json)'}
            </span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-[#0D1B36] p-4 rounded-xl border border-[#1B315A] space-y-3">
          <span className="font-bold text-xs text-white">
            {isAr ? 'استرجاع نسخة سابقة' : 'Restaurer une Sauvegarde'}
          </span>
          <p className="text-xs text-slate-300">
            {isAr
              ? 'اختر ملف النسخة الاحتياطية لاستعادة قاعدة البيانات المحلية.'
              : 'Chargez un fichier de sauvegarde pour restaurer l’état du logiciel.'}
          </p>

          {restoreError && (
            <div className="p-2.5 bg-red-950/60 border border-red-500/30 rounded-lg text-xs text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{restoreError}</span>
            </div>
          )}

          {restoreSuccess && (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded-lg text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Données restaurées avec succès !</span>
            </div>
          )}

          <label className="w-full py-2.5 px-4 rounded-lg bg-[#070D1D] hover:bg-[#14264C] text-slate-200 border border-[#1B315A] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Sélectionner le fichier de sauvegarde</span>
            <input
              type="file"
              accept=".json,.sandra"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="pt-2 border-t border-[#1B315A] text-center text-[10px] text-slate-500">
          SANDRA GESTION • Développé par Radhwen Ennaceur
        </div>
      </div>
    </div>
  );
};
