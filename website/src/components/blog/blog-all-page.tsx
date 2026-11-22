import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Media } from "@/components/hims";
import { BLOG_POSTS } from "@/content/blog-posts";
import { cn } from "@/lib/utils";
import { BLOG_CATEGORIES, categoryById, categoryForPost, postsInCategory } from "./blog-taxonomy";
import { NewsletterCta } from "./newsletter-cta";

/** Articles on each page of /blog/all: four rows of three, as on the Hims "All Articles" page. */
export const ALL_PAGE_SIZE = 12;

/** Page numbers to show, with 0 standing for "..." (Hims shows 1 to 5, an ellipsis and the last page). */
function pageNumbers(current: number, last: number): number[] {
  if (last <= 7) return Array.from({ length: last }, (_, index) => index + 1);
  const window = new Set([1, last, current - 1, current, current + 1]);
  const sorted = [...window].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b);
  const result: number[] = [];
  sorted.forEach((n, index) => {
    if (index > 0 && n - sorted[index - 1] > 1) result.push(0);
    result.push(n);
  });
  return result;
}

const CIRCLE =
  "flex items-center justify-center rounded-full bg-black/[0.03] text-fg transition-[background-color,translate] duration-100 ease-in-out hover:bg-black/[0.44] focus-visible:bg-black/[0.06] active:scale-95 active:bg-black/[0.33]";

/**
 * Hims "All Articles" page (`www.hims.com/blog/all.html`): topic bar, `HOME / ALL` breadcrumb, a large
 * title, a three-column grid of articles (16:9 image, title, `Author in Topic`, two-line excerpt, tag
 * chips) and numbered round pagination with previous and next arrows.
 */
export function BlogAllPage({ page, topic }: { page: number; topic?: string }) {
  const category = topic ? categoryById(topic) : undefined;
  const pool = category ? postsInCategory(category.id) : BLOG_POSTS;
  const lastPage = Math.max(1, Math.ceil(pool.length / ALL_PAGE_SIZE));
  const current = Math.min(page, lastPage);
  const posts = pool.slice((current - 1) * ALL_PAGE_SIZE, current * ALL_PAGE_SIZE);
  const searchFor = (n: number) => ({ page: n, topic: category?.id });

  return (
    <div className="bg-black/[0.03] pb-2">
      <nav aria-label="Blog topics" className="border-b border-black/[0.06] bg-white px-4 py-4">
        <div className="no-scrollbar mx-auto flex max-w-[var(--container-wide)] items-center justify-start gap-6 overflow-x-auto md:justify-center md:gap-8">
          <Link
            to="/blog/all"
            search={{ page: 1 }}
            className={cn(
              "shrink-0 text-[16px] font-normal t-colors hover:text-terracotta",
              category ? "text-fg" : "text-fg underline decoration-2 underline-offset-8",
            )}
          >
            All
          </Link>
          {BLOG_CATEGORIES.map((item) => (
            <Link
              key={item.id}
              to="/blog/all"
              search={{ page: 1, topic: item.id }}
              className={cn(
                "shrink-0 text-[16px] font-normal t-colors hover:text-terracotta",
                category?.id === item.id ? "text-fg underline decoration-2 underline-offset-8" : "text-fg",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <section className="w-full rounded-b-[24px] bg-white pt-10 pb-14 md:pt-14 md:pb-20">
        <div className="mx-auto w-full max-w-[68.25rem] px-4 md:px-6">
          <div className="flex flex-wrap items-center gap-1.5 text-[12px] tracking-[0.04em] uppercase">
            <Link to="/blog" className="font-medium text-fg t-colors hover:text-terracotta">
              HOME
            </Link>
            <span className="text-black/45" aria-hidden="true">
              /
            </span>
            <span className="text-black/54">{category ? category.label : "ALL"}</span>
          </div>

          <h1 className="mt-3 text-[clamp(2.75rem,calc(2.75rem+44*(100vw-22.5rem)/64.5),5.4375rem)] leading-[1] font-[410] tracking-[-0.02em] text-fg">
            {category ? category.label : "All Articles"}
          </h1>

          <ul className="mt-10 grid gap-x-12 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => {
              const cat = categoryForPost(post.slug);
              return (
                <li key={post.slug} className="min-w-0">
                  <article>
                    <Link to="/blog/$slug" params={{ slug: post.slug }} className="group block">
                      <div className="t-zoom overflow-hidden rounded-[15px] bg-black/[0.06]">
                        <Media
                          src={post.image.src}
                          alt={post.image.alt}
                          ratio="16 / 9"
                          tone="sand"
                          priority={current === 1 && index < 3}
                        />
                      </div>
                      <h2 className="mt-4 text-[clamp(1.375rem,1.9vw,1.8125rem)] leading-[1.15] font-[458] tracking-[-0.015em] text-fg t-colors group-hover:text-terracotta">
                        {post.title}
                      </h2>
                      <p className="mt-2 text-[12px] leading-snug text-muted">
                        <span className="font-medium text-fg">{post.author}</span> in{" "}
                        <span className="font-medium text-fg">{cat.label}</span>
                      </p>
                      <p className="mt-2 line-clamp-2 text-[16px] leading-[1.42] text-muted">{post.excerpt}</p>
                    </Link>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex rounded-[20px] bg-black/[0.06] px-2.5 py-1.5 text-[12px] leading-none text-fg">
                        {cat.tag}
                      </span>
                      <span className="inline-flex rounded-[20px] bg-black/[0.06] px-2.5 py-1.5 text-[12px] leading-none text-fg">
                        {cat.secondaryTag}
                      </span>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          {lastPage > 1 ? (
            <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-3">
              {current > 1 ? (
                <Link
                  to="/blog/all"
                  search={searchFor(current - 1)}
                  rel="prev"
                  aria-label="Previous page"
                  className={cn(CIRCLE, "size-12")}
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </Link>
              ) : (
                <span
                  aria-hidden="true"
                  className={cn(CIRCLE, "pointer-events-none size-12 text-black/33 opacity-[0.44]")}
                >
                  <ChevronLeft className="size-5" />
                </span>
              )}
              <div className="flex items-center gap-2.5 px-3">
                {pageNumbers(current, lastPage).map((n, index) =>
                  n === 0 ? (
                    <span key={`gap-${index}`} className="flex w-4 items-center justify-center text-[12px] text-fg">
                      ...
                    </span>
                  ) : (
                    <Link
                      key={n}
                      to="/blog/all"
                      search={searchFor(n)}
                      aria-label={`Page ${n}`}
                      aria-current={n === current ? "page" : undefined}
                      className={cn(
                        CIRCLE,
                        "size-6 text-[12px]",
                        n === current && "bg-black text-white hover:bg-black",
                      )}
                    >
                      {n}
                    </Link>
                  ),
                )}
              </div>
              {current < lastPage ? (
                <Link
                  to="/blog/all"
                  search={searchFor(current + 1)}
                  rel="next"
                  aria-label="Next page"
                  className={cn(CIRCLE, "size-12")}
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </Link>
              ) : (
                <span
                  aria-hidden="true"
                  className={cn(CIRCLE, "pointer-events-none size-12 text-black/33 opacity-[0.44]")}
                >
                  <ChevronRight className="size-5" />
                </span>
              )}
            </nav>
          ) : null}

          <p className="mt-10 text-center text-[14px] text-black/65">
            *All images feature a model portrayal or clinical illustration (unless otherwise noted).
          </p>
        </div>
      </section>

      <div className="mt-2">
        <NewsletterCta />
      </div>
    </div>
  );
}
