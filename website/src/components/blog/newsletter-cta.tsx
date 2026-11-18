import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Heading, Section, Tile } from "@/components/hims";
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
    <Section theme="cream" width="wide" space="default">
      <div className="grid items-center gap-8 rounded-xl border border-border bg-white p-6 md:p-12 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        <div>
          <Heading as="h2" size="h2-md" accent="to Your Inbox" tone="terracotta">
            Get Smile Advice Delivered
          </Heading>
          <p className="mt-4 text-lead text-muted">
            Join our patient community across West Yorkshire for monthly dental hygiene tips,
            cosmetic guides, and exclusive clinic treatment offers.
          </p>
        </div>

        <div>
          {subscribed ? (
            <Tile tone="sage" className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-fg" aria-hidden="true" />
                <div>
                  <p className="text-label text-fg">You&apos;re Subscribed!</p>
                  <p className="mt-1 text-small text-muted">
                    Thank you. We&apos;ll send you our latest guides and advice once a month.
                  </p>
                </div>
              </div>
            </Tile>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
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
                  />
                </div>
                <Button type="submit" disabled={loading} className="h-14 px-7">
                  {loading ? "Subscribing..." : "Subscribe"}
                </Button>
              </div>
              {error ? <p className="text-small font-medium text-danger">{error}</p> : null}
            </form>
          )}

          <p className="mt-4 flex items-center gap-2 text-caption text-muted">
            <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
            <span>Zero spam. Unsubscribe at any time with one click.</span>
          </p>
        </div>
      </div>
    </Section>
  );
}
