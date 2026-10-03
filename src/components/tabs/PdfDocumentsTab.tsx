import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  Plus, 
  FolderOpen, 
  FileUp, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Search,
  ExternalLink,
  Cloud
} from 'lucide-react';
import { Language, t } from '../../i18n/translations';
import JSZip from 'jszip';

interface PdfFileItem {
  path: string;
  name: string;
  size: number;
  data: Uint8Array;
}

interface PdfDocumentsTabProps {
  lang: Language;
  originalZip: JSZip | null;
  onUpdateZip: (zip: JSZip) => void;
  onLogBuild?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const PdfDocumentsTab: React.FC<PdfDocumentsTabProps> = ({
  lang,
  originalZip,
  onUpdateZip,
  onLogBuild,
}) => {
  const isAr = lang === 'ar';
  const [pdfFiles, setPdfFiles] = useState<PdfFileItem[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<PdfFileItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addPdfInputRef = useRef<HTMLInputElement>(null);

  // Scan zip for PDF files on mount or zip change
  useEffect(() => {
    const scanForPdfs = async () => {
      if (!originalZip) {
        // If no zip is loaded, create simulated sample PDFs for testing
        const samplePdfs: PdfFileItem[] = [
          {
            path: 'assets/docs/user_guide.pdf',
            name: 'user_guide.pdf',
            size: 1024 * 342, // 342 KB
            data: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]), // %PDF-1.4 header
          },
          {
            path: 'assets/terms_and_conditions.pdf',
            name: 'terms_and_conditions.pdf',
            size: 1024 * 125, // 125 KB
            data: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]),
          }
        ];
        setPdfFiles(samplePdfs);
        return;
      }

      const foundPdfs: PdfFileItem[] = [];
      const pdfPaths = Object.keys(originalZip.files).filter(path => path.toLowerCase().endsWith('.pdf'));

      for (const path of pdfPaths) {
        const fileObj = originalZip.file(path);
        if (fileObj) {
          const data = await fileObj.async('uint8array');
          foundPdfs.push({
            path,
            name: path.split('/').pop() || path,
            size: data.length,
            data,
          });
        }
      }

      setPdfFiles(foundPdfs);
    };

    scanForPdfs();
  }, [originalZip]);

  // Clean up preview Object URLs
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSelectPdf = (pdf: PdfFileItem) => {
    setSelectedPdf(pdf);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    // Create a real Blob and generate Object URL for visual iframe/embed preview
    const blob = new Blob([pdf.data as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
  };

  const showToastMsg = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDownloadPdf = (pdf: PdfFileItem) => {
    const blob = new Blob([pdf.data as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = pdf.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSwapPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedPdf) return;
    const file = e.target.files[0];
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToastMsg(isAr ? 'عذراً، يرجى اختيار ملف PDF صالح فقط!' : 'Please select a valid PDF file only!', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // Create new zip instance to trigger state update
      let zipToUpdate = originalZip;
      if (!zipToUpdate) {
        zipToUpdate = new JSZip();
      }

      zipToUpdate.file(selectedPdf.path, bytes);
      onUpdateZip(zipToUpdate);

      // Update local state list
      const updatedFiles = pdfFiles.map(p => {
        if (p.path === selectedPdf.path) {
          const updated = { ...p, size: bytes.length, data: bytes };
          setSelectedPdf(updated);
          // Update preview URL
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          const blob = new Blob([bytes], { type: 'application/pdf' });
          setPreviewUrl(URL.createObjectURL(blob));
          return updated;
        }
        return p;
      });

      setPdfFiles(updatedFiles);
      showToastMsg(
        isAr 
          ? `تم استبدال ملف PDF بنجاح! الحجم الجديد: ${(bytes.length / 1024).toFixed(1)} KB`
          : `PDF swapped successfully! New size: ${(bytes.length / 1024).toFixed(1)} KB`
      );

      if (onLogBuild) {
        onLogBuild(`تم تعديل واستبدال مستند PDF: ${selectedPdf.path}`, 'success');
      }
    } catch (err: any) {
      showToastMsg(isAr ? `فشل الاستبدال: ${err.message}` : `Swap failed: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddNewPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToastMsg(isAr ? 'يرجى اختيار ملف PDF صالح فقط!' : 'Please select a valid PDF file only!', 'error');
      return;
    }

    const customName = prompt(
      isAr 
        ? 'أدخل مسار واسم الملف الجديد داخل مجلد assets (مثال: docs/manual.pdf):' 
        : 'Enter path and file name inside assets folder (e.g., docs/manual.pdf):',
      `assets/docs/${file.name}`
    );

    if (!customName) return;

    // Ensure it starts with assets/ or res/raw/
    let finalPath = customName;
    if (!finalPath.startsWith('assets/') && !finalPath.startsWith('res/raw/')) {
      finalPath = `assets/${finalPath}`;
    }
    if (!finalPath.toLowerCase().endsWith('.pdf')) {
      finalPath += '.pdf';
    }

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      let zipToUpdate = originalZip;
      if (!zipToUpdate) {
        zipToUpdate = new JSZip();
      }

      zipToUpdate.file(finalPath, bytes);
      onUpdateZip(zipToUpdate);

      const newItem: PdfFileItem = {
        path: finalPath,
        name: finalPath.split('/').pop() || finalPath,
        size: bytes.length,
        data: bytes,
      };

      const newList = [...pdfFiles, newItem];
      setPdfFiles(newList);
      handleSelectPdf(newItem);
      
      showToastMsg(
        isAr 
          ? `تمت إضافة مستند PDF جديد بنجاح في المسار: ${finalPath}`
          : `New PDF document added successfully at: ${finalPath}`
      );

      if (onLogBuild) {
        onLogBuild(`تمت إضافة مستند PDF جديد إلى الأرشيف: ${finalPath}`, 'success');
      }
    } catch (err: any) {
      showToastMsg(isAr ? `فشل إضافة الملف: ${err.message}` : `Failed to add file: ${err.message}`, 'error');
    }
  };

  const handleDeletePdf = (pdf: PdfFileItem) => {
    const confirmed = window.confirm(
      isAr 
        ? `هل أنت متأكد من حذف ملف الـ PDF نهائياً من الـ APK؟\n(${pdf.path})`
        : `Are you sure you want to delete this PDF file from the APK?\n(${pdf.path})`
    );
    if (!confirmed) return;

    if (originalZip) {
      originalZip.remove(pdf.path);
      onUpdateZip(originalZip);
    }

    const filtered = pdfFiles.filter(p => p.path !== pdf.path);
    setPdfFiles(filtered);
    
    if (selectedPdf?.path === pdf.path) {
      setSelectedPdf(null);
      setPreviewUrl(null);
    }

    showToastMsg(isAr ? 'تم حذف ملف الـ PDF بنجاح!' : 'PDF deleted successfully!');
    if (onLogBuild) {
      onLogBuild(`تم حذف مستند PDF من التطبيق: ${pdf.path}`, 'warning');
    }
  };

  const filteredPdfs = pdfFiles.filter(pdf => 
    pdf.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pdf.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-white">
                {isAr ? 'مدير مستندات وملفات الـ PDF' : 'PDF Documents & Viewer Manager'}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                PDF Assets Swapper
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {isAr
                ? 'استعراض مستندات الـ PDF المخزنة في مجلدات الأصول (Assets)، قراءة محتواها مباشرة عبر المعاينة المدمجة، واستبدالها أو تحديثها بملفات مخصصة دون المساس بهيكل التطبيق.'
                : 'Browse PDF documents embedded in app assets, read them directly via our built-in viewer, and swap or update them with custom files without breaking the application.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input 
            ref={addPdfInputRef}
            type="file" 
            accept="application/pdf"
            onChange={handleAddNewPdf}
            className="hidden"
          />
          <button
            onClick={() => addPdfInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-indigo-400 hover:bg-indigo-300 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{isAr ? 'إضافة مستند PDF جديد' : 'Add New PDF Asset'}</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className={`flex items-center gap-2 p-3 text-xs rounded-lg animate-fadeIn shadow-sm border ${
          toast.type === 'success' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: PDF List & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-indigo-400" />
                <span>{isAr ? 'المستندات المكتشفة في الحزمة' : 'Discovered PDF Documents'}</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {filteredPdfs.length} {isAr ? 'ملفات' : 'files'}
              </span>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder={isAr ? 'ابحث عن ملف PDF في المجلدات...' : 'Search PDF files...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* PDF List Scroll Area */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredPdfs.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <FileText className="h-8 w-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-500">
                    {isAr 
                      ? 'لا توجد ملفات PDF متطابقة في أصول الحزمة حالياً.' 
                      : 'No PDF documents found in active assets.'}
                  </p>
                </div>
              ) : (
                filteredPdfs.map((pdf) => {
                  const isSelected = selectedPdf?.path === pdf.path;
                  return (
                    <div
                      key={pdf.path}
                      onClick={() => handleSelectPdf(pdf)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                          : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <FileText className={`h-5 w-5 shrink-0 mt-0.5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate text-slate-100" title={pdf.name}>
                            {pdf.name}
                          </span>
                          <span className="text-[10px] font-mono block truncate text-slate-500" title={pdf.path}>
                            {pdf.path}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {(pdf.size / 1024).toFixed(0)} KB
                        </span>
                        
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownloadPdf(pdf); }}
                          title={isAr ? 'تحميل الملف' : 'Download File'}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Download className="h-3 w-3" />
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeletePdf(pdf); }}
                          title={isAr ? 'حذف من الحزمة' : 'Delete from APK'}
                          className="p-1 rounded bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Actions Panel */}
          {selectedPdf && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-4">
              <div className="border-b border-slate-800 pb-2.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">
                  {isAr ? 'مستند مالي محدد' : 'Active PDF Asset'}
                </span>
                <span className="text-xs font-bold text-white truncate block">{selectedPdf.name}</span>
                <span className="text-[10px] font-mono text-indigo-400 truncate block mt-0.5">{selectedPdf.path}</span>
              </div>

              <div className="space-y-2">
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="application/pdf"
                  onChange={handleSwapPdf}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isUploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                  <span>{isUploading ? (isAr ? 'جاري الاستبدال...' : 'Swapping...') : (isAr ? 'استبدال / رفع ملف PDF جديد' : 'Upload & Swap PDF file')}</span>
                </button>

                <button
                  onClick={() => handleDownloadPdf(selectedPdf)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>{isAr ? 'تحميل المستند الحالي للاطلاع' : 'Download Active PDF document'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: PDF Interactive Viewer & Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Eye className="h-4 w-4 text-indigo-400" />
                <span>{isAr ? 'معاينة المستند التفاعلية المباشرة' : 'Interactive Document Live Preview'}</span>
              </h3>
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <span>{isAr ? 'افتح في تبويب جديد' : 'Open in separate tab'}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Embed / Iframe Viewer */}
            {previewUrl ? (
              <div className="w-full flex-1 min-h-[500px] rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50">
                <iframe
                  src={`${previewUrl}#toolbar=0&navpanes=0`}
                  title="PDF Live Preview"
                  className="w-full h-full border-none min-h-[500px]"
                />
              </div>
            ) : (
              <div className="w-full flex-1 min-h-[500px] flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-slate-800 bg-slate-900/20">
                <FileText className="h-16 w-16 text-slate-700 animate-pulse mb-3" />
                <p className="text-xs font-bold text-slate-400 mb-1">
                  {isAr ? 'المشاهد المدمج جاهز للعرض' : 'Embedded PDF Reader Ready'}
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  {isAr 
                    ? 'اختر أي مستند PDF من القائمة الجانبية لقراءته مباشرة أو استبداله بنقرة واحدة.' 
                    : 'Select any PDF file from the list to display its page and content details instantly.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
