export interface WhiteningProduct {
  id: string;
  name: string;
  price: string;
  tag: string;
  formats: string[];
  treatmentTime: string;
  delivery: string;
  protection: string;
  suitability: string;
  clinicalReview: string;
  description: string;
  benefits: string[];
  image: string;
}

export const PRODUCTS_DATA: WhiteningProduct[] = [
  {
    id: "strips",
    name: "Whitening Strips",
    price: "£65",
    tag: "Dissolving Whitening Strips",
    formats: ["Professional Whitening Strips", "Dissolving Whitening Strips"],
    treatmentTime: "14 applications (28 strips)",
    delivery: "Mint-flavoured dissolving strips with non-slip technology",
    protection: "Advanced enamel-safe formula",
    suitability: "On-the-go touch-ups & ongoing smile maintenance",
    clinicalReview: "Self-applied at home",
    description:
      "Introducing mint-flavored dissolving whitening strips with an advanced enamel-safe formula. These strips are perfect for on-the-go touch-ups and ongoing smile maintenance. With a short application time and no strips to remove, they offer convenience and effectiveness. The non-slip technology and premium strength formula ensure a more powerful and long-lasting whitening result. Each pack contains 14 applications (28 strips), providing ample supply for maintaining a white and confident smile.",
    benefits: [
      "14 applications (28 dissolving strips)",
      "Short application time — no strips to remove",
      "Non-slip technology for even gel contact",
      "Mint-flavoured enamel-safe formula",
    ],
    image:
      "https://res.cloudinary.com/db1i46uiv/image/upload/v1717831205/Untitled_514_x_411_px_1_ucy225.png",
  },
  {
    id: "home-kit",
    name: "Home Teeth Whitening",
    price: "£295",
    tag: "Day & Night Whitening Kits",
    formats: ["Day Whitening Kits", "Night Whitening Kits"],
    treatmentTime: "4 x 3ml syringes + 30ml pre-polishing paste",
    delivery: "Dentist-prescribed Day or Night Whitening Kits",
    protection: "Potassium nitrate, calcium & fluoride desensitising blend",
    suitability: "Full at-home whitening with minimal sensitivity",
    clinicalReview: "Dentist-prescribed & shade reviewed",
    description:
      "Our premium UK-made teeth whitening gel is meticulously crafted by dentists for optimum results. With a stable formula infused with potassium nitrate, calcium, and fluoride, it effectively minimizes sensitivity. You have the choice between hydrogen peroxide or carbamide peroxide options. Each package includes 4 x 3ml syringes and a 30ml pre-polishing paste.",
    benefits: [
      "UK-made dentist-crafted whitening gel",
      "Choice of hydrogen peroxide or carbamide peroxide",
      "Infused with potassium nitrate, calcium & fluoride",
      "Includes 4 x 3ml syringes & 30ml pre-polishing paste",
    ],
    image:
      "https://res.cloudinary.com/db1i46uiv/image/upload/v1717833609/Untitled_514_x_411_px_2000_x_1600_px_1_likgak.png",
  },
  {
    id: "in-office",
    name: "Home & In Office Whitening",
    price: "£495",
    tag: "BEAM In-Office Whitening Gel",
    formats: ["BEAM In-Office Whitening Gel", "BEAM Professional Whitening Kit"],
    treatmentTime: "In-office session + BEAM at-home kit",
    delivery: "Pre-whitening varnish + in-office hybrid gel + take-home kit",
    protection: "6% Hydrogen Peroxide + PAP hybrid dual-action formula",
    suitability: "Comprehensive in-clinic transformation & home maintenance",
    clinicalReview: "Full in-clinic supervision & home maintenance plan",
    description:
      "Experience the remarkable results of our professional in-office teeth whitening gel, proudly crafted with our unique hybrid dual-action whitening gel formula. Our optimized 6% Hydrogen Peroxide + PAP formula is complemented by a pre-whitening varnish, skillfully applied to prime the teeth for an outstanding in-office whitening session. To maintain and enhance your dazzling smile, we suggest continuing your whitening journey with the BEAM Professional Whitening Kit for at-home treatment.",
    benefits: [
      "Optimized 6% Hydrogen Peroxide + PAP dual-action formula",
      "Pre-whitening varnish to prime teeth before treatment",
      "Performed in clinic by GDC-registered dentists",
      "Paired with BEAM Professional Whitening Kit for home care",
    ],
    image:
      "https://res.cloudinary.com/db1i46uiv/image/upload/v1717833359/Untitled_514_x_411_px_2_xfvrvz.png",
  },
];

export const VITA_SHADES = [
  {
    step: 1,
    code: "A4",
    name: "Deep Amber Stain",
    color: "#e8cfad",
    desc: "Deep coffee, tea, and red wine staining with pronounced dentin warmth.",
  },
  {
    step: 2,
    code: "A3.5",
    name: "Warm Honey",
    color: "#eedcb9",
    desc: "Mature natural shade with moderate interdental discolouration.",
  },
  {
    step: 3,
    code: "A3",
    name: "Natural Warmth",
    color: "#f2e5c8",
    desc: "Common adult baseline shade with surface enamel dullness.",
  },
  {
    step: 4,
    code: "A2",
    name: "Soft Champagne",
    color: "#f5edd4",
    desc: "Light natural ivory suited to targeted brightening and maintenance.",
  },
  {
    step: 5,
    code: "A1",
    name: "Light Ivory",
    color: "#f8f3e0",
    desc: "Clear luminous tone with subtle surface staining.",
  },
  {
    step: 6,
    code: "B1",
    name: "Pearl Bright",
    color: "#faf6ea",
    desc: "Bright natural enamel suited to maintenance or gentle lift.",
  },
  {
    step: 7,
    code: "BL2",
    name: "Bright Ceramic",
    color: "#fcf9f2",
    desc: "High-brightness shade maintained with regular enamel-safe touch-ups.",
  },
  {
    step: 8,
    code: "BL1",
    name: "Optic White",
    color: "#ffffff",
    desc: "Brightest natural optical tone with minimal yellow undertone.",
  },
];
