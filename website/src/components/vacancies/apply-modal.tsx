import { useState, type FormEvent } from "react";
import { X, CheckCircle2, Briefcase, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Vacancy } from "./vacancies-data";
import { api } from "@/lib/api";

interface ApplyModalProps {
  vacancy: Vacancy | null;
  isOpen: boolean;
  onClose: () => void;
}

const MODAL_INPUT =
  "w-full h-10 rounded-xl border border-black/10 bg-[#FAF8F2] px-3 text-xs sm:text-sm text-black placeholder:text-black/45 focus:border-[#1B3745] focus:outline-none focus:ring-2 focus:ring-[#1B3745]/15";

export function ApplyModal({ vacancy, isOpen, onClose }: ApplyModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gdcNumber, setGdcNumber] = useState("");
  const [cvLink, setCvLink] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !vacancy) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.forms.submitVacancy({
        name,
        email,
        phone,
        position: vacancy.title,
        experience: gdcNumber ? `GDC: ${gdcNumber}` : undefined,
        message: `${message || ""}\nCV: ${cvLink || "N/A"}`.trim(),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setName("");
    setEmail("");
    setPhone("");
    setGdcNumber("");
    setCvLink("");
    setMessage("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Apply for ${vacancy.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-xs"
    >
      <div
        className="relative my-8 w-full max-w-lg rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-[#F2EDE5] text-black/65 transition-colors hover:bg-black hover:text-white"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#1B3745] text-[#ECD880]">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-black">
              Application Received
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-black/65">
              Thank you, <strong>{name}</strong>. Your application for{" "}
              <strong>{vacancy.title}</strong> has been forwarded directly to our Practice Principal
              and HR recruitment team.
            </p>
            <p className="mt-2 text-xs text-black/50">
              We typically review clinical applications within 48 hours.
            </p>
            <Button onClick={handleResetAndClose} className="mt-6" size="sm">
              Close Window
            </Button>
          </div>
        ) : (
          <div>
            <div className="border-b border-black/10 pb-4 pr-6">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F2EDE5] px-2.5 py-0.5 text-[11px] font-medium text-[#1B3745]">
                  <Briefcase className="size-3" />
                  {vacancy.department}
                </span>
                <span className="text-xs text-black/55">{vacancy.contractType}</span>
              </div>
              <h2 className="font-display text-2xl font-normal tracking-[-0.03em] text-black">
                Apply for {vacancy.title}
              </h2>
              <p className="mt-1 text-xs text-black/55">
                Pav Dental · 786 Leeds Road, Bradford, BD3 9TY
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="apply-name" className="mb-1 block text-xs font-medium text-black/75">
                    Full Name *
                  </label>
                  <input
                    id="apply-name"
                    required
                    type="text"
                    placeholder="Dr. / Nurse Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={MODAL_INPUT}
                  />
                </div>

                <div>
                  <label htmlFor="apply-email" className="mb-1 block text-xs font-medium text-black/75">
                    Email Address *
                  </label>
                  <input
                    id="apply-email"
                    required
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={MODAL_INPUT}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="apply-phone" className="mb-1 block text-xs font-medium text-black/75">
                    Phone Number *
                  </label>
                  <input
                    id="apply-phone"
                    required
                    type="tel"
                    placeholder="+44 7311 871456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={MODAL_INPUT}
                  />
                </div>

                <div>
                  <label htmlFor="apply-gdc" className="mb-1 block text-xs font-medium text-black/75">
                    GDC Reg No. (if registered)
                  </label>
                  <input
                    id="apply-gdc"
                    type="text"
                    placeholder="e.g. 123456"
                    value={gdcNumber}
                    onChange={(e) => setGdcNumber(e.target.value)}
                    className={MODAL_INPUT}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="apply-cv" className="mb-1 block text-xs font-medium text-black/75">
                  LinkedIn Profile / CV Link *
                </label>
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-black/45" />
                  <input
                    id="apply-cv"
                    required
                    type="url"
                    placeholder="https://linkedin.com/in/... or Google Drive link"
                    value={cvLink}
                    onChange={(e) => setCvLink(e.target.value)}
                    className={`${MODAL_INPUT} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="apply-message" className="mb-1 block text-xs font-medium text-black/75">
                  Brief Note / Clinical Experience *
                </label>
                <textarea
                  id="apply-message"
                  required
                  rows={3}
                  placeholder="Tell us about your background, clinical interests, or visa requirements..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-[#FAF8F2] p-3 text-xs text-black placeholder:text-black/45 focus:border-[#1B3745] focus:outline-none focus:ring-2 focus:ring-[#1B3745]/15 sm:text-sm"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href="mailto:hello@pavdental.com?subject=Direct%20Application%20Inquiry"
                  className="text-xs text-black/60 underline underline-offset-4 hover:text-[#1B3745]"
                >
                  Or email CV directly
                </a>

                <div className="flex gap-2.5">
                  <Button type="button" variant="ghost" size="sm" onClick={handleResetAndClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} size="sm" className="gap-1.5">
                    {loading ? "Submitting..." : "Submit Application"}
                    <Send className="size-3.5" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
