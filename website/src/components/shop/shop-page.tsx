import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { api, HAS_API_BASE, type Product as ApiProduct } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { CartDrawer } from "./cart-drawer";
import { mapApiProduct, SHOP_CATALOG_PRODUCTS } from "./shop-catalog-data";
import type { CartItem, Product } from "./shop-data";
import { ShopCatalog } from "./shop-catalog";
import { ShopGuarantee } from "./shop-guarantee";
import { ShopHero } from "./shop-hero";

export function ShopPage() {
  const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !HAS_API_BASE) {
      return;
    }
    let active = true;
    api.products
      .list()
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data) && data.length > 0) {
          setApiProducts(data);
        }
      })
      .catch(() => {
        // Fall back seamlessly to clinician-selected local catalogue.
      });
    return () => {
      active = false;
    };
  }, []);

  const productsToDisplay: Product[] =
    apiProducts.length > 0 ? apiProducts.map(mapApiProduct) : SHOP_CATALOG_PRODUCTS;

  const { items: storeItems, addItem, updateQuantity, removeItem, clearCart } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartDrawerItems: CartItem[] = storeItems.map((it) => ({
    id: it.id,
    product: {
      id: it.productId,
      slug: it.slug,
      name: it.name,
      category: it.category || "dental-care",
      categoryLabel: it.categoryLabel || "Dental Care",
      price: it.unitPrice,
      image: it.image,
      shortDesc: "",
      fullDesc: "",
      features: [],
      howToUse: "",
      inStock: true,
    },
    quantity: it.quantity,
  }));

  const handleAddToCart = (product: Product, quantity: number = 1, variant?: unknown) => {
    addItem(product, quantity, variant);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (itemOrProductId: string, quantity: number) => {
    const item =
      storeItems.find((i) => i.id === itemOrProductId) ||
      storeItems.find((i) => i.productId === itemOrProductId);
    if (item) {
      updateQuantity(item.id, quantity);
    }
  };

  const handleRemoveItem = (itemOrProductId: string) => {
    const item =
      storeItems.find((i) => i.id === itemOrProductId) ||
      storeItems.find((i) => i.productId === itemOrProductId);
    if (item) {
      removeItem(item.id);
    }
  };

  const totalItemCount = storeItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="relative bg-white text-fg">
      <ShopHero />

      <ShopCatalog
        products={productsToDisplay}
        isLoading={false}
        unavailable={false}
        onAddToCart={handleAddToCart}
      />

      <ShopGuarantee />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartDrawerItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={clearCart}
      />

      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="fixed right-6 bottom-6 z-40 inline-flex h-14 items-center gap-2.5 rounded-full bg-[#1b1b1b] px-6 text-[15px] font-medium text-white shadow-[0_10px_36px_rgba(20,20,40,0.22)] t-colors hover:bg-black"
        aria-label={`View shopping bag (${totalItemCount} items)`}
      >
        <div className="relative">
          <ShoppingBag aria-hidden className="size-5" />
          {totalItemCount > 0 ? (
            <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-[#f3f0a8] text-[12px] font-medium text-[#1b1b1b] tabular-nums">
              {totalItemCount}
            </span>
          ) : null}
        </div>
        <span className="hidden sm:inline">View Bag ({totalItemCount})</span>
      </button>
    </div>
  );
}
