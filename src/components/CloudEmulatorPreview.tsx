import React, { useMemo } from 'react';
import { Smartphone, Wifi, Battery, Clock, Home, ArrowLeft, Menu, Monitor, Eye, Zap, AlertCircle } from 'lucide-react';
import { Language } from '../i18n/translations';
import { ApkMetadata } from '../types/apk';

interface CloudEmulatorPreviewProps {
  lang: Language;
  metadata: ApkMetadata;
  xmlContent: string; // Android layout XML
  onClose: () => void;
}

export const CloudEmulatorPreview: React.FC<CloudEmulatorPreviewProps> = ({
  lang,
  metadata,
  xmlContent,
  onClose,
}) => {
  const isAr = lang === 'ar';
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  // Simple parser to extract some text for the mock UI
  const mockText = useMemo(() => {
    const match = xmlContent.match(/android:text="([^"]+)"/);
    return match ? match[1] : (isAr ? 'واجهة التطبيق' : 'App Interface');
  }, [xmlContent, isAr]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex flex-col md:flex-row gap-6 max-w-5xl w-full h-[90vh]">
        
        {/* Device Frame */}
        <div className="relative w-[320px] h-[650px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl shadow-emerald-500/20 shrink-0 mx-auto md:mx-0 overflow-hidden">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20" />
          
          {/* Screen Content */}
          <div className="absolute inset-0 bg-[#090D16] flex flex-col">
            {/* Status Bar */}
            <div className="h-7 px-6 flex items-center justify-between text-[10px] text-white/90 z-10 pt-2">
              <span className="font-bold">{time}</span>
              <div className="flex items-center gap-1.5">
                <Wifi className="h-3 w-3" />
                <Battery className="h-3 w-3 rotate-90" />
              </div>
            </div>

            {/* Mock App UI */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* App Bar */}
              <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center gap-3">
                <Menu className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-bold text-white truncate">{metadata.appName}</span>
              </div>

              {/* Dynamic Content based on XML */}
              <div className="flex-1 p-6 space-y-6">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">{isAr ? 'معاينة حية' : 'Live Preview'}</h4>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed text-center">
                    {isAr ? 'هذا محاكي بصري يعرض منطق الواجهة المستخلص من ملف الـ XML المعدل.' : 'Visual emulator displaying layout logic parsed from your modified XML.'}
                  </p>
                  
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-cyan-400" />
                      <span className="text-[11px] font-bold text-slate-300">Parsed Text Content:</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-mono">
                      {mockText}
                    </div>
                  </div>
                </div>

                {/* Simulated list items */}
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 rounded-lg bg-slate-900/50 border border-slate-800 animate-pulse" />
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Bar */}
            <div className="h-12 bg-slate-900/80 border-t border-slate-800 flex items-center justify-around px-8">
              <ArrowLeft className="h-4 w-4 text-slate-500" />
              <Home className="h-4 w-4 text-slate-500" />
              <div className="w-4 h-4 rounded-sm border-2 border-slate-500" />
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="flex-1 flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Monitor className="h-8 w-8 text-emerald-400" />
              <span>{isAr ? 'محاكي الواجهة السحابي' : 'Cloud UI Emulator'}</span>
            </h2>
            <p className="text-slate-400 leading-relaxed">
              {isAr 
                ? 'استعرض شكل وتنسيق التطبيق فورياً دون الحاجة لتثبيته. يقوم المحاكي بتحليل ملفات الـ XML وعرض المكونات الرسومية وتوزيع العناصر بشكل تفاعلي.'
                : 'Preview your app layout and styling instantly without installation. The emulator parses XML files and renders graphical components and element distribution interactively.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Target Device</span>
              <p className="text-sm font-bold text-white">Pixel 8 Pro (Mock)</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">OS Layer</span>
              <p className="text-sm font-bold text-white">Android 14 (API 34)</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/80 leading-relaxed">
              {isAr 
                ? 'ملاحظة: هذا محاكي للواجهة الرسومية فقط. الوظائف البرمجية (Logic) تتطلب التثبيت على جهاز حقيقي.' 
                : 'Note: This is a layout emulator only. Custom bytecode logic and patches require installation on a physical device.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer active:scale-95 border border-slate-700"
          >
            {isAr ? 'إغلاق المعاينة' : 'Close Preview'}
          </button>
        </div>

      </div>
    </div>
  );
};
