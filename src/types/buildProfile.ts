import { SigningConfig } from './apk';

export interface ProfileManifestConfig {
  debuggable?: boolean;
  allowBackup?: boolean;
  usesCleartextTraffic?: boolean;
  orientation?: 'unspecified' | 'portrait' | 'landscape' | 'sensor';
  minSdk?: number;
  targetSdk?: number;
  packageNameSuffix?: string;
  appNameSuffix?: string;
}

export interface BuildProfile {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: 'offline' | 'debug' | 'security' | 'cloning' | 'custom' | 'production';
  isBuiltIn: boolean;
  createdAt: string;
  
  // Manifest adjustments
  manifest: ProfileManifestConfig;
  
  // Applied patch IDs
  appliedPatchIds: string[];
  
  // Signature settings
  signing: Partial<SigningConfig>;
  
  // Specific permissions to ensure are enabled or disabled
  permissionsToEnable?: string[];
  permissionsToDisable?: string[];
  
  // Offline & hardware features
  offlineFeatures?: {
    redirectLocalhost?: boolean;
    disableNetworkSecurity?: boolean;
    bundleCachedAssets?: boolean;
  };
}
