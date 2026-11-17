import { useState, useMemo } from "react";
import { 
  Clock, 
  ArrowLeft, 
  Share2, 
  Check, 
  CheckCircle2, 
  CalendarPlus, 
  Calendar, 
  Tag, 
  BookOpen, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api, type BlogPost } from "@/lib/api";
import { ARTICLES, type Article } from "./blog-data";

interface BlogDetailProps {
  slug: string;
}

export function BlogDetail({ slug }: BlogDetailProps) {
  const [copied, setCopied] = useState(false);

  // 1. Fetch from API
  const { data: apiPost, isLoading: isApiLoading, error } = useQuery({
    queryKey: ["blog", slug],
    queryFn: () => api.blogs.get(slug).catch(() => null),
    enabled: !!slug,
  });

  // 2. Also fetch all blogs (or use static ARTICLES) for related articles
  const { data: allApiBlogs } = useQuery({
    queryKey: ["blogs"],
    queryFn: () => api.blogs.list().catch(() => []),
  });

  // 3. Match article either from API or static ARTICLES
  const article: Article | null = useMemo(() => {
    // Check static mock data first if it has rich sections
    const staticMatch = ARTICLES.find((a) => a.slug === slug);

    if (apiPost) {
      // Parse body if sections aren't provided
      const bodyText = apiPost.body || "";
      const sections = staticMatch?.content?.sections || [
        {
          heading: "Clinical Overview",
          body: bodyText || "Detailed clinical insights from our medical staff will be provided during consultation.",
        },
      ];

      return {
        id: apiPost.id,
        slug: apiPost.slug,
        title: apiPost.title,
        category: (apiPost.category?.toLowerCase() as Article["category"]) || staticMatch?.category || "hygiene",
        categoryLabel: apiPost.category || staticMatch?.categoryLabel || "Oral Health",
        author: {
          name: apiPost.author || staticMatch?.author?.name || "Dr. Hassan Bhojani",
          role: staticMatch?.author?.role || "Principal Dentist & Clinical Director",
          avatar: staticMatch?.author?.avatar || "/media/team-photo-pending.svg",
        },
        date: apiPost.published_at
          ? new Date(apiPost.published_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : staticMatch?.date || "Recent",
        readingTime: staticMatch?.readingTime || "4 min read",
        image: apiPost.cover_image_url || staticMatch?.image || "https://images.ctfassets.net/kygl0mrej7ni/5O9q1iObkIWOW6e2gW2gOe/73bcbc7688328ee63b4fa66973d9cd97/24_hour_emergency.png",
        excerpt: apiPost.excerpt || staticMatch?.excerpt || "",
        content: {
          intro: apiPost.excerpt || staticMatch?.content?.intro || apiPost.title,
          sections: sections,
          takeaways: staticMatch?.content?.takeaways || [
            "Maintain proactive oral hygiene appointments every six months",
            "Consult our GDC-registered clinical team for personalized recommendations",
            "Early intervention prevents advanced enamel erosion and periodontal disease",
          ],
        },
      };
    }

    if (staticMatch) {
      return staticMatch;
    }

    return null;
  }, [apiPost, slug]);

  // Related articles
  const relatedArticles: Article[] = useMemo(() => {
    const list: Article[] = [];
    if (allApiBlogs && allApiBlogs.length > 0) {
      allApiBlogs
        .filter((b) => b.slug !== slug)
        .slice(0, 3)
        .forEach((b) => {
          const matched = ARTICLES.find((a) => a.slug === b.slug);
          list.push({
            id: b.id,
            slug: b.slug,
            title: b.title,
            category: (b.category?.toLowerCase() as Article["category"]) || "hygiene",
            categoryLabel: b.category || "Oral Health",
            author: {
              name: b.author || "Dr. Hassan Bhojani",
              role: "Dental Care Team",
              avatar: "/media/team-photo-pending.svg",
            },
            date: b.published_at ? new Date(b.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Recent",
            readingTime: matched?.readingTime || "4 min read",
            image: b.cover_image_url || matched?.image || "https://images.ctfassets.net/kygl0mrej7ni/5O9q1iObkIWOW6e2gW2gOe/73bcbc7688328ee63b4fa66973d9cd97/24_hour_emergency.png",
            excerpt: b.excerpt || "",
            content: {
              intro: "",
              sections: [],
              takeaways: [],
            },
          });
        });
    }

    // Fallback to static articles
    if (list.length < 3) {
      ARTICLES.filter((a) => a.slug !== slug && !list.some((item) => item.slug === a.slug))
        .slice(0, 3 - list.length)
        .forEach((a) => list.push(a));
    }

    return list;
  }, [allApiBlogs, slug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isApiLoading && !article) {
    return (
      <div className="min-h-[60vh] bg-[#fffdf9] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-muted">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[60vh] bg-[#fffdf9] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl border border-[#e2d4c0] shadow-sm">
          <BookOpen className="size-12 text-primary mx-auto mb-4 opacity-80" />
          <h1 className="font-display text-2xl font-bold text-[#2a1c12]">Article Not Found</h1>
          <p className="mt-2 text-sm text-muted">
            The guide or article you are looking for may have been moved or updated.
          </p>
          <Button asChild className="mt-6 accent-gradient text-white">
            <a href="/blog" className="inline-flex items-center gap-2">
              <ArrowLeft className="size-4" />
              <span>Back to All Articles</span>
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // Schema.org Article structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalScholarlyArticle",
    headline: article.title,
    image: [article.image],
    datePublished: article.date,
    author: {
      "@type": "Person",
      name: article.author.name,
      jobTitle: article.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: "PavDental",
      logo: {
        "@type": "ImageObject",
        url: "https://pavdental.com/favicon.svg",
      },
    },
    description: article.excerpt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": typeof window !== "undefined" ? window.location.href : `https://pavdental.com/blogs/${article.slug}`,
    },
  };

  return (
    <article className="bg-[#fffdf9] text-fg pb-20">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Sub-header Breadcrumb & Back Bar */}
      <div className="bg-[#faf6f0] border-b border-[#e2d4c0]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <a
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to All Articles</span>
          </a>

          <div className="hidden sm:flex items-center gap-2 text-xs text-muted">
            <a href="/blog" className="hover:underline">Blogs</a>
            <span>/</span>
            <span className="text-fg font-medium truncate max-w-[200px]">{article.categoryLabel}</span>
          </div>
        </div>
      </div>

      {/* Article Header */}
      <header className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted mb-4">
          <span className="inline-flex items-center rounded-md bg-[#faf6f0] border border-[#e2d4c0] px-3 py-1 font-semibold text-primary uppercase text-[11px] tracking-wide">
            {article.categoryLabel}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="size-3.5" />
            {article.readingTime}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar className="size-3.5" />
            {article.date}
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2a1c12] tracking-tight leading-[1.15]">
          {article.title}
        </h1>

        {/* Author & Share Bar */}
        <div className="mt-8 flex items-center justify-between border-y border-[#e2d4c0] py-4">
          <div className="flex items-center gap-3.5">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="size-12 rounded-full object-cover border-2 border-[#e2d4c0] shadow-xs"
            />
            <div>
              <p className="text-sm font-bold text-[#2a1c12]">{article.author.name}</p>
              <p className="text-xs text-muted">{article.author.role}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-2 rounded-full border border-[#e2d4c0] bg-[#faf6f0] px-3.5 py-1.5 text-xs font-semibold text-fg hover:text-primary hover:border-primary transition-all duration-200 shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="size-3.5" />
                <span>Share Guide</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Cover Image */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#faf6f0] border border-[#e2d4c0] shadow-md">
          <img
            src={article.image}
            alt={article.title}
            className="size-full object-cover"
          />
        </div>
      </div>

      {/* Article Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-10">
        {/* Intro Highlight Lead */}
        {article.content.intro && (
          <div className="text-lg sm:text-xl leading-relaxed text-[#2a1c12] font-display border-l-4 border-primary pl-6 py-3.5 pr-4 bg-[#faf6f0] rounded-r-2xl mb-10 border border-l-primary border-[#e2d4c0]">
            <p>{article.content.intro}</p>
          </div>
        )}

        {/* Structured Content Sections */}
        <div className="space-y-10">
          {article.content.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2a1c12]">
                {section.heading}
              </h2>
              <div className="text-base sm:text-lg leading-relaxed text-[#4a3b32] space-y-4 font-normal">
                {section.body.split("\n\n").map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Clinical Takeaways Box */}
        {article.content.takeaways && article.content.takeaways.length > 0 && (
          <div className="mt-12 rounded-2xl border border-[#e2d4c0] bg-[#faf6f0] p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="size-5 text-primary" />
              <h3 className="font-display text-xl font-bold text-[#2a1c12]">
                Key Clinical Takeaways
              </h3>
            </div>
            <div className="space-y-3">
              {article.content.takeaways.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm sm:text-base text-[#2a1c12]">
                  <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                  <span className="leading-snug">{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio Box */}
        <div className="mt-12 rounded-2xl border border-[#e2d4c0] bg-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={article.author.avatar}
            alt={article.author.name}
            className="size-16 rounded-full object-cover border-2 border-primary/20 shrink-0"
          />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">About the Author</span>
              <span className="text-xs text-muted">•</span>
              <span className="text-xs text-muted">GDC Registered</span>
            </div>
            <h4 className="font-display text-lg font-bold text-[#2a1c12]">
              {article.author.name}
            </h4>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Practicing at PavDental Bradford (786 Leeds Road). Specializing in modern restorative care, biomimetic cosmetic dentistry, and patient-centered emergency treatments.
            </p>
          </div>
        </div>

        {/* Consultation Call to Action Banner */}
        <div className="mt-12 rounded-2xl accent-gradient p-7 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-lg">
          <div className="space-y-2">
            <h4 className="font-display text-2xl font-bold">Have Questions About This Treatment?</h4>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl">
              Book a comprehensive smile consultation with our clinicians at PavDental Bradford. Complete check-ups from £35.
            </p>
          </div>
          <Button asChild size="lg" className="bg-white text-[#844d1e] hover:bg-white/90 font-bold text-sm shadow-md shrink-0">
            <a href="/booking">
              <CalendarPlus className="size-4 mr-2" />
              <span>Book Appointment</span>
            </a>
          </Button>
        </div>
      </div>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-20 pt-12 border-t border-[#e2d4c0]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2a1c12]">
                Related Clinical Guides
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted">
                Explore more patient education articles from our Bradford dental team
              </p>
            </div>
            <a
              href="/blog"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View all guides</span>
              <ArrowRight className="size-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((rel) => (
              <a
                key={rel.id}
                href={`/blog/${rel.slug}`}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#e2d4c0] bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-md"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#faf6f0]">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[11px] text-muted px-4">
                    <Clock className="size-3" />
                    <span>{rel.readingTime}</span>
                    <span>•</span>
                    <span>{rel.date}</span>
                  </div>

                  <h3 className="mt-2 font-display text-base font-bold text-[#2a1c12] group-hover:text-primary transition-colors line-clamp-2 leading-snug px-4">
                    {rel.title}
                  </h3>

                  <p className="mt-2 text-xs text-muted leading-relaxed line-clamp-2 px-4">
                    {rel.excerpt}
                  </p>
                </div>

                <div className="mt-4 mx-4 mb-4 pt-3 border-t border-[#f0e8dc] flex items-center justify-between">
                  <span className="text-xs font-semibold text-fg truncate max-w-[120px]">
                    {rel.author.name}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                    <span>Read</span>
                    <ArrowRight className="size-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

