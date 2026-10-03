import React, { useState } from 'react';
import { Bot, Sparkles, Send, Copy, Check, ShieldCheck, Terminal, ArrowRight, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Language } from '../../i18n/translations';
import { ApkMetadata, ApkPermission } from '../../types/apk';

interface AiAssistantTabProps {
  lang: Language;
  metadata: ApkMetadata;
  permissions: ApkPermission[];
  detectedEndpoints: string[];
  isOfflineMode: boolean;
  onApplyCodeSnippet?: (snippet: string) => void;
}

export const AiAssistantTab: React.FC<AiAssistantTabProps> = ({
  lang,
  metadata,
  permissions,
  detectedEndpoints,
  isOfflineMode,
  onApplyCodeSnippet,
}) => {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; model?: string; timestamp: string }[]
  >([
    {
      role: 'assistant',
      text: isAr
        ? `مرحباً بك! أنا مساعد الذكاء الاصطناعي (Gemini AI Copilot) المتخصص في هندسة وتعديل تطبيقات أندرويد.\nيمكنني مساعدتك في:\n1. تحليل أمان حزمة APK واكتشاف مسارات الاتصال الخارجية.\n2. إنشاء وتوليد أكواد ترقيع Smali للتحويل إلى أوفلاين.\n3. شرح وتفكيك ملفات المانيفست وملفات الـ XML.\n4. استخراج وتعديل بيانات ملفات الإعدادات وكلمات المرور.\n\nاختر أحد الإجراءات السريعة أدناه أو اكتب سؤالك مباشرة!`
        : `Hello! I am your Gemini AI APK Reverse Engineering & Modding Copilot.\nI can assist you with:\n1. Auditing APK security and external network endpoints.\n2. Generating Smali patch snippets for complete offline conversion.\n3. Analyzing and generating AndroidManifest and resource XMLs.\n4. Locating and editing internal data files and credentials.\n\nSelect a preset prompt below or ask your custom question!`,
      model: 'gemini-3.8-flash',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const presets = isAr
    ? [
        { label: '⚡ استراتيجية التحويل إلى أوفلاين', query: 'كيف يمكنني تحويل هذا التطبيق ليعمل 100% بدون إنترنت؟ اكتب لي كود Smali المقترح لتجاوز فحص الاتصال.' },
        { label: '🛡️ فحص المانيفست وثغرات الأمان', query: 'قم بتحليل ملف AndroidManifest والصلاحيات لهذا التطبيق واذكر أي ثغرات أو أذونات غير ضرورية.' },
        { label: '🔑 كود تجاوز التحقق من كلمة المرور', query: 'اكتب لي ترقيع Smali يجعل دالة التوثيق تقبل أي كلمة مرور يدخلها المستخدم وتتخطى شاشة تسجيل الدخول.' },
        { label: '📑 توليد ملف أمان الشبكة (Network Config)', query: 'أعطني كود XML لملف network_security_config.xml يسمح باتصالات HTTP غير المشفرة للـ 127.0.0.1 ويتجاوز SSL Pinning.' },
      ]
    : [
        { label: '⚡ Complete Offline Conversion Strategy', query: 'How do I convert this app to run 100% standalone offline? Provide recommended Smali network bypass code.' },
        { label: '🛡️ Manifest & Security Audit', query: 'Audit the AndroidManifest and permissions of this APK. Identify privacy risks and unnecessary permissions.' },
        { label: '🔑 Login Password Bypass Patch', query: 'Generate a Smali code patch that forces authentication functions to always return true regardless of entered password.' },
        { label: '📑 Network Security Config XML', query: 'Generate network_security_config.xml that permits cleartext HTTP to 127.0.0.1 and bypasses custom certificate checks.' },
      ];

  const handleSendPrompt = async (textToSend?: string) => {
    const query = textToSend || prompt;
    if (!query.trim() || isLoading) return;

    const userMsg = {
      role: 'user' as const,
      text: query,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          apkContext: {
            appName: metadata.appName,
            packageName: metadata.packageName,
            versionName: metadata.versionName,
            targetSdk: metadata.targetSdk,
            minSdk: metadata.minSdk,
            permissions: permissions.filter(p => p.isEnabled).map(p => p.name),
            detectedEndpoints,
            isOfflineMode,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: data.analysis,
            model: data.model || 'gemini-3.8-flash',
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: isAr
            ? `⚠️ حدث خطأ أثناء الاتصال بنموذج الذكاء الاصطناعي: ${err.message}`
            : `⚠️ Error contacting AI model: ${err.message}`,
          model: 'error',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-white">
                {isAr ? 'مساعد الذكاء الاصطناعي (Gemini AI APK Copilot)' : 'Gemini AI APK Modding Copilot'}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                gemini-3.8-flash
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {isAr
                ? 'نموذج ذكاء اصطناعي مدمج لمساعدتك في فحص الكود، كتابة ترقيعات Smali، توليد ملفات XML، وتسهيل التحويل إلى أوفلاين'
                : 'Integrated AI model to assist with code auditing, generating Smali patches, creating XML templates, and offline refactoring'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            {metadata.packageName}
          </span>
        </div>
      </div>

      {/* Preset Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSendPrompt(preset.query)}
            disabled={isLoading}
            className="p-3 text-start rtl:text-right rounded-lg bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/80 transition-colors cursor-pointer text-xs font-medium text-slate-300 disabled:opacity-50"
          >
            <span className="block truncate">{preset.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden flex flex-col h-[520px]">
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mb-1">
                <span>{msg.role === 'user' ? (isAr ? 'أنت' : 'You') : 'Gemini AI Assistant'}</span>
                <span>·</span>
                <span>{msg.timestamp}</span>
                {msg.model && (
                  <>
                    <span>·</span>
                    <span className="text-emerald-400">{msg.model}</span>
                  </>
                )}
              </div>

              <div
                className={`p-4 rounded-xl max-w-3xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans space-y-2 select-text">
                  {msg.text}
                </div>

                {msg.role === 'assistant' && (
                  <div className="flex justify-end pt-2 border-t border-slate-800/80 mt-3">
                    <button
                      onClick={() => handleCopy(msg.text, idx)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer font-mono"
                    >
                      {copiedIdx === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedIdx === idx ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الإجابة' : 'Copy')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 p-3 bg-emerald-500/10 rounded-lg max-w-sm">
              <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
              <span>{isAr ? 'جاري تحليل التطبيق والتوليد عبر نموذج Gemini...' : 'Analyzing APK with Gemini model...'}</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={
                isAr
                  ? 'اكتب سؤالك أو اطلب كود ترقيع أو تحليل أمان للتطبيق...'
                  : 'Ask about APK modification, Smali patching, or security...'
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              className="flex-1 text-xs px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-hidden focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isAr ? 'إرسال' : 'Send'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
