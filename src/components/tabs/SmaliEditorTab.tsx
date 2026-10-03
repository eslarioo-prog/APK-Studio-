import React, { useState, useMemo } from 'react';
import { FileCode, Search, Save, Trash2, CheckCircle2, ChevronRight, FileJson, Cpu, Bug, Code2, Layers } from 'lucide-react';
import { Language } from '../../i18n/translations';

export interface SmaliFile {
  path: string;
  name: string;
  content: string;
}

interface SmaliEditorTabProps {
  lang: Language;
  smaliFiles: SmaliFile[];
  onSaveSmaliFile: (path: string, content: string) => void;
}

export const SmaliEditorTab: React.FC<SmaliEditorTabProps> = ({
  lang,
  smaliFiles,
  onSaveSmaliFile,
}) => {
  const isAr = lang === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilePath, setActiveFilePath] = useState<string | null>(smaliFiles[0]?.path || null);
  const [editContent, setEditContent] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredFiles = useMemo(() => {
    return smaliFiles.filter(f => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.path.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [smaliFiles, searchQuery]);

  const activeFile = useMemo(() => {
    return smaliFiles.find(f => f.path === activeFilePath) || null;
  }, [smaliFiles, activeFilePath]);

  // Update edit buffer when switching files
  React.useEffect(() => {
    if (activeFile) {
      setEditContent(activeFile.content);
    }
  }, [activeFile]);

  const handleSave = () => {
    if (activeFilePath) {
      onSaveSmaliFile(activeFilePath, editContent);
      setToastMessage(isAr ? 'تم حفظ التعديلات البرمجية بنجاح ✓' : 'Smali logic saved successfully ✓');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="flex flex-col h-[700px] gap-4">
      {/* Banner */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Cpu className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-white mb-0.5">
            {isAr ? 'محرر أكواد Smali المتقدم (Logic Modder)' : 'Advanced Smali Logic Editor'}
          </h2>
          <p className="text-[11px] text-slate-400 truncate">
            {isAr 
              ? 'تعديل المنطق البرمجي والوظائف الداخلية للتطبيق مباشرة عبر لغة اسمبلي أندرويد (Smali).' 
              : 'Directly modify application logic and internal functions using Smali assembly language.'}
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2 p-3 text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Left Sidebar: File List */}
        <div className="w-1/3 flex flex-col gap-3">
          <div className="relative shrink-0">
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isAr ? 'بحث في ملفات Smali...' : 'Search Smali files...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/40 p-2 space-y-1 custom-scrollbar">
            {filteredFiles.map(file => (
              <button
                key={file.path}
                onClick={() => setActiveFilePath(file.path)}
                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-left transition-all ${
                  activeFilePath === file.path 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <FileCode className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[10px] font-mono truncate">{file.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Area: Code Editor */}
        <div className="flex-1 flex flex-col gap-3">
          {activeFile ? (
            <>
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 truncate max-w-xs">{activeFile.path}</span>
                </div>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isAr ? 'حفظ الكود' : 'Save Smali'}</span>
                </button>
              </div>

              <div className="flex-1 relative group">
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  spellCheck={false}
                  className="w-full h-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-cyan-300/90 focus:outline-none focus:border-cyan-500 selection:bg-cyan-500/30 resize-none custom-scrollbar"
                />
                {/* Visual Line Indicator (Fake) */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/10 group-hover:bg-cyan-500/30 transition-colors rounded-l-xl pointer-events-none" />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 space-y-4">
              <Code2 className="h-12 w-12 text-slate-800" />
              <p className="text-sm text-slate-500">{isAr ? 'اختر ملفاً من القائمة الجانبية لبدء التعديل.' : 'Select a smali file from the list to start modding logic.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
