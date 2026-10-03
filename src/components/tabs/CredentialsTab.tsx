import React, { useState } from 'react';
import {
  KeyRound,
  User,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  FileText,
  Fingerprint,
  Smartphone,
  Shield,
  Zap,
  Check,
  Copy,
  AlertTriangle,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { Language, t } from '../../i18n/translations';
import { ApkMetadata } from '../../types/apk';

export interface CredentialItem {
  usernameKey: string;
  usernameValue: string;
  passwordKey: string;
  passwordValue: string;
  role: string;
  apiUrl: string;
  sourceFile: string;
  allowBiometric?: boolean;
}

export interface BiometricConfig {
  enabled: boolean;
  promptTitleAr: string;
  promptTitleEn: string;
  promptSubtitleAr: string;
  promptSubtitleEn: string;
  negativeButtonTextAr: string;
  negativeButtonTextEn: string;
  allowDeviceCredentialFallback: boolean;
  autoSuccessOnEmulator: boolean;
  biometricStrength: 'strong' | 'weak';
}

interface CredentialsTabProps {
  lang: Language;
  credentials: CredentialItem[];
  onUpdateCredentials: (updatedList: CredentialItem[]) => void;
  onApplyMasterBypass: () => void;
  isMasterBypassActive: boolean;
  metadata?: ApkMetadata;
  onTogglePermission?: (permName: string, enable: boolean) => void;
  onInjectAuthFiles?: (files: { path: string; content: string }[]) => void;
}

export const CredentialsTab: React.FC<CredentialsTabProps> = ({
  lang,
  credentials,
  onUpdateCredentials,
  onApplyMasterBypass,
  isMasterBypassActive,
  metadata,
  onTogglePermission,
  onInjectAuthFiles,
}) => {
  const strings = t[lang];
  const isAr = lang === 'ar';
  const [items, setItems] = useState<CredentialItem[]>(() => {
    return credentials.map(c => ({
      ...c,
      allowBiometric: c.allowBiometric ?? true,
    }));
  });

  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Biometric Config State
  const [biometricConfig, setBiometricConfig] = useState<BiometricConfig>({
    enabled: true,
    promptTitleAr: 'تسجيل الدخول السريع بالبصمة',
    promptTitleEn: 'Biometric Fast Login',
    promptSubtitleAr: 'المس مستشعر البصمة للمتابعة والوصول لحسابك',
    promptSubtitleEn: 'Touch the fingerprint sensor to access your account',
    negativeButtonTextAr: 'استخدام كلمة المرور بدلاً من ذلك',
    negativeButtonTextEn: 'Use password instead',
    allowDeviceCredentialFallback: true,
    autoSuccessOnEmulator: true,
    biometricStrength: 'strong',
  });

  // Interactive Live Login Simulator State
  const [simUsername, setSimUsername] = useState(credentials[0]?.usernameValue || 'admin_offline');
  const [simPassword, setSimPassword] = useState(credentials[0]?.passwordValue || 'OfflineAdmin#2026');
  const [simAuthStatus, setSimAuthStatus] = useState<'idle' | 'scanning_biometric' | 'success' | 'failed'>('idle');
  const [simAuthMessage, setSimAuthMessage] = useState<string | null>(null);

  // Smali Code Viewer Tab
  const [activeCodeTab, setActiveCodeTab] = useState<'smali' | 'json' | 'manifest'>('smali');
  const [copiedCode, setCopiedCode] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const togglePasswordVisibility = (index: number) => {
    setVisiblePasswords(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleUpdateItem = (index: number, field: keyof CredentialItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleAddNewAccount = () => {
    const newAccount: CredentialItem = {
      usernameKey: `custom_user_${items.length + 1}`,
      usernameValue: `user_offline_${items.length + 1}`,
      passwordKey: `custom_pass_${items.length + 1}`,
      passwordValue: 'Pass#2026_Secure',
      role: isAr ? 'حساب مستخدم محلي مخصص' : 'Custom Local User',
      apiUrl: 'local://auth/direct',
      sourceFile: 'assets/auth_config.json',
      allowBiometric: true,
    };
    const updated = [...items, newAccount];
    setItems(updated);
    onUpdateCredentials(updated);
    showToast(isAr ? 'تمت إضافة الحساب الجديد بنجاح!' : 'New account added successfully!');
  };

  const handleDeleteItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onUpdateCredentials(updated);
    showToast(isAr ? 'تم حذف الحساب' : 'Account removed');
  };

  const generateStrongPassword = (index: number) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let pass = '';
    for (let i = 0; i < 14; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleUpdateItem(index, 'passwordValue', pass);
    showToast(isAr ? 'تم توليد كلمة مرور قوية!' : 'Generated strong password!');
  };

  const handleToggleBiometric = (enable: boolean) => {
    setBiometricConfig(prev => ({ ...prev, enabled: enable }));
    if (onTogglePermission) {
      onTogglePermission('android.permission.USE_BIOMETRIC', enable);
      onTogglePermission('android.permission.USE_FINGERPRINT', enable);
    }
    showToast(
      enable
        ? (isAr ? 'تم تفعيل خاصية البصمة وتأمين الصلاحيات في الـ APK!' : 'Biometric authentication enabled in APK!')
        : (isAr ? 'تم تعطيل خاصية البصمة' : 'Biometric authentication disabled')
    );
  };

  const handleSaveAll = () => {
    onUpdateCredentials(items);
    if (onInjectAuthFiles) {
      onInjectAuthFiles([
        {
          path: 'assets/auth_config.json',
          content: JSON.stringify(
            {
              biometricAuth: biometricConfig,
              masterBypass: isMasterBypassActive,
              users: items,
              generatedAt: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      ]);
    }
    showToast(strings.credentialsTab.savedSuccess);
  };

  // Simulate password login test
  const handleTestPasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMasterBypassActive) {
      setSimAuthStatus('success');
      setSimAuthMessage(isAr ? 'تم قبول الدخول بنجاح عبر خاصية Master Bypass!' : 'Access granted via Master Bypass!');
      return;
    }

    const matched = items.find(
      u => u.usernameValue.toLowerCase() === simUsername.trim().toLowerCase() && u.passwordValue === simPassword
    );

    if (matched) {
      setSimAuthStatus('success');
      setSimAuthMessage(isAr ? `مرحباً ${matched.usernameValue} (${matched.role})` : `Welcome ${matched.usernameValue} (${matched.role})`);
    } else {
      setSimAuthStatus('failed');
      setSimAuthMessage(isAr ? 'خطأ: اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password');
    }
  };

  // Simulate fingerprint scan test
  const handleTriggerBiometricTest = () => {
    if (!biometricConfig.enabled) {
      showToast(isAr ? 'خاصية البصمة معطلة حالياً، يرجى تفعيلها أولاً' : 'Biometrics currently disabled');
      return;
    }

    setSimAuthStatus('scanning_biometric');
    setSimAuthMessage(isAr ? 'جاري قراءة بصمة الإصبع...' : 'Scanning fingerprint sensor...');

    setTimeout(() => {
      setSimAuthStatus('success');
      setSimAuthMessage(
        isAr
          ? 'تم التحقق من بصمة الإصبع بنجاح! تم تسجيل الدخول التلقائي ⚡'
          : 'Fingerprint verified successfully! Logged in via BiometricPrompt ⚡'
      );
    }, 1200);
  };

  // Generated Smali hook representation
  const targetPkg = metadata?.packageName || 'com.target.app';
  const generatedSmaliHook = `.class public L${targetPkg.replace(/\./g, '/')}/OfflineAuthManager;
.super Ljava/lang/Object;

# Biometric & Offline Credential Manager Hook
.method public static authenticate(Ljava/lang/String;Ljava/lang/String;)Z
    .registers 5
    # Check Master Bypass
    const/4 v0, 0x1
    return v0
.end method

.method public static startBiometricPrompt(Landroidx/fragment/app/FragmentActivity;Landroidx/biometric/BiometricPrompt$AuthenticationCallback;)V
    .registers 4
    # Instantiates BiometricPrompt with offline auto-success callback
    new-instance v0, Landroidx/biometric/BiometricPrompt$PromptInfo$Builder;
    invoke-direct {v0}, Landroidx/biometric/BiometricPrompt$PromptInfo$Builder;-><init>()V
    const-string v1, "${biometricConfig.promptTitleEn}"
    invoke-virtual {v0, v1}, Landroidx/biometric/BiometricPrompt$PromptInfo$Builder;->setTitle(Ljava/lang/CharSequence;)Landroidx/biometric/BiometricPrompt$PromptInfo$Builder;
    return-void
.end method`;

  const generatedJsonConfig = JSON.stringify(
    {
      authEngineVersion: '2.0.0-offline',
      biometricSettings: biometricConfig,
      masterBypassActive: isMasterBypassActive,
      registeredAccounts: items.map(u => ({
        username: u.usernameValue,
        role: u.role,
        biometricAllowed: u.allowBiometric,
        sessionToken: `TOKEN_${u.usernameValue.toUpperCase()}_OFFLINE`,
      })),
    },
    null,
    2
  );

  const generatedManifestSnippets = `<!-- Biometric Permissions Required by Android -->
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />

<!-- Optional Hardware Feature Flag -->
<uses-feature android:name="android.hardware.fingerprint" android:required="false" />`;

  const activeSnippet =
    activeCodeTab === 'smali'
      ? generatedSmaliHook
      : activeCodeTab === 'json'
      ? generatedJsonConfig
      : generatedManifestSnippets;

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
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-white">
                {strings.credentialsTab.title}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Biometric & Account Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {isAr
                ? 'إدارة الحسابات وكلمات المرور، وإضافة خاصية تسجيل الدخول السريع ببصمة الإصبع (Biometric Unlock) للتطبيق المعدل مع إمكانية تجربة شاشة الدخول حياً.'
                : 'Configure usernames, passwords, and inject Biometric Fingerprint login into the modified APK with real-time test simulation.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onApplyMasterBypass}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-sm ${
              isMasterBypassActive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>
              {isMasterBypassActive
                ? (isAr ? 'تجاوز التحقق نشط ✓' : 'Master Bypass Active ✓')
                : (isAr ? 'تفعيل قبول أي كلمة مرور ⚡' : 'Enable Master Bypass ⚡')}
            </span>
          </button>

          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-sm shadow-emerald-500/10"
          >
            <Check className="h-4 w-4" />
            <span>{strings.credentialsTab.saveChanges}</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2 p-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. BIOMETRIC & FINGERPRINT CONFIGURATION CARD */}
      <div className="p-6 rounded-xl border border-indigo-900/60 bg-slate-950/70 space-y-5 shadow-lg shadow-indigo-950/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Fingerprint className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-white">
                  {isAr
                    ? 'خاصية تسجيل الدخول بالبصمة الحيوية (Biometric / Fingerprint Unlock)'
                    : 'Biometric & Fingerprint Login System'}
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  biometricConfig.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {biometricConfig.enabled ? (isAr ? 'مُفعلة في الـ APK' : 'Enabled in APK') : (isAr ? 'معطلة' : 'Disabled')}
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                {isAr
                  ? 'حقن مكون Android BiometricPrompt في التطبيق للسماح بتسجيل الدخول الفوري بلمسة إصبع أو مسح الوجه دون الحاجة لإدخال كلمة المرور في كل مرة.'
                  : 'Injects standard BiometricPrompt into the modified app, enabling instant fingerprint or face authentication without typing credentials.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 font-semibold">
              {isAr ? 'تفعيل البصمة:' : 'Enable Biometrics:'}
            </span>
            <button
              onClick={() => handleToggleBiometric(!biometricConfig.enabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                biometricConfig.enabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  biometricConfig.enabled ? (isAr ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Biometric Settings Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs">
          <div className="space-y-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">
                {isAr ? 'عنوان نافذة البصمة (Prompt Title):' : 'Biometric Prompt Title:'}
              </label>
              <input
                type="text"
                value={isAr ? biometricConfig.promptTitleAr : biometricConfig.promptTitleEn}
                onChange={(e) =>
                  setBiometricConfig(prev => ({
                    ...prev,
                    [isAr ? 'promptTitleAr' : 'promptTitleEn']: e.target.value,
                  }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">
                {isAr ? 'وصف النافذة التوضيحي (Prompt Subtitle):' : 'Prompt Subtitle / Instructions:'}
              </label>
              <input
                type="text"
                value={isAr ? biometricConfig.promptSubtitleAr : biometricConfig.promptSubtitleEn}
                onChange={(e) =>
                  setBiometricConfig(prev => ({
                    ...prev,
                    [isAr ? 'promptSubtitleAr' : 'promptSubtitleEn']: e.target.value,
                  }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">
                {isAr ? 'زر الرجوع / الإلغاء (Negative Button):' : 'Fallback / Negative Button Text:'}
              </label>
              <input
                type="text"
                value={isAr ? biometricConfig.negativeButtonTextAr : biometricConfig.negativeButtonTextEn}
                onChange={(e) =>
                  setBiometricConfig(prev => ({
                    ...prev,
                    [isAr ? 'negativeButtonTextAr' : 'negativeButtonTextEn']: e.target.value,
                  }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={biometricConfig.autoSuccessOnEmulator}
                  onChange={(e) =>
                    setBiometricConfig(prev => ({ ...prev, autoSuccessOnEmulator: e.target.checked }))
                  }
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>
                  {isAr
                    ? 'النجاح التلقائي في المحاكيات والأجهزة بدون مستشعر بصمة (Auto-Success Bypass)'
                    : 'Auto-succeed on emulators / devices lacking biometric hardware'}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={biometricConfig.allowDeviceCredentialFallback}
                  onChange={(e) =>
                    setBiometricConfig(prev => ({ ...prev, allowDeviceCredentialFallback: e.target.checked }))
                  }
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>
                  {isAr
                    ? 'السماح برمز PIN أو نمط شاشة القفل كبديل احتياطي (Device Credential Fallback)'
                    : 'Allow device PIN / lock screen pattern as fallback'}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE LOGIN SIMULATOR + CREDENTIALS MANAGER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Accounts & Passwords Table (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-400" />
              <span>{strings.credentialsTab.foundAccounts}</span>
            </h3>
            <button
              onClick={handleAddNewAccount}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{strings.credentialsTab.addAccount}</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((cred, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{cred.role}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {cred.sourceFile}
                    </span>
                    {cred.allowBiometric && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                        <Fingerprint className="h-3 w-3" />
                        <span>Biometric</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdateItem(idx, 'allowBiometric', !cred.allowBiometric)}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        cred.allowBiometric ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={isAr ? 'تفعيل/تعطيل البصمة لهذا الحساب' : 'Toggle biometric for this account'}
                    >
                      <Fingerprint className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                      title={isAr ? 'حذف الحساب' : 'Delete account'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Username Field */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-medium block">
                      {strings.credentialsTab.username}:
                    </label>
                    <div className="relative">
                      <User className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={cred.usernameValue}
                        onChange={(e) => handleUpdateItem(idx, 'usernameValue', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-white font-mono focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-400 font-medium">
                        {strings.credentialsTab.password}:
                      </label>
                      <button
                        type="button"
                        onClick={() => generateStrongPassword(idx)}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>{strings.credentialsTab.generateStrongPass}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={visiblePasswords[idx] ? 'text' : 'password'}
                        value={cred.passwordValue}
                        onChange={(e) => handleUpdateItem(idx, 'passwordValue', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-8 py-1.5 text-white font-mono focus:outline-none focus:border-emerald-500 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(idx)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {visiblePasswords[idx] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Interactive Login Screen Mockup (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border-2 border-slate-700 bg-slate-950 p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Smartphone className="h-4 w-4 text-emerald-400" />
                <span>{isAr ? 'محاكي شاشة تسجيل الدخول بالتطبيق' : 'Interactive App Login Screen'}</span>
              </span>
              <span className="font-mono text-[10px] text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                Test UI
              </span>
            </div>

            {/* Simulated Mobile Login Interface */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-inner">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
                  <Fingerprint className="h-7 w-7" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  {metadata?.appName || 'Mobile App Login'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {isAr ? 'سجل الدخول بالبصمة أو اسم المستخدم' : 'Sign in with Biometrics or Credentials'}
                </p>
              </div>

              {/* Status / Feedback Banner */}
              {simAuthMessage && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center gap-2 border animate-fadeIn ${
                    simAuthStatus === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : simAuthStatus === 'scanning_biometric'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {simAuthStatus === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : simAuthStatus === 'scanning_biometric' ? (
                    <Fingerprint className="h-4 w-4 shrink-0 animate-pulse text-indigo-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                  )}
                  <span className="text-[11px] font-medium leading-tight">{simAuthMessage}</span>
                </div>
              )}

              {/* Username/Password Form */}
              <form onSubmit={handleTestPasswordLogin} className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-medium block mb-1">
                    {isAr ? 'اسم المستخدم:' : 'Username:'}
                  </label>
                  <input
                    type="text"
                    value={simUsername}
                    onChange={(e) => setSimUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="Username"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-medium block mb-1">
                    {isAr ? 'كلمة المرور:' : 'Password:'}
                  </label>
                  <input
                    type="password"
                    value={simPassword}
                    onChange={(e) => setSimPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="••••••••"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTriggerBiometricTest}
                    disabled={!biometricConfig.enabled}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-lg transition-colors cursor-pointer shadow-sm"
                    title="Test Biometric Fingerprint Sensor"
                  >
                    <Fingerprint className="h-4 w-4 text-emerald-300" />
                    <span>{isAr ? 'دخول بالبصمة ⚡' : 'Biometric ⚡'}</span>
                  </button>
                </div>
              </form>

              {/* Biometric Quick Sensor Scanner Button */}
              <div className="pt-2 text-center border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleTriggerBiometricTest}
                  className="inline-flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-950/80 hover:bg-indigo-950/30 border border-slate-800 transition-all cursor-pointer group"
                >
                  <div className="p-2.5 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:scale-110 group-hover:text-emerald-400 transition-transform">
                    <Fingerprint className="h-8 w-8" />
                  </div>
                  <span className="text-[11px] text-slate-400 group-hover:text-white font-semibold">
                    {isAr ? 'انقر لاختبار استجابة البصمة الحيوية' : 'Click to test fingerprint response'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SMALI & MANIFEST SOURCE CODE INJECTION VIEWER */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-bold text-white">
              {isAr ? 'شفرة حقن البصمة والمصادقة بالـ APK (Injected Code & Manifest):' : 'Injected Biometric & Auth Code in APK:'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {(['smali', 'json', 'manifest'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveCodeTab(tab)}
                className={`px-2.5 py-1 text-[11px] rounded font-mono transition-colors cursor-pointer ${
                  activeCodeTab === tab
                    ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'smali' ? 'OfflineAuthManager.smali' : tab === 'json' ? 'auth_config.json' : 'AndroidManifest.xml'}
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
