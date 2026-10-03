import React, { useState } from 'react';
import {
  Cpu,
  Search,
  CheckCircle2,
  Shield,
  Sparkles,
  Terminal,
  FileCode,
  Eye,
  Columns,
  SplitSquareVertical,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  FileDiff,
  AlertTriangle,
  Info,
  Lock,
  ShieldAlert,
  Zap,
  Radio,
} from 'lucide-react';
import { Language, t } from '../../i18n/translations';
import { CodePatch } from '../../types/apk';

interface PatchesTabProps {
  lang: Language;
  patches: CodePatch[];
  onTogglePatch: (patchId: string) => void;
  onSearchDexStrings: (query: string) => { matchCount: number; results: string[] };
}

export const PatchesTab: React.FC<PatchesTabProps> = ({
  lang,
  patches,
  onTogglePatch,
  onSearchDexStrings,
}) => {
  const strings = t[lang];
  const isAr = lang === 'ar';
  const [searchDexQuery, setSearchDexQuery] = useState('');
  const [dexSearchResults, setDexSearchResults] = useState<{ matchCount: number; results: string[] } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Patch Preview Diff Modal State
  const [previewPatch, setPreviewPatch] = useState<CodePatch | null>(null);
  const [diffViewMode, setDiffViewMode] = useState<'sideBySide' | 'unified'>('sideBySide');
  const [activeCategory, setActiveCategory] = useState<'all' | 'security' | 'ads' | 'network'>('all');

  const filteredPatches = patches.filter(p => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'security' && (p.id.includes('root') || p.id.includes('auth') || p.id.includes('signature'))) return true;
    if (activeCategory === 'ads' && (p.id.includes('ads') || p.titleEn.toLowerCase().includes('ad'))) return true;
    if (activeCategory === 'network' && (p.id.includes('ssl') || p.id.includes('api') || p.id.includes('url'))) return true;
    return false;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchDexQuery.trim()) return;
    const res = onSearchDexStrings(searchDexQuery.trim());
    setDexSearchResults(res);
  };

  const handleToggle = (id: string) => {
    onTogglePatch(id);
    setToastMessage(isAr ? 'تم تحديث حالة الترقيع!' : 'Patch state toggled!');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Helper to get realistic original and modified diff blocks
  const getPatchDiff = (patch: CodePatch) => {
    if (patch.originalCodeSnippet && patch.modifiedCodeSnippet) {
      return {
        original: patch.originalCodeSnippet,
        modified: patch.modifiedCodeSnippet,
        explanation: isAr
          ? (patch.diffExplanationAr || 'استبدال شفرات التحقق بإرجاع قيمة ثابتة لتخطي الحماية.')
          : (patch.diffExplanationEn || 'Replaced validation logic with constant return value to bypass protection.'),
      };
    }

    if (patch.id.includes('ssl') || patch.titleEn.toLowerCase().includes('ssl')) {
      return {
        original: `.method public checkServerTrusted([Ljava/security/cert/X509Certificate;Ljava/lang/String;)V
    .registers 5
    # Enforces strict certificate pinning against remote authority
    invoke-virtual {p0, p1, p2}, Ljavax/net/ssl/X509TrustManager;->checkServerTrusted([Ljava/security/cert/X509Certificate;Ljava/lang/String;)V
    invoke-direct {p0, p1}, Lcom/adcb/egypt/mobilebanking/SecurityPinning;->validatePinning([Ljava/security/cert/X509Certificate;)Z
    move-result v0
    if-nez v0, :cond_fail
    return-void
    :cond_fail
    new-instance v1, Ljava/security/cert/CertificateException;
    const-string v2, "Strict SSL Pinning verification failed: untrusted cert"
    invoke-direct {v1, v2}, Ljava/security/cert/CertificateException;-><init>(Ljava/lang/String;)V
    throw v1
.end method`,
        modified: `.method public checkServerTrusted([Ljava/security/cert/X509Certificate;Ljava/lang/String;)V
    .registers 3
    # [APK STUDIO PATCH] Strict pinning disabled for local proxy & offline inspection
    # All remote certificates and self-signed local proxies are trusted seamlessly
    return-void
.end method`,
        explanation: isAr
          ? 'تم استبدال دالة checkServerTrusted بتعليمات No-Op (return-void مباشر)، مما يعطل رفض شهادات الـ SSL ويسمح باعتراض وفحص الطلبات محلياً.'
          : 'checkServerTrusted method emptied into a no-op return-void instruction, completely bypassing SSL certificate verification errors.',
      };
    }

    if (patch.id.includes('root') || patch.titleEn.toLowerCase().includes('root')) {
      return {
        original: `.method public isDeviceRooted()Z
    .registers 4
    # Checks for Superuser.apk and su binary in standard system binaries
    new-instance v0, Ljava/io/File;
    const-string v1, "/system/xbin/su"
    invoke-direct {v0, v1}, Ljava/io/File;-><init>(Ljava/lang/String;)V
    invoke-virtual {v0}, Ljava/io/File;->exists()Z
    move-result v2
    if-eqz v2, :cond_clean
    const/4 v3, 0x1
    return v3
    :cond_clean
    const/4 v3, 0x0
    return v3
.end method`,
        modified: `.method public isDeviceRooted()Z
    .registers 2
    # [APK STUDIO PATCH] Forced clean report: device is reported unrooted
    const/4 v0, 0x0
    return v0
.end method`,
        explanation: isAr
          ? 'استبدال فحص ملفات /system/xbin/su و Superuser بإرجاع ثابت 0x0 (False)، لمنع التطبيق من الإغلاق الإجباري على الأجهزة المعدلة ومحاكيات الكمبيوتر.'
          : 'Replaced /system/xbin/su checks with static 0x0 return value, preventing force-close on rooted devices and emulators.',
      };
    }

    if (patch.id.includes('offline') || patch.id.includes('server') || patch.id.includes('bypass')) {
      return {
        original: `.method public verifyLicenseOnline(Ljava/lang/String;)Z
    .registers 4
    invoke-static {}, Lcom/edu/smartportal/NetworkUtils;->isOnline()Z
    move-result v0
    if-nez v0, :cond_check
    const/4 v1, 0x0
    return v1
    :cond_check
    invoke-direct {p0, p1}, Lcom/edu/smartportal/AuthService;->queryRemoteServer(Ljava/lang/String;)Z
    move-result v1
    return v1
.end method`,
        modified: `.method public verifyLicenseOnline(Ljava/lang/String;)Z
    .registers 2
    # [APK STUDIO PATCH] Enforce standalone offline authorization
    const/4 v0, 0x1
    return v0
.end method`,
        explanation: isAr
          ? 'استبدال فحص الاتصال بالسيرفر الخارجي بإرجاع ثابت 0x1 (True)، مما يسمح للتطبيق بالعمل أوفلاين كلياً دون الحاجة لاتصال بالإنترنت.'
          : 'Replaced remote server verification check with static 0x1 (True) return, enabling complete offline standalone operation.',
      };
    }

    return {
      original: `# Original Smali / Code Block:
.method public checkPermission()Z
    .registers 3
    invoke-direct {p0}, LValidator;->performCheck()Z
    move-result v0
    return v0
.end method`,
      modified: `# Patched Smali / Code Block:
.method public checkPermission()Z
    .registers 3
    # [APK STUDIO PATCH] Constant bypass injection
    const/4 v0, 0x1
    return v0
.end method`,
      explanation: isAr
        ? 'تم استبدال شفرات التحقق بشرط إرجاع نجاح دائم لتخطي القيود البرمجية.'
        : 'Replaced validation instructions with constant success return value to bypass constraints.',
    };
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-white">
                {strings.patchesTab.title}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Smali & Bytecode Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {strings.patchesTab.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono text-emerald-400 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            {patches.filter(p => p.isApplied).length} {strings.patchesTab.activePatches}
          </span>
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2 p-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DEX String Finder */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
          <Search className="h-4 w-4 text-emerald-400" />
          <span>{strings.patchesTab.dexStringFinder}</span>
        </h3>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder={strings.patchesTab.searchDexPlaceholder}
            value={searchDexQuery}
            onChange={(e) => setSearchDexQuery(e.target.value)}
            className="flex-1 font-mono text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-hidden focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            {isAr ? 'بحث في DEX' : 'Search DEX'}
          </button>
        </form>

        {dexSearchResults && (
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono">
            <span className="text-emerald-400 font-bold">{dexSearchResults.matchCount}</span>{' '}
            <span className="text-slate-400">{strings.patchesTab.dexMatchesFound}:</span>
            <ul className="mt-2 space-y-1 text-slate-300">
              {dexSearchResults.results.map((r, i) => (
                <li key={i} className="truncate text-slate-300">• {r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Categories / One-Tap Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
            activeCategory === 'all' 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10' 
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 cursor-pointer'
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>{isAr ? 'الكل' : 'All Patches'}</span>
        </button>
        <button
          onClick={() => setActiveCategory('security')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
            activeCategory === 'security' 
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-500/10' 
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 cursor-pointer'
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>{isAr ? 'حماية (Security)' : 'Security Bypasses'}</span>
        </button>
        <button
          onClick={() => setActiveCategory('ads')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
            activeCategory === 'ads' 
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10' 
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 cursor-pointer'
          }`}
        >
          <Radio className="h-4 w-4" />
          <span>{isAr ? 'إعلانات (Ads)' : 'Ad Removal'}</span>
        </button>
        <button
          onClick={() => setActiveCategory('network')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
            activeCategory === 'network' 
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-lg shadow-blue-500/10' 
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 cursor-pointer'
          }`}
        >
          <Cpu className="h-4 w-4" />
          <span>{isAr ? 'شبكة (Network)' : 'Network Mods'}</span>
        </button>
      </div>

      {/* Patches List */}
      <div className="space-y-4">
        {filteredPatches.map((patch) => {
          const diffData = getPatchDiff(patch);

          return (
            <div
              key={patch.id}
              className={`p-5 rounded-xl border transition-colors space-y-3 ${
                patch.isApplied
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-md ${patch.isApplied ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                    <FileCode className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{isAr ? patch.titleAr : patch.titleEn}</span>
                      <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono ${
                        patch.category === 'security'
                          ? 'bg-rose-500/20 text-rose-300'
                          : patch.category === 'network'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {patch.category}
                      </span>
                    </h4>
                    <span className="font-mono text-[10px] text-slate-500 block">{patch.affectedFile}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Patch Preview Diff Button */}
                  <button
                    onClick={() => setPreviewPatch(patch)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>{isAr ? 'معاينة الفروقات (Diff)' : 'Preview Diff'}</span>
                  </button>

                  {/* Apply / Toggle Button */}
                  <button
                    onClick={() => handleToggle(patch.id)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      patch.isApplied
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {patch.isApplied ? (isAr ? 'ترقيع مفعل ✓' : 'Patch Applied ✓') : strings.patchesTab.applyPatch}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {isAr ? patch.descAr : patch.descEn}
              </p>

              {/* Code Snippet Quick Box */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-indigo-300 overflow-x-auto">
                <pre>{patch.patchCodeSnippet}</pre>
              </div>
            </div>
          );
        })}
      </div>

      {/* PATCH PREVIEW UTILITY MODAL (Side-by-Side Diff) */}
      {previewPatch && (() => {
        const diff = getPatchDiff(previewPatch);
        const originalLines = diff.original.split('\n');
        const modifiedLines = diff.modified.split('\n');

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <FileDiff className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">
                        {isAr ? 'معاينة فروقات الترقيع (Patch Diff Preview)' : 'Patch Side-by-Side Diff Preview'}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {previewPatch.affectedFile.split('/').pop()}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {isAr ? previewPatch.titleAr : previewPatch.titleEn}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mode switcher */}
                  <div className="flex items-center p-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs">
                    <button
                      onClick={() => setDiffViewMode('sideBySide')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        diffViewMode === 'sideBySide'
                          ? 'bg-indigo-500 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Columns className="h-3.5 w-3.5" />
                      <span>{isAr ? 'جنباً إلى جنب' : 'Side-by-Side'}</span>
                    </button>
                    <button
                      onClick={() => setDiffViewMode('unified')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        diffViewMode === 'unified'
                          ? 'bg-indigo-500 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <SplitSquareVertical className="h-3.5 w-3.5" />
                      <span>{isAr ? 'مدمج (Unified)' : 'Unified'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setPreviewPatch(null)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Diff Explanation Banner */}
              <div className="px-5 py-3 border-b border-slate-800 bg-indigo-950/20 flex items-start gap-2.5 shrink-0 text-xs text-indigo-200">
                <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-white block mb-0.5">
                    {isAr ? 'شرح التغيير البرمجي قبل التطبيق:' : 'Bytecode Change Breakdown:'}
                  </strong>
                  <span>{diff.explanation}</span>
                </div>
              </div>

              {/* Diff Viewer Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {diffViewMode === 'sideBySide' ? (
                  /* Side-by-Side Comparison */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Original Code */}
                    <div className="rounded-xl border border-rose-950/60 bg-slate-950/90 overflow-hidden">
                      <div className="px-3.5 py-2 border-b border-rose-900/30 bg-rose-950/20 flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-300 font-mono flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          <span>{isAr ? 'الكود الأصلي (Original Smali)' : 'Original Smali Code'}</span>
                        </span>
                        <span className="text-[10px] font-mono text-rose-400/80">
                          {originalLines.length} {isAr ? 'أسطر' : 'lines'}
                        </span>
                      </div>
                      <div className="p-3 font-mono text-xs overflow-x-auto text-rose-200/90 divide-y divide-rose-950/20">
                        {originalLines.map((line, idx) => (
                          <div key={idx} className="flex gap-3 py-0.5 hover:bg-rose-950/30 px-1 rounded">
                            <span className="text-[10px] text-rose-500/60 w-6 text-right select-none shrink-0 font-mono">
                              {idx + 1}
                            </span>
                            <span className="text-rose-400 select-none mr-1">-</span>
                            <pre className="font-mono whitespace-pre">{line}</pre>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Modified Code */}
                    <div className="rounded-xl border border-emerald-950/60 bg-slate-950/90 overflow-hidden">
                      <div className="px-3.5 py-2 border-b border-emerald-900/30 bg-emerald-950/20 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300 font-mono flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>{isAr ? 'الكود المعدل بعد الترقيع (Patched Smali)' : 'Patched Smali Code'}</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400/80">
                          {modifiedLines.length} {isAr ? 'أسطر' : 'lines'}
                        </span>
                      </div>
                      <div className="p-3 font-mono text-xs overflow-x-auto text-emerald-200/90 divide-y divide-emerald-950/20">
                        {modifiedLines.map((line, idx) => (
                          <div key={idx} className="flex gap-3 py-0.5 hover:bg-emerald-950/30 px-1 rounded">
                            <span className="text-[10px] text-emerald-500/60 w-6 text-right select-none shrink-0 font-mono">
                              {idx + 1}
                            </span>
                            <span className="text-emerald-400 select-none mr-1">+</span>
                            <pre className="font-mono whitespace-pre">{line}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Unified Comparison */
                  <div className="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden font-mono text-xs">
                    <div className="px-3.5 py-2 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between text-slate-400">
                      <span>{previewPatch.affectedFile}</span>
                      <span className="text-[10px] font-mono">Unified Diff Format</span>
                    </div>
                    <div className="p-3 space-y-0.5 overflow-x-auto">
                      {originalLines.map((l, idx) => (
                        <div key={`orig-${idx}`} className="flex gap-2 text-rose-300 bg-rose-950/20 px-2 py-0.5 rounded">
                          <span className="text-rose-500 select-none w-6 text-right font-mono">-{idx + 1}</span>
                          <span className="select-none">-</span>
                          <pre className="whitespace-pre">{l}</pre>
                        </div>
                      ))}
                      <div className="border-b border-dashed border-slate-800 my-2"></div>
                      {modifiedLines.map((l, idx) => (
                        <div key={`mod-${idx}`} className="flex gap-2 text-emerald-300 bg-emerald-950/20 px-2 py-0.5 rounded">
                          <span className="text-emerald-500 select-none w-6 text-right font-mono">+{idx + 1}</span>
                          <span className="select-none">+</span>
                          <pre className="whitespace-pre">{l}</pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {isAr ? 'حالة الترقيع الحالية:' : 'Current Patch Status:'}
                  </span>
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                    previewPatch.isApplied
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {previewPatch.isApplied
                      ? (isAr ? 'مُفعّل وجاهز للبناء ✓' : 'Applied & Active ✓')
                      : (isAr ? 'غير مفعّل' : 'Not Applied')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewPatch(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    {isAr ? 'إغلاق' : 'Close'}
                  </button>

                  <button
                    onClick={() => {
                      handleToggle(previewPatch.id);
                      setPreviewPatch(prev => prev ? { ...prev, isApplied: !prev.isApplied } : null);
                    }}
                    className={`flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm ${
                      previewPatch.isApplied
                        ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                        : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                    }`}
                  >
                    <Check className="h-4 w-4" />
                    <span>
                      {previewPatch.isApplied
                        ? (isAr ? 'إلغاء تفعيل الترقيع' : 'Revert Patch')
                        : (isAr ? 'تطبيق هذا الترقيع الآن ⚡' : 'Apply Patch Now ⚡')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
