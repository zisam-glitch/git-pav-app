import { Button } from "@/components/ui/button";
import { useEnquiry } from "@/lib/use-enquiry";

export function MobileDentistryContact() {
  const enquiry = useEnquiry("Mobile dentistry");

  return (
    <section id="contact" className="py-20 sm:py-28 bg-[#fffdf9]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
            Get In Touch
          </h2>
          <p className="mt-4 text-[#6b5848] text-sm sm:text-base leading-relaxed">
            Have questions about our mobile dental services? Contact us today to discuss your needs or schedule an appointment.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {enquiry.sent ? (
            <div role="status" className="text-center py-10">
              <h3 className="font-display text-2xl font-bold text-[#2a1c12]">Message received</h3>
              <p className="mt-3 text-sm text-[#6b5848]">
                Thank you. Your message has reached the practice, and the team will get back to you.
              </p>
              <button type="button" onClick={enquiry.reset} className="text-xs text-[#925a27] underline mt-4">
                Send another message
              </button>
            </div>
          ) : (
          <form onSubmit={enquiry.submit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-[#2a1c12] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className="w-full px-4 py-3 rounded-lg   bg-white text-[#2a1c12] placeholder:text-[#6b5848] focus:outline-none focus:ring-2 focus:ring-[#925a27] focus:border-transparent"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#2a1c12] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 rounded-lg   bg-white text-[#2a1c12] placeholder:text-[#6b5848] focus:outline-none focus:ring-2 focus:ring-[#925a27] focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-[#2a1c12] mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 rounded-lg   bg-white text-[#2a1c12] placeholder:text-[#6b5848] focus:outline-none focus:ring-2 focus:ring-[#925a27] focus:border-transparent"
                  placeholder="How can we help?"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#2a1c12] mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 rounded-lg   bg-white text-[#2a1c12] placeholder:text-[#6b5848] focus:outline-none focus:ring-2 focus:ring-[#925a27] focus:border-transparent"
                  placeholder="Your phone number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-[#2a1c12] mb-2">
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full px-4 py-3 rounded-lg   bg-white text-[#2a1c12] placeholder:text-[#6b5848] focus:outline-none focus:ring-2 focus:ring-[#925a27] focus:border-transparent resize-none"
                placeholder="Tell us about your dental care needs..."
                required
              />
            </div>

            {enquiry.error && (
              <p role="alert" className="text-sm text-red-700">
                {enquiry.error}
              </p>
            )}
            <Button
              type="submit"
              disabled={enquiry.sending}
              className="w-full accent-gradient text-white rounded-full px-8 py-4 font-bold shadow hover:opacity-95"
            >
              {enquiry.sending ? "Sending…" : "Send Message"}
            </Button>
          </form>
          )}
        </div>
      </div>
    </section>
  );
}