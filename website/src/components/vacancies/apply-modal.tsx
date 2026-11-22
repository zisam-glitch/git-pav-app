import { CheckCircle2, Send, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { PRACTICE_EMAIL } from "@/lib/enquiry";
import type { Vacancy } from "./vacancies-data";

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

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSubmitted(false);
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
      onClick={handleResetAndClose}
    >
      <div
        className="relative my-8 w-full max-w-lg rounded-xl bg-white p-6 shadow-card md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleResetAndClose}
          className="absolute top-4 right-4"
          aria-label="Close dialog"
        >
          <X className="size-5" aria-hidden="true" />
        </Button>

        {submitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-pill bg-sage text-fg">
              <CheckCircle2 className="size-7" aria-hidden="true" />
            </div>
            <h2 id="apply-modal-title" className="text-h3-md text-fg">
              Application Received
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-body text-muted">
              Thank you, <strong>{name}</strong>. Your application for{" "}
              <strong>{vacancy.title}</strong> has been forwarded to our recruitment team.
            </p>
            <Button type="button" onClick={handleResetAndClose} className="mt-6">
              Close Window
            </Button>
          </div>
        ) : (
          <div>
            <div className="border-b border-border pb-4 pr-10">
              <h2 id="apply-modal-title" className="text-h3-md text-fg">
                Apply for {vacancy.title}
              </h2>
              <p className="mt-1 text-small text-muted">{vacancy.location}</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="apply-name">Full Name *</Label>
                  <Input
                    id="apply-name"
                    required
                    type="text"
                    placeholder="Dr. / Nurse Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="apply-email">Email Address *</Label>
                  <Input
                    id="apply-email"
                    required
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="apply-phone">Phone Number *</Label>
                  <Input
                    id="apply-phone"
                    required
                    type="tel"
                    placeholder="+44 7311 871456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="apply-gdc">GDC Reg No. (if registered)</Label>
                  <Input
                    id="apply-gdc"
                    type="text"
                    placeholder="e.g. 123456"
                    value={gdcNumber}
                    onChange={(e) => setGdcNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="apply-cv">LinkedIn Profile / CV Link *</Label>
                <Input
                  id="apply-cv"
                  required
                  type="url"
                  placeholder="https://linkedin.com/in/... or Google Drive link"
                  value={cvLink}
                  onChange={(e) => setCvLink(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="apply-message">Brief Note / Clinical Experience *</Label>
                <Textarea
                  id="apply-message"
                  required
                  rows={3}
                  placeholder="Tell us about your background, clinical interests, or visa requirements..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <a
                  href={`mailto:${PRACTICE_EMAIL}?subject=${encodeURIComponent(`Direct Application: ${vacancy.title}`)}`}
                  className="text-small text-muted underline underline-offset-4 t-colors hover:text-fg"
                >
                  Or email CV directly
                </a>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleResetAndClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    <span>{loading ? "Submitting..." : "Submit Application"}</span>
                    <Send aria-hidden="true" />
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
