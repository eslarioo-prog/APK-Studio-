import React, { useState } from 'react';
import {
  SlidersHorizontal,
  BookmarkCheck,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  Trash2,
  Copy,
  Shield,
  Key,
  Cpu,
  FileCode2,
  Sparkles,
  WifiOff,
  Bug,
  Smartphone,
  Info,
  Check,
  AlertCircle,
  FolderArchive,
  Layers,
} from 'lucide-react';
import { Language } from '../../i18n/translations';
import { ApkMetadata, CodePatch, SigningConfig, ApkPermission } from '../../types/apk';
import { BuildProfile } from '../../types/buildProfile';

interface BuildProfilesTabProps {
  lang: Language;
  metadata: ApkMetadata;
  patches: CodePatch[];
  signingConfig: SigningConfig;
  permissions: ApkPermission[];
  profiles: BuildProfile[];
  activeProfileId: string | null;
  onApplyProfile: (profile: BuildProfile) => void;
  onSaveProfile: (newProfile: BuildProfile) => void;
  onDeleteProfile: (profileId: string) => void;
  onExportProfiles: () => void;
  onImportProfiles: (file: File) => void;
}

export const BuildProfilesTab: React.FC<BuildProfilesTabProps> = ({
  lang,
  metadata,
  patches,
  signingConfig,
  permissions,
  profiles,
  activeProfileId,
  onApplyProfile,
  onSaveProfile,
  onDeleteProfile,
  onExportProfiles,
  onImportProfiles,
}) => {
  const isAr = lang === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewProfile, setPreviewProfile] = useState<BuildProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New profile form state
  const [newNameAr, setNewNameAr] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newDescAr, setNewDescAr] = useState('');
  const [newDescEn, setNewDescEn] = useState('');
  const [newCategory, setNewCategory] = useState<BuildProfile['category']>('custom');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApply = (profile: BuildProfile) => {
    onApplyProfile(profile);
    showToast(
      isAr
        ? `تم تطبيق بروفايل "${profile.nameAr}" بنجاح على التطبيق!`
        : `Profile "${profile.nameEn}" successfully applied!`
    );
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameAr.trim()) {
      showToast(isAr ? 'يرجى إدخال اسم البروفايل!' : 'Please enter profile name!');
      return;
    }

    const appliedPatchIds = patches.filter(p => p.isApplied).map(p => p.id);

    const newProfile: BuildProfile = {
      id: `profile_custom_${Date.now()}`,
      nameAr: newNameAr.trim(),
      nameEn: newNameEn.trim() || newNameAr.trim(),
      descriptionAr: newDescAr.trim() || (isAr ? 'بروفايل مخصص محفوظ من الإعدادات الحالية' : 'Custom profile saved from current settings'),
      descriptionEn: newDescEn.trim() || 'Custom profile configuration',
      category: newCategory,
      isBuiltIn: false,
      createdAt: new Date().toISOString().split('T')[0],
      manifest: {
        debuggable: metadata.debuggable,
        allowBackup: metadata.allowBackup,
        usesCleartextTraffic: metadata.usesCleartextTraffic,
        minSdk: metadata.minSdk,
        targetSdk: metadata.targetSdk,
        orientation: metadata.orientation,
      },
      appliedPatchIds,
      signing: {
        signingMode: signingConfig.signingMode,
        v1Signing: signingConfig.v1Signing,
        v2Signing: signingConfig.v2Signing,
        zipAlign: signingConfig.zipAlign,
        preserveOriginalMetaInf: signingConfig.preserveOriginalMetaInf,
      },
    };

    onSaveProfile(newProfile);
    setIsCreateModalOpen(false);
    setNewNameAr('');
    setNewNameEn('');
    setNewDescAr('');
    setNewDescEn('');
    showToast(isAr ? 'تم حفظ البروفايل الجديد بنجاح!' : 'New build profile created!');
  };

  const handleDuplicate = (profile: BuildProfile) => {
    const duplicated: BuildProfile = {
      ...profile,
      id: `profile_custom_${Date.now()}`,
      nameAr: `${profile.nameAr} (نسخة)`,
      nameEn: `${profile.nameEn} (Copy)`,
      isBuiltIn: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    onSaveProfile(duplicated);
    showToast(isAr ? 'تم نسخ البروفايل بنجاح!' : 'Profile duplicated!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportProfiles(file);
      showToast(isAr ? 'جاري استيراد ملف البروفايلات...' : 'Importing profiles file...');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredProfiles = profiles.filter(p => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'custom') return !p.isBuiltIn;
    return p.category === selectedCategory;
  });

  const getCategoryBadge = (category: BuildProfile['category']) => {
    switch (category) {
      case 'offline':
        return {
          label: isAr ? 'أوفلاين' : 'Offline',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: WifiOff,
        };
      case 'debug':
        return {
          label: isAr ? 'تصحيح وفحص' : 'Debugger',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: Bug,
        };
      case 'cloning':
        return {
          label: isAr ? 'استنساخ' : 'Cloning',
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          icon: Copy,
        };
      case 'security':
        return {
          label: isAr ? 'أمان وروت' : 'Security',
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          icon: Shield,
        };
      case 'production':
        return {
          label: isAr ? 'إنتاج وتوقيع' : 'Production',
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          icon: Key,
        };
      default:
        return {
          label: isAr ? 'مخصص' : 'Custom',
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          icon: SlidersHorizontal,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <SlidersHorizontal className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-white">
                {isAr ? 'نظام بروفايلات البناء (Build Profiles)' : 'Build Profiles & Presets System'}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Preset Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {isAr
                ? 'احفظ مجموعات الإعدادات والترقيعات (Patches) وخيارات التوقيع الرقمي وتعديلات المانيفست في بروفايلات قابلة لإعادة الاستخدام بضغطة زر واحدة دون الحاجة لتكرار الضبط في كل مرة!'
                : 'Save reusable presets combining code patches, signature mechanisms, and manifest modifications. Switch configurations in a single click!'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-indigo-400 hover:bg-indigo-300 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{isAr ? 'حفظ الإعدادات الحالية كبروفايل' : 'Save Current Settings'}</span>
          </button>

          <button
            onClick={onExportProfiles}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title={isAr ? 'تصدير البروفايلات كملف JSON' : 'Export Profiles to JSON'}
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isAr ? 'تصدير' : 'Export'}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title={isAr ? 'استيراد بروفايل من ملف JSON' : 'Import Profile JSON'}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>{isAr ? 'استيراد' : 'Import'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2 p-3 text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Current Active Configuration Snapshot */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-200">
              {isAr ? 'الحالة الحالية للتطبيق قيد التعديل (Current App State):' : 'Current Active Configuration:'}
            </h3>
            {activeProfileId && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                {isAr ? 'مُطابق للبروفايل المفعّل' : 'Active Profile Linked'}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {metadata.appName} ({metadata.packageName})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/70">
            <span className="text-[10px] text-slate-400 block mb-1">
              {isAr ? 'المانيفست (Manifest)' : 'Manifest'}
            </span>
            <div className="space-y-0.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">debuggable:</span>
                <span className={metadata.debuggable ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                  {String(metadata.debuggable)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">cleartext:</span>
                <span className={metadata.usesCleartextTraffic ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {String(metadata.usesCleartextTraffic)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/70">
            <span className="text-[10px] text-slate-400 block mb-1">
              {isAr ? 'الترقيعات (Patches)' : 'Code Patches'}
            </span>
            <div className="font-mono text-[11px] text-indigo-300 font-bold">
              {patches.filter(p => p.isApplied).length} / {patches.length} {isAr ? 'ترقيع مفعّل' : 'active'}
            </div>
            <span className="text-[10px] text-slate-500 block truncate">
              {patches.filter(p => p.isApplied).map(p => p.titleAr).join(', ') || (isAr ? 'لا يوجد' : 'None')}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/70">
            <span className="text-[10px] text-slate-400 block mb-1">
              {isAr ? 'وضع التوقيع (Signing)' : 'Signing Mode'}
            </span>
            <div className="font-mono text-[11px] text-emerald-400 font-bold">
              {signingConfig.signingMode === 'original_preserved'
                ? (isAr ? '🛡️ التوقيع الأصلي المحفوظ' : '🛡️ Preserved Signature')
                : signingConfig.signingMode === 'debug'
                ? (isAr ? '🔑 مفتاح Debug Key' : '🔑 Debug Keystore')
                : (isAr ? '🔒 Keystore مخصص' : '🔒 Custom Keystore')}
            </div>
            <span className="text-[10px] text-slate-500">
              V1: {signingConfig.v1Signing ? '✓' : '✗'} | V2: {signingConfig.v2Signing ? '✓' : '✗'} | Align: {signingConfig.zipAlign ? '✓' : '✗'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/70 flex flex-col justify-center">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full py-1.5 px-2 text-[11px] font-bold text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/30 rounded border border-indigo-500/30 transition-colors text-center cursor-pointer"
            >
              {isAr ? 'حفظ كبروفايل جديد 💾' : 'Save As Profile 💾'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { key: 'all', labelAr: 'جميع البروفايلات', labelEn: 'All Profiles', count: profiles.length },
          { key: 'offline', labelAr: 'أوفلاين وتخطي السيرفر', labelEn: 'Offline Bypass', count: profiles.filter(p => p.category === 'offline').length },
          { key: 'debug', labelAr: 'فحص وتصحيح Debug', labelEn: 'Debugging', count: profiles.filter(p => p.category === 'debug').length },
          { key: 'cloning', labelAr: 'استنساخ التطبيق', labelEn: 'Cloning', count: profiles.filter(p => p.category === 'cloning').length },
          { key: 'security', labelAr: 'أمان وتخطي الروت', labelEn: 'Security & Root', count: profiles.filter(p => p.category === 'security').length },
          { key: 'production', labelAr: 'إنتاج وتوقيع أصلي', labelEn: 'Production & Sign', count: profiles.filter(p => p.category === 'production').length },
          { key: 'custom', labelAr: 'بروفايلاتي المخصصة', labelEn: 'My Custom Presets', count: profiles.filter(p => !p.isBuiltIn).length },
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === cat.key
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span>{isAr ? cat.labelAr : cat.labelEn}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-950 text-slate-400">
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProfiles.map(profile => {
          const badge = getCategoryBadge(profile.category);
          const BadgeIcon = badge.icon;
          const isActive = activeProfileId === profile.id;

          return (
            <div
              key={profile.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isActive
                  ? 'border-indigo-500/60 bg-indigo-950/20 shadow-lg shadow-indigo-950/30'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-semibold ${badge.bg}`}>
                      <BadgeIcon className="h-3.5 w-3.5" />
                      <span>{badge.label}</span>
                    </span>
                    {profile.isBuiltIn ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {isAr ? 'مدمج' : 'Built-in'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {isAr ? 'مخصص' : 'Custom'}
                      </span>
                    )}
                  </div>

                  {/* Actions for custom profiles */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(profile)}
                      title={isAr ? 'نسخ البروفايل' : 'Duplicate Profile'}
                      className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    {!profile.isBuiltIn && (
                      <button
                        onClick={() => onDeleteProfile(profile.id)}
                        title={isAr ? 'حذف البروفايل' : 'Delete Profile'}
                        className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Desc */}
                <h4 className="text-sm font-bold text-white mb-1">
                  {isAr ? profile.nameAr : profile.nameEn}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-3 mb-3 leading-relaxed">
                  {isAr ? profile.descriptionAr : profile.descriptionEn}
                </p>

                {/* Configuration Breakdown Chips */}
                <div className="space-y-1.5 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 mb-3 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 text-slate-400">
                      <FileCode2 className="h-3 w-3" />
                      <span>Manifest:</span>
                    </span>
                    <span className="text-slate-200">
                      {profile.manifest.debuggable ? 'Debuggable' : 'Release'}
                      {profile.manifest.usesCleartextTraffic && ' + Cleartext'}
                      {profile.manifest.packageNameSuffix && ` (${profile.manifest.packageNameSuffix})`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Cpu className="h-3 w-3" />
                      <span>Patches:</span>
                    </span>
                    <span className="text-indigo-400 font-bold">
                      {profile.appliedPatchIds.length} {isAr ? 'ترقيع' : 'patches'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Key className="h-3 w-3" />
                      <span>Signature:</span>
                    </span>
                    <span className="text-emerald-400">
                      {profile.signing.signingMode === 'original_preserved'
                        ? '🛡️ Original Preserved'
                        : profile.signing.signingMode === 'debug'
                        ? '🔑 Debug Keystore'
                        : '🔒 Keystore'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Apply Button */}
              <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPreviewProfile(profile)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {isAr ? 'فحص التفاصيل' : 'View Specs'}
                </button>

                <button
                  onClick={() => handleApply(profile)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>{isAr ? 'مفعّل حالياً' : 'Active'}</span>
                    </>
                  ) : (
                    <>
                      <BookmarkCheck className="h-3.5 w-3.5" />
                      <span>{isAr ? 'تطبيق البروفايل ⚡' : 'Apply Preset ⚡'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Profile from Current Settings */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  {isAr ? 'حفظ إعدادات البناء كبروفايل جديد' : 'Save As New Build Profile'}
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'اسم البروفايل (عربي)' : 'Profile Name (Arabic)'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: إعدادات الاختبار الداخلي ومحاكاة السيرفر' : 'e.g. My Internal Testing Preset'}
                  value={newNameAr}
                  onChange={e => setNewNameAr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'اسم البروفايل بالإنجليزية (اختياري)' : 'Profile Name (English - Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Internal Testing & Server Mock"
                  value={newNameEn}
                  onChange={e => setNewNameEn(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'تصنيف البروفايل' : 'Category'}
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="custom">{isAr ? 'مخصص (Custom)' : 'Custom'}</option>
                  <option value="offline">{isAr ? 'أوفلاين (Offline)' : 'Offline'}</option>
                  <option value="debug">{isAr ? 'فحص وتصحيح (Debugging)' : 'Debugging'}</option>
                  <option value="cloning">{isAr ? 'استنساخ (Cloning)' : 'Cloning'}</option>
                  <option value="security">{isAr ? 'أمان وروت (Security & Root)' : 'Security & Root'}</option>
                  <option value="production">{isAr ? 'إنتاج وتوقيع (Production)' : 'Production'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'وصف البروفايل' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  placeholder={isAr ? 'اشرح ما يقوم به هذا البروفايل لتتذكره لاحقاً...' : 'Describe what this preset modifies...'}
                  value={newDescAr}
                  onChange={e => setNewDescAr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Summary of what will be saved */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-bold text-slate-200 block mb-1">
                  {isAr ? 'سيتم تضمين الإعدادات الحالية التالية في البروفايل:' : 'The following current settings will be baked in:'}
                </span>
                <div>• Manifest: debuggable={String(metadata.debuggable)}, cleartext={String(metadata.usesCleartextTraffic)}</div>
                <div>• Patches: {patches.filter(p => p.isApplied).length} applied patches</div>
                <div>• Signing: Mode={signingConfig.signingMode}, v1={String(signingConfig.v1Signing)}, v2={String(signingConfig.v2Signing)}</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-indigo-400 hover:bg-indigo-300 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  {isAr ? 'حفظ البروفايل الآن' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Specs / Details */}
      {previewProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  {isAr ? previewProfile.nameAr : previewProfile.nameEn}
                </h3>
              </div>
              <button
                onClick={() => setPreviewProfile(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr ? previewProfile.descriptionAr : previewProfile.descriptionEn}
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-400 font-bold mb-1">Manifest Configuration:</div>
                <pre className="text-[11px] text-emerald-400 whitespace-pre-wrap">
                  {JSON.stringify(previewProfile.manifest, null, 2)}
                </pre>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-400 font-bold mb-1">Signing Settings:</div>
                <pre className="text-[11px] text-indigo-300 whitespace-pre-wrap">
                  {JSON.stringify(previewProfile.signing, null, 2)}
                </pre>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-400 font-bold mb-1">Applied Patches ({previewProfile.appliedPatchIds.length}):</div>
                <div className="text-[11px] text-slate-300">
                  {previewProfile.appliedPatchIds.length > 0
                    ? previewProfile.appliedPatchIds.join(', ')
                    : (isAr ? 'لا توجد ترقيعات في هذا البروفايل' : 'No patches attached')}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setPreviewProfile(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
              <button
                onClick={() => {
                  handleApply(previewProfile);
                  setPreviewProfile(null);
                }}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-indigo-400 hover:bg-indigo-300 rounded-lg cursor-pointer"
              >
                {isAr ? 'تطبيق هذا البروفايل ⚡' : 'Apply Preset ⚡'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
