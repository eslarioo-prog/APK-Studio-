import JSZip from 'jszip';
import {
  AdaptiveIconConfig,
  GeneratedAdaptiveIconSet,
  MipmapDensity,
  MipmapLevelInfo,
} from '../types/adaptiveIcon';

export const MIPMAP_SPECS: {
  density: MipmapDensity;
  name: string;
  size: number;
  scale: string;
  resPath: string;
}[] = [
  {
    density: 'mdpi',
    name: 'Medium Density',
    size: 48,
    scale: '1.0x (Baseline)',
    resPath: 'res/mipmap-mdpi/ic_launcher.png',
  },
  {
    density: 'hdpi',
    name: 'High Density',
    size: 72,
    scale: '1.5x',
    resPath: 'res/mipmap-hdpi/ic_launcher.png',
  },
  {
    density: 'xhdpi',
    name: 'Extra High Density',
    size: 96,
    scale: '2.0x',
    resPath: 'res/mipmap-xhdpi/ic_launcher.png',
  },
  {
    density: 'xxhdpi',
    name: 'Extra Extra High',
    size: 144,
    scale: '3.0x',
    resPath: 'res/mipmap-xxhdpi/ic_launcher.png',
  },
  {
    density: 'xxxhdpi',
    name: 'Ultra High Density',
    size: 192,
    scale: '4.0x',
    resPath: 'res/mipmap-xxxhdpi/ic_launcher.png',
  },
  {
    density: 'playstore',
    name: 'Google Play Store',
    size: 512,
    scale: 'Web / Hi-Res Store Icon',
    resPath: 'play_store_512.png',
  },
];

/**
 * Loads an HTMLImageElement from a URL or data URL
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = err => reject(err);
    img.src = src;
  });
}

/**
 * Renders an adaptive icon on a canvas of the specified width/height
 */
export function renderAdaptiveIconToCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement | null,
  config: AdaptiveIconConfig,
  targetSize: number,
  applyMask: boolean = false
) {
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, targetSize, targetSize);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.save();

  // If a shape mask is requested for preview
  if (applyMask && config.shapeMask !== 'none') {
    ctx.beginPath();
    const r = targetSize;
    if (config.shapeMask === 'circle') {
      ctx.arc(r / 2, r / 2, r / 2, 0, Math.PI * 2);
    } else if (config.shapeMask === 'squircle') {
      const radius = r * 0.28;
      roundRect(ctx, 0, 0, r, r, radius);
    } else if (config.shapeMask === 'rounded') {
      const radius = r * 0.18;
      roundRect(ctx, 0, 0, r, r, radius);
    } else if (config.shapeMask === 'teardrop') {
      // Circle with top-right corner square
      ctx.moveTo(r * 0.5, 0);
      ctx.lineTo(r, 0);
      ctx.lineTo(r, r * 0.5);
      ctx.arc(r * 0.5, r * 0.5, r * 0.5, 0, Math.PI * 1.5);
    }
    ctx.closePath();
    ctx.clip();
  }

  // 1. Draw Background
  if (config.backgroundType === 'color') {
    ctx.fillStyle = config.backgroundColor || '#0f172a';
    ctx.fillRect(0, 0, targetSize, targetSize);
  } else if (config.backgroundType === 'gradient') {
    const rad = ((config.gradientAngle || 135) * Math.PI) / 180;
    const x2 = Math.cos(rad) * targetSize;
    const y2 = Math.sin(rad) * targetSize;
    const grad = ctx.createLinearGradient(0, 0, Math.abs(x2), Math.abs(y2));
    grad.addColorStop(0, config.backgroundColor || '#10b981');
    grad.addColorStop(1, config.gradientColor2 || '#047857');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, targetSize, targetSize);
  }
  // transparent does not draw background

  // 2. Draw Foreground Image
  if (img && img.width > 0 && img.height > 0) {
    const scale = config.foregroundScale ?? 0.75;
    const offX = ((config.offsetX ?? 0) / 100) * targetSize;
    const offY = ((config.offsetY ?? 0) / 100) * targetSize;

    // Aspect ratio preserved fitting
    const imgAspect = img.width / img.height;
    let drawWidth = targetSize * scale;
    let drawHeight = drawWidth / imgAspect;

    if (drawHeight > targetSize * scale) {
      drawHeight = targetSize * scale;
      drawWidth = drawHeight * imgAspect;
    }

    const drawX = (targetSize - drawWidth) / 2 + offX;
    const drawY = (targetSize - drawHeight) / 2 + offY;

    if (config.enableMonochrome) {
      // Render in grayscale / monochrome filter
      ctx.filter = 'grayscale(100%) brightness(1.2)';
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    ctx.filter = 'none';
  }

  ctx.restore();

  // 3. Draw Safe Zone Guides if enabled and not applying mask
  if (config.showSafeZoneGuides && !applyMask) {
    ctx.save();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.75)';
    ctx.lineWidth = Math.max(1, targetSize / 100);
    ctx.setLineDash([Math.max(2, targetSize / 50), Math.max(2, targetSize / 50)]);

    // Safe inner circle (66dp out of 108dp viewport = ~61.1%)
    const safeRadius = (targetSize * 0.611) / 2;
    ctx.beginPath();
    ctx.arc(targetSize / 2, targetSize / 2, safeRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Viewport box (72dp out of 108dp = ~66.6%)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    const vpSize = targetSize * 0.666;
    const vpOffset = (targetSize - vpSize) / 2;
    ctx.strokeRect(vpOffset, vpOffset, vpSize, vpSize);

    // Crosshairs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(targetSize / 2, 0);
    ctx.lineTo(targetSize / 2, targetSize);
    ctx.moveTo(0, targetSize / 2);
    ctx.lineTo(targetSize, targetSize / 2);
    ctx.stroke();

    ctx.restore();
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Generates all mipmap density levels from a single source image and configuration
 */
export async function generateFullMipmapSet(
  imageSource: string,
  config: AdaptiveIconConfig
): Promise<GeneratedAdaptiveIconSet> {
  const img = await loadImage(imageSource);
  const canvas = document.createElement('canvas');

  const levels: MipmapLevelInfo[] = [];

  for (const spec of MIPMAP_SPECS) {
    renderAdaptiveIconToCanvas(canvas, img, config, spec.size, false);

    const dataUrl = canvas.toDataURL('image/png');
    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'));

    levels.push({
      ...spec,
      dataUrl,
      blob: blob || undefined,
      byteSize: blob?.size || Math.round((dataUrl.length * 3) / 4),
    });
  }

  // Also generate 512 for highRes
  renderAdaptiveIconToCanvas(canvas, img, config, 512, false);
  const highResDataUrl = canvas.toDataURL('image/png');
  const highResBlob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'));

  // Adaptive Icon XML definitions
  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher" />
    <monochrome android:drawable="@mipmap/ic_launcher" />
</adaptive-icon>`;

  const adaptiveRoundXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher" />
    <monochrome android:drawable="@mipmap/ic_launcher" />
</adaptive-icon>`;

  const backgroundXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${config.backgroundColor || '#0F172A'}</color>
</resources>`;

  return {
    levels,
    adaptiveXml,
    adaptiveRoundXml,
    backgroundXml,
    highResBlob: highResBlob || undefined,
    highResDataUrl,
  };
}

/**
 * Creates and triggers a download of a ZIP containing all generated mipmaps and XML files
 */
export async function downloadMipmapSetZip(
  iconSet: GeneratedAdaptiveIconSet,
  appName: string = 'app'
): Promise<void> {
  const zip = new JSZip();

  // Add each mipmap png
  for (const lvl of iconSet.levels) {
    if (lvl.blob) {
      zip.file(lvl.resPath, lvl.blob);
    }
  }

  // Add Adaptive XML definitions
  zip.file('res/mipmap-anydpi-v26/ic_launcher.xml', iconSet.adaptiveXml);
  zip.file('res/mipmap-anydpi-v26/ic_launcher_round.xml', iconSet.adaptiveRoundXml);
  zip.file('res/values/ic_launcher_background.xml', iconSet.backgroundXml);

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  const safeName = appName.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  a.download = `${safeName}_adaptive_icons_mipmap.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
