import { BLOG_POSTS, type BlogPost } from "@/content/blog-posts";

export type BlogCategory = {
  id: string;
  label: string;
  /** The first tag chip on a card. */
  tag: string;
};

/** The topic pills on the blog, in the order Hims shows its own (All, then topics). */
export const BLOG_CATEGORIES: readonly BlogCategory[] = [
  { id: "emergency", label: "Emergency Care", tag: "Urgent Dentistry" },
  { id: "oral-surgery", label: "Tooth Extraction", tag: "Oral Surgery" },
  { id: "aesthetics", label: "Facial Aesthetics", tag: "Aesthetics" },
  { id: "whitening", label: "Teeth Whitening", tag: "Cosmetic Care" },
  { id: "virtual", label: "Virtual Dentistry", tag: "Teledentistry" },
  { id: "general", label: "Dental Care", tag: "Patient Guide" },
] as const;

/** Which topic a post belongs to, from its address. The first matching rule wins. */
export function categoryIdForSlug(slug: string): string {
  if (/virtual|video-call|speak-to-a-dentist|not-sure-if-you-need-a-dentist/.test(slug)) return "virtual";
  if (/extraction/.test(slug)) return "oral-surgery";
  if (/botox|filler|aesthetic/.test(slug)) return "aesthetics";
  if (/whiten/.test(slug)) return "whitening";
  if (/emergenc|24-hour|same-day/.test(slug)) return "emergency";
  return "general";
}

export function categoryById(id: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((category) => category.id === id);
}

export function postsInCategory(id: string): BlogPost[] {
  return BLOG_POSTS.filter((post) => categoryIdForSlug(post.slug) === id);
}

export function categoryForPost(slug: string): { id: string; label: string; tag: string; secondaryTag: string } {
  const id = categoryIdForSlug(slug);
  const category = categoryById(id) ?? BLOG_CATEGORIES[0];
  let secondaryTag = "Pav Dental Guide";
  if (id === "virtual") secondaryTag = "Video Triage";
  else if (id === "oral-surgery") secondaryTag = "Bradford Clinic";
  else if (id === "aesthetics") secondaryTag = "Dermal Fillers";
  else if (id === "whitening") secondaryTag = "Enamel Shade";
  else if (id === "emergency") secondaryTag = slug.includes("leeds") ? "24/7 Access" : "Same-Day Relief";
  return { id, label: category.label, tag: category.tag, secondaryTag };
}
