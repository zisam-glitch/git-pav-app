import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { api, type Product as ApiProduct } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { CartDrawer } from "./cart-drawer";
import type { CartItem, Product } from "./shop-data";
import { ShopCatalog } from "./shop-catalog";
import { ShopGuarantee } from "./shop-guarantee";
import { ShopHero } from "./shop-hero";

export function ShopPage() {
  const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);
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
          image: p.image || "",
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

  const handleAddToCart = (product: Product, quantity: number = 1, variant?: unknown) => {
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
    <div className="relative bg-white text-fg">
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

      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="fixed right-6 bottom-6 z-40 inline-flex h-12 items-center gap-2.5 rounded-pill bg-black px-5 text-label text-white shadow-card t-colors hover:bg-black/85"
        aria-label={`View shopping bag (${totalItemCount} items)`}
      >
        <div className="relative">
          <ShoppingBag aria-hidden className="size-5" />
          {totalItemCount > 0 ? (
            <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-pill bg-gold text-caption font-medium text-brown tabular-nums">
              {totalItemCount}
            </span>
          ) : null}
        </div>
        <span className="hidden sm:inline">View Bag ({totalItemCount})</span>
      </button>
    </div>
  );
}
