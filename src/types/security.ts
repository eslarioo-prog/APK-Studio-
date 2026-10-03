export interface SecuritySettingsConfig {
  biometricEnabled: boolean;
  biometricStrength: 'strong' | 'weak';
  requireAuthOnStartup: boolean;
  requireAuthOnResume: boolean;
  lockTimeoutSeconds: number; // 0 = immediate, 30, 60, 300
  enableScreenshotProtection: boolean; // WindowManager.LayoutParams.FLAG_SECURE
  fallbackPinEnabled: boolean;
  pinLength: 4 | 6;
  configuredPin: string;
  maxPinAttempts: number;
  lockoutDurationMinutes: number;
  emergencyPasscode: string;
  promptTitleAr: string;
  promptTitleEn: string;
  promptSubtitleAr: string;
  promptSubtitleEn: string;
}

export const DEFAULT_SECURITY_SETTINGS: SecuritySettingsConfig = {
  biometricEnabled: true,
  biometricStrength: 'strong',
  requireAuthOnStartup: true,
  requireAuthOnResume: true,
  lockTimeoutSeconds: 0, // Immediate
  enableScreenshotProtection: false,
  fallbackPinEnabled: true,
  pinLength: 4,
  configuredPin: '1234',
  maxPinAttempts: 5,
  lockoutDurationMinutes: 5,
  emergencyPasscode: 'OVERRIDE_2026',
  promptTitleAr: 'مطلوب التحقق لفتح التطبيق',
  promptTitleEn: 'Authentication Required',
  promptSubtitleAr: 'المس مستشعر البصمة أو أدخل رمز PIN للمتابعة',
  promptSubtitleEn: 'Touch the fingerprint sensor or enter your PIN',
};
