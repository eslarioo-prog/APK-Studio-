import React, { useState } from 'react';
import { Code2, Save, FileCode, CheckCircle2, AlertCircle, Sparkles, Plus, Copy, Check, Sliders, Layers, Smartphone } from 'lucide-react';
import { Language } from '../../i18n/translations';

export interface XmlFileItem {
  path: string;
  name: string;
  category: 'manifest' | 'layout' | 'values' | 'security' | 'custom';
  content: string;
}

interface XmlEditorTabProps {
  lang: Language;
  xmlFiles: XmlFileItem[];
  onSaveXmlFile: (path: string, newContent: string) => void;
  onAddNewXmlFile: (name: string, category: XmlFileItem['category'], content: string) => void;
  onOpenEmulator?: (content: string) => void;
}

export const XmlEditorTab: React.FC<XmlEditorTabProps> = ({
  lang,
  xmlFiles,
  onSaveXmlFile,
  onAddNewXmlFile,
  onOpenEmulator,
}) => {
  const isAr = lang === 'ar';
  const [selectedFilePath, setSelectedFilePath] = useState<string>(xmlFiles[0]?.path || 'AndroidManifest.xml');
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('code');
  const [currentContent, setCurrentContent] = useState<string>(xmlFiles[0]?.content || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [xmlError, setXmlError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedFile = xmlFiles.find(f => f.path === selectedFilePath);

  const handleSelectFile = (path: string) => {
    setSelectedFilePath(path);
    const file = xmlFiles.find(f => f.path === path);
    if (file) {
      setCurrentContent(file.content);
      validateXml(file.content);
    }
  };

  const validateXml = (xmlStr: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlStr, 'application/xml');
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        setXmlError(parserError.textContent || 'Syntax error in XML structure');
        return false;
      }
      setXmlError(null);
      return true;
    } catch (e: any) {
      setXmlError(e.message);
      return false;
    }
  };

  const handleContentChange = (text: string) => {
    setCurrentContent(text);
    validateXml(text);
  };

  const handleSave = () => {
    if (xmlError) {
      alert(isAr ? 'يوجد خطأ في تركيب كود XML. يرجى تصحيحه قبل الحفظ!' : 'There is a syntax error in the XML code. Please correct it before saving!');
      return;
    }
    onSaveXmlFile(selectedFilePath, currentContent);
    setToastMessage(isAr ? `تم حفظ ملف ${selectedFile?.name} بنجاح!` : `File ${selectedFile?.name} saved successfully!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFormatXml = () => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(currentContent, 'application/xml');
      if (doc.querySelector('parsererror')) {
        alert(isAr ? 'تعذر تنسيق الكود لوجود أخطاء في الوسوم' : 'Cannot format due to XML syntax errors');
        return;
      }
      const formatted = formatXmlString(currentContent);
      setCurrentContent(formatted);
      setToastMessage(isAr ? 'تم تنسيق كود XML بنجاح!' : 'XML formatted successfully!');
      setTimeout(() => setToastMessage(null), 2500);
    } catch (e) {
      // ignore
    }
  };

  const formatXmlString = (xml: string) => {
    let formatted = '';
    let indent = '';
    const tab = '    ';
    xml.split(/>\s*</).forEach((node) => {
      if (node.match(/^\/\w/)) indent = indent.substring(tab.length);
      formatted += indent + '<' + node + '>\r\n';
      if (node.match(/^<?\w[^>]*[^\/]$/)) indent += tab;
    });
    return formatted.substring(1, formatted.length - 3);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddXmlPreset = (presetType: 'network_config' | 'custom_layout' | 'colors') => {
    if (presetType === 'network_config') {
      const content = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">127.0.0.1</domain>
        <domain includeSubdomains="true">localhost</domain>
    </domain-config>
</network-security-config>`;
      onAddNewXmlFile('network_security_config.xml', 'security', content);
      handleSelectFile('res/xml/network_security_config.xml');
    } else if (presetType === 'custom_layout') {
      const content = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp"
    android:background="#0F172A">

    <TextView
        android:id="@+id/offline_banner_title"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="وضع التشغيل دون اتصال (Standalone Offline)"
        android:textColor="#10B981"
        android:textSize="18sp"
        android:textStyle="bold"
        android:gravity="center" />

    <Button
        android:id="@+id/btn_direct_login"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="24dp"
        android:text="تسجيل الدخول المباشر للمشرف"
        android:background="#10B981"
        android:textColor="#090D16" />

</LinearLayout>`;
      onAddNewXmlFile('activity_offline_portal.xml', 'layout', content);
      handleSelectFile('res/layout/activity_offline_portal.xml');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Code2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white mb-1">
              {isAr ? 'محرر وتعديل ملفات XML / XSML (Android XML Studio)' : 'Android XML & XSML Resource Editor'}
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {isAr
                ? 'تعديل جميع ملفات XML في التطبيق: المانيفست، ملفات الواجهات (Layouts)، تكوين أمان الشبكة (Network Config)، وموارد الألوان والنصوص'
                : 'Modify all XML resources inside the APK: AndroidManifest, UI Layouts, Network Security Config, and Values'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedFile?.category === 'layout' && (
            <button
              onClick={() => onOpenEmulator?.(currentContent)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all cursor-pointer shadow-lg shadow-indigo-500/20 active:scale-95 border border-indigo-400/30 whitespace-nowrap"
            >
              <Smartphone className="h-4 w-4" />
              <span>{isAr ? 'محاكي الواجهة' : 'UI Emulator'}</span>
            </button>
          )}

          <button
            onClick={handleFormatXml}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
            title={isAr ? 'إعادة ترتيب وتنسيق الكود تلقائياً' : 'Auto format XML'}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>{isAr ? 'تنسيق الكود' : 'Format XML'}</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{isAr ? 'حفظ ملف الـ XML' : 'Save XML'}</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2 p-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Preset XML Quick Builders */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-400" />
          <span>{isAr ? 'إضافة قوالب XML جاهزة للتطبيق:' : 'Add Ready XML Presets:'}</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAddXmlPreset('network_config')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-400" />
            <span>{isAr ? 'ملف أمان الشبكة (Network Security Config)' : 'Network Security Config'}</span>
          </button>

          <button
            onClick={() => handleAddXmlPreset('custom_layout')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-indigo-400" />
            <span>{isAr ? 'واجهة أوفلاين (Layout XML)' : 'Offline Layout XML'}</span>
          </button>
        </div>
      </div>

      {/* XML Editor Interface */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden flex flex-col">
        {/* Top File Selection Tabs */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {xmlFiles.map((file) => (
              <button
                key={file.path}
                onClick={() => handleSelectFile(file.path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedFilePath === file.path
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <FileCode className="h-3.5 w-3.5 text-emerald-400" />
                <span>{file.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}</span>
          </button>
        </div>

        {/* Validation Status */}
        {xmlError ? (
          <div className="p-3 text-xs text-rose-400 bg-rose-500/10 border-b border-rose-500/20 flex items-center gap-2 font-mono">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>XML Error: {xmlError}</span>
          </div>
        ) : (
          <div className="px-4 py-1.5 bg-slate-900/40 border-b border-slate-800 text-[11px] font-mono text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>XML Syntax Valid (تركيب الكود والوسوم سليم 100%)</span>
          </div>
        )}

        {/* Textarea Code Editor */}
        <div className="p-4 bg-slate-950">
          <textarea
            value={currentContent}
            onChange={(e) => handleContentChange(e.target.value)}
            rows={22}
            spellCheck={false}
            className="w-full font-mono text-xs leading-relaxed p-4 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden focus:border-emerald-500 selection:bg-emerald-500/30 resize-y"
          />
        </div>
      </div>
    </div>
  );
};
