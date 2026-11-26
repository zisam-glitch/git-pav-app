// Google Analytics 4 (C-15). Loaded only after the visitor accepts cookies,
// with IP anonymisation and no ad features. Never send health details as
// event parameters.

export const GA4_ID: string = (import.meta as any).env?.VITE_GA4_ID || "G-ZZW34YMNDY";

const CONSENT_KEY = "cookie_consent";

/** True only for an explicit "accepted" and a real measurement id. */
export function shouldLoadAnalytics(consent: string | null, id: string): boolean {
  return consent === "accepted" && /^G-[A-Z0-9]{6,}$/.test(id) && !/^G-X+$/.test(id);
}

let loaded = false;

export function loadAnalyticsIfConsented(): void {
  if (loaded || typeof window === "undefined") return;
  let consent: string | null = null;
  try {
    consent = window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return;
  }
  if (!shouldLoadAnalytics(consent, GA4_ID)) return;
  loaded = true;

  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // gtag reads the arguments object, not an array.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", GA4_ID, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`;
  document.head.appendChild(script);
}
