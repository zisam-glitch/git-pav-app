import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import type { Product, CartItem } from "./shop-data";
import { ShopHero } from "./shop-hero";
import { ShopCatalog } from "./shop-catalog";
import { ShopGuarantee } from "./shop-guarantee";
import { CartDrawer } from "./cart-drawer";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";

export function ShopPage() {
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      api.products
        .list()
        .then((data) => {
          setApiProducts(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching products:", err);
          setIsLoading(false);
        });
    }
  }, []);

  const productsToDisplay: Product[] =
    apiProducts && apiProducts.length > 0
      ? apiProducts.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          category: p.category || "dental-care",
          categoryLabel: p.category_label || "Dental Care",
          price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
          originalPrice: p.original_price
            ? typeof p.original_price === "string"
              ? parseFloat(p.original_price)
              : p.original_price
            : undefined,
          image:
            p.image ||
            "/media/hims/bento-whitening.jpg",
          shortDesc: p.short_desc || "",
          fullDesc: p.full_desc || "",
          features: Array.isArray(p.features) ? p.features : [],
          howToUse: p.how_to_use || "",
          badge: p.badge || undefined,
          inStock: p.in_stock,
        }))
      : [];

  const { items: storeItems, addItem, updateQuantity, removeItem, clearCart } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartDrawerItems: CartItem[] = storeItems.map((it) => ({
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

  const handleAddToCart = (product: Product, quantity: number = 1, variant?: any) => {
    addItem(product, quantity, variant);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const item = storeItems.find((i) => i.productId === productId);
    if (item) {
      updateQuantity(item.id, quantity);
    }
  };

  const handleRemoveItem = (productId: string) => {
    const item = storeItems.find((i) => i.productId === productId);
    if (item) {
      removeItem(item.id);
    }
  };

  const totalItemCount = storeItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="relative min-h-screen bg-[#FBF8F5] text-fg">
      <ShopHero />

      <ShopCatalog
        products={productsToDisplay}
        isLoading={isLoading}
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

      {/* Floating Bag Button */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-black px-5 py-3 text-white shadow-[0_12px_32px_rgba(0,0,0,0.2)] transition-colors duration-200 hover:bg-[#1B3745] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3745] focus-visible:ring-offset-2"
        aria-label="View shopping bag"
      >
        <div className="relative">
          <ShoppingBag className="size-4" />
          {totalItemCount > 0 && (
            <span className="absolute -top-2 -right-2.5 flex size-4 items-center justify-center rounded-full bg-[#ECD880] text-[10px] font-semibold text-[#1B3745]">
              {totalItemCount}
            </span>
          )}
        </div>
        <span className="hidden text-xs font-medium sm:inline">
          View Bag ({totalItemCount})
        </span>
      </button>
    </div>
  );
}
