import React, { useState } from 'react';
import { FileCode2, Copy, Save, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { Language, t } from '../../i18n/translations';
import { ApkMetadata } from '../../types/apk';

interface ManifestTabProps {
  lang: Language;
  metadata: ApkMetadata;
  onUpdateMetadata: (updated: Partial<ApkMetadata>) => void;
}

export const ManifestTab: React.FC<ManifestTabProps> = ({
  lang,
  metadata,
  onUpdateMetadata,
}) => {
  const strings = t[lang];
  const isAr = lang === 'ar';
  const [activeSubTab, setActiveSubTab] = useState<'visual' | 'xml'>('visual');
  const [rawXml, setRawXml] = useState(metadata.rawManifestXml);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCloneApp = () => {
    const clonedPackage = metadata.packageName.endsWith('.clone')
      ? metadata.packageName
      : `${metadata.packageName}.clone`;
    const clonedName = `${metadata.appName} (Clone)`;
    onUpdateMetadata({
      packageName: clonedPackage,
      appName: clonedName,
    });
    setToastMessage(isAr ? 'تم استنساخ معرف الحزمة بنجاح! يمكنك الآن تثبيته بجانب التطبيق الأصلي.' : 'Package ID cloned! Ready for side-by-side installation.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveVisual = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage(strings.manifestTab.saveManifest + ' ✓');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveXml = () => {
    onUpdateMetadata({ rawManifestXml: rawXml });
    setToastMessage(isAr ? 'تم حفظ كود XML بنجاح!' : 'Raw XML saved successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileCode2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white mb-1">
              {strings.manifestTab.title}
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {strings.manifestTab.subtitle}
            </p>
          </div>
        </div>

        {/* Clone App Button */}
        <button
          onClick={handleCloneApp}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap cursor-pointer shadow-sm"
          title={strings.manifestTab.cloneAppTip}
        >
          <Copy className="h-4 w-4 text-emerald-400" />
          <span>{strings.manifestTab.cloneBtn}</span>
        </button>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2 p-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('visual')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'visual'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {strings.manifestTab.visualTab}
        </button>
        <button
          onClick={() => setActiveSubTab('xml')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'xml'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {strings.manifestTab.rawXmlTab}
        </button>
      </div>

      {/* Visual Form */}
      {activeSubTab === 'visual' ? (
        <form onSubmit={handleSaveVisual} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* App Name */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                {strings.manifestTab.appName}
              </label>
              <input
                type="text"
                value={metadata.appName}
                onChange={(e) => onUpdateMetadata({ appName: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* Package Name */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  {strings.manifestTab.packageName}
                </label>
                <span className="text-[10px] text-slate-400">ID الفريد</span>
              </div>
              <input
                type="text"
                value={metadata.packageName}
                onChange={(e) => onUpdateMetadata({ packageName: e.target.value })}
                className="w-full font-mono text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-emerald-300 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* Version Name */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                {strings.manifestTab.versionName}
              </label>
              <input
                type="text"
                value={metadata.versionName}
                onChange={(e) => onUpdateMetadata({ versionName: e.target.value })}
                className="w-full font-mono text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* Version Code */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                {strings.manifestTab.versionCode}
              </label>
              <input
                type="number"
                value={metadata.versionCode}
                onChange={(e) => onUpdateMetadata({ versionCode: parseInt(e.target.value, 10) || 1 })}
                className="w-full font-mono text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* Min SDK */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                {strings.manifestTab.minSdk}
              </label>
              <select
                value={metadata.minSdk}
                onChange={(e) => onUpdateMetadata({ minSdk: parseInt(e.target.value, 10) })}
                className="w-full font-mono text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-hidden"
              >
                <option value={21}>Android 5.0 Lollipop (API 21)</option>
                <option value={23}>Android 6.0 Marshmallow (API 23)</option>
                <option value={24}>Android 7.0 Nougat (API 24)</option>
                <option value={26}>Android 8.0 Oreo (API 26)</option>
                <option value={28}>Android 9.0 Pie (API 28)</option>
                <option value={29}>Android 10 (API 29)</option>
                <option value={30}>Android 11 (API 30)</option>
                <option value={31}>Android 12 (API 31)</option>
                <option value={33}>Android 13 (API 33)</option>
                <option value={34}>Android 14 (API 34)</option>
              </select>
            </div>

            {/* Target SDK */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                {strings.manifestTab.targetSdk}
              </label>
              <select
                value={metadata.targetSdk}
                onChange={(e) => onUpdateMetadata({ targetSdk: parseInt(e.target.value, 10) })}
                className="w-full font-mono text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-hidden"
              >
                <option value={28}>Android 9.0 (API 28)</option>
                <option value={30}>Android 11 (API 30)</option>
                <option value={33}>Android 13 (API 33)</option>
                <option value={34}>Android 14 (API 34)</option>
                <option value={35}>Android 15 (API 35)</option>
              </select>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Debuggable Flag */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-200">
                  {strings.manifestTab.debuggable}
                </h4>
                <p className="text-[10px] text-slate-400">android:debuggable</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateMetadata({ debuggable: !metadata.debuggable })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${metadata.debuggable ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${metadata.debuggable ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Allow Backup */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-200">
                  {strings.manifestTab.allowBackup}
                </h4>
                <p className="text-[10px] text-slate-400">android:allowBackup</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateMetadata({ allowBackup: !metadata.allowBackup })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${metadata.allowBackup ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${metadata.allowBackup ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Cleartext HTTP Traffic */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-200">
                  {strings.manifestTab.cleartext}
                </h4>
                <p className="text-[10px] text-slate-400">usesCleartextTraffic</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateMetadata({ usesCleartextTraffic: !metadata.usesCleartextTraffic })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${metadata.usesCleartextTraffic ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${metadata.usesCleartextTraffic ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={handleSaveXml}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isAr ? 'حفظ كود XML' : 'Save XML'}</span>
            </button>
          </div>
          <textarea
            value={rawXml}
            onChange={(e) => setRawXml(e.target.value)}
            rows={18}
            spellCheck={false}
            className="w-full font-mono text-xs leading-relaxed p-4 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-hidden focus:border-emerald-500 selection:bg-emerald-500/30 resize-y"
          />
        </div>
      )}
    </div>
  );
};
