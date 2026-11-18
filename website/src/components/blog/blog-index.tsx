import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "@/content/blog-posts";
import { NewsletterCta } from "./newsletter-cta";

/** The blog page: featured split card + 2-column article grid matching Hims Newsroom. */
export function BlogIndex() {
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <div className="bg-[#FBF8F5] pt-24 sm:pt-28">
      <div className="mx-auto max-w-[87rem] px-4 pb-16 sm:px-6 lg:px-8">
        <header className="max-w-2xl pb-10">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Pav Dental Journal
          </p>
          <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.04em] leading-[1.06] text-black sm:text-5xl lg:text-6xl">
            Read Latest <span className="text-[#754B3D]">Articles</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-black/65 sm:text-base">
            Discover the latest news and insights on oral health, cosmetic dentistry, and more at
            Pav Dental&apos;s blog. Stay informed and improve your smile!
          </p>
        </header>

        {/* Featured top 2-column split card */}
        {featured && (
          <article className="mb-8">
            <Link
              to="/blog/$slug"
              params={{ slug: featured.slug }}
              className="group grid items-center gap-6 rounded-[1.5rem] border border-black/6 bg-[#FAF8F2] p-4 transition-all duration-200 hover:bg-white hover:shadow-[0_10px_32px_rgba(0,0,0,0.05)] sm:p-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10"
            >
              <div className="overflow-hidden rounded-[1.125rem] bg-[#F2EDE5]">
                <img
                  src={featured.image.src}
                  alt={featured.image.alt}
                  loading="eager"
                  className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>

              <div className="flex flex-col items-start px-1 py-2 sm:px-2">
                <span className="inline-block rounded-full border border-black/12 bg-white px-3.5 py-1 text-xs font-medium text-black/75">
                  Posted by: {featured.author}
                </span>
                <h2 className="mt-4 font-display text-2xl font-normal leading-[1.12] tracking-[-0.035em] text-black transition-colors group-hover:text-[#1B3745] sm:text-3xl lg:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-black/65 sm:text-base">
                  {featured.excerpt}
                </p>
                <div className="mt-5 flex w-full items-center justify-between border-t border-black/8 pt-4 text-xs text-black/55">
                  <time dateTime={featured.date}>{featured.dateLabel}</time>
                  <span className="inline-flex items-center gap-1.5 font-medium text-black group-hover:text-[#754B3D]">
                    Read More
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </div>
            </Link>
          </article>
        )}

        {/* 2-column article grid */}
        <ul className="grid gap-6 md:grid-cols-2">
          {rest.map((post, index) => (
            <li key={post.slug}>
              <article className="h-full">
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-black/6 bg-[#FAF8F2] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_28px_rgba(0,0,0,0.05)] sm:p-5"
                >
                  <div className="overflow-hidden rounded-[1.125rem] bg-[#F2EDE5]">
                    <img
                      src={post.image.src}
                      alt={post.image.alt}
                      loading={index < 2 ? "eager" : "lazy"}
                      className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <span className="flex flex-1 flex-col pt-5">
                    <span>
                      <span className="inline-block rounded-full border border-black/12 bg-white px-3 py-1 text-xs font-medium text-black/70">
                        Posted by: {post.author}
                      </span>
                    </span>
                    <h2 className="mt-3.5 font-display text-xl font-normal leading-snug tracking-[-0.03em] text-black transition-colors group-hover:text-[#1B3745] sm:text-2xl">
                      {post.title}
                    </h2>
                    <span className="mt-2.5 block flex-1 text-sm leading-relaxed text-black/60">
                      {post.excerpt}
                    </span>
                    <span className="mt-5 flex items-center justify-between border-t border-black/8 pt-4 text-xs text-black/55">
                      <time dateTime={post.date}>{post.dateLabel}</time>
                      <span className="inline-flex items-center gap-1 font-medium text-black group-hover:text-[#754B3D]">
                        Read More
                        <ArrowRight
                          className="size-3.5 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </span>
                  </span>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
      <NewsletterCta />
    </div>
  );
}
