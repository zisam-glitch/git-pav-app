import { useState, type FormEvent } from "react";
import { Mail, CheckCircle2, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

export function NewsletterCta() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await api.forms.subscribeNewsletter({ email: email.trim() });
      setSubscribed(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : undefined;
      setError(msg || "Could not subscribe. Please check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#FBF8F5] py-12 sm:py-16">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[1.5rem] hims-navy-gradient px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <div className="relative mx-auto max-w-xl space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
              Patient Newsletter
            </p>
            <h2 className="font-display text-3xl font-normal tracking-[-0.04em] text-white sm:text-4xl">
              Get Smile Advice Delivered to Your Inbox
            </h2>

            <p className="text-sm leading-relaxed text-white/75 sm:text-base">
              Join our patient community across West Yorkshire for monthly dental hygiene tips,
              cosmetic guides, and clinic updates.
            </p>

            {subscribed ? (
              <div className="mt-6 rounded-[1.25rem] border border-white/15 bg-white/10 p-6">
                <CheckCircle2 className="mx-auto mb-2 size-8 text-[#ECD880]" />
                <p className="text-sm font-medium text-white">You&apos;re Subscribed</p>
                <p className="mt-1 text-xs text-white/80">
                  Thank you. We&apos;ll send you our latest guides and advice once a month.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mx-auto mt-6 flex max-w-md flex-col gap-2.5 sm:flex-row"
              >
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/70" />
                  <input
                    required
                    type="email"
                    aria-label="Email address"
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-full border border-white/20 bg-white/10 pl-11 pr-4 text-sm text-white placeholder:text-white/65 focus:border-[#ECD880] focus:outline-none focus:ring-2 focus:ring-[#ECD880]/40"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 shrink-0 cursor-pointer rounded-full bg-[#ECD880] px-7 text-sm font-medium text-[#1B3745] transition-colors duration-200 hover:bg-[#FDEAA0] disabled:opacity-75"
                >
                  {loading ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            )}
            {error && <p className="mt-2 text-xs font-medium text-red-200">{error}</p>}

            <div className="flex items-center justify-center gap-1.5 pt-2 text-xs text-white/70">
              <ShieldCheck className="size-3.5 text-[#ECD880]" />
              <span>Zero spam. Unsubscribe at any time with one click.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
