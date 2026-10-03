import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import {
  Smartphone,
  Download,
  Zap,
  Info,
  Package,
  CheckCircle2,
  FileArchive,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Code2,
  Globe,
  Settings,
  HelpCircle,
  Copy,
  Check,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Language } from '../../i18n/translations';
import { ApkMetadata } from '../../types/apk';

interface AppDistributionTabProps {
  lang: Language;
  metadata?: ApkMetadata;
  onNavigateToBuildSign?: () => void;
  onTriggerBuild?: () => void;
  builtApkBlob?: Blob | null;
  builtApkFileName?: string | null;
  isBuilding?: boolean;
  onExportZip?: () => Promise<void>;
}

export const AppDistributionTab: React.FC<AppDistributionTabProps> = ({
  lang,
  metadata,
  onNavigateToBuildSign,
  onTriggerBuild,
  builtApkBlob,
  builtApkFileName,
  isBuilding = false,
  onExportZip,
}) => {
  const isAr = lang === 'ar';

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Web to APK Form State
  const [webUrl, setWebUrl] = useState('');
  const [appName, setAppName] = useState(metadata?.appName || 'My Android App');
  const [packageId, setPackageId] = useState(metadata?.packageName || 'com.company.mobileapp');
  const [isGeneratingProject, setIsGeneratingProject] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWebUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (metadata?.appName) {
      setAppName(metadata.appName);
    }
    if (metadata?.packageName) {
      setPackageId(metadata.packageName);
    }
  }, [metadata]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isStandalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert(
        isAr
          ? 'لتثبيت التطبيق على هاتفك فوراً:\n1. افتح قائمة المتصفح (نقاط القائمة الثلاث بالأعلى).\n2. اختر "تثبيت التطبيق" (Install App) أو "إضافة إلى الشاشة الرئيسية" (Add to Home screen).\n3. سيظهر التطبيق كأيقونة مستقلة على هاتفك.'
          : 'To install on your phone:\n1. Tap the browser menu (3 dots).\n2. Select "Install App" or "Add to Home screen".\n3. The app will launch as a standalone application on your device.'
      );
    }
  };

  const handleDownloadBuiltApk = () => {
    if (!builtApkBlob) return;
    const url = URL.createObjectURL(builtApkBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = builtApkFileName || `${appName.replace(/\s+/g, '_')}_signed.apk`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateAndroidStudioProject = async () => {
    setIsGeneratingProject(true);
    try {
      const zip = new JSZip();
      const safePackage = packageId.replace(/[^a-zA-Z0-9_.]/g, '') || 'com.example.app';
      const packagePath = safePackage.replace(/\./g, '/');

      // 1. AndroidManifest.xml
      const manifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${safePackage}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${appName}"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:usesCleartextTraffic="true"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

      // 2. MainActivity.java
      const javaContent = `package ${safePackage};

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setLoadsImagesAutomatically(true);

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());

        // Target URL
        webView.loadUrl("${webUrl || 'https://example.com'}");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}`;

      // 3. build.gradle (app)
      const buildGradleApp = `apply plugin: 'com.android.application'

android {
    compileSdkVersion 34
    defaultConfig {
        applicationId "${safePackage}"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
}`;

      // 4. README instructions
      const readme = `# ${appName} - Android Studio APK Project

هذا المشروع مهيأ ومخصص لإنشاء ملف APK حقيقي قابل للتثبيت على جميع هواتف أندرويد.

## 🛠️ كيف تبني ملف الـ APK لتثبيته على هاتفك؟

### الطريقة 1: عبر Android Studio (بسيطة ومجانية)
1. قم بفك ضغط هذا المجلد على جهاز الكمبيوتر.
2. افتح برنامج **Android Studio** ثم اختر **Open Existing Project**.
3. من القائمة العلوية اضغط على **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. سيظهر لك إشعار بالأسفل: **APK(s) generated successfully!**، اضغط على **locate** لتحصل على ملف الـ \`.apk\`.
5. انقله لهاتفك عبر USB أو تيليجرام أو واتساب وثبته مباشرة!

### الطريقة 2: عبر سطر الأوامر (Gradle)
\`\`\`bash
./gradlew assembleRelease
\`\`\`
ستجد ملف الـ APK الناتج داخل:
\`app/build/outputs/apk/release/app-release-unsigned.apk\`
`;

      zip.file('app/src/main/AndroidManifest.xml', manifestContent);
      zip.file(`app/src/main/java/${packagePath}/MainActivity.java`, javaContent);
      zip.file('app/build.gradle', buildGradleApp);
      zip.file('README.md', readme);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${appName.replace(/\s+/g, '_')}_Android_Source.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert(isAr ? 'حدث خطأ أثناء إنشاء حزمة المشروع.' : 'Failed to generate project.');
    } finally {
      setIsGeneratingProject(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* 1. Main Hero Banner */}
      <div className="p-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
          <Smartphone className="w-72 h-72 -rotate-12 text-emerald-400" />
        </div>

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/30">
            <Zap className="w-3.5 h-3.5" />
            <span>{isAr ? 'مركز تصدير وتحويل الـ APK' : 'APK Converter & Builder Center'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {isAr
              ? 'تحويل تطبيقك إلى ملف APK وتثبيته على هاتفك 📱'
              : 'Convert Your App into an Installable Android APK 📱'}
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {isAr
              ? 'نوفر لك خيارات متكاملة للحصول على ملف APK حقيقي: سواء كنت تريد بناء مشروعك الحالي داخل الاستوديو بعد تعديله وتوقيعه، أو تحويل موقعك وتطبيق الويب إلى حزمة APK حقيقية.'
              : 'Complete options to get a genuine Android APK: build your current edited APK project directly with custom signatures, or convert any web application into a native Android APK.'}
          </p>
        </div>
      </div>

      {/* 2. Primary Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Build & Sign APK from current project */}
        <div className="p-6 rounded-2xl border border-emerald-500/30 bg-slate-950/60 relative overflow-hidden flex flex-col justify-between space-y-6 shadow-xl shadow-emerald-950/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isAr ? '1. بناء وتوقيع ملف الـ APK الحالي' : '1. Build & Sign Current APK'}
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    {isAr ? 'المشروع الحالي في المحرر' : 'Current Editor Project'}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-mono border border-emerald-500/20">
                v{metadata?.versionName || '1.0.0'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isAr
                ? 'يقوم محرك APK Studio بتجميع كافة التعديلات (تغيير الاسم، الأيقونة، الصلاحيات، وضع الأوفلاين، الأكواد) وتوقيع الحزمة رقمياً وتوليد ملف APK قابل للتثبيت فوراً.'
                : 'APK Studio bundles all your changes (name, icon, permissions, offline mode, code), signs the package with V1/V2 signatures, and creates a ready-to-install APK.'}
            </p>

            {/* App Specs */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{isAr ? 'اسم التطبيق:' : 'App Name:'}</span>
                <span className="text-white font-medium">{metadata?.appName || appName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{isAr ? 'اسم الحزمة (Package ID):' : 'Package ID:'}</span>
                <span className="text-indigo-400 font-mono text-[11px]">{metadata?.packageName || packageId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{isAr ? 'التوقيع الرقمي:' : 'Digital Signature:'}</span>
                <span className="text-emerald-400 font-medium">
                  {isAr ? 'V1 + V2 مفعل (تلقائي)' : 'V1 + V2 Enabled'}
                </span>
              </div>
            </div>

            {builtApkBlob && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-emerald-300 font-bold">
                    {isAr ? 'ملف الـ APK جاهز للتحميل والتثبيت!' : 'APK ready to download and install!'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(builtApkBlob.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            {builtApkBlob ? (
              <button
                onClick={handleDownloadBuiltApk}
                className="w-full py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 cursor-pointer text-sm"
              >
                <Download className="h-4 w-4" />
                <span>{isAr ? '📥 تحميل ملف الـ APK للهاتف الآن' : '📥 Download APK File to Phone'}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (onTriggerBuild) {
                    onTriggerBuild();
                  } else if (onNavigateToBuildSign) {
                    onNavigateToBuildSign();
                  }
                }}
                disabled={isBuilding}
                className="w-full py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 text-sm"
              >
                <Zap className="h-4 w-4" />
                <span>
                  {isBuilding
                    ? isAr
                      ? 'جاري تجميع وبناء ملف الـ APK...'
                      : 'Building APK...'
                    : isAr
                    ? '⚡ بدء بناء وتوقيع ملف الـ APK'
                    : '⚡ Start Building & Signing APK'}
                </span>
              </button>
            )}

            {onNavigateToBuildSign && (
              <button
                onClick={onNavigateToBuildSign}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span>{isAr ? 'خيارات متقدمة: فتح تبويب بناء وتوقيع APK' : 'Advanced: Open Build & Sign Tab'}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Web to APK Cloud Converter */}
        <div className="p-6 rounded-2xl border border-indigo-500/30 bg-slate-950/60 relative overflow-hidden flex flex-col justify-between space-y-6 shadow-xl shadow-indigo-950/20">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isAr ? '2. محول تطبيقات الويب إلى APK' : '2. Web App to APK Converter'}
                </h3>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                  {isAr ? 'تحويل أي رابط إلى APK حقيقي' : 'Turn any URL into Native APK'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isAr
                ? 'هل تريد تحويل هذا التطبيق أو موقعك الخاص إلى ملف APK للتثبيت؟ يمكنك استخدام أدوات التحويل السحابية الرسمية المعتمدة من مايكروسوفت وجوجل.'
                : 'Convert this web app or your own website into an installable Android APK using official cloud converters backed by Google and Microsoft.'}
            </p>

            {/* Quick URL Config Form */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  {isAr ? 'رابط التطبيق (Web URL):' : 'Application URL:'}
                </label>
                <input
                  type="text"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  placeholder="https://my-app.run.app"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    {isAr ? 'اسم التطبيق:' : 'App Name:'}
                  </label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    {isAr ? 'اسم الحزمة:' : 'Package ID:'}
                  </label>
                  <input
                    type="text"
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {/* PWABuilder Cloud Tool */}
            <a
              href={`https://www.pwabuilder.com?url=${encodeURIComponent(webUrl || window.location.origin)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 text-xs text-center"
            >
              <ExternalLink className="h-4 w-4" />
              <span>{isAr ? '🚀 تحويل سحابي فوري عبر PWABuilder (مجاناً)' : '🚀 1-Click Cloud APK via PWABuilder'}</span>
            </a>

            {/* Android Studio Shell Project Generator */}
            <button
              onClick={handleGenerateAndroidStudioProject}
              disabled={isGeneratingProject}
              className="w-full py-2.5 rounded-xl border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Code2 className="h-4 w-4 text-indigo-400" />
              <span>
                {isGeneratingProject
                  ? isAr
                    ? 'جاري تجهيز المشروع...'
                    : 'Generating...'
                  : isAr
                  ? 'تنزيل كود Android Studio جاهز للبناء'
                  : 'Download Android Studio WebView Project'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Comprehensive Android Installation Guide (Fixing Parse Errors) */}
      <div className="p-6 sm:p-8 rounded-3xl border border-amber-500/20 bg-slate-950/60 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {isAr
                ? 'دليل تثبيت الـ APK على الهاتف وحل مشكلة "خطأ تحليل الحزمة" (Parse Error)'
                : 'Android Installation Guide & Fixing "Parse Error"'}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'اتبع هذه الخطوات البسيطة لتثبيت أي ملف APK بنجاح على هاتفك الأندرويد دون أي أخطاء'
                : 'Follow these steps to cleanly install any APK on Android without errors'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                1
              </span>
              <h4 className="text-xs font-bold text-white">
                {isAr ? 'السماح بتثبيت التطبيقات' : 'Allow Unknown Apps'}
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr
                ? 'اذهب إلى: إعدادات الهاتف > الحماية والخصوصية > تثبيت تطبيقات غير معروفة > فعّل الخيار لمتصفح Chrome أو مدير الملفات.'
                : 'Settings > Apps > Special App Access > Install Unknown Apps > Enable for Chrome or your File Manager.'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                2
              </span>
              <h4 className="text-xs font-bold text-white">
                {isAr ? 'التحقق من صيغة الملف (.apk)' : 'Verify File Extension'}
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr
                ? 'تأكد أن اسم الملف ينتهي بـ .apk وليس .zip أو .txt. إذا قام هاتفك بتغيير الاسم، قم بإعادة تسميته ليصبح app.apk.'
                : 'Ensure file ends with .apk, not .zip or .txt. If renamed by the browser, rename it back to app.apk.'}
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                3
              </span>
              <h4 className="text-xs font-bold text-white">
                {isAr ? 'التوقيع الرقمي والتوافق' : 'Signature & Compatibility'}
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr
                ? 'تأكد دائماً من الضغط على "بناء وتوقيع" في الاستوديو، لأن نظام أندرويد يرفض تماماً تثبيت أي حزمة غير موقعة رقمياً.'
                : 'Always use Build & Sign in the studio. Android OS strictly rejects installing unsigned or corrupt APK packages.'}
            </p>
          </div>
        </div>

        {/* ADB Quick Command Box */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'أمر التثبيت المباشر عبر الكمبيوتر (ADB):' : 'Direct Install via PC (ADB):'}
            </span>
            <code className="block text-xs font-mono text-emerald-400 select-all">
              adb install -r -d app_modded.apk
            </code>
          </div>
          <button
            onClick={() => handleCopy('adb install -r -d app_modded.apk', 'adb')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            {copiedCmd === 'adb' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedCmd === 'adb' ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الأمر' : 'Copy')}</span>
          </button>
        </div>
      </div>

      {/* 4. Alternative Formats (PWA & Source ZIP) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option 3: Instant PWA Install */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isAr ? 'تثبيت فوري للشاشة الرئيسية (PWA)' : 'Instant Home Screen App (PWA)'}
                </h3>
                <span className="text-[10px] text-slate-500 uppercase font-bold">No APK file required</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isAr
                ? 'يعمل كتطبيق مستقل خفيف على شاشة هاتفك الرئيسية، يفتح بسرعة بدون شريط المتصفح وبدون استهلاك مساحة تخزين.'
                : 'Runs as a lightweight standalone app on your home screen, opens without browser UI, and uses zero extra storage.'}
            </p>
          </div>

          <button
            onClick={handleInstallPWA}
            disabled={isInstalled}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-xs ${
              isInstalled
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 cursor-pointer'
            }`}
          >
            {isInstalled ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            <span>
              {isInstalled
                ? isAr
                  ? 'التطبيق مثبت بالفعل'
                  : 'Already Installed'
                : isAr
                ? 'إضافة إلى الشاشة الرئيسية للهاتف'
                : 'Add to Home Screen'}
            </span>
          </button>
        </div>

        {/* Option 4: Full Source ZIP */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FileArchive className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isAr ? 'تصدير ملفات المشروع (ZIP)' : 'Export Project Files (ZIP)'}
                </h3>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Source Code & Assets</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isAr
                ? 'تنزيل أرشيف مضغوط يحتوي على كافة ملفات المانيفست والموارد المعدلة لاستخدامه كنسخة احتياطية أو للتعديل الخارجي.'
                : 'Download a compressed ZIP archive of all manifest, string, and asset files for backup or external editing.'}
            </p>
          </div>

          <button
            onClick={async () => {
              if (onExportZip) {
                setIsGeneratingZip(true);
                try {
                  await onExportZip();
                } finally {
                  setIsGeneratingZip(false);
                }
              }
            }}
            disabled={isGeneratingZip}
            className="w-full py-3 rounded-xl border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <FileArchive className="h-4 w-4" />
            <span>
              {isGeneratingZip
                ? isAr
                  ? 'جاري الضغط...'
                  : 'Compressing...'
                : isAr
                ? 'تصدير كـ ZIP'
                : 'Export as ZIP'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
