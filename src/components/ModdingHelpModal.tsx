import React from 'react';
import { X, HelpCircle, WifiOff, KeyRound, FileCode, ShieldCheck, Bug, Terminal, Smartphone } from 'lucide-react';
import { Language } from '../i18n/translations';

interface ModdingHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const ModdingHelpModal: React.FC<ModdingHelpModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;
  const isAr = lang === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {isAr ? 'دليل استخدام محرر ومصحح تطبيقات أندرويد (APK Studio)' : 'APK Studio & Modder Guide'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed text-slate-300">
          {/* Section 1: Online to Offline */}
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-emerald-400 flex items-center gap-2 text-sm">
              <WifiOff className="h-4 w-4" />
              <span>1. {isAr ? 'التحويل من أونلاين إلى أوفلاين (Online to Offline)' : 'Converting Online to Offline'}</span>
            </h4>
            <p>
              {isAr
                ? 'يعتمد التحويل على إلغاء فحص خادم التوثيق السحابي، إعادة توجيه استدعاءات API الخارجية إلى المضيف المحلي (127.0.0.1)، وتفعيل تخزين البيانات في الذاكرة الداخلية للهاتف بدلاً من اشتراط وجود اتصال نشط بالإنترنت.'
                : 'Bypasses cloud server authentication ping, redirects external API calls to localhost (127.0.0.1), and enforces local storage caching.'}
            </p>
          </div>

          {/* Section 2: Passwords and Username */}
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-indigo-400 flex items-center gap-2 text-sm">
              <KeyRound className="h-4 w-4" />
              <span>2. {isAr ? 'تعديل اسم المستخدم وكلمات المرور (Credentials Editor)' : 'Changing Passwords and Usernames'}</span>
            </h4>
            <p>
              {isAr
                ? 'يقوم البرنامج بفحص ملفات الإعدادات (JSON, Properties, strings.xml, classes.dex) واكتشاف الحسابات وكلمات المرور المضمنة. يمكنك تعديلها مباشرة أو تفعيل "التجاوز الشامل لكلمة المرور" لقبول أي رمز يدخله المستخدم.'
                : 'Scans JSON configs, strings.xml, and DEX bytecode for embedded credentials, allowing direct modification and universal password bypass.'}
            </p>
          </div>

          {/* Section 3: In-File Data */}
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-emerald-400 flex items-center gap-2 text-sm">
              <FileCode className="h-4 w-4" />
              <span>3. {isAr ? 'تعديل البيانات داخل الملفات (In-File Data Modifier)' : 'Editing In-File Data'}</span>
            </h4>
            <p>
              {isAr
                ? 'يتيح لك تعديل محتويات ملفات JSON، XML، وملفات الخصائص في مجلد assets/، مع ميزة "البحث والاستبدال الشامل" لتغيير أي نص أو رابط أو معرف عبر جميع ملفات الحزمة بنقرة واحدة.'
                : 'Inspect and modify JSON, XML, and properties files in assets/, with global search & replace across the entire archive.'}
            </p>
          </div>

          {/* Section 4: Signature Preservation */}
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-amber-400 flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4" />
              <span>4. {isAr ? 'حفظ توقيع البرنامج وإعادته (Signature Preservation)' : 'Original Signature Preservation'}</span>
            </h4>
            <p>
              {isAr
                ? 'يقوم المحرر تلقائياً بعمل نسخة احتياطية من ملفات التوقيع والشهادات الرقمية الأصلية (META-INF) فور تحميل التطبيق، ويتيح لك في تبويب "البناء والتوقيع" خيار إعادة حقن التوقيع الأصلي أو التوقيع بمفتاح ديباج مخصص.'
                : 'Automatically backs up original META-INF certificate blocks before edits, allowing seamless restoration or debug signing upon completion.'}
            </p>
          </div>

          {/* Section 5: Debugger & Decompiler */}
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-cyan-400 flex items-center gap-2 text-sm">
              <Bug className="h-4 w-4" />
              <span>5. {isAr ? 'تصحيح الأخطاء وتفكيك الحزمة (Debugger & Decompiler)' : 'Debugger & Decompiler'}</span>
            </h4>
            <p>
              {isAr
                ? 'استعراض سجلات النظام (Logcat) مع فلترة بالمستوى والتصنيف، وضع نقاط التوقف (Breakpoints) لمحاكاة إيقاف التنفيذ، فحص وتعديل متغيرات الذاكرة في وقت التشغيل، وتصفح هيكل الملفات وكود Smali وJava المفكك.'
                : 'Filterable Android Logcat, breakpoints management, live runtime variables inspector, and hierarchical decompiled Java & Smali viewer.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
          >
            {isAr ? 'فهمت، إغلاق الدليل' : 'Understood, Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
