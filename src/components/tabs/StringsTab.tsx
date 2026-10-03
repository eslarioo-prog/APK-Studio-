import React, { useState } from 'react';
import { Type, Search, Plus, Trash2, CheckCircle2, Download, Upload, Globe, RefreshCw } from 'lucide-react';
import { Language, t } from '../../i18n/translations';
import { ApkStringResource } from '../../types/apk';

interface StringsTabProps {
  lang: Language;
  stringsList: ApkStringResource[];
  onUpdateString: (id: string, key: string, value: string) => void;
  onAddString: (key: string, value: string) => void;
  onDeleteString: (id: string) => void;
}

export const StringsTab: React.FC<StringsTabProps> = ({
  lang,
  stringsList,
  onUpdateString,
  onAddString,
  onDeleteString,
}) => {
  const strings = t[lang];
  const isAr = lang === 'ar';
  const [search, setSearch] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleAutoTranslate = async () => {
    setIsTranslating(true);
    // Simulate API call to Google Translate
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    stringsList.forEach(s => {
      // Very basic mock translation for demo purposes
      if (s.value.toLowerCase().includes('welcome')) onUpdateString(s.id, s.key, 'مرحباً بك');
      if (s.value.toLowerCase().includes('login')) onUpdateString(s.id, s.key, 'تسجيل الدخول');
      if (s.value.toLowerCase().includes('cancel')) onUpdateString(s.id, s.key, 'إلغاء');
      if (s.value.toLowerCase().includes('save')) onUpdateString(s.id, s.key, 'حفظ');
    });

    setIsTranslating(false);
    setToastMessage(isAr ? 'تمت الترجمة الآلية للنصوص المتطابقة!' : 'Auto-translation completed for matching terms!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredStrings = stringsList.filter(
    s => s.key.toLowerCase().includes(search.toLowerCase()) ||
         s.value.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    onAddString(newKey.trim(), newValue.trim());
    setNewKey('');
    setNewValue('');
    setToastMessage(isAr ? 'تمت إضافة النص بنجاح!' : 'String added!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportJson = () => {
    const data: Record<string, string> = {};
    stringsList.forEach(s => { data[s.key] = s.value; });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'strings_export.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Type className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white mb-1">
              {strings.stringsTab.title}
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {strings.stringsTab.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAutoTranslate}
            disabled={isTranslating}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-indigo-400 hover:bg-indigo-300 rounded-lg transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isTranslating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
            <span>{isAr ? 'ترجمة آلية (Auto)' : 'Auto-Translate'}</span>
          </button>
          
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap cursor-pointer shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span>{strings.stringsTab.exportJson}</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2 p-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Add New String Form & Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder={strings.stringsTab.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs ps-9 pe-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        {/* Add String Inputs */}
        <form onSubmit={handleAdd} className="md:col-span-8 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="string_key_name"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="w-full sm:w-1/3 font-mono text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-hidden focus:border-emerald-500"
          />
          <input
            type="text"
            placeholder={isAr ? 'النص المعروض...' : 'Display value...'}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="w-full sm:w-1/2 text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-hidden focus:border-emerald-500"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-1 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isAr ? 'إضافة' : 'Add'}</span>
          </button>
        </form>
      </div>

      {/* Strings Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        <div className="divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto">
          {filteredStrings.map((item) => (
            <div
              key={item.id}
              className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors"
            >
              <div className="w-full sm:w-1/3">
                <span className="font-mono text-xs text-indigo-400 font-semibold block truncate">
                  {item.key}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">@string/{item.key}</span>
              </div>

              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => onUpdateString(item.id, item.key, e.target.value)}
                  className="w-full text-xs px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-100 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <button
                onClick={() => onDeleteString(item.id)}
                className="text-slate-500 hover:text-rose-400 p-1.5 self-end sm:self-auto cursor-pointer"
                title={strings.common.delete}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
