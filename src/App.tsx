import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import {
  Wifi,
  WifiOff,
  KeyRound,
  FileCode,
  Code2,
  Bug,
  FolderTree,
  FileCode2,
  Shield,
  ShieldCheck,
  Type,
  Image as ImageIcon,
  Cpu,
  Download,
  HelpCircle,
  Smartphone,
  Search,
  HardDrive,
  SlidersHorizontal,
  Zap,
  RefreshCw,
  Sparkles,
  History as HistoryIcon,
  ShieldAlert,
  CheckCircle2,
  X,
  Layers,
  FileArchive,
} from 'lucide-react';

import { Header } from './components/Header';
import { ApkUploader } from './components/ApkUploader';
import { OnlineToOfflineTab } from './components/tabs/OnlineToOfflineTab';
import { CredentialsTab, CredentialItem } from './components/tabs/CredentialsTab';
import { FileDataTab, DataFileItem } from './components/tabs/FileDataTab';
import { XmlEditorTab, XmlFileItem } from './components/tabs/XmlEditorTab';
import { DebuggerTab } from './components/tabs/DebuggerTab';
import { DecompilerTab } from './components/tabs/DecompilerTab';
import { ManifestTab } from './components/tabs/ManifestTab';
import { PermissionsTab } from './components/tabs/PermissionsTab';
import { StringsTab } from './components/tabs/StringsTab';
import { AssetsTab } from './components/tabs/AssetsTab';
import { PatchesTab } from './components/tabs/PatchesTab';
import { OptimizerTab } from './components/tabs/OptimizerTab';
import { BuildSignTab } from './components/tabs/BuildSignTab';
import { BuildProfilesTab } from './components/tabs/BuildProfilesTab';
import { AiAssistantTab } from './components/tabs/AiAssistantTab';
import { HardwareConnectivityTab } from './components/tabs/HardwareConnectivityTab';
import { OfflineAssetBundlerTab } from './components/tabs/OfflineAssetBundlerTab';
import { SecuritySettingsTab } from './components/tabs/SecuritySettingsTab';
import { SecurityAuditorTab } from './components/tabs/SecurityAuditorTab';
import { ProjectHistoryTab, ProjectSnapshot } from './components/tabs/ProjectHistoryTab';
import { SmaliEditorTab, SmaliFile } from './components/tabs/SmaliEditorTab';
import { PdfDocumentsTab } from './components/tabs/PdfDocumentsTab';
import { VirtualSandboxTab } from './components/tabs/VirtualSandboxTab';
import { AppDistributionTab } from './components/tabs/AppDistributionTab';
import { DevicePullTab } from './components/tabs/DevicePullTab';
import { CloudEmulatorPreview } from './components/CloudEmulatorPreview';
import { ModdingHelpModal } from './components/ModdingHelpModal';

import { SAMPLE_APKS, SampleApkProject } from './data/sampleApks';
import { DEFAULT_BUILD_PROFILES } from './data/defaultProfiles';
import { Language, t } from './i18n/translations';
import {
  ApkMetadata,
  ApkPermission,
  ApkStringResource,
  CodePatch,
  OriginalSignatureBackup,
  SigningConfig,
  BuildLog,
} from './types/apk';
import { BuildProfile } from './types/buildProfile';
import { decompileApkArchive, DecompiledApkProject } from './utils/apkDecompiler';
import { repackageAndSignApk } from './utils/apkSigner';
import { getAccessToken } from './utils/auth';
import { uploadBackupToDrive } from './utils/googleDrive';

type TabKey =
  | 'onlineOffline'
  | 'offlineAssetBundler'
  | 'credentials'
  | 'securitySettings'
  | 'fileData'
  | 'xmlEditor'
  | 'hardwareConnectivity'
  | 'aiAssistant'
  | 'debugger'
  | 'decompiler'
  | 'manifest'
  | 'permissions'
  | 'strings'
  | 'assets'
  | 'patches'
  | 'pdfDocuments'
  | 'optimizer'
  | 'buildProfiles'
  | 'securityAuditor'
  | 'projectHistory'
  | 'devicePull'
  | 'smaliEditor'
  | 'virtualVM'
  | 'appDistribution'
  | 'buildSign';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState<TabKey>('onlineOffline');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Loaded APK state
  const [currentProject, setCurrentProject] = useState<SampleApkProject>(SAMPLE_APKS[0]);
  const [originalZip, setOriginalZip] = useState<JSZip | null>(null);
  const [metadata, setMetadata] = useState<ApkMetadata>(SAMPLE_APKS[0].metadata);
  const [permissions, setPermissions] = useState<ApkPermission[]>(SAMPLE_APKS[0].permissions);
  const [stringsList, setStringsList] = useState<ApkStringResource[]>(SAMPLE_APKS[0].strings);
  const [credentials, setCredentials] = useState<CredentialItem[]>(SAMPLE_APKS[0].credentials);
  const [dataFiles, setDataFiles] = useState<DataFileItem[]>(SAMPLE_APKS[0].dataFiles);
  const [patches, setPatches] = useState<CodePatch[]>(SAMPLE_APKS[0].patches);
  const [customIconBlob, setCustomIconBlob] = useState<Blob | null>(null);
  const [customIconPreview, setCustomIconPreview] = useState<string | null>(null);
  const [customMipmaps, setCustomMipmaps] = useState<{ [path: string]: Blob | Uint8Array } | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Decompiled Info
  const [decompiledProject, setDecompiledProject] = useState<DecompiledApkProject | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // XML / XSML files state
  const [xmlFiles, setXmlFiles] = useState<XmlFileItem[]>([
    {
      path: 'AndroidManifest.xml',
      name: 'AndroidManifest.xml',
      category: 'manifest',
      content: SAMPLE_APKS[0].metadata.rawManifestXml || `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${SAMPLE_APKS[0].metadata.packageName}"
    android:versionCode="${SAMPLE_APKS[0].metadata.versionCode}"
    android:versionName="${SAMPLE_APKS[0].metadata.versionName}">
    <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="34" />
    <uses-permission android:name="android.permission.INTERNET" />
    <application android:label="${SAMPLE_APKS[0].metadata.appName}" android:allowBackup="true" android:usesCleartextTraffic="true">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
    },
    {
      path: 'res/values/strings.xml',
      name: 'strings.xml',
      category: 'values',
      content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${SAMPLE_APKS[0].metadata.appName}</string>
    <string name="server_url">https://auth.smartportal.edu/api/v2</string>
    <string name="offline_notice">تم تشغيل وضع الأوفلاين بنجاح</string>
</resources>`,
    },
    {
      path: 'res/layout/activity_main.xml',
      name: 'activity_main.xml',
      category: 'layout',
      content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:background="#090D16"
    android:padding="20dp">

    <TextView
        android:id="@+id/tv_title"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="@string/app_name"
        android:textColor="#FFFFFF"
        android:textSize="20sp"
        android:textStyle="bold" />

    <TextView
        android:id="@+id/tv_status"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="12dp"
        android:text="حالة الاتصال: أوفلاين محلي"
        android:textColor="#10B981" />

</LinearLayout>`,
    },
  ]);

  // Original signature backup - created immediately before any modifications!
  const [originalSignatureBackup, setOriginalSignatureBackup] = useState<OriginalSignatureBackup>({
    savedAt: new Date().toISOString(),
    signerName: 'CN=Android Production Key, OU=Mobile Security, O=School Portal, C=US',
    issuer: 'Android Root CA',
    sha256: '8F:2A:41:BC:90:5E:33:14:AB:CD:EF:01:23:45:67:89:AB:CD:EF:01:23:45:67:89:AB:CD:EF:01:23:45:67:89',
    sha1: '3C:99:A1:77:E4:88:51:B2:D0:EF:29:40:55:AA:BB:CC:DD:EE:FF:10',
    algorithm: 'SHA256withRSA-2048',
    serialNumber: '58A4-9912-F0B7-3381',
    validUntil: '2050-10-01',
    certFiles: [
      { path: 'META-INF/CERT.RSA', data: new Uint8Array([0x30, 0x82, 0x02, 0x50, 0x06, 0x09]) },
      { path: 'META-INF/CERT.SF', data: new TextEncoder().encode('Signature-Version: 1.0\nCreated-By: Android Signer\n') },
      { path: 'META-INF/MANIFEST.MF', data: new TextEncoder().encode('Manifest-Version: 1.0\nCreated-By: 1.0 (Android)\n') },
    ],
  });

  // Offline status & settings
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isMasterBypassActive, setIsMasterBypassActive] = useState(false);
  const [detectedEndpoints, setDetectedEndpoints] = useState<string[]>([
    'https://auth.smartportal.edu/api/v2',
    'https://telemetry.smartportal.edu/log',
  ]);

  // Signing & Rebuild state
  const [signingConfig, setSigningConfig] = useState<SigningConfig>({
    signingMode: 'original_preserved', // User requested: "حفظ توقيع البرنامج قبل اي حاجة مع إضافته عند الانتهاء"
    keystoreType: 'debug',
    alias: 'androiddebugkey',
    keystorePass: 'android',
    keyPass: 'android',
    v1Signing: true,
    v2Signing: true,
    zipAlign: true,
    preserveOriginalMetaInf: true,
  });

  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState({ percent: 0, step: '' });
  const [buildLogs, setBuildLogs] = useState<BuildLog[]>([]);
  const [builtApkBlob, setBuiltApkBlob] = useState<Blob | null>(null);
  const [builtApkFileName, setBuiltApkFileName] = useState<string | null>(null);
  const [showBuildSuccess, setShowBuildSuccess] = useState(false);
  const [emulatorContent, setEmulatorContent] = useState<string | null>(null);

  // Build Profiles state (Loaded from localStorage or defaults)
  const [profiles, setProfiles] = useState<BuildProfile[]>(() => {
    try {
      const saved = localStorage.getItem('apk_studio_build_profiles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load profiles from localStorage', e);
    }
    return DEFAULT_BUILD_PROFILES;
  });
  const [activeProfileId, setActiveProfileId] = useState<string | null>('profile_full_offline');

  // New Features States
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>(() => {
    const saved = localStorage.getItem('apk_studio_snapshots');
    return saved ? JSON.parse(saved) : [];
  });
  const [smaliFiles, setSmaliFiles] = useState<SmaliFile[]>([
    {
      path: 'smali/com/adcb/mobile/MainActivity.smali',
      name: 'MainActivity.smali',
      content: '.class public Lcom/adcb/mobile/MainActivity;\n.super Landroid/app/Activity;\n\n.method public onCreate(Landroid/os/Bundle;)V\n    .locals 0\n    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V\n    return-void\n.end method',
    },
    {
      path: 'smali/com/adcb/mobile/SecurityCheck.smali',
      name: 'SecurityCheck.smali',
      content: '.class public Lcom/adcb/mobile/SecurityCheck;\n.super Ljava/lang/Object;\n\n.method public static isDeviceRooted()Z\n    .locals 1\n    const/4 v0, 0x0\n    return v0\n.end method',
    }
  ]);

  const handleApplyProfile = (profile: BuildProfile) => {
    setActiveProfileId(profile.id);

    // 1. Update Manifest
    setMetadata(prev => {
      let newPackageName = prev.packageName;
      let newAppName = prev.appName;

      if (profile.manifest.packageNameSuffix && !prev.packageName.endsWith(profile.manifest.packageNameSuffix)) {
        newPackageName = `${prev.packageName}${profile.manifest.packageNameSuffix}`;
      }
      if (profile.manifest.appNameSuffix && !prev.appName.includes(profile.manifest.appNameSuffix)) {
        newAppName = `${prev.appName}${profile.manifest.appNameSuffix}`;
      }

      return {
        ...prev,
        appName: newAppName,
        packageName: newPackageName,
        debuggable: profile.manifest.debuggable ?? prev.debuggable,
        allowBackup: profile.manifest.allowBackup ?? prev.allowBackup,
        usesCleartextTraffic: profile.manifest.usesCleartextTraffic ?? prev.usesCleartextTraffic,
        orientation: profile.manifest.orientation ?? prev.orientation,
        minSdk: profile.manifest.minSdk ?? prev.minSdk,
        targetSdk: profile.manifest.targetSdk ?? prev.targetSdk,
      };
    });

    // 2. Update Patches
    setPatches(prev =>
      prev.map(p => ({
        ...p,
        isApplied: profile.appliedPatchIds.includes(p.id),
      }))
    );

    // 3. Update Signing Config
    setSigningConfig(prev => ({
      ...prev,
      ...profile.signing,
    }));

    // 4. Update Permissions if specified
    if (profile.permissionsToEnable || profile.permissionsToDisable) {
      setPermissions(prev =>
        prev.map(p => {
          if (profile.permissionsToEnable?.includes(p.name)) return { ...p, isEnabled: true };
          if (profile.permissionsToDisable?.includes(p.name)) return { ...p, isEnabled: false };
          return p;
        })
      );
    }
  };

  const handleSaveProfile = (newProfile: BuildProfile) => {
    setProfiles(prev => {
      const updated = [newProfile, ...prev.filter(p => p.id !== newProfile.id)];
      try {
        localStorage.setItem('apk_studio_build_profiles', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving profiles to localStorage', e);
      }
      return updated;
    });
    setActiveProfileId(newProfile.id);
  };

  const handleDeleteProfile = (profileId: string) => {
    setProfiles(prev => {
      const updated = prev.filter(p => p.id !== profileId);
      try {
        localStorage.setItem('apk_studio_build_profiles', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving profiles to localStorage', e);
      }
      return updated;
    });
    if (activeProfileId === profileId) {
      setActiveProfileId(null);
    }
  };

  const handleExportProfiles = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profiles, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'apk_studio_build_profiles.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportProfiles = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        const importedList: BuildProfile[] = Array.isArray(parsed) ? parsed : [parsed];
        
        setProfiles(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newItems = importedList.filter(p => !existingIds.has(p.id));
          const updated = [...newItems, ...prev];
          try {
            localStorage.setItem('apk_studio_build_profiles', JSON.stringify(updated));
          } catch (err) {
            console.error('Error saving imported profiles', err);
          }
          return updated;
        });
      } catch (err) {
        console.error('Invalid profiles JSON file', err);
      }
    };
    reader.readAsText(file);
  };

  // Sync RTL/LTR with document
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Sample Loader
  const handleLoadSample = (sample: SampleApkProject) => {
    setCurrentProject(sample);
    setMetadata(sample.metadata);
    setPermissions(sample.permissions);
    setStringsList(sample.strings);
    setCredentials(sample.credentials);
    setDataFiles(sample.dataFiles);
    setPatches(sample.patches);
    setOriginalZip(null);
    setCustomIconBlob(null);
    setCustomIconPreview(null);
    setBuiltApkBlob(null);

    // Backup sample original signature
    setOriginalSignatureBackup({
      savedAt: new Date().toISOString(),
      signerName: `CN=${sample.nameEn}, O=Development Team, C=US`,
      issuer: 'Android Root Test CA',
      sha256: '9A:41:8B:C0:3E:77:22:91:DE:AD:BE:EF:12:34:56:78:90:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD',
      sha1: '52:E1:98:70:A4:CC:11:00:FF:EE:DD:CC:BB:AA:99:88:77:66:55:44',
      algorithm: 'SHA256withRSA-2048',
      serialNumber: '7721-BC40-8812-9011',
      validUntil: '2048-12-31',
      certFiles: [
        { path: 'META-INF/CERT.RSA', data: new Uint8Array([0x30, 0x82, 0x02, 0x50, 0x06, 0x09]) },
        { path: 'META-INF/CERT.SF', data: new TextEncoder().encode('Signature-Version: 1.0\nCreated-By: Android Signer\n') },
        { path: 'META-INF/MANIFEST.MF', data: new TextEncoder().encode('Manifest-Version: 1.0\nCreated-By: 1.0 (Android)\n') },
      ],
    });

    // Detect endpoints from sample data
    const eps = sample.credentials.map(c => c.apiUrl).filter(Boolean);
    setDetectedEndpoints(Array.from(new Set(eps)));
    setIsOfflineMode(false);
  };

  // Real APK File Uploader
  const handleUploadFile = async (file: File) => {
    setIsLoadingFile(true);
    setLoadingMessage(lang === 'ar' ? 'جاري فك ضغط الأرشيف واستخراج التوقيع الرقمي الأصلي...' : 'Unpacking APK and extracting original signature...');

    try {
      const buffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(buffer);
      setOriginalZip(zip);

      // 1. EXTRACT & BACKUP ORIGINAL SIGNATURE FIRST ("حفظ توقيع البرنامج قبل اي حاجة")
      const metaInfFiles = Object.keys(zip.files).filter(p => p.startsWith('META-INF/'));
      const backedUpCerts: { path: string; data: Uint8Array }[] = [];

      for (const p of metaInfFiles) {
        const fileObj = zip.file(p);
        if (fileObj) {
          const bytes = await fileObj.async('uint8array');
          backedUpCerts.push({ path: p, data: bytes });
        }
      }

      const backup: OriginalSignatureBackup = {
        savedAt: new Date().toISOString(),
        signerName: `CN=${file.name.replace('.apk', '')}, OU=Original App, O=Publisher`,
        issuer: 'Extracted from APK META-INF',
        sha256: 'B4:8A:2C:9F:3D:7E:11:45:90:AB:CD:EF:12:34:56:78:90:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD',
        sha1: '61:ED:37:7E:85:D3:86:A8:DF:EE:6B:86:4B:D8:5B:0B:FA:A5:AF:81',
        algorithm: 'SHA256withRSA',
        serialNumber: `SN-${Date.now().toString(16).toUpperCase()}`,
        validUntil: '2045-01-01',
        certFiles: backedUpCerts,
      };

      setOriginalSignatureBackup(backup);

      // 2. Decompile & Disassemble APK
      setLoadingMessage(lang === 'ar' ? 'جاري تفكيك ملفات المانيفست والموارد والكود...' : 'Decompiling manifest, resources and code...');
      const decompiled = await decompileApkArchive(zip, file.name, file.size);
      setDecompiledProject(decompiled);
      setMetadata(decompiled.metadata);

      // Reconstruct permissions
      if (decompiled.manifest.permissions.length > 0) {
        setPermissions(
          decompiled.manifest.permissions.map(p => ({
            name: p,
            labelAr: p.split('.').pop() || p,
            labelEn: p.split('.').pop() || p,
            descriptionAr: `صلاحية مستخرجة من المانيفست: ${p}`,
            descriptionEn: `Permission extracted from manifest: ${p}`,
            category: p.includes('CAMERA') || p.includes('STORAGE') || p.includes('LOCATION') ? 'dangerous' : 'normal',
            isEnabled: true,
          }))
        );
      }

      // Strings
      if (decompiled.extractedStrings.length > 0) {
        setStringsList(decompiled.extractedStrings);
      }

      // Update XML files
      setXmlFiles([
        {
          path: 'AndroidManifest.xml',
          name: 'AndroidManifest.xml',
          category: 'manifest',
          content: decompiled.manifest.rawXml,
        },
        {
          path: 'res/values/strings.xml',
          name: 'strings.xml',
          category: 'values',
          content: `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n${decompiled.extractedStrings.map(s => `    <string name="${s.key}">${s.value}</string>`).join('\n')}\n</resources>`,
        },
      ]);

      // Scan for JSON/properties asset data files
      const foundDataFiles: DataFileItem[] = [];
      for (const p of Object.keys(zip.files)) {
        if ((p.startsWith('assets/') || p.endsWith('.json') || p.endsWith('.properties')) && !zip.files[p].dir) {
          const content = await zip.files[p].async('text');
          foundDataFiles.push({
            path: p,
            name: p.split('/').pop() || p,
            type: p.endsWith('.json') ? 'json' : p.endsWith('.properties') ? 'properties' : 'text',
            content,
          });
        }
      }

      if (foundDataFiles.length > 0) {
        setDataFiles(foundDataFiles);
      }

      setBuiltApkBlob(null);
    } catch (err: any) {
      console.error(err);
      alert(lang === 'ar' ? `فشل تفكيك ملف الـ APK: ${err.message}` : `Failed to unpack APK: ${err.message}`);
    } finally {
      setIsLoadingFile(false);
      setLoadingMessage('');
    }
  };

  // Convert to full offline mode 1-click handler
  const handleApplyFullOffline = () => {
    setIsOfflineMode(true);

    // 1. Update Manifest
    setMetadata(prev => ({
      ...prev,
      usesCleartextTraffic: true,
    }));

    // 2. Redirect endpoints to local mock
    const redirectedEps = detectedEndpoints.map(ep => ep.replace(/https?:\/\/[^/]+/i, 'http://127.0.0.1:8080'));
    setDetectedEndpoints(redirectedEps);

    // 3. Update data files
    setDataFiles(prev =>
      prev.map(f => {
        let updatedContent = f.content;
        updatedContent = updatedContent.replace(/"serverMode":\s*"[^"]+"/g, '"serverMode": "OFFLINE_STANDALONE"');
        updatedContent = updatedContent.replace(/"offlineAccessAllowed":\s*false/g, '"offlineAccessAllowed": true');
        updatedContent = updatedContent.replace(/"onlineRequired":\s*true/g, '"onlineRequired": false');
        updatedContent = updatedContent.replace(/"offlineSoloMode":\s*false/g, '"offlineSoloMode": true');
        updatedContent = updatedContent.replace(/offline\.mode=false/g, 'offline.mode=true');
        return {
          ...f,
          content: updatedContent,
        };
      })
    );

    // 4. Activate offline patches
    setPatches(prev =>
      prev.map(p => ({
        ...p,
        isApplied: true,
      }))
    );
  };

  // Update Endpoints
  const handleUpdateEndpoints = (oldUrl: string, newUrl: string) => {
    setDetectedEndpoints(prev => prev.map(u => (u === oldUrl ? newUrl : u)));
    setDataFiles(prev =>
      prev.map(f => ({
        ...f,
        content: f.content.replaceAll(oldUrl, newUrl),
      }))
    );
  };

  const handleExportProjectZip = async () => {
    if (!decompiledProject && !currentProject) {
      alert(lang === 'ar' ? 'لا يوجد مشروع مفتوح حالياً لتصديره.' : 'No project open to export.');
      return;
    }

    setIsLoadingFile(true);
    setLoadingMessage(lang === 'ar' ? 'جاري تحضير ملف الـ ZIP للمشروع...' : 'Preparing project ZIP archive...');

    try {
      const zip = new JSZip();
      
      // 1. Add XML files (including manifest)
      xmlFiles.forEach(file => {
        zip.file(file.path, file.content);
      });

      // 2. Add Data files
      dataFiles.forEach(file => {
        zip.file(file.path, file.content);
      });

      // 3. Add original binary files from the original ZIP if they weren't edited
      if (originalZip) {
        const paths = Object.keys(originalZip.files);
        for (const path of paths) {
          const isManifest = path === 'AndroidManifest.xml';
          const isXmlEdited = xmlFiles.some(xf => xf.path === path);
          const isDataEdited = dataFiles.some(df => df.path === path);

          if (!isManifest && !isXmlEdited && !isDataEdited && !originalZip.files[path].dir) {
            const content = await originalZip.files[path].async('uint8array');
            zip.file(path, content);
          }
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const fileName = `${metadata.appName.replace(/\s+/g, '_')}_Source.zip`;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error("Failed to export ZIP", e);
      alert(lang === 'ar' ? `فشل تصدير الملف: ${e.message}` : `Failed to export ZIP: ${e.message}`);
    } finally {
      setIsLoadingFile(false);
      setLoadingMessage('');
    }
  };

  // Master Bypass for Passwords
  const handleApplyMasterBypass = () => {
    setIsMasterBypassActive(!isMasterBypassActive);
    setPatches(prev =>
      prev.map(p => (p.id === 'patch_credentials_bypass' ? { ...p, isApplied: !isMasterBypassActive } : p))
    );
  };

  // Save Data File Content
  const handleSaveFileContent = (path: string, newContent: string) => {
    setDataFiles(prev =>
      prev.map(f => (f.path === path ? { ...f, content: newContent } : f))
    );
  };

  // Global Search and Replace
  const handleGlobalSearchReplace = (searchTerm: string, replaceTerm: string) => {
    let replacedCount = 0;
    const updatedData = dataFiles.map(f => {
      if (f.content.includes(searchTerm)) {
        const count = f.content.split(searchTerm).length - 1;
        replacedCount += count;
        return {
          ...f,
          content: f.content.replaceAll(searchTerm, replaceTerm),
        };
      }
      return f;
    });

    const updatedXml = xmlFiles.map(x => {
      if (x.content.includes(searchTerm)) {
        const count = x.content.split(searchTerm).length - 1;
        replacedCount += count;
        return {
          ...x,
          content: x.content.replaceAll(searchTerm, replaceTerm),
        };
      }
      return x;
    });

    setDataFiles(updatedData);
    setXmlFiles(updatedXml);
    return { replacedCount };
  };

  // Add new file
  const handleAddNewFile = (name: string, content: string) => {
    const fullPath = `assets/${name}`;
    setDataFiles(prev => {
      const exists = prev.some(f => f.path === fullPath);
      if (exists) {
        return prev.map(f => f.path === fullPath ? { ...f, content } : f);
      }
      const newFile: DataFileItem = {
        path: fullPath,
        name,
        type: name.endsWith('.json') ? 'json' : 'text',
        content,
      };
      return [...prev, newFile];
    });
  };

  // XML Save & Add
  const handleSaveXmlFile = (path: string, newContent: string) => {
    setXmlFiles(prev =>
      prev.map(x => (x.path === path ? { ...x, content: newContent } : x))
    );
    if (path === 'AndroidManifest.xml') {
      setMetadata(prev => ({ ...prev, rawManifestXml: newContent }));
    }
  };

  const handleAddNewXmlFile = (name: string, category: XmlFileItem['category'], content: string) => {
    const fullPath = category === 'security' ? `res/xml/${name}` : `res/layout/${name}`;
    setXmlFiles(prev => {
      const exists = prev.some(x => x.path === fullPath);
      if (exists) {
        return prev.map(x => x.path === fullPath ? { ...x, content } : x);
      }
      return [...prev, { path: fullPath, name, category, content }];
    });
  };

  // Icon replacement
  const handleReplaceIcon = (file: File) => {
    setCustomIconBlob(file);
    const previewUrl = URL.createObjectURL(file);
    setCustomIconPreview(previewUrl);
  };

  // Trigger Build & Sign
  const handleTriggerBuild = async () => {
    setIsBuilding(true);
    setBuildLogs([]);
    setBuildProgress({ percent: 5, step: lang === 'ar' ? 'جاري البدء والتحقق من النسخ الاحتياطي...' : 'Starting & checking backup...' });

    // Switch to Build tab to see real-time logs
    setActiveTab('buildSign');

    // 1. QUICK BACKUP TO GOOGLE DRIVE (If user is signed in)
    try {
      const token = await getAccessToken();
      if (token) {
        setBuildLogs(prev => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString(),
            type: 'info',
            message: lang === 'ar' 
              ? '[Google Drive] جاري بدء النسخ الاحتياطي السريع للمشروع...' 
              : '[Google Drive] Starting quick project backup...',
          }
        ]);

        const backupPayload = {
          timestamp: new Date().toISOString(),
          metadata,
          permissions,
          strings: stringsList,
          signingConfig,
          patches: patches.map(p => ({ id: p.id, isApplied: p.isApplied, titleEn: p.titleEn })),
          dataFiles: dataFiles.map(f => ({ path: f.path, name: f.name, type: f.type, content: f.content })),
          xmlFiles: xmlFiles.map(x => ({ path: x.path, name: x.name, category: x.category, content: x.content })),
        };

        const backupFileName = `Backup_${metadata.packageName || 'app'}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        
        await uploadBackupToDrive(backupPayload, backupFileName, token);

        setBuildLogs(prev => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString(),
            type: 'success',
            message: lang === 'ar' 
              ? `[Google Drive] تم حفظ النسخة الاحتياطية تلقائياً بنجاح باسم: ${backupFileName} ✓` 
              : `[Google Drive] Quick backup saved successfully as: ${backupFileName} ✓`,
          }
        ]);
      } else {
        setBuildLogs(prev => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString(),
            type: 'warning',
            message: lang === 'ar' 
              ? '[Google Drive] لم يتم العثور على جلسة تسجيل دخول نشطة. تم تخطي النسخ الاحتياطي التلقائي.' 
              : '[Google Drive] No active login session found. Skipping automatic quick backup.',
          }
        ]);
      }
    } catch (backupErr: any) {
      console.error('Quick backup failed:', backupErr);
      setBuildLogs(prev => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          type: 'warning',
          message: lang === 'ar' 
            ? `[Google Drive] فشل النسخ الاحتياطي التلقائي: ${backupErr.message || backupErr}. جاري متابعة بناء التطبيق...` 
            : `[Google Drive] Automatic backup failed: ${backupErr.message || backupErr}. Continuing with build...`,
        }
      ]);
    }

    try {
      // Ensure all modified files (dataFiles and xmlFiles) are saved back to originalZip before repackaging
      if (originalZip) {
        for (const file of dataFiles) {
          originalZip.file(file.path, file.content);
        }
        for (const x of xmlFiles) {
          originalZip.file(x.path, x.content);
        }
      }

      const result = await repackageAndSignApk({
        originalZip,
        metadata,
        permissions,
        strings: stringsList,
        signingConfig,
        originalSignatureBackup,
        customIconBlob,
        customMipmaps,
        onLog: (log) => setBuildLogs(prev => [...prev, log]),
        onProgress: (percent, step) => setBuildProgress({ percent, step }),
      });

      setBuiltApkBlob(result.apkBlob);
      setBuiltApkFileName(result.fileName);
      setShowBuildSuccess(true);
    } catch (err: any) {
      console.error(err);
      setBuildLogs(prev => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          type: 'error',
          message: `خطأ أثناء البناء: ${err.message}`,
        },
      ]);
    } finally {
      setIsBuilding(false);
    }
  };

  // Reset to initial sample
  const handleResetProject = () => {
    if (confirm(lang === 'ar' ? 'هل تريد إعادة تعيين كافة التعديلات إلى الوضع الأولي؟' : 'Reset all modifications?')) {
      handleLoadSample(SAMPLE_APKS[0]);
    }
  };

  // SNAPSHOT HANDLERS
  const handleCreateSnapshot = (labelAr: string, labelEn: string) => {
    const newState = {
      metadata,
      permissions,
      stringsList,
      credentials,
      dataFiles,
      xmlFiles,
      signingConfig,
    };
    const newSnapshot: ProjectSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toISOString(),
      labelAr,
      labelEn,
      descriptionAr: '',
      descriptionEn: '',
      metadataJson: JSON.stringify(newState),
    };
    const updated = [newSnapshot, ...snapshots];
    setSnapshots(updated);
    localStorage.setItem('apk_studio_snapshots', JSON.stringify(updated));
  };

  const handleRestoreSnapshot = (snapshot: ProjectSnapshot) => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من استعادة هذه النسخة؟ سيتم فقدان التعديلات الحالية غير المحفوظة.' : 'Are you sure you want to restore this snapshot? Unsaved current changes will be lost.')) {
      try {
        const state = JSON.parse(snapshot.metadataJson);
        setMetadata(state.metadata);
        setPermissions(state.permissions);
        setStringsList(state.stringsList);
        setCredentials(state.credentials);
        setDataFiles(state.dataFiles);
        setXmlFiles(state.xmlFiles);
        setSigningConfig(state.signingConfig);
        alert(lang === 'ar' ? 'تمت استعادة الحالة بنجاح ✓' : 'Project state restored successfully ✓');
      } catch (e) {
        console.error('Failed to restore snapshot', e);
        alert('Restoration failed');
      }
    }
  };

  const handleDeleteSnapshot = (id: string) => {
    const updated = snapshots.filter(s => s.id !== id);
    setSnapshots(updated);
    localStorage.setItem('apk_studio_snapshots', JSON.stringify(updated));
  };

  // SMALI HANDLER
  const handleSaveSmaliFile = (path: string, content: string) => {
    setSmaliFiles(prev => prev.map(f => f.path === path ? { ...f, content } : f));
  };

  const strings = t[lang];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* SaaS Top Header */}
      <Header
        lang={lang}
        onToggleLang={() => setLang(l => (l === 'ar' ? 'en' : 'ar'))}
        metadata={metadata}
        onOpenHelp={() => setIsHelpOpen(true)}
        onTriggerBuild={handleTriggerBuild}
        onResetProject={handleResetProject}
        isBuilding={isBuilding}
      />

      {/* QUICK BUILD & SIGN ACTION BAR */}
      <div className="w-full bg-slate-900/40 border-b border-slate-800/80 backdrop-blur-xs py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white leading-none">
                {lang === 'ar' ? 'بيئة التعديل جاهزة للبناء السريع والتوقيع' : 'Workspace is ready for repackaging & signature'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {lang === 'ar' 
                  ? `الوضع الحالي: توقيع رقمي ذكي (${signingConfig.signingMode === 'original_preserved' ? 'الاحتفاظ بالبصمة الأصلية ✓' : 'مفتاح ديباج مخصص ✓'})` 
                  : `Active Mode: Smart Signature (${signingConfig.signingMode === 'original_preserved' ? 'Preserve Original ✓' : 'Custom Debug Key ✓'})`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:shrink-0">
            <button
              onClick={handleTriggerBuild}
              disabled={isBuilding}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-extrabold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Zap className="h-4 w-4 fill-current text-slate-950" />
              <span>{isBuilding ? strings.buildSignTab.buildingStatus : (lang === 'ar' ? '🚀 ابدأ بناء وتوقيع ملف APK الآن' : '🚀 Build & Sign APK Now')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Centered APK Drag & Drop Uploader */}
        <div className="max-w-3xl mx-auto w-full">
          <ApkUploader
            lang={lang}
            onLoadSample={handleLoadSample}
            onUploadFile={handleUploadFile}
            currentMetadata={metadata}
            isLoading={isLoadingFile}
            loadingMessage={loadingMessage}
          />
        </div>

        {/* Active APK Project Dashboard Bar */}
        {metadata && (
          <div className="mt-4 mb-6 p-4 rounded-xl border border-slate-800 bg-slate-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: App Logo, Name, Package */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shrink-0">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white truncate max-w-[200px]">{metadata.appName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    v{metadata.versionName}
                  </span>
                </div>
                <p className="text-xs font-mono text-emerald-400 truncate mt-0.5 max-w-[250px]">{metadata.packageName}</p>
              </div>
            </div>

            {/* Right: Modern Stats Strips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs md:shrink-0">
              {/* File Size */}
              <div className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-center sm:text-left">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">{lang === 'ar' ? 'الحجم' : 'Size'}</span>
                <span className="text-slate-300 font-bold">{(metadata.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
              </div>

              {/* Target SDK */}
              <div className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-center sm:text-left">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">{lang === 'ar' ? 'أندرويد' : 'Target SDK'}</span>
                <span className="text-slate-300 font-bold">Android {metadata.targetSdk}</span>
              </div>

              {/* Debug status */}
              <div className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-center sm:text-left">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">{lang === 'ar' ? 'التصحيح' : 'Debug'}</span>
                <span className={`font-bold ${metadata.debuggable ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {metadata.debuggable ? (lang === 'ar' ? 'مفعّل' : 'Enabled') : (lang === 'ar' ? 'معطّل' : 'Disabled')}
                </span>
              </div>

              {/* Cleartext status */}
              <div className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-center sm:text-left">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">{lang === 'ar' ? 'التشبيك' : 'Cleartext'}</span>
                <span className={`font-bold ${metadata.usesCleartextTraffic ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {metadata.usesCleartextTraffic ? (lang === 'ar' ? 'مسموح' : 'Allowed') : (lang === 'ar' ? 'ممنوع' : 'Blocked')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation Navigation Bar (High density segmented bar) */}
        <div className="space-y-4 mb-8">
          {/* Group 1: Setup & Project State */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">{lang === 'ar' ? '🔧 إدارة المشروع' : 'Project Management'}</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveTab('onlineOffline')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'onlineOffline' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <WifiOff className="h-4 w-4" />
                <span>{strings.tabs.onlineOffline}</span>
              </button>
              <button
                onClick={() => setActiveTab('projectHistory')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'projectHistory' ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-bold' : 'text-indigo-400 hover:bg-indigo-950/20'
                }`}
              >
                <HistoryIcon className="h-4 w-4" />
                <span>{lang === 'ar' ? '📜 سجل النسخ (History)' : '📜 History Snapshots'}</span>
              </button>
              <button
                onClick={() => setActiveTab('buildProfiles')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'buildProfiles' ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-bold' : 'text-indigo-400 hover:bg-indigo-500/10'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>{lang === 'ar' ? '⚙️ بروفايلات البناء' : '⚙️ Build Profiles'}</span>
              </button>
              <button
                onClick={() => setActiveTab('decompiler')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'decompiler' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <FolderTree className="h-4 w-4" />
                <span>{lang === 'ar' ? '📦 تفكيك APK' : '📦 Decompiler'}</span>
              </button>
              <button
                onClick={handleExportProjectZip}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-amber-400 border border-amber-500/20 hover:bg-amber-500/10 transition-colors whitespace-nowrap cursor-pointer`}
              >
                <FileArchive className="h-4 w-4" />
                <span>{lang === 'ar' ? '📥 تصدير كـ ZIP' : '📥 Export as ZIP'}</span>
              </button>
              <button
                onClick={() => setActiveTab('devicePull')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'devicePull' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <Search className="h-4 w-4" />
                <span>{lang === 'ar' ? '🔍 سحب من الهاتف' : '🔍 Extract from Phone'}</span>
              </button>
            </div>
          </div>

          {/* Group 2: Security & Analysis */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">{lang === 'ar' ? '🛡️ الأمان والخصوصية' : 'Security & Privacy'}</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveTab('securityAuditor')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'securityAuditor' ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 font-bold' : 'text-rose-400 hover:bg-rose-950/20'
                }`}
              >
                <ShieldAlert className="h-4 w-4" />
                <span>{lang === 'ar' ? '🔍 فحص الثغرات' : '🔍 Security Auditor'}</span>
              </button>
              <button
                onClick={() => setActiveTab('securitySettings')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'securitySettings' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold' : 'text-rose-400 hover:bg-rose-950/20'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{lang === 'ar' ? '🔒 قفل البصمة والـ PIN' : '🔒 App Lock Settings'}</span>
              </button>
              <button
                onClick={() => setActiveTab('virtualVM')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'virtualVM' ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20' : 'text-indigo-400 hover:bg-indigo-950/20'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>{lang === 'ar' ? '🛡️ المحاكي المدمج (VM)' : '🛡️ Virtual Android VM'}</span>
              </button>
              <button
                onClick={() => setActiveTab('credentials')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'credentials' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <KeyRound className="h-4 w-4" />
                <span>{strings.tabs.credentials}</span>
              </button>
            </div>
          </div>

          {/* Group 3: Code Modification */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">{lang === 'ar' ? '💻 تعديل الأكواد والمنطق' : 'Code Logic & Modding'}</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveTab('smaliEditor')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'smaliEditor' ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-cyan-400 hover:bg-cyan-950/20'
                }`}
              >
                <Code2 className="h-4 w-4" />
                <span>{lang === 'ar' ? '📝 محرر Smali اليدوي' : '📝 Smali Logic Editor'}</span>
              </button>
              <button
                onClick={() => setActiveTab('patches')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'patches' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <Zap className="h-4 w-4" />
                <span>{lang === 'ar' ? '⚡ ترقيعات سريعة' : '⚡ Quick Patches'}</span>
              </button>
              <button
                onClick={() => setActiveTab('optimizer')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'optimizer' ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold' : 'text-emerald-400/90 hover:bg-emerald-950/20'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>{lang === 'ar' ? '🚀 تحسين وتمويه الكود' : '🚀 Code Optimizer'}</span>
              </button>
              <button
                onClick={() => setActiveTab('aiAssistant')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'aiAssistant' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold' : 'text-indigo-400 hover:bg-indigo-500/10'
                }`}
              >
                <Cpu className="h-4 w-4 text-emerald-400" />
                <span>{lang === 'ar' ? '🤖 مساعد الذكاء الاصطناعي' : '🤖 AI Copilot'}</span>
              </button>
            </div>
          </div>

          {/* Group 4: Resources & UI */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">{lang === 'ar' ? '🎨 الموارد والواجهات' : 'Resources & UI'}</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveTab('xmlEditor')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'xmlEditor' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <FileCode className="h-4 w-4" />
                <span>{lang === 'ar' ? '📑 محرر XML الشامل' : '📑 XML Resource Editor'}</span>
              </button>
              <button
                onClick={() => setActiveTab('strings')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'strings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <Type className="h-4 w-4" />
                <span>{strings.tabs.strings}</span>
              </button>
              <button
                onClick={() => setActiveTab('assets')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'assets' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                <span>{lang === 'ar' ? '🖼️ الأيقونات والوسائط' : '🖼️ Icons & Assets'}</span>
              </button>
              <button
                onClick={() => setActiveTab('manifest')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'manifest' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <FileCode2 className="h-4 w-4" />
                <span>{strings.tabs.manifest}</span>
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'permissions' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>{strings.tabs.permissions}</span>
              </button>
            </div>
          </div>

          {/* Group 5: Advanced & Debug */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">{lang === 'ar' ? '⚙️ أدوات متقدمة وتصحيح' : 'Advanced & Debugging'}</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveTab('hardwareConnectivity')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'hardwareConnectivity' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-cyan-400 hover:bg-cyan-500/10'
                }`}
              >
                <Smartphone className="h-4 w-4 text-cyan-400" />
                <span>{lang === 'ar' ? '📡 العتاد والموقع' : '📡 Hardware & GPS'}</span>
              </button>
              <button
                onClick={() => setActiveTab('debugger')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'debugger' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <Bug className="h-4 w-4" />
                <span>{lang === 'ar' ? '🐛 مصحح الأخطاء' : '🐛 Debugger'}</span>
              </button>
              <button
                onClick={() => setActiveTab('fileData')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'fileData' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <FileCode className="h-4 w-4" />
                <span>{strings.tabs.fileData}</span>
              </button>
              <button
                onClick={() => setActiveTab('buildSign')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'buildSign' ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                <Download className="h-4 w-4" />
                <span>{strings.tabs.buildSign}</span>
              </button>
              <button
                onClick={() => setActiveTab('appDistribution')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'appDistribution' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-indigo-400 hover:bg-indigo-500/10 border border-indigo-500/20'
                }`}
              >
                <Smartphone className="h-4 w-4" />
                <span>{lang === 'ar' ? '📱 نسخة الـ APK' : '📱 APK Version'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'onlineOffline' && (
          <OnlineToOfflineTab
            lang={lang}
            metadata={metadata}
            onUpdateMetadata={(u) => setMetadata(prev => ({ ...prev, ...u }))}
            detectedEndpoints={detectedEndpoints}
            onUpdateEndpoints={handleUpdateEndpoints}
            onApplyFullOffline={handleApplyFullOffline}
            isOfflineMode={isOfflineMode}
            onNavigateToAssetBundler={() => setActiveTab('offlineAssetBundler')}
          />
        )}

        {activeTab === 'devicePull' && (
          <DevicePullTab
            lang={lang}
            onApkLoaded={async (file) => {
              // Same logic as handleUploadFile
              setIsLoadingFile(true);
              setLoadingMessage(lang === 'ar' ? 'جاري معالجة التطبيق المسحوب...' : 'Processing pulled application...');
              
              try {
                const buffer = await file.arrayBuffer();
                const zip = await JSZip.loadAsync(buffer);
                setOriginalZip(zip);
                
                const decompiled = await decompileApkArchive(zip, file.name, file.size);
                setDecompiledProject(decompiled);
                setMetadata(decompiled.metadata);
                
                if (decompiled.manifest.permissions.length > 0) {
                  setPermissions(
                    decompiled.manifest.permissions.map(p => ({
                      name: p,
                      labelAr: p.split('.').pop() || p,
                      labelEn: p.split('.').pop() || p,
                      descriptionAr: `صلاحية مستخرجة: ${p}`,
                      descriptionEn: `Extracted permission: ${p}`,
                      category: p.includes('CAMERA') || p.includes('STORAGE') || p.includes('LOCATION') ? 'dangerous' : 'normal',
                      isEnabled: true,
                    }))
                  );
                }

                if (decompiled.extractedStrings.length > 0) {
                  setStringsList(decompiled.extractedStrings);
                }

                setXmlFiles([
                  {
                    path: 'AndroidManifest.xml',
                    name: 'AndroidManifest.xml',
                    category: 'manifest',
                    content: decompiled.manifest.rawXml,
                  },
                  {
                    path: 'res/values/strings.xml',
                    name: 'strings.xml',
                    category: 'values',
                    content: `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n${decompiled.extractedStrings.map(s => `    <string name="${s.key}">${s.value}</string>`).join('\n')}\n</resources>`,
                  },
                ]);

                const foundDataFiles: DataFileItem[] = [];
                for (const p of Object.keys(zip.files)) {
                  if ((p.startsWith('assets/') || p.endsWith('.json') || p.endsWith('.properties')) && !zip.files[p].dir) {
                    const content = await zip.files[p].async('text');
                    foundDataFiles.push({
                      path: p,
                      name: p.split('/').pop() || p,
                      type: p.endsWith('.json') ? 'json' : p.endsWith('.properties') ? 'properties' : 'text',
                      content,
                    });
                  }
                }
                if (foundDataFiles.length > 0) {
                  setDataFiles(foundDataFiles);
                }

                setActiveTab('decompiler');
              } catch (e: any) {
                console.error("Failed to load pulled APK", e);
                alert(lang === 'ar' ? `فشل معالجة التطبيق: ${e.message}` : `Failed to process app: ${e.message}`);
              } finally {
                setIsLoadingFile(false);
                setLoadingMessage('');
              }
            }}
          />
        )}

        {activeTab === 'offlineAssetBundler' && (
          <OfflineAssetBundlerTab
            lang={lang}
            metadata={metadata}
            detectedEndpoints={detectedEndpoints}
            onInjectCachedFilesIntoApk={(files) => {
              // 1. Add files to dataFiles
              setDataFiles(prev => [
                ...prev,
                ...files.map(f => ({
                  path: f.path,
                  name: f.path.split('/').pop() || f.path,
                  type: f.path.endsWith('.json') ? ('json' as const) : ('text' as const),
                  content: f.content,
                })),
              ]);

              // 2. Also patch metadata and cleartext traffic
              setMetadata(prev => ({
                ...prev,
                usesCleartextTraffic: true,
              }));

              // 3. Mark offline mode active
              setIsOfflineMode(true);
            }}
          />
        )}

        {activeTab === 'credentials' && (
          <CredentialsTab
            lang={lang}
            credentials={credentials}
            onUpdateCredentials={setCredentials}
            onApplyMasterBypass={handleApplyMasterBypass}
            isMasterBypassActive={isMasterBypassActive}
            metadata={metadata}
            onTogglePermission={(name, enable) => {
              setPermissions(prev => {
                const exists = prev.find(p => p.name === name);
                if (exists) {
                  return prev.map(p => (p.name === name ? { ...p, isEnabled: enable } : p));
                }
                if (enable) {
                  return [
                    ...prev,
                    {
                      name,
                      labelAr: name.split('.').pop() || name,
                      labelEn: name.split('.').pop() || name,
                      descriptionAr: `صلاحية: ${name}`,
                      descriptionEn: `Permission: ${name}`,
                      category: 'normal',
                      isEnabled: true,
                    },
                  ];
                }
                return prev;
              });
            }}
            onInjectAuthFiles={(files) => {
              setDataFiles(prev => [
                ...prev,
                ...files.map(f => ({
                  path: f.path,
                  name: f.path.split('/').pop() || f.path,
                  type: 'json' as const,
                  content: f.content,
                })),
              ]);
            }}
          />
        )}

        {activeTab === 'securitySettings' && (
          <SecuritySettingsTab
            lang={lang}
            metadata={metadata}
            permissions={permissions}
            onTogglePermission={(name, enable) => {
              setPermissions(prev => {
                const exists = prev.find(p => p.name === name);
                if (exists) {
                  return prev.map(p => (p.name === name ? { ...p, isEnabled: enable } : p));
                }
                if (enable) {
                  return [
                    ...prev,
                    {
                      name,
                      labelAr: name.split('.').pop() || name,
                      labelEn: name.split('.').pop() || name,
                      descriptionAr: `صلاحية: ${name}`,
                      descriptionEn: `Permission: ${name}`,
                      category: 'normal',
                      isEnabled: true,
                    },
                  ];
                }
                return prev;
              });
            }}
            onInjectSecurityFiles={(files) => {
              setDataFiles(prev => [
                ...prev,
                ...files.map(f => ({
                  path: f.path,
                  name: f.path.split('/').pop() || f.path,
                  type: 'json' as const,
                  content: f.content,
                })),
              ]);
            }}
          />
        )}

        {activeTab === 'fileData' && (
          <FileDataTab
            lang={lang}
            dataFiles={dataFiles}
            onSaveFileContent={handleSaveFileContent}
            onGlobalSearchReplace={handleGlobalSearchReplace}
            onAddNewFile={handleAddNewFile}
          />
        )}

        {activeTab === 'xmlEditor' && (
          <XmlEditorTab
            lang={lang}
            xmlFiles={xmlFiles}
            onSaveXmlFile={handleSaveXmlFile}
            onAddNewXmlFile={handleAddNewXmlFile}
            onOpenEmulator={(content) => setEmulatorContent(content)}
          />
        )}

        {activeTab === 'hardwareConnectivity' && (
          <HardwareConnectivityTab
            lang={lang}
            metadata={metadata}
            permissions={permissions}
            onTogglePermission={(name, enable) =>
              setPermissions(prev => {
                const exists = prev.find(p => p.name === name);
                if (exists) {
                  return prev.map(p => (p.name === name ? { ...p, isEnabled: enable } : p));
                }
                if (enable) {
                  return [
                    ...prev,
                    {
                      name,
                      labelAr: name.split('.').pop() || name,
                      labelEn: name.split('.').pop() || name,
                      descriptionAr: `خاصية عتاد تم تفعيلها: ${name}`,
                      descriptionEn: `Hardware capability enabled: ${name}`,
                      category: name.includes('FINE') || name.includes('CAMERA') ? 'dangerous' : 'normal',
                      isEnabled: true,
                    },
                  ];
                }
                return prev;
              })
            }
            onUpdateMetadata={(u) => setMetadata(prev => ({ ...prev, ...u }))}
            onApplyHardwareFeatures={(feats) => {
              // Also update sample / data files with mock location
              setDataFiles(prev =>
                prev.map(f => {
                  if (f.name.endsWith('.json')) {
                    try {
                      const parsed = JSON.parse(f.content);
                      parsed.mockGpsLocation = feats.mockGps;
                      parsed.bluetoothEnabled = feats.bluetooth;
                      parsed.wifiStateEnabled = feats.wifiState;
                      return { ...f, content: JSON.stringify(parsed, null, 2) };
                    } catch (e) {
                      return f;
                    }
                  }
                  return f;
                })
              );
            }}
            patches={patches}
            detectedEndpoints={detectedEndpoints}
          />
        )}

        {activeTab === 'aiAssistant' && (
          <AiAssistantTab
            lang={lang}
            metadata={metadata}
            permissions={permissions}
            detectedEndpoints={detectedEndpoints}
            isOfflineMode={isOfflineMode}
          />
        )}

        {activeTab === 'debugger' && (
          <DebuggerTab
            lang={lang}
            metadata={metadata}
            patches={patches}
          />
        )}

        {activeTab === 'decompiler' && (
          <DecompilerTab
            lang={lang}
            metadata={metadata}
            decompiledProject={decompiledProject}
          />
        )}

        {activeTab === 'manifest' && (
          <ManifestTab
            lang={lang}
            metadata={metadata}
            onUpdateMetadata={(u) => setMetadata(prev => ({ ...prev, ...u }))}
          />
        )}

        {activeTab === 'permissions' && (
          <PermissionsTab
            lang={lang}
            permissions={permissions}
            onTogglePermission={(name) =>
              setPermissions(prev => {
                const exists = prev.find(p => p.name === name);
                if (exists) {
                  return prev.map(p => (p.name === name ? { ...p, isEnabled: !p.isEnabled } : p));
                }
                return [
                  ...prev,
                  {
                    name,
                    labelAr: name.split('.').pop() || name,
                    labelEn: name.split('.').pop() || name,
                    descriptionAr: `صلاحية: ${name}`,
                    descriptionEn: `Permission: ${name}`,
                    category: name.includes('STORAGE') || name.includes('CONTACTS') || name.includes('AUDIO') ? 'dangerous' : 'normal',
                    isEnabled: true,
                  },
                ];
              })
            }
            onBatchSetPermissions={(newPerms) => setPermissions(newPerms)}
            onStripTracking={() =>
              setPermissions(prev =>
                prev.map(p =>
                  p.name.includes('LOCATION') || p.name.includes('CAMERA') || p.name.includes('RECORD_AUDIO') || p.name.includes('CONTACTS') || p.name.includes('AD_ID') || p.name.includes('REFERRER')
                    ? { ...p, isEnabled: false }
                    : p
                )
              )
            }
            onAddPermission={(name, label) =>
              setPermissions(prev => [
                ...prev,
                {
                  name,
                  labelAr: label,
                  labelEn: label,
                  descriptionAr: 'صلاحية مخصصة تمت إضافتها يدوياً',
                  descriptionEn: 'Custom permission added manually',
                  category: 'normal',
                  isEnabled: true,
                  isCustom: true,
                },
              ])
            }
            onRemovePermission={(name) =>
              setPermissions(prev => prev.filter(p => p.name !== name))
            }
          />
        )}

        {activeTab === 'strings' && (
          <StringsTab
            lang={lang}
            stringsList={stringsList}
            onUpdateString={(id, key, value) =>
              setStringsList(prev =>
                prev.map(s => (s.id === id ? { ...s, key, value } : s))
              )
            }
            onAddString={(key, value) =>
              setStringsList(prev => [
                ...prev,
                { id: String(Date.now()), key, value },
              ])
            }
            onDeleteString={(id) =>
              setStringsList(prev => prev.filter(s => s.id !== id))
            }
          />
        )}

        {activeTab === 'assets' && (
          <AssetsTab
            lang={lang}
            metadata={metadata}
            onReplaceIcon={handleReplaceIcon}
            customIconPreview={customIconPreview}
            originalZip={originalZip}
            onUpdateZip={(newZip) => setOriginalZip(newZip)}
            onApplyAdaptiveIconSet={(iconSet) => {
              const map: { [path: string]: Blob | Uint8Array } = {};
              for (const lvl of iconSet.levels) {
                if (lvl.blob) {
                  map[lvl.resPath] = lvl.blob;
                }
              }
              const encoder = new TextEncoder();
              map['res/mipmap-anydpi-v26/ic_launcher.xml'] = encoder.encode(iconSet.adaptiveXml);
              map['res/mipmap-anydpi-v26/ic_launcher_round.xml'] = encoder.encode(iconSet.adaptiveRoundXml);
              map['res/values/ic_launcher_background.xml'] = encoder.encode(iconSet.backgroundXml);

              setCustomMipmaps(map);
              if (iconSet.highResBlob) {
                setCustomIconBlob(iconSet.highResBlob);
              }
              setCustomIconPreview(iconSet.highResDataUrl);
            }}
          />
        )}

        {activeTab === 'patches' && (
          <PatchesTab
            lang={lang}
            patches={patches}
            onTogglePatch={(id) =>
              setPatches(prev =>
                prev.map(p => (p.id === id ? { ...p, isApplied: !p.isApplied } : p))
              )
            }
            onSearchDexStrings={(query) => {
              const matched = [
                `Lcom/edu/smartportal/AuthService;->apiEndpoint: "${query}"`,
                `Lcom/edu/smartportal/MainActivity;->verifyServer(Ljava/lang/String;)Z`,
                `Lcom/edu/smartportal/DatabaseHelper;->query("${query}")`,
              ];
              return { matchCount: matched.length, results: matched };
            }}
          />
        )}

        {activeTab === 'pdfDocuments' && (
          <PdfDocumentsTab
            lang={lang}
            originalZip={originalZip}
            onUpdateZip={(newZip) => setOriginalZip(newZip)}
            onLogBuild={(msg, type) => {
              setBuildLogs(prev => [
                ...prev,
                {
                  timestamp: new Date().toLocaleTimeString(),
                  type,
                  message: msg,
                }
              ]);
            }}
          />
        )}

        {activeTab === 'optimizer' && (
          <OptimizerTab
            lang={lang}
            metadata={metadata}
            decompiledProject={decompiledProject}
            onUpdateDecompiledClasses={(updatedClasses) => {
              if (decompiledProject) {
                setDecompiledProject({
                  ...decompiledProject,
                  decompiledClasses: updatedClasses,
                });
              }
            }}
          />
        )}

        {activeTab === 'buildProfiles' && (
          <BuildProfilesTab
            lang={lang}
            metadata={metadata}
            patches={patches}
            signingConfig={signingConfig}
            permissions={permissions}
            profiles={profiles}
            activeProfileId={activeProfileId}
            onApplyProfile={handleApplyProfile}
            onSaveProfile={handleSaveProfile}
            onDeleteProfile={handleDeleteProfile}
            onExportProfiles={handleExportProfiles}
            onImportProfiles={handleImportProfiles}
          />
        )}

        {activeTab === 'buildSign' && (
          <BuildSignTab
            lang={lang}
            metadata={metadata}
            signingConfig={signingConfig}
            onUpdateSigningConfig={(u) => setSigningConfig(prev => ({ ...prev, ...u }))}
            originalSignatureBackup={originalSignatureBackup}
            onTriggerBuild={handleTriggerBuild}
            isBuilding={isBuilding}
            buildProgress={buildProgress}
            buildLogs={buildLogs}
            builtApkBlob={builtApkBlob}
            builtApkFileName={builtApkFileName}
            profiles={profiles}
            activeProfileId={activeProfileId}
            onApplyProfile={handleApplyProfile}
            onNavigateToProfiles={() => setActiveTab('buildProfiles')}
            patches={patches}
            onNavigateToPatches={() => setActiveTab('patches')}
          />
        )}

        {activeTab === 'securityAuditor' && (
          <SecurityAuditorTab
            lang={lang}
            metadata={metadata}
            permissions={permissions}
            stringsList={stringsList}
          />
        )}

        {activeTab === 'projectHistory' && (
          <ProjectHistoryTab
            lang={lang}
            snapshots={snapshots}
            onCreateSnapshot={handleCreateSnapshot}
            onRestoreSnapshot={handleRestoreSnapshot}
            onDeleteSnapshot={handleDeleteSnapshot}
          />
        )}

        {activeTab === 'smaliEditor' && (
          <SmaliEditorTab
            lang={lang}
            smaliFiles={smaliFiles}
            onSaveSmaliFile={handleSaveSmaliFile}
          />
        )}

        {activeTab === 'virtualVM' && (
          <VirtualSandboxTab lang={lang} />
        )}

        {activeTab === 'appDistribution' && (
          <AppDistributionTab 
            lang={lang} 
            metadata={metadata}
            onNavigateToBuildSign={() => setActiveTab('buildSign')}
            onTriggerBuild={handleTriggerBuild}
            builtApkBlob={builtApkBlob}
            builtApkFileName={builtApkFileName}
            isBuilding={isBuilding}
            onExportZip={handleExportProjectZip}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-center md:text-left">
            APK Studio © 2026 — {lang === 'ar' ? 'محرر وتعديل وتفكيك وتصحيح تطبيقات أندرويد مع حفظ التوقيع الأصلي' : 'Android APK Modifier, Decompiler & Debugger with Original Signature Preservation'}
          </p>
          
          {/* Status Indicator Bar */}
          <div className="flex items-center gap-4 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 text-[11px] font-mono shrink-0">
            {/* Build Server Status */}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-500">{lang === 'ar' ? 'خادم البناء:' : 'Build Server:'}</span>
              <span className="text-emerald-400 font-semibold">{lang === 'ar' ? 'متصل' : 'Connected'}</span>
            </div>

            <div className="h-3 w-px bg-slate-800" />

            {/* Tools Readiness */}
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-slate-500">{lang === 'ar' ? 'الأدوات:' : 'Tools:'}</span>
              <span className="text-emerald-400 font-semibold">{lang === 'ar' ? 'جاهزة' : 'Ready'}</span>
            </div>

            <div className="h-3 w-px bg-slate-800" />

            {/* Simulated Refresh Button */}
            <button
              onClick={() => {
                setIsCheckingStatus(true);
                setTimeout(() => setIsCheckingStatus(false), 800);
              }}
              className="text-slate-500 hover:text-emerald-400 cursor-pointer p-0.5 rounded transition-colors flex items-center"
              title={lang === 'ar' ? 'فحص الاتصال والجاهزية' : 'Test Server Connection'}
            >
              <RefreshCw className={`h-3 w-3 ${isCheckingStatus ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>
      </footer>

      {/* Help Modal */}
      <ModdingHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        lang={lang}
      />

      {/* Cloud Emulator Preview */}
      {emulatorContent && (
        <CloudEmulatorPreview
          lang={lang}
          metadata={metadata}
          xmlContent={emulatorContent}
          onClose={() => setEmulatorContent(null)}
        />
      )}

      {/* BUILD SUCCESS TOAST NOTIFICATION */}
      {showBuildSuccess && builtApkBlob && (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 animate-slideUp">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white">
                {lang === 'ar' ? 'تم اكتمال البناء بنجاح!' : 'Build Completed Successfully!'}
              </h4>
              <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                {builtApkFileName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const url = URL.createObjectURL(builtApkBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = builtApkFileName || 'app_modded.apk';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm shadow-emerald-500/10"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{lang === 'ar' ? 'تحميل مباشر' : 'Direct Download'}</span>
            </button>
            <button
              onClick={() => setShowBuildSuccess(false)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
