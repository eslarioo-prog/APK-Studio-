import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Bug,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Shield,
  Eye,
  Edit3,
  ArrowRight,
  ArrowLeft,
  Filter,
  Usb,
  Smartphone,
  Sparkles,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Radio,
  SlidersHorizontal,
  FileCode,
  Layers,
  X,
} from 'lucide-react';
import { Language } from '../../i18n/translations';
import { LogEntry, Breakpoint, RuntimeVariable, CallStackFrame } from '../../types/debugger';
import { ApkMetadata, CodePatch } from '../../types/apk';

interface DebuggerTabProps {
  lang: Language;
  metadata: ApkMetadata;
  patches?: CodePatch[];
}

export const DebuggerTab: React.FC<DebuggerTabProps> = ({
  lang,
  metadata,
  patches = [],
}) => {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const logContainerRef = useRef<HTMLDivElement>(null);

  // WebUSB State
  const hasWebUsbSupport = typeof navigator !== 'undefined' && 'usb' in navigator;
  const [connectedUsbDevice, setConnectedUsbDevice] = useState<{
    name: string;
    manufacturer?: string;
    vendorId: string;
    productId: string;
    serialNumber?: string;
  } | null>(null);
  const [isUsbConnecting, setIsUsbConnecting] = useState(false);
  const [isSimulatedUsb, setIsSimulatedUsb] = useState(false);
  const [usbStatusMessage, setUsbStatusMessage] = useState<string | null>(null);

  // Logcat State
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '14:20:01.102', tag: 'ActivityManager', level: 'I', pid: 4812, tid: 4812, message: `Start proc 4812:${metadata.packageName}/u0a112 for activity`, patchImpactCategory: 'general' },
    { id: '2', timestamp: '14:20:01.140', tag: 'AndroidRuntime', level: 'D', pid: 4812, tid: 4812, message: `>>> App starting on Android SDK 34 (Dalvikvm/ART 2.1.0) <<<`, patchImpactCategory: 'general' },
    { id: '3', timestamp: '14:20:01.210', tag: 'NetworkSecurityConfig', level: 'D', pid: 4812, tid: 4812, message: `Cleartext traffic allowed: ${metadata.usesCleartextTraffic}`, patchImpactCategory: 'offline' },
    { id: '4', timestamp: '14:20:01.320', tag: 'MainActivity', level: 'D', pid: 4812, tid: 4812, message: `onCreate() called. Target package: ${metadata.packageName}`, patchImpactCategory: 'general' },
    { id: '5', timestamp: '14:20:01.450', tag: 'NetworkManager', level: 'W', pid: 4812, tid: 4820, message: `Connecting to remote host... Timeout 3000ms`, patchImpactCategory: 'ssl' },
    { id: '6', timestamp: '14:20:01.590', tag: 'AuthService', level: 'I', pid: 4812, tid: 4820, message: `Checking authentication status. Token: TOKEN_OFFLINE_READY`, patchImpactCategory: 'offline' },
    { id: '7', timestamp: '14:20:01.710', tag: 'DatabaseHelper', level: 'D', pid: 4812, tid: 4812, message: `SQLiteDatabase opened in READ/WRITE mode: app_local_data.db`, patchImpactCategory: 'offline' },
  ]);

  const [isLoggingActive, setIsLoggingActive] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [logFilterTag, setLogFilterTag] = useState('');
  const [logFilterLevel, setLogFilterLevel] = useState<'ALL' | 'V' | 'D' | 'I' | 'W' | 'E'>('ALL');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logCategoryFilter, setLogCategoryFilter] = useState<'ALL' | 'root' | 'ssl' | 'offline' | 'crash'>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom log injector modal state
  const [isCustomLogModalOpen, setIsCustomLogModalOpen] = useState(false);
  const [customTag, setCustomTag] = useState('CustomHook');
  const [customLevel, setCustomLevel] = useState<'V' | 'D' | 'I' | 'W' | 'E'>('D');
  const [customMsg, setCustomMsg] = useState('');

  // Breakpoints State
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([
    { id: 'bp-1', file: `${metadata.packageName}/MainActivity.java`, line: 42, condition: 'isOffline == true', hitCount: 3, enabled: true, status: 'active' },
    { id: 'bp-2', file: `${metadata.packageName}/AuthService.java`, line: 88, condition: 'authToken != null', hitCount: 1, enabled: true, status: 'active' },
    { id: 'bp-3', file: `${metadata.packageName}/NetworkManager.java`, line: 24, hitCount: 0, enabled: false, status: 'disabled' },
  ]);
  const [newBpFile, setNewBpFile] = useState(`${metadata.packageName}/MainActivity.java`);
  const [newBpLine, setNewBpLine] = useState(55);
  const [newBpCondition, setNewBpCondition] = useState('');

  // Debugger Execution & Hit State
  const [isPausedAtBreakpoint, setIsPausedAtBreakpoint] = useState(false);
  const [activeBreakpointHit, setActiveBreakpointHit] = useState<Breakpoint | null>(null);

  // Runtime Variables State
  const [runtimeVariables, setRuntimeVariables] = useState<RuntimeVariable[]>([
    { name: 'isServerReachable', type: 'boolean', value: true, scope: 'Static' },
    { name: 'isOfflineForced', type: 'boolean', value: true, scope: 'Static' },
    { name: 'currentUserId', type: 'String', value: 'admin_superuser', scope: 'Instance' },
    { name: 'authAttemptsRemaining', type: 'int', value: 999, scope: 'Instance' },
    { name: 'sessionToken', type: 'String', value: 'MOCK_OFFLINE_BEARER_884192', scope: 'Local' },
    { name: 'licenseStatus', type: 'String', value: 'PREMIUM_OFFLINE_UNLOCKED', scope: 'Static' },
    { name: 'localDatabasePath', type: 'String', value: '/data/data/databases/app.db', scope: 'Local' },
  ]);

  // Call Stack State
  const [callStack, setCallStack] = useState<CallStackFrame[]>([
    { id: 'frame-1', methodName: 'verifyOfflineCredentials', className: 'AuthService', fileName: 'AuthService.java', lineNumber: 88 },
    { id: 'frame-2', methodName: 'onLoginSubmit', className: 'LoginActivity', fileName: 'LoginActivity.java', lineNumber: 142 },
    { id: 'frame-3', methodName: 'onCreate', className: 'MainActivity', fileName: 'MainActivity.java', lineNumber: 42 },
    { id: 'frame-4', methodName: 'performLaunchActivity', className: 'ActivityThread', fileName: 'ActivityThread.java', lineNumber: 3410 },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auto-scroll when new logs arrive if autoScroll is enabled
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Periodic simulated background logs
  useEffect(() => {
    if (!isLoggingActive) return;

    const interval = setInterval(() => {
      const isRootApplied = patches.some(p => p.id.includes('root') && p.isApplied);
      const isSslApplied = patches.some(p => p.id.includes('ssl') && p.isApplied);

      const sampleEvents: Partial<LogEntry>[] = [
        {
          tag: 'LocalCache',
          level: 'D',
          message: 'Retrieved 14 cached assets from internal assets/offline_cache in 3ms',
          patchImpactCategory: 'offline',
        },
        {
          tag: 'HeartbeatService',
          level: 'I',
          message: 'Ping skipped: App running in standalone offline mode',
          patchImpactCategory: 'offline',
        },
        {
          tag: 'RootChecker',
          level: isRootApplied ? 'I' : 'W',
          message: isRootApplied
            ? 'Root bypass hook active: system reported clean non-rooted'
            : 'Probing su binaries in standard paths...',
          patchImpactCategory: 'root',
        },
        {
          tag: 'SecurityPinning',
          level: isSslApplied ? 'I' : 'D',
          message: isSslApplied
            ? 'SSL Pinning bypassed: proxy certificate accepted'
            : 'Validating remote host TLS certificate pinning',
          patchImpactCategory: 'ssl',
        },
        {
          tag: 'ViewRootImpl',
          level: 'V',
          message: 'Dispatching motion event to window content view',
          patchImpactCategory: 'general',
        },
      ];

      const chosen = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
      const newLog: LogEntry = {
        id: String(Date.now()),
        timestamp: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100),
        tag: chosen.tag || 'System',
        level: chosen.level || 'D',
        pid: 4812,
        tid: 4812 + Math.floor(Math.random() * 4),
        message: chosen.message || '',
        patchImpactCategory: chosen.patchImpactCategory || 'general',
      };

      setLogs(prev => [...prev.slice(-150), newLog]);
    }, 3800);

    return () => clearInterval(interval);
  }, [isLoggingActive, patches]);

  // WebUSB Connection Handler
  const handleConnectUsb = async () => {
    if (!hasWebUsbSupport) {
      // Simulate connection if browser does not support WebUSB directly
      setIsUsbConnecting(true);
      setTimeout(() => {
        setIsUsbConnecting(false);
        setConnectedUsbDevice({
          name: 'Google Pixel 8 Pro (Simulated USB)',
          manufacturer: 'Google LLC',
          vendorId: '0x18D1',
          productId: '0x4EE7',
          serialNumber: '29101FDH20014B',
        });
        setIsSimulatedUsb(true);
        showToast(isAr ? 'تم تشغيل اتصال جهاز أندرويد عبر محاكي الـ USB!' : 'Simulated USB Android device connected!');
        appendLog({
          tag: 'WebUSB',
          level: 'I',
          message: 'ADB Daemon opened channel over USB (Vendor: 0x18D1 Google Pixel 8 Pro, Serial: 29101FDH20014B)',
          patchImpactCategory: 'general',
        });
      }, 700);
      return;
    }

    try {
      setIsUsbConnecting(true);
      // Attempt standard Android ADB USB Class (0xFF = 255)
      const usb = (navigator as any).usb;
      let device: any = null;
      try {
        device = await usb.requestDevice({ filters: [{ classCode: 255 }] });
      } catch (e) {
        // Fallback to any USB device
        device = await usb.requestDevice({ filters: [] });
      }

      if (device) {
        await device.open().catch(() => {});
        setConnectedUsbDevice({
          name: device.productName || 'Android Mobile Device',
          manufacturer: device.manufacturerName || 'Android OEM',
          vendorId: `0x${device.vendorId.toString(16).padStart(4, '0')}`,
          productId: `0x${device.productId.toString(16).padStart(4, '0')}`,
          serialNumber: device.serialNumber || 'USB_PORT_2_DEV_1',
        });
        setIsSimulatedUsb(false);
        showToast(isAr ? `متصل بنجاح: ${device.productName || 'جهاز أندرويد'}` : `Connected to ${device.productName || 'Device'}`);
        appendLog({
          tag: 'WebUSB',
          level: 'I',
          message: `Physical USB device attached: ${device.productName || 'Android Device'} [VID: 0x${device.vendorId.toString(16)} PID: 0x${device.productId.toString(16)}]`,
          patchImpactCategory: 'general',
        });
      }
    } catch (err: any) {
      console.warn('WebUSB request cancelled or failed', err);
      // Offer simulated mode
      setConnectedUsbDevice({
        name: 'Samsung Galaxy S24 Ultra (Simulated USB)',
        manufacturer: 'Samsung Electronics',
        vendorId: '0x04E8',
        productId: '0x6860',
        serialNumber: 'R5CW3018ZBL',
      });
      setIsSimulatedUsb(true);
      showToast(isAr ? 'تم تشغيل وضع محاكاة اتصال الـ USB بنجاح!' : 'Switched to Simulated USB mode!');
    } finally {
      setIsUsbConnecting(false);
    }
  };

  const handleDisconnectUsb = () => {
    setConnectedUsbDevice(null);
    setIsSimulatedUsb(false);
    showToast(isAr ? 'تم فصل اتصال جهاز الـ USB' : 'USB Device disconnected');
    appendLog({
      tag: 'WebUSB',
      level: 'W',
      message: 'USB session closed. Stream reverted to internal studio logcat.',
      patchImpactCategory: 'general',
    });
  };

  const appendLog = (entry: Omit<LogEntry, 'id' | 'timestamp' | 'pid' | 'tid'>) => {
    const newEntry: LogEntry = {
      id: String(Date.now() + Math.random()),
      timestamp: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100),
      pid: 4812,
      tid: 4812,
      ...entry,
    };
    setLogs(prev => [...prev.slice(-150), newEntry]);
  };

  // Patch Impact Simulation Scenarios (User Requirement)
  const handleSimulatePatchImpact = (scenario: 'root' | 'ssl' | 'offline' | 'crash') => {
    const isRootApplied = patches.some(p => p.id.includes('root') && p.isApplied);
    const isSslApplied = patches.some(p => p.id.includes('ssl') && p.isApplied);

    if (scenario === 'root') {
      appendLog({ tag: 'RootChecker', level: 'D', message: 'Testing device integrity: inspecting /system/bin/su, /system/xbin/su...', patchImpactCategory: 'root' });
      appendLog({ tag: 'RootChecker', level: 'D', message: 'Executing test: Runtime.getRuntime().exec("which su")', patchImpactCategory: 'root' });
      setTimeout(() => {
        if (isRootApplied) {
          appendLog({ tag: 'APK_Studio_Hook', level: 'I', message: '⚡ [PATCH ACTIVE] Root detection hook intercepted isDeviceRooted() -> Forced return FALSE (0x0)', patchImpactCategory: 'root' });
          appendLog({ tag: 'MainActivity', level: 'I', message: 'Device check passed: Non-rooted state confirmed. Normal execution continues.', patchImpactCategory: 'root' });
          showToast(isAr ? 'نجحت المحاكاة: ترقيع الروت منع اكتشاف الروت بنجاح!' : 'Root Patch successfully bypassed root detection!');
        } else {
          appendLog({ tag: 'RootChecker', level: 'W', message: 'Found SUID root binary at /system/xbin/su', patchImpactCategory: 'root' });
          appendLog({ tag: 'SecurityGuard', level: 'E', message: '❌ [NO PATCH] Root detected! App flagged as compromised. Force closing.', patchImpactCategory: 'root' });
          showToast(isAr ? 'تنبيه: تم اكتشاف الروت لأن ترقيع الروت غير مفعّل!' : 'Warning: Root detected because root patch is disabled!');
        }
      }, 400);
    } else if (scenario === 'ssl') {
      appendLog({ tag: 'NetworkManager', level: 'D', message: 'Initiating TLSv1.3 connection to https://mobilebanking.adcb.com.eg/api/v4...', patchImpactCategory: 'ssl' });
      appendLog({ tag: 'SecurityPinning', level: 'D', message: 'Validating server certificate chain against pinned public key hash...', patchImpactCategory: 'ssl' });
      setTimeout(() => {
        if (isSslApplied) {
          appendLog({ tag: 'APK_Studio_Hook', level: 'I', message: '⚡ [PATCH ACTIVE] SSL Pinning disabled: TrustManager.checkServerTrusted() no-op return executed.', patchImpactCategory: 'ssl' });
          appendLog({ tag: 'NetworkManager', level: 'I', message: 'Handshake complete. Proxy / Charles interception working smoothly (HTTP 200 OK)', patchImpactCategory: 'ssl' });
          showToast(isAr ? 'نجحت المحاكاة: ترقيع SSL Pinning تجاوز فحص الشهادة بنجاح!' : 'SSL Pinning bypassed successfully!');
        } else {
          appendLog({ tag: 'TrustManager', level: 'W', message: 'Certificate pinning mismatch: Peer public key does not match baked authority.', patchImpactCategory: 'ssl' });
          appendLog({ tag: 'OkHttpClient', level: 'E', message: '❌ [NO PATCH] javax.net.ssl.SSLPeerUnverifiedException: Certificate pinning failure!', patchImpactCategory: 'ssl' });
          showToast(isAr ? 'تنبيه: فشل الاتصال بسبب SSL Pinning لأن الترقيع غير مفعّل!' : 'Certificate pinning failed because patch is disabled!');
        }
      }, 400);
    } else if (scenario === 'offline') {
      appendLog({ tag: 'NetworkManager', level: 'W', message: 'Server ping timeout: Remote host unreachable (Offline mode active)', patchImpactCategory: 'offline' });
      appendLog({ tag: 'OfflineEngine', level: 'I', message: '⚡ [OFFLINE HOOK] Intercepting request: file:///android_asset/offline_cache/user_profile.json', patchImpactCategory: 'offline' });
      setTimeout(() => {
        appendLog({ tag: 'AuthService', level: 'I', message: 'Offline session authenticated: User balance loaded from cached assets (200 OK)', patchImpactCategory: 'offline' });
        showToast(isAr ? 'نجحت المحاكاة: تم قراءة بيانات المستخدم أوفلاين من حزمة الـ APK!' : 'Offline cache loaded successfully from internal APK assets!');
      }, 350);
    } else if (scenario === 'crash') {
      appendLog({ tag: 'AndroidRuntime', level: 'E', message: `FATAL EXCEPTION: main PID: 4812`, patchImpactCategory: 'crash' });
      appendLog({ tag: 'AndroidRuntime', level: 'E', message: `java.lang.NullPointerException: Attempt to invoke virtual method on a null object reference`, patchImpactCategory: 'crash' });
      appendLog({ tag: 'AndroidRuntime', level: 'E', message: `\tat ${metadata.packageName}.MainActivity.onCreate(MainActivity.java:42)`, patchImpactCategory: 'crash' });
      appendLog({ tag: 'AndroidRuntime', level: 'E', message: `\tat android.app.ActivityThread.performLaunchActivity(ActivityThread.java:3410)`, patchImpactCategory: 'crash' });
      showToast(isAr ? 'تم حقن استثناء في السجلات لاختبار تصحيح الأخطاء' : 'Exception trace injected into logcat');
    }
  };

  const handleCustomLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;

    appendLog({
      tag: customTag.trim() || 'CustomHook',
      level: customLevel,
      message: customMsg.trim(),
      patchImpactCategory: 'general',
    });

    setCustomMsg('');
    setIsCustomLogModalOpen(false);
    showToast(isAr ? 'تم حقن السجل المخصص بنجاح!' : 'Custom log entry injected!');
  };

  const handleExportLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level}] ${l.pid}/${l.tid} ${l.tag}: ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logcat_${metadata.packageName}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(isAr ? 'تم تصدير ملف السجلات بنجاح!' : 'Logcat file exported!');
  };

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level}] ${l.tag}: ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    showToast(isAr ? 'تم نسخ السجلات إلى الحافظة!' : 'Logs copied to clipboard!');
  };

  const handleToggleBreakpoint = (id: string) => {
    setBreakpoints(prev =>
      prev.map(bp => {
        if (bp.id === id) {
          return {
            ...bp,
            enabled: !bp.enabled,
            status: !bp.enabled ? 'active' : 'disabled',
          };
        }
        return bp;
      })
    );
  };

  const handleAddBreakpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBpFile.trim()) return;

    const newBp: Breakpoint = {
      id: `bp-${Date.now()}`,
      file: newBpFile.trim(),
      line: newBpLine,
      condition: newBpCondition.trim() || undefined,
      hitCount: 0,
      enabled: true,
      status: 'active',
    };

    setBreakpoints(prev => [...prev, newBp]);
    setNewBpCondition('');
  };

  const handleDeleteBreakpoint = (id: string) => {
    setBreakpoints(prev => prev.filter(b => b.id !== id));
  };

  const handleSimulateBreakpointHit = () => {
    const activeBp = breakpoints.find(b => b.enabled);
    if (!activeBp) return;

    setIsPausedAtBreakpoint(true);
    setActiveBreakpointHit(activeBp);

    setBreakpoints(prev =>
      prev.map(bp => (bp.id === activeBp.id ? { ...bp, hitCount: bp.hitCount + 1, status: 'hit' } : bp))
    );

    appendLog({
      tag: 'DebuggerEngine',
      level: 'W',
      message: `Thread suspended at breakpoint hit: ${activeBp.file}:${activeBp.line} (condition: ${activeBp.condition || 'none'})`,
      patchImpactCategory: 'general',
    });
  };

  const handleResumeExecution = () => {
    setIsPausedAtBreakpoint(false);
    setActiveBreakpointHit(null);
    setBreakpoints(prev =>
      prev.map(bp => (bp.status === 'hit' ? { ...bp, status: 'active' } : bp))
    );
    appendLog({
      tag: 'DebuggerEngine',
      level: 'I',
      message: 'Thread resumed. Resuming runtime instructions.',
      patchImpactCategory: 'general',
    });
  };

  const handleVariableChange = (name: string, newVal: any) => {
    setRuntimeVariables(prev =>
      prev.map(v => (v.name === name ? { ...v, value: newVal, isModified: true } : v))
    );
  };

  // Filtered logs calculation
  const filteredLogs = logs.filter(log => {
    if (logFilterLevel !== 'ALL' && log.level !== logFilterLevel) return false;
    if (logCategoryFilter !== 'ALL' && log.patchImpactCategory !== logCategoryFilter) return false;
    if (logFilterTag && !log.tag.toLowerCase().includes(logFilterTag.toLowerCase())) return false;
    if (logSearchQuery) {
      const q = logSearchQuery.toLowerCase();
      const matchMsg = log.message.toLowerCase().includes(q);
      const matchTag = log.tag.toLowerCase().includes(q);
      if (!matchMsg && !matchTag) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Bug className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-white">
                {isAr ? 'بيئة تصحيح أخطاء الـ APK وسجلات النظام (Live Debugger & WebUSB)' : 'APK Debugger & Live Logcat Studio'}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Logcat & WebUSB
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {isAr
                ? 'فحص وتصفية سجلات النظام الحية (Logcat)، الاتصال بجهاز أندرويد عبر WebUSB، ومحاكاة أثر الترقيعات البرمجية لاختبار تجاوز الروت وفحص الشهادات والعمل أوفلاين.'
                : 'Inspect live filterable Logcat, connect physical devices via WebUSB, and simulate incoming logs to test the real-time impact of applied patches.'}
            </p>
          </div>
        </div>

        {/* WebUSB & Resume Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* WebUSB Device Status Button */}
          {connectedUsbDevice ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{connectedUsbDevice.name}</span>
                {isSimulatedUsb && <span className="text-[9px] text-emerald-400/80">(Simulated)</span>}
              </div>
              <button
                onClick={handleDisconnectUsb}
                className="text-xs text-rose-400 hover:text-rose-200 px-1.5 py-0.5 rounded hover:bg-rose-950/40 cursor-pointer"
                title={isAr ? 'فصل اتصال الجهاز' : 'Disconnect'}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectUsb}
              disabled={isUsbConnecting}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Usb className="h-4 w-4 text-cyan-400" />
              <span>
                {isUsbConnecting
                  ? (isAr ? 'جاري الاتصال...' : 'Connecting...')
                  : (isAr ? 'الاتصال بجهاز (WebUSB)' : 'Connect via WebUSB')}
              </span>
            </button>
          )}

          {isPausedAtBreakpoint ? (
            <button
              onClick={handleResumeExecution}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{isAr ? 'متابعة التشغيل (Resume)' : 'Resume Execution'}</span>
            </button>
          ) : (
            <button
              onClick={handleSimulateBreakpointHit}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <Pause className="h-4 w-4 text-amber-400" />
              <span>{isAr ? 'محاكاة نقطة توقف' : 'Trigger Breakpoint'}</span>
            </button>
          )}
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2 p-3 text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* PATCH IMPACT SIMULATOR BAR (Direct User Requirement) */}
      <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/20 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-200">
              {isAr ? 'محاكي أثر الترقيعات البرمجية (Patch Impact Simulator):' : 'Test Impact of Applied Patches on Live Logs:'}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {isAr ? 'اضغط لاختبار سلوك التطبيق مع وبدون الترقيعات' : 'Trigger events to audit patched vs unpatched behavior'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleSimulatePatchImpact('root')}
            className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 border border-rose-500/30 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white group-hover:text-rose-300">
                {isAr ? '🛡️ فحص الروت (Root)' : '🛡️ Root Check'}
              </span>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                patches.some(p => p.id.includes('root') && p.isApplied)
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}>
                {patches.some(p => p.id.includes('root') && p.isApplied) ? 'PATCHED' : 'UNPATCHED'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {isAr ? 'محاكاة فحص /system/xbin/su واختبار التجاوز' : 'Test su binary probing & bypass hooks'}
            </p>
          </button>

          <button
            onClick={() => handleSimulatePatchImpact('ssl')}
            className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 border border-cyan-500/30 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                {isAr ? '🔒 فحص SSL Pinning' : '🔒 SSL Pinning'}
              </span>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                patches.some(p => p.id.includes('ssl') && p.isApplied)
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-cyan-500/20 text-cyan-300'
              }`}>
                {patches.some(p => p.id.includes('ssl') && p.isApplied) ? 'PATCHED' : 'UNPATCHED'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {isAr ? 'محاكاة مصافحة TLS وتجاوز شهادة البروكسي' : 'Test proxy cert validation bypass'}
            </p>
          </button>

          <button
            onClick={() => handleSimulatePatchImpact('offline')}
            className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 border border-emerald-500/30 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                {isAr ? '📡 وضع الأوفلاين' : '📡 Offline Fallback'}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                CACHED
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {isAr ? 'محاكاة انقطاع السيرفر وقراءة الكاش المحلي' : 'Simulate server drop & local cache read'}
            </p>
          </button>

          <button
            onClick={() => handleSimulatePatchImpact('crash')}
            className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 border border-amber-500/30 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white group-hover:text-amber-300">
                {isAr ? '💥 استثناء (Crash Trace)' : '💥 Exception Trace'}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                SIMULATE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {isAr ? 'حقن مسار خطأ لاختبار نقاط التوقف' : 'Inject stack trace for breakpoint testing'}
            </p>
          </button>
        </div>
      </div>

      {/* Grid: Left = Breakpoints & Variables (5 cols), Right = Live Logcat Terminal (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Breakpoints & Runtime Variables */}
        <div className="lg:col-span-5 space-y-6">
          {/* Breakpoints Panel */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h3 className="text-xs font-semibold text-slate-200">
                  {isAr ? 'نقاط التوقف (Breakpoints)' : 'Breakpoints'}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {breakpoints.filter(b => b.enabled).length} active
              </span>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-800/80 max-h-56 overflow-y-auto">
              {breakpoints.map(bp => (
                <div
                  key={bp.id}
                  className={`p-3 flex items-start justify-between gap-2 text-xs transition-colors ${
                    bp.status === 'hit' ? 'bg-amber-500/10 border-l-2 rtl:border-l-0 rtl:border-r-2 border-amber-500' : 'hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      onClick={() => handleToggleBreakpoint(bp.id)}
                      className={`w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 border transition-colors cursor-pointer ${
                        bp.enabled
                          ? bp.status === 'hit'
                            ? 'bg-amber-400 border-amber-300'
                            : 'bg-rose-500 border-rose-400'
                          : 'bg-slate-800 border-slate-700'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="font-mono text-slate-200 truncate">
                        {bp.file}:{bp.line}
                      </div>
                      {bp.condition && (
                        <div className="text-[10px] text-amber-300/80 font-mono truncate">
                          cond: {bp.condition}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-500 font-mono">
                        Hits: {bp.hitCount}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteBreakpoint(bp.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Breakpoint Form */}
            <form onSubmit={handleAddBreakpoint} className="p-3 border-t border-slate-800 bg-slate-900/30 flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="File path..."
                  value={newBpFile}
                  onChange={e => setNewBpFile(e.target.value)}
                  className="flex-1 text-xs font-mono px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden focus:border-emerald-500"
                />
                <input
                  type="number"
                  placeholder="Line"
                  value={newBpLine}
                  onChange={e => setNewBpLine(Number(e.target.value))}
                  className="w-16 text-xs font-mono px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Optional condition (e.g. isOffline == true)"
                  value={newBpCondition}
                  onChange={e => setNewBpCondition(e.target.value)}
                  className="flex-1 text-xs font-mono px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-rose-400 hover:bg-rose-300 rounded transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isAr ? 'إضافة' : 'Add'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Runtime Variables Inspector */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-semibold text-slate-200">
                  {isAr ? 'متغيرات وقت التشغيل (Runtime Variables)' : 'Runtime Variables'}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {runtimeVariables.length} tracked
              </span>
            </div>

            <div className="divide-y divide-slate-800/80 max-h-60 overflow-y-auto">
              {runtimeVariables.map(v => (
                <div key={v.name} className="p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-mono text-slate-200 font-semibold truncate">
                      {v.name}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <span>{v.type}</span>
                      <span>•</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-400">
                        {v.scope}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {typeof v.value === 'boolean' ? (
                      <button
                        onClick={() => handleVariableChange(v.name, !v.value)}
                        className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                          v.value
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {v.value ? 'true' : 'false'}
                      </button>
                    ) : (
                      <input
                        type={v.type === 'int' ? 'number' : 'text'}
                        value={v.value}
                        onChange={e => handleVariableChange(v.name, v.type === 'int' ? Number(e.target.value) : e.target.value)}
                        className="w-full text-xs font-mono px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden focus:border-emerald-500"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Expanded Live Filterable Logcat Terminal (7 cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden">
          {/* Logcat Top Bar */}
          <div className="p-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white">
                  {isAr ? 'سجلات النظام الحية (Live Logcat Stream)' : 'Live Filterable Logcat Stream'}
                </h3>
                {isLoggingActive ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>LIVE</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded-full bg-slate-800">
                    PAUSED
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                ({filteredLogs.length} / {logs.length} logs)
              </span>
            </div>

            {/* Action Tools */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsCustomLogModalOpen(true)}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-300 hover:text-white px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors cursor-pointer"
                title={isAr ? 'حقن سجل مخصص' : 'Inject Custom Log'}
              >
                <Plus className="h-3 w-3" />
                <span>{isAr ? 'حقن سجل' : 'Inject Log'}</span>
              </button>

              <button
                onClick={handleCopyLogs}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded transition-colors cursor-pointer"
                title={isAr ? 'نسخ السجلات' : 'Copy Logs'}
              >
                <Copy className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={handleExportLogs}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded transition-colors cursor-pointer"
                title={isAr ? 'تصدير كملف نصي' : 'Export Logs'}
              >
                <Download className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setIsLoggingActive(!isLoggingActive)}
                className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                  isLoggingActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-800'
                }`}
                title={isLoggingActive ? 'Pause Stream' : 'Resume Stream'}
              >
                {isLoggingActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>

              <button
                onClick={() => setLogs([])}
                className="p-1.5 rounded text-slate-400 hover:text-rose-400 bg-slate-800 transition-colors cursor-pointer"
                title="Clear Logs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Multi-Criteria Filters Bar */}
          <div className="p-2.5 border-b border-slate-800/80 bg-slate-950 flex flex-wrap items-center gap-2 text-xs">
            {/* Level Select */}
            <select
              value={logFilterLevel}
              onChange={e => setLogFilterLevel(e.target.value as any)}
              className="text-[11px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden"
            >
              <option value="ALL">All Levels</option>
              <option value="V">Verbose (V)</option>
              <option value="D">Debug (D)</option>
              <option value="I">Info (I)</option>
              <option value="W">Warn (W)</option>
              <option value="E">Error (E)</option>
            </select>

            {/* Tag Filter */}
            <input
              type="text"
              placeholder={isAr ? 'فلتر الـ Tag...' : 'Tag filter...'}
              value={logFilterTag}
              onChange={e => setLogFilterTag(e.target.value)}
              className="w-28 text-[11px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden"
            />

            {/* Message Search */}
            <input
              type="text"
              placeholder={isAr ? 'بحث في الرسائل...' : 'Search message content...'}
              value={logSearchQuery}
              onChange={e => setLogSearchQuery(e.target.value)}
              className="flex-1 min-w-[140px] text-[11px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden"
            />

            {/* Auto-scroll toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors cursor-pointer ${
                autoScroll
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              Auto-Scroll: {autoScroll ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="px-3 py-1.5 border-b border-slate-800/60 bg-slate-950/90 flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
            <span className="text-slate-500 shrink-0">{isAr ? 'تصنيف السجل:' : 'Filter:'}</span>
            {[
              { key: 'ALL', label: 'All Logs' },
              { key: 'root', label: '🛡️ Root' },
              { key: 'ssl', label: '🔒 SSL' },
              { key: 'offline', label: '📡 Offline' },
              { key: 'crash', label: '💥 Crash' },
            ].map(cat => (
              <button
                key={cat.key}
                onClick={() => setLogCategoryFilter(cat.key as any)}
                className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                  logCategoryFilter === cat.key
                    ? 'bg-indigo-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Logcat Terminal Display */}
          <div
            ref={logContainerRef}
            className="p-3 font-mono text-[11px] leading-relaxed overflow-y-auto flex-1 h-[480px] space-y-1 bg-slate-950 select-text"
          >
            {filteredLogs.length === 0 ? (
              <div className="text-slate-500 text-center py-16">
                {isAr ? 'لا توجد سجلات تطابق الفلتر المحدد حالياً' : 'No logs matching current filters'}
              </div>
            ) : (
              filteredLogs.map(log => {
                let levelColor = 'text-slate-400';
                let rowBg = 'hover:bg-slate-900/50';

                if (log.level === 'D') levelColor = 'text-cyan-400';
                if (log.level === 'I') levelColor = 'text-emerald-400';
                if (log.level === 'W') {
                  levelColor = 'text-amber-400';
                  rowBg = 'bg-amber-500/5 hover:bg-amber-500/10';
                }
                if (log.level === 'E') {
                  levelColor = 'text-rose-400';
                  rowBg = 'bg-rose-500/10 hover:bg-rose-500/15';
                }

                return (
                  <div key={log.id} className={`flex items-start gap-2 px-1.5 py-0.5 rounded transition-colors ${rowBg}`}>
                    <span className="text-slate-600 shrink-0 text-[10px]">{log.timestamp}</span>
                    <span className="text-slate-500 shrink-0 text-[10px]">{log.pid}</span>
                    <span className={`font-bold shrink-0 ${levelColor}`}>[{log.level}]</span>
                    <span className="text-indigo-300 shrink-0 font-medium">{log.tag}:</span>
                    <span className="text-slate-200 break-all">{log.message}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal: Inject Custom Log Entry */}
      {isCustomLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>{isAr ? 'حقن سجل مخصص في Logcat' : 'Inject Custom Logcat Entry'}</span>
              </h3>
              <button
                onClick={() => setIsCustomLogModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomLogSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Tag</label>
                  <input
                    type="text"
                    required
                    value={customTag}
                    onChange={e => setCustomTag(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Level</label>
                  <select
                    value={customLevel}
                    onChange={e => setCustomLevel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-white font-mono"
                  >
                    <option value="V">Verbose (V)</option>
                    <option value="D">Debug (D)</option>
                    <option value="I">Info (I)</option>
                    <option value="W">Warn (W)</option>
                    <option value="E">Error (E)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Message Content</label>
                <textarea
                  rows={3}
                  required
                  placeholder={isAr ? 'اكتب رسالة السجل التي تريد اختبارها...' : 'Type message content to inject...'}
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCustomLogModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded cursor-pointer"
                >
                  {isAr ? 'حقن في السجل' : 'Inject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SMALI STEP-THROUGH DEBUGGER SECTION                                      */}
      {/* ========================================================================= */}
      {(() => {
        // Built-in Smali code instruction block for active patches step-through simulation
        const smaliInstructions = [
          { line: 1, text: '.method public static isRooted(Landroid/content/Context;)Z', isBreakpointable: false },
          { line: 2, text: '    .registers 4', isBreakpointable: false },
          { line: 3, text: '    .param p0, "context"    # Landroid/content/Context;', isBreakpointable: false },
          { line: 4, text: '    .prologue', isBreakpointable: false },
          { line: 5, text: '    const-string v0, "/system/bin/su"', isBreakpointable: true, vars: { v0: '"/system/bin/su"', v1: '0x0', v2: '0x0' } },
          { line: 6, text: '    new-instance v1, Ljava/io/File;', isBreakpointable: true, vars: { v0: '"/system/bin/su"', v1: 'Object(File)', v2: '0x0' } },
          { line: 7, text: '    invoke-direct {v1, v0}, Ljava/io/File;-><init>(Ljava/lang/String;)V', isBreakpointable: true, vars: { v0: '"/system/bin/su"', v1: 'Object(File)', v2: '0x0' } },
          { line: 8, text: '    invoke-virtual {v1}, Ljava/io/File;->exists()Z', isBreakpointable: true, vars: { v0: '"/system/bin/su"', v1: 'Object(File)', v2: '0x1' } },
          { line: 9, text: '    move-result v2', isBreakpointable: true, vars: { v0: '"/system/bin/su"', v1: 'Object(File)', v2: '0x1' } },
          { line: 10, text: '    if-eqz v2, :cond_root_detected', isBreakpointable: true, vars: { v0: '"/system/bin/su"', v1: 'Object(File)', v2: '0x1' } },
          { line: 11, text: '    # --- STUDY INJECTED HOOK BYPASS START ---', isBreakpointable: false },
          { line: 12, text: '    const/4 v2, 0x0   # FORCE RET FALSE', isBreakpointable: true, vars: { v0: '"/system/bin/su"', v1: 'Object(File)', v2: '0x0' } },
          { line: 13, text: '    return v2', isBreakpointable: true, vars: { v0: '"/system/bin/su"', v1: 'Object(File)', v2: '0x0' } },
          { line: 14, text: '    # --- STUDY INJECTED HOOK BYPASS END ---', isBreakpointable: false },
          { line: 15, text: '    :cond_root_detected', isBreakpointable: false },
          { line: 16, text: '    const/4 v2, 0x1', isBreakpointable: true, vars: { v0: '"/system/bin/su"', v1: 'Object(File)', v2: '0x1' } },
          { line: 17, text: '    return v2', isBreakpointable: true, vars: { v0: '"/system/bin/su"', v1: 'Object(File)', v2: '0x1' } },
          { line: 18, text: '.end method', isBreakpointable: false }
        ];

        const [smaliBps, setSmaliBps] = useState<number[]>([5, 12]);
        const [smaliCurrentLine, setSmaliCurrentLine] = useState<number>(5);
        const [smaliRegisters, setSmaliRegisters] = useState<{ [reg: string]: string }>({ v0: '"/system/bin/su"', v1: '0x0', v2: '0x0' });
        const [isSmaliRunning, setIsSmaliRunning] = useState(false);

        const toggleSmaliBp = (line: number) => {
          setSmaliBps(prev => 
            prev.includes(line) ? prev.filter(l => l !== line) : [...prev, line]
          );
          showToast(isAr ? `تغيير نقطة توقف السمالي بالسطر: ${line}` : `Breakpoint toggled on Smali line ${line}`);
        };

        const handleStepSmali = () => {
          let nextIndex = smaliInstructions.findIndex(i => i.line === smaliCurrentLine) + 1;
          if (nextIndex >= smaliInstructions.length) {
            nextIndex = 0; // Wrap around
          }

          const nextInstruction = smaliInstructions[nextIndex];
          setSmaliCurrentLine(nextInstruction.line);
          
          if (nextInstruction.vars) {
            setSmaliRegisters(nextInstruction.vars);
          }

          // Check if new line is a breakpoint
          if (smaliBps.includes(nextInstruction.line)) {
            setIsSmaliRunning(false);
            showToast(isAr ? `🔴 توقف مؤقت عند نقطة التوقف بالسطر: ${nextInstruction.line}` : `🔴 Paused at Smali breakpoint on line ${nextInstruction.line}`);
          }
        };

        const handleRunSmali = () => {
          setIsSmaliRunning(true);
        };

        const handleResetSmali = () => {
          setIsSmaliRunning(false);
          setSmaliCurrentLine(5);
          setSmaliRegisters({ v0: '"/system/bin/su"', v1: '0x0', v2: '0x0' });
        };

        // Simulated debugger stepping loop
        useEffect(() => {
          if (!isSmaliRunning) return;

          const timer = setTimeout(() => {
            handleStepSmali();
          }, 1100);

          return () => clearTimeout(timer);
        }, [isSmaliRunning, smaliCurrentLine]);

        return (
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? 'مصحح لغة سمالي المدمج (Smali Step-Through Debugger)' : 'Smali Code Step-Through Debugger'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAr 
                      ? 'تتبع كود Smali لترقيعات حماية الروت، تحكم بنقاط التوقف (Breakpoints) وراقب السجلات (Registers) خطوة بخطوة.' 
                      : 'Step through decompiled Smali routines, toggle breakpoints, and monitor virtual registers (v0-v2) live.'}
                  </p>
                </div>
              </div>

              {/* Debug controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetSmali}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                  title={isAr ? 'إعادة تعيين' : 'Reset Debugger'}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={handleStepSmali}
                  disabled={isSmaliRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-50 cursor-pointer"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{isAr ? 'خطوة بخطوة' : 'Step Into'}</span>
                </button>
                {isSmaliRunning ? (
                  <button
                    onClick={() => setIsSmaliRunning(false)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-pointer"
                  >
                    <Pause className="h-3.5 w-3.5 fill-current" />
                    <span>{isAr ? 'توقف مؤقت' : 'Pause'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleRunSmali}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded bg-emerald-400 hover:bg-emerald-300 text-slate-950 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>{isAr ? 'تشغيل مستمر' : 'Run'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Smali Code Editor Box (7 cols) */}
              <div className="lg:col-span-8 flex flex-col rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-cyan-400">AuthService.smali &gt; isRooted()</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Smali VM Emulator</span>
                </div>

                <div className="p-3 font-mono text-[11px] leading-relaxed overflow-x-auto h-72 space-y-1">
                  {smaliInstructions.map(instr => {
                    const hasBp = smaliBps.includes(instr.line);
                    const isCurrent = smaliCurrentLine === instr.line;
                    return (
                      <div 
                        key={instr.line} 
                        className={`flex items-start gap-1 py-0.5 rounded transition-colors ${
                          isCurrent 
                            ? 'bg-emerald-500/10 text-emerald-300 font-semibold' 
                            : 'hover:bg-slate-900/30'
                        }`}
                      >
                        {/* Breakpoint Column */}
                        <div className="w-6 shrink-0 flex items-center justify-center">
                          {instr.isBreakpointable ? (
                            <button
                              onClick={() => toggleSmaliBp(instr.line)}
                              className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                                hasBp 
                                  ? 'bg-rose-500 border-rose-400 text-white' 
                                  : 'border-slate-800 hover:border-rose-500/50 hover:bg-rose-500/10'
                              }`}
                              title={isAr ? 'اضغط لتعيين نقطة توقف' : 'Click to toggle breakpoint'}
                            >
                              {hasBp && <span className="text-[8px]">●</span>}
                            </button>
                          ) : (
                            <span className="w-3.5 h-3.5" />
                          )}
                        </div>

                        {/* Line Number Column */}
                        <span className="w-8 shrink-0 text-slate-600 text-[10px] text-right pr-2 select-none">
                          {instr.line}
                        </span>

                        {/* Instruction text with current line pointer arrow */}
                        <span className="flex items-center gap-1.5 flex-1 select-text">
                          {isCurrent && <span className="text-emerald-400 animate-pulse font-bold">➔</span>}
                          <span className={`${
                            isCurrent 
                              ? 'text-emerald-300' 
                              : instr.text.includes('#') 
                              ? 'text-slate-500 italic' 
                              : instr.text.startsWith('.') 
                              ? 'text-purple-400 font-semibold' 
                              : instr.text.includes('invoke') 
                              ? 'text-indigo-300' 
                              : 'text-slate-300'
                          }`}>
                            {instr.text}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Registers & VM State panel (4 cols) */}
              <div className="lg:col-span-4 flex flex-col rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">{isAr ? 'مسجلات المعالج (Virtual Registers)' : 'Virtual Registers'}</span>
                  <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">32-bit</span>
                </div>

                <div className="p-3 flex-1 divide-y divide-slate-800/60 font-mono text-xs">
                  {Object.entries(smaliRegisters).map(([reg, val]) => (
                    <div key={reg} className="py-2.5 flex items-center justify-between gap-4">
                      <span className="font-bold text-amber-400">{reg}</span>
                      <span className="text-slate-300 text-right truncate max-w-[200px]" title={val}>
                        {val}
                      </span>
                    </div>
                  ))}

                  <div className="pt-3.5 mt-2 space-y-1 text-[10px] text-slate-500">
                    <div className="flex justify-between">
                      <span>VM State:</span>
                      <span className={isSmaliRunning ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {isSmaliRunning ? (isAr ? 'جاري التشغيل' : 'RUNNING') : (isAr ? 'موقوف مؤقتاً' : 'PAUSED')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>PC Instruction:</span>
                      <span className="text-slate-400 font-mono">isRooted() Line {smaliCurrentLine}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

