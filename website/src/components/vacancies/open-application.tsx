import { Mail, Phone, MapPin, Send, Sparkles } from "lucide-react";

export function OpenApplication() {
  return (
    <section className="py-16 sm:py-20 bg-[#faf6f0] border-t border-[#e2d4c0]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        

        <h2 className="mt-5 font-display text-3xl sm:text-4xl font-bold text-[#2a1c12] tracking-tight">
          Don't See Your Perfect Role?
        </h2>
        
        <p className="mt-4 text-base sm:text-lg text-muted max-w-xl mx-auto leading-relaxed">
          We're always growing and welcome speculative applications from passionate dental professionals who want to join our team.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/contact-us"
            className="h-12 px-8 rounded-xl accent-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md"
          >
            <Send className="size-4" />
            <span>Send Open Application</span>
          </a>

          <a
            href="tel:08001938786"
            className="h-12 px-6 rounded-xl border border-[#e2d4c0] bg-white text-sm font-medium text-[#2a1c12] hover:border-[#cf9448] transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="size-4 text-[#cf9448]" />
            <span>Call: 0800 1938 786</span>
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-muted">
          <a
            href="mailto:hello@pavdental.com"
            className="flex items-center gap-2 hover:text-[#cf9448] transition-colors"
          >
            <Mail className="size-4 text-[#cf9448]" />
            <span>hello@pavdental.com</span>
          </a>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-[#cf9448]" />
            <span>786 Leeds Road, Bradford, BD3 9TY</span>
          </div>
        </div>
      </div>
    </section>
  );
}

