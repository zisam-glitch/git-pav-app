import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Media } from "@/components/hims";
import { BLOG_POSTS, type BlogPost } from "@/content/blog-posts";
import { BOOKING_URL } from "@/lib/enquiry";
import { cn } from "@/lib/utils";
import { BLOG_CATEGORIES, categoryForPost, postsInCategory } from "./blog-taxonomy";
import { NewsletterCta } from "./newsletter-cta";

/** How many articles the "Latest" slab shows before "See all articles". */
const LATEST_COUNT = 9;

const EXPLORE_LINKS = [
  { label: "24/7 Emergency Dental Care", href: "/services/emergency-dental" },
  { label: "Professional Teeth Whitening", href: "/services/whitening" },
  { label: "Facial Aesthetics in Bradford", href: "/services/aesthetics" },
  { label: "Same-Day Tooth Extraction", href: "/services/tooth-extraction" },
  { label: "Root Canal Treatment Calculator", href: "/services/root-canal" },
  { label: "Transparent Fee Schedule", href: "/pricing" },
] as const;

const POPULAR_TREATMENTS = [
  { label: "Complete Dental Check-Up", href: "/services/general-dentistry" },
  { label: "24/7 Urgent Consultation", href: "/services/emergency-dental" },
  { label: "Combined Home & In-Office Whitening", href: "/services/whitening" },
  { label: "Botox & Dermal Fillers", href: "/services/aesthetics" },
  { label: "Custom Sports Mouthguards", href: "/services/mouthguards" },
] as const;

/**
 * Hims Blog Index (`www.hims.com/blog.html` & `www.hims.com/blog/all.html` capture):
 * - Recessed `rgba(0,0,0,0.03)` (`#f7f7f7`) outer canvas with `8px` (`gap-2`) vertical separation between
 *   full-width `#ffffff` `rounded-[24px]` section slabs.
 * - Giant display masthead + 56px height `rgba(0,0,0,0.06)` rounded-pill category bar.
 * - Asymmetric top featured split: left 58% primary story with large `62px` headline; right 42% vertical stack
 *   of 3 stories with `24px` titles, `12px` author-in-category byline, excerpt, pill tags, and 88×88 rounded-2xl thumb.
 * - "Latest" & "Condition Guides" white rounded-[24px] slabs with `62px` section headings, borderless 3-column
 *   editorial cards (`16px`-rounded 16:10 image, `29px` title, byline, excerpt, pill tag), and centered 56px
 *   outlined "See all articles" / "See all guides" pill buttons.
 * - Bottom 3-column "Explore / Popular / Top blog resources" white rounded-t-[24px] slab.
 */
export function BlogIndex() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [lead, ...rest] = BLOG_POSTS;
  const sideStack = rest.slice(0, 3);

  // "Latest" shows the newest nine (the six the live blog page opens with, then three more);
  // a topic pill shows every article in that topic, and "See all articles" opens /blog/all.
  const latestPosts: readonly BlogPost[] =
    activeCategory === "all" ? BLOG_POSTS.slice(0, LATEST_COUNT) : postsInCategory(activeCategory);

  const conditionGuides = [
    BLOG_POSTS[1], // Tooth Extraction
    BLOG_POSTS[3], // Botox vs Dermal Fillers
    BLOG_POSTS[4], // Can You Whiten Just One Tooth
  ].filter((p): p is BlogPost => Boolean(p));

  const urgentGuides = [
    BLOG_POSTS[2], // 24 Hour Emergency Dentist Bradford
    BLOG_POSTS[5], // 24 Hour Emergency Dentist Leeds
    BLOG_POSTS[0], // Video Call Assessment
  ].filter((p): p is BlogPost => Boolean(p));

  return (
    <div className="bg-black/[0.03] pb-2">
      <div className="flex flex-col gap-2">
        {/* SLAB 1: Masthead + Category Pills + Featured Asymmetric 2-Column Split */}
        <section className="w-full rounded-b-[24px] bg-white pt-10 pb-12 md:pt-16 md:pb-16">
          <div className="mx-auto w-full max-w-[71.25rem] px-4 md:px-6">
            {/* Masthead (.kPLWQk / .eGckMQ / .ffvJCf) */}
            <div className="max-w-[41.25rem]">
              <h1 className="text-[clamp(2.5rem,calc(2.5rem+47*(100vw-22.5rem)/64.5),5.4375rem)] leading-[1] font-[410] tracking-[-0.02em] text-fg">
                Read Latest Articles
              </h1>
              <p className="mt-5 text-[clamp(1.125rem,1.5vw,1.5rem)] leading-[1.35] font-normal text-fg/88">
                Discover the latest news and insights on oral health, cosmetic dentistry, and more
                at Pav Dental&apos;s blog. Stay informed and improve your smile!
              </p>
            </div>

            {/* Hims 56px Category Pill Bar (.gWZkvY / .fFZUab) */}
            <div
              role="tablist"
              aria-label="Blog categories"
              className="no-scrollbar mt-8 flex items-center gap-2 overflow-x-auto pb-1 md:mt-10"
            >
              {BLOG_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveCategory(isActive ? "all" : cat.id)}
                    className={cn(
                      "inline-flex h-14 shrink-0 items-center justify-center rounded-[48px] px-7 text-[14.5px] font-normal transition-all duration-200 active:scale-95",
                      isActive
                        ? "bg-fg text-white"
                        : "bg-black/[0.06] text-fg hover:bg-fg hover:text-white",
                    )}
                  >
                    {cat.label}
                  </button>
                );
              })}
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === "all"}
                onClick={() => {
                  setActiveCategory("all");
                  document
                    .getElementById("latest-articles")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={cn(
                  "inline-flex h-14 shrink-0 items-center justify-center rounded-[48px] px-7 text-[14.5px] font-normal transition-all duration-200 active:scale-95",
                  activeCategory === "all"
                    ? "bg-black/[0.06] text-fg/75 hover:bg-fg hover:text-white"
                    : "bg-black/[0.06] text-fg hover:bg-fg hover:text-white",
                )}
              >
                All articles
              </button>
            </div>

            {/* Asymmetric Featured Split (.jyvlTK): Left Lead Story (58%) + Right 3-Story Stack (42%) */}
            {lead ? (
              <div className="mt-10 grid items-start gap-8 lg:mt-12 lg:grid-cols-[1.38fr_1fr] lg:gap-10">
                {/* Left Primary Feature */}
                <article className="min-w-0">
                  <Link to="/blog/$slug" params={{ slug: lead.slug }} className="group block">
                    <div className="t-zoom overflow-hidden rounded-[16px] bg-black/[0.06]">
                      <Media
                        src={lead.image.src}
                        alt={lead.image.alt}
                        ratio="16 / 10"
                        tone="sand"
                        priority
                      />
                    </div>

                    <h2 className="mt-6 text-[clamp(2.25rem,calc(2.25rem+26*(100vw-22.5rem)/64.5),3.875rem)] leading-[1.04] font-[410] tracking-[-0.02em] text-fg t-colors group-hover:text-terracotta">
                      {lead.title}
                    </h2>

                    <p className="mt-3 text-[12px] leading-snug text-muted">
                      <span className="text-fg">{lead.author}</span> in{" "}
                      <span className="font-medium text-fg">
                        {categoryForPost(lead.slug).label}
                      </span>{" "}
                      <span aria-hidden="true">·</span>{" "}
                      <time dateTime={lead.date}>{lead.dateLabel}</time>{" "}
                      <span className="sr-only">Posted by: {lead.author}</span>
                    </p>

                    <p className="mt-3 max-w-2xl text-[16px] leading-[1.45] text-muted">
                      {lead.excerpt}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-[20px] bg-black/[0.06] px-3 py-1.5 text-[12px] leading-none text-fg">
                        {categoryForPost(lead.slug).tag}
                      </span>
                      <span className="inline-flex rounded-[20px] bg-black/[0.06] px-3 py-1.5 text-[12px] leading-none text-fg">
                        {categoryForPost(lead.slug).secondaryTag}
                      </span>
                      <span className="ml-2 text-[12px] font-medium text-fg underline underline-offset-4 group-hover:text-terracotta">
                        Read More
                      </span>
                    </div>
                  </Link>
                </article>

                {/* Right Vertical Stack of 3 Compact Stories with 88x88 Thumbnails */}
                <div className="flex min-w-0 flex-col divide-y divide-black/[0.08]">
                  {sideStack.map((post) => {
                    const cat = categoryForPost(post.slug);
                    return (
                      <article key={post.slug} className="py-6 first:pt-0 last:pb-0">
                        <Link
                          to="/blog/$slug"
                          params={{ slug: post.slug }}
                          className="group grid grid-cols-[1fr_5.5rem] items-start gap-4 sm:grid-cols-[1fr_6rem] sm:gap-5"
                        >
                          <div className="min-w-0">
                            <h2 className="text-[clamp(1.25rem,1.6vw,1.5rem)] leading-[1.18] font-[470] tracking-[-0.01em] text-fg t-colors group-hover:text-terracotta">
                              {post.title}
                            </h2>
                            <p className="mt-1.5 text-[12px] leading-snug text-muted">
                              <span className="text-fg">{post.author}</span> in{" "}
                              <span className="font-medium text-fg">{cat.label}</span>{" "}
                              <span aria-hidden="true">·</span>{" "}
                              <time dateTime={post.date}>{post.dateLabel}</time>
                            </p>
                            <p className="mt-2 line-clamp-2 text-[15px] leading-[1.4] text-muted">
                              {post.excerpt}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                              <span className="inline-flex rounded-[20px] bg-black/[0.06] px-2.5 py-1.5 text-[12px] leading-none text-fg">
                                {cat.tag}
                              </span>
                              <span className="inline-flex rounded-[20px] bg-black/[0.06] px-2.5 py-1.5 text-[12px] leading-none text-fg">
                                {cat.secondaryTag}
                              </span>
                            </div>
                          </div>

                          <div className="size-[5.5rem] shrink-0 overflow-hidden rounded-[16px] bg-black/[0.06] sm:size-24">
                            <img
                              src={post.image.src}
                              alt={post.image.alt}
                              loading="lazy"
                              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        </Link>
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* SLAB 2: "Latest" — 3-Column Hims Borderless Editorial Cards + "See all articles" Pill */}
        <section id="latest-articles" className="w-full rounded-[24px] bg-white py-12 md:py-16">
          <div className="mx-auto w-full max-w-[71.25rem] px-4 md:px-6">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="text-[clamp(2.25rem,calc(2.25rem+26*(100vw-22.5rem)/64.5),3.875rem)] leading-[1.04] font-[410] tracking-[-0.02em] text-fg">
                {activeCategory === "all"
                  ? "Latest"
                  : (BLOG_CATEGORIES.find((c) => c.id === activeCategory)?.label ?? "Latest")}
              </h2>
              {activeCategory !== "all" ? (
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className="text-small font-medium text-fg underline underline-offset-4 hover:text-terracotta"
                >
                  Show latest articles
                </button>
              ) : null}
            </div>

            <ul className="mt-8 grid gap-x-6 gap-y-10 md:mt-10 md:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => {
                const cat = categoryForPost(post.slug);
                return (
                  <li key={post.slug} className="flex min-w-0">
                    <article className="flex w-full min-w-0 flex-col">
                      <Link
                        to="/blog/$slug"
                        params={{ slug: post.slug }}
                        className="group flex h-full flex-col"
                      >
                        <div className="t-zoom overflow-hidden rounded-[16px] bg-black/[0.06]">
                          <Media
                            src={post.image.src}
                            alt={post.image.alt}
                            ratio="16 / 10"
                            tone="sand"
                          />
                        </div>

                        <h3 className="mt-5 text-[clamp(1.375rem,1.9vw,1.8125rem)] leading-[1.15] font-[458] tracking-[-0.015em] text-fg t-colors group-hover:text-terracotta">
                          {post.title}
                        </h3>

                        <p className="mt-2.5 text-[12px] leading-snug text-muted">
                          <span className="text-fg">Posted by: {post.author}</span> in{" "}
                          <span className="font-medium text-fg">{cat.label}</span>{" "}
                          <span aria-hidden="true">·</span>{" "}
                          <time dateTime={post.date}>{post.dateLabel}</time>
                        </p>

                        <p className="mt-2.5 line-clamp-3 flex-1 text-[16px] leading-[1.42] text-muted">
                          {post.excerpt}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex rounded-[20px] bg-black/[0.06] px-3 py-1.5 text-[12px] leading-none text-fg">
                            {cat.tag}
                          </span>
                          <span className="text-[13px] font-medium text-fg underline underline-offset-4 group-hover:text-terracotta">
                            Read More
                          </span>
                        </div>
                      </Link>
                    </article>
                  </li>
                );
              })}
            </ul>

            <div className="mt-12 flex justify-center">
              <Link
                to="/blog/all"
                search={{ page: 1 }}
                className="inline-flex h-14 items-center justify-center rounded-[48px] border border-black/12 bg-white px-7 text-[14.5px] font-normal text-fg t-colors hover:border-black"
              >
                See all articles
              </Link>
            </div>
          </div>
        </section>

        {/* SLAB 3: "Condition Guides" & "Urgent Care Guides" — Hims Curated Topic Slabs */}
        <section className="w-full rounded-[24px] bg-white py-12 md:py-16">
          <div className="mx-auto w-full max-w-[71.25rem] px-4 md:px-6">
            <h2 className="text-[clamp(2.25rem,calc(2.25rem+26*(100vw-22.5rem)/64.5),3.875rem)] leading-[1.04] font-[410] tracking-[-0.02em] text-fg">
              Condition Guides
            </h2>

            <div className="mt-8 grid gap-x-6 gap-y-10 md:mt-10 md:grid-cols-3">
              {conditionGuides.map((post) => {
                const cat = categoryForPost(post.slug);
                return (
                  <article key={post.slug} className="flex min-w-0 flex-col">
                    <Link
                      to="/blog/$slug"
                      params={{ slug: post.slug }}
                      className="group flex h-full flex-col"
                    >
                      <div className="t-zoom overflow-hidden rounded-[16px] bg-black/[0.06]">
                        <Media
                          src={post.image.src}
                          alt={post.image.alt}
                          ratio="16 / 10"
                          tone="cream"
                        />
                      </div>
                      <h3 className="mt-5 text-[clamp(1.375rem,1.9vw,1.8125rem)] leading-[1.15] font-[458] tracking-[-0.015em] text-fg t-colors group-hover:text-terracotta">
                        {post.title}
                      </h3>
                      <p className="mt-2.5 text-[12px] leading-snug text-muted">
                        <span className="text-fg">{post.author}</span> in{" "}
                        <span className="font-medium text-fg">{cat.label}</span>
                      </p>
                      <p className="mt-2.5 line-clamp-2 text-[16px] leading-[1.42] text-muted">
                        {post.excerpt}
                      </p>
                    </Link>
                  </article>
                );
              })}
            </div>

            <div className="mt-12 flex justify-center">
              <a
                href="/services"
                className="inline-flex h-14 items-center justify-center rounded-[48px] border border-black/12 bg-white px-7 text-[14.5px] font-normal text-fg t-colors hover:border-black"
              >
                See all guides
              </a>
            </div>
          </div>
        </section>

        {/* SLAB 4: "Emergency & Teledentistry Guides" */}
        <section className="w-full rounded-[24px] bg-white py-12 md:py-16">
          <div className="mx-auto w-full max-w-[71.25rem] px-4 md:px-6">
            <h2 className="text-[clamp(2.25rem,calc(2.25rem+26*(100vw-22.5rem)/64.5),3.875rem)] leading-[1.04] font-[410] tracking-[-0.02em] text-fg">
              Urgent Care &amp; Triage
            </h2>

            <div className="mt-8 grid gap-x-6 gap-y-10 md:mt-10 md:grid-cols-3">
              {urgentGuides.map((post) => {
                const cat = categoryForPost(post.slug);
                return (
                  <article key={post.slug} className="flex min-w-0 flex-col">
                    <Link
                      to="/blog/$slug"
                      params={{ slug: post.slug }}
                      className="group flex h-full flex-col"
                    >
                      <div className="t-zoom overflow-hidden rounded-[16px] bg-black/[0.06]">
                        <Media
                          src={post.image.src}
                          alt={post.image.alt}
                          ratio="16 / 10"
                          tone="sage"
                        />
                      </div>
                      <h3 className="mt-5 text-[clamp(1.375rem,1.9vw,1.8125rem)] leading-[1.15] font-[458] tracking-[-0.015em] text-fg t-colors group-hover:text-terracotta">
                        {post.title}
                      </h3>
                      <p className="mt-2.5 text-[12px] leading-snug text-muted">
                        <span className="text-fg">{post.author}</span> in{" "}
                        <span className="font-medium text-fg">{cat.label}</span>
                      </p>
                      <p className="mt-2.5 line-clamp-2 text-[16px] leading-[1.42] text-muted">
                        {post.excerpt}
                      </p>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* SLAB 5: Hims Bottom 3-Column Resource Directory (Explore / Popular / Top blog resources) */}
        <section className="w-full rounded-[24px] bg-white py-14 md:py-20">
          <div className="mx-auto w-full max-w-[71.25rem] px-4 md:px-6">
            <div className="grid gap-10 md:grid-cols-3 md:gap-12">
              {/* Column 1: Explore */}
              <div>
                <h2 className="text-[12px] font-normal text-muted">Explore</h2>
                <ul className="mt-5 space-y-4">
                  {EXPLORE_LINKS.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="text-[18px] leading-snug font-normal text-fg t-colors hover:text-terracotta"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: Popular */}
              <div>
                <h2 className="text-[12px] font-normal text-muted">Popular</h2>
                <ul className="mt-5 space-y-4">
                  {POPULAR_TREATMENTS.map((item) => (
                    <li key={item.label} className="flex items-center gap-2">
                      <a
                        href={item.href}
                        className="text-[18px] leading-snug font-normal text-fg t-colors hover:text-terracotta"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <a
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center rounded-[48px] bg-black/[0.06] px-5 text-[13px] font-normal text-fg t-colors hover:bg-fg hover:text-white"
                  >
                    Explore All Treatments
                  </a>
                </div>
              </div>

              {/* Column 3: Top blog resources */}
              <div>
                <h2 className="text-[12px] font-normal text-muted">Top blog resources</h2>
                <ul className="mt-5 space-y-4">
                  {BLOG_POSTS.slice(0, 3).map((post) => (
                    <li key={post.slug}>
                      <Link
                        to="/blog/$slug"
                        params={{ slug: post.slug }}
                        className="group inline-flex items-baseline gap-1.5 text-[18px] leading-snug font-normal text-fg t-colors hover:text-terracotta"
                      >
                        <span>{post.title}</span>
                        <ArrowUpRight
                          className="size-4 shrink-0 translate-y-0.5 text-fg transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-2">
        <NewsletterCta />
      </div>
    </div>
  );
}
