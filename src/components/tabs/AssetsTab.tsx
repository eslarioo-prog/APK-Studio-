import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Sparkles,
  CheckCircle2,
  Smartphone,
  Layers,
  Palette,
  Sliders,
  Plus,
  Trash2,
  FileCode2,
  Download,
  Copy,
  Check,
  Eye,
  Settings,
  HelpCircle,
  FolderArchive,
  RefreshCw,
  Sun,
  Moon,
  Zap,
  Grid,
  Maximize2,
  Shield,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  X,
} from 'lucide-react';
import { Language, t } from '../../i18n/translations';
import { ApkMetadata } from '../../types/apk';
import { ResourceOverlayItem, ResourceOverlayType, RROThemePreset } from '../../types/rro';
import { DEFAULT_RRO_ITEMS, DEFAULT_RRO_THEME_PRESETS } from '../../data/defaultRROs';
import {
  AdaptiveIconConfig,
  GeneratedAdaptiveIconSet,
  IconShapeMask,
  MipmapLevelInfo,
} from '../../types/adaptiveIcon';
import {
  downloadMipmapSetZip,
  generateFullMipmapSet,
  renderAdaptiveIconToCanvas,
} from '../../utils/adaptiveIconGenerator';
import JSZip from 'jszip';
import { Download as DownloadIcon, Image as ImageIcon2, FileImage, Search, RefreshCw as RefreshCwIcon, FolderDown, LayoutGrid, List } from 'lucide-react';

interface AssetsTabProps {
  lang: Language;
  metadata?: ApkMetadata;
  onReplaceIcon: (file: File) => void;
  customIconPreview: string | null;
  onSaveRROToProject?: (rroItems: ResourceOverlayItem[]) => void;
  onApplyAdaptiveIconSet?: (iconSet: GeneratedAdaptiveIconSet) => void;
  originalZip?: JSZip | null;
  onUpdateZip?: (zip: JSZip) => void;
}

// Built-in high-res SVG presets for instant test & demo
const ICON_PRESETS = [
  {
    id: 'cyber_shield',
    name: 'Cyber Shield',
    nameAr: 'درع الحماية السيبراني',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><path d="M50 10 L85 24 V52 C85 72 50 90 50 90 C50 90 15 72 15 52 V24 L50 10 Z" fill="%2310b981"/><path d="M50 20 L75 30 V50 C75 65 50 78 50 78 C50 78 25 65 25 50 V30 L50 20 Z" fill="%23064e3b"/><path d="M42 50 L48 56 L62 42" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: 'crypto_rocket',
    name: 'Fast Rocket',
    nameAr: 'الصاروخ فائق السرعة',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><path d="M50 10 C62 25 74 46 72 65 L50 58 L28 65 C26 46 38 25 50 10 Z" fill="%2306b6d4"/><circle cx="50" cy="38" r="9" fill="%230f172a"/><path d="M50 64 L56 78 L50 88 L44 78 Z" fill="%23f59e0b"/><path d="M28 65 L18 78 L34 72 Z" fill="%230284c7"/><path d="M72 65 L82 78 L66 72 Z" fill="%230284c7"/></svg>`,
  },
  {
    id: 'game_crest',
    name: 'Game Controller',
    nameAr: 'وحدة التحكم بالألعاب',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="none"/><path d="M22 36 C18 48 18 64 26 72 C32 78 40 70 42 62 L58 62 C60 70 68 78 74 72 C82 64 82 48 78 36 C75 28 66 26 50 26 C34 26 25 28 22 36 Z" fill="%236366f1"/><circle cx="34" cy="46" r="4" fill="white"/><circle cx="34" cy="54" r="4" fill="white"/><circle cx="30" cy="50" r="4" fill="white"/><circle cx="38" cy="50" r="4" fill="white"/><circle cx="68" cy="46" r="4" fill="%23f43f5e"/><circle cx="64" cy="52" r="4" fill="%2310b981"/></svg>`,
  },
  {
    id: 'cloud_sync',
    name: 'Cloud Database',
    nameAr: 'قاعدة بيانات سحابية',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><path d="M25 65 C18 65 14 59 15 52 C16 46 22 43 27 44 C29 34 38 27 48 28 C57 29 65 37 65 46 C71 46 76 50 76 56 C76 62 71 65 65 65 Z" fill="%2338bdf8"/><rect x="36" y="52" width="28" height="24" rx="4" fill="%231e293b"/><line x1="42" y1="58" x2="58" y2="58" stroke="%2338bdf8" stroke-width="2"/><line x1="42" y1="64" x2="54" y2="64" stroke="%2338bdf8" stroke-width="2"/><circle cx="48" cy="71" r="1.5" fill="%2310b981"/></svg>`,
  },
  {
    id: 'terminal_code',
    name: 'Code Terminal',
    nameAr: 'سطر أوامر ومطورين',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect x="14" y="22" width="72" height="56" rx="8" fill="%23090d16" stroke="%2310b981" stroke-width="4"/><path d="M24 38 L34 48 L24 58" stroke="%2310b981" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><line x1="42" y1="58" x2="58" y2="58" stroke="%2310b981" stroke-width="5" stroke-linecap="round"/></svg>`,
  },
];

const COLOR_PRESETS = [
  { name: 'Obsidian Black', hex: '#090d16' },
  { name: 'Deep Emerald', hex: '#064e3b' },
  { name: 'Midnight Navy', hex: '#0f172a' },
  { name: 'Pure AMOLED', hex: '#000000' },
  { name: 'Cyber Violet', hex: '#3b0764' },
  { name: 'Crimson Flame', hex: '#450a0a' },
  { name: 'Electric Cyan', hex: '#083344' },
  { name: 'Clean White', hex: '#ffffff' },
];

export const AssetsTab: React.FC<AssetsTabProps> = ({
  lang,
  metadata,
  onReplaceIcon,
  customIconPreview,
  onSaveRROToProject,
  onApplyAdaptiveIconSet,
  originalZip,
  onUpdateZip,
}) => {
  const strings = t[lang];
  const isAr = lang === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const highResInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tab switch between Adaptive Generator & RRO Theming & Image Extractor & Resource Gallery
  const [activeMainSection, setActiveMainSection] = useState<'adaptiveIcon' | 'rroTheming' | 'imageExtractor' | 'resourceGallery'>('adaptiveIcon');

  // --- RESOURCE GALLERY STATE ---
  interface ResourceGalleryItem {
    path: string;
    name: string;
    type: 'drawable' | 'mipmap';
    dpi: string; // e.g. hdpi, xhdpi, xxhdpi, anydpi, default
    fileType: string; // e.g. png, webp, xml, svg
    size: number;
    dataUrl?: string; // For images, the base64/object URL
    xmlContent?: string; // For XML, the code
    blob: Blob;
  }

  const [galleryItems, setGalleryItems] = useState<ResourceGalleryItem[]>([]);
  const [isExtractingGallery, setIsExtractingGallery] = useState(false);
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryDpiFilter, setGalleryDpiFilter] = useState('all');
  const [galleryTypeFilter, setGalleryTypeFilter] = useState('all');
  const [viewingXmlItem, setViewingXmlItem] = useState<ResourceGalleryItem | null>(null);
  const [copiedGalleryXml, setCopiedGalleryXml] = useState(false);

  // Scan & Extract resources inside the APK for Gallery
  useEffect(() => {
    if (activeMainSection !== 'resourceGallery') return;

    const extractGallery = async () => {
      setIsExtractingGallery(true);

      if (!originalZip) {
        // If no original zip, load simulated mock assets
        const mockAssets: ResourceGalleryItem[] = [
          {
            path: 'res/mipmap-xxhdpi/ic_launcher.png',
            name: 'ic_launcher.png',
            type: 'mipmap',
            dpi: 'xxhdpi',
            fileType: 'png',
            size: 45000,
            dataUrl: defaultSource,
            blob: new Blob(),
          },
          {
            path: 'res/drawable-xxhdpi/ic_banner.png',
            name: 'ic_banner.png',
            type: 'drawable',
            dpi: 'xxhdpi',
            fileType: 'png',
            size: 152000,
            dataUrl: ICON_PRESETS[1].svg,
            blob: new Blob(),
          },
          {
            path: 'res/drawable-xhdpi/ic_avatar.png',
            name: 'ic_avatar.png',
            type: 'drawable',
            dpi: 'xhdpi',
            fileType: 'png',
            size: 24000,
            dataUrl: ICON_PRESETS[2].svg,
            blob: new Blob(),
          },
          {
            path: 'res/drawable-anydpi/ic_shield_vector.xml',
            name: 'ic_shield_vector.xml',
            type: 'drawable',
            dpi: 'anydpi',
            fileType: 'xml',
            size: 1200,
            xmlContent: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FF10B981"
        android:pathData="M12,2L4,5v6.09c0,5.05 3.41,9.76 8,10.91 4.59,-1.15 8,-5.86 8,-10.91V5L12,2z" />
</vector>`,
            blob: new Blob(),
          },
          {
            path: 'res/drawable/bg_selector.xml',
            name: 'bg_selector.xml',
            type: 'drawable',
            dpi: 'default',
            fileType: 'xml',
            size: 850,
            xmlContent: `<?xml version="1.0" encoding="utf-8"?>
<selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:state_pressed="true">
        <shape android:shape="rectangle">
            <solid android:color="#FF064E3B" />
            <corners android:radius="8dp" />
        </shape>
    </item>
    <item>
        <shape android:shape="rectangle">
            <solid android:color="#FF0F172A" />
            <corners android:radius="8dp" />
            <stroke android:width="1dp" android:color="#FF1E293B" />
        </shape>
    </item>
</selector>`,
            blob: new Blob(),
          },
          {
            path: 'res/mipmap-mdpi/ic_launcher_round.png',
            name: 'ic_launcher_round.png',
            type: 'mipmap',
            dpi: 'mdpi',
            fileType: 'png',
            size: 18000,
            dataUrl: ICON_PRESETS[3].svg,
            blob: new Blob(),
          },
        ];
        setGalleryItems(mockAssets);
        setIsExtractingGallery(false);
        return;
      }

      // If original zip is loaded, traverse originalZip files
      const itemsList: ResourceGalleryItem[] = [];
      const resFiles = Object.keys(originalZip.files).filter(path => {
        const lower = path.toLowerCase();
        const isInRes = lower.startsWith('res/');
        const isDir = originalZip.files[path].dir;
        const isTargetType = lower.includes('/drawable') || lower.includes('/mipmap');
        return isInRes && !isDir && isTargetType;
      });

      for (const path of resFiles) {
        try {
          const fileObj = originalZip.file(path);
          if (!fileObj) continue;

          const parts = path.split('/');
          const folder = parts[1] || ''; // e.g. drawable-xxhdpi or mipmap
          const name = parts.pop() || '';
          const fileType = name.split('.').pop() || '';

          let type: 'drawable' | 'mipmap' = 'drawable';
          if (folder.startsWith('mipmap')) {
            type = 'mipmap';
          }

          // Determine DPI
          let dpi = 'default';
          if (folder.includes('-')) {
            dpi = folder.split('-').pop() || 'default';
          }

          // Read data
          let dataUrl: string | undefined = undefined;
          let xmlContent: string | undefined = undefined;
          let blobObj: Blob;

          if (fileType === 'xml') {
            const text = await fileObj.async('string');
            xmlContent = text;
            blobObj = new Blob([text], { type: 'text/xml' });
          } else {
            const data = await fileObj.async('uint8array');
            let mime = 'image/png';
            if (path.toLowerCase().endsWith('.jpg') || path.toLowerCase().endsWith('.jpeg')) mime = 'image/jpeg';
            else if (path.toLowerCase().endsWith('.webp')) mime = 'image/webp';
            else if (path.toLowerCase().endsWith('.gif')) mime = 'image/gif';
            else if (path.toLowerCase().endsWith('.svg')) mime = 'image/svg+xml';

            blobObj = new Blob([data as any], { type: mime });
            dataUrl = URL.createObjectURL(blobObj);
          }

          itemsList.push({
            path,
            name,
            type,
            dpi,
            fileType,
            size: (fileObj as any)._data?.uncompressedSize || 1024,
            dataUrl,
            xmlContent,
            blob: blobObj,
          });
        } catch (err) {
          console.error(`Failed to parse gallery asset: ${path}`, err);
        }
      }

      setGalleryItems(itemsList);
      setIsExtractingGallery(false);
    };

    extractGallery();
  }, [originalZip, activeMainSection]);

  const handleDownloadGalleryAsset = (item: ResourceGalleryItem) => {
    const url = item.dataUrl || URL.createObjectURL(item.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (!item.dataUrl) URL.revokeObjectURL(url);
  };

  // --- ADAPTIVE ICON GENERATOR STATE ---
  const defaultSource = customIconPreview || ICON_PRESETS[0].svg;
  const [highResSource, setHighResSource] = useState<string>(defaultSource);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSet, setGeneratedSet] = useState<GeneratedAdaptiveIconSet | null>(null);

  const [iconConfig, setIconConfig] = useState<AdaptiveIconConfig>({
    foregroundScale: 0.75,
    offsetX: 0,
    offsetY: 0,
    backgroundType: 'color',
    backgroundColor: '#0f172a',
    gradientColor2: '#064e3b',
    gradientAngle: 135,
    shapeMask: 'squircle',
    showSafeZoneGuides: true,
    enableMonochrome: false,
    iconPadding: 10,
  });

  const [activeMask, setActiveMask] = useState<IconShapeMask>('squircle');
  const [showXmlModal, setShowXmlModal] = useState(false);
  const [copiedXml, setCopiedXml] = useState(false);

  // --- IMAGE EXTRACTOR STATE ---
  interface ExtractedImage {
    path: string;
    name: string;
    size: number;
    dataUrl: string;
    blob: Blob;
  }

  const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);
  const [isExtractingImages, setIsExtractingImages] = useState(false);
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  const [imageTypeFilter, setImageTypeFilter] = useState<'all' | 'image' | 'icon'>('all');
  const [selectedImageForSwap, setSelectedImageForSwap] = useState<ExtractedImage | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string; path: string; size?: number } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [gridSize, setGridSize] = useState<'sm' | 'md' | 'lg'>('md');
  const swapImageInputRef = useRef<HTMLInputElement>(null);

  // Scan & Extract images inside the APK
  useEffect(() => {
    if (activeMainSection !== 'imageExtractor') return;

    const extractImages = async () => {
      setIsExtractingImages(true);
      
      if (!originalZip) {
        // If no original zip is loaded, create simulated mock images for the active project
        const mockImgs: ExtractedImage[] = [
          {
            path: 'res/mipmap-xxhdpi/ic_launcher.png',
            name: 'ic_launcher.png',
            size: 45000,
            dataUrl: defaultSource,
            blob: new Blob(),
          },
          {
            path: 'res/drawable-xxhdpi/ic_banner.png',
            name: 'ic_banner.png',
            size: 152000,
            dataUrl: ICON_PRESETS[1].svg,
            blob: new Blob(),
          },
          {
            path: 'res/drawable-xxhdpi/ic_avatar.png',
            name: 'ic_avatar.png',
            size: 24000,
            dataUrl: ICON_PRESETS[2].svg,
            blob: new Blob(),
          }
        ];
        setExtractedImages(mockImgs);
        setIsExtractingImages(false);
        return;
      }

      const imgPaths = Object.keys(originalZip.files).filter(path => {
        const lower = path.toLowerCase();
        return (
          lower.endsWith('.png') ||
          lower.endsWith('.jpg') ||
          lower.endsWith('.jpeg') ||
          lower.endsWith('.webp') ||
          lower.endsWith('.gif') ||
          lower.endsWith('.svg')
        ) && !lower.startsWith('meta-inf/') && !originalZip.files[path].dir;
      });

      const list: ExtractedImage[] = [];
      for (const path of imgPaths) {
        const fileObj = originalZip.file(path);
        if (fileObj) {
          const data = await fileObj.async('uint8array');
          let mime = 'image/png';
          if (path.toLowerCase().endsWith('.jpg') || path.toLowerCase().endsWith('.jpeg')) mime = 'image/jpeg';
          else if (path.toLowerCase().endsWith('.webp')) mime = 'image/webp';
          else if (path.toLowerCase().endsWith('.gif')) mime = 'image/gif';
          else if (path.toLowerCase().endsWith('.svg')) mime = 'image/svg+xml';

          const blob = new Blob([data as any], { type: mime });
          const dataUrl = URL.createObjectURL(blob);

          list.push({
            path,
            name: path.split('/').pop() || path,
            size: data.length,
            dataUrl,
            blob,
          });
        }
      }

      setExtractedImages(list);
      setIsExtractingImages(false);
    };

    extractImages();
  }, [originalZip, activeMainSection]);

  // Clean up Object URLs
  useEffect(() => {
    return () => {
      extractedImages.forEach(img => {
        if (img.dataUrl && img.dataUrl.startsWith('blob:')) {
          URL.revokeObjectURL(img.dataUrl);
        }
      });
    };
  }, [extractedImages]);

  const handleDownloadAllImagesZip = async () => {
    if (extractedImages.length === 0) return;
    
    showToast(isAr ? 'جاري تجميع وحزم كافة الصور...' : 'Assembling and packaging all images...');
    
    try {
      const zip = new JSZip();
      for (const img of extractedImages) {
        // Read data using array buffer from blob
        if (img.blob.size > 0) {
          const buf = await img.blob.arrayBuffer();
          zip.file(img.path, buf);
        } else {
          // If it's a mock SVG preset with dataUrl
          const response = await fetch(img.dataUrl);
          const text = await response.text();
          zip.file(img.path, text);
        }
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${metadata?.appName || 'App'}_Extracted_Images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast(isAr ? 'تم تحميل حزمة الصور بنجاح! ✓' : 'Images ZIP package downloaded successfully! ✓');
    } catch (err: any) {
      console.error(err);
      showToast(isAr ? 'فشل حزم الصور.' : 'Failed to package images.');
    }
  };

  const handleSwapImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedImageForSwap) return;
    const file = e.target.files[0];
    
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      
      let zipToUpdate = originalZip;
      if (!zipToUpdate) {
        zipToUpdate = new JSZip();
      }
      
      zipToUpdate.file(selectedImageForSwap.path, bytes);
      if (onUpdateZip) {
        onUpdateZip(zipToUpdate);
      }
      
      // Update local state list
      const updatedList = extractedImages.map(img => {
        if (img.path === selectedImageForSwap.path) {
          if (img.dataUrl.startsWith('blob:')) URL.revokeObjectURL(img.dataUrl);
          
          const blob = new Blob([bytes], { type: file.type || 'image/png' });
          const dataUrl = URL.createObjectURL(blob);
          return {
            ...img,
            size: bytes.length,
            dataUrl,
            blob,
          };
        }
        return img;
      });
      
      setExtractedImages(updatedList);
      setSelectedImageForSwap(null);
      showToast(isAr ? 'تم استبدال الصورة بنجاح!' : 'Image replaced successfully!');
    } catch (err: any) {
      console.error(err);
      showToast(isAr ? 'فشل استبدال الصورة.' : 'Failed to swap image.');
    }
  };

  const handleDownloadSingleImage = (img: ExtractedImage) => {
    const link = document.createElement('a');
    link.href = img.dataUrl;
    link.download = img.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const [rroItems, setRroItems] = useState<ResourceOverlayItem[]>(() => {
    try {
      const saved = localStorage.getItem(`apk_studio_rro_${metadata?.packageName || 'default'}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_RRO_ITEMS.map(item => ({
      ...item,
      targetPackage: metadata?.packageName || item.targetPackage,
    }));
  });

  const [activePresetId, setActivePresetId] = useState<string | null>('preset_amoled_dark');
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeXmlTab, setActiveXmlTab] = useState<'manifest' | 'colors' | 'dimens'>('manifest');

  // Add Item Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemType, setNewItemType] = useState<ResourceOverlayType>('color');
  const [newItemName, setNewItemName] = useState('');
  const [newItemOriginal, setNewItemOriginal] = useState('');
  const [newItemOverlay, setNewItemOverlay] = useState('#10b981');
  const [newItemDesc, setNewItemDesc] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Run generator when source or config changes
  useEffect(() => {
    let isCancelled = false;

    const runGeneration = async () => {
      try {
        setIsGenerating(true);
        const set = await generateFullMipmapSet(highResSource, iconConfig);
        if (!isCancelled) {
          setGeneratedSet(set);
          // Also render live preview canvas with active mask
          if (previewCanvasRef.current) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              if (previewCanvasRef.current) {
                renderAdaptiveIconToCanvas(
                  previewCanvasRef.current,
                  img,
                  { ...iconConfig, shapeMask: activeMask },
                  256,
                  true
                );
              }
            };
            img.src = highResSource;
          }
        }
      } catch (err) {
        console.error('Failed to generate adaptive icons:', err);
      } finally {
        if (!isCancelled) setIsGenerating(false);
      }
    };

    const timer = setTimeout(runGeneration, 100);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [highResSource, iconConfig, activeMask]);

  // Handle single high-res file upload
  const handleHighResUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setHighResSource(url);
      onReplaceIcon(file);
      showToast(
        isAr
          ? 'تم رفع الصورة عالية الدقة وبدء توليد كافة كثافات Mipmap الستة!'
          : 'High-res image loaded! Generating all 6 mipmap densities...'
      );
    }
  };

  // Apply generated mipmaps directly to the current APK
  const handleApplyAllMipmapsToApk = () => {
    if (!generatedSet) return;

    if (onApplyAdaptiveIconSet) {
      onApplyAdaptiveIconSet(generatedSet);
    }

    if (generatedSet.highResBlob) {
      const file = new File([generatedSet.highResBlob], 'ic_launcher.png', { type: 'image/png' });
      onReplaceIcon(file);
    }

    showToast(
      isAr
        ? 'تم بنجاح حقن حزمة الأيقونة التكيفية وكافة كثافات Mipmap (mdpi إلى xxxhdpi) داخل الـ APK!'
        : 'Successfully applied adaptive icon set and all mipmap densities to active APK!'
    );
  };

  // Download full ZIP archive
  const handleDownloadZip = async () => {
    if (!generatedSet) return;
    try {
      await downloadMipmapSetZip(generatedSet, metadata?.appName || 'app');
      showToast(isAr ? 'تم تحميل حزمة الـ ZIP التكيفية بنجاح!' : 'Mipmap ZIP package downloaded!');
    } catch (err) {
      console.error(err);
      showToast(isAr ? 'فشل تحميل الأرشيف' : 'Failed to download zip');
    }
  };

  // Download individual density PNG
  const handleDownloadSingleDensity = (level: MipmapLevelInfo) => {
    const a = document.createElement('a');
    a.href = level.dataUrl;
    a.download = `ic_launcher_${level.density}_${level.size}x${level.size}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- RRO Handlers ---
  const handleToggleItem = (id: string) => {
    setRroItems(prev => {
      const next = prev.map(item => (item.id === id ? { ...item, isEnabled: !item.isEnabled } : item));
      try {
        localStorage.setItem(`apk_studio_rro_${metadata?.packageName || 'default'}`, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleUpdateItemOverlay = (id: string, newOverlayValue: string) => {
    setRroItems(prev => {
      const next = prev.map(item => (item.id === id ? { ...item, overlayValue: newOverlayValue } : item));
      try {
        localStorage.setItem(`apk_studio_rro_${metadata?.packageName || 'default'}`, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleDeleteItem = (id: string) => {
    setRroItems(prev => {
      const next = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem(`apk_studio_rro_${metadata?.packageName || 'default'}`, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    showToast(isAr ? 'تم حذف مورد التراكب' : 'Overlay rule deleted');
  };

  const handleApplyPreset = (preset: RROThemePreset) => {
    setActivePresetId(preset.id);
    setRroItems(prev => {
      const next = prev.map(item => {
        const matchingPresetItem = preset.items.find(pi => pi.name === item.name);
        if (matchingPresetItem) {
          return {
            ...item,
            isEnabled: true,
            overlayValue: matchingPresetItem.overlayValue,
          };
        }
        return item;
      });
      try {
        localStorage.setItem(`apk_studio_rro_${metadata?.packageName || 'default'}`, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    showToast(isAr ? `تم تطبيق قالب: ${preset.nameAr}` : `Applied theme: ${preset.nameEn}`);
  };

  const handleAddOverlayItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ResourceOverlayItem = {
      id: `rro-custom-${Date.now()}`,
      type: newItemType,
      name: newItemName.trim(),
      originalValue: newItemOriginal.trim() || (newItemType === 'color' ? '#ffffff' : '8dp'),
      overlayValue: newItemOverlay.trim() || (newItemType === 'color' ? '#10b981' : '16dp'),
      descriptionAr: newItemDesc.trim() || 'قاعدة تراكب مخصصة',
      descriptionEn: newItemDesc.trim() || 'Custom overlay rule',
      targetPackage: metadata?.packageName || 'com.example.app',
      isEnabled: true,
    };

    setRroItems(prev => {
      const next = [...prev, newItem];
      try {
        localStorage.setItem(`apk_studio_rro_${metadata?.packageName || 'default'}`, JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    setIsAddModalOpen(false);
    setNewItemName('');
    setNewItemOriginal('');
    setNewItemDesc('');
    showToast(isAr ? 'تمت إضافة مورد التراكب بنجاح!' : 'Resource overlay added successfully!');
  };

  // Helper values for preview
  const primaryColor = rroItems.find(i => i.name === 'primary_brand_color')?.overlayValue || '#10b981';
  const bgColor = rroItems.find(i => i.name === 'window_background')?.overlayValue || '#090d16';
  const surfaceColor = rroItems.find(i => i.name === 'surface_card_background')?.overlayValue || '#1e293b';
  const textColor = rroItems.find(i => i.name === 'text_primary_color')?.overlayValue || '#f8fafc';
  const cornerRadius = rroItems.find(i => i.name === 'card_corner_radius')?.overlayValue || '12dp';

  const targetPkg = metadata?.packageName || 'com.example.app';
  const overlayPkg = `${targetPkg}.rro.overlay`;

  const generatedManifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${overlayPkg}">

    <overlay
        android:targetPackage="${targetPkg}"
        android:priority="1"
        android:isStatic="true"
        android:category="android.theme.custom" />

    <application android:hasCode="false" android:label="RRO Theme Overlay" />
</manifest>`;

  const generatedColorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
${rroItems
  .filter(i => i.type === 'color' && i.isEnabled)
  .map(i => `    <color name="${i.name}">${i.overlayValue}</color> <!-- Overrides: ${i.originalValue} -->`)
  .join('\n')}
</resources>`;

  const generatedDimensXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
${rroItems
  .filter(i => i.type === 'dimen' && i.isEnabled)
  .map(i => `    <dimen name="${i.name}">${i.overlayValue}</dimen> <!-- Overrides: ${i.originalValue} -->`)
  .join('\n')}
${rroItems
  .filter(i => i.type === 'bool' && i.isEnabled)
  .map(i => `    <bool name="${i.name}">${i.overlayValue}</bool> <!-- Overrides: ${i.originalValue} -->`)
  .join('\n')}
</resources>`;

  const activeXmlContent =
    activeXmlTab === 'manifest'
      ? generatedManifestXml
      : activeXmlTab === 'colors'
      ? generatedColorsXml
      : generatedDimensXml;

  const handleCopyXml = () => {
    navigator.clipboard.writeText(activeXmlContent);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExportRroZip = () => {
    const bundleData = {
      targetPackage: targetPkg,
      overlayPackage: overlayPkg,
      manifest: generatedManifestXml,
      colorsXml: generatedColorsXml,
      dimensXml: generatedDimensXml,
      items: rroItems,
    };
    const blob = new Blob([JSON.stringify(bundleData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${targetPkg}_rro_overlay_bundle.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(isAr ? 'تم تصدير حزمة تراكب الموارد (RRO Bundle) بنجاح!' : 'RRO bundle exported successfully!');
  };

  const filteredItems = rroItems.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-white">
                {strings.assetsTab.title}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Adaptive Icon & RRO Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {isAr
                ? 'توليد تلقائي لكامل حزم الأيقونة التكيفية (Adaptive Icons) لجميع كثافات Mipmap الستة مع منطقة الأمان الرسمية، بالإضافة لمحرك تراكب الموارد (RROs) لتعديل المظهر بدون فك الكود.'
                : 'Automatic Adaptive Icon & Mipmap Generator creating the full 6-density icon set with Android Safe-Zone guides, plus Runtime Resource Overlays (RRO) for DEX-less theming.'}
            </p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setActiveMainSection('adaptiveIcon')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeMainSection === 'adaptiveIcon'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isAr ? '🎨 مولد الأيقونة التكيفية وكثافات Mipmap' : '🎨 Adaptive Icon Generator'}</span>
          </button>
          <button
            onClick={() => setActiveMainSection('rroTheming')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeMainSection === 'rroTheming'
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            <span>{isAr ? '⚙️ ثيمات وتراكب الموارد (RROs)' : '⚙️ RRO Theming Engine'}</span>
          </button>
          <button
            onClick={() => setActiveMainSection('imageExtractor')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeMainSection === 'imageExtractor'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ImageIcon2 className="h-3.5 w-3.5" />
            <span>{isAr ? '🖼️ مستخرج الصور' : '🖼️ Image Extractor'}</span>
          </button>
          <button
            onClick={() => setActiveMainSection('resourceGallery')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeMainSection === 'resourceGallery'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            <span>{isAr ? '📦 معرض الموارد' : '📦 Resource Gallery'}</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2 p-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-fadeIn shadow-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: AUTOMATIC ADAPTIVE ICON GENERATOR                              */}
      {/* ========================================================================= */}
      {activeMainSection === 'adaptiveIcon' && (
        <div className="space-y-6">
          {/* Main Generator Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Upload, Presets & Layer Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1.1 High-Resolution Image Source */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <Upload className="h-4 w-4 text-emerald-400" />
                    <span>{isAr ? '1. مصدر الصورة عالية الدقة (High-Resolution Source)' : '1. High-Resolution Image Source'}</span>
                  </h3>
                  <span className="text-[11px] text-emerald-400/90 font-mono">PNG / JPG / WebP / SVG (512x512+)</span>
                </div>

                {/* File Dropzone */}
                <input
                  ref={highResInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleHighResUpload}
                  className="hidden"
                />

                <div
                  onClick={() => highResInputRef.current?.click()}
                  className="group relative border-2 border-dashed border-slate-700 hover:border-emerald-500/80 rounded-xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-900/40 hover:bg-emerald-950/10 transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-800 group-hover:bg-emerald-500/20 text-slate-300 group-hover:text-emerald-400 flex items-center justify-center transition-colors">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white mb-0.5">
                      {isAr ? 'اضغط لرفع صورة الشعار عالية الدقة أو اسحبها هنا' : 'Click to upload high-res icon image or drag & drop'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {isAr
                        ? 'سيقوم النظام تلقائياً بتوليد مقاسات Mipmap الستة بدقة بكسل فائقة مع مراعاة منطقة الأمان'
                        : 'System will automatically resample and crop all 6 Android density buckets with safe-zone guides'}
                    </p>
                  </div>
                </div>

                {/* Built-in Ready Presets */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    {isAr ? 'أو اختر من قوالب الأيقونات الجاهزة للاختبار الفوري:' : 'Or test immediately with built-in app logo presets:'}
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {ICON_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => setHighResSource(preset.svg)}
                        className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          highResSource === preset.svg
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold'
                            : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-md overflow-hidden bg-slate-950 p-1 flex items-center justify-center">
                          <img src={preset.svg} alt={preset.name} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[10px] truncate max-w-full">{isAr ? preset.nameAr : preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 1.2 Adaptive Layers & Safe Zone Controls */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-emerald-400" />
                    <span>{isAr ? '2. ضبط طبقات الأيقونة التكيفية (Adaptive Layers)' : '2. Adaptive Layers & Safe Zone Setup'}</span>
                  </h3>
                  <button
                    onClick={() =>
                      setIconConfig(prev => ({
                        ...prev,
                        foregroundScale: 0.75,
                        offsetX: 0,
                        offsetY: 0,
                        backgroundColor: '#0f172a',
                        backgroundType: 'color',
                      }))
                    }
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
                  </button>
                </div>

                {/* Foreground Scaling & Position Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Foreground Scale */}
                  <div className="space-y-1.5 bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{isAr ? 'حجم الشعار (Zoom)' : 'Logo Scale'}</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {Math.round(iconConfig.foregroundScale * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="1.4"
                      step="0.05"
                      value={iconConfig.foregroundScale}
                      onChange={e =>
                        setIconConfig(prev => ({ ...prev, foregroundScale: parseFloat(e.target.value) }))
                      }
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>30%</span>
                      <span className="text-emerald-400/80 font-bold">{isAr ? 'الموصى به 75%' : 'Safe 75%'}</span>
                      <span>140%</span>
                    </div>
                  </div>

                  {/* Offset X */}
                  <div className="space-y-1.5 bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{isAr ? 'إزاحة أفقية (X)' : 'Offset X'}</span>
                      <span className="text-cyan-400 font-mono font-bold">{iconConfig.offsetX}%</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      step="1"
                      value={iconConfig.offsetX}
                      onChange={e =>
                        setIconConfig(prev => ({ ...prev, offsetX: parseInt(e.target.value) }))
                      }
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>-40%</span>
                      <span>Center</span>
                      <span>+40%</span>
                    </div>
                  </div>

                  {/* Offset Y */}
                  <div className="space-y-1.5 bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{isAr ? 'إزاحة عمودية (Y)' : 'Offset Y'}</span>
                      <span className="text-cyan-400 font-mono font-bold">{iconConfig.offsetY}%</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      step="1"
                      value={iconConfig.offsetY}
                      onChange={e =>
                        setIconConfig(prev => ({ ...prev, offsetY: parseInt(e.target.value) }))
                      }
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>-40%</span>
                      <span>Center</span>
                      <span>+40%</span>
                    </div>
                  </div>
                </div>

                {/* Background Layer Customization */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      {isAr ? 'طبقة الخلفية التكيفية (Adaptive Background):' : 'Background Layer Fill:'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setIconConfig(prev => ({ ...prev, backgroundType: 'color' }))}
                        className={`px-2.5 py-1 text-[11px] rounded-md font-semibold cursor-pointer ${
                          iconConfig.backgroundType === 'color'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {isAr ? 'لون موحد' : 'Solid Color'}
                      </button>
                      <button
                        onClick={() => setIconConfig(prev => ({ ...prev, backgroundType: 'gradient' }))}
                        className={`px-2.5 py-1 text-[11px] rounded-md font-semibold cursor-pointer ${
                          iconConfig.backgroundType === 'gradient'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {isAr ? 'تدرج لوني' : 'Gradient'}
                      </button>
                      <button
                        onClick={() => setIconConfig(prev => ({ ...prev, backgroundType: 'transparent' }))}
                        className={`px-2.5 py-1 text-[11px] rounded-md font-semibold cursor-pointer ${
                          iconConfig.backgroundType === 'transparent'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {isAr ? 'شفاف' : 'Transparent'}
                      </button>
                      <button
                        onClick={() => setIconConfig(prev => ({ ...prev, backgroundType: 'image' }))}
                        className={`px-2.5 py-1 text-[11px] rounded-md font-semibold cursor-pointer ${
                          iconConfig.backgroundType === 'image'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {isAr ? 'صورة مخصصة' : 'Custom Image'}
                      </button>
                    </div>
                  </div>

                  {/* Custom Layer Uploads */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
                      <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-indigo-400" />
                        {isAr ? 'الطبقة الأمامية (Foreground):' : 'Foreground Layer:'}
                      </span>
                      <button className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg border border-slate-700 transition-all cursor-pointer">
                        <Upload className="h-3 w-3" />
                        <span>{isAr ? 'رفع ملف PNG/SVG' : 'Upload PNG/SVG'}</span>
                      </button>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
                      <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-emerald-400" />
                        {isAr ? 'الطبقة الخلفية (Background):' : 'Background Layer:'}
                      </span>
                      <button className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg border border-slate-700 transition-all cursor-pointer">
                        <Upload className="h-3 w-3" />
                        <span>{isAr ? 'رفع ملف PNG/SVG' : 'Upload PNG/SVG'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Color pickers & palette */}
                  {iconConfig.backgroundType !== 'transparent' && (
                    <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-slate-400">
                          {iconConfig.backgroundType === 'gradient' ? (isAr ? 'اللون 1:' : 'Color 1:') : (isAr ? 'اللون:' : 'Color:')}
                        </label>
                        <input
                          type="color"
                          value={iconConfig.backgroundColor}
                          onChange={e =>
                            setIconConfig(prev => ({ ...prev, backgroundColor: e.target.value }))
                          }
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-slate-700"
                        />
                        <span className="text-[11px] font-mono text-slate-300">{iconConfig.backgroundColor}</span>
                      </div>

                      {iconConfig.backgroundType === 'gradient' && (
                        <>
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] text-slate-400">
                              {isAr ? 'اللون 2:' : 'Color 2:'}
                            </label>
                            <input
                              type="color"
                              value={iconConfig.gradientColor2}
                              onChange={e =>
                                setIconConfig(prev => ({ ...prev, gradientColor2: e.target.value }))
                              }
                              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-slate-700"
                            />
                            <span className="text-[11px] font-mono text-slate-300">{iconConfig.gradientColor2}</span>
                          </div>

                          <div className="flex items-center gap-2 ml-auto">
                            <label className="text-[11px] text-slate-400">{isAr ? 'الزاوية:' : 'Angle:'}</label>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              value={iconConfig.gradientAngle}
                              onChange={e =>
                                setIconConfig(prev => ({ ...prev, gradientAngle: parseInt(e.target.value) }))
                              }
                              className="w-20 accent-emerald-500 cursor-pointer"
                            />
                            <span className="text-[11px] font-mono text-slate-300">{iconConfig.gradientAngle}°</span>
                          </div>
                        </>
                      )}

                      {/* Quick Palettes */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        {COLOR_PRESETS.map(c => (
                          <button
                            key={c.hex}
                            title={c.name}
                            onClick={() =>
                              setIconConfig(prev => ({
                                ...prev,
                                backgroundColor: c.hex,
                                ...(prev.backgroundType === 'gradient'
                                  ? { gradientColor2: c.hex === '#000000' ? '#1e293b' : '#047857' }
                                  : {}),
                              }))
                            }
                            style={{ backgroundColor: c.hex }}
                            className="w-5 h-5 rounded-full border border-slate-600 hover:scale-115 transition-transform cursor-pointer"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Toggles: Safe Zone & Monochrome */}
                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={iconConfig.showSafeZoneGuides}
                        onChange={e =>
                          setIconConfig(prev => ({ ...prev, showSafeZoneGuides: e.target.checked }))
                        }
                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>{isAr ? 'إظهار خطوط الأمان التكيفية (Safe Zone 66dp Guides)' : 'Show Android Safe-Zone Keylines (66dp circle)'}</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={iconConfig.enableMonochrome}
                        onChange={e =>
                          setIconConfig(prev => ({ ...prev, enableMonochrome: e.target.checked }))
                        }
                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>{isAr ? 'نمط الأيقونة أحادية اللون (Android 13+ Themed Icon)' : 'Themed / Monochromatic Layer (Android 13+)'}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Launcher Simulator & Safe-Zone Mask Visualizer (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-4 flex flex-col items-center">
                <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-emerald-400" />
                    <span>{isAr ? 'المعاينة التكيفية الحية' : 'Live Adaptive Preview'}</span>
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Pixel & OneUI Ready</span>
                  </div>
                </div>

                {/* Big Preview Canvas Container */}
                <div className="relative p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl flex flex-col items-center justify-center">
                  <canvas
                    ref={previewCanvasRef}
                    width={256}
                    height={256}
                    className="w-48 h-48 drop-shadow-2xl transition-all"
                  />

                  {iconConfig.showSafeZoneGuides && activeMask === 'none' && (
                    <div className="absolute bottom-2 text-[10px] text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      {isAr ? 'الدائرة المتقطعة = منطقة الأمان المضمونة 66dp' : 'Dashed circle = Guaranteed Safe Zone (66dp)'}
                    </div>
                  )}
                </div>

                {/* Mask Shape Selectors */}
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{isAr ? 'اختر قناع المشغل (OEM Launcher Mask):' : 'Select OEM Launcher Mask:'}</span>
                    <span className="font-mono text-emerald-400 text-[11px] capitalize">{activeMask}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { id: 'squircle', label: 'Squircle', sub: 'Samsung' },
                      { id: 'circle', label: 'Circle', sub: 'Pixel' },
                      { id: 'rounded', label: 'Rounded', sub: 'MIUI' },
                      { id: 'teardrop', label: 'Teardrop', sub: 'Nothing' },
                      { id: 'none', label: 'Canvas', sub: '108dp' },
                    ].map(mask => (
                      <button
                        key={mask.id}
                        onClick={() => setActiveMask(mask.id as IconShapeMask)}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                          activeMask === mask.id
                            ? 'border-emerald-500 bg-emerald-500/15 text-white font-bold'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        <div className="text-xs font-semibold">{mask.label}</div>
                        <div className="text-[9px] text-slate-500">{mask.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="w-full pt-3 border-t border-slate-800 flex flex-col gap-2">
                  <button
                    onClick={handleApplyAllMipmapsToApk}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{isAr ? 'تطبيق الكثافات الستة على حزمة الـ APK الآن' : 'Apply All 6 Densities to Active APK'}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleDownloadZip}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{isAr ? 'تحميل ZIP كامل' : 'Download ZIP'}</span>
                    </button>
                    <button
                      onClick={() => setShowXmlModal(true)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <FileCode2 className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{isAr ? 'معاينة كود XML' : 'View XML'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 1.3 GENERATED MIPMAP-LEVEL ICON SET GRID                                   */}
          {/* ========================================================================= */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/70 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Grid className="h-4 w-4 text-emerald-400" />
                    <span>{isAr ? 'مجموعة كثافات Mipmap المولدة تلقائياً (Android Icon Set)' : 'Generated Android Mipmap-Level Icon Set'}</span>
                  </h3>
                  {isGenerating && (
                    <span className="flex items-center gap-1 text-[11px] text-amber-400 font-mono animate-pulse">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      {isAr ? 'جاري المعالجة...' : 'Rendering...'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr
                    ? 'تم بناء المقاسات القياسية المعتمدة من Google بنقاء بكسل كامل لكل كثافة شاشة مع المسار المباشر داخل بنية الـ APK'
                    : 'Standard Android density levels rendered with high-precision bicubic resampling and direct APK paths'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadZip}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
                >
                  <FolderArchive className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{isAr ? 'تصدير كأرشيف res/ كامل' : 'Export Full res/ Folder'}</span>
                </button>
              </div>
            </div>

            {/* Densities Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
              {generatedSet?.levels.map(level => (
                <div
                  key={level.density}
                  className="flex flex-col items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-emerald-500/50 transition-all group"
                >
                  <div className="w-full flex items-center justify-between text-[11px] font-mono pb-2 border-b border-slate-800/60 text-slate-400">
                    <span className="font-bold text-white">{level.density.toUpperCase()}</span>
                    <span className="text-emerald-400 font-semibold">{level.scale}</span>
                  </div>

                  {/* Thumbnail */}
                  <div className="my-3 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-xl bg-slate-950 p-1 border border-slate-800 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                      <img
                        src={level.dataUrl}
                        alt={level.name}
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Spec Info */}
                  <div className="w-full text-center space-y-1">
                    <div className="text-xs font-mono font-bold text-slate-200">
                      {level.size} × {level.size} px
                    </div>
                    <div className="text-[10px] text-slate-500 truncate" title={level.resPath}>
                      {level.resPath.split('/').pop()}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400/80">
                      ~{(level.byteSize / 1024).toFixed(1)} KB
                    </div>
                  </div>

                  {/* Single Download button */}
                  <button
                    onClick={() => handleDownloadSingleDensity(level)}
                    className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-emerald-500/20 hover:border-emerald-500/40 rounded-lg border border-slate-700/80 transition-all cursor-pointer"
                  >
                    <Download className="h-3 w-3" />
                    <span>PNG</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: RUNTIME RESOURCE OVERLAYS (RRO) & THEMING ENGINE                */}
      {/* ========================================================================= */}
      {activeMainSection === 'rroTheming' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/70 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Palette className="h-4 w-4 text-emerald-400" />
                    <span>{isAr ? 'محرك تراكب الموارد (Runtime Resource Overlays - RROs)' : 'Runtime Resource Overlays (RRO) Engine'}</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    AOSP Native
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  {isAr
                    ? 'قم بتعديل قيم الألوان، الأبعاد، هوامش الحواف، والأيقونات دون تعديل كود الـ Smali أو إبطال توقيع الـ APK الأصلي. تعمل حزمة الـ Overlay كطبقة حية تعلو موارد التطبيق.'
                    : 'Override system & app colors, dimensions, and booleans without modifying Smali code or corrupting DEX bytecode. Native AOSP overlay layer.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportRroZip}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{isAr ? 'تصدير حزمة RRO (JSON)' : 'Export RRO Bundle'}</span>
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer shadow-sm shadow-emerald-500/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isAr ? 'إضافة مورد تراكب' : 'Add Overlay Item'}</span>
                </button>
              </div>
            </div>

            {/* Presets Row */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>{isAr ? 'قوالب الثيمات الفورية الجاهزة:' : 'Instant Theme Presets:'}</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {DEFAULT_RRO_THEME_PRESETS.map(preset => {
                  const isActive = activePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isActive
                          ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            {preset.id === 'preset_amoled_dark' && <Moon className="h-3.5 w-3.5 text-cyan-400" />}
                            {preset.id === 'preset_cyber_cyan' && <Zap className="h-3.5 w-3.5 text-emerald-400" />}
                            {preset.id === 'preset_high_contrast' && <Sun className="h-3.5 w-3.5 text-amber-400" />}
                            {preset.id === 'preset_sunset_orange' && <Palette className="h-3.5 w-3.5 text-orange-400" />}
                            <span>{isAr ? preset.nameAr : preset.nameEn}</span>
                          </span>
                          {isActive && (
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {isAr ? preset.descriptionAr : preset.descriptionEn}
                        </p>
                      </div>

                      {/* Color Preview Swatches */}
                      <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-800/80">
                        {preset.items
                          .filter(item => item.type === 'color' && item.overlayValue.startsWith('#'))
                          .slice(0, 4)
                          .map((item, index) => (
                            <span
                              key={index}
                              style={{ backgroundColor: item.overlayValue }}
                              className="h-3.5 w-3.5 rounded-full border border-slate-700 inline-block"
                              title={`${item.name}: ${item.overlayValue}`}
                            />
                          ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split View: Live App Mockup (Left) vs Interactive Overlay Rules (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Phone Mockup (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{isAr ? 'معاينة شاشة التطبيق الحية بالثيم المعدل' : 'Live Overlay Mockup'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Target: {targetPkg}</span>
                </div>

                {/* Phone Frame */}
                <div
                  className="w-full max-w-[280px] rounded-[36px] p-3 shadow-2xl border-4 border-slate-800 bg-slate-950 relative overflow-hidden"
                  style={{ minHeight: '520px' }}
                >
                  {/* Camera Punchhole */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-900 border border-slate-800 z-30" />

                  {/* Screen Content reacting to active RRO styles */}
                  <div
                    className="w-full h-full rounded-[26px] p-4 flex flex-col justify-between transition-colors duration-300 relative"
                    style={{
                      backgroundColor: bgColor,
                      color: textColor,
                    }}
                  >
                    {/* App Header Bar */}
                    <div className="pt-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-700/50">
                            <img src={highResSource} alt="App Icon" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="text-[11px] font-bold truncate max-w-[120px]">
                              {metadata?.appName || 'Smart Portal'}
                            </div>
                            <div className="text-[9px] opacity-60">v{metadata?.versionName || '1.0'} (Themed)</div>
                          </div>
                        </div>
                        <div
                          className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                          style={{
                            backgroundColor: `${primaryColor}25`,
                            color: primaryColor,
                            border: `1px solid ${primaryColor}40`,
                          }}
                        >
                          PRO
                        </div>
                      </div>

                      {/* Search Bar mockup */}
                      <div
                        className="p-2 rounded-lg text-[10px] flex items-center justify-between opacity-80"
                        style={{
                          backgroundColor: surfaceColor,
                          borderRadius: cornerRadius.endsWith('dp') ? `${parseInt(cornerRadius)}px` : '8px',
                        }}
                      >
                        <span>{isAr ? 'بحث سريع في البيانات...' : 'Search resources...'}</span>
                        <div className="w-3 h-3 rounded-full bg-current opacity-40" />
                      </div>
                    </div>

                    {/* Middle Card: Metric / Content */}
                    <div className="space-y-2.5 my-auto py-3">
                      <div
                        className="p-3.5 space-y-2 transition-all"
                        style={{
                          backgroundColor: surfaceColor,
                          borderRadius: cornerRadius.endsWith('dp') ? `${parseInt(cornerRadius)}px` : '12px',
                          border: `1px solid ${primaryColor}30`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium opacity-80">
                            {isAr ? 'المستوى والأداء' : 'Active Engine Status'}
                          </span>
                          <span
                            className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded"
                            style={{ backgroundColor: primaryColor, color: '#000000' }}
                          >
                            100%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: '85%', backgroundColor: primaryColor }}
                          />
                        </div>
                        <div className="text-[9px] opacity-70">
                          {isAr ? 'تم استبدال ألوان الواجهة دون لمس كود DEX' : 'Native RRO injected via resource overlays'}
                        </div>
                      </div>

                      {/* Promo Banner if not hidden */}
                      {rroItems.find(i => i.name === 'show_promo_banner')?.isEnabled &&
                        rroItems.find(i => i.name === 'show_promo_banner')?.overlayValue === 'true' && (
                          <div
                            className="p-2.5 rounded-lg text-[10px] text-center font-medium transition-all"
                            style={{
                              backgroundColor: `${primaryColor}20`,
                              color: primaryColor,
                              border: `1px dashed ${primaryColor}60`,
                            }}
                          >
                            🎉 {isAr ? 'عرض الحساب المميز مفعل عبر RRO' : 'Promo Banner (Visible)'}
                          </div>
                        )}
                    </div>

                    {/* Bottom Action Button */}
                    <div className="pt-2">
                      <button
                        style={{
                          backgroundColor: primaryColor,
                          borderRadius: cornerRadius.endsWith('dp') ? `${parseInt(cornerRadius)}px` : '10px',
                          color: '#000000',
                        }}
                        className="w-full py-2 text-xs font-bold transition-all shadow-md"
                      >
                        {isAr ? 'بدء الاستخدام (محدث)' : 'Launch Themed App'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlays Rules Table (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{isAr ? 'قواعد التراكب النشطة (Active Overlay Rules)' : 'Active Overlay Rules'}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {rroItems.length}
                    </span>
                  </span>

                  {/* Type Filter */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
                    {['all', 'color', 'dimen', 'bool'].map(type => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-2 py-0.5 rounded capitalize font-medium transition-colors cursor-pointer ${
                          filterType === type
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rules List */}
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        item.isEnabled
                          ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-950/40 border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={item.isEnabled}
                          onChange={() => handleToggleItem(item.id)}
                          className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400">
                              @{item.type}
                            </span>
                            <span className="text-xs font-mono font-bold text-white truncate">{item.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">{isAr ? item.descriptionAr : item.descriptionEn}</div>
                        </div>
                      </div>

                      {/* Editable Value and Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        {item.type === 'color' && (
                          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                            <input
                              type="color"
                              value={item.overlayValue.startsWith('#') ? item.overlayValue : '#10b981'}
                              onChange={e => handleUpdateItemOverlay(item.id, e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                            />
                            <input
                              type="text"
                              value={item.overlayValue}
                              onChange={e => handleUpdateItemOverlay(item.id, e.target.value)}
                              className="w-20 text-[11px] font-mono bg-transparent text-white border-0 focus:outline-none"
                            />
                          </div>
                        )}

                        {item.type === 'dimen' && (
                          <input
                            type="text"
                            value={item.overlayValue}
                            onChange={e => handleUpdateItemOverlay(item.id, e.target.value)}
                            className="w-20 text-xs font-mono bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                          />
                        )}

                        {item.type === 'bool' && (
                          <button
                            onClick={() =>
                              handleUpdateItemOverlay(item.id, item.overlayValue === 'true' ? 'false' : 'true')
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                              item.overlayValue === 'true'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {item.overlayValue}
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete rule"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Generated RRO XML Viewer */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex flex-col gap-4">
                {/* Title */}
                <div className="flex items-center gap-2">
                  <FileCode2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    {isAr ? 'كود المانيفست والموارد التراكبية المولد تلقائياً:' : 'Generated AOSP Overlay Resource Files:'}
                  </span>
                </div>

                {/* Code Selector Bar & Action Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800">
                    <button
                      onClick={() => setActiveXmlTab('manifest')}
                      className={`px-3 py-1 rounded font-mono text-[11px] transition-all cursor-pointer ${
                        activeXmlTab === 'manifest' ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      AndroidManifest.xml
                    </button>
                    <button
                      onClick={() => setActiveXmlTab('colors')}
                      className={`px-3 py-1 rounded font-mono text-[11px] transition-all cursor-pointer ${
                        activeXmlTab === 'colors' ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      colors.xml
                    </button>
                    <button
                      onClick={() => setActiveXmlTab('dimens')}
                      className={`px-3 py-1 rounded font-mono text-[11px] transition-all cursor-pointer ${
                        activeXmlTab === 'dimens' ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      dimens.xml
                    </button>
                  </div>

                  <button
                    onClick={handleCopyXml}
                    className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-700 rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCode ? (isAr ? 'تم النسخ بنجاح ✓' : 'Copied Successfully ✓') : isAr ? 'نسخ الكود' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed selection:bg-emerald-500/30">
                <code>{activeXmlContent}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: IMAGE ASSET EXTRACTOR                                         */}
      {/* ========================================================================= */}
      {activeMainSection === 'imageExtractor' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/40">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileImage className="h-4 w-4 text-cyan-400" />
                <span>{isAr ? 'مسح واستخراج صور حزمة الـ APK' : 'Extract Image Assets inside APK'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {isAr 
                  ? 'يقوم البرنامج بمسح مجلدات drawable, mipmap, assets واستخراج كافة الصور، الشعارات، والأيقونات بدقتها الأصلية لتنزيلها أو استبدالها.'
                  : 'Scans drawables, mipmaps, and assets directory inside the active APK and lists all photos and icons for download or hot-swap.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
              {extractedImages.length > 0 && (
                <button
                  onClick={handleDownloadAllImagesZip}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
                >
                  <FolderDown className="h-4 w-4" />
                  <span>{isAr ? 'تنزيل جميع الصور كملف ZIP' : 'Download All Images as ZIP'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Search className="h-4 w-4 text-slate-400" />
                <span>{isAr ? 'البحث عن صورة محددة:' : 'Filter & Search Image Files:'}</span>
              </span>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder={isAr ? 'ابحث باسم الصورة أو مسار المجلد...' : 'Search by name or path...'}
                  value={imageSearchQuery}
                  onChange={(e) => setImageSearchQuery(e.target.value)}
                  className="w-full sm:w-52 text-xs font-mono px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                />

                <select
                  value={imageTypeFilter}
                  onChange={(e) => setImageTypeFilter(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="all">{isAr ? 'جميع الملفات (All)' : 'All Files'}</option>
                  <option value="image">{isAr ? 'الصور فقط (Images)' : 'Images Only'}</option>
                  <option value="icon">{isAr ? 'الأيقونات والرموز (Icons)' : 'Icons Only'}</option>
                </select>
                
                <span className="text-[11px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-400 shrink-0 border border-slate-800">
                  {(() => {
                    const filtered = extractedImages.filter(img => {
                      const matchSearch = img.path.toLowerCase().includes(imageSearchQuery.toLowerCase());
                      if (!matchSearch) return false;
                      if (imageTypeFilter === 'all') return true;

                      const nameLower = img.name.toLowerCase();
                      const pathLower = img.path.toLowerCase();
                      const isImgIcon = (
                        nameLower.startsWith('ic_') ||
                        nameLower.includes('icon') ||
                        nameLower.includes('launcher') ||
                        nameLower.includes('avatar') ||
                        nameLower.includes('logo') ||
                        nameLower.includes('shortcut') ||
                        pathLower.includes('mipmap') ||
                        nameLower.endsWith('.svg')
                      );

                      if (imageTypeFilter === 'icon') return isImgIcon;
                      if (imageTypeFilter === 'image') return !isImgIcon;
                      return true;
                    });
                    return filtered.length;
                  })()} {isAr ? 'ملفات' : 'files'}
                </span>
              </div>
            </div>

            {/* Grid of Extracted Images */}
            {isExtractingImages ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCwIcon className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">{isAr ? 'جاري مسح أرشيف الـ APK واستخراج الصور...' : 'Scanning APK archive and extracting image files...'}</p>
              </div>
            ) : extractedImages.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <FileImage className="h-12 w-12 text-slate-700 mx-auto" />
                <p className="text-xs text-slate-400">
                  {isAr ? 'لم يتم العثور على صور في التطبيق الفعال.' : 'No images found inside current APK assets.'}
                </p>
              </div>
            ) : (
              <div className={
                viewMode === 'list' 
                  ? "flex flex-col gap-2" 
                  : `grid gap-4 ${
                      gridSize === 'sm' ? 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6' :
                      gridSize === 'lg' ? 'grid-cols-1 md:grid-cols-2' :
                      'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    }`
              }>
                {extractedImages
                  .filter(img => {
                    const matchSearch = img.path.toLowerCase().includes(imageSearchQuery.toLowerCase());
                    if (!matchSearch) return false;
                    if (imageTypeFilter === 'all') return true;

                    const nameLower = img.name.toLowerCase();
                    const pathLower = img.path.toLowerCase();
                    const isImgIcon = (
                      nameLower.startsWith('ic_') ||
                      nameLower.includes('icon') ||
                      nameLower.includes('launcher') ||
                      nameLower.includes('avatar') ||
                      nameLower.includes('logo') ||
                      nameLower.includes('shortcut') ||
                      pathLower.includes('mipmap') ||
                      nameLower.endsWith('.svg')
                    );

                    if (imageTypeFilter === 'icon') return isImgIcon;
                    if (imageTypeFilter === 'image') return !isImgIcon;
                    return true;
                  })
                  .map((img, idx) => viewMode === 'list' ? (
                    <div 
                      key={idx}
                      className="flex items-center gap-4 p-2.5 rounded-lg border border-slate-800 bg-slate-900/40 hover:border-cyan-500/40 hover:bg-slate-900/60 transition-all group"
                    >
                      <div 
                        onClick={() => setLightboxImage({ url: img.dataUrl, name: img.name, path: img.path, size: img.size })}
                        className="w-14 h-14 rounded-lg bg-slate-950 flex items-center justify-center p-1.5 border border-slate-800 shrink-0 cursor-pointer group-hover:border-cyan-500/30"
                      >
                        <img src={img.dataUrl} alt={img.name} className="max-h-full max-w-full object-contain drop-shadow-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-200 truncate group-hover:text-cyan-400 transition-colors">{img.name}</h4>
                        <p className="text-[10px] text-slate-500 truncate font-mono mt-0.5">{img.path}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-cyan-400 font-mono font-bold">{(img.size / 1024).toFixed(1)} KB</span>
                          <span className="text-[10px] text-slate-600 font-mono">{img.name.split('.').pop()?.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 pl-4 border-l border-slate-800">
                        <button 
                          onClick={() => handleDownloadSingleImage(img)} 
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                          title={isAr ? 'تحميل' : 'Download'}
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedImageForSwap(img); swapImageInputRef.current?.click(); }} 
                          className="p-2 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/10 rounded-lg transition-all cursor-pointer"
                          title={isAr ? 'استبدال' : 'Swap'}
                        >
                          <RefreshCwIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      key={idx}
                      className="group rounded-xl border border-slate-800 bg-slate-900/40 p-3 hover:border-cyan-500/50 hover:bg-slate-900/80 transition-all flex flex-col justify-between space-y-3"
                    >
                      {/* Image Preview Box */}
                      <div 
                        onClick={() => setLightboxImage({ url: img.dataUrl, name: img.name, path: img.path, size: img.size })}
                        className={`relative rounded-lg overflow-hidden bg-slate-950/80 border border-slate-800 flex items-center justify-center p-2 group-hover:border-slate-700 cursor-pointer ${gridSize === 'lg' ? 'aspect-square md:aspect-video' : 'aspect-video'}`}
                        title={isAr ? 'اضغط لعرض الصورة بحجم كامل' : 'Click to view full image'}
                      >
                        <img 
                          src={img.dataUrl} 
                          alt={img.name} 
                          className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform" 
                          onError={(e) => {
                            // fallback if image cannot render directly
                            (e.target as any).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23334155" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                          }}
                        />
                        <div className="absolute top-1 left-1.5 text-[8px] font-mono bg-slate-950/90 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/80">
                          {img.name.split('.').pop()?.toUpperCase()}
                        </div>
                        {/* Lightbox Eye Overlay */}
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="p-1.5 rounded-full bg-slate-900/95 text-cyan-400 border border-cyan-500/30 shadow-lg">
                            <Eye className="h-4 w-4" />
                          </span>
                        </div>
                      </div>

                      {/* Info & Metadata */}
                      <div className="min-w-0 space-y-1">
                        <span className={`text-slate-200 block truncate font-bold ${gridSize === 'lg' ? 'text-sm' : 'text-xs'}`} title={img.name}>
                          {img.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 block truncate" title={img.path}>
                          {img.path}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold block">
                          {(img.size / 1024).toFixed(1)} KB
                        </span>
                      </div>

                      {/* Hover Actions */}
                      <div className={`grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800 ${gridSize === 'sm' ? 'hidden group-hover:grid' : ''}`}>
                        <button
                          onClick={() => handleDownloadSingleImage(img)}
                          className="flex items-center justify-center gap-1 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 transition-colors cursor-pointer"
                        >
                          <DownloadIcon className="h-3 w-3" />
                          <span>{isAr ? 'تحميل' : 'Download'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedImageForSwap(img);
                            swapImageInputRef.current?.click();
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 rounded bg-cyan-950/50 hover:bg-cyan-950 text-cyan-400 text-[10px] font-bold border border-cyan-800/30 transition-colors cursor-pointer"
                        >
                          <RefreshCwIcon className="h-3 w-3" />
                          <span>{isAr ? 'استبدال' : 'Swap'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input for swap images */}
      <input 
        ref={swapImageInputRef}
        type="file" 
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        onChange={handleSwapImage}
        className="hidden"
      />
      {showXmlModal && generatedSet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-emerald-400" />
                <span>{isAr ? 'ملفات تعريف الأيقونة التكيفية (Adaptive Icon XML)' : 'Adaptive Icon XML Definitions'}</span>
              </h3>
              <button
                onClick={() => setShowXmlModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-mono text-emerald-400 block mb-1">
                  res/mipmap-anydpi-v26/ic_launcher.xml
                </span>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-36">
                  <code>{generatedSet.adaptiveXml}</code>
                </pre>
              </div>

              <div>
                <span className="text-xs font-mono text-cyan-400 block mb-1">
                  res/values/ic_launcher_background.xml
                </span>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-24">
                  <code>{generatedSet.backgroundXml}</code>
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${generatedSet.adaptiveXml}\n\n${generatedSet.backgroundXml}`);
                  setCopiedXml(true);
                  setTimeout(() => setCopiedXml(false), 2000);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
              >
                {copiedXml ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedXml ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'نسخ الأكواد' : 'Copy XML'}</span>
              </button>
              <button
                onClick={() => setShowXmlModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Custom RRO Item */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-400" />
                <span>{isAr ? 'إضافة مورد تراكب جديد (RRO)' : 'Add Resource Overlay Rule'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddOverlayItem} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  {isAr ? 'نوع المورد (Resource Type):' : 'Resource Type:'}
                </label>
                <select
                  value={newItemType}
                  onChange={e => setNewItemType(e.target.value as ResourceOverlayType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="color">@color (ألوان وعناصر بصرية)</option>
                  <option value="dimen">@dimen (أبعاد وهوامش وزوايا)</option>
                  <option value="drawable">@drawable (صور وأيقونات متجهة)</option>
                  <option value="bool">@bool (خيارات تشغيل منطقية)</option>
                  <option value="string">@string (نصوص وعناوين)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  {isAr ? 'معرف المورد (Resource Name/Key):' : 'Resource Name/Key:'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. primary_brand_color or card_corner_radius"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    {isAr ? 'القيمة الأصلية (Original):' : 'Original Value:'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. #c9142c or 8dp"
                    value={newItemOriginal}
                    onChange={e => setNewItemOriginal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    {isAr ? 'قيمة التراكب (Overlay Value):' : 'Overlay Value:'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. #10b981 or 16dp"
                    value={newItemOverlay}
                    onChange={e => setNewItemOverlay(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  {isAr ? 'الوصف / ملاحظة:' : 'Description:'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. AMOLED background override"
                  value={newItemDesc}
                  onChange={e => setNewItemDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
                >
                  {isAr ? 'حفظ وإضافة التراكب' : 'Save Overlay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: RESOURCE GALLERY (DRAWABLES & MIPMAPS)                         */}
      {/* ========================================================================= */}
      {activeMainSection === 'resourceGallery' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <Grid className="h-4 w-4 text-amber-400" />
                  <span>{isAr ? 'معرض موارد التطبيق (Resource Gallery)' : 'App Resource Gallery'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr 
                    ? 'استعرض جميع ملفات الصور (Drawables) والرموز (Mipmaps) المتاحة، وقم بفلترتها حسب الدقة أو النوع.'
                    : 'Browse, filter, and inspect all drawables, mipmaps, and custom visual assets in this APK.'}
                </p>
              </div>
              <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 font-mono">
                {isAr ? `إجمالي الموارد المكتشفة: ${galleryItems.length}` : `Total Discovered Assets: ${galleryItems.length}`}
              </span>
            </div>

            {/* Filter controls bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/60">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder={isAr ? 'ابحث باسم المورد...' : 'Search asset name...'}
                  value={gallerySearch}
                  onChange={(e) => setGallerySearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={galleryTypeFilter}
                  onChange={(e) => setGalleryTypeFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">{isAr ? 'جميع الفئات (All Categories)' : 'All Categories'}</option>
                  <option value="drawable">{isAr ? 'الرسوميات (Drawables)' : 'Drawables'}</option>
                  <option value="mipmap">{isAr ? 'الرموز والأيقونات (Mipmaps)' : 'Mipmaps'}</option>
                </select>
              </div>

              {/* DPI / Density Filter */}
              <div>
                <select
                  value={galleryDpiFilter}
                  onChange={(e) => setGalleryDpiFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">{isAr ? 'جميع الدقات والكثافات (All Densities)' : 'All Densities'}</option>
                  <option value="default">{isAr ? 'الدقة الافتراضية / بدون كثافة (default)' : 'Default (no-dpi)'}</option>
                  <option value="hdpi">hdpi (High)</option>
                  <option value="xhdpi">xhdpi (X-High)</option>
                  <option value="xxhdpi">xxhdpi (XX-High)</option>
                  <option value="xxxhdpi">xxxhdpi (XXX-High)</option>
                  <option value="anydpi">anydpi (Vector/Universal)</option>
                  <option value="mdpi">mdpi (Medium)</option>
                  <option value="ldpi">ldpi (Low)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Gallery Items Display */}
          {isExtractingGallery ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-950/40 rounded-xl border border-slate-800">
              <RefreshCw className="h-8 w-8 animate-spin text-amber-500 mb-3" />
              <p className="text-xs text-slate-400 font-medium animate-pulse">
                {isAr ? 'جاري فحص أرشيف التطبيق وقراءة الموارد البصرية...' : 'Scanning APK archive and reading resources...'}
              </p>
            </div>
          ) : (
            <>
              {/* Filter logic */}
              {(() => {
                const filtered = galleryItems.filter(item => {
                  const matchSearch = item.name.toLowerCase().includes(gallerySearch.toLowerCase());
                  const matchType = galleryTypeFilter === 'all' || item.type === galleryTypeFilter;
                  const matchDpi = galleryDpiFilter === 'all' || item.dpi === galleryDpiFilter;
                  return matchSearch && matchType && matchDpi;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-16 bg-slate-950/40 rounded-xl border border-slate-800 text-center">
                      <ImageIcon className="h-10 w-10 text-slate-700 mb-2" />
                      <p className="text-sm font-semibold text-slate-400 mb-1">{isAr ? 'لا توجد موارد تطابق الفلتر' : 'No assets match the filters'}</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        {isAr ? 'حاول كتابة اسم آخر أو تغيير دقة الكثافة المحددة.' : 'Try adjusting your search query or density selection.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filtered.map((item, index) => {
                      const isXml = item.fileType === 'xml';
                      return (
                        <div
                          key={index}
                          className="group relative flex flex-col justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-amber-500/40 hover:bg-slate-900/80 transition-all overflow-hidden"
                        >
                          {/* DPI & Size Badge Top */}
                          <div className="flex items-center justify-between w-full mb-2">
                            <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                              item.dpi === 'anydpi' 
                                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' 
                                : item.dpi.includes('xx') 
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {item.dpi}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {(item.size / 1024).toFixed(1)} KB
                            </span>
                          </div>

                          {/* Preview container */}
                          <div className="h-28 w-full flex items-center justify-center bg-slate-950/80 rounded-lg border border-slate-800/80 mb-3 p-2 relative overflow-hidden group-hover:bg-slate-950/40 transition-colors">
                            {isXml ? (
                              <div className="flex flex-col items-center justify-center text-center">
                                <div className="p-2.5 rounded-full bg-indigo-500/10 text-indigo-400 mb-1 border border-indigo-500/25">
                                  <FileCode2 className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] font-mono text-indigo-300 font-semibold uppercase">{item.fileType}</span>
                              </div>
                            ) : item.dataUrl ? (
                              <div 
                                onClick={() => setLightboxImage({ url: item.dataUrl!, name: item.name, path: item.path, size: item.size })}
                                className="h-full w-full flex items-center justify-center relative cursor-pointer group/preview"
                                title={isAr ? 'اضغط لعرض الصورة بحجم كامل' : 'Click to view full image'}
                              >
                                <img
                                  src={item.dataUrl}
                                  alt={item.name}
                                  className="max-h-full max-w-full object-contain drop-shadow-md group-hover/preview:scale-105 transition-transform"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="p-1.5 rounded-full bg-slate-900/90 text-amber-400 border border-amber-500/30 shadow-lg">
                                    <Eye className="h-3.5 w-3.5" />
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <FileImage className="h-8 w-8 text-slate-600" />
                            )}
                          </div>

                          {/* Title / Description */}
                          <div className="min-w-0 mb-3">
                            <h4 className="text-xs font-mono font-bold text-slate-200 truncate" title={item.name}>
                              {item.name}
                            </h4>
                            <p className="text-[10px] font-mono text-slate-500 truncate mt-0.5" title={item.path}>
                              {item.path}
                            </p>
                          </div>

                          {/* Footer Actions */}
                          <div className="flex items-center gap-1.5 w-full pt-2 border-t border-slate-800/80">
                            {isXml ? (
                              <button
                                onClick={() => setViewingXmlItem(item)}
                                className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-bold transition-colors cursor-pointer"
                              >
                                <Eye className="h-3 w-3" />
                                <span>{isAr ? 'عرض الكود' : 'Source'}</span>
                              </button>
                            ) : (
                              <div className="flex-1 text-[10px] font-mono text-slate-500 italic truncate uppercase">
                                {item.fileType} image
                              </div>
                            )}

                            <button
                              onClick={() => handleDownloadGalleryAsset(item)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-amber-400 text-slate-400 transition-colors cursor-pointer"
                              title={isAr ? 'تحميل هذا الملف' : 'Download asset'}
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}

      {/* XML Code Viewer Modal Overlay */}
      {viewingXmlItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-zoomIn">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 className="h-5 w-5 text-indigo-400" />
                <div>
                  <h4 className="text-xs font-mono font-bold text-white">{viewingXmlItem.name}</h4>
                  <p className="text-[10px] font-mono text-slate-500">{viewingXmlItem.path}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingXmlItem(null)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer p-1 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-950 text-slate-300 font-mono text-xs overflow-auto max-h-[420px] whitespace-pre select-text">
              {viewingXmlItem.xmlContent || ''}
            </div>

            <div className="p-3 bg-slate-900 border-t border-slate-800/60 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(viewingXmlItem.xmlContent || '');
                  setCopiedGalleryXml(true);
                  setTimeout(() => setCopiedGalleryXml(false), 2000);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                {copiedGalleryXml ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedGalleryXml ? (isAr ? 'تم النسخ' : 'Copied!') : (isAr ? 'نسخ الكود' : 'Copy Code')}</span>
              </button>
              <button
                onClick={() => setViewingXmlItem(null)}
                className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GORGEOUS LIGHTBOX VIEW MODAL                                             */}
      {/* ========================================================================= */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8 animate-fadeIn">
          {/* Header area */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10">
            <div className="min-w-0 pr-10">
              <h3 className="text-sm md:text-base font-bold truncate max-w-[280px] sm:max-w-md">{lightboxImage.name}</h3>
              <p className="text-[10px] md:text-xs text-slate-400 font-mono truncate max-w-[280px] sm:max-w-md mt-0.5">{lightboxImage.path}</p>
            </div>
            <button
              onClick={() => setLightboxImage(null)}
              className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Large image display */}
          <div className="relative flex-1 max-h-[70vh] w-full flex items-center justify-center p-4">
            <img
              src={lightboxImage.url}
              alt={lightboxImage.name}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl border border-slate-800 bg-slate-950/60 p-2 select-text"
              onError={(e) => {
                (e.target as any).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23334155" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
              }}
            />
          </div>

          {/* Footer controls bar */}
          <div className="mt-6 flex flex-col items-center gap-3 bg-slate-900/80 border border-slate-800 px-6 py-4 rounded-xl max-w-xl w-full">
            <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Type: <strong className="text-slate-200">{lightboxImage.name.split('.').pop()?.toUpperCase()}</strong></span>
              </span>
              <span>•</span>
              {lightboxImage.size && (
                <>
                  <span>Size: <strong className="text-slate-200">{(lightboxImage.size / 1024).toFixed(1)} KB</strong></span>
                  <span>•</span>
                </>
              )}
              <span className="truncate max-w-[150px] sm:max-w-xs">{lightboxImage.path.split('/')[1] || 'root'}</span>
            </div>

            <div className="flex items-center gap-2.5 w-full">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = lightboxImage.url;
                  link.download = lightboxImage.name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>{isAr ? 'تحميل الملف الاصلي' : 'Download Original'}</span>
              </button>

              <button
                onClick={() => {
                  const matchedImg = extractedImages.find(i => i.path === lightboxImage.path);
                  if (matchedImg) {
                    setSelectedImageForSwap(matchedImg);
                    swapImageInputRef.current?.click();
                    setLightboxImage(null);
                  } else {
                    // fallback logic if not directly in swap list, search original zip or trigger toast
                    setSelectedImageForSwap({
                      path: lightboxImage.path,
                      name: lightboxImage.name,
                      size: lightboxImage.size || 0,
                      dataUrl: lightboxImage.url,
                      blob: new Blob()
                    });
                    swapImageInputRef.current?.click();
                    setLightboxImage(null);
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-750 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 text-cyan-400" />
                <span>{isAr ? 'استبدال / تعديل' : 'Swap / Hot-Swap'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

