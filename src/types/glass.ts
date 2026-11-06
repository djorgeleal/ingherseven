export interface TemperedGlassRef {
  id: string;
  brand: string;
  primaryModel: string;
  compatibleModels: string[];
  notes?: string;
  updatedAt: string;
}

export type BrandFilter =
  | 'Todas'
  | 'Apple'
  | 'Samsung'
  | 'Xiaomi'
  | 'Motorola'
  | 'Oppo'
  | 'Realme'
  | 'Vivo'
  | 'Nokia'
  | 'Sony'
  | 'Poco'
  | 'Alcatel'
  | 'BLU'
  | 'Lenovo'
  | 'LG'
  | 'Tecno'
  | 'Honor'
  | 'Huawei'
  | 'Infinix'
  | 'Google Pixel'
  | 'ZTE'
  | 'Otras'
  | string;

