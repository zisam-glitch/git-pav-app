import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ContentBlocks } from "@/components/content/content-blocks";
import { Button } from "@/components/ui/button";
import { BLOG_POSTS, type BlogPost } from "@/content/blog-posts";
import { BOOKING_URL } from "@/lib/enquiry";
import { blogPostingJsonLd } from "@/lib/seo";

/** One post: back link, heading, byline, the article, the posts either side of it, and the most recent others. */
export function BlogPostPage({ post }: { post: BlogPost }) {
  const position = BLOG_POSTS.findIndex((candidate) => candidate.slug === post.slug);
  const previous = BLOG_POSTS[position + 1];
  const next = BLOG_POSTS[position - 1];
  const recent = BLOG_POSTS.filter((candidate) => candidate.slug !== post.slug).slice(0, 3);
  const data = blogPostingJsonLd({
    slug: post.slug,
    title: post.title,
    date: post.date,
    author: post.author,
    image: post.image.src,
  });

  return (
    <div className="bg-[#FBF8F5] pt-24 pb-20 sm:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-black/65 transition-colors hover:text-[#1B3745]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Blog
        </Link>

        <div className="mt-8 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <article>
            <div className="flex flex-wrap items-center gap-3 text-xs text-black/60">
              <span className="inline-block rounded-full bg-[#F2EDE5] px-3 py-1 font-medium text-[#1B3745]">
                By {post.author}
              </span>
              <time dateTime={post.date}>{post.dateLabel}</time>
            </div>
            <h1 className="mt-4 font-display text-3xl font-normal leading-[1.08] tracking-[-0.04em] text-black sm:text-5xl">
              {post.title}
            </h1>
            <div className="mt-8 border-t border-black/10 pt-4">
              <ContentBlocks blocks={post.blocks} />
            </div>

            <nav
              aria-label="More posts"
              className="mt-12 grid gap-4 border-t border-black/10 pt-8 sm:grid-cols-2"
            >
              {previous ? (
                <Link
                  to="/blog/$slug"
                  params={{ slug: previous.slug }}
                  rel="prev"
                  className="group rounded-[1.5rem] border border-black/6 bg-[#FAF8F2] p-5 transition-colors hover:bg-white"
                >
                  <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#754B3D]">
                    <ArrowLeft className="size-3.5" aria-hidden="true" />
                    Previous Post
                  </span>
                  <span className="mt-2 block font-display text-base font-normal tracking-[-0.02em] text-black group-hover:text-[#1B3745]">
                    {previous.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  to="/blog/$slug"
                  params={{ slug: next.slug }}
                  rel="next"
                  className="group rounded-[1.5rem] border border-black/6 bg-[#FAF8F2] p-5 text-right transition-colors hover:bg-white sm:col-start-2"
                >
                  <span className="flex items-center justify-end gap-2 text-xs font-medium uppercase tracking-wider text-[#754B3D]">
                    Next Post
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </span>
                  <span className="mt-2 block font-display text-base font-normal tracking-[-0.02em] text-black group-hover:text-[#1B3745]">
                    {next.title}
                  </span>
                </Link>
              )}
            </nav>
          </article>

          <aside aria-label="Recent posts" className="space-y-6 lg:sticky lg:top-28">
            <div className="rounded-[1.5rem] border border-black/6 bg-[#FAF8F2] p-6">
              <h2 className="font-display text-xl font-normal tracking-[-0.03em] text-black">
                Recent Posts
              </h2>
              <ul className="mt-4 divide-y divide-black/10">
                {recent.map((recentPost) => (
                  <li key={recentPost.slug} className="py-3.5 first:pt-1 last:pb-1">
                    <Link to="/blog/$slug" params={{ slug: recentPost.slug }} className="group block">
                      <span className="block text-sm font-medium leading-snug text-black transition-colors group-hover:text-[#754B3D]">
                        {recentPost.title}
                      </span>
                      <time dateTime={recentPost.date} className="mt-1 block text-xs text-black/50">
                        {recentPost.dateLabel}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.5rem] hims-navy-gradient p-6 text-white">
              <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                Need Dental Advice?
              </p>
              <p className="mt-2 font-display text-xl font-normal tracking-[-0.03em] text-white">
                Book a £35 check-up or speak with a clinician today.
              </p>
              <Button asChild variant="gold" className="mt-5 w-full">
                <a href={BOOKING_URL}>Book Appointment</a>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
