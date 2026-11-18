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
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-5">
      <div className="rounded-xl border border-border bg-white p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#faf6f0] border border-border-soft text-primary shrink-0">
            <ShieldCheck className="size-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-fg">Cookie & Privacy Preferences</h4>
            <p className="text-xs text-muted leading-relaxed">
              With your permission we use Google Analytics cookies to see how people use this site. Nothing
              is loaded unless you accept, and no health information is sent.
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleDecline} className="text-xs h-8">
            Decline
          </Button>
          <Button size="sm" onClick={handleAccept} className="text-xs h-8">
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}

