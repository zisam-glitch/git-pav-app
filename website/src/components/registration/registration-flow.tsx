import { Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, X } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookButton } from "@/components/hims";
import { Button } from "@/components/ui/button";
import {
  type Answers,
  SECTIONS,
  type SectionId,
  type Screen,
  buildPayload,
  buildSections,
  dateOfBirthIso,
  validateScreen,
  visibleFields,
  visibleScreens,
} from "@/content/registration-form";
import { api } from "@/lib/api";
import { PRACTICE_EMAIL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { cn } from "@/lib/utils";
import { FieldView } from "./registration-inputs";

/**
 * The new patient registration, one step at a time (Hims "Completing health history" and
 * "Completing weight loss profile" flows: a segmented progress bar, one short screen per
 * question group, a black Next pill that stays grey until the screen is complete, and an
 * "up next" outline before the first question). The questions are the live form's
 * (`src/content/registration-form.ts`). Answers stay in memory only: nothing is written to
 * the browser, and they are cleared when the registration is sent or the flow is closed.
 * Sent answers go to the dashboard, which stores them and emails no health details.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Stage = "intro" | "questions" | "done";

export function RegistrationFlow({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <FlowDialog onClose={onClose} />;
}

const normal = (value: string) => value.toLowerCase().replace(/[:?\s]+$/g, "").trim();

function FlowDialog({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswers] = useState<Answers>({});
  const [screenId, setScreenId] = useState<string>("name");
  const [touched, setTouched] = useState<Record<string, true>>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const screens = useMemo(() => visibleScreens(answers), [answers]);
  const index = Math.max(0, screens.findIndex((screen) => screen.id === screenId));
  const screen = screens[index] as Screen;
  const errors = useMemo(() => (stage === "questions" ? validateScreen(screen, answers) : {}), [stage, screen, answers]);
  const canContinue = Object.keys(errors).length === 0;
  const isLast = index === screens.length - 1;

  const requestClose = useCallback(() => {
    if (stage === "questions") setConfirmLeave(true);
    else onClose();
  }, [stage, onClose]);

  // Lock the page behind the flow, and give focus back to what opened it.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      opener?.focus?.();
    };
  }, []);

  // Each step starts at the top with its heading read out.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [stage, screenId]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (confirmLeave) setConfirmLeave(false);
        else requestClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmLeave, requestClose]);

  const setAnswer = (id: string, value: string | string[]) => setAnswers((current) => ({ ...current, [id]: value }));
  const touch = (id: string) => setTouched((current) => (current[id] ? current : { ...current, [id]: true }));

  async function submit() {
    const payload = buildPayload(answers);
    if (!payload) {
      setSendError("Some answers are missing. Please go back and check each step.");
      return;
    }
    setSending(true);
    setSendError(null);
    try {
      await api.forms.submitRegistration(payload);
      setAnswers({});
      setTouched({});
      setStage("done");
    } catch {
      setSendError(`Your registration didn't send. Please try again, or call us on ${PRACTICE_PHONE}.`);
    } finally {
      setSending(false);
    }
  }

  function onNext(event: FormEvent) {
    event.preventDefault();
    if (stage === "intro") {
      setStage("questions");
      setScreenId((screens[0] as Screen).id);
      return;
    }
    if (!canContinue || sending) return;
    if (isLast) {
      void submit();
      return;
    }
    setScreenId((screens[index + 1] as Screen).id);
  }

  function onBack() {
    setSendError(null);
    if (index === 0) setStage("intro");
    else setScreenId((screens[index - 1] as Screen).id);
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reg-flow-title"
      className="fixed inset-0 z-[80] flex flex-col bg-white"
    >
      <div className="shrink-0 px-5 pt-3">
        {stage === "questions" ? <ProgressBar screens={screens} current={screen} /> : <div className="h-1" />}
        <div className="mx-auto flex h-14 max-w-[528px] items-center justify-between">
          {stage === "questions" ? (
            <Button type="button" variant="ghost" size="icon" aria-label="Back" onClick={onBack}>
              <ArrowLeft aria-hidden="true" />
            </Button>
          ) : (
            <span className="size-[42px]" />
          )}
          <img src="/images/pav-logo.svg" alt="Pav Dental" width={1964} height={569} className="h-6 w-auto" />
          <Button type="button" variant="ghost" size="icon" aria-label="Close registration" onClick={requestClose}>
            <X aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <form id="reg-flow-form" onSubmit={onNext} noValidate className="mx-auto w-full max-w-[528px] px-5 pt-6 pb-10">
          {stage === "intro" ? <Intro headingRef={headingRef} /> : null}
          {stage === "questions" ? (
            <QuestionStep
              screen={screen}
              answers={answers}
              errors={errors}
              touched={touched}
              headingRef={headingRef}
              onChange={setAnswer}
              onBlur={touch}
              sendError={sendError}
            />
          ) : null}
          {stage === "done" ? <Done headingRef={headingRef} onClose={onClose} /> : null}
        </form>
      </div>

      {stage !== "done" ? (
        <div className="shrink-0 border-t border-border bg-white px-5 py-4">
          <div className="mx-auto max-w-[528px]">
            <Button
              type="submit"
              form="reg-flow-form"
              size="lg"
              className="h-14 w-full"
              disabled={stage === "questions" && (!canContinue || sending)}
            >
              {stage === "intro" ? "Start" : isLast ? (sending ? "Sending…" : "Send my registration") : "Next"}
            </Button>
          </div>
        </div>
      ) : null}

      {confirmLeave ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/44 px-5" role="alertdialog" aria-modal="true" aria-labelledby="reg-leave-title">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-card">
            <h3 id="reg-leave-title" className="text-h4 text-fg">
              Leave your registration?
            </h3>
            <p className="mt-2 text-body text-muted">
              Your answers have not been sent and are not saved, so they will be lost.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <Button type="button" className="flex-1" onClick={() => setConfirmLeave(false)} autoFocus>
                Keep going
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Leave
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Thin segments, one per section, filling as the patient moves through it. */
function ProgressBar({ screens, current }: { screens: Screen[]; current: Screen }) {
  const sections = SECTIONS.filter((section) => screens.some((screen) => screen.section === section.id));
  const currentSection = sections.findIndex((section) => section.id === current.section);
  return (
    <div
      className="mx-auto flex h-1 max-w-[528px] gap-1 pt-0"
      role="progressbar"
      aria-label="Registration progress"
      aria-valuemin={0}
      aria-valuemax={screens.length}
      aria-valuenow={screens.findIndex((screen) => screen.id === current.id) + 1}
    >
      {sections.map((section, sectionIndex) => {
        const inSection = screens.filter((screen) => screen.section === section.id);
        const position = inSection.findIndex((screen) => screen.id === current.id);
        const fill = sectionIndex < currentSection ? 100 : sectionIndex === currentSection ? ((position + 1) / inSection.length) * 100 : 0;
        return (
          <div
            key={section.id}
            className="h-1 overflow-hidden rounded-pill bg-black/10"
            style={{ flexGrow: Math.max(inSection.length, 1), flexBasis: 0 }}
          >
            <div className="h-full rounded-pill bg-terracotta transition-[width] duration-300 ease-in-out" style={{ width: `${fill}%` }} />
          </div>
        );
      })}
    </div>
  );
}

type HeadingRef = React.RefObject<HTMLHeadingElement | null>;

function Heading({ headingRef, children }: { headingRef: HeadingRef; children: React.ReactNode }) {
  return (
    <h2 id="reg-flow-title" ref={headingRef} tabIndex={-1} className="text-h3 font-[470] text-fg outline-none">
      {children}
    </h2>
  );
}

const UP_NEXT: { id: SectionId[]; title: string; text: string }[] = [
  { id: ["personal", "additional", "address"], title: "About you", text: "Your contact details, address and an emergency contact." },
  { id: ["lifestyle", "medical", "dental"], title: "Your health", text: "Medical, lifestyle and dental history, so your dentist is ready for you." },
  { id: ["review"], title: "Review and send", text: "Check your contact details and send your registration." },
];

function Intro({ headingRef }: { headingRef: HeadingRef }) {
  return (
    <div>
      <Heading headingRef={headingRef}>Let&rsquo;s get you registered</Heading>
      <p className="mt-3 text-body text-muted">
        It takes about 8 minutes. Your answers go straight to our Bradford team. We never email health details, and
        nothing is saved until you send it.
      </p>

      <ol className="mt-8 grid gap-3">
        {UP_NEXT.map((item, i) => (
          <li
            key={item.title}
            className={cn("flex gap-4 rounded-xl border border-border p-4", i === 0 ? "bg-white shadow-card" : "bg-cream")}
          >
            <span
              aria-hidden="true"
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-pill text-caption font-medium",
                i === 0 ? "bg-terracotta text-white" : "bg-black/10 text-fg",
              )}
            >
              {i + 1}
            </span>
            <span>
              <span className="block text-label text-fg">{item.title}</span>
              <span className="mt-0.5 block text-small text-muted">{item.text}</span>
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-8 text-small text-muted">
        Need urgent dental care? Please don&rsquo;t wait to register. Call{" "}
        <a href={PRACTICE_PHONE_HREF} className="text-fg underline underline-offset-4">
          {PRACTICE_PHONE}
        </a>{" "}
        any time, day or night.
      </p>
    </div>
  );
}

function QuestionStep({
  screen,
  answers,
  errors,
  touched,
  headingRef,
  onChange,
  onBlur,
  sendError,
}: {
  screen: Screen;
  answers: Answers;
  errors: Record<string, string>;
  touched: Record<string, true>;
  headingRef: HeadingRef;
  onChange: (id: string, value: string | string[]) => void;
  onBlur: (id: string) => void;
  sendError: string | null;
}) {
  const section = SECTIONS.find((candidate) => candidate.id === screen.section);
  const fields = visibleFields(screen, answers);
  const single = fields.length === 1 ? fields[0] : undefined;
  return (
    <div>
      <p className="mb-2 text-caption text-subtle">{section?.title}</p>
      <Heading headingRef={headingRef}>{screen.title}</Heading>
      {screen.description ? <p className="mt-3 text-body text-muted">{screen.description}</p> : null}

      {screen.section === "review" ? <ReviewSummary answers={answers} /> : null}

      <div className="mt-8 grid gap-6">
        {fields.map((field) => (
          <FieldView
            key={field.id}
            field={field}
            answers={answers}
            error={touched[field.id] ? errors[field.id] : undefined}
            hideLabel={single !== undefined && normal(single.label) === normal(screen.title)}
            onChange={onChange}
            onBlur={onBlur}
          />
        ))}
      </div>

      {screen.section === "review" ? (
        <p className="mt-6 text-small text-muted">
          Read how we look after your information in our{" "}
          <Link to="/privacy-policy" target="_blank" className="text-fg underline underline-offset-4">
            Privacy Policy
          </Link>
          .
        </p>
      ) : null}

      {sendError ? (
        <p role="alert" className="mt-6 text-small text-danger">
          {sendError}
        </p>
      ) : null}
    </div>
  );
}

/** The contact details the team will use, and how much is being sent. */
function ReviewSummary({ answers }: { answers: Answers }) {
  const sections = buildSections(answers);
  const count = sections.reduce((sum, section) => sum + section.items.length, 0);
  const text = (id: string) => (typeof answers[id] === "string" ? (answers[id] as string) : "");
  const birth = dateOfBirthIso(answers);
  const rows: [string, string][] = [
    ["Name", text("fullName")],
    ["Email", text("emailAddress")],
    ["Mobile phone", text("mobilePhone")],
    ["Date of birth", birth ? birth.split("-").reverse().join("/") : ""],
  ];
  return (
    <div className="mt-8 rounded-xl border border-border bg-cream p-5">
      <dl className="grid gap-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-caption text-subtle">{label}</dt>
            <dd className="text-label text-fg">{value || "—"}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 border-t border-border pt-3 text-small text-muted">
        {count} answers in {sections.length} sections will be sent. Use Back if you want to change anything.
      </p>
    </div>
  );
}

function Done({ headingRef, onClose }: { headingRef: HeadingRef; onClose: () => void }) {
  return (
    <div role="status" className="pt-6 text-center">
      <span className="mx-auto mb-5 grid size-14 place-items-center rounded-pill bg-sage text-fg">
        <CheckCircle2 aria-hidden="true" className="size-7" />
      </span>
      <Heading headingRef={headingRef}>Thank you!</Heading>
      <p className="mx-auto mt-3 max-w-sm text-body text-muted">
        Thanks for registering. If you ever need support, please feel free to email us at{" "}
        <a href={`mailto:${PRACTICE_EMAIL}`} className="text-fg underline underline-offset-4">
          {PRACTICE_EMAIL}
        </a>
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <BookButton>Book Your First Visit</BookButton>
        <Button type="button" variant="outline" onClick={onClose}>
          Back to the page
        </Button>
        <Button asChild variant="ghost">
          <a href="/">Back to Home</a>
        </Button>
      </div>
    </div>
  );
}
