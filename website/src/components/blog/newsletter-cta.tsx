import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { BookButton, CallButton, Heading, Section } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <Section theme="white" width="wide" space="default" className="pt-0">
      <div className="grid items-center gap-8 rounded-xl bg-brown px-6 py-10 text-white md:px-14 md:py-14 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        <div className="min-w-0">
          <p className="text-caption font-medium tracking-[0.14em] uppercase text-gold">
            Patient Journal &amp; Care
          </p>
          <Heading as="h2" size="h2-md" accent="to Your Inbox" tone="gold" className="mt-3">
            Get Smile Advice Delivered
          </Heading>
          <p className="mt-4 text-lead text-white/80">
            Join our patient community across West Yorkshire for monthly dental hygiene tips,
            cosmetic guides, and exclusive clinic treatment offers.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-white/15 pt-6">
            <BookButton variant="gold">Book Now</BookButton>
            <CallButton variant="glass" />
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-white/15 bg-white/7 p-5 md:p-7">
          {subscribed ? (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-gold" aria-hidden="true" />
              <div>
                <p className="text-label text-white">You&apos;re Subscribed!</p>
                <p className="mt-1 text-small leading-relaxed text-white/80">
                  Thank you. We&apos;ll send you our latest guides and advice once a month.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-label text-white">Subscribe to Pav Dental Guides</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="min-w-0 flex-1">
                  <Label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </Label>
                  <Input
                    id="newsletter-email"
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-transparent bg-white text-fg"
                  />
                </div>
                <Button type="submit" variant="gold" disabled={loading} className="h-14 px-7">
                  {loading ? "Subscribing..." : "Subscribe"}
                </Button>
              </div>
              {error ? <p className="text-small font-medium text-gold">{error}</p> : null}
            </form>
          )}

          <p className="mt-4 flex items-center gap-2 text-caption text-white/75">
            <ShieldCheck className="size-4 shrink-0 text-gold" aria-hidden="true" />
            <span>Zero spam. Unsubscribe at any time with one click.</span>
          </p>
        </div>
      </div>
    </Section>
  );
}
