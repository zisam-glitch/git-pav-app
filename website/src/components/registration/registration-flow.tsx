import { Check, ChevronLeft } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  type Answers,
  type Screen,
  type SectionId,
  SECTIONS,
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
 * The new patient registration, as the whole page (`/services/regestration`), laid out like the
 * Hims intake flows (Completing health history, Completing weight loss profile): one centred
 * column, a segmented progress bar on top, the back arrow at the left, a large question heading,
 * tall rounded fields or option cards, a black pill at the foot that stays pale until the screen
 * is complete, and "Up next" timeline screens between the parts. The questions are the live form's
 * (`src/content/registration-form.ts`).
 *
 * Answers stay in memory only: nothing is written to the browser, and they are cleared once the
 * registration is sent. Sent answers go to the dashboard, which stores them and emails no health
 * details.
 */

type Stage = "intro" | "between" | "questions" | "done";

/** The parts of the form the timeline shows, each covering some of the form's sections. */
const PHASES: { title: string; text: string; heading: string; sections: SectionId[] }[] = [
  {
    title: "About you",
    text: "Your name, contact details and an emergency contact.",
    heading: "Let’s get you registered",
    sections: ["personal", "additional"],
  },
  {
    title: "Lifestyle and address",
    text: "A few lifestyle questions, then where you live.",
    heading: "Up next, your lifestyle and address",
    sections: ["lifestyle", "address"],
  },
  {
    title: "Health and dental history",
    text: "So your dentist is ready for you before you arrive.",
    heading: "Up next, your health history",
    sections: ["medical", "dental"],
  },
  {
    title: "Review and send",
    text: "Check your contact details and send your registration.",
    heading: "Last part, review and send",
    sections: ["review"],
  },
];

const phaseOf = (screen: Screen) =>
  PHASES.findIndex((phase) => phase.sections.includes(screen.section));
const normal = (value: string) =>
  value
    .toLowerCase()
    .replace(/[:?\s]+$/g, "")
    .trim();

export function RegistrationFlow() {
  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswers] = useState<Answers>({});
  const [screenId, setScreenId] = useState<string>("name");
  const [touched, setTouched] = useState<Record<string, true>>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const screens = useMemo(() => visibleScreens(answers), [answers]);
  const index = Math.max(
    0,
    screens.findIndex((screen) => screen.id === screenId),
  );
  const screen = screens[index] as Screen;
  const errors = useMemo(
    () => (stage === "questions" ? validateScreen(screen, answers) : {}),
    [stage, screen, answers],
  );
  const canContinue = Object.keys(errors).length === 0;
  const isLast = index === screens.length - 1;

  // Each step starts at the top with its heading read out.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [stage, screenId]);

  const setAnswer = (id: string, value: string | string[]) =>
    setAnswers((current) => ({ ...current, [id]: value }));
  const touch = (id: string) =>
    setTouched((current) => (current[id] ? current : { ...current, [id]: true }));

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
      setSendError(
        `Your registration didn't send. Please try again, or call us on ${PRACTICE_PHONE}.`,
      );
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
    if (stage === "between") {
      setStage("questions");
      return;
    }
    if (!canContinue || sending) return;
    if (isLast) {
      void submit();
      return;
    }
    const next = screens[index + 1] as Screen;
    setScreenId(next.id);
    if (phaseOf(next) !== phaseOf(screen)) setStage("between");
  }

  function onBack() {
    setSendError(null);
    if (stage === "between") {
      setStage("questions");
      setScreenId((screens[index - 1] as Screen).id);
      return;
    }
    if (index === 0) setStage("intro");
    else setScreenId((screens[index - 1] as Screen).id);
  }

  const backLabel = "Back";
  const backButton = (className: string) =>
    stage === "intro" ? (
      <a href="/" aria-label="Back to the Pav Dental home page" className={className}>
        <ChevronLeft aria-hidden="true" className="size-6" />
      </a>
    ) : (
      <button type="button" aria-label={backLabel} onClick={onBack} className={className}>
        <ChevronLeft aria-hidden="true" className="size-6" />
      </button>
    );
  const BACK =
    "grid size-10 place-items-center rounded-pill text-fg transition-colors hover:bg-black/5";

  const phaseIndex = stage === "between" ? phaseOf(screen) : 0;

  if (stage === "done") return <ThankYou headingRef={headingRef} />;

  return (
    <main className="min-h-dvh bg-white text-fg">
      {backButton(cn(BACK, "fixed top-2 left-9 z-10 hidden md:grid"))}

      <div className="mx-auto flex min-h-dvh w-full max-w-[528px] flex-col px-5 md:px-0">
        <div className="pt-4">
          {stage === "questions" ? (
            <ProgressBar screens={screens} current={screen} />
          ) : (
            <div className="h-[5px]" />
          )}
        </div>
        <div className="-ml-2 mt-1 md:hidden">{backButton(BACK)}</div>

        <form onSubmit={onNext} noValidate className="flex flex-1 flex-col">
          <div className="flex-1 pt-6 pb-8 md:pt-10">
            {stage === "intro" ? (
              <UpNext headingRef={headingRef} phase={0} heading={PHASES[0]?.heading ?? ""} intro />
            ) : null}
            {stage === "between" ? (
              <UpNext
                headingRef={headingRef}
                phase={phaseIndex}
                heading={PHASES[phaseIndex]?.heading ?? ""}
              />
            ) : null}
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
          </div>

          <div className="sticky bottom-0 bg-white pt-3 pb-6">
            <Button
              type="submit"
              disabled={stage === "questions" && (!canContinue || sending)}
              className="h-12 w-full text-[16px] disabled:bg-[#f0f0f0] disabled:text-[#b8b8b8] disabled:opacity-100"
            >
              {stage === "questions" && isLast
                ? sending
                  ? "Sending…"
                  : "Send my registration"
                : "Next"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

/** Thin segments, one per section, filling as the patient moves through it. */
function ProgressBar({ screens, current }: { screens: Screen[]; current: Screen }) {
  const sections = SECTIONS.filter((section) =>
    screens.some((screen) => screen.section === section.id),
  );
  const currentSection = sections.findIndex((section) => section.id === current.section);
  return (
    <div
      className="flex h-[5px] gap-1"
      role="progressbar"
      aria-label="Registration progress"
      aria-valuemin={0}
      aria-valuemax={screens.length}
      aria-valuenow={screens.findIndex((screen) => screen.id === current.id) + 1}
    >
      {sections.map((section, sectionIndex) => {
        const inSection = screens.filter((screen) => screen.section === section.id);
        const position = inSection.findIndex((screen) => screen.id === current.id);
        const fill =
          sectionIndex < currentSection
            ? 100
            : sectionIndex === currentSection
              ? ((position + 1) / inSection.length) * 100
              : 0;
        return (
          <div
            key={section.id}
            className="h-full overflow-hidden rounded-pill bg-black/10"
            style={{ flexGrow: Math.max(inSection.length, 1), flexBasis: 0 }}
          >
            <div
              className="h-full rounded-pill bg-terracotta transition-[width] duration-300 ease-in-out"
              style={{ width: `${fill}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

type HeadingRef = React.RefObject<HTMLHeadingElement | null>;

const HEADING =
  "text-[28px] leading-[1.12] font-medium tracking-[-0.01em] text-fg outline-none md:text-[32px]";

function Brand() {
  return (
    <img
      src="/images/pav-logo.svg"
      alt="Pav Dental"
      width={1964}
      height={569}
      className="mb-6 h-7 w-auto"
    />
  );
}

/** The Hims "Up next" screen: finished parts ticked, the current part in a card, the rest pale. */
function UpNext({
  headingRef,
  phase,
  heading,
  intro,
}: {
  headingRef: HeadingRef;
  phase: number;
  heading: string;
  intro?: boolean;
}) {
  return (
    <div>
      <Brand />
      <h1 ref={headingRef} tabIndex={-1} className={HEADING}>
        {heading}
      </h1>
      {intro ? (
        <p className="mt-3 text-[16px] leading-6 text-subtle">
          It takes about 8 minutes. Nothing is saved until you send it, and we never email health
          details.
        </p>
      ) : null}

      <ol className="mt-9">
        {PHASES.map((item, i) => {
          const done = i < phase;
          const active = i === phase;
          return (
            <li key={item.title} className="relative flex gap-4 pb-5 last:pb-0">
              {i < PHASES.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-5 bottom-0 left-[9px] w-px",
                    active ? "bg-terracotta" : "bg-black/15",
                  )}
                />
              ) : null}
              <span
                aria-hidden="true"
                className="relative z-10 mt-1 grid size-5 shrink-0 place-items-center bg-white"
              >
                {done ? (
                  <Check className="size-4 text-[#a3a3a3]" strokeWidth={2.5} />
                ) : (
                  <span
                    className={cn(
                      "size-2.5 rounded-pill",
                      active ? "bg-terracotta" : "border-2 border-[#c4c4c4] bg-white",
                    )}
                  />
                )}
              </span>
              {active ? (
                <div className="flex-1 rounded-[14px] bg-white p-4 shadow-[0_6px_24px_rgba(0,0,0,0.1)]">
                  <p className="text-[16px] leading-6 font-medium text-fg">{item.title}</p>
                  <p className="mt-1 text-[13px] leading-5 text-subtle">{item.text}</p>
                </div>
              ) : (
                <p
                  className={cn(
                    "pt-0.5 text-[18px] leading-7",
                    done ? "text-[#a3a3a3]" : "text-[#a3a3a3]",
                  )}
                >
                  {item.title}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {intro ? (
        <p className="mt-9 text-[14px] leading-5 text-subtle">
          Need urgent dental care? Please don&rsquo;t wait to register. Call{" "}
          <a href={PRACTICE_PHONE_HREF} className="text-fg underline underline-offset-4">
            {PRACTICE_PHONE}
          </a>{" "}
          any time, day or night.
        </p>
      ) : null}
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
  const fields = visibleFields(screen, answers);
  return (
    <div>
      <h1 ref={headingRef} tabIndex={-1} className={HEADING}>
        {screen.title}
      </h1>
      {screen.description ? (
        <p className="mt-3 text-[16px] leading-6 text-subtle">{screen.description}</p>
      ) : null}

      {screen.section === "review" ? <ReviewSummary answers={answers} /> : null}

      <div className="mt-8 grid gap-6">
        {fields.map((field) => (
          <FieldView
            key={field.id}
            field={field}
            answers={answers}
            error={touched[field.id] ? errors[field.id] : undefined}
            hideLabel={normal(field.label) === normal(screen.title)}
            onChange={onChange}
            onBlur={onBlur}
          />
        ))}
      </div>

      {screen.section === "review" ? (
        <p className="mt-6 text-[14px] leading-5 text-subtle">
          Read how we look after your information in our{" "}
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener"
            className="text-fg underline underline-offset-4"
          >
            Privacy Policy
          </a>
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

/** The contact details the team will use, and how much is being sent (the Hims "almost done" card). */
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
    <div className="mt-8 rounded-[14px] bg-white p-5 shadow-[0_6px_24px_rgba(0,0,0,0.1)]">
      <dl className="grid gap-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[12px] leading-4 text-subtle">{label}</dt>
            <dd className="text-[16px] leading-6 text-fg">{value || "—"}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 border-t border-black/10 pt-3 text-[14px] leading-5 text-subtle">
        {count} answers in {sections.length} sections will be sent. Use the back arrow if you want
        to change anything.
      </p>
    </div>
  );
}

/**
 * The thank-you page, after the Hims "Before we get to your treatment options" screen: cream page,
 * a large two-tone headline (brown and gold) centred in the column, and a black pill at the foot.
 * The live form's thank-you words are kept: thanks for registering, and who to email for support.
 */
function ThankYou({ headingRef }: { headingRef: HeadingRef }) {
  return (
    <main className="flex min-h-dvh flex-col bg-surface text-fg">
      <div className="mx-auto flex w-full max-w-[528px] flex-1 flex-col px-5 md:px-0">
        <div role="status" className="flex flex-1 flex-col justify-center py-16">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-[42px] leading-[1.17] font-medium tracking-[-0.025em] text-[#7a4a2a] outline-none md:text-[56px]"
          >
            Thank you for <span className="text-[#c8995f]">registering</span> with Pav Dental.
          </h1>
          <p className="mt-6 text-[16px] leading-6 text-[#7a4a2a]/80">
            If you ever need support, please feel free to email us at{" "}
            <a href={`mailto:${PRACTICE_EMAIL}`} className="underline underline-offset-4">
              {PRACTICE_EMAIL}
            </a>
          </p>
        </div>
        <div className="pb-6">
          <a
            href="/"
            className="flex h-12 w-full items-center justify-center rounded-pill bg-black text-[16px] font-medium text-white transition-colors duration-300 hover:bg-black/80"
          >
            Continue
          </a>
        </div>
      </div>
    </main>
  );
}
