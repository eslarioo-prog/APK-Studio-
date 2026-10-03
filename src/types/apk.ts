export interface ApkMetadata {
  appName: string;
  packageName: string;
  versionCode: number;
  versionName: string;
  minSdk: number;
  targetSdk: number;
  compileSdk: number;
  debuggable: boolean;
  allowBackup: boolean;
  usesCleartextTraffic: boolean;
  orientation: 'unspecified' | 'portrait' | 'landscape' | 'sensor';
  iconUrl: string;
  rawManifestXml: string;
  fileSize: number;
  fileName: string;
  uploadedAt: string;
  isRealApk: boolean;
}

export interface ApkPermission {
  name: string;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: 'dangerous' | 'normal' | 'tracking' | 'system';
  isEnabled: boolean;
  isCustom?: boolean;
}

export interface ApkStringResource {
  id: string;
  key: string;
  value: string;
  category?: string;
}

export interface ApkFileEntry {
  path: string;
  size: number;
  isDir: boolean;
  type: 'code' | 'image' | 'xml' | 'asset' | 'certificate' | 'audio' | 'other';
  rawEntry?: any;
  content?: string;
}

export interface CodePatch {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  category: 'security' | 'feature' | 'network' | 'ads';
  isApplied: boolean;
  patchCodeSnippet: string;
  affectedFile: string;
  originalCodeSnippet?: string;
  modifiedCodeSnippet?: string;
  diffExplanationAr?: string;
  diffExplanationEn?: string;
}

export interface OriginalSignatureBackup {
  savedAt: string;
  signerName: string;
  issuer: string;
  sha256: string;
  sha1: string;
  algorithm: string;
  serialNumber: string;
  validUntil: string;
  certFiles: {
    path: string;
    data: Uint8Array;
  }[];
  manifestMfContent?: string;
  certSfContent?: string;
}

export interface SigningConfig {
  signingMode: 'original_preserved' | 'debug' | 'custom';
  keystoreType: 'debug' | 'custom';
  alias: string;
  keystorePass: string;
  keyPass: string;
  v1Signing: boolean;
  v2Signing: boolean;
  zipAlign: boolean;
  preserveOriginalMetaInf: boolean;
}

export interface BuildLog {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}
