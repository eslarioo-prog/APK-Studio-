import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Plus, Search, Trash2, CheckCircle2, CheckSquare, Square, Filter } from 'lucide-react';
import { Language, t } from '../../i18n/translations';
import { ApkPermission } from '../../types/apk';

// Comprehensive permissions list including all permissions from the user's Package Manager screenshot
export const ALL_KNOWN_PERMISSIONS: ApkPermission[] = [
  {
    name: 'android.permission.ACCESS_ADSERVICES_AD_ID',
    labelAr: 'ACCESS_ADSERVICES_AD_ID',
    labelEn: 'ACCESS_ADSERVICES_AD_ID',
    descriptionAr: 'معرف الإعلانات في Privacy Sandbox (Description for ACCESS_ADSERVICES_AD_ID)',
    descriptionEn: "Description for 'ACCESS_ADSERVICES_AD_ID' is not available",
    category: 'tracking',
    isEnabled: true,
  },
  {
    name: 'com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE',
    labelAr: 'com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE',
    labelEn: 'com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE',
    descriptionAr: 'خدمة إحالة وتتبع تثبيت التطبيق من Google Play Store',
    descriptionEn: "Description for 'COM.GOOGLE.ANDROID.FINSKY.PERMISSION.BIND_GET_INSTALL_REFERRER_SERVICE' is not available",
    category: 'tracking',
    isEnabled: true,
  },
  {
    name: 'android.permission.WRITE_EXTERNAL_STORAGE',
    labelAr: 'WRITE_EXTERNAL_STORAGE',
    labelEn: 'WRITE_EXTERNAL_STORAGE',
    descriptionAr: 'يسمح للتطبيق بالكتابة في وحدة التخزين الخارجية (Allows an application to write to external storage)',
    descriptionEn: 'Allows an application to write to external storage',
    category: 'dangerous',
    isEnabled: false,
  },
  {
    name: 'android.permission.READ_EXTERNAL_STORAGE',
    labelAr: 'READ_EXTERNAL_STORAGE',
    labelEn: 'READ_EXTERNAL_STORAGE',
    descriptionAr: 'يسمح للتطبيق بقراءة الملفات من وحدة التخزين الخارجية (Allows an application to read from external storage)',
    descriptionEn: 'Allows an application to read from external storage',
    category: 'dangerous',
    isEnabled: false,
  },
  {
    name: 'android.permission.FOREGROUND_SERVICE',
    labelAr: 'FOREGROUND_SERVICE',
    labelEn: 'FOREGROUND_SERVICE',
    descriptionAr: 'يسمح للتطبيق العادي بتشغيل خدمة في الواجهة والمقدمة (Allows a regular application to use Service.startForeground)',
    descriptionEn: 'Allows a regular application to use Service.startForeground.',
    category: 'normal',
    isEnabled: true,
  },
  {
    name: 'android.permission.FOREGROUND_SERVICE_DATA_SYNC',
    labelAr: 'FOREGROUND_SERVICE_DATA_SYNC',
    labelEn: 'FOREGROUND_SERVICE_DATA_SYNC',
    descriptionAr: 'خدمة تشغيل بالمقدمة لمزامنة البيانات في الخلفية (Description for FOREGROUND_SERVICE_DATA_SYNC)',
    descriptionEn: "Description for 'FOREGROUND_SERVICE_DATA_SYNC' is not available",
    category: 'normal',
    isEnabled: true,
  },
  {
    name: 'android.permission.RECORD_AUDIO',
    labelAr: 'RECORD_AUDIO',
    labelEn: 'RECORD_AUDIO',
    descriptionAr: 'يسمح للتطبيق بتسجيل الصوت من الميكروفون (Allows an application to record audio)',
    descriptionEn: 'Allows an application to record audio',
    category: 'dangerous',
    isEnabled: false,
  },
  {
    name: 'android.permission.READ_CONTACTS',
    labelAr: 'READ_CONTACTS',
    labelEn: 'READ_CONTACTS',
    descriptionAr: 'يسمح للتطبيق بقراءة بيانات جهات الاتصال الخاصة بالمستخدم (Allows an application to read the user\'s contacts data)',
    descriptionEn: "Allows an application to read the user's contacts data",
    category: 'dangerous',
    isEnabled: false,
  },
  {
    name: 'android.permission.WAKE_LOCK',
    labelAr: 'WAKE_LOCK',
    labelEn: 'WAKE_LOCK',
    descriptionAr: 'استخدام أقفال الطاقة لمنع المعالج من النوم أو إعتام الشاشة (Use PowerManager WakeLocks)',
    descriptionEn: 'Use PowerManager WakeLocks to keep processor from sleeping or screen from dimming',
    category: 'normal',
    isEnabled: true,
  },
  {
    name: 'android.permission.POST_NOTIFICATIONS',
    labelAr: 'POST_NOTIFICATIONS',
    labelEn: 'POST_NOTIFICATIONS',
    descriptionAr: 'إرسال وعرض الإشعارات للمستخدم على أندرويد 13 فما فوق (Post notifications)',
    descriptionEn: "Description for 'POST_NOTIFICATIONS' is not available",
    category: 'normal',
    isEnabled: false,
  },
  {
    name: 'android.permission.VIBRATE',
    labelAr: 'VIBRATE',
    labelEn: 'VIBRATE',
    descriptionAr: 'الوصول إلى هزاز الهاتف والمؤثرات اللمسية (Allows access to the vibrator)',
    descriptionEn: 'Allows access to the vibrator',
    category: 'normal',
    isEnabled: true,
  },
  {
    name: 'com.google.android.c2dm.permission.RECEIVE',
    labelAr: 'com.google.android.c2dm.permission.RECEIVE',
    labelEn: 'com.google.android.c2dm.permission.RECEIVE',
    descriptionAr: 'استقبال رسائل الإشعارات السحابية Firebase / Cloud-to-Device Messaging',
    descriptionEn: "Description for 'COM.GOOGLE.ANDROID.C2DM.PERMISSION.RECEIVE' is not available",
    category: 'normal',
    isEnabled: true,
  },
  {
    name: 'android.permission.ACCESS_ADSERVICES_ATTRIBUTION',
    labelAr: 'ACCESS_ADSERVICES_ATTRIBUTION',
    labelEn: 'ACCESS_ADSERVICES_ATTRIBUTION',
    descriptionAr: 'قياس إسناد وتتبع حملات الإعلانات في Privacy Sandbox (Description for ACCESS_ADSERVICES_ATTRIBUTION)',
    descriptionEn: "Description for 'ACCESS_ADSERVICES_ATTRIBUTION' is not available",
    category: 'tracking',
    isEnabled: true,
  },
];

interface PermissionsTabProps {
  lang: Language;
  permissions: ApkPermission[];
  onTogglePermission: (name: string) => void;
  onStripTracking: () => void;
  onAddPermission: (name: string, label: string) => void;
  onRemovePermission: (name: string) => void;
  onBatchSetPermissions?: (permissions: ApkPermission[]) => void;
}

export const PermissionsTab: React.FC<PermissionsTabProps> = ({
  lang,
  permissions,
  onTogglePermission,
  onStripTracking,
  onAddPermission,
  onRemovePermission,
  onBatchSetPermissions,
}) => {
  const strings = t[lang];
  const isAr = lang === 'ar';
  const [search, setSearch] = useState('');
  const [customPermName, setCustomPermName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewStyle, setViewStyle] = useState<'smartpack' | 'standard'>('smartpack');

  // Merge loaded permissions with known permissions from the screenshot
  const allPermMap = new Map<string, ApkPermission>();
  ALL_KNOWN_PERMISSIONS.forEach(p => allPermMap.set(p.name, { ...p }));
  permissions.forEach(p => allPermMap.set(p.name, { ...p }));

  const mergedList = Array.from(allPermMap.values());

  const filteredPerms = mergedList.filter(
    p => p.name.toLowerCase().includes(search.toLowerCase()) ||
         (isAr ? p.labelAr : p.labelEn).toLowerCase().includes(search.toLowerCase()) ||
         p.descriptionEn.toLowerCase().includes(search.toLowerCase()) ||
         p.descriptionAr.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = mergedList.filter(p => p.isEnabled).length;
  const dangerousCount = mergedList.filter(p => p.isEnabled && p.category === 'dangerous').length;

  const handleStrip = () => {
    onStripTracking();
    setToastMessage(isAr ? 'تمت إزالة أذونات التتبع والموقع بنجاح!' : 'Tracking and location permissions removed!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPermName.trim()) return;
    const cleanName = customPermName.trim().startsWith('android.permission.') || customPermName.trim().includes('.')
      ? customPermName.trim()
      : `android.permission.${customPermName.trim()}`;
    onAddPermission(cleanName, customPermName.trim());
    setCustomPermName('');
    setToastMessage(isAr ? 'تمت إضافة الصلاحية بنجاح!' : 'Permission added!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLoadScreenshotPreset = () => {
    if (onBatchSetPermissions) {
      onBatchSetPermissions(ALL_KNOWN_PERMISSIONS);
      setToastMessage(
        isAr
          ? 'تم استيراد كافة الصلاحيات الموضحة في لقطة الشاشة (13 صلاحية) بنجاح!'
          : 'Imported all permissions from screenshot (13 permissions) successfully!'
      );
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-white">
                {strings.permissionsTab.title}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                Package Manager Style
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>{activeCount} {strings.permissionsTab.activeCount}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400 font-semibold">{dangerousCount} {strings.permissionsTab.dangerousCount}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500">إجمالي {mergedList.length} صلاحية مدرجة</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onBatchSetPermissions && (
            <button
              onClick={handleLoadScreenshotPreset}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap cursor-pointer shadow-sm"
              title="Load exact permissions from the screenshot"
            >
              <CheckSquare className="h-4 w-4 text-emerald-400" />
              <span>{isAr ? 'تطبيق صلاحيات لقطة الشاشة' : 'Import Screenshot Permissions'}</span>
            </button>
          )}

          <button
            onClick={handleStrip}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap cursor-pointer shadow-sm"
          >
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            <span>{strings.permissionsTab.stripTrackingBtn}</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2 p-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search Bar - Styled identically to the screenshot search input */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder={isAr ? 'بحث في أسماء الصلاحيات ووصفها (مثل: RECORD_AUDIO, AD_ID, STORAGE)...' : 'Search permissions (e.g. RECORD_AUDIO, AD_ID, STORAGE)...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm font-mono ps-11 pe-4 py-3 rounded-full bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-rose-400/80 shadow-inner"
          />
        </div>

        {/* Add Custom Form */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            placeholder={isAr ? 'أدخل اسم صلاحية مخصصة: com.google.android.c2dm.permission.RECEIVE...' : 'Add custom permission name...'}
            value={customPermName}
            onChange={(e) => setCustomPermName(e.target.value)}
            className="flex-1 font-mono text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-hidden focus:border-emerald-500"
          />
          <button
            type="submit"
            className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isAr ? 'إضافة صلاحية' : 'Add'}</span>
          </button>
        </form>
      </div>

      {/* Permissions List - Matching the user's Package Manager screenshot design */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 divide-y divide-slate-900 overflow-hidden shadow-xl">
        {filteredPerms.map((perm) => {
          const shortName = perm.name.startsWith('android.permission.')
            ? perm.name.replace('android.permission.', '')
            : perm.name;

          return (
            <div
              key={perm.name}
              onClick={() => onTogglePermission(perm.name)}
              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-900/60 transition-colors cursor-pointer select-none"
            >
              {/* Left: Shield outline icon + Details */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div className="pt-0.5 text-rose-300/80 shrink-0">
                  <Shield className="h-6 w-6 stroke-[1.75]" />
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-rose-200 tracking-wide break-all">
                      {shortName}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 italic font-sans leading-relaxed line-clamp-2">
                    {isAr ? perm.descriptionAr : perm.descriptionEn}
                  </p>

                  <span className="text-[10px] font-mono text-slate-600 block truncate">
                    {perm.name}
                  </span>
                </div>
              </div>

              {/* Right: Checkbox like in screenshot */}
              <div className="shrink-0 pe-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePermission(perm.name);
                  }}
                  className={`w-6 h-6 rounded flex items-center justify-center transition-colors cursor-pointer border ${
                    perm.isEnabled
                      ? 'bg-rose-400/90 border-rose-400 text-slate-950 font-bold'
                      : 'bg-transparent border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {perm.isEnabled && (
                    <CheckSquare className="h-4 w-4 stroke-[3]" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

