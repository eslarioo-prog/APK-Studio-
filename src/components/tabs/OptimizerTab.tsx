import React, { useState, useEffect } from 'react';
import {
  Zap,
  Shield,
  FileCode,
  Sparkles,
  CheckCircle2,
  Lock,
  Layers,
  Trash2,
  Eye,
  Sliders,
  Play,
  RotateCcw,
  Download,
  Copy,
  Check,
  Search,
  ArrowRight,
  ArrowLeft,
  Columns,
  Code2,
  FileDiff,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { Language } from '../../i18n/translations';
import { ApkMetadata } from '../../types/apk';
import { DecompiledApkProject } from '../../utils/apkDecompiler';
import { OptimizerConfig, OptimizationResult } from '../../types/optimizer';
import { optimizeSmaliCode } from '../../utils/smaliOptimizer';

interface OptimizerTabProps {
  lang: Language;
  metadata: ApkMetadata;
  decompiledProject: DecompiledApkProject | null;
  onUpdateDecompiledClasses?: (updatedClasses: { className: string; packagePath: string; smaliCode: string; javaCode: string }[]) => void;
}

export const OptimizerTab: React.FC<OptimizerTabProps> = ({
  lang,
  metadata,
  decompiledProject,
  onUpdateDecompiledClasses,
}) => {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  // Sample classes fallback if project not decompiled yet
  const availableClasses = (decompiledProject?.decompiledClasses && decompiledProject.decompiledClasses.length > 0)
    ? decompiledProject.decompiledClasses
    : [
        {
          className: 'MainActivity',
          packagePath: `${metadata.packageName}.MainActivity`,
          javaCode: `package ${metadata.packageName};\npublic class MainActivity extends Activity {\n    String server = "https://api.banking.com/v4/auth";\n}`,
          smaliCode: `.class public L${metadata.packageName.replace(/\./g, '/')}/MainActivity;
.super Landroid/app/Activity;
.source "MainActivity.java"

.method public onCreate(Landroid/os/Bundle;)V
    .registers 4
    .prologue
    .line 24
    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V
    .line 25
    const-string v0, "MainActivity"
    const-string v1, "Debug: Initializing secure banking portal"
    invoke-static {v0, v1}, Landroid/util/Log;->d(Ljava/lang/String;Ljava/lang/String;)I
    .line 28
    const-string v2, "https://api.banking.com/v4/auth"
    const-string v3, "SECRET_SESSION_API_KEY_8829"
    invoke-static {v2, v3}, Lcom/security/AuthService;->init(Ljava/lang/String;Ljava/lang/String;)V
    .line 32
    return-void
    # Dead unreachable instruction block below
    nop
    const-string v0, "Unreachable code dead block"
    return-void
.end method`,
        },
        {
          className: 'NetworkManager',
          packagePath: `${metadata.packageName}.NetworkManager`,
          javaCode: `package ${metadata.packageName};\npublic class NetworkManager {\n}`,
          smaliCode: `.class public L${metadata.packageName.replace(/\./g, '/')}/NetworkManager;
.super Ljava/lang/Object;
.source "NetworkManager.java"

.method public static executeRequest(Ljava/lang/String;)Ljava/lang/String;
    .registers 5
    .prologue
    .line 40
    const-string v0, "NetworkManager"
    const-string v1, "Pinging remote host..."
    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I
    .line 42
    const-string v2, "https://banking-gateway.internal.net/sync/data.json"
    const-string v3, "SELECT * FROM secure_tokens WHERE id=1"
    .line 45
    return-object v2
    # Dead unreachable code
    nop
    move-result v0
    return-object v0
.end method`,
        },
      ];

  const [selectedClassIndex, setSelectedClassIndex] = useState<number>(0);
  const currentClass = availableClasses[selectedClassIndex] || availableClasses[0];

  // Configuration State
  const [config, setConfig] = useState<OptimizerConfig>({
    preset: 'max_hardening',
    stripDebugLines: true,
    stripLogging: true,
    eliminateUnusedMethods: true,
    eliminateUnreachableInstructions: true,
    obfuscateStrings: true,
    stringObfuscationMode: 'xor',
    xorKey: 0x5a,
    targetStringsCategory: 'sensitive_only',
  });

  // Optimization Result State
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'diff' | 'stringsMap' | 'optimizedOnly'>('diff');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Run optimization on the selected class
  const handleRunOptimization = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const res = optimizeSmaliCode(currentClass.className, currentClass.smaliCode, config);
      setOptimizationResult(res);
      setIsProcessing(false);
      showToast(
        isAr
          ? `تم تحسين ${currentClass.className}: إزالة ${res.deadInstructionsStripped} تعليمة ميتة وتمويه ${res.stringsObfuscatedCount} نصوص!`
          : `Optimized ${currentClass.className}: Removed ${res.deadInstructionsStripped} dead instructions & obfuscated ${res.stringsObfuscatedCount} strings!`
      );
    }, 400);
  };

  // Run optimization on initial load or class change
  useEffect(() => {
    const res = optimizeSmaliCode(currentClass.className, currentClass.smaliCode, config);
    setOptimizationResult(res);
  }, [selectedClassIndex, currentClass.className, currentClass.smaliCode]);

  // Apply Preset
  const handleApplyPreset = (preset: 'max_shrink' | 'max_hardening' | 'safe') => {
    let nextConfig: OptimizerConfig;
    if (preset === 'max_shrink') {
      nextConfig = {
        ...config,
        preset: 'max_shrink',
        stripDebugLines: true,
        stripLogging: true,
        eliminateUnusedMethods: true,
        eliminateUnreachableInstructions: true,
        obfuscateStrings: false,
      };
    } else if (preset === 'max_hardening') {
      nextConfig = {
        ...config,
        preset: 'max_hardening',
        stripDebugLines: true,
        stripLogging: true,
        eliminateUnusedMethods: true,
        eliminateUnreachableInstructions: true,
        obfuscateStrings: true,
        stringObfuscationMode: 'xor',
        targetStringsCategory: 'sensitive_only',
      };
    } else {
      nextConfig = {
        ...config,
        preset: 'safe',
        stripDebugLines: true,
        stripLogging: false,
        eliminateUnusedMethods: false,
        eliminateUnreachableInstructions: true,
        obfuscateStrings: false,
      };
    }
    setConfig(nextConfig);
    const res = optimizeSmaliCode(currentClass.className, currentClass.smaliCode, nextConfig);
    setOptimizationResult(res);
    showToast(isAr ? 'تم تطبيق قالب التحسين بنجاح!' : 'Preset applied successfully!');
  };

  // Save optimized smali back into project
  const handleSaveToProject = () => {
    if (!optimizationResult) return;

    if (onUpdateDecompiledClasses) {
      const updated = availableClasses.map((cls, idx) => {
        if (idx === selectedClassIndex) {
          return {
            ...cls,
            smaliCode: optimizationResult.optimizedSmali,
          };
        }
        return cls;
      });
      onUpdateDecompiledClasses(updated);
    }

    showToast(
      isAr
        ? 'تم حفظ كود Smali المحسن والمموه في مشروع التطبيق بنجاح!'
        : 'Optimized Smali code saved to project! Ready for rebuild.'
    );
  };

  // Batch optimize all classes
  const handleOptimizeAllClasses = () => {
    setIsProcessing(true);
    let totalDead = 0;
    let totalObfuscated = 0;
    const updated = availableClasses.map(cls => {
      const res = optimizeSmaliCode(cls.className, cls.smaliCode, config);
      totalDead += res.deadInstructionsStripped;
      totalObfuscated += res.stringsObfuscatedCount;
      return {
        ...cls,
        smaliCode: res.optimizedSmali,
      };
    });

    if (onUpdateDecompiledClasses) {
      onUpdateDecompiledClasses(updated);
    }

    // Refresh current view
    const currentRes = optimizeSmaliCode(currentClass.className, currentClass.smaliCode, config);
    setOptimizationResult(currentRes);

    setTimeout(() => {
      setIsProcessing(false);
      showToast(
        isAr
          ? `تم تحسين كافة الكلاسات (${availableClasses.length}): حذف ${totalDead} تعليمة ميتة وتمويه ${totalObfuscated} نص!`
          : `Batch optimized all ${availableClasses.length} classes: Stripped ${totalDead} dead lines & obfuscated ${totalObfuscated} strings!`
      );
    }, 600);
  };

  const handleCopyCode = () => {
    if (!optimizationResult) return;
    navigator.clipboard.writeText(optimizationResult.optimizedSmali);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadSmali = () => {
    if (!optimizationResult) return;
    const blob = new Blob([optimizationResult.optimizedSmali], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${currentClass.className}_optimized.smali`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(isAr ? 'تم تنزيل ملف Smali المحسن' : 'Downloaded optimized .smali file');
  };

  const originalLines = (optimizationResult?.originalSmali || currentClass.smaliCode).split('\n');
  const optimizedLines = (optimizationResult?.optimizedSmali || currentClass.smaliCode).split('\n');

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-white">
                {isAr
                  ? 'أداة تحسين الكود وتمويه النصوص (Smali Optimizer & String Obfuscator)'
                  : 'Smali Code Optimizer & String Obfuscator'}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                DCE & Bytecode Hardener
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {isAr
                ? 'تنفيذ إزالة الأكواد الميتة (Dead-Code Elimination) وحذف أسطر التصحيح وسجلات Log، وتمويه وتشفير النصوص الحساسة وروابط الـ API بخوارزمية XOR قبل إعادة بناء الـ APK.'
                : 'Strip unreachable dead bytecode, debug line metadata (.line), and console logging statements while obfuscating sensitive string literals using dynamic XOR encryption.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOptimizeAllClasses}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-sm shadow-emerald-500/10 shrink-0"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isProcessing ? (isAr ? 'جاري التحسين...' : 'Optimizing...') : (isAr ? 'تحسين كافة الكلاسات ⚡' : 'Batch Optimize All Classes ⚡')}</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2 p-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. PRESETS BAR */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
        <span className="text-xs font-semibold text-slate-300 block">
          {isAr ? 'قوالب التحسين السريعة (Optimization Presets):' : 'Optimization Presets:'}
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Preset 1: Max Hardening */}
          <div
            onClick={() => handleApplyPreset('max_hardening')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              config.preset === 'max_hardening'
                ? 'border-emerald-500/80 bg-emerald-950/20 shadow-md shadow-emerald-500/10'
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>{isAr ? 'أقصى تشفير وحماية ضد الهندسة العكسية' : 'Max Hardening & Anti-Decompile'}</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                Recommended
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr
                ? 'إزالة الأكواد الميتة والسطور التصحيحية + تشفير نصوص الـ API والروابط الحساسة بـ XOR.'
                : 'Full Dead Code Elimination + XOR cipher on all URLs, tokens, and sensitive strings.'}
            </p>
          </div>

          {/* Preset 2: Max Shrink */}
          <div
            onClick={() => handleApplyPreset('max_shrink')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              config.preset === 'max_shrink'
                ? 'border-indigo-500/80 bg-indigo-950/20 shadow-md shadow-indigo-500/10'
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-indigo-400" />
                <span>{isAr ? 'أقصى تقليص لحجم الـ APK وسرعة التنفيذ' : 'Max Shrink & Speed'}</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                Compact
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr
                ? 'إزالة جميع أسطر .line و .prologue وعبارات Log لتقليل حجم ملف الـ DEX لأدنى حد.'
                : 'Aggressive removal of debug lines, metadata, and logging to shrink DEX bytecode.'}
            </p>
          </div>

          {/* Preset 3: Safe Mode */}
          <div
            onClick={() => handleApplyPreset('safe')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              config.preset === 'safe'
                ? 'border-amber-500/80 bg-amber-950/20 shadow-md shadow-amber-500/10'
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400" />
                <span>{isAr ? 'تحسين آمن ومتوافق (Safe Mode)' : 'Safe Compatible Optimization'}</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                Compatibility
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr
                ? 'إزالة التعليمات الميتة بعد عبارات return دون المساس بنصوص الانعكاس (Reflection).'
                : 'Conservative cleanup without modifying strings to preserve reflection compatibility.'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. OPTIMIZATION SETTINGS & SCOPE CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Controls (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-400" />
              <span>{isAr ? 'خيارات إزالة الكود الميت والتمويه' : 'DCE & Obfuscation Parameters'}</span>
            </h3>
            <button
              onClick={handleRunOptimization}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>{isAr ? 'إعادة التحليل' : 'Re-analyze'}</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* 1. Strip Debug Lines */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-medium block">
                  {isAr ? 'حذف علامات التصحيح (.line / .prologue / .local)' : 'Strip Debug Line Metadata'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Removes source line numbers</span>
              </div>
              <button
                onClick={() => {
                  const val = !config.stripDebugLines;
                  setConfig(c => ({ ...c, stripDebugLines: val, preset: 'max_hardening' }));
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  config.stripDebugLines ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${config.stripDebugLines ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>

            {/* 2. Strip Logging Calls */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-medium block">
                  {isAr ? 'حذف أوامر السجلات والطباعة (Log.d / Log.v / Log.i)' : 'Strip Logging Statements (Log.d / Log.i)'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Prevents console log leaks</span>
              </div>
              <button
                onClick={() => {
                  const val = !config.stripLogging;
                  setConfig(c => ({ ...c, stripLogging: val, preset: 'max_hardening' }));
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  config.stripLogging ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${config.stripLogging ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>

            {/* 3. Strip Unreachable Code */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-medium block">
                  {isAr ? 'حذف الأكواد غير القابلة للوصول (Dead Code Elimination)' : 'Eliminate Unreachable Instructions'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Prunes instructions after return</span>
              </div>
              <button
                onClick={() => {
                  const val = !config.eliminateUnreachableInstructions;
                  setConfig(c => ({ ...c, eliminateUnreachableInstructions: val, preset: 'max_hardening' }));
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  config.eliminateUnreachableInstructions ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${config.eliminateUnreachableInstructions ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>

            {/* 4. String Obfuscation Master Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <span className="text-slate-200 font-medium block flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{isAr ? 'تفعيل تمويه وتشفير النصوص (String Obfuscation)' : 'Enable String Obfuscation'}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Transforms const-string literals</span>
              </div>
              <button
                onClick={() => {
                  const val = !config.obfuscateStrings;
                  setConfig(c => ({ ...c, obfuscateStrings: val, preset: 'max_hardening' }));
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  config.obfuscateStrings ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${config.obfuscateStrings ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>

            {config.obfuscateStrings && (
              <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/40 space-y-2.5 animate-fadeIn">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-300 font-medium block mb-1">
                      {isAr ? 'خوارزمية التمويه:' : 'Obfuscation Algorithm:'}
                    </label>
                    <select
                      value={config.stringObfuscationMode}
                      onChange={(e) => setConfig(c => ({ ...c, stringObfuscationMode: e.target.value as any }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-[11px]"
                    >
                      <option value="xor">XOR Dynamic Cipher (0x5A)</option>
                      <option value="base64">Base64 + Salt Key Layer</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-300 font-medium block mb-1">
                      {isAr ? 'النطاق المستهدف:' : 'Target Scope:'}
                    </label>
                    <select
                      value={config.targetStringsCategory}
                      onChange={(e) => setConfig(c => ({ ...c, targetStringsCategory: e.target.value as any }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-[11px]"
                    >
                      <option value="sensitive_only">{isAr ? 'النصوص الحساسة (روابط، مفاتيح، SQL)' : 'Sensitive Strings (URLs, APIs)'}</option>
                      <option value="all">{isAr ? 'جميع النصوص بلا استثناء' : 'All String Literals'}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Target Class Scope & Metrics (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Class Selector Bar */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileCode className="h-4 w-4 text-emerald-400" />
                <span>{isAr ? 'الكلاس المستهدف للمعالجة والعرض:' : 'Target Disassembled Smali Class:'}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {availableClasses.length} {isAr ? 'كلاسات' : 'classes'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedClassIndex}
                onChange={(e) => setSelectedClassIndex(parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              >
                {availableClasses.map((cls, idx) => (
                  <option key={idx} value={idx}>
                    {cls.className}.smali ({cls.packagePath})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Metrics Overview Row */}
          {optimizationResult && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block mb-0.5">
                  {isAr ? 'تعليمات ميتة محذوفة' : 'Dead Instructions'}
                </span>
                <span className="text-base font-bold text-rose-400 font-mono">
                  -{optimizationResult.deadInstructionsStripped}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/40 text-center">
                <span className="text-[10px] text-indigo-300 block mb-0.5">
                  {isAr ? 'نصوص مموهة' : 'Obfuscated Strings'}
                </span>
                <span className="text-base font-bold text-indigo-400 font-mono">
                  {optimizationResult.stringsObfuscatedCount}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block mb-0.5">
                  {isAr ? 'أسطر تصحيح ملغاة' : 'Debug Lines'}
                </span>
                <span className="text-base font-bold text-amber-400 font-mono">
                  -{optimizationResult.debugLinesRemoved}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-center">
                <span className="text-[10px] text-emerald-300 block mb-0.5">
                  {isAr ? 'حجم موفر بالبايت' : 'Bytecode Reduction'}
                </span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {optimizationResult.bytesSaved} B
                </span>
              </div>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleSaveToProject}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Check className="h-4 w-4" />
              <span>{isAr ? 'تطبيق وحفظ الكود المحسن بالـ APK ⚡' : 'Save to APK Project ⚡'}</span>
            </button>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copiedCode ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ Smali' : 'Copy Smali')}</span>
            </button>

            <button
              onClick={handleDownloadSmali}
              className="p-2.5 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Download .smali file"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. BEFORE VS AFTER DIFF VIEWER & OBFUSCATED STRINGS MAP */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileDiff className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-white font-mono">
              {currentClass.className}.smali
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({originalLines.length} lines → {optimizedLines.length} lines)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveViewTab('diff')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                activeViewTab === 'diff'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'مقارنة الفروق (Side-by-Side Diff)' : 'Side-by-Side Diff'}
            </button>

            <button
              onClick={() => setActiveViewTab('stringsMap')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                activeViewTab === 'stringsMap'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'خريطة النصوص المموهة (Strings Map)' : 'Strings Map'}
              {optimizationResult?.obfuscatedStringDetails && optimizationResult.obfuscatedStringDetails.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-500 text-white text-[9px]">
                  {optimizationResult.obfuscatedStringDetails.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveViewTab('optimizedOnly')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                activeViewTab === 'optimizedOnly'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'الكود المحسن فقط' : 'Optimized Source Only'}
            </button>
          </div>
        </div>

        {/* Tab 1: Side by Side Diff */}
        {activeViewTab === 'diff' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Smali Column */}
            <div className="rounded-xl border border-rose-950/60 bg-slate-950/90 overflow-hidden">
              <div className="px-3.5 py-2 border-b border-rose-900/30 bg-rose-950/20 flex items-center justify-between text-xs font-mono text-rose-300">
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>{isAr ? 'الكود الأصلي (غير محسن)' : 'Original Smali (Unoptimized)'}</span>
                </span>
                <span className="text-[10px] text-rose-400/70">{originalLines.length} {isAr ? 'أسطر' : 'lines'}</span>
              </div>
              <div className="p-3 font-mono text-xs overflow-x-auto text-rose-200/90 divide-y divide-rose-950/20 max-h-[420px] overflow-y-auto">
                {originalLines.map((line, idx) => (
                  <div key={idx} className="flex gap-3 py-0.5 hover:bg-rose-950/30 px-1 rounded">
                    <span className="text-[10px] text-rose-500/60 w-6 text-right select-none shrink-0 font-mono">
                      {idx + 1}
                    </span>
                    <pre className="font-mono whitespace-pre">{line}</pre>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimized Smali Column */}
            <div className="rounded-xl border border-emerald-950/60 bg-slate-950/90 overflow-hidden">
              <div className="px-3.5 py-2 border-b border-emerald-900/30 bg-emerald-950/20 flex items-center justify-between text-xs font-mono text-emerald-300">
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{isAr ? 'الكود المحسن والمموه (Optimized & Obfuscated)' : 'Optimized & Obfuscated Smali'}</span>
                </span>
                <span className="text-[10px] text-emerald-400/70">{optimizedLines.length} {isAr ? 'أسطر' : 'lines'}</span>
              </div>
              <div className="p-3 font-mono text-xs overflow-x-auto text-emerald-200/90 divide-y divide-emerald-950/20 max-h-[420px] overflow-y-auto">
                {optimizedLines.map((line, idx) => {
                  const isObfuscatedLine = line.includes('StringDecryptor') || line.includes('Protected literal via');
                  const isStrippedComment = line.includes('[DCE Optimizer]');
                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 py-0.5 px-1 rounded ${
                        isObfuscatedLine
                          ? 'bg-indigo-950/40 text-indigo-300 font-bold'
                          : isStrippedComment
                          ? 'bg-amber-950/20 text-amber-300'
                          : 'hover:bg-emerald-950/30'
                      }`}
                    >
                      <span className="text-[10px] text-emerald-500/60 w-6 text-right select-none shrink-0 font-mono">
                        {idx + 1}
                      </span>
                      <pre className="font-mono whitespace-pre">{line}</pre>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Obfuscated Strings Map */}
        {activeViewTab === 'stringsMap' && (
          <div className="p-4 space-y-3">
            <span className="text-xs text-slate-300 font-semibold block">
              {isAr ? 'جدول النصوص الأصلية مقابل الشفرات المشفرة في ملف الـ Smali:' : 'Obfuscated Strings Dictionary & Decryption Map:'}
            </span>

            {(!optimizationResult || optimizationResult.obfuscatedStringDetails.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                {isAr
                  ? 'لم يتم تمويه أي نصوص في هذا الكلاس (تأكد من تفعيل خيار String Obfuscation)'
                  : 'No strings obfuscated in this class. Enable String Obfuscation above.'}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 divide-y divide-slate-800 overflow-hidden font-mono text-xs">
                {optimizationResult.obfuscatedStringDetails.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-900/80">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {item.mode}
                        </span>
                        <span className="text-xs text-white font-bold truncate max-w-md">
                          "{item.original}"
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-400 break-all select-all">
                        Cipher: "{item.obfuscated}"
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-500 shrink-0">
                      Lcom/security/StringDecryptor
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Optimized Only Full Source */}
        {activeViewTab === 'optimizedOnly' && (
          <div className="p-4 bg-slate-950 font-mono text-xs text-emerald-300/90 overflow-x-auto max-h-[460px] overflow-y-auto">
            <pre className="whitespace-pre leading-relaxed">{optimizationResult?.optimizedSmali || currentClass.smaliCode}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
