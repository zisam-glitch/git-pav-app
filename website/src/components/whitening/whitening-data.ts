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
    image: "/images/generated/whitening-strips.jpg",
    alt: "Mint-flavored dissolving teeth whitening strips arranged on a soft cream studio surface",
  },
  {
    id: "home-teeth-whitening",
    name: "Home Teeth Whitening",
    price: "£295",
    tags: ["Day Whitening Kits", "Night Whitening Kits"],
    description:
      "Our premium UK-made teeth whitening gel is meticulously crafted by dentists for optimum results. With a stable formula infused with potassium nitrate, calcium, and fluoride, it effectively minimizes sensitivity. You have the choice between hydrogen peroxide or carbamide peroxide options. Each package includes 4 x 3ml syringes and a 30ml pre-polishing paste.",
    image: "/images/generated/whitening-home-kit.jpg",
    alt: "Dentist-crafted home teeth whitening syringes and kit in warm natural studio light",
  },
  {
    id: "home-in-office-whitening",
    name: "Home & In Office Whitening",
    price: "£495",
    tags: ["BEAM In-Office Whitening Gel"],
    description:
      "Experience the remarkable results of our professional in-office teeth whitening gel, proudly crafted with our unique hybrid dual-action whitening gel formula. Our optimized 6% Hydrogen Peroxide + PAP formula is complemented by a pre-whitening varnish, skillfully applied to prime the teeth for an outstanding in-office whitening session. To maintain and enhance your dazzling smile, we suggest continuing your whitening journey with the BEAM Professional Whitening Kit for at-home treatment.",
    image: "/images/generated/whitening-home-in-office.jpg",
    alt: "Professional in-office and take-home dual-action whitening care kit in soft studio lighting",
  },
];
