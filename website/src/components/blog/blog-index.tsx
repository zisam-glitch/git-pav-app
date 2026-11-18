import { Link } from "@tanstack/react-router";
import { BLOG_POSTS } from "@/content/blog-posts";
import { NewsletterCta } from "./newsletter-cta";

/** The blog page: one card per post, newest first, as on the live site. */
export function BlogIndex() {
  return (
    <div className="bg-[#fffdf9] pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20">
        <header className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">Read Latest Articles</h1>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6b5848]">
            Discover the latest news and insights on oral health, cosmetic dentistry, and more at Pav Dental's blog. Stay
            informed and improve your smile!
          </p>
        </header>

        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post, index) => (
            <li key={post.slug}>
              <article className="h-full">
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group flex h-full flex-col overflow-hidden rounded-xl   bg-white shadow-sm transition-colors hover:border-[#925a27]"
                >
                  <img
                    src={post.image.src}
                    alt={post.image.alt}
                    loading={index < 3 ? "eager" : "lazy"}
                    className="aspect-[16/10] w-full bg-[#faf6f0] object-cover"
                  />
                  <span className="flex flex-1 flex-col p-5">
                    <span className="flex flex-wrap items-center gap-x-3 text-xs text-[#6b5848]">
                      <time dateTime={post.date}>{post.dateLabel}</time>
                      <span>Posted by: {post.author}</span>
                    </span>
                    <h2 className="mt-3 font-display text-lg font-bold leading-snug text-[#2a1c12] group-hover:text-[#925a27]">
                      {post.title}
                    </h2>
                    <span className="mt-2 block text-sm leading-relaxed text-[#6b5848]">{post.excerpt}</span>
                    <span className="mt-4 text-sm font-semibold text-[#925a27]">Read More</span>
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
