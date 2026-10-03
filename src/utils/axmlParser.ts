/**
 * Android Binary XML (AXML) parser and string extractor for AndroidManifest.xml
 * Supports reading standard AXML format (magic 0x00080003) and plain XML fallback.
 */

export interface ParsedManifest {
  packageName: string;
  versionCode: number;
  versionName: string;
  minSdkVersion: number;
  targetSdkVersion: number;
  appName: string;
  debuggable: boolean;
  allowBackup: boolean;
  usesCleartextTraffic: boolean;
  permissions: string[];
  activities: string[];
  rawXml: string;
}

export function parseAxmlOrText(buffer: ArrayBuffer | Uint8Array): ParsedManifest {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  
  // Check if it's plain text XML (starts with '<' or whitespace)
  let isPlainText = false;
  for (let i = 0; i < Math.min(16, bytes.length); i++) {
    if (bytes[i] === 0x3c) { // '<'
      isPlainText = true;
      break;
    }
  }

  if (isPlainText) {
    const text = new TextDecoder('utf-8').decode(bytes);
    return parseTextManifest(text);
  }

  // Check AXML Magic (0x00080003 in Little Endian is 0x03, 0x00, 0x08, 0x00)
  if (bytes.length >= 8 && bytes[0] === 0x03 && bytes[1] === 0x00 && bytes[2] === 0x08 && bytes[3] === 0x00) {
    try {
      return parseBinaryAxml(bytes);
    } catch (e) {
      console.warn('Binary AXML parser fallback to string extraction:', e);
      return extractStringsFromBinary(bytes);
    }
  }

  // Fallback to string extraction
  return extractStringsFromBinary(bytes);
}

function parseTextManifest(xmlText: string): ParsedManifest {
  const packageMatch = xmlText.match(/package\s*=\s*["']([^"']+)["']/);
  const vCodeMatch = xmlText.match(/android:versionCode\s*=\s*["']([^"']+)["']/);
  const vNameMatch = xmlText.match(/android:versionName\s*=\s*["']([^"']+)["']/);
  const minSdkMatch = xmlText.match(/android:minSdkVersion\s*=\s*["']([^"']+)["']/);
  const targetSdkMatch = xmlText.match(/android:targetSdkVersion\s*=\s*["']([^"']+)["']/);
  const appLabelMatch = xmlText.match(/<application[^>]*android:label\s*=\s*["']([^"']+)["']/);
  const debuggableMatch = xmlText.match(/android:debuggable\s*=\s*["'](true|false)["']/i);
  const allowBackupMatch = xmlText.match(/android:allowBackup\s*=\s*["'](true|false)["']/i);
  const cleartextMatch = xmlText.match(/android:usesCleartextTraffic\s*=\s*["'](true|false)["']/i);

  // Extract all permissions
  const permissions: string[] = [];
  const permRegex = /<uses-permission[^>]*android:name\s*=\s*["']([^"']+)["']/g;
  let match;
  while ((match = permRegex.exec(xmlText)) !== null) {
    if (!permissions.includes(match[1])) {
      permissions.push(match[1]);
    }
  }

  // Extract activities
  const activities: string[] = [];
  const actRegex = /<activity[^>]*android:name\s*=\s*["']([^"']+)["']/g;
  while ((match = actRegex.exec(xmlText)) !== null) {
    if (!activities.includes(match[1])) {
      activities.push(match[1]);
    }
  }

  return {
    packageName: packageMatch ? packageMatch[1] : 'com.example.app',
    versionCode: vCodeMatch ? parseInt(vCodeMatch[1], 10) : 1,
    versionName: vNameMatch ? vNameMatch[1] : '1.0.0',
    minSdkVersion: minSdkMatch ? parseInt(minSdkMatch[1], 10) : 21,
    targetSdkVersion: targetSdkMatch ? parseInt(targetSdkMatch[1], 10) : 34,
    appName: appLabelMatch ? appLabelMatch[1].replace('@string/', '') : 'Android App',
    debuggable: debuggableMatch ? debuggableMatch[1].toLowerCase() === 'true' : false,
    allowBackup: allowBackupMatch ? allowBackupMatch[1].toLowerCase() === 'true' : true,
    usesCleartextTraffic: cleartextMatch ? cleartextMatch[1].toLowerCase() === 'true' : false,
    permissions,
    activities,
    rawXml: xmlText,
  };
}

/**
 * Parses binary Android XML (AXML) by extracting the String Pool and parsing chunks
 */
function parseBinaryAxml(bytes: Uint8Array): ParsedManifest {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  
  let pos = 8; // skip magic (4 bytes) and file size (4 bytes)
  const strings: string[] = [];
  
  // Find String Chunk (chunk type 0x001C0001)
  while (pos < bytes.length - 8) {
    const chunkType = view.getUint32(pos, true);
    const chunkSize = view.getUint32(pos + 4, true);
    
    if (chunkType === 0x001C0001) {
      // String pool chunk
      const stringCount = view.getUint32(pos + 8, true);
      const flags = view.getUint32(pos + 16, true);
      const isUtf8 = (flags & (1 << 8)) !== 0;
      const stringsStart = pos + view.getUint32(pos + 20, true);
      
      const stringOffsets: number[] = [];
      for (let i = 0; i < stringCount; i++) {
        stringOffsets.push(view.getUint32(pos + 28 + (i * 4), true));
      }

      for (let i = 0; i < stringCount; i++) {
        const offset = stringsStart + stringOffsets[i];
        if (offset < bytes.length) {
          if (isUtf8) {
            // Read UTF-8 string
            let len = bytes[offset];
            let actualOffset = offset + 1;
            if (len & 0x80) {
              actualOffset++;
            }
            let strBytes = bytes.slice(actualOffset, actualOffset + len);
            strings.push(new TextDecoder('utf-8').decode(strBytes));
          } else {
            // Read UTF-16LE string
            let len = view.getUint16(offset, true);
            let actualOffset = offset + 2;
            let strBytes = bytes.slice(actualOffset, actualOffset + (len * 2));
            strings.push(new TextDecoder('utf-16le').decode(strBytes));
          }
        }
      }
      break;
    }
    pos += chunkSize;
    if (chunkSize <= 0) break;
  }

  // Look through collected strings for package names, permissions, and values
  return extractInfoFromStrings(strings, bytes);
}

function extractStringsFromBinary(bytes: Uint8Array): ParsedManifest {
  const strings: string[] = [];
  let current: number[] = [];
  
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    // Printable ASCII
    if ((b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13) {
      current.push(b);
    } else {
      if (current.length >= 3) {
        strings.push(String.fromCharCode(...current));
      }
      current = [];
    }
  }
  if (current.length >= 3) {
    strings.push(String.fromCharCode(...current));
  }

  return extractInfoFromStrings(strings, bytes);
}

function extractInfoFromStrings(strings: string[], bytes: Uint8Array): ParsedManifest {
  let packageName = 'com.android.application';
  let versionName = '1.0.0';
  let versionCode = 1;
  let minSdk = 21;
  let targetSdk = 34;
  let appName = 'My Modified App';
  let debuggable = false;
  let allowBackup = true;
  let cleartext = false;
  const permissions: string[] = [];
  const activities: string[] = [];

  for (const s of strings) {
    // Package detection: contains dots and lowercase identifiers
    if (/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(s) && !s.startsWith('android.') && !s.startsWith('java.') && !s.startsWith('com.android.')) {
      if (packageName === 'com.android.application' || s.length < packageName.length) {
        packageName = s;
      }
    }

    // Version name detection
    if (/^\d+\.\d+(\.\d+)?(-[a-zA-Z0-9]+)?$/.test(s) && versionName === '1.0.0') {
      versionName = s;
    }

    // Permission detection
    if (s.startsWith('android.permission.') || s.includes('.permission.')) {
      if (!permissions.includes(s)) {
        permissions.push(s);
      }
    }

    // Activity detection
    if (s.endsWith('Activity') || s.endsWith('MainActivity')) {
      if (!activities.includes(s)) {
        activities.push(s);
      }
    }
  }

  // Generate clean reconstructed XML
  const rawXml = generateManifestXml({
    appName,
    packageName,
    versionCode,
    versionName,
    minSdkVersion: minSdk,
    targetSdkVersion: targetSdk,
    debuggable,
    allowBackup,
    usesCleartextTraffic: cleartext,
    permissions,
    activities: activities.length > 0 ? activities : [`${packageName}.MainActivity`],
  });

  return {
    packageName,
    versionCode,
    versionName,
    minSdkVersion: minSdk,
    targetSdkVersion: targetSdk,
    appName,
    debuggable,
    allowBackup,
    usesCleartextTraffic: cleartext,
    permissions,
    activities,
    rawXml,
  };
}

export function generateManifestXml(options: {
  appName: string;
  packageName: string;
  versionCode: number;
  versionName: string;
  minSdkVersion: number;
  targetSdkVersion: number;
  debuggable: boolean;
  allowBackup: boolean;
  usesCleartextTraffic: boolean;
  orientation?: string;
  permissions: string[];
  activities?: string[];
}): string {
  const permLines = options.permissions
    .map(p => `    <uses-permission android:name="${p}" />`)
    .join('\n');

  const mainActivity = (options.activities && options.activities[0]) || `${options.packageName}.MainActivity`;
  const orientationAttr = options.orientation && options.orientation !== 'unspecified'
    ? `\n            android:screenOrientation="${options.orientation}"`
    : '';

  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${options.packageName}"
    android:versionCode="${options.versionCode}"
    android:versionName="${options.versionName}">

    <uses-sdk
        android:minSdkVersion="${options.minSdkVersion}"
        android:targetSdkVersion="${options.targetSdkVersion}" />

${permLines}

    <application
        android:allowBackup="${options.allowBackup ? 'true' : 'false'}"
        android:debuggable="${options.debuggable ? 'true' : 'false'}"
        android:usesCleartextTraffic="${options.usesCleartextTraffic ? 'true' : 'false'}"
        android:icon="@mipmap/ic_launcher"
        android:label="${options.appName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <activity
            android:name="${mainActivity}"
            android:exported="true"${orientationAttr}>
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>
</manifest>`;
}
