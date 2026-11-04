// Base API URL pointing to the Admin Dashboard (default http://localhost:3000 in dev)
export const API_BASE =
  (typeof window !== "undefined" && (window as any).__ENV__?.VITE_API_BASE_URL) ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3000";

// The shop no longer has accounts: clear a session left by an earlier visit.
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("user_token");
  } catch {
    // Storage can be blocked; nothing reads this value any more.
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> || {}),
  };
  
  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMessage = `API Error ${res.status}`;
    try {
      const errJson = await res.json();
      errMessage = errJson.error || errMessage;
    } catch {
      // ignore
    }
    throw new Error(errMessage);
  }

  return res.json() as Promise<T>;
}

export interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id?: string;
  category: string;
  category_label: string;
  category_name?: string | null;
  category_slug?: string | null;
  price: number;
  original_price?: number | null;
  rating: number;
  reviews_count: number;
  image?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  relatedProducts?: Product[];
  short_desc: string;
  full_desc: string;
  features: string[];
  how_to_use: string;
  badge?: string | null;
  in_stock: boolean;
  published: boolean;
  variant_count?: number;
  total_stock?: number;
}

/** A dentist staff chose to show on the team page (edited on the dashboard). */
export interface PublicDentist {
  id: string;
  fullName: string;
  gdcNumber: string;
  roleTitle: string | null;
  specialisms: string[];
  bio: string | null;
  photoUrl: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  body: string | null;
  author: string;
  category: string | null;
  tags: string[];
  published: boolean;
  published_at: string | null;
  created_at: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  color: "bronze" | "silver" | "gold";
  monthly_price: number;
  yearly_price: number;
  features: Array<{ text: string; included: boolean }>;
  is_popular: boolean;
  badge?: string | null;
  sort_order: number;
}

export interface FeeItem {
  id: string;
  category_id: string;
  name: string;
  fee: string;
  sort_order: number;
}

export interface FeeCategory {
  id?: string;
  name: string;
  category?: string;
  sort_order?: number;
  items: FeeItem[];
}

export interface Announcement {
  id: string;
  title: string | null;
  body: string;
  cta_text: string | null;
  cta_url: string | null;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  parent_name: string | null;
  parent_slug: string | null;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  children?: Category[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  attributes: Record<string, string>;
  price_override: number | null;
  stock_qty: number;
  is_active: boolean;
}

export interface PricingData {
  plans: PricingPlan[];
  feeSchedule: FeeCategory[];
  announcements: Announcement[];
}

export interface BookingFormData {
  patient_name: string;
  patient_email: string;
  patient_phone?: string;
  service_type: string;
  preferred_date?: string;
  preferred_time?: string;
  message?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface VacancyFormData {
  name: string;
  email: string;
  phone?: string;
  position: string;
  experience?: string;
  message?: string;
}

export interface PetitionFormData {
  name: string;
  email: string;
  message?: string;
}

export const api = {
  products: {
    list: (params?: { category?: string; search?: string; sort?: string; min_price?: number; max_price?: number }) => {
      const query = new URLSearchParams();
      if (params?.category) query.set("category", params.category);
      if (params?.search) query.set("search", params.search);
      if (params?.sort) query.set("sort", params.sort);
      if (params?.min_price !== undefined) query.set("min_price", params.min_price.toString());
      if (params?.max_price !== undefined) query.set("max_price", params.max_price.toString());
      const qs = query.toString();
      return apiFetch<Product[]>(`/api/v1/products${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => apiFetch<Product>(`/api/v1/products/${id}`),
    getBySlug: (slug: string) => apiFetch<Product>(`/api/v1/products/by-slug/${slug}`),
  },
  categories: {
    list: () => apiFetch<Category[]>("/api/v1/categories"),
  },
  cart: {
    get: (sessionId?: string) => {
      const qs = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : "";
      return apiFetch<{ cart: any; items: any[]; total: number }>(`/api/v1/cart${qs}`);
    },
    addItem: (data: { productId: string; variantId?: string; quantity: number; sessionId?: string }) =>
      apiFetch<any>("/api/v1/cart/items", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateItem: (data: { itemId: string; quantity: number; sessionId?: string }) =>
      apiFetch<any>("/api/v1/cart/items", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    removeItem: (data: { itemId: string; sessionId?: string }) =>
      apiFetch<any>("/api/v1/cart/items", {
        method: "DELETE",
        body: JSON.stringify(data),
      }),
    clear: (sessionId?: string) =>
      apiFetch<any>("/api/v1/cart", {
        method: "DELETE",
        body: JSON.stringify({ sessionId }),
      }),
  },
  shipping: {
    list: () => apiFetch<any[]>("/api/v1/shipping?is_active=true"),
  },
  discounts: {
    validate: (code: string) =>
      apiFetch<{ valid: boolean; discount?: any; message?: string }>(
        `/api/v1/discounts/validate?code=${encodeURIComponent(code)}`
      ),
  },
  checkout: {
    createSession: (data: any) =>
      apiFetch<{ url?: string; sessionId?: string; orderId: string; total?: number }>("/api/v1/checkout", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getOrder: (id: string, access?: string) =>
      apiFetch<any>(`/api/v1/orders/${id}${access ? `?access=${encodeURIComponent(access)}` : ""}`),
  },
  dentists: {
    list: () => apiFetch<PublicDentist[]>("/api/v1/dentists"),
  },
  blogs: {
    list: () => apiFetch<BlogPost[]>("/api/v1/blogs"),
    get: (slug: string) => apiFetch<BlogPost>(`/api/v1/blogs/${slug}`),
  },
  pricing: {
    get: () => apiFetch<PricingData>("/api/v1/pricing"),
  },
  announcements: {
    list: () => apiFetch<Announcement[]>("/api/v1/announcements"),
  },
  forms: {
    submitBooking: (data: BookingFormData) =>
      apiFetch<{ success: boolean; id: string }>("/api/v1/bookings", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    submitContact: (data: ContactFormData) =>
      apiFetch<{ success: boolean; id: string }>("/api/v1/forms/contact", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    submitVacancy: (data: VacancyFormData) =>
      apiFetch<{ success: boolean; id: string }>("/api/v1/forms/vacancy", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    submitPetition: (data: PetitionFormData) =>
      apiFetch<{ success: boolean; id: string }>("/api/v1/forms/petition", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    subscribeNewsletter: (data: { email: string; name?: string }) =>
      apiFetch<{ success: boolean }>("/api/v1/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};

