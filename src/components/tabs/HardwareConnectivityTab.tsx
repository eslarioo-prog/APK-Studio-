import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi,
  Navigation,
  Bluetooth,
  Camera,
  Mic,
  Smartphone,
  CheckCircle2,
  Sliders,
  MapPin,
  Radio,
  Zap,
  Shield,
  Activity,
  Check,
  Search,
  Filter,
  Play,
  Pause,
  RotateCcw,
  Download,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Server,
  Layers,
  X,
  FileCode,
  Globe,
  RadioTower,
  Monitor,
  Terminal,
  Smartphone as DeviceIcon,
  Trash2 as RemoveIcon,
  RefreshCcw as ReloadIcon,
} from 'lucide-react';
import { Language } from '../../i18n/translations';
import { ApkMetadata, ApkPermission, CodePatch } from '../../types/apk';

export interface SimulatedNetworkRequest {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT';
  url: string;
  targetHost: string;
  status: 'BLOCKED' | 'REDIRECTED' | 'ALLOWED';
  statusCode: number;
  reasonAr: string;
  reasonEn: string;
  latencyMs: number;
  protocol: 'HTTPS' | 'HTTP' | 'WSS' | 'LOOPBACK';
  category: 'telemetry' | 'auth' | 'license' | 'api' | 'static_asset';
  originalUrl?: string;
  redirectedUrl?: string;
  ruleTriggered: string;
  requestHeaders: Record<string, string>;
  responseSnippet: string;
}

interface HardwareConnectivityTabProps {
  lang: Language;
  metadata: ApkMetadata;
  permissions: ApkPermission[];
  onTogglePermission: (permName: string, enable: boolean) => void;
  onUpdateMetadata: (updated: Partial<ApkMetadata>) => void;
  onApplyHardwareFeatures: (features: {
    network: boolean;
    wifiState: boolean;
    cleartext: boolean;
    locationGps: boolean;
    backgroundLocation: boolean;
    bluetooth: boolean;
    bluetoothAdmin: boolean;
    nfc: boolean;
    camera: boolean;
    audioRecord: boolean;
    vibrate: boolean;
    telephony: boolean;
    mockGps: { lat: number; lng: number; name: string };
  }) => void;
  patches?: CodePatch[];
  detectedEndpoints?: string[];
}

export const HardwareConnectivityTab: React.FC<HardwareConnectivityTabProps> = ({
  lang,
  metadata,
  permissions,
  onTogglePermission,
  onUpdateMetadata,
  onApplyHardwareFeatures,
  patches = [],
  detectedEndpoints = [],
}) => {
  const isAr = lang === 'ar';

  const hasPerm = (name: string) => permissions.find(p => p.name === name)?.isEnabled ?? false;

  const [features, setFeatures] = useState({
    network: hasPerm('android.permission.INTERNET'),
    wifiState: hasPerm('android.permission.ACCESS_WIFI_STATE') || hasPerm('android.permission.CHANGE_WIFI_STATE'),
    cleartext: metadata.usesCleartextTraffic,
    locationGps: hasPerm('android.permission.ACCESS_FINE_LOCATION'),
    backgroundLocation: hasPerm('android.permission.ACCESS_BACKGROUND_LOCATION'),
    bluetooth: hasPerm('android.permission.BLUETOOTH') || hasPerm('android.permission.BLUETOOTH_CONNECT'),
    bluetoothAdmin: hasPerm('android.permission.BLUETOOTH_ADMIN') || hasPerm('android.permission.BLUETOOTH_SCAN'),
    nfc: hasPerm('android.permission.NFC'),
    camera: hasPerm('android.permission.CAMERA'),
    audioRecord: hasPerm('android.permission.RECORD_AUDIO'),
    vibrate: hasPerm('android.permission.VIBRATE'),
    telephony: hasPerm('android.permission.READ_PHONE_STATE'),
    mockGps: {
      lat: 24.7136,
      lng: 46.6753,
      name: isAr ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia',
    },
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ADB Device Manager State
  const [adbDevices, setAdbDevices] = useState<{
    id: string;
    model: string;
    status: 'online' | 'offline' | 'unauthorized';
    androidVersion: string;
    serial: string;
  }[]>([
    { id: '1', model: 'Samsung Galaxy S23 Ultra', status: 'online', androidVersion: '14.0', serial: 'R58W10XYZ' },
    { id: '2', model: 'Google Pixel 8 Pro', status: 'online', androidVersion: '14.0', serial: '24011FDFR' },
    { id: '3', model: 'Xiaomi 13 Pro', status: 'unauthorized', androidVersion: '13.1', serial: 'XM99201' },
  ]);
  const [isRefreshingAdb, setIsRefreshingAdb] = useState(false);

  const refreshAdbDevices = () => {
    setIsRefreshingAdb(true);
    // Simulate ADB scan
    setTimeout(() => {
      setIsRefreshingAdb(false);
      setToastMessage(isAr ? 'تم تحديث قائمة أجهزة ADB بنجاح' : 'ADB devices list updated successfully');
      setTimeout(() => setToastMessage(null), 2000);
    }, 1500);
  };

  const handleDeviceAction = (deviceId: string, action: 'install' | 'run' | 'screenshot') => {
    const device = adbDevices.find(d => d.id === deviceId);
    if (!device) return;

    let msg = '';
    if (action === 'install') msg = isAr ? `جاري تثبيت ${metadata.appName} على ${device.model}...` : `Installing ${metadata.appName} on ${device.model}...`;
    if (action === 'run') msg = isAr ? `جاري تشغيل التطبيق على ${device.model}...` : `Launching app on ${device.model}...`;
    if (action === 'screenshot') msg = isAr ? `تم التقاط لقطة شاشة من ${device.model}` : `Screenshot captured from ${device.model}`;

    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Network Activity Monitor State
  const [isMonitoringActive, setIsMonitoringActive] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'BLOCKED' | 'REDIRECTED' | 'ALLOWED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<SimulatedNetworkRequest | null>(null);

  // Initial simulated requests reflecting APK state
  const isInternetDisabled = !features.network;
  const isCleartextAllowed = features.cleartext;
  const hasSslPatch = patches.some(p => p.isApplied && (p.id.includes('ssl') || p.titleEn.toLowerCase().includes('ssl')));

  const [networkRequests, setNetworkRequests] = useState<SimulatedNetworkRequest[]>([
    {
      id: 'req-1',
      timestamp: '14:24:02.115',
      method: 'POST',
      url: 'https://graph.facebook.com/v16.0/act_events',
      targetHost: 'graph.facebook.com',
      status: 'BLOCKED',
      statusCode: 403,
      reasonAr: 'تم حظر طلب التتبع والتحليلات عبر سياسة الأوفلاين الصارمة',
      reasonEn: 'Telemetry & analytics request dropped by offline privacy guard',
      latencyMs: 1,
      protocol: 'HTTPS',
      category: 'telemetry',
      ruleTriggered: 'Offline Privacy Enforcement (#DropAnalytics)',
      requestHeaders: {
        'User-Agent': 'Dalvik/2.1.0 (Android 14; Pixel 8 Pro)',
        'Content-Type': 'application/json',
      },
      responseSnippet: 'HTTP/1.1 403 Forbidden\nX-Offline-Blocked: true\nReason: Telemetry sink blocked locally',
    },
    {
      id: 'req-2',
      timestamp: '14:24:02.320',
      method: 'POST',
      url: 'https://mobilebanking.adcb.com.eg/api/v4/auth/token',
      targetHost: 'mobilebanking.adcb.com.eg',
      status: 'REDIRECTED',
      statusCode: 307,
      reasonAr: 'تم توجيه طلب التوثيق تلقائياً إلى سيرفر الموك المحلي (127.0.0.1:8080)',
      reasonEn: 'Authentication API seamlessly rerouted to local loopback proxy (127.0.0.1:8080)',
      latencyMs: 8,
      protocol: 'HTTP',
      category: 'auth',
      originalUrl: 'https://mobilebanking.adcb.com.eg/api/v4/auth/token',
      redirectedUrl: 'http://127.0.0.1:8080/api/v4/auth/token',
      ruleTriggered: 'API Redirection Hook (OkHttp HostnameResolver)',
      requestHeaders: {
        'Host': '127.0.0.1:8080',
        'Authorization': 'Bearer MOCK_OFFLINE_TOKEN_8821',
        'Accept': 'application/json',
      },
      responseSnippet: JSON.stringify({ status: 'success', token: 'MOCK_TOKEN_LOCAL_SUCCESS', user: 'offline_user' }, null, 2),
    },
    {
      id: 'req-3',
      timestamp: '14:24:03.045',
      method: 'GET',
      url: 'https://firebaseinstallations.googleapis.com/v1/projects/adcb-prod/installations',
      targetHost: 'firebaseinstallations.googleapis.com',
      status: 'BLOCKED',
      statusCode: 403,
      reasonAr: 'تم إحباط محاولة التسجيل السحابي في Firebase لعدم كشف الجهاز',
      reasonEn: 'Cloud push installation token request blocked locally',
      latencyMs: 2,
      protocol: 'HTTPS',
      category: 'telemetry',
      ruleTriggered: 'Firebase Core Interceptor (BypassGms)',
      requestHeaders: {
        'x-goog-api-key': 'AIzaSyA4_BLOCKED_OFFLINE',
      },
      responseSnippet: 'HTTP/1.1 403 Forbidden\nFirebase cloud connectivity disabled for offline operation',
    },
    {
      id: 'req-4',
      timestamp: '14:24:03.480',
      method: 'GET',
      url: 'http://127.0.0.1:8080/assets/offline_cache/branches_atm.json',
      targetHost: '127.0.0.1:8080',
      status: 'ALLOWED',
      statusCode: 200,
      reasonAr: 'قراءة بيانات الفروع والصرافات من مجلد التخزين المؤقت المحلي بنجاح',
      reasonEn: 'Read branches & ATM cache directly from local APK storage',
      latencyMs: 4,
      protocol: 'LOOPBACK',
      category: 'static_asset',
      ruleTriggered: 'Local Asset Bundler Resolver',
      requestHeaders: {
        'Accept': 'application/json',
      },
      responseSnippet: JSON.stringify({ region: 'Egypt', totalAtm: 340, status: 'offline_cached' }, null, 2),
    },
  ]);

  const requestsEndRef = useRef<HTMLDivElement>(null);

  // Periodic network simulator when monitoring is active
  useEffect(() => {
    if (!isMonitoringActive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;

      const pool: Array<() => SimulatedNetworkRequest> = [
        () => ({
          id: `req-${Date.now()}-${Math.random()}`,
          timestamp: timeStr,
          method: 'POST',
          url: 'https://app-measurement.com/a',
          targetHost: 'app-measurement.com',
          status: 'BLOCKED',
          statusCode: 403,
          reasonAr: 'تم إسقاط حزمة القياسات الإعلانية ومنع تسريب بيانات الهاتف',
          reasonEn: 'Google App Measurement analytics package blocked by sandbox policy',
          latencyMs: 1,
          protocol: 'HTTPS',
          category: 'telemetry',
          ruleTriggered: 'Zero-Telemetry Rule #01',
          requestHeaders: { 'User-Agent': 'Dalvik/2.1.0' },
          responseSnippet: 'HTTP/1.1 403 Blocked by Offline Sandbox',
        }),
        () => ({
          id: `req-${Date.now()}-${Math.random()}`,
          timestamp: timeStr,
          method: 'GET',
          url: 'https://mobilebanking.adcb.com.eg/api/v4/user/account_summary',
          targetHost: 'mobilebanking.adcb.com.eg',
          status: 'REDIRECTED',
          statusCode: 307,
          reasonAr: 'إعادة توجيه طلب كشف الحساب إلى قاعدة بيانات SQLite المحلية',
          reasonEn: 'Account summary query redirected to internal local SQLite cache',
          latencyMs: 11,
          protocol: 'HTTP',
          category: 'api',
          originalUrl: 'https://mobilebanking.adcb.com.eg/api/v4/user/account_summary',
          redirectedUrl: 'http://127.0.0.1:8080/mock/account_summary',
          ruleTriggered: 'Offline API Local Proxy Dispatcher',
          requestHeaders: { 'Host': '127.0.0.1:8080', 'Authorization': 'Bearer CACHED_USER' },
          responseSnippet: JSON.stringify({ balance: 45800.5, currency: 'EGP', active: true }, null, 2),
        }),
        () => ({
          id: `req-${Date.now()}-${Math.random()}`,
          timestamp: timeStr,
          method: 'GET',
          url: 'http://127.0.0.1:8080/assets/offline_cache/user_profile.json',
          targetHost: '127.0.0.1:8080',
          status: 'ALLOWED',
          statusCode: 200,
          reasonAr: 'استرجاع ملف المستخدم بنجاح من الموارد المحقونة محلياً',
          reasonEn: 'Retrieved profile metadata from offline injected asset pack',
          latencyMs: 3,
          protocol: 'LOOPBACK',
          category: 'static_asset',
          ruleTriggered: 'Local Storage Provider',
          requestHeaders: { 'Accept': 'application/json' },
          responseSnippet: JSON.stringify({ userName: 'Demo Account User', offlineAuthPermitted: true }, null, 2),
        }),
      ];

      const generator = pool[Math.floor(Math.random() * pool.length)];
      setNetworkRequests(prev => [generator(), ...prev].slice(0, 40));
    }, 4500);

    return () => clearInterval(interval);
  }, [isMonitoringActive, features.network, features.cleartext]);

  const toggleFeature = (key: keyof typeof features) => {
    if (key === 'mockGps') return;
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplyChanges = () => {
    // 1. Sync permissions
    onTogglePermission('android.permission.INTERNET', features.network);
    onTogglePermission('android.permission.ACCESS_NETWORK_STATE', features.network);
    onTogglePermission('android.permission.ACCESS_WIFI_STATE', features.wifiState);
    onTogglePermission('android.permission.CHANGE_WIFI_STATE', features.wifiState);
    onTogglePermission('android.permission.ACCESS_FINE_LOCATION', features.locationGps);
    onTogglePermission('android.permission.ACCESS_COARSE_LOCATION', features.locationGps);
    onTogglePermission('android.permission.ACCESS_BACKGROUND_LOCATION', features.backgroundLocation);
    onTogglePermission('android.permission.BLUETOOTH', features.bluetooth);
    onTogglePermission('android.permission.BLUETOOTH_ADMIN', features.bluetoothAdmin);
    onTogglePermission('android.permission.BLUETOOTH_CONNECT', features.bluetooth);
    onTogglePermission('android.permission.BLUETOOTH_SCAN', features.bluetoothAdmin);
    onTogglePermission('android.permission.NFC', features.nfc);
    onTogglePermission('android.permission.CAMERA', features.camera);
    onTogglePermission('android.permission.RECORD_AUDIO', features.audioRecord);
    onTogglePermission('android.permission.VIBRATE', features.vibrate);
    onTogglePermission('android.permission.READ_PHONE_STATE', features.telephony);

    // 2. Sync metadata
    onUpdateMetadata({
      usesCleartextTraffic: features.cleartext,
    });

    // 3. Callback
    onApplyHardwareFeatures(features);

    setToastMessage(isAr ? 'تم تطبيق وحفظ إعدادات العتاد والشبكة بنجاح!' : 'Hardware & network settings saved successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const setLocationPreset = (name: string, lat: number, lng: number) => {
    setFeatures(prev => ({
      ...prev,
      mockGps: { lat, lng, name },
    }));
  };

  // Trigger burst of test requests
  const handleSimulateBurst = () => {
    const now = new Date();
    const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;

    const burstRequests: SimulatedNetworkRequest[] = [
      {
        id: `burst-1-${Date.now()}`,
        timestamp: timeStr,
        method: 'POST',
        url: 'https://mobilebanking.adcb.com.eg/api/v4/license/verify',
        targetHost: 'mobilebanking.adcb.com.eg',
        status: 'REDIRECTED',
        statusCode: 307,
        reasonAr: 'تم اعتراض طلب فحص الترخيص وتوجيهه إلى الموك المحلي الناجح',
        reasonEn: 'License check request redirected to local bypass hook',
        latencyMs: 6,
        protocol: 'HTTP',
        category: 'license',
        originalUrl: 'https://mobilebanking.adcb.com.eg/api/v4/license/verify',
        redirectedUrl: 'http://127.0.0.1:8080/mock/license',
        ruleTriggered: 'Offline License Hook',
        requestHeaders: { 'Host': '127.0.0.1:8080' },
        responseSnippet: JSON.stringify({ licenseValid: true, expiry: '2099-12-31' }, null, 2),
      },
      {
        id: `burst-2-${Date.now()}`,
        timestamp: timeStr,
        method: 'POST',
        url: 'https://crashlyticsreports.google.com/spi/v2/platforms/android/apps',
        targetHost: 'crashlyticsreports.google.com',
        status: 'BLOCKED',
        statusCode: 403,
        reasonAr: 'تم حظر تقرير الأخطاء السحابي لمنع إرسال البصمات للخوادم',
        reasonEn: 'Crashlytics telemetry sink blocked by offline sandbox rule',
        latencyMs: 1,
        protocol: 'HTTPS',
        category: 'telemetry',
        ruleTriggered: 'Zero Crashlytics Leakage Rule',
        requestHeaders: { 'X-Crashlytics-API-Key': 'BLOCKED' },
        responseSnippet: 'HTTP/1.1 403 Forbidden\nOffline mode prevents crashlytics remote calls',
      },
      {
        id: `burst-3-${Date.now()}`,
        timestamp: timeStr,
        method: 'GET',
        url: 'http://127.0.0.1:8080/api/v4/config/offline_rules.json',
        targetHost: '127.0.0.1:8080',
        status: 'ALLOWED',
        statusCode: 200,
        reasonAr: 'تم قراءة ملف القواعد الأوفلاين الداخلي بنجاح',
        reasonEn: 'Offline rules fetched from local asset cache',
        latencyMs: 2,
        protocol: 'LOOPBACK',
        category: 'static_asset',
        ruleTriggered: 'Internal Asset Loopback Resolver',
        requestHeaders: { 'Accept': 'application/json' },
        responseSnippet: JSON.stringify({ mode: 'full_offline', status: 'ready' }, null, 2),
      },
    ];

    setNetworkRequests(prev => [...burstRequests, ...prev].slice(0, 45));
    setToastMessage(isAr ? 'تم إطلاق حزمة فحص الشبكة بنجاح!' : 'Simulated network test burst executed!');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleClearRequests = () => {
    setNetworkRequests([]);
    setSelectedRequest(null);
  };

  const handleExportNetworkLog = () => {
    const blob = new Blob([JSON.stringify(networkRequests, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${metadata.packageName}_network_monitor_log.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage(isAr ? 'تم تصدير سجل مراقبة الشبكة بنجاح!' : 'Network audit log exported!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Stats calculation
  const totalReqs = networkRequests.length;
  const blockedReqs = networkRequests.filter(r => r.status === 'BLOCKED').length;
  const redirectedReqs = networkRequests.filter(r => r.status === 'REDIRECTED').length;
  const allowedReqs = networkRequests.filter(r => r.status === 'ALLOWED').length;
  const blockPercent = totalReqs > 0 ? Math.round(((blockedReqs + redirectedReqs) / totalReqs) * 100) : 100;

  const filteredRequests = networkRequests.filter(req => {
    if (filterStatus !== 'ALL' && req.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        req.url.toLowerCase().includes(q) ||
        req.targetHost.toLowerCase().includes(q) ||
        req.method.toLowerCase().includes(q) ||
        req.ruleTriggered.toLowerCase().includes(q) ||
        req.reasonEn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-white">
                {isAr ? 'التحكم بالعتاد والاتصال ومراقب الشبكة المباشر' : 'Hardware, Sensors & Real-Time Network Monitor'}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Traffic Inspector
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {isAr
                ? 'إدارة حساسات الهاتف وصلاحيات العتاد، مع مراقب شبكة حي ومحاكي فوري يعرض الطلبات المحظورة والموجهة محلياً للتأكد من فاعلية الترقيعات.'
                : 'Configure hardware sensors and watch live incoming/outgoing requests in real-time to verify offline patches and local endpoint redirections.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleApplyChanges}
          className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-emerald-500/10 cursor-pointer shrink-0"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>{isAr ? 'حفظ وتطبيق إعدادات العتاد' : 'Apply Hardware Settings'}</span>
        </button>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2 p-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ADB Device Manager Section */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Monitor className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {isAr ? 'مدير أجهزة أندرويد المتصلة (ADB Manager)' : 'ADB Android Device Manager'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAr
                  ? 'التحكم في الأجهزة المتصلة عبر ADB لتثبيت التطبيق المعدل واختباره مباشرة.'
                  : 'Manage devices connected via ADB to install and test your modded APK instantly.'}
              </p>
            </div>
          </div>
          <button
            onClick={refreshAdbDevices}
            disabled={isRefreshingAdb}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <ReloadIcon className={`h-3.5 w-3.5 ${isRefreshingAdb ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'تحديث القائمة' : 'Refresh List'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {adbDevices.map(device => (
            <div
              key={device.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg border ${
                  device.status === 'online' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  <DeviceIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">{device.model}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                      device.status === 'online' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {device.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-slate-500 font-mono">Serial: {device.serial}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Android {device.androidVersion}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:shrink-0">
                <button
                  onClick={() => handleDeviceAction(device.id, 'install')}
                  disabled={device.status !== 'online'}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-[11px] font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg border border-slate-700 transition-all cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{isAr ? 'تثبيت APK' : 'Install APK'}</span>
                </button>
                <button
                  onClick={() => handleDeviceAction(device.id, 'run')}
                  disabled={device.status !== 'online'}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-[11px] font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-30 rounded-lg transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>{isAr ? 'تشغيل' : 'Run'}</span>
                </button>
                <button
                  onClick={() => handleDeviceAction(device.id, 'screenshot')}
                  disabled={device.status !== 'online'}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all cursor-pointer"
                  title={isAr ? 'لقطة شاشة' : 'Screenshot'}
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. REAL-TIME SIMULATED NETWORK ACTIVITY MONITOR */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-4">
        {/* Monitor Title & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {isAr ? 'مراقب حركة الشبكة المباشر واختبار التوجيه (Live Network Activity Monitor)' : 'Live Network Activity Monitor'}
                </h3>
                <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  isMonitoringActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isMonitoringActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  {isMonitoringActive ? (isAr ? 'مباشر (Streaming)' : 'Live Stream') : (isAr ? 'متوقف مؤقتاً' : 'Paused')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isAr
                  ? 'يعرض الطلبات الخارجية المحجوبة والموجهة لسيرفر الموك المحلي لحظياً للتحقق من أمان وضع الأوفلاين.'
                  : 'Real-time feed showing blocked telemetry and redirected endpoints to audit offline isolation.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsMonitoringActive(!isMonitoringActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
                isMonitoringActive
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {isMonitoringActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isMonitoringActive ? (isAr ? 'إيقاف مؤقت' : 'Pause') : (isAr ? 'استئناف' : 'Resume')}</span>
            </button>

            <button
              onClick={handleSimulateBurst}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer shadow-sm"
              title="Trigger simulated traffic burst"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{isAr ? 'إطلاق فحص شبكة ⚡' : 'Test Request Burst ⚡'}</span>
            </button>

            <button
              onClick={handleExportNetworkLog}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Export JSON audit log"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isAr ? 'تصدير السجل' : 'Export'}</span>
            </button>

            <button
              onClick={handleClearRequests}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Clear traffic logs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-medium block">
              {isAr ? 'إجمالي الطلبات المرصودة' : 'Total Requests'}
            </span>
            <span className="text-sm font-bold text-white font-mono">{totalReqs}</span>
          </div>

          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/30">
            <span className="text-[10px] text-rose-300 font-medium block">
              {isAr ? 'طلبات محظورة (Blocked)' : 'Blocked Requests'}
            </span>
            <span className="text-sm font-bold text-rose-400 font-mono">
              {blockedReqs} <span className="text-[10px] text-rose-400/70 font-sans">({totalReqs > 0 ? Math.round((blockedReqs / totalReqs) * 100) : 0}%)</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/30">
            <span className="text-[10px] text-amber-300 font-medium block">
              {isAr ? 'معاد توجيهها لموك (Redirected)' : 'Rerouted to Mock'}
            </span>
            <span className="text-sm font-bold text-amber-400 font-mono">{redirectedReqs}</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
            <span className="text-[10px] text-emerald-300 font-medium block">
              {isAr ? 'نسبة حماية الأوفلاين' : 'Offline Isolation Rate'}
            </span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{blockPercent}%</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['ALL', 'BLOCKED', 'REDIRECTED', 'ALLOWED'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 text-xs rounded-lg font-mono font-medium transition-colors cursor-pointer shrink-0 ${
                  filterStatus === status
                    ? status === 'BLOCKED'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                      : status === 'REDIRECTED'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : status === 'ALLOWED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px]">
            <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isAr ? 'بحث في الروابط أو العناوين...' : 'Filter URLs, endpoints, rules...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Requests Feed List */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden divide-y divide-slate-800/80 max-h-[340px] overflow-y-auto font-mono text-xs">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              {isAr ? 'لم يتم رصد أي طلبات شبكة تطابق البحث' : 'No network activity matches active filter'}
            </div>
          ) : (
            filteredRequests.map(req => {
              const isSelected = selectedRequest?.id === req.id;
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className={`p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/80 border-l-2 border-emerald-400'
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                        req.status === 'BLOCKED'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : req.status === 'REDIRECTED'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {req.status === 'BLOCKED' ? '🛑 BLOCKED' : req.status === 'REDIRECTED' ? '🔀 REDIRECTED' : '🟢 ALLOWED'}
                    </span>

                    {/* Method */}
                    <span className="text-[11px] font-bold text-slate-300 w-12 shrink-0">
                      {req.method}
                    </span>

                    {/* URL & Host */}
                    <div className="min-w-0">
                      <div className="text-xs text-white truncate max-w-md" title={req.url}>
                        {req.url}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>{isAr ? req.reasonAr : req.reasonEn}</span>
                        <span>•</span>
                        <span className="text-slate-400">{req.ruleTriggered}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-400">
                    <span className="tabular-nums font-mono">{req.latencyMs}ms</span>
                    <span className="text-[10px] text-slate-500 font-mono">{req.timestamp}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequest(req);
                      }}
                      className="px-2 py-1 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                    >
                      {isAr ? 'فحص' : 'Inspect'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
          <div ref={requestsEndRef} />
        </div>

        {/* Selected Request Detail Drawer / Card */}
        {selectedRequest && (
          <div className="rounded-xl border border-indigo-950/70 bg-slate-900/90 p-4 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">
                  {isAr ? 'تفاصيل فحص الطلب المعترض:' : 'Inspected Request Audit Details:'}
                </span>
                <span className="font-mono text-[10px] text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                  {selectedRequest.method} {selectedRequest.targetHost}
                </span>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1.5">
                <div>
                  <span className="text-slate-500 text-[10px] block">Full Target URL:</span>
                  <span className="text-slate-200 break-all select-all">{selectedRequest.url}</span>
                </div>
                {selectedRequest.redirectedUrl && (
                  <div>
                    <span className="text-amber-400 text-[10px] block">Redirected Destination:</span>
                    <span className="text-amber-300 break-all select-all font-bold">
                      {selectedRequest.redirectedUrl}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 text-[10px] block">Applied Patch / Policy Rule:</span>
                  <span className="text-emerald-400">{selectedRequest.ruleTriggered}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block mb-1">Response / Hook Action Payload:</span>
                <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto max-h-28 whitespace-pre">
                  {selectedRequest.responseSnippet}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. CATEGORIES OF HARDWARE & SENSORS (Toggles) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category 1: Network & Connectivity */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800/80">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Wifi className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">
                {isAr ? 'الشبكة والاتصال بالإنترنت (Network & Wi-Fi)' : 'Network & Connectivity'}
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Socket & HTTP Layer</span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Internet permission toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  {isAr ? 'صلاحية الإنترنت الكاملة' : 'Full Internet Access'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">android.permission.INTERNET</span>
              </div>
              <button
                onClick={() => toggleFeature('network')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${features.network ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${features.network ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Wi-Fi State toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  {isAr ? 'التحكم وحالة الواي فاي' : 'Wi-Fi State & Scan'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">ACCESS_WIFI_STATE</span>
              </div>
              <button
                onClick={() => toggleFeature('wifiState')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${features.wifiState ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${features.wifiState ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Cleartext HTTP toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  {isAr ? 'السماح بـ HTTP غير مشفر' : 'Allow Cleartext HTTP'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">usesCleartextTraffic (127.0.0.1)</span>
              </div>
              <button
                onClick={() => toggleFeature('cleartext')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${features.cleartext ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${features.cleartext ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Category 2: Geolocation & GPS */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800/80">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">
                {isAr ? 'تحديد الموقع الجغرافي (GPS Location)' : 'GPS & Location'}
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Fine & Coarse Geofencing</span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Fine Location toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  {isAr ? 'تحديد الموقع الدقيق GPS' : 'Fine GPS Location'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">ACCESS_FINE_LOCATION</span>
              </div>
              <button
                onClick={() => toggleFeature('locationGps')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${features.locationGps ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${features.locationGps ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Background Location toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  {isAr ? 'تتبع الموقع في الخلفية' : 'Background Geofencing'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">BACKGROUND_LOCATION</span>
              </div>
              <button
                onClick={() => toggleFeature('backgroundLocation')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${features.backgroundLocation ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${features.backgroundLocation ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Mock GPS coordinates preset */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                <span>{isAr ? 'محاكاة موقع GPS وهمي للتطبيق:' : 'Mock GPS Location:'}</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setLocationPreset(isAr ? 'الرياض' : 'Riyadh', 24.7136, 46.6753)}
                  className={`text-[10px] px-2 py-1 rounded transition-colors ${features.mockGps.lat === 24.7136 ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
                >
                  {isAr ? 'الرياض' : 'Riyadh'}
                </button>
                <button
                  onClick={() => setLocationPreset(isAr ? 'القاهرة' : 'Cairo', 30.0444, 31.2357)}
                  className={`text-[10px] px-2 py-1 rounded transition-colors ${features.mockGps.lat === 30.0444 ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
                >
                  {isAr ? 'القاهرة' : 'Cairo'}
                </button>
                <button
                  onClick={() => setLocationPreset(isAr ? 'دبي' : 'Dubai', 25.2048, 55.2708)}
                  className={`text-[10px] px-2 py-1 rounded transition-colors ${features.mockGps.lat === 25.2048 ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
                >
                  {isAr ? 'دبي' : 'Dubai'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category 3: Bluetooth & NFC */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800/80">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Bluetooth className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">
                {isAr ? 'البلوتوث وأجهزة المدى القريب' : 'Bluetooth & NFC'}
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">BLE & Peripheral Discovery</span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Bluetooth toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  {isAr ? 'تشغيل البلوتوث (Connect)' : 'Bluetooth Connect'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">BLUETOOTH_CONNECT</span>
              </div>
              <button
                onClick={() => toggleFeature('bluetooth')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${features.bluetooth ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${features.bluetooth ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Bluetooth Admin / Scan toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  {isAr ? 'فحص واكتشاف الأجهزة (Scan)' : 'Bluetooth Scan & Admin'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">BLUETOOTH_SCAN</span>
              </div>
              <button
                onClick={() => toggleFeature('bluetoothAdmin')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${features.bluetoothAdmin ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${features.bluetoothAdmin ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>

            {/* NFC toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  {isAr ? 'مستشعر الدفع والمدى القريب (NFC)' : 'Near Field Comm (NFC)'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">android.permission.NFC</span>
              </div>
              <button
                onClick={() => toggleFeature('nfc')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${features.nfc ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${features.nfc ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Category 4: Camera & Audio */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800/80">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">
                {isAr ? 'الكاميرا والصوت (Camera & Audio)' : 'Camera & Microphone'}
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Sensors & Media Input</span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Camera */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  {isAr ? 'تشغيل الكاميرا ومسح الباركود' : 'Camera Hardware'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">android.permission.CAMERA</span>
              </div>
              <button
                onClick={() => toggleFeature('camera')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${features.camera ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${features.camera ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Mic */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  {isAr ? 'تسجيل الصوت والميكروفون' : 'Microphone Recording'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">RECORD_AUDIO</span>
              </div>
              <button
                onClick={() => toggleFeature('audioRecord')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${features.audioRecord ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${features.audioRecord ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Vibration */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  {isAr ? 'الاهتزاز والمؤثرات اللمسية' : 'Haptic Vibration'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">android.permission.VIBRATE</span>
              </div>
              <button
                onClick={() => toggleFeature('vibrate')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${features.vibrate ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition ${features.vibrate ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
