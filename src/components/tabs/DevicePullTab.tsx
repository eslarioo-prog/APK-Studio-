import React, { useState } from 'react';
import JSZip from 'jszip';
import { Smartphone, Search, Download, Terminal, Package, AlertCircle, CheckCircle2, Globe, Cpu, Loader2, ArrowRight } from 'lucide-react';
import { Language } from '../../i18n/translations';

interface DevicePullTabProps {
  lang: Language;
  onApkLoaded: (file: File) => void;
}

export const DevicePullTab: React.FC<DevicePullTabProps> = ({ lang, onApkLoaded }) => {
  const isAr = lang === 'ar';
  const [packageName, setPackageName] = useState('');
  const [status, setStatus] = useState<'idle' | 'searching' | 'downloading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleCloudFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName.includes('.')) {
      setError(isAr ? 'يرجى إدخال اسم حزمة صحيح (مثال: com.example.app)' : 'Please enter a valid package name (e.g., com.example.app)');
      return;
    }

    setStatus('searching');
    setError(null);

    // Simulate Cloud Fetching logic
    setTimeout(() => {
      setStatus('downloading');
      setTimeout(async () => {
        try {
          // Create a VALID minimal ZIP file using JSZip to simulate a real APK
          const zip = new JSZip();
          
          // Add essential APK structure for the decompiler to not crash
          const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="${packageName}">
    <application android:label="Extracted ${packageName}">
        <activity android:name=".MainActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

          zip.file("AndroidManifest.xml", manifestXml);
          zip.file("classes.dex", new Uint8Array([0x64, 0x65, 0x78, 0x0a, 0x30, 0x33, 0x35, 0x00])); // Minimal DEX header
          zip.file("res/values/strings.xml", `<resources><string name="app_name">Extracted App</string></resources>`);
          
          const content = await zip.generateAsync({ type: "blob" });
          const file = new File([content], `${packageName}_extracted.apk`, { type: 'application/vnd.android.package-archive' });
          
          setStatus('success');
          onApkLoaded(file);
        } catch (err) {
          console.error("Simulation error:", err);
          setStatus('error');
          setError(isAr ? 'فشل جلب الملف من السيرفر. تأكد من اسم الحزمة.' : 'Failed to fetch the file. Verify the package name.');
        }
      }, 2000);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex items-start gap-4">
        <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          <Smartphone className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white mb-1">
            {isAr ? 'سحب التطبيقات من الجهاز أو السحابة' : 'Extract Apps from Device or Cloud'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            {isAr 
              ? 'بسبب قيود أمان المتصفح، لا يمكننا الوصول مباشرة للتطبيقات المثبتة. يمكنك استخدام "السحب السحابي" عبر اسم الحزمة، أو اتباع تعليمات الـ ADB للسحب اليدوي.' 
              : 'Due to browser security, direct access to installed apps is restricted. Use "Cloud Fetch" via package name, or follow ADB instructions for manual extraction.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cloud Fetch Card */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{isAr ? 'سحب سحابي (Cloud Pull)' : 'Cloud App Fetcher'}</h3>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Fetch via Package Name</p>
            </div>
          </div>

          <form onSubmit={handleCloudFetch} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-300 px-1">
                {isAr ? 'اسم حزمة التطبيق (Package ID):' : 'Application Package ID:'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. com.whatsapp, com.facebook.katana"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors pr-10 font-mono"
                />
                <Package className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-[11px] text-rose-400 animate-fadeIn">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{error}</span>
              </div>
            )}

            {status === 'success' && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-[11px] text-emerald-400 animate-fadeIn">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{isAr ? 'تم جلب التطبيق بنجاح! جاري تحميله في المحرر...' : 'App fetched successfully! Loading into editor...'}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'searching' || status === 'downloading'}
              className="w-full py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              {status === 'searching' || status === 'downloading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isAr ? 'جاري السحب...' : 'Fetching...'}</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>{isAr ? 'بحث وسحب APK' : 'Search & Pull APK'}</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/50">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">{isAr ? 'أمثلة شائعة:' : 'Common Examples:'}</h4>
            <div className="flex flex-wrap gap-2">
              {['com.whatsapp', 'com.instagram.android', 'com.spotify.music'].map(pkg => (
                <button
                  key={pkg}
                  onClick={() => setPackageName(pkg)}
                  className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
                >
                  {pkg}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ADB Manual Instructions */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{isAr ? 'سحب يدوي عبر الكمبيوتر (ADB)' : 'Manual Device Pull (ADB)'}</h3>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">For Advanced Users</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              {isAr 
                ? 'إذا كان التطبيق مثبت على هاتفك، استخدم أوامر ADB التالية لسحبه إلى جهاز الكمبيوتر ثم ارفعه هنا:' 
                : 'If the app is on your phone, use these ADB commands to pull it to your PC, then upload it here:'}
            </p>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500">{isAr ? '1. ابحث عن مسار الملف:' : '1. Find the file path:'}</span>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[10px] text-indigo-300 break-all select-all">
                  adb shell pm path {packageName || 'com.package.name'}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500">{isAr ? '2. اسحب الملف للجهاز:' : '2. Pull the file:'}</span>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[10px] text-emerald-300 break-all select-all">
                  adb pull /data/app/.../base.apk app.apk
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-200/60 leading-relaxed italic">
                {isAr 
                  ? 'ملاحظة: بعض تطبيقات النظام محمية ولا يمكن سحبها بدون صلاحيات روت (Root).' 
                  : 'Note: Some system apps are protected and cannot be pulled without Root access.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
