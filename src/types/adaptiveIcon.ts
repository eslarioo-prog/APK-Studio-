export type MipmapDensity = 'mdpi' | 'hdpi' | 'xhdpi' | 'xxhdpi' | 'xxxhdpi' | 'playstore';

export interface MipmapLevelInfo {
  density: MipmapDensity;
  name: string;
  size: number; // width & height in pixels (e.g. 48, 72, 96, 144, 192, 512)
  scale: string; // e.g. "1.0x", "1.5x", "2.0x", "3.0x", "4.0x", "Web Store"
  resPath: string; // e.g. "res/mipmap-mdpi/ic_launcher.png"
  dataUrl: string;
  blob?: Blob;
  byteSize: number;
}

export type IconShapeMask = 'squircle' | 'circle' | 'rounded' | 'teardrop' | 'none';

export interface AdaptiveIconConfig {
  foregroundScale: number; // 0.3 to 1.5, default 0.75
  offsetX: number; // -50 to 50 px
  offsetY: number; // -50 to 50 px
  backgroundType: 'color' | 'gradient' | 'transparent' | 'image';
  backgroundColor: string; // hex
  gradientColor2: string; // hex
  gradientAngle: number; // degrees 0-360
  shapeMask: IconShapeMask;
  showSafeZoneGuides: boolean;
  enableMonochrome: boolean;
  iconPadding: number; // 0-30%
}

export interface GeneratedAdaptiveIconSet {
  levels: MipmapLevelInfo[];
  adaptiveXml: string;
  adaptiveRoundXml: string;
  backgroundXml: string;
  highResBlob?: Blob;
  highResDataUrl: string;
}
