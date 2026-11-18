import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ContentBlocks } from "@/components/content/content-blocks";
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
    <div className="bg-[#fffdf9] pt-24 pb-20">
      <script
        type="application/ld+json"
        // "<" is escaped so no text in the data can end the script early.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-[#925a27] hover:underline">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Blog
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <article>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">{post.title}</h1>
            <p className="mt-4 flex flex-wrap items-center gap-x-3 text-sm text-[#6b5848]">
              <span>By {post.author}</span>
              <time dateTime={post.date}>{post.dateLabel}</time>
            </p>
            <div className="mt-2">
              <ContentBlocks blocks={post.blocks} />
            </div>

            <nav aria-label="More posts" className="mt-12 grid gap-4   pt-8 sm:grid-cols-2">
              {previous ? (
                <Link
                  to="/blog/$slug"
                  params={{ slug: previous.slug }}
                  rel="prev"
                  className="rounded-lg   bg-white p-4 hover:border-[#925a27]"
                >
                  <span className="flex items-center gap-2 text-xs font-bold uppercase text-[#925a27]">
                    <ArrowLeft className="size-3.5" aria-hidden="true" />
                    Previous Post
                  </span>
                  <span className="mt-2 block text-sm font-semibold text-[#2a1c12]">{previous.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  to="/blog/$slug"
                  params={{ slug: next.slug }}
                  rel="next"
                  className="rounded-lg   bg-white p-4 text-right hover:border-[#925a27] sm:col-start-2"
                >
                  <span className="flex items-center justify-end gap-2 text-xs font-bold uppercase text-[#925a27]">
                    Next Post
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </span>
                  <span className="mt-2 block text-sm font-semibold text-[#2a1c12]">{next.title}</span>
                </Link>
              )}
            </nav>
          </article>

          <aside aria-label="Recent posts">
            <h2 className="font-display text-xl font-bold text-[#2a1c12]">Recent Posts</h2>
            <ul className="mt-4 space-y-4">
              {recent.map((recentPost) => (
                <li key={recentPost.slug}>
                  <Link to="/blog/$slug" params={{ slug: recentPost.slug }} className="group block">
                    <span className="block text-sm font-semibold leading-snug text-[#2a1c12] group-hover:text-[#925a27]">
                      {recentPost.title}
                    </span>
                    <time dateTime={recentPost.date} className="mt-1 block text-xs text-[#6b5848]">
                      {recentPost.dateLabel}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
