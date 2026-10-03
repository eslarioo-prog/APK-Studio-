import { ApkMetadata, ApkPermission, ApkStringResource, CodePatch, ApkFileEntry } from '../types/apk';

export interface SampleApkProject {
  id: string;
  nameAr: string;
  nameEn: string;
  categoryAr: string;
  categoryEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  metadata: ApkMetadata;
  permissions: ApkPermission[];
  strings: ApkStringResource[];
  files: ApkFileEntry[];
  patches: CodePatch[];
  credentials: {
    usernameKey: string;
    usernameValue: string;
    passwordKey: string;
    passwordValue: string;
    role: string;
    apiUrl: string;
    sourceFile: string;
  }[];
  dataFiles: {
    path: string;
    name: string;
    type: 'json' | 'xml' | 'properties' | 'text';
    content: string;
    editableFields?: { labelAr: string; labelEn: string; key: string; value: any; type: 'string' | 'number' | 'boolean' }[];
  }[];
}

export const SAMPLE_APKS: SampleApkProject[] = [
  {
    id: 'adcb_banking',
    nameAr: 'ADCB-Egypt Mobile Banking (بنك أبوظبي التجاري)',
    nameEn: 'ADCB-Egypt Mobile Banking',
    categoryAr: 'خدمات مصرفية وبنوك',
    categoryEn: 'Mobile Banking & Finance',
    descriptionAr: 'التطبيق المطابق للقطات الشاشة (Version 4.26.13) بكافة صلاحيات الإعلانات، التخزين، الإشعارات، مزامنة الخلفية، والتوقيع الرقمي.',
    descriptionEn: 'The exact application from your screenshots (Version 4.26.13) with full permissions, background sync, and storage settings.',
    icon: 'Landmark',
    metadata: {
      appName: 'ADCB-Egypt Mobile Banking',
      packageName: 'com.adcb.egypt.mobilebanking',
      versionCode: 42613,
      versionName: '4.26.13',
      minSdk: 26,
      targetSdk: 34,
      compileSdk: 34,
      debuggable: false,
      allowBackup: false,
      usesCleartextTraffic: false,
      orientation: 'portrait',
      iconUrl: '',
      fileSize: 42500000,
      fileName: 'ADCB_Egypt_v4.26.13.apk',
      uploadedAt: '2026-10-02',
      isRealApk: false,
      rawManifestXml: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.adcb.egypt.mobilebanking"
    android:versionCode="42613"
    android:versionName="4.26.13">

    <uses-sdk android:minSdkVersion="26" android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.ACCESS_ADSERVICES_AD_ID" />
    <uses-permission android:name="com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />
    <uses-permission android:name="android.permission.ACCESS_ADSERVICES_ATTRIBUTION" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />

    <application
        android:label="ADCB Mobile"
        android:icon="@mipmap/ic_launcher"
        android:allowBackup="false"
        android:usesCleartextTraffic="false">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
    },
    permissions: [
      {
        name: 'android.permission.ACCESS_ADSERVICES_AD_ID',
        labelAr: 'ACCESS_ADSERVICES_AD_ID',
        labelEn: 'ACCESS_ADSERVICES_AD_ID',
        descriptionAr: "Description for 'ACCESS_ADSERVICES_AD_ID' is not available",
        descriptionEn: "Description for 'ACCESS_ADSERVICES_AD_ID' is not available",
        category: 'tracking',
        isEnabled: true,
      },
      {
        name: 'com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE',
        labelAr: 'com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE',
        labelEn: 'com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE',
        descriptionAr: "Description for 'COM.GOOGLE.ANDROID.FINSKY.PERMISSION.BIND_GET_INSTALL_REFERRER_SERVICE' is not available",
        descriptionEn: "Description for 'COM.GOOGLE.ANDROID.FINSKY.PERMISSION.BIND_GET_INSTALL_REFERRER_SERVICE' is not available",
        category: 'tracking',
        isEnabled: true,
      },
      {
        name: 'android.permission.WRITE_EXTERNAL_STORAGE',
        labelAr: 'WRITE_EXTERNAL_STORAGE',
        labelEn: 'WRITE_EXTERNAL_STORAGE',
        descriptionAr: 'Allows an application to write to external storage',
        descriptionEn: 'Allows an application to write to external storage',
        category: 'dangerous',
        isEnabled: false,
      },
      {
        name: 'android.permission.READ_EXTERNAL_STORAGE',
        labelAr: 'READ_EXTERNAL_STORAGE',
        labelEn: 'READ_EXTERNAL_STORAGE',
        descriptionAr: 'Allows an application to read from external storage',
        descriptionEn: 'Allows an application to read from external storage',
        category: 'dangerous',
        isEnabled: false,
      },
      {
        name: 'android.permission.FOREGROUND_SERVICE',
        labelAr: 'FOREGROUND_SERVICE',
        labelEn: 'FOREGROUND_SERVICE',
        descriptionAr: 'Allows a regular application to use Service.startForeground.',
        descriptionEn: 'Allows a regular application to use Service.startForeground.',
        category: 'normal',
        isEnabled: true,
      },
      {
        name: 'android.permission.FOREGROUND_SERVICE_DATA_SYNC',
        labelAr: 'FOREGROUND_SERVICE_DATA_SYNC',
        labelEn: 'FOREGROUND_SERVICE_DATA_SYNC',
        descriptionAr: "Description for 'FOREGROUND_SERVICE_DATA_SYNC' is not available",
        descriptionEn: "Description for 'FOREGROUND_SERVICE_DATA_SYNC' is not available",
        category: 'normal',
        isEnabled: true,
      },
      {
        name: 'android.permission.RECORD_AUDIO',
        labelAr: 'RECORD_AUDIO',
        labelEn: 'RECORD_AUDIO',
        descriptionAr: 'Allows an application to record audio',
        descriptionEn: 'Allows an application to record audio',
        category: 'dangerous',
        isEnabled: false,
      },
      {
        name: 'android.permission.READ_CONTACTS',
        labelAr: 'READ_CONTACTS',
        labelEn: 'READ_CONTACTS',
        descriptionAr: "Allows an application to read the user's contacts data",
        descriptionEn: "Allows an application to read the user's contacts data",
        category: 'dangerous',
        isEnabled: false,
      },
      {
        name: 'android.permission.WAKE_LOCK',
        labelAr: 'WAKE_LOCK',
        labelEn: 'WAKE_LOCK',
        descriptionAr: 'Use PowerManager WakeLocks to keep processor from sleeping or screen from dimming',
        descriptionEn: 'Use PowerManager WakeLocks to keep processor from sleeping or screen from dimming',
        category: 'normal',
        isEnabled: true,
      },
      {
        name: 'android.permission.POST_NOTIFICATIONS',
        labelAr: 'POST_NOTIFICATIONS',
        labelEn: 'POST_NOTIFICATIONS',
        descriptionAr: "Description for 'POST_NOTIFICATIONS' is not available",
        descriptionEn: "Description for 'POST_NOTIFICATIONS' is not available",
        category: 'normal',
        isEnabled: false,
      },
      {
        name: 'android.permission.VIBRATE',
        labelAr: 'VIBRATE',
        labelEn: 'VIBRATE',
        descriptionAr: 'Allows access to the vibrator',
        descriptionEn: 'Allows access to the vibrator',
        category: 'normal',
        isEnabled: true,
      },
      {
        name: 'com.google.android.c2dm.permission.RECEIVE',
        labelAr: 'com.google.android.c2dm.permission.RECEIVE',
        labelEn: 'com.google.android.c2dm.permission.RECEIVE',
        descriptionAr: "Description for 'COM.GOOGLE.ANDROID.C2DM.PERMISSION.RECEIVE' is not available",
        descriptionEn: "Description for 'COM.GOOGLE.ANDROID.C2DM.PERMISSION.RECEIVE' is not available",
        category: 'normal',
        isEnabled: true,
      },
      {
        name: 'android.permission.ACCESS_ADSERVICES_ATTRIBUTION',
        labelAr: 'ACCESS_ADSERVICES_ATTRIBUTION',
        labelEn: 'ACCESS_ADSERVICES_ATTRIBUTION',
        descriptionAr: "Description for 'ACCESS_ADSERVICES_ATTRIBUTION' is not available",
        descriptionEn: "Description for 'ACCESS_ADSERVICES_ATTRIBUTION' is not available",
        category: 'tracking',
        isEnabled: true,
      },
    ],
    strings: [
      { id: '1', key: 'app_name', value: 'ADCB-Egypt Mobile Banking' },
      { id: '2', key: 'server_gateway', value: 'https://mobilebanking.adcb.com.eg/api/v4' },
      { id: '3', key: 'app_version', value: '4.26.13' },
      { id: '4', key: 'login_prompt', value: 'تسجيل الدخول إلى حسابك البنكي' },
      { id: '5', key: 'offline_mode_warning', value: 'تم تشغيل التطبيق في بيئة التطوير المحلية' },
    ],
    credentials: [
      {
        usernameKey: 'default_banking_user',
        usernameValue: 'demo_user_eg',
        passwordKey: 'default_banking_pass',
        passwordValue: 'SecureBank#2026',
        role: 'مستخدم تجريبي / Demo User',
        apiUrl: 'https://mobilebanking.adcb.com.eg/api/v4/auth',
        sourceFile: 'assets/banking_config.json',
      }
    ],
    dataFiles: [
      {
        path: 'assets/banking_config.json',
        name: 'banking_config.json',
        type: 'json',
        content: JSON.stringify({
          appVersion: '4.26.13',
          environment: 'PRODUCTION',
          apiEndpoint: 'https://mobilebanking.adcb.com.eg/api/v4',
          security: {
            sslPinningEnabled: true,
            rootDetectionEnabled: true,
            allowScreenshots: false,
          },
          features: {
            biometricLogin: true,
            pushNotifications: true,
            offlineFallbackMode: false,
          }
        }, null, 2),
        editableFields: [
          { labelAr: 'إلغاء فحص الروت (Root Detection)', labelEn: 'Disable Root Detection', key: 'security.rootDetectionEnabled', value: false, type: 'boolean' },
          { labelAr: 'إلغاء فحص شهادات SSL Pinning', labelEn: 'Disable SSL Pinning', key: 'security.sslPinningEnabled', value: false, type: 'boolean' },
          { labelAr: 'السماح بالتقاط صور للشاشة (Allow Screenshots)', labelEn: 'Allow Screenshots', key: 'security.allowScreenshots', value: true, type: 'boolean' },
          { labelAr: 'تفعيل وضع التشغيل الأوفلاين (Offline Mode)', labelEn: 'Offline Fallback Mode', key: 'features.offlineFallbackMode', value: true, type: 'boolean' },
        ]
      }
    ],
    patches: [
      {
        id: 'patch_bank_ssl',
        titleAr: 'تعطيل التحقق الصارم من شهادات SSL Pinning',
        titleEn: 'Disable SSL Pinning for Local Proxy',
        descAr: 'يعطل فحص شهادات الخادم للسماح باعتراض الطلبات وفحصها أو تحويلها للمضيف المحلي.',
        descEn: 'Disables strict certificate pinning check for local debugging and offline proxying.',
        category: 'security',
        isApplied: true,
        affectedFile: 'smali/com/adcb/egypt/mobilebanking/SecurityPinning.smali',
        patchCodeSnippet: `const/4 v0, 0x1
return v0 # Trust local certificates`,
      },
      {
        id: 'patch_bank_root',
        titleAr: 'تجاوز فحص الروت وفحص المحاكي (Bypass Root & Emulator Check)',
        titleEn: 'Bypass Root & Emulator Detection',
        descAr: 'يجبر التطبيق على العمل على الأجهزة المعدلة ومحاكيات الكمبيوتر دون إغلاق.',
        descEn: 'Prevents app from force-closing on rooted devices or Android emulators.',
        category: 'security',
        isApplied: true,
        affectedFile: 'smali/com/adcb/egypt/mobilebanking/RootChecker.smali',
        patchCodeSnippet: `const/4 v0, 0x0
return v0 # IsDeviceRooted: Always returns FALSE`,
      }
    ],
    files: [
      { path: 'AndroidManifest.xml', size: 3400, isDir: false, type: 'xml' },
      { path: 'classes.dex', size: 8400200, isDir: false, type: 'code' },
      { path: 'assets/banking_config.json', size: 680, isDir: false, type: 'asset' },
      { path: 'res/values/strings.xml', size: 2800, isDir: false, type: 'xml' },
      { path: 'META-INF/MANIFEST.MF', size: 1400, isDir: false, type: 'certificate' },
      { path: 'META-INF/CERT.RSA', size: 1100, isDir: false, type: 'certificate' },
    ]
  },
  {
    id: 'exam_portal',
    nameAr: 'تطبيق الاختبارات والشهادات الذكية',
    nameEn: 'Exam & Student Portal',
    categoryAr: 'تعليم ومؤسسات',
    categoryEn: 'Education & Enterprise',
    descriptionAr: 'تطبيق محمي يتطلب تسجيل دخول أونلاين وتحقق من سيرفر المدرسة. يتضمن اسم مستخدم وكلمة مرور المشرف وبيانات الطلاب.',
    descriptionEn: 'Locked app requiring online school server login. Contains admin credentials and student database.',
    icon: 'GraduationCap',
    metadata: {
      appName: 'منصة الامتحانات الذكية',
      packageName: 'com.edu.smartportal',
      versionCode: 104,
      versionName: '1.4.2',
      minSdk: 24,
      targetSdk: 34,
      compileSdk: 34,
      debuggable: false,
      allowBackup: false,
      usesCleartextTraffic: false,
      orientation: 'portrait',
      iconUrl: '',
      fileSize: 4820000,
      fileName: 'smart_portal_v1.4.2.apk',
      uploadedAt: '2026-10-02',
      isRealApk: false,
      rawManifestXml: '',
    },
    permissions: [
      { name: 'android.permission.INTERNET', labelAr: 'الوصول للإنترنت', labelEn: 'Internet Access', descriptionAr: 'مطلوب للاتصال بسيرفر التحقق والتسجيل', descriptionEn: 'Required to connect to auth server', category: 'normal', isEnabled: true },
      { name: 'android.permission.ACCESS_NETWORK_STATE', labelAr: 'حالة الشبكة', labelEn: 'Network State', descriptionAr: 'فحص الاتصال بالإنترنت قبل فتح التطبيق', descriptionEn: 'Check internet connectivity', category: 'normal', isEnabled: true },
      { name: 'android.permission.CAMERA', labelAr: 'الكاميرا', labelEn: 'Camera', descriptionAr: 'لمراقبة الطالب أثناء الاختبار', descriptionEn: 'Proctoring student webcam', category: 'dangerous', isEnabled: true },
      { name: 'android.permission.READ_EXTERNAL_STORAGE', labelAr: 'قراءة التخزين', labelEn: 'Read Storage', descriptionAr: 'تحميل ملفات الأسئلة', descriptionEn: 'Download test files', category: 'dangerous', isEnabled: true },
    ],
    strings: [
      { id: '1', key: 'app_name', value: 'منصة الامتحانات والشهادات' },
      { id: '2', key: 'server_url', value: 'https://auth.smartportal.edu/api/v2' },
      { id: '3', key: 'admin_login_title', value: 'تسجيل دخول المشرف والمراقب' },
      { id: '4', key: 'offline_error_msg', value: 'عفواً! يتطلب هذا التطبيق اتصالاً نشطاً بالإنترنت للتحقق من هويتك.' },
      { id: '5', key: 'default_admin_user', value: 'supervisor_admin' },
      { id: '6', key: 'default_admin_pass', value: 'Edu2026#SecureKey' },
      { id: '7', key: 'license_status', value: 'ONLINE_VERIFIED' },
      { id: '8', key: 'welcome_banner', value: 'أهلاً بك في نظام الاختبارات الإلكتروني الموحد' },
    ],
    credentials: [
      {
        usernameKey: 'default_admin_user',
        usernameValue: 'supervisor_admin',
        passwordKey: 'default_admin_pass',
        passwordValue: 'Edu2026#SecureKey',
        role: 'المسؤول العام / Admin',
        apiUrl: 'https://auth.smartportal.edu/api/v2/login',
        sourceFile: 'assets/auth_config.json',
      },
      {
        usernameKey: 'master_inspector',
        usernameValue: 'inspector_vip',
        passwordKey: 'master_inspector_pass',
        passwordValue: 'RootMaster#9942',
        role: 'مفتش الجودة / Inspector',
        apiUrl: 'https://auth.smartportal.edu/api/v2/inspect',
        sourceFile: 'assets/security_creds.properties',
      }
    ],
    dataFiles: [
      {
        path: 'assets/auth_config.json',
        name: 'auth_config.json',
        type: 'json',
        content: JSON.stringify({
          serverMode: 'ONLINE_STRICT',
          apiEndpoint: 'https://auth.smartportal.edu/api/v2',
          requireNetworkHeartbeat: true,
          offlineAccessAllowed: false,
          sessionTimeoutSeconds: 3600,
          credentials: {
            adminUsername: 'supervisor_admin',
            adminPasswordHash: 'Edu2026#SecureKey',
            offlineBypassToken: 'TOKEN_OFFLINE_DISABLED_9981',
          },
          telemetry: {
            sendDiagnostics: true,
            reportingUrl: 'https://telemetry.smartportal.edu/log',
          }
        }, null, 2),
        editableFields: [
          { labelAr: 'وضع السيرفر (أونلاين / أوفلاين)', labelEn: 'Server Mode', key: 'serverMode', value: 'ONLINE_STRICT', type: 'string' },
          { labelAr: 'السماح بالدخول بدون إنترنت (أوفلاين)', labelEn: 'Allow Offline Access', key: 'offlineAccessAllowed', value: false, type: 'boolean' },
          { labelAr: 'اسم مستخدم المسؤول', labelEn: 'Admin Username', key: 'credentials.adminUsername', value: 'supervisor_admin', type: 'string' },
          { labelAr: 'كلمة مرور المشرف', labelEn: 'Admin Password', key: 'credentials.adminPasswordHash', value: 'Edu2026#SecureKey', type: 'string' },
          { labelAr: 'عنوان الخادم البعيد API', labelEn: 'Remote API Endpoint', key: 'apiEndpoint', value: 'https://auth.smartportal.edu/api/v2', type: 'string' },
        ]
      },
      {
        path: 'assets/students_database.json',
        name: 'students_database.json',
        type: 'json',
        content: JSON.stringify({
          schoolName: 'الكلية الرقمية للتكنولوجيا',
          academicYear: '2026-2027',
          maxExamDurationMinutes: 120,
          allowCalculators: true,
          students: [
            { id: 101, name: 'أحمد محمود العبدلي', seatNumber: '44810', grade: 'امتياز', status: 'مؤهل' },
            { id: 102, name: 'سارة خالد المنصور', seatNumber: '44811', grade: 'جيد جداً', status: 'مؤهل' },
            { id: 103, name: 'عمر ياسين الشريف', seatNumber: '44812', grade: 'امتياز مرتفع', status: 'مؤهل' }
          ]
        }, null, 2),
        editableFields: [
          { labelAr: 'اسم المؤسسة التعليمية', labelEn: 'Institution Name', key: 'schoolName', value: 'الكلية الرقمية للتكنولوجيا', type: 'string' },
          { labelAr: 'العام الدراسي', labelEn: 'Academic Year', key: 'academicYear', value: '2026-2027', type: 'string' },
          { labelAr: 'مدة الاختبار (بالدقائق)', labelEn: 'Exam Duration (Mins)', key: 'maxExamDurationMinutes', value: 120, type: 'number' },
        ]
      },
      {
        path: 'assets/security_creds.properties',
        name: 'security_creds.properties',
        type: 'properties',
        content: `# Android Security Configuration
offline.mode=false
auth.inspector_vip=RootMaster#9942
remote.host=https://auth.smartportal.edu
bypass.ssl.pinning=false
license.status=VERIFIED_ONLINE
`
      }
    ],
    patches: [
      {
        id: 'patch_offline_auth',
        titleAr: 'تجاوز قفل السيرفر وتفعيل الوضع الأوفلاين الشامل',
        titleEn: 'Bypass Server & Force Full Offline Mode',
        descAr: 'يجبر التطبيق على قبول أي تسجيل دخول محلياً دون الحاجة لاتصال بالإنترنت أو التحقق من السيرفر الخارجي.',
        descEn: 'Forces app to accept any credentials locally and disables remote server ping checks.',
        category: 'security',
        isApplied: false,
        affectedFile: 'smali/com/edu/smartportal/AuthService.smali',
        patchCodeSnippet: `.method public static isServerOnline()Z
    .registers 1
    const/4 v0, 0x1   # Always return TRUE for online check
    return v0
.end method`,
      },
      {
        id: 'patch_credentials_bypass',
        titleAr: 'تخطي نافذة تسجيل الدخول تماماً',
        titleEn: 'Auto-Login Master Bypass',
        descAr: 'يقوم بتخطي شاشة اسم المستخدم وكلمة المرور تلقائياً وفتح الواجهة الرئيسية بحساب المشرف الأعلى.',
        descEn: 'Bypasses username/password prompt and boots straight into Admin dashboard.',
        category: 'feature',
        isApplied: false,
        affectedFile: 'smali/com/edu/smartportal/LoginActivity.smali',
        patchCodeSnippet: `const/4 v0, 0x1
invoke-virtual {p0, v0}, Lcom/edu/smartportal/LoginActivity;->grantSuperuserAccess(Z)V`,
      }
    ],
    files: [
      { path: 'AndroidManifest.xml', size: 1840, isDir: false, type: 'xml' },
      { path: 'classes.dex', size: 1420500, isDir: false, type: 'code' },
      { path: 'resources.arsc', size: 34020, isDir: false, type: 'other' },
      { path: 'assets/auth_config.json', size: 520, isDir: false, type: 'asset' },
      { path: 'assets/students_database.json', size: 1100, isDir: false, type: 'asset' },
      { path: 'assets/security_creds.properties', size: 280, isDir: false, type: 'asset' },
      { path: 'res/values/strings.xml', size: 1200, isDir: false, type: 'xml' },
      { path: 'res/mipmap-hdpi/ic_launcher.png', size: 12400, isDir: false, type: 'image' },
    ]
  },
  {
    id: 'game_offline_mod',
    nameAr: 'لعبة مغامرة الأبطال (Game RPG Quest)',
    nameEn: 'Heroes Quest RPG Online',
    categoryAr: 'ألعاب وترفيه',
    categoryEn: 'Games & Entertainment',
    descriptionAr: 'لعبة تتطلب اتصالاً مستمراً بالسيرفر لحفظ التقدم وفحص المشتريات. يمكنك تحويلها لأوفلاين وتعديل العملات والمستويات وكلمة مرور الحساب.',
    descriptionEn: 'Always-online RPG with cloud save & purchases. Mod to full offline mode, edit coins, gems, and player credentials.',
    icon: 'Gamepad2',
    metadata: {
      appName: 'مغامرة الأبطال',
      packageName: 'com.gamestudio.heroesquest',
      versionCode: 201,
      versionName: '2.1.0',
      minSdk: 21,
      targetSdk: 34,
      compileSdk: 34,
      debuggable: false,
      allowBackup: true,
      usesCleartextTraffic: true,
      orientation: 'landscape',
      iconUrl: '',
      fileSize: 12400000,
      fileName: 'heroes_quest_v2.1.0.apk',
      uploadedAt: '2026-10-02',
      isRealApk: false,
      rawManifestXml: '',
    },
    permissions: [
      { name: 'android.permission.INTERNET', labelAr: 'الوصول للإنترنت', labelEn: 'Internet Access', descriptionAr: 'مطلوب للمزامنة الأونلاين', descriptionEn: 'Online cloud sync', category: 'normal', isEnabled: true },
      { name: 'android.permission.ACCESS_NETWORK_STATE', labelAr: 'فحص الشبكة', labelEn: 'Network State', descriptionAr: 'فحص جودة الاتصال', descriptionEn: 'Ping check', category: 'normal', isEnabled: true },
      { name: 'com.android.vending.BILLING', labelAr: 'متجر الشراء داخل التطبيق', labelEn: 'Google Play Billing', descriptionAr: 'شراء الجواهر والعملات', descriptionEn: 'In-app purchases', category: 'dangerous', isEnabled: true },
      { name: 'android.permission.VIBRATE', labelAr: 'الاهتزاز', labelEn: 'Vibrate', descriptionAr: 'المؤثرات اللمسية', descriptionEn: 'Haptic feedback', category: 'normal', isEnabled: true },
    ],
    strings: [
      { id: '1', key: 'app_name', value: 'مغامرة الأبطال أوفلاين' },
      { id: '2', key: 'cloud_save_url', value: 'https://gameserver.heroesquest.net/save' },
      { id: '3', key: 'player_name_default', value: 'البطل المحارب' },
      { id: '4', key: 'vip_status_text', value: 'عضوية VIP غير نشطة' },
      { id: '5', key: 'gems_currency_name', value: 'جواهر الطاقة' },
      { id: '6', key: 'coins_currency_name', value: 'عملات ذهبية' },
    ],
    credentials: [
      {
        usernameKey: 'player_account_id',
        usernameValue: 'Hero_Commander_99',
        passwordKey: 'account_auth_token',
        passwordValue: 'Pass#HeroToken2026',
        role: 'حساب اللاعب الرئيسي / Player',
        apiUrl: 'https://gameserver.heroesquest.net/v1/auth',
        sourceFile: 'assets/player_profile.json',
      }
    ],
    dataFiles: [
      {
        path: 'assets/player_profile.json',
        name: 'player_profile.json',
        type: 'json',
        content: JSON.stringify({
          onlineRequired: true,
          offlineSoloMode: false,
          serverEndpoint: 'https://gameserver.heroesquest.net',
          player: {
            username: 'Hero_Commander_99',
            passwordSecret: 'Pass#HeroToken2026',
            level: 75,
            vipRank: 10,
            coins: 9999999,
            gems: 50000,
            unlimitedEnergy: true,
            allCharactersUnlocked: true,
          }
        }, null, 2),
        editableFields: [
          { labelAr: 'تحويل اللعبة للوضع الأوفلاين (بدون إنترنت)', labelEn: 'Offline Solo Mode', key: 'offlineSoloMode', value: true, type: 'boolean' },
          { labelAr: 'إلغاء شرط الاتصال بالسيرفر', labelEn: 'Disable Online Requirement', key: 'onlineRequired', value: false, type: 'boolean' },
          { labelAr: 'اسم مستخدم اللاعب', labelEn: 'Player Username', key: 'player.username', value: 'Hero_Commander_99', type: 'string' },
          { labelAr: 'كلمة مرور / رمز الحساب', labelEn: 'Player Secret Token', key: 'player.passwordSecret', value: 'Pass#HeroToken2026', type: 'string' },
          { labelAr: 'رصيد العملات الذهبية', labelEn: 'Gold Coins', key: 'player.coins', value: 9999999, type: 'number' },
          { labelAr: 'رصيد الجواهر', labelEn: 'Gems', key: 'player.gems', value: 50000, type: 'number' },
          { labelAr: 'مستوى اللاعب (Level)', labelEn: 'Player Level', key: 'player.level', value: 75, type: 'number' },
          { labelAr: 'طاقة لا نهائية (Unlimited Energy)', labelEn: 'Unlimited Energy', key: 'player.unlimitedEnergy', value: true, type: 'boolean' },
        ]
      },
      {
        path: 'assets/game_levels.json',
        name: 'game_levels.json',
        type: 'json',
        content: JSON.stringify({
          allStagesUnlocked: true,
          difficulty: 'Normal',
          offlinePackIncluded: true,
          stages: [
            { id: 1, name: 'غابة الأسرار', stars: 3, cleared: true },
            { id: 2, name: 'وادي البراكين', stars: 3, cleared: true },
            { id: 3, name: 'قلعة الظلام', stars: 3, cleared: true },
            { id: 4, name: 'برج السماء الأسطوري', stars: 3, cleared: true }
          ]
        }, null, 2),
        editableFields: [
          { labelAr: 'فتح جميع المراحل والمستويات', labelEn: 'Unlock All Stages', key: 'allStagesUnlocked', value: true, type: 'boolean' },
          { labelAr: 'تضمين حزمة البيانات الأوفلاين', labelEn: 'Offline Pack Included', key: 'offlinePackIncluded', value: true, type: 'boolean' },
        ]
      }
    ],
    patches: [
      {
        id: 'patch_offline_gameplay',
        titleAr: 'تحويل اللعبة إلى أوفلاين بالكامل (Local Offline Play)',
        titleEn: 'Offline Play Patch',
        descAr: 'إلغاء فحص خادم المزامنة السحابية وجعل اللعبة تحفظ وتعمل بالكامل من الذاكرة الداخلية للهاتف.',
        descEn: 'Removes cloud sync check, enabling full standalone local saving.',
        category: 'feature',
        isApplied: true,
        affectedFile: 'smali/com/gamestudio/heroesquest/NetworkManager.smali',
        patchCodeSnippet: `const/4 v0, 0x0
return v0 # Network not required`,
      },
      {
        id: 'patch_free_iap',
        titleAr: 'تخطي الشراء داخل اللعبة (Free Purchases)',
        titleEn: 'In-App Billing Mock Patch',
        descAr: 'إرجاع حالة الشراء مكتمل بنجاح (PURCHASED) لأي محاولة شراء داخل المتجر.',
        descEn: 'Always returns PURCHASED state for in-app billing requests.',
        category: 'feature',
        isApplied: true,
        affectedFile: 'smali/com/android/vending/billing/IInAppBillingService.smali',
        patchCodeSnippet: `const/4 v0, 0x0 # RESULT_OK
return v0`,
      }
    ],
    files: [
      { path: 'AndroidManifest.xml', size: 2100, isDir: false, type: 'xml' },
      { path: 'classes.dex', size: 3400100, isDir: false, type: 'code' },
      { path: 'resources.arsc', size: 68000, isDir: false, type: 'other' },
      { path: 'assets/player_profile.json', size: 640, isDir: false, type: 'asset' },
      { path: 'assets/game_levels.json', size: 780, isDir: false, type: 'asset' },
      { path: 'res/values/strings.xml', size: 1400, isDir: false, type: 'xml' },
      { path: 'res/mipmap-hdpi/ic_launcher.png', size: 16400, isDir: false, type: 'image' },
    ]
  },
  {
    id: 'pos_cashier',
    nameAr: 'نظام نقاط البيع والمحاسبة (POS Cashier Pro)',
    nameEn: 'Smart POS & Inventory System',
    categoryAr: 'تجارة ومحاسبة',
    categoryEn: 'Retail & Business',
    descriptionAr: 'تطبيق كاشير متجر مرتبط بسحابة أونلاين. يمكنك تحويله للعمل دون إنترنت وتعديل أسماء المستخدمين، كود المشرف، والبيانات المالية المخزنة.',
    descriptionEn: 'Cloud POS store cashier. Convert to offline local database, edit manager credentials, and modify store inventory data.',
    icon: 'Store',
    metadata: {
      appName: 'كاشير المحل الذكي',
      packageName: 'com.pos.smartcashier',
      versionCode: 300,
      versionName: '3.0.1',
      minSdk: 23,
      targetSdk: 34,
      compileSdk: 34,
      debuggable: false,
      allowBackup: true,
      usesCleartextTraffic: true,
      orientation: 'sensor',
      iconUrl: '',
      fileSize: 6200000,
      fileName: 'smart_pos_v3.0.1.apk',
      uploadedAt: '2026-10-02',
      isRealApk: false,
      rawManifestXml: '',
    },
    permissions: [
      { name: 'android.permission.INTERNET', labelAr: 'الإنترنت', labelEn: 'Internet', descriptionAr: 'المزامنة السحابية مع المقر الرئيسي', descriptionEn: 'HQ Cloud sync', category: 'normal', isEnabled: true },
      { name: 'android.permission.BLUETOOTH', labelAr: 'البلوتوث', labelEn: 'Bluetooth', descriptionAr: 'الاتصال بطابعة الفواتير الحرارية', descriptionEn: 'Thermal receipt printer', category: 'normal', isEnabled: true },
      { name: 'android.permission.CAMERA', labelAr: 'الكاميرا', labelEn: 'Camera', descriptionAr: 'مسح الباركود والـ QR Code', descriptionEn: 'Barcode scanning', category: 'dangerous', isEnabled: true },
    ],
    strings: [
      { id: '1', key: 'app_name', value: 'نظام الكاشير والمبيعات السريع' },
      { id: '2', key: 'store_name_header', value: 'سوبرماركت المدينة المركزي' },
      { id: '3', key: 'currency_symbol', value: 'ريال' },
      { id: '4', key: 'tax_rate_label', value: 'ضريبة القيمة المضافة 15%' },
      { id: '5', key: 'pos_admin_user', value: 'store_manager_root' },
      { id: '6', key: 'pos_admin_pass', value: 'CashierAdmin#8841' },
    ],
    credentials: [
      {
        usernameKey: 'pos_admin_user',
        usernameValue: 'store_manager_root',
        passwordKey: 'pos_admin_pass',
        passwordValue: 'CashierAdmin#8841',
        role: 'المدير العام للمتجر / Store Manager',
        apiUrl: 'https://cloud.smartpos.net/api/auth',
        sourceFile: 'assets/store_settings.json',
      },
      {
        usernameKey: 'cashier_shift_user',
        usernameValue: 'cashier_user_1',
        passwordKey: 'cashier_shift_pin',
        passwordValue: '1234',
        role: 'كاشير الوردية الأولى / Shift Cashier',
        apiUrl: 'https://cloud.smartpos.net/api/shift',
        sourceFile: 'assets/store_settings.json',
      }
    ],
    dataFiles: [
      {
        path: 'assets/store_settings.json',
        name: 'store_settings.json',
        type: 'json',
        content: JSON.stringify({
          operatingMode: 'OFFLINE_LOCAL',
          cloudSyncEnabled: false,
          offlineTransactionsBuffer: 10000,
          storeInfo: {
            name: 'سوبرماركت المدينة المركزي',
            vatNumber: '310928374600003',
            phone: '+966 50 123 4567',
            address: 'شارع الملك فهد، الرياض',
          },
          security: {
            managerUsername: 'store_manager_root',
            managerPassword: 'CashierAdmin#8841',
            cashierPin: '1234',
            allowOfflineRefunds: true,
          }
        }, null, 2),
        editableFields: [
          { labelAr: 'وضع التشغيل (أوفلاين محلي / سحابي)', labelEn: 'Operating Mode', key: 'operatingMode', value: 'OFFLINE_LOCAL', type: 'string' },
          { labelAr: 'المزامنة السحابية (Cloud Sync)', labelEn: 'Cloud Sync', key: 'cloudSyncEnabled', value: false, type: 'boolean' },
          { labelAr: 'اسم المتجر في الفاتورة', labelEn: 'Store Name', key: 'storeInfo.name', value: 'سوبرماركت المدينة المركزي', type: 'string' },
          { labelAr: 'اسم مستخدم المدير', labelEn: 'Manager Username', key: 'security.managerUsername', value: 'store_manager_root', type: 'string' },
          { labelAr: 'كلمة مرور المشرف والمدير', labelEn: 'Manager Password', key: 'security.managerPassword', value: 'CashierAdmin#8841', type: 'string' },
          { labelAr: 'رمز PIN السريع للكاشير', labelEn: 'Cashier Quick PIN', key: 'security.cashierPin', value: '1234', type: 'string' },
        ]
      }
    ],
    patches: [
      {
        id: 'patch_pos_offline',
        titleAr: 'التحويل إلى وضع أوفلاين محلي دائم (Standalone POS)',
        titleEn: 'Standalone Local POS Mode',
        descAr: 'يعطل طلب الاتصال بالسيرفر السحابي لحفظ الفواتير والتقارير في قاعدة البيانات المحلية فقط.',
        descEn: 'Forces app to save receipts and transactions locally without cloud ping.',
        category: 'feature',
        isApplied: true,
        affectedFile: 'smali/com/pos/smartcashier/DatabaseSync.smali',
        patchCodeSnippet: `const/4 v0, 0x1
return v0 # Always local database mode`,
      }
    ],
    files: [
      { path: 'AndroidManifest.xml', size: 1950, isDir: false, type: 'xml' },
      { path: 'classes.dex', size: 2100400, isDir: false, type: 'code' },
      { path: 'resources.arsc', size: 45000, isDir: false, type: 'other' },
      { path: 'assets/store_settings.json', size: 720, isDir: false, type: 'asset' },
      { path: 'res/values/strings.xml', size: 1350, isDir: false, type: 'xml' },
      { path: 'res/mipmap-hdpi/ic_launcher.png', size: 14200, isDir: false, type: 'image' },
    ]
  }
];
