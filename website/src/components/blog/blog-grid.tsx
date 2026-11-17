import { Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Article } from "./blog-data"

interface BlogGridProps {
  articles: Article[]
  onRead?: (article: Article) => void
  onResetFilter?: () => void
  totalArticles?: number
}

export function BlogGrid({ articles, onRead, onResetFilter, totalArticles }: BlogGridProps) {
  return (
    <section className="pt-10 pb-12 bg-[#fffdf9]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2a1c12]">
              Latest Articles
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              {articles.length} {articles.length === 1 ? "guide" : "guides"} from our clinical team
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {articles.map((article) => (
            <a
              key={article.id}
              href={`/blog/${article.slug}`}
              onClick={(e) => {
                if (onRead) {
                  e.preventDefault();
                  window.location.href = `/blog/${article.slug}`;
                }
              }}
              className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#e2d4c0] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-md"
            >
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#faf6f0]">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                </div>

                <div className="mt-4 flex items-center gap-2 text-[11px] text-muted px-5">
                  <Clock className="w-3 h-3" />
                  <span>{article.readingTime}</span>
                  <span>•</span>
                  <span>{article.date}</span>
                </div>

                <h3 className="mt-2 font-display text-lg font-bold text-[#2a1c12] group-hover:text-primary transition-colors line-clamp-2 leading-snug px-5">
                  {article.title}
                </h3>

                <p className="mt-2 text-xs text-muted leading-relaxed line-clamp-3 px-5">
                  {article.excerpt}
                </p>
              </div>

              <div className="mt-5 mx-5 mb-5 pt-3.5 border-t border-[#f0e8dc] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#e2d4c0]"
                  />
                  <span className="text-xs font-semibold text-fg">
                    {article.author.name}
                  </span>
                </div>

                <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                  <span>Read</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </a>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#e2d4c0] bg-white p-12 text-center max-w-md mx-auto shadow-sm">
            <p className="font-display text-xl font-bold text-[#2a1c12]">
              {(totalArticles ?? 0) === 0 ? "No blogs available" : "No articles found"}
            </p>
            <p className="mt-1 text-xs text-muted">
              {(totalArticles ?? 0) === 0 
                ? "Check back soon for new dental health articles from our clinical team."
                : "Try broadening your search term or selecting another category."}
            </p>
            {onResetFilter && (totalArticles ?? 0) > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResetFilter}
                className="mt-4 border-[#e2d4c0] text-fg hover:bg-[#faf6f0] hover:border-primary"
              >
                View All Articles
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
