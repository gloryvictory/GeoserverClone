export interface GeoserverConfig {
  url: string;
  username: string;
  password: string;
}

export type SectionType = 'styles' | 'layers' | 'stores';

export interface StyleItem {
  name: string;
  href: string;
  filename?: string;
}

export interface LayerItem {
  name: string;
  href: string;
  type?: string;
}

export interface StoreItem {
  name: string;
  href: string;
  description?: string;
  status?: string;
}

export interface StyleDetail {
  name: string;
  filename?: string;
  mimetype?: string;
  store?: string;
  workspace?: string;
  sld?: string;
}
