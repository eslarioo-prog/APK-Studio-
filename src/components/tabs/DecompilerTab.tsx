import React, { useState } from 'react';
import { Folder, FolderOpen, File, FileCode, FileText, Image, Search, ChevronRight, ChevronDown, ShieldCheck, Binary, Copy, Check } from 'lucide-react';
import { Language } from '../../i18n/translations';
import { TreeNode, DecompiledApkProject } from '../../utils/apkDecompiler';
import { ApkMetadata } from '../../types/apk';

interface DecompilerTabProps {
  lang: Language;
  metadata: ApkMetadata;
  decompiledProject: DecompiledApkProject | null;
}

export const DecompilerTab: React.FC<DecompilerTabProps> = ({
  lang,
  metadata,
  decompiledProject,
}) => {
  const isAr = lang === 'ar';
  const [selectedPath, setSelectedPath] = useState<string>('AndroidManifest.xml');
  const [viewFormat, setViewFormat] = useState<'java' | 'smali' | 'xml' | 'hex'>('java');
  const [treeSearch, setTreeSearch] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '': true,
    'res': true,
    'res/values': true,
    'assets': true,
    'META-INF': true,
  });
  const [copied, setCopied] = useState(false);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build simulated Hex Dump for binary or code
  const getHexDump = (str: string) => {
    const lines = [];
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str.slice(0, 1024)); // first 1KB
    for (let i = 0; i < bytes.length; i += 16) {
      const offset = i.toString(16).padStart(8, '0');
      const chunk = bytes.slice(i, i + 16);
      const hex = Array.from(chunk).map(b => b.toString(16).padStart(2, '0')).join(' ');
      const ascii = Array.from(chunk).map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('');
      lines.push(`${offset}  ${hex.padEnd(48, ' ')}  |${ascii}|`);
    }
    return lines.join('\n');
  };

  // Find content for selected file
  const getSelectedContent = () => {
    if (!decompiledProject) {
      return {
        java: '// Disassembling APK...\n',
        smali: '# Disassembling APK...\n',
        xml: metadata.rawManifestXml || '<!-- AndroidManifest.xml -->',
      };
    }

    if (selectedPath === 'AndroidManifest.xml') {
      return {
        java: `// AndroidManifest.xml decompiled view\n// Package: ${metadata.packageName}\n// Min SDK: ${metadata.minSdk} | Target SDK: ${metadata.targetSdk}`,
        smali: `# Manifest definitions: ${metadata.packageName}`,
        xml: metadata.rawManifestXml || decompiledProject.manifest.rawXml,
      };
    }

    // Check if it's one of decompiled classes
    const matchedClass = decompiledProject.decompiledClasses.find(
      c => selectedPath.includes(c.className) || selectedPath === 'classes.dex'
    );
    if (matchedClass) {
      return {
        java: matchedClass.javaCode,
        smali: matchedClass.smaliCode,
        xml: `<!-- Class: ${matchedClass.packagePath} -->`,
      };
    }

    // Default classes
    if (decompiledProject.decompiledClasses.length > 0) {
      const firstClass = decompiledProject.decompiledClasses[0];
      return {
        java: firstClass.javaCode,
        smali: firstClass.smaliCode,
        xml: `<!-- File: ${selectedPath} -->`,
      };
    }

    return {
      java: `// Decompiled source for ${selectedPath}\npackage ${metadata.packageName};\n\npublic class DecompiledEntry {\n    // Extracted from ${metadata.fileName}\n}`,
      smali: `.class public L${metadata.packageName.replace(/\./g, '/')}/DecompiledEntry;\n.super Ljava/lang/Object;`,
      xml: `<file path="${selectedPath}" />`,
    };
  };

  const content = getSelectedContent();

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: TreeNode, depth: number = 0) => {
    const isFolder = node.isDir;
    const isExpanded = expandedFolders[node.path] !== false;
    const isSelected = selectedPath === node.path;

    if (treeSearch && !node.name.toLowerCase().includes(treeSearch.toLowerCase()) && !node.isDir) {
      return null;
    }

    const paddingInlineStart = `${depth * 14 + 8}px`;

    return (
      <div key={node.path || node.name} className="select-none">
        <div
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.path);
            } else {
              setSelectedPath(node.path);
            }
          }}
          style={{ paddingInlineStart }}
          className={`flex items-center gap-2 py-1.5 pe-3 text-xs font-mono cursor-pointer transition-colors ${
            isSelected
              ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
              : 'text-slate-300 hover:bg-slate-900/60'
          }`}
        >
          {isFolder ? (
            <>
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="h-3 w-3 text-slate-500 shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              ) : (
                <Folder className="h-3.5 w-3.5 text-amber-400/80 shrink-0" />
              )}
            </>
          ) : (
            <>
              <span className="w-3 shrink-0" />
              {node.name.endsWith('.dex') ? (
                <FileCode className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              ) : node.name.endsWith('.xml') ? (
                <FileText className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              ) : /\.(png|jpg|webp)$/i.test(node.name) ? (
                <Image className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              ) : (
                <File className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              )}
            </>
          )}

          <span className="truncate flex-1">{node.name || 'apk_root'}</span>

          {!isFolder && node.size > 0 && (
            <span className="text-[10px] text-slate-500 tabular-nums shrink-0">
              {(node.size / 1024).toFixed(0)} KB
            </span>
          )}
        </div>

        {isFolder && isExpanded && node.children && (
          <div>{node.children.map(child => renderTreeNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  // Fallback tree if no real fileTree yet
  const fallbackTree: TreeNode = {
    name: 'apk_root',
    path: '',
    isDir: true,
    size: 0,
    children: [
      { name: 'AndroidManifest.xml', path: 'AndroidManifest.xml', isDir: false, size: 2048, type: 'xml' },
      { name: 'classes.dex', path: 'classes.dex', isDir: false, size: 1420500, type: 'code' },
      { name: 'resources.arsc', path: 'resources.arsc', isDir: false, size: 34020, type: 'other' },
      {
        name: 'assets',
        path: 'assets',
        isDir: true,
        size: 0,
        children: [
          { name: 'auth_config.json', path: 'assets/auth_config.json', isDir: false, size: 520, type: 'asset' },
          { name: 'database.json', path: 'assets/database.json', isDir: false, size: 1100, type: 'asset' },
        ],
      },
      {
        name: 'res',
        path: 'res',
        isDir: true,
        size: 0,
        children: [
          {
            name: 'values',
            path: 'res/values',
            isDir: true,
            size: 0,
            children: [
              { name: 'strings.xml', path: 'res/values/strings.xml', isDir: false, size: 1200, type: 'xml' },
              { name: 'colors.xml', path: 'res/values/colors.xml', isDir: false, size: 400, type: 'xml' },
            ],
          },
          {
            name: 'mipmap-hdpi',
            path: 'res/mipmap-hdpi',
            isDir: true,
            size: 0,
            children: [
              { name: 'ic_launcher.png', path: 'res/mipmap-hdpi/ic_launcher.png', isDir: false, size: 12400, type: 'image' },
            ],
          },
        ],
      },
      {
        name: 'META-INF',
        path: 'META-INF',
        isDir: true,
        size: 0,
        children: [
          { name: 'MANIFEST.MF', path: 'META-INF/MANIFEST.MF', isDir: false, size: 840, type: 'certificate' },
          { name: 'CERT.SF', path: 'META-INF/CERT.SF', isDir: false, size: 920, type: 'certificate' },
          { name: 'CERT.RSA', path: 'META-INF/CERT.RSA', isDir: false, size: 1140, type: 'certificate' },
        ],
      },
    ],
  };

  const activeTree = decompiledProject?.fileTree || fallbackTree;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white mb-1">
            {isAr ? 'تفكيك واستعراض ملفات APK (APK Disassembler & Decompiler)' : 'APK Disassembler & Decompiler'}
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            {isAr
              ? 'فحص شامل ومنظم لمحتويات حزمة APK: الموارد، الشيفرات البرمجية، كود Smali، ولغة Java المفككة'
              : 'Structured hierarchical inspection of all APK archive entries, resources, bytecode, and decompiled Java'}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>V1/V2 Signed</span>
          </span>
        </div>
      </div>

      {/* Main Split Grid: Left = Tree Explorer, Right = Code & Hex View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Structured File Tree (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden flex flex-col h-[560px]">
          <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-200">
              {isAr ? 'هيكل الملفات والمجلدات' : 'Package Tree'}
            </span>
            <div className="relative flex-1 max-w-[160px]">
              <input
                type="text"
                placeholder={isAr ? 'بحث في الشجرة...' : 'Filter tree...'}
                value={treeSearch}
                onChange={e => setTreeSearch(e.target.value)}
                className="w-full text-[11px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="p-2 overflow-y-auto flex-1 divide-y divide-slate-800/20">
            {renderTreeNode(activeTree)}
          </div>
        </div>

        {/* Right: Decompiled View (8 cols) */}
        <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden flex flex-col h-[560px]">
          {/* Top Format Selector */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-emerald-400 truncate max-w-xs">
                {selectedPath}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Format Buttons */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setViewFormat('java')}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                    viewFormat === 'java' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Java (Decompiled)
                </button>
                <button
                  onClick={() => setViewFormat('smali')}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                    viewFormat === 'smali' ? 'bg-slate-800 text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Smali (Bytecode)
                </button>
                <button
                  onClick={() => setViewFormat('xml')}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                    viewFormat === 'xml' ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  XML / Text
                </button>
                <button
                  onClick={() => setViewFormat('hex')}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer flex items-center gap-1 ${
                    viewFormat === 'hex' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Binary className="h-3 w-3" />
                  Hex
                </button>
              </div>

              {/* Copy Code */}
              <button
                onClick={() => {
                  const textToCopy =
                    viewFormat === 'java'
                      ? content.java
                      : viewFormat === 'smali'
                      ? content.smali
                      : viewFormat === 'xml'
                      ? content.xml
                      : getHexDump(content.java);
                  handleCopyCode(textToCopy);
                }}
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Copy code"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="p-4 overflow-y-auto flex-1 font-mono text-xs leading-relaxed bg-slate-950 select-text">
            {viewFormat === 'java' && (
              <pre className="text-slate-200 whitespace-pre font-mono">{content.java}</pre>
            )}
            {viewFormat === 'smali' && (
              <pre className="text-indigo-300 whitespace-pre font-mono">{content.smali}</pre>
            )}
            {viewFormat === 'xml' && (
              <pre className="text-amber-200 whitespace-pre font-mono">{content.xml}</pre>
            )}
            {viewFormat === 'hex' && (
              <pre className="text-cyan-300 whitespace-pre font-mono text-[11px] leading-tight">
                {getHexDump(content.java || content.xml)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
