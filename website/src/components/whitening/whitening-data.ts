export interface WhiteningProduct {
  id: string;
  name: string;
  price: string;
  tag: string;
  shadesLighter: string;
  treatmentTime: string;
  description: string;
  benefits: string[];
  image: string;
}

export const PRODUCTS_DATA: WhiteningProduct[] = [
  {
    id: "strips",
    name: "Professional Whitening Strips",
    price: "£25",
    tag: "Daily Essential",
    shadesLighter: "Up to 5 Shades",
    treatmentTime: "14-Day Cycle (30m daily)",
    description: "Formulated with non-peroxide enamel-safe buffers and organic coconut oil, our clinical strips dissolve coffee, tea, and tobacco stains without tooth sensitivity.",
    benefits: [
      "14 dual-arch treatments included",
      "Zero enamel dehydration formula",
      "Ergonomic dry-fit adhesion technology",
      "Refreshing organic peppermint finish"
    ],
    image: "https://res.cloudinary.com/db1i46uiv/image/upload/v1717831205/Untitled_514_x_411_px_1_ucy225.png"
  },
  {
    id: "home-kit",
    name: "Custom Home Whitening Suite",
    price: "£295",
    tag: "Dentist Gold Standard",
    shadesLighter: "Up to 8-10 Shades",
    treatmentTime: "2-3 Weeks (Overnight or 1hr)",
    description: "The clinic-standard system. Includes 3D intraoral impressions for custom vacuum-formed trays, 16% carbamide peroxide gel, and remineralizing ACP serum.",
    benefits: [
      "Laboratory custom-sculpted trays",
      "4x Professional syringe refills",
      "Fluoride & calcium remineralizing pen",
      "Includes before/after clinical shade review"
    ],
    image: "https://res.cloudinary.com/db1i46uiv/image/upload/v1717833609/Untitled_514_x_411_px_2000_x_1600_px_1_likgak.png"
  },
  {
    id: "uv-kit",
    name: "Home UV LED Accelerator System",
    price: "£99",
    tag: "Fastest Results",
    shadesLighter: "Up to 7 Shades",
    treatmentTime: "7-Day Express (16m daily)",
    description: "Harness cold-blue LED technology (465nm wavelength) to photochemically activate gentle whitening gel, breaking down stubborn deep pigment bonds in a fraction of the time.",
    benefits: [
      "32-LED medical-grade mouth tray",
      "Built-in 16-minute auto-timer",
      "Rechargeable USB-C wireless case",
      "Includes 3x PAP+ active gel pens"
    ],
    image: "https://res.cloudinary.com/db1i46uiv/image/upload/v1717833359/Untitled_514_x_411_px_2_xfvrvz.png"
  }
];

export const VITA_SHADES = [
  { step: 1, code: "A4", name: "Deep Amber Stain", color: "#e8cfad", desc: "Severe coffee, tea, and red wine staining with visible dentin warmth." },
  { step: 2, code: "A3.5", name: "Warm Honey", color: "#eedcb9", desc: "Common natural aged shade with moderate interdental discoloration." },
  { step: 3, code: "A3", name: "Natural Warmth", color: "#f2e5c8", desc: "Average adult baseline shade with surface enamel dullness." },
  { step: 4, code: "A2", name: "Soft Champagne", color: "#f5edd4", desc: "Noticeably cleaner and brighter after 3 days of treatment." },
  { step: 5, code: "A1", name: "Light Ivory", color: "#f8f3e0", desc: "Clear luminous tone achieved by Day 7 with visible enamel radiance." },
  { step: 6, code: "B1", name: "Pearl Bright", color: "#faf6ea", desc: "Optimal natural brightness; 6-8 shades whiter than baseline." },
  { step: 7, code: "BL2", name: "Hollywood Luminescence", color: "#fcf9f2", desc: "Celebrity-grade brilliance with vibrant light refraction." },
  { step: 8, code: "BL1", name: "Ultra Diamond Pearl", color: "#ffffff", desc: "Maximum achievable optical brightness with zero yellow undertones." }
];

