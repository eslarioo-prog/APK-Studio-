import React from 'react';
import { History, RotateCcw, Save, Trash2, CheckCircle2, Calendar, FileJson, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { Language } from '../../i18n/translations';

export interface ProjectSnapshot {
  id: string;
  timestamp: string;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
  descriptionEn: string;
  metadataJson: string; // Serialized state
}

interface ProjectHistoryTabProps {
  lang: Language;
  snapshots: ProjectSnapshot[];
  onRestoreSnapshot: (snapshot: ProjectSnapshot) => void;
  onDeleteSnapshot: (id: string) => void;
  onCreateSnapshot: (labelAr: string, labelEn: string) => void;
}

export const ProjectHistoryTab: React.FC<ProjectHistoryTabProps> = ({
  lang,
  snapshots,
  onRestoreSnapshot,
  onDeleteSnapshot,
  onCreateSnapshot,
}) => {
  const isAr = lang === 'ar';

  const [newLabelAr, setNewLabelAr] = React.useState('');
  const [newLabelEn, setNewLabelEn] = React.useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelAr.trim() || !newLabelEn.trim()) return;
    onCreateSnapshot(newLabelAr, newLabelEn);
    setNewLabelAr('');
    setNewLabelEn('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Create Snapshot */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white mb-1">
              {isAr ? 'سجل النسخ الاحتياطية (Project Snapshots)' : 'Project History & Snapshots'}
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              {isAr 
                ? 'قم بحفظ حالة المشروع الحالية للعودة إليها في أي وقت. مفيد قبل إجراء تعديلات برمجية كبيرة قد تسبب أخطاء.' 
                : 'Save current project state to restore later. Perfect before making experimental changes or large patches.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-2 shrink-0">
          <input
            type="text"
            placeholder={isAr ? 'اسم النسخة (عربي)...' : 'Snapshot Name (Arabic)...'}
            value={newLabelAr}
            onChange={e => setNewLabelAr(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            placeholder={isAr ? 'اسم النسخة (English)...' : 'Snapshot Name (English)...'}
            value={newLabelEn}
            onChange={e => setNewLabelEn(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-indigo-400 hover:bg-indigo-300 rounded-lg transition-all cursor-pointer active:scale-95"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isAr ? 'حفظ لقطة' : 'Capture Snapshot'}</span>
          </button>
        </form>
      </div>

      {/* Snapshots List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-400" />
          <span>{isAr ? 'النسخ المحفوظة سابقاً' : 'Stored Snapshots'}</span>
        </h3>

        {snapshots.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
            <History className="h-10 w-10 text-slate-800 mx-auto" />
            <p className="text-sm text-slate-500">{isAr ? 'لا يوجد نسخ احتياطية محفوظة حالياً.' : 'No snapshots stored yet.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {snapshots.map(snapshot => (
              <div
                key={snapshot.id}
                className="group p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-indigo-400 group-hover:border-indigo-500/30 transition-colors">
                    <FileJson className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{isAr ? snapshot.labelAr : snapshot.labelEn}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(snapshot.timestamp).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(snapshot.timestamp).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onRestoreSnapshot(snapshot)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all cursor-pointer active:scale-95"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>{isAr ? 'استعادة الحالة' : 'Restore State'}</span>
                  </button>
                  <button
                    onClick={() => onDeleteSnapshot(snapshot.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title={isAr ? 'حذف' : 'Delete'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warning Box */}
      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/80 leading-relaxed">
          <span className="font-bold">{isAr ? 'تنبيه:' : 'Note:'}</span> {isAr 
            ? 'استعادة نسخة قديمة سيؤدي إلى مسح كافة التعديلات الحالية غير المحفوظة. يرجى التأكد من حفظ لقطة (Snapshot) للحالة الحالية إذا كنت بحاجة إليها لاحقاً.' 
            : 'Restoring a snapshot will overwrite all unsaved current modifications. Ensure you capture a snapshot of your current work if you might need it later.'}
        </p>
      </div>
    </div>
  );
};
