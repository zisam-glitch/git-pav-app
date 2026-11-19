import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ContentBlocks } from "@/components/content/content-blocks";
import { BookButton, CallButton, CtaBand, Heading, Section, Tile } from "@/components/hims";
import { BLOG_POSTS, type BlogPost } from "@/content/blog-posts";
import { blogPostingJsonLd } from "@/lib/seo";

/** One post: back link, heading, byline, the article, the posts either side of it, and the most recent others. */
export function BlogPostPage({ post }: { post: BlogPost }) {
  const position = BLOG_POSTS.findIndex((candidate) => candidate.slug === post.slug);
  // Newest first, so the post after this one in the list is the older one.
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
    <>
      <script
        type="application/ld+json"
        // "<" is escaped so no text in the data can end the script early.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
      />

      <Section theme="cream" width="wide" space="sm">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-label text-fg t-colors hover:text-terracotta"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Blog
        </Link>

        <Heading as="h1" size="hero" className="mt-6 max-w-[46rem]">
          {post.title}
        </Heading>

        <p className="mt-4 flex flex-wrap items-center gap-x-3 text-body text-muted">
          <span>By {post.author}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.date}>{post.dateLabel}</time>
        </p>
      </Section>

      <Section theme="white" width="wide" space="default">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,46rem)_18rem] lg:justify-between">
          <article>
            <ContentBlocks blocks={post.blocks} />

            <nav
              aria-label="More posts"
              className="mt-12 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
            >
              {previous ? (
                <Link
                  to="/blog/$slug"
                  params={{ slug: previous.slug }}
                  rel="prev"
                  className="rounded-xl border border-transparent bg-tile-cream p-5 t-lift hover:border-border hover:bg-white"
                >
                  <span className="flex items-center gap-2 text-caption font-medium text-terracotta">
                    <ArrowLeft className="size-3.5" aria-hidden="true" />
                    Previous Post
                  </span>
                  <span className="mt-2 block text-label text-fg">{previous.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  to="/blog/$slug"
                  params={{ slug: next.slug }}
                  rel="next"
                  className="rounded-xl border border-transparent bg-tile-cream p-5 text-right t-lift hover:border-border hover:bg-white sm:col-start-2"
                >
                  <span className="flex items-center justify-end gap-2 text-caption font-medium text-terracotta">
                    Next Post
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </span>
                  <span className="mt-2 block text-label text-fg">{next.title}</span>
                </Link>
              ) : null}
            </nav>
          </article>

          <aside aria-label="Recent posts" className="lg:sticky lg:top-24">
            <Tile tone="cream" className="p-6">
              <h2 className="text-h4 text-fg">Recent Posts</h2>
              <ul className="mt-4 divide-y divide-border">
                {recent.map((recentPost) => (
                  <li key={recentPost.slug} className="py-3 first:pt-0 last:pb-0">
                    <Link
                      to="/blog/$slug"
                      params={{ slug: recentPost.slug }}
                      className="group block"
                    >
                      <span className="block text-small font-medium leading-snug text-fg t-colors group-hover:text-terracotta">
                        {recentPost.title}
                      </span>
                      <time
                        dateTime={recentPost.date}
                        className="mt-1 block text-caption text-muted"
                      >
                        {recentPost.dateLabel}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            </Tile>
          </aside>
        </div>
      </Section>

      <CtaBand
        theme="brown"
        title="Ready for dental care"
        accent="that fits your life?"
        tone="gold"
        actions={
          <>
            <BookButton variant="gold">Book Now</BookButton>
            <CallButton variant="glass" />
          </>
        }
      >
        786 Leeds Road, Bradford, BD3 9TY · Open 00:00 – 24:00, seven days a week.
      </CtaBand>
    </>
  );
}
