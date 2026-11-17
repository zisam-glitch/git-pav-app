import { Clock, ArrowRight, Sparkles } from "lucide-react"
import { Article } from "./blog-data"

interface FeaturedArticleProps {
  article: Article | null
  onRead?: (article: Article) => void
}

export function FeaturedArticle({ article, onRead }: FeaturedArticleProps) {
  if (!article) return null;

  return (
    <section className="pt-12 bg-[#fffdf9]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <a
          href={`/blog/${article.slug}`}
          onClick={(e) => {
            if (onRead) {
              e.preventDefault();
              window.location.href = `/blog/${article.slug}`;
            }
          }}
          className="group cursor-pointer relative overflow-hidden rounded-xl border border-[#e2d4c0] bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:border-primary/40 grid grid-cols-1 lg:grid-cols-12 gap-0"
        >
          <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-[#faf6f0]">
            <img
              src={article.image}
              alt={article.title}
              className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
          </div>

          <div className="lg:col-span-5 p-7 sm:p-9 lg:p-10 flex flex-col justify-between space-y-4 bg-[#faf6f0] border-t lg:border-t-0 lg:border-l border-[#e2d4c0]">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-muted">
                <span className="font-semibold text-primary uppercase">
                  {article.categoryLabel}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readingTime}
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2a1c12] group-hover:text-primary transition-colors leading-tight">
                {article.title}
              </h2>

              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                {article.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-[#e2d4c0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#e2d4c0]"
                />
                <div>
                  <p className="text-xs font-bold text-fg">{article.author.name}</p>
                  <p className="text-[11px] text-muted">{article.author.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                <span className="hidden sm:inline">Read Guide</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </a>
      </div>
    </section>
  )
}
