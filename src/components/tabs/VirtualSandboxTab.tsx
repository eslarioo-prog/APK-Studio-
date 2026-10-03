import React, { useState } from 'react';
import { Layers, Zap, Shield, Cpu, Monitor, Play, Smartphone, Package, Plus, Trash2, Settings, Terminal, CheckCircle2, AlertTriangle, Fingerprint } from 'lucide-react';
import { Language } from '../../i18n/translations';

interface VirtualSandboxProps {
  lang: Language;
}

export const VirtualSandboxTab: React.FC<VirtualSandboxProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [isVMEnabled, setIsVMEnabled] = useState(false);
  const [isRootActive, setIsRootActive] = useState(false);
  const [isGmsActive, setIsGmsActive] = useState(true);
  const [sandboxApps, setSandboxApps] = useState([
    { id: '1', name: 'File Manager (Root)', package: 'com.android.fm.root', icon: '📁' },
    { id: '2', name: 'Terminal Emulator', package: 'jackpal.androidterm', icon: '⌨️' },
  ]);

  const [toast, setToast] = useState<string | null>(null);

  const toggleVM = () => {
    setIsVMEnabled(!isVMEnabled);
    setToast(isAr ? (isVMEnabled ? 'تم تعطيل البيئة المعزولة' : 'تم تفعيل الـ Virtual Sandbox بنجاح!') : (isVMEnabled ? 'Sandbox Disabled' : 'Virtual Sandbox Enabled Successfully!'));
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddApp = () => {
    const name = prompt(isAr ? 'اسم التطبيق المراد تثبيته في البيئة الوهمية:' : 'App name to install in virtual env:');
    if (name) {
      setSandboxApps([...sandboxApps, { id: Date.now().toString(), name, package: 'custom.pkg.' + Date.now(), icon: '📦' }]);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-4 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
            <Layers className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white mb-1">
              {isAr ? 'محاكي أندرويد مدمج (Embedded Virtual VM)' : 'Embedded Android VM (Sandbox)'}
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {isAr 
                ? 'تقنية حقن بيئة معزولة (Sandbox) داخل الـ APK المعدل. تسمح هذه الميزة للمستخدم بتشغيل تطبيقات أخرى بداخل تطبيقك، أو تفعيل صلاحيات الروت وهمياً لتجربة أدوات الفحص دون المساس بنظام الهاتف الأصلي.' 
                : 'Inject an isolated sandbox environment directly into your modded APK. Run internal apps, enable virtual root access, and use inspection tools without affecting the host operating system.'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleVM}
          className={`flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow-xl ${
            isVMEnabled 
              ? 'bg-rose-500 text-white shadow-rose-500/20' 
              : 'bg-indigo-500 text-white shadow-indigo-500/20 hover:bg-indigo-400'
          }`}
        >
          <Play className={`h-4 w-4 ${isVMEnabled ? 'fill-current' : ''}`} />
          <span>{isVMEnabled ? (isAr ? 'تعطيل المحاكي المدمج' : 'Disable Virtual VM') : (isAr ? 'تفعيل وحقن المحاكي' : 'Enable & Inject VM')}</span>
        </button>
      </div>

      {toast && (
        <div className="flex items-center gap-2 p-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-fadeIn">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2. Configuration Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Settings className="h-4 w-4 text-indigo-400" />
              <span>{isAr ? 'إعدادات البيئة الوهمية' : 'VM Configuration'}</span>
            </h3>

            {/* Virtual Root Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isRootActive ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-500'}`}>
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{isAr ? 'تفعيل الروت الوهمي' : 'Enable Virtual Root'}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Mock su / Magisk Bridge</span>
                </div>
              </div>
              <button
                onClick={() => setIsRootActive(!isRootActive)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${isRootActive ? 'bg-rose-500' : 'bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${isRootActive ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Google Services (GMS) Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isGmsActive ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{isAr ? 'خدمات جوجل وهمية' : 'Mock GMS Support'}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Google Play Services Core</span>
                </div>
              </div>
              <button
                onClick={() => setIsGmsActive(!isGmsActive)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${isGmsActive ? 'bg-blue-500' : 'bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${isGmsActive ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Xposed / Hooking Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800 opacity-60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-800 text-slate-500">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{isAr ? 'نظام Xposed مدمج' : 'Xposed Framework'}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Runtime Hooking Layer</span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-tighter">{isAr ? 'قريباً' : 'Soon'}</span>
            </div>
          </div>

          {/* Security Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">{isAr ? 'إخلاء مسؤولية' : 'Security Disclaimer'}</span>
            </div>
            <p className="text-[10px] text-amber-200/60 leading-relaxed">
              {isAr 
                ? 'تفعيل الروت والبيئات الوهمية قد يؤدي إلى اكتشاف التطبيق من قبل أنظمة الحماية (SafetyNet / Play Integrity). تأكد من تفعيل وضع "التخفي" في إعدادات الحماية.' 
                : 'Enabling root and virtual environments may trigger anti-cheat or security detections (SafetyNet). Ensure Stealth Mode is active in Security settings.'}
            </p>
          </div>
        </div>

        {/* 3. App Management inside VM */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 flex flex-col h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  {isAr ? 'تطبيقات مثبتة داخل البيئة الوهمية' : 'Apps Installed in Virtual VM'}
                </h3>
              </div>
              <button
                onClick={handleAddApp}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{isAr ? 'تثبيت تطبيق داخلي' : 'Install Internal App'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sandboxApps.map(app => (
                <div key={app.id} className="group p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-indigo-500/30 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{app.icon}</div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{app.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{app.package}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSandboxApps(sandboxApps.filter(a => a.id !== app.id))}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {sandboxApps.length === 0 && (
                <div className="col-span-full py-16 text-center space-y-3">
                  <Monitor className="h-10 w-10 text-slate-800 mx-auto" />
                  <p className="text-xs text-slate-500 italic">{isAr ? 'لا توجد تطبيقات إضافية داخل المحاكي حالياً' : 'No internal apps in virtual VM'}</p>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-800/60">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 animate-pulse">
                  <Terminal className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-indigo-300">{isAr ? 'وحدة التحكم (Virtual Console) نشطة' : 'Virtual Console Active'}</p>
                  <p className="text-[9px] text-indigo-400/60 font-mono truncate">root@android_virtual:/ # waiting for commands...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
