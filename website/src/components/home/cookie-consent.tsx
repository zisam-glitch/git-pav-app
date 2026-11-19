import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadAnalyticsIfConsented } from "@/lib/analytics";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let consent: string | null = null;
    try {
      consent = localStorage.getItem("cookie_consent");
    } catch {
      // Storage blocked: ask each visit, load nothing.
    }
    if (!consent) {
      setShow(true);
    } else {
      loadAnalyticsIfConsented();
    }
  }, []);

  function handleAccept() {
    localStorage.setItem("cookie_consent", "accepted");
    setShow(false);
    loadAnalyticsIfConsented();
  }

  function handleDecline() {
    localStorage.setItem("cookie_consent", "declined");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed right-4 bottom-4 left-4 z-50 md:right-6 md:left-auto md:max-w-md">
      <div className="rounded-xl border border-border bg-white p-4 shadow-card md:p-5">
        <div className="flex items-start gap-3.5">
          <div className="shrink-0 rounded-lg bg-cream p-2.5 text-fg">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-label text-fg">Cookie &amp; Privacy Preferences</p>
            <p className="text-small text-muted">
              With your permission we use Google Analytics cookies to see how people use this site.
              Nothing is loaded unless you accept, and no health information is sent.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            Decline
          </Button>
          <Button variant="default" size="sm" onClick={handleAccept}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
