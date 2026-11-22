import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, HAS_API_BASE } from "./api";

export interface CartStoreItem {
  id: string; // cart item id or temporary id
  productId: string;
  variantId?: string | null;
  name: string;
  slug: string;
  category?: string;
  categoryLabel?: string;
  image: string;
  unitPrice: number;
  quantity: number;
  itemTotal: number;
}

export interface AppliedDiscount {
  id: string;
  code: string;
  type: "percentage" | "fixed_amount";
  value: number;
}

interface CartState {
  sessionId: string;
  items: CartStoreItem[];
  appliedDiscount: AppliedDiscount | null;
  selectedShippingMethodId: string | null;
  isLoading: boolean;

  // Actions
  initSession: () => void;
  addItem: (product: any, quantity?: number, variant?: any) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyDiscount: (code: string) => Promise<{ success: boolean; message: string }>;
  removeDiscount: () => void;
  setShippingMethodId: (id: string) => void;
  syncCart: () => Promise<void>;

  // Computed values
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: (shippingCost: number) => number;
}

function getOrGenerateSessionId(): string {
  if (typeof window === "undefined") return "guest-ssr";
  let sid = localStorage.getItem("pav_cart_session_id");
  if (!sid) {
    // The only key to this bag, so it must be unguessable.
    sid = `guest_${crypto.randomUUID()}`;
    localStorage.setItem("pav_cart_session_id", sid);
  }
  return sid;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      sessionId: getOrGenerateSessionId(),
      items: [],
      appliedDiscount: null,
      selectedShippingMethodId: null,
      isLoading: false,

      initSession: () => {
        const sid = getOrGenerateSessionId();
        set({ sessionId: sid });
      },

      addItem: async (product, quantity = 1, variant = null) => {
        const state = get();
        const sid = state.sessionId || getOrGenerateSessionId();
        const unitPrice = variant?.price_override
          ? parseFloat(variant.price_override)
          : typeof product.price === "string"
            ? parseFloat(product.price)
            : product.price;

        const displayName = variant?.attributes
          ? `${product.name} (${Object.values(variant.attributes).join(", ")})`
          : product.name;

        // Optimistic update
        const existingIdx = state.items.findIndex(
          (it) =>
            it.productId === product.id && (variant ? it.variantId === variant.id : !it.variantId),
        );

        const nextItems = [...state.items];
        if (existingIdx > -1) {
          const prev = nextItems[existingIdx];
          const newQty = prev.quantity + quantity;
          nextItems[existingIdx] = {
            ...prev,
            quantity: newQty,
            itemTotal: prev.unitPrice * newQty,
          };
        } else {
          nextItems.push({
            id: `temp_${Date.now()}_${Math.random()}`,
            productId: product.id,
            variantId: variant?.id || null,
            name: displayName,
            slug: product.slug,
            image: product.image || "",
            unitPrice,
            quantity,
            itemTotal: unitPrice * quantity,
          });
        }

        set({ items: nextItems });

        // Remote sync when backend is configured
        if (!HAS_API_BASE) return;
        try {
          const result = await api.cart.addItem({
            productId: product.id,
            variantId: variant?.id || undefined,
            quantity,
            sessionId: sid,
          });

          // If successful, sync the cart to get the real item ID
          if (result.success) {
            await state.syncCart();
          }
        } catch {
          // Keep optimistic local bag state when remote cart is unreachable.
        }
      },

      updateQuantity: async (itemId, quantity) => {
        const state = get();
        if (quantity <= 0) {
          await state.removeItem(itemId);
          return;
        }

        const nextItems = state.items.map((it) =>
          it.id === itemId ? { ...it, quantity, itemTotal: it.unitPrice * quantity } : it,
        );
        set({ items: nextItems });

        if (!HAS_API_BASE) return;
        try {
          await api.cart.updateItem({
            itemId,
            quantity,
            sessionId: state.sessionId,
          });
        } catch {
          // Keep optimistic local bag state when remote cart is unreachable.
        }
      },

      removeItem: async (itemId) => {
        const state = get();
        const nextItems = state.items.filter((it) => it.id !== itemId);
        set({ items: nextItems });

        if (!HAS_API_BASE) return;
        try {
          await api.cart.removeItem({
            itemId,
            sessionId: state.sessionId,
          });
        } catch {
          // Keep optimistic local bag state when remote cart is unreachable.
        }
      },

      clearCart: async () => {
        const state = get();
        set({ items: [], appliedDiscount: null });

        if (!HAS_API_BASE) return;
        try {
          await api.cart.clear(state.sessionId);
        } catch {
          // Keep optimistic local bag state when remote cart is unreachable.
        }
      },

      applyDiscount: async (code: string) => {
        if (!code.trim()) return { success: false, message: "Code cannot be empty" };
        try {
          const res = await api.discounts.validate(code);
          if (res.valid && res.discount) {
            set({ appliedDiscount: res.discount });
            return { success: true, message: `Discount ${res.discount.code} applied!` };
          }
          return { success: false, message: res.message || "Invalid discount code" };
        } catch (err: any) {
          return { success: false, message: err.message || "Validation failed" };
        }
      },

      removeDiscount: () => {
        set({ appliedDiscount: null });
      },

      setShippingMethodId: (id: string) => {
        set({ selectedShippingMethodId: id });
      },

      syncCart: async () => {
        if (!HAS_API_BASE) return;
        const state = get();
        const sid = state.sessionId || getOrGenerateSessionId();
        set({ isLoading: true });
        try {
          const res = await api.cart.get(sid);
          if (res.items && res.items.length > 0) {
            set({
              items: res.items.map((it) => ({
                id: it.id,
                productId: it.productId,
                variantId: it.variantId,
                name: it.name,
                slug: it.slug,
                image: it.image,
                unitPrice: it.unitPrice,
                quantity: it.quantity,
                itemTotal: it.itemTotal,
              })),
            });
          }
        } catch {
          // Keep local bag items when remote cart sync is unavailable.
        } finally {
          set({ isLoading: false });
        }
      },

      getSubtotal: () => {
        const state = get();
        return state.items.reduce((sum, it) => sum + it.itemTotal, 0);
      },

      getDiscountAmount: () => {
        const state = get();
        const subtotal = state.getSubtotal();
        const disc = state.appliedDiscount;
        if (!disc) return 0;
        if (disc.type === "percentage") {
          return Math.round(((subtotal * disc.value) / 100) * 100) / 100;
        }
        return Math.min(subtotal, disc.value);
      },

      getTotal: (shippingCost: number) => {
        const state = get();
        const subtotal = state.getSubtotal();
        const discount = state.getDiscountAmount();
        return Math.max(0, Math.round((subtotal - discount + shippingCost) * 100) / 100);
      },
    }),
    {
      name: "pavdental_cart_storage",
      partialize: (state) => ({
        sessionId: state.sessionId,
        items: state.items,
        appliedDiscount: state.appliedDiscount,
        selectedShippingMethodId: state.selectedShippingMethodId,
      }),
    },
  ),
);
