import React, { useRef, useState } from 'react';
import { Upload, FileUp, Sparkles, AlertCircle, CheckCircle, GraduationCap, Gamepad2, Store, Landmark } from 'lucide-react';
import { Language, t } from '../i18n/translations';
import { SAMPLE_APKS, SampleApkProject } from '../data/sampleApks';
import { ApkMetadata } from '../types/apk';

interface ApkUploaderProps {
  lang: Language;
  onLoadSample: (sample: SampleApkProject) => void;
  onUploadFile: (file: File) => void;
  currentMetadata: ApkMetadata | null;
  isLoading: boolean;
  loadingMessage: string;
}

export const ApkUploader: React.FC<ApkUploaderProps> = ({
  lang,
  onLoadSample,
  onUploadFile,
  currentMetadata,
  isLoading,
  loadingMessage,
}) => {
  const strings = t[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setErrorMessage(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.apk')) {
        onUploadFile(file);
      } else {
        setErrorMessage(lang === 'ar' ? 'يرجى اختيار ملف بصيغة .apk فقط' : 'Please select an APK file ending with .apk');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name.toLowerCase().endsWith('.apk')) {
        setErrorMessage(null);
        onUploadFile(file);
      } else {
        setErrorMessage(lang === 'ar' ? 'يرجى اختيار ملف بصيغة .apk فقط' : 'Please select an APK file ending with .apk');
      }
    }
  };

  const getSampleIcon = (icon: string) => {
    switch (icon) {
      case 'GraduationCap':
        return <GraduationCap className="h-5 w-5 text-indigo-400" />;
      case 'Gamepad2':
        return <Gamepad2 className="h-5 w-5 text-amber-400" />;
      case 'Store':
        return <Store className="h-5 w-5 text-emerald-400" />;
      case 'Landmark':
        return <Landmark className="h-5 w-5 text-rose-400" />;
      default:
        return <Sparkles className="h-5 w-5 text-cyan-400" />;
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 mb-6">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer text-center ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-slate-700 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-950/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".apk"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-emerald-400 mb-3 border border-slate-700">
          <Upload className="h-6 w-6" />
        </div>

        <h3 className="text-sm font-semibold text-white mb-1">
          {strings.uploader.dropTitle}
        </h3>
        <p className="text-xs text-slate-400 mb-3 max-w-md">
          {strings.uploader.dropSubtitle}
        </p>

        <button
          type="button"
          className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
        >
          {strings.uploader.browseBtn}
        </button>

        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center rounded-lg">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs text-emerald-400 font-medium animate-pulse">{loadingMessage}</p>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>

  );
};
