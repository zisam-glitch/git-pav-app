export interface WhiteningProduct {
  id: string;
  name: string;
  price: string;
  tags: readonly string[];
  description: string;
  image?: string;
  alt: string;
}

export const PRODUCTS_DATA: readonly WhiteningProduct[] = [
  {
    id: "whitening-strips",
    name: "Whitening Strips",
    price: "£65",
    tags: ["Professional Whitening Strips", "Dissolving Whitening Strips"],
    description:
      "Introducing mint-flavored dissolving whitening strips with an advanced enamel-safe formula. These strips are perfect for on-the-go touch-ups and ongoing smile maintenance. With a short application time and no strips to remove, they offer convenience and effectiveness. The non-slip technology and premium strength formula ensure a more powerful and long-lasting whitening result. Each pack contains 14 applications (28 strips), providing ample supply for maintaining a white and confident smile.",
    alt: "Mint-flavored dissolving teeth whitening strips arranged on a soft cream studio surface",
  },
  {
    id: "home-teeth-whitening",
    name: "Home Teeth Whitening",
    price: "£295",
    tags: ["Day Whitening Kits", "Night Whitening Kits"],
    description:
      "Our premium UK-made teeth whitening gel is meticulously crafted by dentists for optimum results. With a stable formula infused with potassium nitrate, calcium, and fluoride, it effectively minimizes sensitivity. You have the choice between hydrogen peroxide or carbamide peroxide options. Each package includes 4 x 3ml syringes and a 30ml pre-polishing paste.",
    image: "/images/generated/home-teeth-whitening.jpg",
    alt: "Dentist-crafted home teeth whitening syringes and kit in warm natural studio light",
  },
  {
    id: "home-in-office-whitening",
    name: "Home & In Office Whitening",
    price: "£495",
    tags: ["BEAM In-Office Whitening Gel"],
    description:
      "Experience the remarkable results of our professional in-office teeth whitening gel, proudly crafted with our unique hybrid dual-action whitening gel formula. Our optimized 6% Hydrogen Peroxide + PAP formula is complemented by a pre-whitening varnish, skillfully applied to prime the teeth for an outstanding in-office whitening session. To maintain and enhance your dazzling smile, we suggest continuing your whitening journey with the BEAM Professional Whitening Kit for at-home treatment.",
    alt: "Professional in-office and take-home dual-action whitening care kit in soft studio lighting",
  },
];

export interface VitaShade {
  step: number;
  code: string;
  name: string;
  color: string;
  desc: string;
  recommendedId: WhiteningProduct["id"];
}

export const VITA_SHADES: readonly VitaShade[] = [
  {
    step: 1,
    code: "A4",
    name: "Deep Amber",
    color: "#e8cfad",
    desc: "Deeper warm discoloration suited to an in-office session paired with ongoing at-home care.",
    recommendedId: "home-in-office-whitening",
  },
  {
    step: 2,
    code: "A3.5",
    name: "Warm Honey",
    color: "#eedcb9",
    desc: "Noticeable warm undertones suited to combined in-office whitening and at-home maintenance.",
    recommendedId: "home-in-office-whitening",
  },
  {
    step: 3,
    code: "A3",
    name: "Natural Warmth",
    color: "#f2e5c8",
    desc: "Natural warm baseline shade suited to dentist-crafted day or night home whitening kits.",
    recommendedId: "home-teeth-whitening",
  },
  {
    step: 4,
    code: "A2",
    name: "Soft Champagne",
    color: "#f5edd4",
    desc: "Light warm shade suited to home teeth whitening kits formulated to minimize sensitivity.",
    recommendedId: "home-teeth-whitening",
  },
  {
    step: 5,
    code: "A1",
    name: "Light Ivory",
    color: "#f8f3e0",
    desc: "Light ivory tone suited to custom home whitening or regular touch-up maintenance.",
    recommendedId: "home-teeth-whitening",
  },
  {
    step: 6,
    code: "B1",
    name: "Pearl Bright",
    color: "#faf6ea",
    desc: "Bright natural tone suited to convenient on-the-go touch-ups and smile maintenance.",
    recommendedId: "whitening-strips",
  },
  {
    step: 7,
    code: "BL2",
    name: "Bright Pearl",
    color: "#fcf9f2",
    desc: "Luminous pearl tone maintained with dissolving strips between dental appointments.",
    recommendedId: "whitening-strips",
  },
  {
    step: 8,
    code: "BL1",
    name: "Brightest Pearl",
    color: "#ffffff",
    desc: "Brightest baseline tone maintained with convenient dissolving whitening strips.",
    recommendedId: "whitening-strips",
  },
];
