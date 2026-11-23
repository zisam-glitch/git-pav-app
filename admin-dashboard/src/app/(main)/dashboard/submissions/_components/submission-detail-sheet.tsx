"use client";

import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export interface Submission {
  id: string;
  form_type: "contact" | "vacancy" | "petition" | "registration" | "other";
  data: Record<string, any>;
  is_read: boolean;
  is_archived: boolean;
  submitted_at: string;
}

interface DetailProps {
  submission: Submission | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkRead: (id: string, read: boolean) => void;
  onDelete: (id: string) => void;
}

interface RegistrationSection {
  title: string;
  items: { label: string; value: string }[];
}

const TITLES: Record<Submission["form_type"], string> = {
  contact: "Contact submission",
  vacancy: "Vacancy submission",
  petition: "Petition submission",
  registration: "Patient registration",
  other: "Submission",
};

/** A patient registration: who they are, then every answer under the heading the patient saw. */
function RegistrationDetails({ data }: { data: Submission["data"] }) {
  const sections: RegistrationSection[] = Array.isArray(data.sections) ? data.sections : [];
  const birth = typeof data.date_of_birth === "string" ? format(new Date(`${data.date_of_birth}T00:00:00`), "PPP") : null;
  const consent = data.consent && typeof data.consent === "object" ? data.consent : null;

  return (
    <>
      <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
        {[
          ["Name", data.name],
          ["Email", data.email],
          ["Mobile phone", data.phone],
          ["Date of birth", birth],
        ].map(([label, value]) =>
          value ? (
            <div key={label}>
              <p className="font-semibold text-muted-foreground text-xs">{label}</p>
              <p className="mt-0.5 text-sm">{String(value)}</p>
            </div>
          ) : null,
        )}
        {consent?.given ? (
          <p className="text-muted-foreground text-xs">
            Consent given {consent.at ? format(new Date(consent.at), "PPP 'at' p") : ""}, wording {consent.version}.
          </p>
        ) : null}
      </div>

      {sections.map((section) => (
        <div key={section.title} className="rounded-lg border p-4">
          <p className="mb-3 font-semibold text-sm">{section.title}</p>
          <dl className="space-y-3">
            {section.items.map((item) => (
              <div key={item.label}>
                <dt className="text-muted-foreground text-xs">{item.label}</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-sm">{item.value || "—"}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </>
  );
}

export function SubmissionDetailSheet({ submission, isOpen, onClose, onMarkRead, onDelete }: DetailProps) {
  if (!submission) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center justify-between pr-8">
            <SheetTitle>{TITLES[submission.form_type]}</SheetTitle>
            <Badge variant="outline">{submission.form_type.toUpperCase()}</Badge>
          </div>
          <SheetDescription>Received on {format(new Date(submission.submitted_at), "PPP 'at' p")}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-5 px-4 pb-6">
          {submission.form_type === "registration" ? (
            <RegistrationDetails data={submission.data} />
          ) : (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              {Object.entries(submission.data || {}).map(([key, val]) => (
                <div key={key}>
                  <p className="font-semibold text-muted-foreground text-xs capitalize">{key.replace(/_/g, " ")}</p>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm">
                    {typeof val === "object" ? JSON.stringify(val) : String(val)}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 border-t pt-4">
            {!submission.is_read ? (
              <Button size="sm" onClick={() => onMarkRead(submission.id, true)} className="flex-1">
                Mark as Read
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => onMarkRead(submission.id, false)} className="flex-1">
                Mark as Unread
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                onDelete(submission.id);
                onClose();
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
