export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  image: string;
  shortDesc: string;
  fullDesc: string;
  features: string[];
  howToUse: string;
  badge?: string;
  inStock: boolean;
  variants?: any;
  relatedProducts?: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
