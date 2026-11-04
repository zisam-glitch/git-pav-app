import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "./api";

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
  handleAuthChange: (isAuthenticated: boolean) => void;

  // Computed values
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: (shippingCost: number) => number;
}

function getOrGenerateSessionId(): string {
  if (typeof window === "undefined") return "guest-ssr";
  let sid = localStorage.getItem("pav_cart_session_id");
  if (!sid) {
    // The cart API finds a guest cart by this id alone, so it must be unguessable.
    sid = `guest_${crypto.randomUUID()}`;
    localStorage.setItem("pav_cart_session_id", sid);
  }
  return sid;
}

const hasUserToken = () => typeof window !== "undefined" && !!localStorage.getItem("user_token");

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
          (it) => it.productId === product.id && (variant ? it.variantId === variant.id : !it.variantId)
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
            image: product.image || "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=85",
            unitPrice,
            quantity,
            itemTotal: unitPrice * quantity,
          });
        }

        set({ items: nextItems });

        // Remote sync
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
        } catch (err) {
          console.error("Failed to sync add item to server:", err);
        }
      },

      updateQuantity: async (itemId, quantity) => {
        const state = get();
        if (quantity <= 0) {
          await state.removeItem(itemId);
          return;
        }

        const nextItems = state.items.map((it) =>
          it.id === itemId
            ? { ...it, quantity, itemTotal: it.unitPrice * quantity }
            : it
        );
        set({ items: nextItems });

        try {
          await api.cart.updateItem({
            itemId,
            quantity,
            sessionId: state.sessionId,
          });
        } catch (err) {
          console.error("Failed to sync update quantity to server:", err);
        }
      },

      removeItem: async (itemId) => {
        const state = get();
        const nextItems = state.items.filter((it) => it.id !== itemId);
        set({ items: nextItems });

        try {
          await api.cart.removeItem({
            itemId,
            sessionId: state.sessionId,
          });
        } catch (err) {
          console.error("Failed to sync remove item to server:", err);
        }
      },

      clearCart: async () => {
        const state = get();
        set({ items: [], appliedDiscount: null });

        try {
          await api.cart.clear(state.sessionId);
        } catch (err) {
          console.error("Failed to sync clear cart to server:", err);
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
          } else {
            // If cart is empty on server, keep local items but mark them as needing sync
            // This prevents losing items if the server cart was cleared unexpectedly
            console.log("Server cart is empty, keeping local items");
          }
        } catch (err) {
          console.warn("Could not sync remote cart:", err);
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
          return Math.round((subtotal * disc.value) / 100 * 100) / 100;
        }
        return Math.min(subtotal, disc.value);
      },

      getTotal: (shippingCost: number) => {
        const state = get();
        const subtotal = state.getSubtotal();
        const discount = state.getDiscountAmount();
        return Math.max(0, Math.round((subtotal - discount + shippingCost) * 100) / 100);
      },

      handleAuthChange: (isAuthenticated: boolean) => {
        const state = get();
        if (isAuthenticated && state.sessionId?.startsWith("guest_")) {
          // User just logged in, sync cart
          state.syncCart();
        }
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
    }
  )
);

