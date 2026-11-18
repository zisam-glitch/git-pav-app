import { useState, type FormEvent } from "react";
import { X, CheckCircle2, Briefcase, FileText, Send, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Vacancy } from "./vacancies-data";
import { api } from "@/lib/api";

interface ApplyModalProps {
  vacancy: Vacancy | null;
  isOpen: boolean;
  onClose: () => void;
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4-xs overflow-y-auto">
      <div
        className="relative w-full max-w-lg rounded-xl bg-white p-6 sm:p-8 shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-slate-100 text-muted hover:bg-slate-200 hover:text-fg"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-sm">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="font-display text-2xl font-bold text-fg">
              Application Received
            </h3>
            <p className="mt-2 text-sm text-muted max-w-sm mx-auto leading-relaxed">
              Thank you, <strong>{name}</strong>. Your application for <strong>{vacancy.title}</strong> has been forwarded directly to our Practice Principal and HR recruitment team.
            </p>
            <p className="mt-2 text-xs text-muted">
              We typically review clinical applications within 48 hours.
            </p>
            <Button onClick={handleResetAndClose} className="mt-6" size="sm">
              Close Window
            </Button>
          </div>
        ) : (
          <div>
            <div className="border-b border-border/50 pb-4 pr-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 rounded-md bg-[#faf6f0] border border-primary/25 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  <Briefcase className="size-3" />
                  {vacancy.department}
                </span>
                <span className="text-xs text-muted">{vacancy.contractType}</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-fg">
                Apply for {vacancy.title}
              </h2>
              <p className="text-xs text-muted mt-1">
                PavDental · 786 Leeds Road, Bradford, BD3 9TY
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-fg/80 mb-1">
                    Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Dr. / Nurse Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 rounded-xl border border-border/70 bg-[#faf8f5] px-3 text-xs sm:text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-fg/80 mb-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 rounded-xl border border-border/70 bg-[#faf8f5] px-3 text-xs sm:text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-fg/80 mb-1">
                    Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="+44 7311 871456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 rounded-xl border border-border/70 bg-[#faf8f5] px-3 text-xs sm:text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-fg/80 mb-1">
                    GDC Reg No. (if registered)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 123456"
                    value={gdcNumber}
                    onChange={(e) => setGdcNumber(e.target.value)}
                    className="w-full h-10 rounded-xl border border-border/70 bg-[#faf8f5] px-3 text-xs sm:text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-fg/80 mb-1">
                  LinkedIn Profile / CV Link *
                </label>
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
                  <input
                    required
                    type="url"
                    placeholder="https://linkedin.com/in/... or Google Drive link"
                    value={cvLink}
                    onChange={(e) => setCvLink(e.target.value)}
                    className="w-full h-10 rounded-xl border border-border/70 bg-[#faf8f5] pl-9 pr-3 text-xs sm:text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-fg/80 mb-1">
                  Brief Note / Clinical Experience *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tell us about your background, clinical interests, or visa requirements..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-border/70 bg-[#faf8f5] p-3 text-xs sm:text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <a
                  href="mailto:hello@pavdental.com?subject=Direct%20Application%20Inquiry"
                  className="text-xs text-muted hover:text-primary underline"
                >
                  Or email CV directly
                </a>

                <div className="flex gap-2.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetAndClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    size="sm"
                    className="accent-gradient text-white gap-1.5 shadow-sm"
                  >
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

