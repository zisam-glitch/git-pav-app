import type { ProductVariant } from "@/lib/api";

export interface ProductClinicalSpec {
  activeIngredient: string;
  format: string;
  packSize: string;
  suitability: string;
  dispatchOrigin: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  shortDesc: string;
  fullDesc: string;
  features: string[];
  whatsIncluded?: string[];
  howToUse: string;
  clinicalSpec?: ProductClinicalSpec;
  badge?: string;
  inStock: boolean;
  totalStock?: number;
  variants?: ProductVariant[];
  relatedProducts?: Product[];
}

export interface ShopCategoryMeta {
  slug: string;
  name: string;
  shortTitle: string;
  accentWord: string;
  description: string;
  hoverTone: "terracotta" | "blue" | "copper" | "sky-gold";
  accentTone: "terracotta" | "sky" | "copper" | "clay";
  image: string;
}

export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
}
