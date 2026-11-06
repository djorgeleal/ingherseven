export type GlassType = 
  | 'Vidrio 9D/11D Full Glue'
  | 'Cerámico Flexible'
  | 'Privacidad Antiespía'
  | 'Mate Gamer Antihuellas'
  | 'Cristal Transparente 2.5D'
  | 'UV Líquido Curvo 3D';

export type CutoutType = 
  | 'dynamic-island'
  | 'notch-classic'
  | 'waterdrop'
  | 'punch-hole'
  | 'punch-hole-pill'
  | 'none';

export type CurvatureType = '2.5D Biselado' | '3D Curvo' | 'Plano Total';

export interface TemperedGlassRef {
  id: string;
  sku: string;
  brand: string;
  primaryModel: string;
  compatibleModels: string[];
  glassType: GlassType;
  screenSize: string; // e.g. '6.1"'
  cutoutType: CutoutType;
  curvature: CurvatureType;
  thicknessMm: number; // e.g. 0.33
  location: string; // e.g. 'Gaveta A-04'
  stock: number;
  minStockAlert: number;
  wholesalePrice?: number;
  retailPrice?: number;
  notes?: string;
  updatedAt: string;
}

export type BrandFilter = 'Todas' | 'Apple' | 'Samsung' | 'Xiaomi' | 'Motorola' | 'Realme' | 'Honor' | 'Otras';
