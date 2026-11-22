import type { Product as ApiProduct } from "@/lib/api";
import type { Product, ShopCategoryMeta } from "./shop-data";

export const SHOP_DISPATCH_ADDRESS = "786 Leeds Road, Bradford, BD3 9TY";
export const FREE_UK_DELIVERY_THRESHOLD = 40;
export const STANDARD_UK_DELIVERY_FEE = 3.99;

export const SHOP_CATEGORIES: ShopCategoryMeta[] = [
  {
    slug: "teeth-whitening",
    name: "Teeth Whitening",
    shortTitle: "Teeth",
    accentWord: "Whitening",
    description:
      "Clinic-approved whitening strips, top-up syringes for custom trays, and enamel-safe sensitivity care.",
    hoverTone: "terracotta",
    accentTone: "terracotta",
    image: "/images/generated/whitening-strips.jpg",
  },
  {
    slug: "toothbrushes",
    name: "Electric Toothbrushes",
    shortTitle: "Electric",
    accentWord: "Toothbrushes",
    description:
      "High-frequency acoustic sonic toothbrushes and gentle replacement heads for plaque control.",
    hoverTone: "blue",
    accentTone: "sky",
    image: "/images/generated/oral-hygiene-hero.jpg",
  },
  {
    slug: "toothpaste",
    name: "Toothpaste",
    shortTitle: "Enamel",
    accentWord: "Toothpaste",
    description:
      "Daily remineralising fluoride formulations selected to strengthen enamel and calm sensitivity.",
    hoverTone: "copper",
    accentTone: "copper",
    image: "/images/generated/shop-hero.jpg",
  },
  {
    slug: "denture-care",
    name: "Denture Care",
    shortTitle: "Denture",
    accentWord: "Care",
    description:
      "Non-abrasive daily cleansing solutions and dual-head brushes formulated for acrylic and flexible dentures.",
    hoverTone: "sky-gold",
    accentTone: "clay",
    image: "/images/generated/dentures-hero.jpg",
  },
  {
    slug: "dental-floss",
    name: "Dental Floss",
    shortTitle: "Interdental",
    accentWord: "Floss",
    description:
      "Shred-resistant waxed floss and colour-coded interdental brushes for thorough gumline cleaning.",
    hoverTone: "copper",
    accentTone: "copper",
    image: "/images/generated/oral-hygiene-showcase.jpg",
  },
  {
    slug: "mouthwash",
    name: "Mouthwash",
    shortTitle: "Daily",
    accentWord: "Mouthwash",
    description:
      "Alcohol-free daily oral rinses formulated to support healthy gums and long-lasting fresh breath.",
    hoverTone: "blue",
    accentTone: "sky",
    image: "/images/generated/cosmetic-hero.jpg",
  },
];

export const HERO_CATEGORY_SLUGS = [
  "teeth-whitening",
  "toothbrushes",
  "toothpaste",
  "denture-care",
] as const;

export const SHOP_CATALOG_PRODUCTS: Product[] = [
  {
    id: "pav-acoustic-sonic-toothbrush",
    slug: "acoustic-sonic-toothbrush",
    name: "Acoustic Sonic Toothbrush",
    category: "toothbrushes",
    categoryLabel: "Electric Toothbrushes",
    price: 49.0,
    image: "/images/generated/oral-hygiene-hero.jpg",
    images: [
      "/images/generated/oral-hygiene-hero.jpg",
      "/images/generated/shop-hero.jpg",
      "/images/generated/oral-hygiene-showcase.jpg",
    ],
    badge: "Clinician Pick",
    shortDesc:
      "38,000-stroke acoustic sonic toothbrush with built-in 2-minute quadrant timer and sensitive gum mode.",
    fullDesc:
      "Selected by our Bradford clinical team for thorough yet gentle plaque removal. Five brushing modes—including Sensitive and Gum Care—pair with ultra-soft tapered filaments and a 30-second quadrant pacer to support consistent twice-daily hygiene.",
    features: [
      "Up to 38,000 acoustic vibrations per minute for effective plaque disruption",
      "5 clinical brushing modes: Clean, Sensitive, Polish, Gum Care, and Deep Clean",
      "Smart 2-minute timer with 30-second quadrant interval pulses",
      "IPX7 waterproof handle with USB-C rechargeable 30-day battery",
    ],
    whatsIncluded: [
      "1 × Acoustic Sonic Toothbrush handle",
      "2 × Ultra-soft tapered replacement brush heads",
      "1 × Protective ventilated travel case",
      "1 × USB-C charging cable and instruction card",
    ],
    howToUse:
      "Apply a pea-sized amount of fluoride toothpaste, place the bristles at a 45-degree angle to the gumline, and glide gently across each quadrant for 30 seconds without pressing down. Rinse the head thoroughly after each use.",
    clinicalSpec: {
      activeIngredient: "DuPont ultra-soft rounded nylon filaments",
      format: "Rechargeable sonic toothbrush kit",
      packSize: "1 handle + 2 heads + travel case",
      suitability: "Adults and teens (12+), safe for veneers, crowns, and sensitive gums",
      dispatchOrigin: SHOP_DISPATCH_ADDRESS,
    },
    inStock: true,
    totalStock: 34,
    variants: [
      {
        id: "var-sonic-chalk",
        product_id: "pav-acoustic-sonic-toothbrush",
        sku: "PAV-SONIC-CHK",
        attributes: { Finish: "Matte Chalk White" },
        price_override: null,
        stock_qty: 20,
        is_active: true,
      },
      {
        id: "var-sonic-slate",
        product_id: "pav-acoustic-sonic-toothbrush",
        sku: "PAV-SONIC-SLT",
        attributes: { Finish: "Graphite Slate" },
        price_override: null,
        stock_qty: 14,
        is_active: true,
      },
    ],
  },
  {
    id: "pav-sensitive-replacement-brush-heads",
    slug: "sensitive-replacement-brush-heads",
    name: "Replacement Sonic Brush Heads (4-Pack)",
    category: "toothbrushes",
    categoryLabel: "Electric Toothbrushes",
    price: 16.0,
    image: "/images/generated/oral-hygiene-showcase.jpg",
    images: [
      "/images/generated/oral-hygiene-showcase.jpg",
      "/images/generated/oral-hygiene-hero.jpg",
    ],
    shortDesc:
      "Full year supply of 4 soft-tapered acoustic replacement heads with colour-fade wear indicators.",
    fullDesc:
      "Dentists recommend replacing your toothbrush head every 3 months—or sooner if bristles splay. This 4-pack provides a full 12-month rotation of precision-rounded bristles designed to clean along the gingival margin without irritating sensitive tissue.",
    features: [
      "4 individually sealed hygienic replacement heads (12-month supply)",
      "Precision end-rounded filaments protect enamel and recessed gums",
      "Blue wear-indicator bristles fade when replacement is due",
      "Snap-fit collar compatible with the Pav Dental Acoustic Sonic Toothbrush",
    ],
    whatsIncluded: [
      "4 × Replacement sonic brush heads",
      "4 × Individual hygienic protective caps",
    ],
    howToUse:
      "Pull the used head straight off the metal shaft and press a fresh replacement head firmly into place until seated. Replace every 3 months or after an illness.",
    clinicalSpec: {
      activeIngredient: "End-rounded tapered filaments with indicator dyes",
      format: "Snap-on replacement brush heads",
      packSize: "4 heads per box (12-month supply)",
      suitability: "Daily use for sensitive gums, implants, and orthodontic retainers",
      dispatchOrigin: SHOP_DISPATCH_ADDRESS,
    },
    inStock: true,
    totalStock: 60,
    variants: [
      {
        id: "var-heads-soft",
        product_id: "pav-sensitive-replacement-brush-heads",
        sku: "PAV-HEADS-SFT",
        attributes: { Bristle: "Ultra-Soft Sensitive" },
        price_override: null,
        stock_qty: 38,
        is_active: true,
      },
      {
        id: "var-heads-daily",
        product_id: "pav-sensitive-replacement-brush-heads",
        sku: "PAV-HEADS-DLY",
        attributes: { Bristle: "Daily Medium Clean" },
        price_override: null,
        stock_qty: 22,
        is_active: true,
      },
    ],
  },
  {
    id: "pav-professional-whitening-strips-14-day",
    slug: "professional-whitening-strips-14-day",
    name: "14-Day Teeth Whitening Strips",
    category: "teeth-whitening",
    categoryLabel: "Teeth Whitening",
    price: 65.0,
    image: "/images/generated/whitening-strips.jpg",
    images: [
      "/images/generated/whitening-strips.jpg",
      "/images/generated/home-card-whitening.jpg",
      "/images/generated/whitening-home-kit.jpg",
    ],
    badge: "Clinic Best-Seller",
    shortDesc:
      "Enamel-safe PAP+ whitening strips for a 14-day at-home brightening course with low sensitivity.",
    fullDesc:
      "Matches our in-clinic 14-day whitening strip programme (£65). Formulated with PAP+ (phthalimidoperoxycaproic acid) and hydroxyapatite to lift everyday tea, coffee, and wine staining cleanly without harsh peroxide irritation.",
    features: [
      "14-day complete course (28 upper and lower dry-grip strips)",
      "Peroxide-free PAP+ active brightening complex with nano-hydroxyapatite",
      "Non-slip dry-fit contour hugs teeth comfortably for 30 minutes",
      "Same clinical strip course offered at our Bradford dental practice",
    ],
    whatsIncluded: [
      "14 × Foil pouches (1 upper + 1 lower strip per pouch, 28 strips total)",
      "1 × Printed shade progression guide",
      "1 × Clinician aftercare & dietary guidance leaflet",
    ],
    howToUse:
      "Dry teeth gently with a tissue before applying. Peel and align the longer strip to the upper teeth and the shorter strip to the lower teeth along the gumline. Wear for 30 minutes, remove, and rinse away any residual gel. Repeat daily for 14 days.",
    clinicalSpec: {
      activeIngredient: "PAP+ complex, potassium citrate, hydroxyapatite",
      format: "Dry-grip whitening strips",
      packSize: "14 pouches (28 individual strips)",
      suitability: "Adults 18+ with natural teeth (does not lighten crowns or veneers)",
      dispatchOrigin: SHOP_DISPATCH_ADDRESS,
    },
    inStock: true,
    totalStock: 42,
  },
  {
    id: "pav-whitening-top-up-syringe-single",
    slug: "whitening-top-up-syringe-single",
    name: "Whitening Top-Up Syringe (Single)",
    category: "teeth-whitening",
    categoryLabel: "Teeth Whitening",
    price: 45.0,
    image: "/images/generated/whitening-home-kit.jpg",
    images: [
      "/images/generated/whitening-home-kit.jpg",
      "/images/generated/whitening-home-in-office.jpg",
    ],
    badge: "Clinic Formula",
    shortDesc:
      "Single clinician-dispensed whitening maintenance syringe designed for custom-fitted bleaching trays.",
    fullDesc:
      "Maintain your professional shade between dental visits. Priced identically to our Bradford clinic fee schedule (£45), each precision-dosed syringe delivers calibrated maintenance gel for patients who already own custom-fitted whitening trays.",
    features: [
      "Precision luer-tip syringe for controlled, mess-free tray dosing",
      "High-viscosity formula stays securely in custom trays without seeping",
      "Contains soothing potassium nitrate and fluoride to support enamel comfort",
      "Clinician-checked before dispatch from Pav Dental Bradford",
    ],
    whatsIncluded: [
      "1 × Precision-sealed whitening top-up syringe (3 ml)",
      "1 × Dispensing applicator tip",
      "1 × Tray dosing & storage instruction card",
    ],
    howToUse:
      "Brush and floss before use. Place a small grain-of-rice dot of gel into the front inner face of each tooth compartment in your custom tray. Seat trays gently, wipe away any excess gel from gums, and wear for the duration advised by your dentist. Store cool and dry.",
    clinicalSpec: {
      activeIngredient: "Clinic-dispensed maintenance gel with desensitising agents",
      format: "Precision 3 ml maintenance syringe",
      packSize: "1 × 3 ml syringe (approx. 3–4 top-up applications)",
      suitability: "Adults 18+ with existing dentist-fitted custom whitening trays",
      dispatchOrigin: SHOP_DISPATCH_ADDRESS,
    },
    inStock: true,
    totalStock: 26,
  },
  {
    id: "pav-whitening-top-up-syringe-4-pack",
    slug: "whitening-top-up-syringe-4-pack",
    name: "Whitening Top-Up Syringes (Pack of 4)",
    category: "teeth-whitening",
    categoryLabel: "Teeth Whitening",
    price: 95.0,
    image: "/images/generated/whitening-home-in-office.jpg",
    images: [
      "/images/generated/whitening-home-in-office.jpg",
      "/images/generated/whitening-home-kit.jpg",
      "/images/generated/home-tile-whitening.jpg",
    ],
    badge: "Best Value",
    shortDesc:
      "Four clinician-dispensed maintenance syringes for year-round brightness with custom whitening trays.",
    fullDesc:
      "Our best-value maintenance pack—matching our published Bradford clinic fee (£95 vs £180 bought individually). Ideal for quarterly shade refreshers or completing a full maintenance cycle with your existing dentist-made whitening trays.",
    features: [
      "4 × 3 ml maintenance syringes—saves £85 compared with single syringes",
      "Enough gel for up to 12–16 controlled custom-tray top-up sessions",
      "Balanced pH and desensitising excipients minimise post-treatment zings",
      "Dispensed fresh with batch traceability from Pav Dental Bradford",
    ],
    whatsIncluded: [
      "4 × Sealed whitening maintenance syringes (3 ml each)",
      "4 × Precision dosing applicator tips",
      "1 × Maintenance schedule & clinical aftercare guide",
    ],
    howToUse:
      "Apply one small dot per tooth compartment inside clean, dry custom trays. Wipe excess gel away from the gumline immediately. Rinse trays with cool water after removal and store unused syringes in a cool place away from direct heat.",
    clinicalSpec: {
      activeIngredient: "Clinic-dispensed maintenance gel with fluoride & potassium nitrate",
      format: "Multi-pack 4 × 3 ml precision syringes",
      packSize: "4 syringes (12 ml total)",
      suitability: "Adults 18+ with dentist-fitted custom trays",
      dispatchOrigin: SHOP_DISPATCH_ADDRESS,
    },
    inStock: true,
    totalStock: 18,
  },
  {
    id: "pav-enamel-repair-fluoride-toothpaste",
    slug: "enamel-repair-fluoride-toothpaste",
    name: "Enamel Care Fluoride Toothpaste",
    category: "toothpaste",
    categoryLabel: "Toothpaste",
    price: 9.5,
    image: "/images/generated/shop-hero.jpg",
    images: [
      "/images/generated/shop-hero.jpg",
      "/images/generated/oral-hygiene-hero.jpg",
    ],
    shortDesc:
      "Low-abrasion 1450 ppm fluoride and hydroxyapatite daily toothpaste for enamel protection and fresh mint comfort.",
    fullDesc:
      "Formulated to support UK preventive dental guidance with 1450 ppm sodium fluoride and micro-hydroxyapatite. Gentle silica polishing agents lift daily surface film without scratching natural enamel or composite bonding.",
    features: [
      "1450 ppm fluoride aligns with NHS & UK adult preventive recommendations",
      "Low-abrasion formula safe for composite bonding, veneers, and sensitive teeth",
      "SLS-free mild foam reduces irritation for delicate oral mucosa",
      "Crisp natural spearmint finish without artificial colourants",
    ],
    whatsIncluded: [
      "75 ml recyclable aluminium-barrier tube",
      "Flip-cap hygienic seal",
    ],
    howToUse:
      "Brush thoroughly for 2 minutes twice daily using a pea-sized amount. Spit out excess foam without rinsing with water immediately afterwards so the fluoride remains active on enamel.",
    clinicalSpec: {
      activeIngredient: "Sodium Fluoride (1450 ppm F), Hydroxyapatite, Xylitol",
      format: "SLS-free low-abrasion cream paste",
      packSize: "75 ml tube (or Twin Pack 2 × 75 ml)",
      suitability: "Adults and children aged 7+; safe for veneers and composite bonding",
      dispatchOrigin: SHOP_DISPATCH_ADDRESS,
    },
    inStock: true,
    totalStock: 75,
    variants: [
      {
        id: "var-paste-single",
        product_id: "pav-enamel-repair-fluoride-toothpaste",
        sku: "PAV-PASTE-75",
        attributes: { Size: "Single Tube (75 ml)" },
        price_override: null,
        stock_qty: 45,
        is_active: true,
      },
      {
        id: "var-paste-twin",
        product_id: "pav-enamel-repair-fluoride-toothpaste",
        sku: "PAV-PASTE-150",
        attributes: { Size: "Twin Pack (2 × 75 ml)" },
        price_override: 17.0,
        stock_qty: 30,
        is_active: true,
      },
    ],
  },
  {
    id: "pav-daily-gum-care-mouthwash",
    slug: "daily-gum-care-mouthwash",
    name: "Alcohol-Free Daily Gum Mouthwash",
    category: "mouthwash",
    categoryLabel: "Mouthwash",
    price: 8.5,
    image: "/images/generated/cosmetic-hero.jpg",
    images: [
      "/images/generated/cosmetic-hero.jpg",
      "/images/generated/oral-hygiene-showcase.jpg",
    ],
    shortDesc:
      "Soothing alcohol-free fluoride and zinc mouthwash designed to calm tender gums and neutralise odour.",
    fullDesc:
      "An everyday alcohol-free oral rinse built for comfortable daily use without stinging or drying oral tissues. Pairs gentle CPC and zinc salts with 225 ppm fluoride to freshen breath between meals and support gumline cleanliness.",
    features: [
      "Zero alcohol—gentle on dry mouths, sensitive gums, and post-hygiene care",
      "Zinc citrate neutralises volatile sulphur compounds for clean breath",
      "225 ppm fluoride ideal for midday rinsing after lunch or coffee",
      "Balanced pH helps buffer dietary acids between brushings",
    ],
    whatsIncluded: [
      "500 ml bottle with tamper-evident dosing cap",
    ],
    howToUse:
      "Use at a separate time from brushing (such as after lunch) so you do not wash away concentrated toothpaste fluoride. Swish 15 ml around the teeth and gums for 30 seconds, then spit out. Do not swallow.",
    clinicalSpec: {
      activeIngredient: "Sodium Fluoride (225 ppm F), Zinc Citrate, Xylitol",
      format: "Alcohol-free daily oral rinse",
      packSize: "500 ml bottle (approx. 33 rinses)",
      suitability: "Adults and teens (12+); suitable for sensitive or dry mouths",
      dispatchOrigin: SHOP_DISPATCH_ADDRESS,
    },
    inStock: true,
    totalStock: 52,
  },
  {
    id: "pav-interdental-precision-floss-kit",
    slug: "interdental-precision-floss-kit",
    name: "Waxed Dental Floss & Interdental Brushes",
    category: "dental-floss",
    categoryLabel: "Dental Floss",
    price: 11.0,
    image: "/images/generated/oral-hygiene-showcase.jpg",
    images: [
      "/images/generated/oral-hygiene-showcase.jpg",
      "/images/generated/shop-hero.jpg",
    ],
    shortDesc:
      "Complete interdental starter kit combining shred-resistant waxed tape with mixed-size interdental brushes.",
    fullDesc:
      "Toothbrushes only reach around 60% of tooth surfaces. This clinician-assembled interdental kit pairs smooth waxed dental tape for tight contacts with plastic-coated wire interdental brushes across 4 everyday ISO sizes to keep gums healthy.",
    features: [
      "50 m shred-resistant mint waxed tape glides cleanly through tight contacts",
      "16 mixed-size interdental brushes (0.4 mm, 0.45 mm, 0.5 mm, 0.6 mm)",
      "Plastic-coated stainless wire protects crowns, implants, and enamel",
      "Hygienic ventilated caps extend handle length for back molars",
    ],
    whatsIncluded: [
      "1 × 50 m dispenser of waxed mint dental tape",
      "16 × Colour-coded interdental brushes (4 sizes × 4 brushes)",
      "1 × Hygienic travel pouch",
    ],
    howToUse:
      "Clean between teeth once daily before brushing. Gently ease the correct-sized interdental brush into each gap without forcing; use the waxed tape where contacts are tightest, curving in a C-shape around each tooth.",
    clinicalSpec: {
      activeIngredient: "Waxed PTFE-free nylon tape + coated wire brushes",
      format: "Combined floss & interdental brush kit",
      packSize: "50 m tape + 16 mixed brushes",
      suitability: "Daily gum care, bridges, implants, and tight interproximal spaces",
      dispatchOrigin: SHOP_DISPATCH_ADDRESS,
    },
    inStock: true,
    totalStock: 48,
  },
  {
    id: "pav-antibacterial-denture-cleansing-kit",
    slug: "antibacterial-denture-cleansing-kit",
    name: "Daily Denture Cleansing & Brush Kit",
    category: "denture-care",
    categoryLabel: "Denture Care",
    price: 14.5,
    image: "/images/generated/dentures-hero.jpg",
    images: [
      "/images/generated/dentures-hero.jpg",
      "/images/generated/dentures-showcase.jpg",
    ],
    shortDesc:
      "Non-abrasive effervescent cleansing tablets, vented soaking bath, and ergonomic dual-head denture brush.",
    fullDesc:
      "Regular toothpaste can scratch denture acrylic, trapping plaque and odour. Our complete denture hygiene kit pairs a gentle non-bleaching daily effervescent soak with a contoured two-sided brush and ventilated soaking bath to keep appliances clear and comfortable.",
    features: [
      "Non-abrasive formula cleans without scratching acrylic or cobalt-chrome bases",
      "Dual-head brush reaches both flat surfaces and deep inner clasps",
      "Draining basket inside the soaking bath allows hygienic lift-out rinsing",
      "Suitable for full dentures, partial dentures, nightguards, and retainers",
    ],
    whatsIncluded: [
      "30 × Daily non-abrasive effervescent cleansing tablets",
      "1 × Ergonomic dual-head denture brush",
      "1 × Vented denture soaking bath with removable rinse basket",
    ],
    howToUse:
      "Rinse dentures under lukewarm (never boiling) water after meals. Brush gently with the dual-head brush, then soak overnight or for 15 minutes in lukewarm water with one dissolved tablet. Rinse thoroughly before wearing.",
    clinicalSpec: {
      activeIngredient: "Peroxide-gentle effervescent oxygenating cleansers",
      format: "3-piece daily denture hygiene kit",
      packSize: "30 tablets + soaking bath + dual-head brush",
      suitability: "Acrylic, chrome-cobalt, and flexible dentures; clear retainers",
      dispatchOrigin: SHOP_DISPATCH_ADDRESS,
    },
    inStock: true,
    totalStock: 29,
  },
  {
    id: "pav-custom-impression-whitening-care-kit",
    slug: "custom-impression-whitening-care-kit",
    name: "Post-Whitening Sensitivity Relief Gel",
    category: "teeth-whitening",
    categoryLabel: "Teeth Whitening",
    price: 18.0,
    image: "/images/generated/home-tile-whitening.jpg",
    images: [
      "/images/generated/home-tile-whitening.jpg",
      "/images/generated/home-card-whitening.jpg",
    ],
    shortDesc:
      "Soothing potassium nitrate and hydroxyapatite soothing gel to calm temporary sensitivity after whitening.",
    fullDesc:
      "Designed to pair effortlessly with whitening strips or custom bleaching trays. This clear soothing gel coats exposed dentinal tubules with nano-hydroxyapatite and 5% potassium nitrate, helping calm cold sensitivity quickly without dulling freshly brightened enamel.",
    features: [
      "5% potassium nitrate helps calm nerve response to cold drinks and air",
      "Nano-hydroxyapatite replenishes surface minerals after brightening",
      "Applies directly by finger, soft brush, or inside custom whitening trays",
      "Dye-free clear gel—safe to use immediately after whitening courses",
    ],
    whatsIncluded: [
      "2 × 3 ml precision soothing gel syringes (6 ml total)",
      "2 × Soft applicator tips",
      "1 × Sensitivity management leaflet",
    ],
    howToUse:
      "After removing whitening strips or trays, rinse your mouth with lukewarm water. Apply a thin layer of relief gel directly onto sensitive teeth—or inside clean trays for 10–15 minutes—then spit out excess without rinsing.",
    clinicalSpec: {
      activeIngredient: "5% Potassium Nitrate, Nano-Hydroxyapatite, Sodium Fluoride",
      format: "Clear desensitising gel syringes",
      packSize: "2 × 3 ml syringes (6 ml total)",
      suitability: "Adults experiencing sensitivity during or after teeth whitening",
      dispatchOrigin: SHOP_DISPATCH_ADDRESS,
    },
    inStock: true,
    totalStock: 31,
  },
];

export function mapApiProduct(p: ApiProduct): Product {
  const gallery = (p.images ?? [])
    .map((img) => img.url)
    .filter((url): url is string => Boolean(url));
  const fallbackMatch = SHOP_CATALOG_PRODUCTS.find((item) => item.slug === p.slug);

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category || p.category_slug || fallbackMatch?.category || "dental-care",
    categoryLabel:
      p.category_label || p.category_name || fallbackMatch?.categoryLabel || "Dental Care",
    price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
    originalPrice: p.original_price
      ? typeof p.original_price === "string"
        ? parseFloat(p.original_price)
        : p.original_price
      : undefined,
    image: p.image || gallery[0] || fallbackMatch?.image || "/images/generated/shop-hero.jpg",
    images: gallery.length > 0 ? gallery : fallbackMatch?.images,
    shortDesc: p.short_desc || fallbackMatch?.shortDesc || "",
    fullDesc: p.full_desc || fallbackMatch?.fullDesc || "",
    features:
      Array.isArray(p.features) && p.features.length > 0
        ? p.features
        : (fallbackMatch?.features ?? []),
    whatsIncluded: fallbackMatch?.whatsIncluded,
    howToUse: p.how_to_use || fallbackMatch?.howToUse || "",
    clinicalSpec: fallbackMatch?.clinicalSpec,
    badge: p.badge || undefined,
    inStock: p.in_stock,
    totalStock: p.total_stock ?? fallbackMatch?.totalStock,
    variants: p.variants,
    relatedProducts: p.relatedProducts?.map(mapApiProduct),
  };
}

export function getCatalogProductBySlug(slug: string): Product | undefined {
  return SHOP_CATALOG_PRODUCTS.find((p) => p.slug === slug);
}

export function getCatalogProductsByCategory(slug: string): Product[] {
  return SHOP_CATALOG_PRODUCTS.filter((p) => p.category === slug);
}

export function getRelatedCatalogProducts(currentSlug: string, category: string, limit = 4): Product[] {
  const sameCategory = SHOP_CATALOG_PRODUCTS.filter(
    (p) => p.slug !== currentSlug && p.category === category,
  );
  const others = SHOP_CATALOG_PRODUCTS.filter(
    (p) => p.slug !== currentSlug && p.category !== category,
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export function getCategoryMeta(slug: string): ShopCategoryMeta {
  const found = SHOP_CATEGORIES.find((c) => c.slug === slug);
  if (found) return found;
  const fallbackName = slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    slug,
    name: fallbackName || "Dental Care",
    shortTitle: fallbackName || "Dental",
    accentWord: "Care",
    description:
      "Clinician-selected oral care essentials dispatched directly from our dental clinic in Bradford.",
    hoverTone: "terracotta",
    accentTone: "terracotta",
    image: "/images/generated/shop-hero.jpg",
  };
}
