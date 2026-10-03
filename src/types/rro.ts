export type ResourceOverlayType = 'color' | 'dimen' | 'drawable' | 'string' | 'bool';

export interface ResourceOverlayItem {
  id: string;
  type: ResourceOverlayType;
  name: string; // e.g. "primary_brand_color", "window_background", "card_corner_radius"
  originalValue: string; // e.g. "#c9142c", "8dp"
  overlayValue: string; // e.g. "#10b981", "16dp"
  targetPackage: string;
  isEnabled: boolean;
  category?: string;
  descriptionAr?: string;
  descriptionEn?: string;
}

export interface RROThemePreset {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  accentColor: string;
  surfaceColor: string;
  badge: string;
  items: Omit<ResourceOverlayItem, 'id'>[];
}
