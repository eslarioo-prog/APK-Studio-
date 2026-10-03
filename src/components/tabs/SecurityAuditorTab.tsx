import React, { useMemo } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Search, CheckCircle2, Lock, Eye, AlertCircle, Info } from 'lucide-react';
import { Language, t } from '../../i18n/translations';
import { ApkMetadata, ApkPermission, ApkStringResource } from '../../types/apk';

interface SecurityAuditorTabProps {
  lang: Language;
  metadata: ApkMetadata;
  permissions: ApkPermission[];
  stringsList: ApkStringResource[];
}

interface AuditIssue {
  id: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  recommendationAr: string;
  recommendationEn: string;
  category: 'manifest' | 'permissions' | 'strings' | 'code';
}

export const SecurityAuditorTab: React.FC<SecurityAuditorTabProps> = ({
  lang,
  metadata,
  permissions,
  stringsList,
}) => {
  const isAr = lang === 'ar';
  const strings = t[lang];

  const auditResults = useMemo(() => {
    const issues: AuditIssue[] = [];

    // 1. MANIFEST CHECKS
    if (metadata.debuggable) {
      issues.push({
        id: 'debuggable_true',
        severity: 'high',
        titleAr: 'وضع التصحيح مفعل (Debuggable)',
        titleEn: 'Debuggable Mode Enabled',
        descriptionAr: 'التطبيق يسمح بربط المصححات الخارجية مما يسهل عملية الهندسة العكسية وسرقة البيانات.',
        descriptionEn: 'The application allows external debuggers to attach, making reverse engineering and data theft significantly easier.',
        recommendationAr: 'قم بتعطيل android:debuggable في ملف المانيفست قبل النشر.',
        recommendationEn: 'Set android:debuggable to false in the AndroidManifest.xml before distribution.',
        category: 'manifest',
      });
    }

    if (metadata.allowBackup) {
      issues.push({
        id: 'allow_backup_true',
        severity: 'medium',
        titleAr: 'السماح بالنسخ الاحتياطي (AllowBackup)',
        titleEn: 'adb backup Enabled',
        descriptionAr: 'يمكن للمهاجمين استخراج بيانات التطبيق الحساسة عبر أوامر adb backup دون الحاجة لروت.',
        descriptionEn: 'Attackers can extract sensitive application data via adb backup commands without requiring root access.',
        recommendationAr: 'قم بتعطيل android:allowBackup إذا كان التطبيق يتعامل مع بيانات خاصة.',
        recommendationEn: 'Set android:allowBackup to false if the app handles private user data.',
        category: 'manifest',
      });
    }

    if (metadata.usesCleartextTraffic) {
      issues.push({
        id: 'cleartext_traffic',
        severity: 'high',
        titleAr: 'السماح ببيانات HTTP غير مشفرة',
        titleEn: 'Cleartext Traffic Allowed',
        descriptionAr: 'التطبيق يسمح بالاتصال عبر بروتوكول HTTP غير المشفر، مما يعرض البيانات لخطر التنصت (Man-in-the-middle).',
        descriptionEn: 'The app allows unencrypted HTTP connections, exposing data to man-in-the-middle (MITM) attacks.',
        recommendationAr: 'استخدم HTTPS فقط وقم بتعطيل usesCleartextTraffic.',
        recommendationEn: 'Use HTTPS only and disable usesCleartextTraffic.',
        category: 'manifest',
      });
    }

    // 2. PERMISSION CHECKS
    const dangerousPerms = permissions.filter(p => p.isEnabled && p.category === 'dangerous');
    if (dangerousPerms.length > 5) {
      issues.push({
        id: 'too_many_perms',
        severity: 'medium',
        titleAr: 'عدد كبير من الصلاحيات الخطيرة',
        titleEn: 'Excessive Dangerous Permissions',
        descriptionAr: 'التطبيق يطلب صلاحيات وصول واسعة للبيانات الشخصية والعتاد مما يثير الريبة.',
        descriptionEn: 'The app requests extensive access to personal data and hardware, which increases the attack surface.',
        recommendationAr: 'راجع قائمة الصلاحيات وقم بإزالة ما ليس ضرورياً لعمل التطبيق.',
        recommendationEn: 'Review the permissions list and remove those not strictly necessary for core functionality.',
        category: 'permissions',
      });
    }

    // 3. STRING CHECKS (Hardcoded Secrets)
    const secretKeywords = ['api_key', 'secret', 'password', 'token', 'private', 'auth_key', 'client_id'];
    stringsList.forEach(s => {
      const keyLower = s.key.toLowerCase();
      if (secretKeywords.some(k => keyLower.includes(k))) {
        issues.push({
          id: `secret_string_${s.key}`,
          severity: 'high',
          titleAr: `احتمال وجود مفتاح سري مخزن: ${s.key}`,
          titleEn: `Potential Hardcoded Secret Found: ${s.key}`,
          descriptionAr: `تم العثور على نص مخزن في الموارد يحمل اسم يوحي بأنه مفتاح API أو رمز توثيق.`,
          descriptionEn: `A resource string was found with a key name suggesting it might be an API key or authentication token.`,
          recommendationAr: 'تجنب تخزين المفاتيح الحساسة في ملفات الـ XML. استخدم نظام KeyStore أو جلبها من السيرفر.',
          recommendationEn: 'Avoid storing sensitive keys in XML files. Use Android KeyStore or fetch them from a secure server.',
          category: 'strings',
        });
      }
    });

    return issues;
  }, [metadata, permissions, stringsList]);

  const score = useMemo(() => {
    const high = auditResults.filter(i => i.severity === 'high').length;
    const med = auditResults.filter(i => i.severity === 'medium').length;
    const low = auditResults.filter(i => i.severity === 'low').length;
    
    let base = 100;
    base -= (high * 15);
    base -= (med * 8);
    base -= (low * 3);
    
    return Math.max(0, base);
  }, [auditResults]);

  return (
    <div className="space-y-6">
      {/* 1. Overview Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Score Card */}
        <div className="lg:col-span-1 p-6 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{isAr ? 'درجة الأمان الإجمالية' : 'Overall Security Score'}</h3>
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-slate-800"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={364.4}
                strokeDashoffset={364.4 - (364.4 * score) / 100}
                className={`transition-all duration-1000 ${
                  score > 80 ? 'text-emerald-500' : score > 50 ? 'text-amber-500' : 'text-rose-500'
                }`}
              />
            </svg>
            <span className="absolute text-3xl font-black text-white">{score}%</span>
          </div>
          <div className="space-y-1">
            <p className={`text-xs font-bold ${score > 80 ? 'text-emerald-400' : score > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
              {score > 80 ? (isAr ? 'التطبيق محمي جيداً' : 'Well Protected') : score > 50 ? (isAr ? 'يحتاج تحسينات أمنية' : 'Needs Improvements') : (isAr ? 'خطر أمني مرتفع' : 'High Security Risk')}
            </p>
            <p className="text-[10px] text-slate-500">{isAr ? 'بناءً على فحص المانيفست والصلاحيات والموارد' : 'Based on manifest, permissions, and resource audit'}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="h-5 w-5" />
              <span className="text-sm font-bold">{isAr ? 'ثغرات عالية الخطورة' : 'High Severity'}</span>
            </div>
            <span className="text-3xl font-black text-white">{auditResults.filter(i => i.severity === 'high').length}</span>
          </div>
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-bold">{isAr ? 'تنبيهات متوسطة' : 'Medium Severity'}</span>
            </div>
            <span className="text-3xl font-black text-white">{auditResults.filter(i => i.severity === 'medium').length}</span>
          </div>
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-blue-400">
              <Info className="h-5 w-5" />
              <span className="text-sm font-bold">{isAr ? 'ملاحظات عامة' : 'General Info'}</span>
            </div>
            <span className="text-3xl font-black text-white">{auditResults.filter(i => i.severity === 'info' || i.severity === 'low').length}</span>
          </div>
          <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-bold">{isAr ? 'نقاط القوة' : 'Secure Points'}</span>
            </div>
            <span className="text-3xl font-black text-white">4</span>
          </div>
        </div>
      </div>

      {/* 2. Detailed Findings List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Search className="h-4 w-4 text-cyan-400" />
          <span>{isAr ? 'نتائج الفحص التفصيلية' : 'Detailed Audit Findings'}</span>
        </h3>

        {auditResults.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-slate-800 text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-400">{isAr ? 'لم يتم العثور على أي مشاكل أمنية واضحة. التطبيق يبدو سليماً!' : 'No obvious security issues found. The app looks clean!'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {auditResults.map(issue => (
              <div
                key={issue.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row gap-4 transition-all hover:translate-x-1 ${
                  issue.severity === 'high' 
                    ? 'border-rose-500/30 bg-rose-500/5' 
                    : issue.severity === 'medium' 
                    ? 'border-amber-500/30 bg-amber-500/5' 
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 h-fit ${
                  issue.severity === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  <ShieldAlert className="h-5 w-5" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white">{isAr ? issue.titleAr : issue.titleEn}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase border border-slate-700">
                      {issue.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isAr ? issue.descriptionAr : issue.descriptionEn}
                  </p>
                  <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/50 flex items-start gap-3">
                    <Lock className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-emerald-400/90 italic">
                      <span className="font-bold underline not-italic mr-1">{isAr ? 'التوصية:' : 'Recommendation:'}</span>
                      {isAr ? issue.recommendationAr : issue.recommendationEn}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
