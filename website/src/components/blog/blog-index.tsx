import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Heading, Media, Section } from "@/components/hims";
import { BLOG_POSTS } from "@/content/blog-posts";
import { NewsletterCta } from "./newsletter-cta";

const BLOG_COVERS: Record<string, string> = {
  "can-a-dentist-assess-a-dental-problem-through-a-video-call-what-can-and-cant-be-checked":
    "/images/generated/blog-video-consultation.jpg",
  "tooth-extraction-in-bradford-when-is-removing-a-tooth-the-best-option":
    "/images/generated/blog-tooth-extraction.jpg",
  "24-hour-emergency-dentist-bradford-when-to-call-why-it-matters-and-how-to-get-seen":
    "/images/generated/blog-emergency-bradford.jpg",
  "botox-vs-dermal-fillers-finding-the-right-facial-aesthetics-treatment-in-bradford":
    "/images/generated/blog-botox-vs-fillers.jpg",
  "can-you-whiten-just-one-tooth-what-causes-single-tooth-discolouration":
    "/images/generated/blog-single-tooth-whitening.jpg",
  "24-hour-emergency-dentist-in-leeds-how-quickly-can-you-get-seen":
    "/images/generated/blog-emergency-leeds.jpg",
};

/** The blog page: one card per post, newest first, as on the live site. */
export function BlogIndex() {
  return (
    <>
      <Section theme="cream" width="wide" space="sm">
        <div className="max-w-2xl">
          <Heading as="h1" size="hero" accent="Articles" tone="terracotta" inline>
            Read Latest
          </Heading>
          <p className="mt-4 text-lead text-muted">
            Discover the latest news and insights on oral health, cosmetic dentistry, and more at
            Pav Dental&apos;s blog. Stay informed and improve your smile!
          </p>
        </div>
      </Section>

      <Section theme="white" width="wide" space="default">
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post, index) => {
            const localCover =
              BLOG_COVERS[post.slug] ??
              (post.image.src.startsWith("/") ? post.image.src : undefined);
            return (
              <li key={post.slug} className="flex">
                <article className="flex w-full">
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-transparent bg-tile-cream p-4 t-lift hover:border-border hover:bg-white md:p-[18px]"
                  >
                    <div className="t-zoom overflow-hidden rounded-xl">
                      <Media
                        src={localCover}
                        alt={localCover ? post.title : ""}
                        ratio="16 / 10"
                        tone={index % 2 === 0 ? "sand" : "sage"}
                        priority={index === 0}
                      />
                    </div>
                    <span className="mt-4 flex flex-1 flex-col">
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-muted">
                        <time dateTime={post.date}>{post.dateLabel}</time>
                        <span>Posted by: {post.author}</span>
                      </span>
                      <h2 className="mt-2 text-h4 text-fg t-colors group-hover:text-terracotta">
                        {post.title}
                      </h2>
                      <span className="mt-2 block flex-1 text-small text-muted">
                        {post.excerpt}
                      </span>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-label text-fg">
                        Read More
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </span>
                    </span>
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      </Section>

      <NewsletterCta />
    </>
  );
}
