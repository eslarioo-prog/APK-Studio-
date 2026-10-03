import React, { useState } from 'react';
import { Wifi, WifiOff, Zap, CheckCircle2, ShieldAlert, Globe, Server, ArrowRight, ArrowLeft, DownloadCloud } from 'lucide-react';
import { Language, t } from '../../i18n/translations';
import { ApkMetadata } from '../../types/apk';

interface OnlineToOfflineTabProps {
  lang: Language;
  metadata: ApkMetadata;
  onUpdateMetadata: (updated: Partial<ApkMetadata>) => void;
  detectedEndpoints: string[];
  onUpdateEndpoints: (oldUrl: string, newUrl: string) => void;
  onApplyFullOffline: () => void;
  isOfflineMode: boolean;
  onNavigateToAssetBundler?: () => void;
}

export const OnlineToOfflineTab: React.FC<OnlineToOfflineTabProps> = ({
  lang,
  metadata,
  onUpdateMetadata,
  detectedEndpoints,
  onUpdateEndpoints,
  onApplyFullOffline,
  isOfflineMode,
  onNavigateToAssetBundler,
}) => {
  const strings = t[lang];
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  const [options, setOptions] = useState({
    bypassServerPing: true,
    mockAuthSuccess: true,
    redirectApiToLocal: true,
    removeInternetLock: true,
    unlockOfflineCache: true,
    bypassPlayBilling: true,
  });

  const [endpointsMap, setEndpointsMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    detectedEndpoints.forEach(ep => {
      map[ep] = ep.replace(/https?:\/\/[^/]+/i, 'http://127.0.0.1:8080');
    });
    return map;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFullConvert = () => {
    onApplyFullOffline();
    // Update endpoints
    Object.entries(endpointsMap).forEach(([oldUrl, newUrl]) => {
      onUpdateEndpoints(oldUrl, newUrl);
    });
    // Ensure cleartext traffic is allowed for 127.0.0.1
    onUpdateMetadata({
      usesCleartextTraffic: true,
    });
    setToastMessage(strings.onlineOfflineTab.convertSuccess);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveEndpoints = () => {
    Object.entries(endpointsMap).forEach(([oldUrl, newUrl]) => {
      onUpdateEndpoints(oldUrl, newUrl);
    });
    setToastMessage(lang === 'ar' ? 'تم تحديث روابط التوجيه بنجاح!' : 'Endpoint redirects updated successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg border ${isOfflineMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
            {isOfflineMode ? <WifiOff className="h-6 w-6" /> : <Wifi className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-white">
                {strings.onlineOfflineTab.title}
              </h2>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${isOfflineMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                {isOfflineMode ? (lang === 'ar' ? 'أوفلاين محلي نشط' : 'Offline Mode Active') : (lang === 'ar' ? 'أونلاين سحابي' : 'Online Server Mode')}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {strings.onlineOfflineTab.subtitle}
            </p>
          </div>
        </div>

        {/* 1-Click Convert Button */}
        <button
          onClick={handleFullConvert}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-emerald-500/10 shrink-0 cursor-pointer"
        >
          <Zap className="h-4 w-4" />
          <span>{strings.onlineOfflineTab.quickConvertBtn}</span>
        </button>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2 p-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Online Remote Asset Puller Suggestion Banner */}
      <div className="p-4 rounded-xl border border-indigo-900/60 bg-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
            <DownloadCloud className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">
              {lang === 'ar'
                ? 'سحب الملفات والبيانات من السيرفر الأصلي أونلاين قبل التعديل'
                : 'Pull & Cache Data from Live Remote Server Before Modding'}
            </span>
            <span className="text-[11px] text-slate-400">
              {lang === 'ar'
                ? 'يمكنك سحب بيانات الحسابات، قواعد بيانات الفروع، والملفات المحملة أونلاين لتضمينها في مجلد assets/ أوفلاين.'
                : 'Extract real profiles, JSON datasets, and theme bundles from original endpoints to package offline.'}
            </span>
          </div>
        </div>

        {onNavigateToAssetBundler && (
          <button
            type="button"
            onClick={onNavigateToAssetBundler}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-indigo-400 hover:bg-indigo-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
          >
            <span>{lang === 'ar' ? 'أداة سحب الملفات أونلاين ⚡' : 'Open Remote Puller ⚡'}</span>
            <ArrowIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option 1: Bypass Ping */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-start justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold text-slate-200 mb-1">
              {strings.onlineOfflineTab.options.bypassServerPing}
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {strings.onlineOfflineTab.options.bypassServerPingDesc}
            </p>
          </div>
          <button
            onClick={() => toggleOption('bypassServerPing')}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${options.bypassServerPing ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${options.bypassServerPing ? (lang === 'ar' ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Option 2: Mock Auth Success */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-start justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold text-slate-200 mb-1">
              {strings.onlineOfflineTab.options.mockAuthSuccess}
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {strings.onlineOfflineTab.options.mockAuthSuccessDesc}
            </p>
          </div>
          <button
            onClick={() => toggleOption('mockAuthSuccess')}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${options.mockAuthSuccess ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${options.mockAuthSuccess ? (lang === 'ar' ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Option 3: Redirect API to Localhost */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-start justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold text-slate-200 mb-1">
              {strings.onlineOfflineTab.options.redirectApiToLocal}
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {strings.onlineOfflineTab.options.redirectApiToLocalDesc}
            </p>
          </div>
          <button
            onClick={() => toggleOption('redirectApiToLocal')}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${options.redirectApiToLocal ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${options.redirectApiToLocal ? (lang === 'ar' ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Option 4: Remove Internet Force-Close */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-start justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold text-slate-200 mb-1">
              {strings.onlineOfflineTab.options.removeInternetLock}
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {strings.onlineOfflineTab.options.removeInternetLockDesc}
            </p>
          </div>
          <button
            onClick={() => toggleOption('removeInternetLock')}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${options.removeInternetLock ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${options.removeInternetLock ? (lang === 'ar' ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Option 5: Local Storage Cache */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-start justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold text-slate-200 mb-1">
              {strings.onlineOfflineTab.options.unlockOfflineCache}
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {strings.onlineOfflineTab.options.unlockOfflineCacheDesc}
            </p>
          </div>
          <button
            onClick={() => toggleOption('unlockOfflineCache')}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${options.unlockOfflineCache ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${options.unlockOfflineCache ? (lang === 'ar' ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Option 6: In-App Billing */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-start justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold text-slate-200 mb-1">
              {strings.onlineOfflineTab.options.bypassPlayBilling}
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {strings.onlineOfflineTab.options.bypassPlayBillingDesc}
            </p>
          </div>
          <button
            onClick={() => toggleOption('bypassPlayBilling')}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${options.bypassPlayBilling ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${options.bypassPlayBilling ? (lang === 'ar' ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Discovered Server Endpoints Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-slate-200">
              {strings.onlineOfflineTab.detectedEndpoints}
            </h3>
          </div>
          <button
            onClick={handleSaveEndpoints}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
          >
            {strings.onlineOfflineTab.saveOfflineSettings}
          </button>
        </div>

        {detectedEndpoints.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            {lang === 'ar' ? 'لم يتم العثور على روابط خارجية صريحة - التطبيق مهيأ بالفعل للعمل محلياً' : 'No explicit remote endpoints detected - App is configured for local execution'}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {detectedEndpoints.map((url, idx) => (
              <div key={idx} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="font-mono text-slate-300 break-all flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Remote</span>
                  <span>{url}</span>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <ArrowIcon className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <input
                    type="text"
                    value={endpointsMap[url] || ''}
                    onChange={(e) => setEndpointsMap({ ...endpointsMap, [url]: e.target.value })}
                    className="w-full md:w-72 font-mono text-xs px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-emerald-300 focus:outline-hidden focus:border-emerald-500"
                    placeholder="http://127.0.0.1:8080"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
