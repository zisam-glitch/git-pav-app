import { useState, useEffect } from "react";
import { ShieldCheck, X } from "lucide-react";
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
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5">
      <div className="rounded-xl border border-border bg-white/95 p-5 shadow-2xl">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <ShieldCheck className="size-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-fg">Cookie & Privacy Preferences</h4>
            <p className="text-xs text-muted leading-relaxed">
              With your permission we use Google Analytics cookies to see how people use this site. Nothing
              is loaded unless you accept, and no health information is sent.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={handleDecline} className="text-xs h-8">
            Decline
          </Button>
          <Button size="sm" onClick={handleAccept} className="text-xs h-8 bg-primary text-white">
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}

