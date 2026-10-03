import React, { useState } from 'react';
import { FileCode, Save, Search, Replace, Plus, CheckCircle2, AlertCircle, FileText, Code2, Sliders } from 'lucide-react';
import { Language, t } from '../../i18n/translations';

export interface DataFileItem {
  path: string;
  name: string;
  type: 'json' | 'xml' | 'properties' | 'text';
  content: string;
  editableFields?: { labelAr: string; labelEn: string; key: string; value: any; type: 'string' | 'number' | 'boolean' }[];
}

interface FileDataTabProps {
  lang: Language;
  dataFiles: DataFileItem[];
  onSaveFileContent: (path: string, newContent: string) => void;
  onGlobalSearchReplace: (searchTerm: string, replaceTerm: string) => { replacedCount: number };
  onAddNewFile: (name: string, content: string) => void;
}

export const FileDataTab: React.FC<FileDataTabProps> = ({
  lang,
  dataFiles,
  onSaveFileContent,
  onGlobalSearchReplace,
  onAddNewFile,
}) => {
  const strings = t[lang];
  const [selectedFilePath, setSelectedFilePath] = useState<string>(dataFiles[0]?.path || '');
  const [viewMode, setViewMode] = useState<'visual' | 'raw'>('visual');
  const [rawText, setRawText] = useState<string>(dataFiles[0]?.content || '');
  const [editableFields, setEditableFields] = useState<any[]>(dataFiles[0]?.editableFields || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const selectedFile = dataFiles.find(f => f.path === selectedFilePath);

  const handleSelectFile = (path: string) => {
    setSelectedFilePath(path);
    const file = dataFiles.find(f => f.path === path);
    if (file) {
      setRawText(file.content);
      setEditableFields(file.editableFields || []);
      setJsonError(null);
    }
  };

  const handleFieldChange = (index: number, val: any) => {
    const updated = [...editableFields];
    updated[index].value = val;
    setEditableFields(updated);

    // If it's JSON, reflect into rawText
    if (selectedFile?.type === 'json') {
      try {
        const parsed = JSON.parse(rawText);
        setNestedValue(parsed, updated[index].key, val);
        setRawText(JSON.stringify(parsed, null, 2));
      } catch (e) {
        // ignore
      }
    }
  };

  function setNestedValue(obj: any, path: string, val: any) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!cur[parts[i]]) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = val;
  }

  const handleRawTextChange = (text: string) => {
    setRawText(text);
    if (selectedFile?.type === 'json') {
      try {
        JSON.parse(text);
        setJsonError(null);
      } catch (e: any) {
        setJsonError(e.message);
      }
    }
  };

  const handleSaveCurrentFile = () => {
    if (selectedFile?.type === 'json' && jsonError) {
      alert(lang === 'ar' ? 'يرجى تصحيح خطأ تنسيق الـ JSON قبل الحفظ!' : 'Please fix the JSON syntax error before saving!');
      return;
    }
    onSaveFileContent(selectedFilePath, rawText);
    setToastMessage(strings.fileDataTab.fileSavedSuccess);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSearchReplace = () => {
    if (!searchQuery) return;
    const { replacedCount } = onGlobalSearchReplace(searchQuery, replaceQuery);
    setToastMessage(
      lang === 'ar'
        ? `تم استبدال "${searchQuery}" بـ "${replaceQuery}" في ${replacedCount} موضعاً!`
        : `Replaced "${searchQuery}" with "${replaceQuery}" in ${replacedCount} locations!`
    );
    // Reload current file text
    const current = dataFiles.find(f => f.path === selectedFilePath);
    if (current) {
      setRawText(current.content);
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateNewFile = () => {
    const fileName = prompt(
      lang === 'ar' ? 'أدخل اسم الملف الجديد (مثال: custom_config.json):' : 'Enter new file name (e.g., custom_config.json):',
      'custom_config.json'
    );
    if (!fileName) return;

    const defaultContent = fileName.endsWith('.json')
      ? JSON.stringify({ offlineEnabled: true, customData: 'test' }, null, 2)
      : 'key=value\noffline=true\n';

    onAddNewFile(fileName, defaultContent);
    handleSelectFile(`assets/${fileName}`);
    setToastMessage(lang === 'ar' ? 'تم إنشاء الملف الجديد بنجاح!' : 'New file created successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileCode className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white mb-1">
              {strings.fileDataTab.title}
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {strings.fileDataTab.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNewFile}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{strings.fileDataTab.addNewFileBtn}</span>
          </button>

          <button
            onClick={handleSaveCurrentFile}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{strings.fileDataTab.saveFileBtn}</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2 p-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Search and Replace Panel */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80">
        <h4 className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-2">
          <Search className="h-4 w-4 text-emerald-400" />
          <span>{strings.fileDataTab.searchReplaceTitle}</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <input
              type="text"
              placeholder={strings.fileDataTab.searchLabel}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden focus:border-emerald-500"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder={strings.fileDataTab.replaceLabel}
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-emerald-300 focus:outline-hidden focus:border-emerald-500"
            />
          </div>
          <button
            onClick={handleSearchReplace}
            disabled={!searchQuery}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <Replace className="h-4 w-4" />
            <span>{strings.fileDataTab.searchReplaceBtn}</span>
          </button>
        </div>
      </div>

      {/* File Editor Interface */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        {/* Top File Selector Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
              {strings.fileDataTab.selectFile}
            </span>
            <div className="flex items-center gap-1.5">
              {dataFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => handleSelectFile(file.path)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    selectedFilePath === file.path
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {file.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'visual'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>{strings.fileDataTab.visualEditor}</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'raw'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>{strings.fileDataTab.rawEditor}</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5">
          {viewMode === 'visual' && editableFields.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editableFields.map((field, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200">
                      {lang === 'ar' ? field.labelAr : field.labelEn}
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">{field.key}</span>
                  </div>

                  {field.type === 'boolean' ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleFieldChange(idx, !field.value)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                          field.value
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {field.value ? (lang === 'ar' ? 'مفعل (TRUE)' : 'Enabled (TRUE)') : (lang === 'ar' ? 'معطل (FALSE)' : 'Disabled (FALSE)')}
                      </button>
                    </div>
                  ) : field.type === 'number' ? (
                    <input
                      type="number"
                      value={field.value}
                      onChange={(e) => handleFieldChange(idx, parseFloat(e.target.value) || 0)}
                      className="w-full font-mono text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-emerald-300 focus:outline-hidden focus:border-emerald-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => handleFieldChange(idx, e.target.value)}
                      className="w-full font-mono text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-hidden focus:border-emerald-500"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {jsonError && (
                <div className="p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 font-mono">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>JSON Error: {jsonError}</span>
                </div>
              )}
              <textarea
                value={rawText}
                onChange={(e) => handleRawTextChange(e.target.value)}
                rows={18}
                spellCheck={false}
                className="w-full font-mono text-xs leading-relaxed p-4 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-hidden focus:border-emerald-500 selection:bg-emerald-500/30 resize-y"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
