import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useMemo } from "react";
import { ContentBlocks } from "@/components/content/content-blocks";
import { BookButton, Media } from "@/components/hims";
import { BLOG_POSTS, type BlogPost } from "@/content/blog-posts";
import { BOOKING_URL } from "@/lib/enquiry";
import { blogPostingJsonLd } from "@/lib/seo";
import { tocEntries } from "@/components/content/heading-ids";
import { ArticleToc } from "./article-toc";
import { BLOG_CATEGORIES, categoryForPost } from "./blog-taxonomy";

const SHORT_DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatShortDate(isoDate: string): string {
  return SHORT_DATE.format(new Date(`${isoDate}T12:00:00Z`));
}

const RELATED_CONDITIONS = [
  {
    title: "24/7 Emergency Care",
    href: "/services/emergency-dental",
  },
  {
    title: "Facial Aesthetics & Restorative Care",
    href: "/services/aesthetics",
  },
] as const;

/**
 * Hims Blog Article Page (`www.hims.com/blog/how-long-before-minoxidil-starts-working.html` capture):
 * - Top terracotta promo banner (`bg-rust`) with "Get Started" white pill button + white horizontal blog category sub-navbar.
 * - Recessed `rgba(0,0,0,0.03)` outer canvas with `8px` gap between white `rounded-[24px]` section slabs.
 * - Centered `650px` (`max-w-[40.625rem]`) single-column article stage:
 *   - Uppercase `12px` breadcrumb (`HOME / CATEGORY`)
 *   - Giant `62px` (`text-h2` / `clamp(38px..62px)`) H1 headline
 *   - `12px` author block (`Written by ...`, `Published ...`; Hims' reviewer, update and sources rows are left out: Pav has no such content)
 *   - Clean editorial prose (`ContentBlocks`) + medical disclaimer
 *   - `Related Articles` (`43px` heading) vertical stack of horizontal rows with 1px hairline dividers, short dates (`Nov 12, 2026` for SEO parity), and right `180×116` rounded-xl thumbnails
 * - Lower `Related Conditions` slab with Hims warm terracotta-gradient (`from-clay to-rust`) display cards + 3-column Explore/Popular/Resources directory.
 */
export function BlogPostPage({ post }: { post: BlogPost }) {
  const position = BLOG_POSTS.findIndex((candidate) => candidate.slug === post.slug);
  // Newest first, so the post after this one in the list is the older one.
  const previous = BLOG_POSTS[position + 1];
  const next = BLOG_POSTS[position - 1];
  const recent = BLOG_POSTS.filter((candidate) => candidate.slug !== post.slug).slice(0, 3);
  const category = categoryForPost(post.slug);
  const toc = useMemo(() => tocEntries(post.blocks), [post.blocks]);

  const data = blogPostingJsonLd({
    slug: post.slug,
    title: post.title,
    date: post.date,
    author: post.author,
    image: post.image.src,
  });

  return (
    <div className="bg-black/[0.03] pb-2">
      <script
        type="application/ld+json"
        // "<" is escaped so no text in the data can end the script early.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
      />

      {/* Hims Top Terracotta Announcement Strip (from blog-article-top.png) */}
      <div className="bg-rust px-4 py-2.5 text-white">
        <div className="mx-auto flex max-w-[var(--container-wide)] flex-wrap items-center justify-center gap-3 text-center">
          <p className="text-[14px] leading-tight text-white/95">
            Need same-day or <strong className="font-semibold text-white">24/7 dental care</strong>{" "}
            in Bradford?
          </p>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center justify-center rounded-pill bg-white px-4 text-[12px] font-medium text-fg t-colors hover:bg-white/90"
          >
            Get Started
          </a>
        </div>
      </div>

      {/* Hims Blog Category Sub-Navbar (from blog-article-top.png & blog-all-top.png) */}
      <nav aria-label="Blog topics" className="border-b border-black/[0.06] bg-white px-4 py-3">
        <div className="no-scrollbar mx-auto flex max-w-[var(--container-wide)] items-center justify-start gap-6 overflow-x-auto md:justify-center md:gap-8">
          <Link
            to="/blog/all"
            search={{ page: 1 }}
            className="shrink-0 text-[14px] font-normal text-fg t-colors hover:text-terracotta"
          >
            All
          </Link>
          {BLOG_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to="/blog/all"
              search={{ page: 1, topic: cat.id }}
              className="shrink-0 text-[14px] font-normal text-fg t-colors hover:text-terracotta"
            >
              {cat.label}
            </Link>
          ))}
          <a
            href="/services"
            className="shrink-0 text-[14px] font-normal text-fg t-colors hover:text-terracotta"
          >
            Treatments
          </a>
        </div>
      </nav>

      <div className="flex flex-col gap-2">
        {/* SLAB 1: Centered 650px Single-Column Hims Article Canvas */}
        <section className="w-full rounded-b-[24px] bg-white pt-10 pb-16 md:pt-14 md:pb-20">
          <div className="relative mx-auto w-full max-w-[43.625rem] px-4 sm:px-6">
            {/* Breadcrumb: HOME / CATEGORY */}
            <div className="flex flex-wrap items-center gap-1.5 text-[12px] tracking-[0.04em] uppercase">
              <Link to="/" className="font-medium text-fg t-colors hover:text-terracotta">
                HOME
              </Link>
              <span className="text-black/45" aria-hidden="true">
                /
              </span>
              <Link to="/blog" className="text-black/54 t-colors hover:text-fg">
                {category.label}
              </Link>
            </div>

            {/* Giant 62px Single-Column H1 */}
            <h1 className="mt-3 text-[clamp(2.375rem,calc(2.375rem+24*(100vw-22.5rem)/64.5),3.875rem)] leading-[1.05] font-[410] tracking-[-0.02em] text-fg">
              {post.title}
            </h1>

            {/* 4-Line Hims Medical Reviewer & Author Block */}
            <div className="mt-6 flex items-start gap-3.5 text-[12px] leading-[1.45] text-black/54">
              <img
                src="/images/team/2.jpg"
                alt="Dr Hassan Bhojani"
                loading="lazy"
                className="mt-0.5 size-14 shrink-0 rounded-full bg-cream object-cover"
              />
              <div>
                <p>
                  Written by <span className="text-fg">{post.author}</span>
                </p>
                <p className="sr-only">By {post.author}</p>
                <p>
                  Published{" "}
                  <time dateTime={post.date} className="text-black/65">
                    {post.dateLabel}
                  </time>
                </p>
              </div>
            </div>

            {/* Self-Hosted Cover Image */}
            <div className="mt-8 overflow-hidden rounded-[16px] bg-black/[0.05]">
              <Media
                src={post.image.src}
                alt={post.image.alt}
                ratio="16 / 9"
                tone="cream"
                priority
              />
            </div>

            {/* Hims table of contents (left margin on wide screens, collapsed list above the article otherwise) */}
            <ArticleToc entries={toc} />

            {/* Article Body Blocks — styled to Hims BLOG_ARTICLE.css prose scale */}
            <article className="mt-8 min-w-0">
              <div className="min-w-0 [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:border-t-0 [&_h2]:pt-0 [&_h2]:text-[clamp(1.75rem,3vw,2.6875rem)] [&_h2]:leading-[1.1] [&_h2]:font-[410] [&_h2]:tracking-[-0.02em] [&_h3]:mt-9 [&_h3]:mb-4 [&_h3]:text-[clamp(1.375rem,2.2vw,2.1875rem)] [&_h3]:leading-[1.15] [&_h3]:font-[410] [&_h3]:tracking-[-0.02em] [&_p]:mt-5 [&_p]:text-[18px] [&_p]:leading-[1.6] [&_p]:text-fg/85 [&_ul]:mt-5 [&_ul]:space-y-3 [&_ul]:text-[18px] [&_ul]:leading-[1.6] [&_ul]:text-fg/85 [&_ul]:marker:text-fg/75">
                <ContentBlocks blocks={post.blocks} />
              </div>

              {/* Hims Fine-Print Medical Disclaimer */}
              <p className="mt-4 text-[12px] leading-[1.45] text-black/50">
                This article is for informational purposes only and does not constitute medical or
                dental advice. The information contained herein is not a substitute for and should
                never be relied upon for professional clinical advice. Always talk to your dentist
                about the risks and benefits of any treatment.
              </p>

              {/* Hims "Related Articles" Section (blog-article-y10500.png & blog-article-y11400.png) */}
              <section aria-label="Recent posts" className="mt-14">
                <h2 className="text-[clamp(2rem,3vw,2.6875rem)] leading-[1.1] font-[410] tracking-[-0.02em] text-fg">
                  Related Articles
                </h2>
                <p className="sr-only">Recent Posts</p>

                <ul className="mt-5 divide-y divide-black/12 border-t border-black/12">
                  {recent.map((recentPost) => (
                    <li key={recentPost.slug} className="py-6">
                      <Link
                        to="/blog/$slug"
                        params={{ slug: recentPost.slug }}
                        className="group grid grid-cols-[1fr_7.5rem] items-start gap-5 sm:grid-cols-[1fr_11.25rem] sm:gap-6"
                      >
                        <div className="min-w-0">
                          <span className="block text-[clamp(1.25rem,1.8vw,1.5rem)] leading-[1.2] font-normal text-fg t-colors group-hover:text-terracotta">
                            {recentPost.title}
                          </span>
                          <p className="sr-only">
                            {recentPost.title.length > 50
                              ? `${recentPost.title.slice(0, 50)}...`
                              : recentPost.title}
                          </p>
                          <p className="mt-4 text-[12px] leading-snug text-fg">
                            Written by {recentPost.author}
                          </p>
                          <p className="mt-0.5 text-[12px] text-black/54">
                            Published{" "}
                            <time dateTime={recentPost.date}>
                              {formatShortDate(recentPost.date)}
                            </time>
                          </p>
                        </div>

                        <div className="aspect-[180/116] w-full shrink-0 overflow-hidden rounded-[12px] bg-black/[0.06]">
                          <img
                            src={recentPost.image.src}
                            alt={recentPost.image.alt}
                            loading="lazy"
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Previous / Next Post Navigation (preserves live site's Previous Post / Next Post links) */}
              <nav
                aria-label="More posts"
                className="mt-8 grid gap-4 border-t border-black/12 pt-8 sm:grid-cols-2"
              >
                {previous ? (
                  <Link
                    to="/blog/$slug"
                    params={{ slug: previous.slug }}
                    rel="prev"
                    className="min-w-0 rounded-[16px] bg-black/[0.04] p-5 t-colors hover:bg-black/[0.07]"
                  >
                    <span className="flex items-center gap-2 text-[12px] font-medium text-terracotta">
                      <ArrowLeft className="size-3.5" aria-hidden="true" />
                      Previous Post
                    </span>
                    <span className="mt-2 block text-[15px] font-medium leading-snug text-fg">
                      {previous.title}
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
                {next ? (
                  <Link
                    to="/blog/$slug"
                    params={{ slug: next.slug }}
                    rel="next"
                    className="min-w-0 rounded-[16px] bg-black/[0.04] p-5 text-right t-colors hover:bg-black/[0.07] sm:col-start-2"
                  >
                    <span className="flex items-center justify-end gap-2 text-[12px] font-medium text-terracotta">
                      Next Post
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </span>
                    <span className="mt-2 block text-[15px] font-medium leading-snug text-fg">
                      {next.title}
                    </span>
                  </Link>
                ) : null}
              </nav>
            </article>
          </div>
        </section>

        {/* SLAB 2: Hims "Related Conditions" Warm Terracotta Banner Cards (blog-article-y11400.png & y12300.png) */}
        <section className="w-full rounded-[24px] bg-white py-12 md:py-16">
          <div className="mx-auto w-full max-w-[54rem] px-4 sm:px-6">
            <h3 className="text-center text-[19px] font-medium text-fg">Related Conditions</h3>

            <div className="mt-8 space-y-8">
              {RELATED_CONDITIONS.map((cond) => (
                <div key={cond.href} className="text-center">
                  <a
                    href={cond.href}
                    className="group relative flex min-h-[13.5rem] w-full items-center justify-center overflow-hidden rounded-[28px] bg-linear-135 from-clay to-rust px-8 py-10 text-center text-white transition-transform duration-300 hover:scale-[1.01]"
                  >
                    <span className="text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-[410] tracking-[-0.02em] text-white">
                      {cond.title}
                    </span>
                  </a>
                  <p className="mx-auto mt-3 max-w-3xl text-[15px] leading-[1.45] text-fg/85">
                    <a
                      href={cond.href}
                      className="font-medium text-fg underline underline-offset-3 hover:text-terracotta"
                    >
                      Learn more
                    </a>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SLAB 3: Hims Bottom 3-Column Resource Directory */}
        <section className="w-full rounded-t-[24px] bg-white py-14 md:py-16">
          <div className="mx-auto w-full max-w-[var(--container-wide)] px-4 md:px-8">
            <div className="grid gap-10 md:grid-cols-3 md:gap-12">
              <div>
                <h3 className="text-[12px] font-normal text-muted">Learn</h3>
                <ul className="mt-4 space-y-3.5">
                  <li>
                    <Link to="/blog" className="text-[16px] text-fg hover:text-terracotta">
                      All Dental Guides
                    </Link>
                  </li>
                  <li>
                    <a
                      href="/services/emergency-dental"
                      className="text-[16px] text-fg hover:text-terracotta"
                    >
                      24/7 Emergency Dentist Bradford
                    </a>
                  </li>
                  <li>
                    <a
                      href="/services/whitening"
                      className="text-[16px] text-fg hover:text-terracotta"
                    >
                      Professional Teeth Whitening
                    </a>
                  </li>
                  <li>
                    <a
                      href="/services/aesthetics"
                      className="text-[16px] text-fg hover:text-terracotta"
                    >
                      Facial Aesthetics (Botox &amp; Fillers)
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-[12px] font-normal text-muted">Popular Treatments</h3>
                <ul className="mt-4 space-y-3.5">
                  <li>
                    <a
                      href="/services/general-dentistry"
                      className="text-[16px] text-fg hover:text-terracotta"
                    >
                      Complete Check-Up
                    </a>
                  </li>
                  <li>
                    <a
                      href="/services/tooth-extraction"
                      className="text-[16px] text-fg hover:text-terracotta"
                    >
                      Same-Day Tooth Extraction
                    </a>
                  </li>
                  <li>
                    <a
                      href="/services/root-canal"
                      className="text-[16px] text-fg hover:text-terracotta"
                    >
                      Root Canal Treatment
                    </a>
                  </li>
                  <li>
                    <a
                      href="/services/virtual-dentistry"
                      className="text-[16px] text-fg hover:text-terracotta"
                    >
                      Virtual Video Consultation
                    </a>
                  </li>
                </ul>
                <div className="mt-6">
                  <BookButton size="sm">Book Appointment</BookButton>
                </div>
              </div>

              <div>
                <h3 className="text-[12px] font-normal text-muted">Top blog resources</h3>
                <ul className="mt-4 space-y-3.5">
                  {recent.map((item) => (
                    <li key={item.slug}>
                      <Link
                        to="/blog/$slug"
                        params={{ slug: item.slug }}
                        className="group inline-flex items-baseline gap-1 text-[16px] leading-snug text-fg hover:text-terracotta"
                      >
                        <span>{item.title}</span>
                        <ArrowUpRight
                          className="size-3.5 shrink-0 translate-y-0.5"
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
    </div>
  );
}
