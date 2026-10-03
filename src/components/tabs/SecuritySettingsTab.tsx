import React, { useState } from 'react';
import {
  ShieldCheck,
  Fingerprint,
  Lock,
  KeyRound,
  Shield,
  Smartphone,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  CameraOff,
  RotateCcw,
  Check,
  Copy,
  FileCode2,
  ArrowRight,
  ArrowLeft,
  Delete,
  Unlock,
} from 'lucide-react';
import { Language } from '../../i18n/translations';
import { ApkMetadata, ApkPermission } from '../../types/apk';
import { SecuritySettingsConfig, DEFAULT_SECURITY_SETTINGS } from '../../types/security';

interface SecuritySettingsTabProps {
  lang: Language;
  metadata: ApkMetadata;
  permissions: ApkPermission[];
  onTogglePermission?: (permName: string, enable: boolean) => void;
  onSaveSecurityConfig?: (config: SecuritySettingsConfig) => void;
  onInjectSecurityFiles?: (files: { path: string; content: string }[]) => void;
}

export const SecuritySettingsTab: React.FC<SecuritySettingsTabProps> = ({
  lang,
  metadata,
  permissions,
  onTogglePermission,
  onSaveSecurityConfig,
  onInjectSecurityFiles,
}) => {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  // Security Config State
  const [config, setConfig] = useState<SecuritySettingsConfig>(() => {
    try {
      const saved = localStorage.getItem(`apk_studio_sec_${metadata.packageName}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { ...DEFAULT_SECURITY_SETTINGS };
  });

  const [showPin, setShowPin] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Lock Screen Simulator State
  const [isSimulatorUnlocked, setIsSimulatorUnlocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinAttemptsLeft, setPinAttemptsLeft] = useState(config.maxPinAttempts);
  const [simAuthFeedback, setSimAuthFeedback] = useState<{
    type: 'idle' | 'success' | 'error' | 'biometric_scanning';
    message: string;
  }>({
    type: 'idle',
    message: config.requireAuthOnStartup
      ? (isAr ? 'التطبيق مقفل: أدخل رمز PIN أو المس البصمة' : 'App is locked: Enter PIN or touch sensor')
      : (isAr ? 'التطبيق مفتوح حالياً' : 'App currently unlocked'),
  });

  // Source Code Tab
  const [activeCodeTab, setActiveCodeTab] = useState<'smali' | 'json' | 'manifest'>('smali');
  const [copiedCode, setCopiedCode] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const updateConfig = (updates: Partial<SecuritySettingsConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(`apk_studio_sec_${metadata.packageName}`, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Toggle Biometric Protection
  const handleToggleBiometric = (enabled: boolean) => {
    updateConfig({ biometricEnabled: enabled });
    if (onTogglePermission) {
      onTogglePermission('android.permission.USE_BIOMETRIC', enabled);
      onTogglePermission('android.permission.USE_FINGERPRINT', enabled);
    }
    showToast(
      enabled
        ? (isAr ? 'تم تفعيل حماية البصمة وإضافة الصلاحيات للـ APK!' : 'Biometric protection enabled & permissions linked!')
        : (isAr ? 'تم تعطيل حماية البصمة' : 'Biometric protection disabled')
    );
  };

  // Save full configuration and generate offline assets
  const handleSaveAndInject = () => {
    updateConfig(config);

    if (onSaveSecurityConfig) {
      onSaveSecurityConfig(config);
    }

    if (onInjectSecurityFiles) {
      onInjectSecurityFiles([
        {
          path: 'assets/security_policy.json',
          content: JSON.stringify(
            {
              targetPackage: metadata.packageName,
              appName: metadata.appName,
              securityPolicyVersion: '1.0.0',
              configuredAt: new Date().toISOString(),
              settings: config,
            },
            null,
            2
          ),
        },
      ]);
    }

    showToast(isAr ? 'تم حفظ وحقن سياسة الأمان بنجاح داخل الـ APK!' : 'Security policy saved & injected into APK!');
  };

  // Keypad simulation actions
  const handleKeypadPress = (digit: string) => {
    if (enteredPin.length < config.pinLength) {
      const newPin = enteredPin + digit;
      setEnteredPin(newPin);

      // Auto-validate when reaching expected length
      if (newPin.length === config.pinLength) {
        validatePin(newPin);
      }
    }
  };

  const handleKeypadDelete = () => {
    setEnteredPin(prev => prev.slice(0, -1));
  };

  const validatePin = (pinToTest: string) => {
    if (pinToTest === config.configuredPin || pinToTest === config.emergencyPasscode) {
      setIsSimulatorUnlocked(true);
      setSimAuthFeedback({
        type: 'success',
        message: isAr ? 'تم قبول رمز PIN بنجاح! تم فتح قفل التطبيق ✓' : 'PIN Verified! App Unlocked Successfully ✓',
      });
      setPinAttemptsLeft(config.maxPinAttempts);
    } else {
      const remaining = pinAttemptsLeft - 1;
      setPinAttemptsLeft(remaining);
      setEnteredPin('');
      if (remaining <= 0) {
        setSimAuthFeedback({
          type: 'error',
          message: isAr
            ? `تم استنفاد المحاولات! تم تجميد القفل لمدة ${config.lockoutDurationMinutes} دقائق.`
            : `Max attempts exceeded! Locked out for ${config.lockoutDurationMinutes} minutes.`,
        });
      } else {
        setSimAuthFeedback({
          type: 'error',
          message: isAr
            ? `رمز PIN غير صحيح! متبقي ${remaining} محاولات.`
            : `Incorrect PIN! ${remaining} attempts remaining.`,
        });
      }
    }
  };

  // Simulate fingerprint touch on lock screen
  const handleSimulateFingerprint = () => {
    if (!config.biometricEnabled) {
      setSimAuthFeedback({
        type: 'error',
        message: isAr ? 'حماية البصمة معطلة في الإعدادات' : 'Biometric fingerprint is disabled in settings',
      });
      return;
    }

    setSimAuthFeedback({
      type: 'biometric_scanning',
      message: isAr ? 'جاري التحقق من بصمة الإصبع...' : 'Scanning fingerprint sensor...',
    });

    setTimeout(() => {
      setIsSimulatorUnlocked(true);
      setSimAuthFeedback({
        type: 'success',
        message: isAr
          ? 'تم التحقق من البصمة الحيوية بنجاح! تم فتح التطبيق ⚡'
          : 'Biometric verification passed! Access granted ⚡',
      });
    }, 900);
  };

  const handleResetLockSimulation = () => {
    setIsSimulatorUnlocked(false);
    setEnteredPin('');
    setPinAttemptsLeft(config.maxPinAttempts);
    setSimAuthFeedback({
      type: 'idle',
      message: isAr ? 'التطبيق مقفل: أدخل رمز PIN أو المس البصمة' : 'App is locked: Enter PIN or touch sensor',
    });
  };

  // Generated Smali snippet
  const targetPkg = metadata.packageName || 'com.target.app';
  const generatedSmaliGuard = `.class public L${targetPkg.replace(/\./g, '/')}/AppSecurityGuard;
.super Ljava/lang/Object;

# Generated by APK Studio Security Engine
.field public static final REQUIRE_STARTUP_AUTH:Z = ${config.requireAuthOnStartup ? '0x1' : '0x0'}
.field public static final BIOMETRIC_ENABLED:Z = ${config.biometricEnabled ? '0x1' : '0x0'}
.field public static final FALLBACK_PIN_ENABLED:Z = ${config.fallbackPinEnabled ? '0x1' : '0x0'}
.field public static final SCREENSHOT_SECURE:Z = ${config.enableScreenshotProtection ? '0x1' : '0x0'}

.method public static enforceStartupProtection(Landroid/app/Activity;)V
    .registers 3
    # Check if screenshot protection (FLAG_SECURE) is requested
    ${config.enableScreenshotProtection ? `
    invoke-virtual {p0}, Landroid/app/Activity;->getWindow()Landroid/view/Window;
    move-result-object v0
    const/16 v1, 0x2000 # FLAG_SECURE
    invoke-virtual {v0, v1, v1}, Landroid/view/Window;->setFlags(II)V` : '# FLAG_SECURE disabled'}

    # Launch Authentication Lock Activity if startup protection is enabled
    ${config.requireAuthOnStartup ? `
    new-instance v0, Landroid/content/Intent;
    const-string v1, "${targetPkg}.SecurityLockActivity"
    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V
    invoke-virtual {p0, v0}, Landroid/app/Activity;->startActivity(Landroid/content/Intent;)V` : '# Startup auth bypassed'}
    return-void
.end method`;

  const generatedJsonPolicy = JSON.stringify(
    {
      targetPackage: targetPkg,
      requireAuthOnStartup: config.requireAuthOnStartup,
      requireAuthOnResume: config.requireAuthOnResume,
      biometricEnabled: config.biometricEnabled,
      fallbackPinEnabled: config.fallbackPinEnabled,
      pinLength: config.pinLength,
      configuredPinHash: 'SHA256_' + btoa(config.configuredPin),
      maxPinAttempts: config.maxPinAttempts,
      lockoutDurationMinutes: config.lockoutDurationMinutes,
      screenshotProtection: config.enableScreenshotProtection,
      lockTimeoutSeconds: config.lockTimeoutSeconds,
    },
    null,
    2
  );

  const generatedManifestRules = `<!-- Biometric Permissions Required by Android OS -->
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />

<!-- Security Lock Screen Activity Declaration -->
<activity
    android:name="${targetPkg}.SecurityLockActivity"
    android:theme="@android:style/Theme.DeviceDefault.NoActionBar.Fullscreen"
    android:excludeFromRecents="true"
    android:launchMode="singleInstance"
    android:exported="false" />`;

  const activeSnippet =
    activeCodeTab === 'smali'
      ? generatedSmaliGuard
      : activeCodeTab === 'json'
      ? generatedJsonPolicy
      : generatedManifestRules;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-white">
                {isAr ? 'إعدادات الأمان وقفل البصمة ورمز الـ PIN' : 'Security Settings & App Lock Engine'}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                APK Lock Guard
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {isAr
                ? 'تفعيل حماية البصمة الحيوية لتطبيقك المعدل، مع تخصيص طلب التحقق الإجباري عند فتح التطبيق (Startup Lock) ورمز PIN احتياطي وشاشة قفل تفاعلية حية.'
                : 'Configure Biometric Fingerprint Protection, Require Authentication on Startup, and Fallback PIN logic with an interactive live lock screen preview.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAndInject}
          className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-emerald-500/10 cursor-pointer shrink-0"
        >
          <Check className="h-4 w-4" />
          <span>{isAr ? 'حفظ وحقن سياسة الأمان في الـ APK' : 'Save & Inject Security Policy'}</span>
        </button>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2 p-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. CORE CONFIGURATION & INTERACTIVE SIMULATOR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Sections (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card A: Biometric Fingerprint Protection */}
          <div className="p-5 rounded-xl border border-indigo-900/60 bg-slate-950/70 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    {isAr ? 'حماية البصمة الحيوية (Biometric Protection)' : 'Biometric Fingerprint Protection'}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {isAr
                      ? 'تمكين أو تعطيل فتح التطبيق عبر مستشعر البصمة ومسح الوجه'
                      : 'Enable or disable biometric unlock via Android BiometricPrompt'}
                  </span>
                </div>
              </div>

              {/* Master Biometric Toggle */}
              <button
                onClick={() => handleToggleBiometric(!config.biometricEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  config.biometricEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    config.biometricEnabled ? (isAr ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {config.biometricEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    {isAr ? 'قوة المصادقة (Biometric Class):' : 'Biometric Authenticator Strength:'}
                  </label>
                  <select
                    value={config.biometricStrength}
                    onChange={(e) => updateConfig({ biometricStrength: e.target.value as 'strong' | 'weak' })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="strong">Class 3 - Strong (عتاد آمن مشفر بمفتاح Hardware Key)</option>
                    <option value="weak">Class 2 - Weak (بصمة عادية ومسح الوجه 2D)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    {isAr ? 'عنوان نافذة التحقق (Prompt Title):' : 'Biometric Prompt Title:'}
                  </label>
                  <input
                    type="text"
                    value={isAr ? config.promptTitleAr : config.promptTitleEn}
                    onChange={(e) =>
                      updateConfig({
                        [isAr ? 'promptTitleAr' : 'promptTitleEn']: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card B: Require Authentication on Startup & Lifecycle */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {isAr ? 'سلوك القفل عند بدء التشغيل والخلفية' : 'Startup & App Lifecycle Lock'}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Cold Launch & OnResume Security</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Require Auth on Startup Field */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-semibold text-slate-200 block">
                    {isAr
                      ? 'طلب التحقق الإجباري عند بدء التشغيل (Require Auth on Startup)'
                      : 'Require Authentication on Startup'}
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isAr
                      ? 'إظهار شاشة القفل فوراً عند فتح التطبيق ومنع الدخول إلا بعد التحقق بالبصمة أو الـ PIN.'
                      : 'Enforces the lock screen immediately when the application launches from cold start.'}
                  </p>
                </div>
                <button
                  onClick={() => updateConfig({ requireAuthOnStartup: !config.requireAuthOnStartup })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    config.requireAuthOnStartup ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      config.requireAuthOnStartup ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Require Auth on Resume Field */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-semibold text-slate-200 block">
                    {isAr
                      ? 'القفل التلقائي عند العودة من الخلفية (Require Auth on Resume)'
                      : 'Require Auth When Returning From Background'}
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isAr
                      ? 'إعادة قفل التطبيق إذا قام المستخدم بتبديل التطبيقات ثم العودة للتطبيق مجدداً.'
                      : 'Locks the app whenever the user switches away and returns to the app.'}
                  </p>
                </div>
                <button
                  onClick={() => updateConfig({ requireAuthOnResume: !config.requireAuthOnResume })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    config.requireAuthOnResume ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      config.requireAuthOnResume ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Screenshot Protection (FLAG_SECURE) */}
              <div className="flex items-start justify-between gap-3 pt-1 border-t border-slate-800/80">
                <div>
                  <span className="font-semibold text-slate-200 block flex items-center gap-1.5">
                    <CameraOff className="h-3.5 w-3.5 text-amber-400" />
                    <span>{isAr ? 'حظر لقطات الشاشة وتسجيل الفيديو (FLAG_SECURE)' : 'Screenshot & Screen Recording Protection'}</span>
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isAr
                      ? 'منع أخذ لقطات شاشة (Screenshots) أو تسجيل الشاشة فيديو، وإخفاء محتوى التطبيق في قائمة التطبيقات الأخيرة.'
                      : 'Injects FLAG_SECURE to prevent screenshots, screen recording, and app previews in recents.'}
                  </p>
                </div>
                <button
                  onClick={() => updateConfig({ enableScreenshotProtection: !config.enableScreenshotProtection })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    config.enableScreenshotProtection ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      config.enableScreenshotProtection ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Card C: Fallback PIN Code Logic */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    {isAr ? 'رمز PIN الاحتياطي وقواعد التحقق (Fallback PIN Logic)' : 'Fallback PIN Configuration'}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {isAr ? 'يستخدم كبديل عند عدم توفر البصمة أو فشلها' : 'Fallback credential when biometrics fail or hardware unavailable'}
                  </span>
                </div>
              </div>

              {/* Fallback PIN Toggle */}
              <button
                onClick={() => updateConfig({ fallbackPinEnabled: !config.fallbackPinEnabled })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  config.fallbackPinEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    config.fallbackPinEnabled ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {config.fallbackPinEnabled && (
              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* PIN Length */}
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">
                      {isAr ? 'طول رمز الـ PIN:' : 'PIN Length:'}
                    </label>
                    <select
                      value={config.pinLength}
                      onChange={(e) => {
                        const len = parseInt(e.target.value) as 4 | 6;
                        updateConfig({
                          pinLength: len,
                          configuredPin: len === 6 ? '123456' : '1234',
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    >
                      <option value="4">{isAr ? '4 أرقام (PIN من 4 خانات)' : '4 Digits (Standard)'}</option>
                      <option value="6">{isAr ? '6 أرقام (PIN عالي الأمان)' : '6 Digits (High Security)'}</option>
                    </select>
                  </div>

                  {/* Configured PIN */}
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">
                      {isAr ? 'رمز الـ PIN المعتمد للتطبيق:' : 'Configured Fallback PIN:'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPin ? 'text' : 'password'}
                        value={config.configuredPin}
                        maxLength={config.pinLength}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, config.pinLength);
                          updateConfig({ configuredPin: val });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-center tracking-widest text-sm focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
                  {/* Max Attempts */}
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">
                      {isAr ? 'أقصى عدد محاولات خاطئة قبل التجميد:' : 'Max PIN Attempts Before Lockout:'}
                    </label>
                    <select
                      value={config.maxPinAttempts}
                      onChange={(e) => updateConfig({ maxPinAttempts: parseInt(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    >
                      <option value="3">3 {isAr ? 'محاولات' : 'attempts'}</option>
                      <option value="5">5 {isAr ? 'محاولات' : 'attempts'}</option>
                      <option value="10">10 {isAr ? 'محاولات' : 'attempts'}</option>
                    </select>
                  </div>

                  {/* Lockout duration */}
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">
                      {isAr ? 'مدة التجميد المؤقت (بالدقائق):' : 'Cooldown Lockout Duration (Mins):'}
                    </label>
                    <select
                      value={config.lockoutDurationMinutes}
                      onChange={(e) => updateConfig({ lockoutDurationMinutes: parseInt(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    >
                      <option value="1">1 {isAr ? 'دقيقة' : 'minute'}</option>
                      <option value="5">5 {isAr ? 'دقائق' : 'minutes'}</option>
                      <option value="15">15 {isAr ? 'دقيقة' : 'minutes'}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Interactive Phone Lock Screen Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border-2 border-slate-700 bg-slate-950 p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Smartphone className="h-4 w-4 text-rose-400" />
                <span>{isAr ? 'محاكي شاشة قفل التطبيق الحية' : 'Live Lock Screen Preview'}</span>
              </span>
              <button
                onClick={handleResetLockSimulation}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                title="Reset Lock"
              >
                <RotateCcw className="h-3 w-3" />
                <span>{isAr ? 'إعادة القفل' : 'Reset'}</span>
              </button>
            </div>

            {/* Mobile Frame Container */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-5 space-y-4 shadow-inner">
              {/* App Identity */}
              <div className="text-center space-y-1">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border transition-colors ${
                    isSimulatorUnlocked
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {isSimulatorUnlocked ? <Unlock className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                </div>
                <h4 className="text-sm font-bold text-white">
                  {metadata.appName || 'Protected Application'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {isSimulatorUnlocked
                    ? (isAr ? '✓ تم فتح التطبيق بنجاح' : '✓ Unlocked & Session Active')
                    : isAr
                    ? config.promptTitleAr
                    : config.promptTitleEn}
                </p>
              </div>

              {/* Feedback Alert */}
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 border animate-fadeIn ${
                  simAuthFeedback.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : simAuthFeedback.type === 'biometric_scanning'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : simAuthFeedback.type === 'error'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800'
                }`}
              >
                {simAuthFeedback.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : simAuthFeedback.type === 'biometric_scanning' ? (
                  <Fingerprint className="h-4 w-4 shrink-0 animate-pulse text-indigo-400" />
                ) : simAuthFeedback.type === 'error' ? (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                ) : (
                  <Lock className="h-4 w-4 shrink-0 text-slate-500" />
                )}
                <span className="text-[11px] font-medium leading-tight">{simAuthFeedback.message}</span>
              </div>

              {!isSimulatorUnlocked ? (
                <div className="space-y-4">
                  {/* PIN Dots Display */}
                  {config.fallbackPinEnabled && (
                    <div className="space-y-2">
                      <div className="flex justify-center items-center gap-3 py-1">
                        {Array.from({ length: config.pinLength }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-3.5 h-3.5 rounded-full transition-all border ${
                              i < enteredPin.length
                                ? 'bg-emerald-400 border-emerald-400 scale-110 shadow-sm shadow-emerald-500/50'
                                : 'bg-slate-950 border-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Interactive Keypad */}
                      <div className="grid grid-cols-3 gap-2 max-w-[210px] mx-auto pt-1 font-mono">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                          <button
                            key={digit}
                            onClick={() => handleKeypadPress(digit)}
                            className="h-10 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-white font-bold text-sm border border-slate-800 hover:border-slate-700 active:scale-95 transition-all cursor-pointer shadow-xs"
                          >
                            {digit}
                          </button>
                        ))}
                        <button
                          onClick={handleSimulateFingerprint}
                          disabled={!config.biometricEnabled}
                          className="h-10 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 disabled:opacity-30 text-indigo-300 flex items-center justify-center border border-indigo-900/60 active:scale-95 transition-all cursor-pointer"
                          title="Touch Fingerprint"
                        >
                          <Fingerprint className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleKeypadPress('0')}
                          className="h-10 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-white font-bold text-sm border border-slate-800 hover:border-slate-700 active:scale-95 transition-all cursor-pointer shadow-xs"
                        >
                          0
                        </button>
                        <button
                          onClick={handleKeypadDelete}
                          className="h-10 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 flex items-center justify-center border border-slate-800 active:scale-95 transition-all cursor-pointer"
                          title="Delete digit"
                        >
                          <Delete className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Fingerprint Quick Trigger Banner */}
                  {config.biometricEnabled && (
                    <div className="pt-2 text-center border-t border-slate-800">
                      <button
                        onClick={handleSimulateFingerprint}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                      >
                        <Fingerprint className="h-4 w-4 text-emerald-400" />
                        <span>{isAr ? 'المس مستشعر البصمة للمصادقة' : 'Simulate Fingerprint Touch'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Unlocked State View */
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3 animate-fadeIn">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-white">
                      {isAr ? 'تم تجاوز قفل الأمان' : 'Security Guard Passed'}
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      {isAr ? 'المستخدم الآن داخل الشاشة الرئيسية للتطبيق المعدل.' : 'User is now interacting inside the main activity.'}
                    </p>
                  </div>
                  <button
                    onClick={handleResetLockSimulation}
                    className="px-4 py-1.5 text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
                  >
                    {isAr ? 'إعادة قفل الشاشة للتجربة' : 'Re-lock for testing'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. GENERATED SMALI & MANIFEST CODE VIEWER */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 className="h-4 w-4 text-rose-400" />
            <span className="text-xs font-bold text-white">
              {isAr ? 'شفرة الحماية وقفل البداية المولدة (Generated Smali & Policy):' : 'Generated Security Guard Smali & Policy:'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {(['smali', 'json', 'manifest'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveCodeTab(tab)}
                className={`px-2.5 py-1 text-[11px] rounded font-mono transition-colors cursor-pointer ${
                  activeCodeTab === tab
                    ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'smali' ? 'AppSecurityGuard.smali' : tab === 'json' ? 'security_policy.json' : 'AndroidManifest.xml'}
              </button>
            ))}

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer ml-2"
            >
              {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedCode ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}</span>
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto max-h-56 overflow-y-auto">
          <pre className="whitespace-pre leading-relaxed">{activeSnippet}</pre>
        </div>
      </div>
    </div>
  );
};
