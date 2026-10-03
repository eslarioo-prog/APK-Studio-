import React from 'react';
import { Download, HelpCircle, Globe, RefreshCw } from 'lucide-react';
import { Language, t } from '../i18n/translations';
import { ApkMetadata } from '../types/apk';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  metadata: ApkMetadata | null;
  onOpenHelp: () => void;
  onTriggerBuild: () => void;
  onResetProject: () => void;
  isBuilding: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  onOpenHelp,
  onTriggerBuild,
  onResetProject,
  isBuilding,
}) => {
  const strings = t[lang];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 gap-4">
        
        {/* Zone 1: اسم المنصة والشعار مع حماية الهيكل لضمان عدم التداخل */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <img 
              src="/src/assets/images/apk_studio_logo_1791001735844.jpg" 
              alt="APK Studio Logo" 
              className="h-10 w-10 shrink-0 rounded-xl object-cover border border-emerald-500/30 shadow-md shadow-emerald-500/5"
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
          </div>
          
          <div className="flex flex-col justify-center min-w-[120px] [direction:ltr] text-left">
            <span className="text-base sm:text-lg font-black tracking-wide text-white leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              APK Studio
            </span>
            <span className="text-[11px] font-medium text-slate-400 leading-tight">
              {lang === 'ar' ? 'منصة تعديل وتصحيح التطبيقات' : 'Android Modding Platform'}
            </span>
          </div>
        </div>

        {/* Zone 2: الأزرار والعمليات السريعة */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* إعادة ضبط بيئة العمل */}
          <button
            onClick={onResetProject}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 bg-slate-900 border border-slate-800 rounded-lg transition-all active:scale-95 cursor-pointer"
            title={lang === 'ar' ? 'إعادة ضبط بيئة العمل' : 'Reset Workspace'}
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* تفعيل المساعدة والدليل التعليمي */}
          <button
            onClick={onOpenHelp}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-all active:scale-95 cursor-pointer"
            title={strings.common.help}
          >
            <HelpCircle className="h-4 w-4 text-slate-400" />
            <span>{strings.common.help}</span>
          </button>

          {/* تبديل لغة الواجهة فورياً */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-all font-mono active:scale-95 cursor-pointer"
          >
            <Globe className="h-4 w-4 text-emerald-400" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
