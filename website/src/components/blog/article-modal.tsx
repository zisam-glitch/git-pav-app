import { useState } from "react"
import { X, Clock, CheckCircle2, Share2, Check, ArrowRight, CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Article } from "./blog-data"

interface ArticleModalProps {
  article: Article | null
  isOpen: boolean
  onClose: () => void
}

export function ArticleModal({ article, isOpen, onClose }: ArticleModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !article) return null

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div
        className="relative w-full max-w-3xl rounded-xl bg-white p-6 sm:p-10 shadow-2xl my-8 max-h-[90vh] overflow-y-auto border border-[#e2d4c0]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="sticky top-0 float-right z-20 flex w-9 h-9 items-center justify-center rounded-full bg-[#faf6f0] text-fg hover:bg-[#f0e8dc] shadow-sm -mt-2 -mr-2 border border-[#e2d4c0]"
          aria-label="Close article"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 text-xs text-muted mb-3">
          <span className="inline-flex items-center rounded-md bg-[#faf6f0] border border-[#e2d4c0] px-2.5 py-1 font-semibold text-primary uppercase text-[10px]">
            {article.categoryLabel}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.readingTime}
          </span>
          <span>•</span>
          <span>{article.date}</span>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2a1c12] leading-tight">
          {article.title}
        </h1>

        <div className="mt-5 flex items-center justify-between border-y border-[#e8ddd0] py-3.5">
          <div className="flex items-center gap-3">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-11 h-11 rounded-full object-cover border border-[#e2d4c0]"
            />
            <div>
              <p className="text-xs sm:text-sm font-bold text-fg">{article.author.name}</p>
              <p className="text-[11px] text-muted">{article.author.role}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-full border border-[#e2d4c0] bg-[#faf6f0] px-3 py-1.5 text-xs text-muted hover:text-fg hover:border-primary transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3 h-3" />
                <span>Share Guide</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-6 aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#faf6f0] border border-[#e2d4c0]">
          <img
            src={article.image}
            alt={article.title}
            className="size-full object-cover"
          />
        </div>

        <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#2a1c12] font-display border-l-2 border-primary pl-4 bg-[#faf6f0] py-2 pr-3 rounded-r-lg">
          {article.content.intro}
        </p>

        <div className="mt-8 space-y-6 text-sm sm:text-base leading-relaxed text-muted">
          {article.content.sections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2a1c12]">
                {sec.heading}
              </h2>
              <p className="text-muted leading-relaxed">
                {sec.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-[#e2d4c0] bg-[#faf6f0] p-6 sm:p-7">
          <h3 className="font-display text-lg font-bold text-primary mb-3">
            Key Clinical Takeaways
          </h3>
          <div className="space-y-2.5">
            {article.content.takeaways.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2a1c12]">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-xl accent-gradient p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-md">
          <div>
            <h4 className="font-display text-xl font-bold">Have Questions About This Treatment?</h4>
            <p className="text-xs text-white/90 mt-1">Book a comprehensive smile consultation with our clinicians at 786 Leeds Road, Bradford.</p>
          </div>
          <Button asChild size="lg" className="bg-white text-[#cf9448] hover:bg-white/90 font-bold text-xs sm:text-sm shadow-sm shrink-0">
            <a href="/contact-us">
              <CalendarPlus className="w-4 h-4 mr-1.5" />
              <span>Book Consultation</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
