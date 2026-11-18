import { useState, type FormEvent } from "react"
import { Mail, CheckCircle2, ShieldCheck } from "lucide-react"
import { api } from "@/lib/api"

export function NewsletterCta() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setError(null)
    setLoading(true)
    try {
      await api.forms.subscribeNewsletter({ email: email.trim() })
      setSubscribed(true)
    } catch (err: any) {
      setError(err?.message || "Could not subscribe. Please check your email and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 sm:py-20 bg-[#fffdf9]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative overflow-hidden rounded-xl accent-gradient p-8 sm:p-12 text-white shadow-xl">
          <div className="pointer-events-none absolute -right-20 -top-20 w-60 h-60 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 w-60 h-60 rounded-full bg-black/10 blur-2xl" />

          <div className="relative max-w-xl mx-auto space-y-3">
            

            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">
              Get Smile Advice Delivered to Your Inbox
            </h2>

            <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-light">
              Join our patient community across West Yorkshire for monthly dental hygiene tips, cosmetic guides, and exclusive clinic treatment offers.
            </p>

            {subscribed ? (
              <div className="mt-6 rounded-xl bg-white/15   p-5">
                <CheckCircle2 className="w-8 h-8 mx-auto text-white mb-2" />
                <p className="text-sm font-bold">You're Subscribed!</p>
                <p className="text-xs text-white/85 mt-1">
                  Thank you. We'll send you our latest guides and advice once a month.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-white/80" />
                  <input
                    required
                    type="email"
                    aria-label="Email address"
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 rounded-xl bg-white/10   text-white pl-10 pr-4 text-xs sm:text-sm placeholder:text-white/75 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/80"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 bg-white text-[#925a27] hover:bg-white/90 font-bold text-xs sm:text-sm px-6 shrink-0 shadow-sm rounded-full transition-colors duration-150 cursor-pointer disabled:opacity-75"
                >
                  {loading ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            )}
            {error && <p className="text-xs text-red-200 mt-2 font-medium">{error}</p>}

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/80 pt-2">
              <ShieldCheck className="w-3 h-3" />
              <span>Zero spam. Unsubscribe at any time with one click.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
