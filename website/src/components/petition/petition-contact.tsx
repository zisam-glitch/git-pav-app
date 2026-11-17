import { useState, type FormEvent } from "react";
import { Send, CheckCircle2, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PetitionContact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 500);
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-border/40">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Header matching screenshot */}
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#844d1e] tracking-tight">
            Get In Touch
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted max-w-md mx-auto">
            Fill out the form below with your inquiry and our clinic and campaign team will get back to you shortly.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-primary/20 bg-[#faf6f0] p-8 text-center shadow-xs">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-100 text-green-700 mb-3">
              <CheckCircle2 className="size-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-fg">
              Message Received
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted max-w-md mx-auto">
              Thank you for contacting PavDental. A member of our community coordination team will respond within 24 hours. For urgent dental pain, please call our emergency line at 0800 1938 786.
            </p>
            <Button
              onClick={() => {
                setSubmitted(false);
                setFormData({ fullName: "", email: "", subject: "", phone: "", message: "" });
              }}
              className="mt-6 accent-gradient text-white text-xs h-10 px-6"
            >
              Send Another Inquiry
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Row 1: Full Name & Email Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="touch-name" className="block text-xs font-semibold text-fg/80 mb-1.5">
                  Full Name *
                </label>
                <input
                  id="touch-name"
                  required
                  type="text"
                  placeholder="Your Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full h-11 rounded-lg border border-border/70 bg-[#fdfcfb] px-3.5 text-sm placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div>
                <label htmlFor="touch-email" className="block text-xs font-semibold text-fg/80 mb-1.5">
                  Email Address *
                </label>
                <input
                  id="touch-email"
                  required
                  type="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-11 rounded-lg border border-border/70 bg-[#fdfcfb] px-3.5 text-sm placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Row 2: Subject & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="touch-subject" className="block text-xs font-semibold text-fg/80 mb-1.5">
                  Subject *
                </label>
                <input
                  id="touch-subject"
                  required
                  type="text"
                  placeholder="Inquiry / Petition Support"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full h-11 rounded-lg border border-border/70 bg-[#fdfcfb] px-3.5 text-sm placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div>
                <label htmlFor="touch-phone" className="block text-xs font-semibold text-fg/80 mb-1.5">
                  Phone
                </label>
                <input
                  id="touch-phone"
                  type="tel"
                  placeholder="+44 7311 871456"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-11 rounded-lg border border-border/70 bg-[#fdfcfb] px-3.5 text-sm placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Row 3: Your Message */}
            <div>
              <label htmlFor="touch-message" className="block text-xs font-semibold text-fg/80 mb-1.5">
                Your Message *
              </label>
              <textarea
                id="touch-message"
                required
                rows={5}
                placeholder="Share your experience or ask a question..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full rounded-lg border border-border/70 bg-[#fdfcfb] p-3.5 text-sm placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>

            {/* Submit Button matching screenshot */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="accent-gradient text-white font-semibold text-xs sm:text-sm h-11 px-8 rounded-lg shadow-xs hover:opacity-95 transition-all gap-2"
              >
                {loading ? "Sending..." : "Send Message"}
                <Send className="size-3.5" />
              </Button>
            </div>
          </form>
        )}

        {/* Floating/inline Appointment Button underneath */}
        <div className="mt-14 text-center">
          <a
            href="/contact-us"
            className="inline-flex items-center gap-2 rounded-lg bg-[#925a27] hover:bg-[#844d1e] text-white px-7 py-3 text-xs sm:text-sm font-semibold shadow-sm transition-transform active:scale-95"
          >
            <Calendar className="size-4" />
            <span>Book an Appointment</span>
          </a>
        </div>
      </div>
    </section>
  );
}

