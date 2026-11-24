import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import {
  type Answers,
  DOB_DAY,
  DOB_MONTH,
  DOB_YEAR,
  type Field,
  detailKey,
  optionsFor,
} from "@/content/registration-form";
import { cn } from "@/lib/utils";

/**
 * The fields of the registration flow, matched to the Hims intake screens (Completing
 * health history, Completing weight loss profile): a tall rounded box with a small label
 * above the value whose outline turns brand-red once it is focused or filled, option
 * cards with an indicator on the right, and black pills.
 */

/** A field box: grey outline, brand-red when focused or filled, red-alert on error. */
function box(filled: boolean, error?: string, extra?: string) {
  return cn(
    "min-h-[68px] rounded-[14px] border-2 bg-white px-4 pt-3 pb-1.5 transition-[border-color] duration-150 focus-within:border-terracotta",
    filled ? "border-terracotta" : "border-[#d9d9d9]",
    error && "border-danger focus-within:border-danger",
    extra,
  );
}

const CONTROL =
  "w-full bg-transparent pb-1 text-[16px] leading-6 text-fg outline-none placeholder:text-subtle";

const CARD_BASE =
  "flex min-h-[64px] cursor-pointer items-center justify-between gap-4 rounded-[14px] border-2 bg-white px-5 py-3 text-[16px] leading-6 text-fg transition-[border-color] duration-150 hover:border-terracotta peer-focus-visible:ring-2 peer-focus-visible:ring-terracotta peer-focus-visible:ring-offset-2";

export interface FieldViewProps {
  field: Field;
  answers: Answers;
  error?: string;
  /** The screen's heading already asks this question, so the label is kept for screen readers only. */
  hideLabel?: boolean;
  onChange: (id: string, value: string | string[]) => void;
  onBlur: (id: string) => void;
}

const text = (value: string | string[] | undefined) => (typeof value === "string" ? value : "");

function ErrorText({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} role="alert" className="mt-2 text-small text-danger">
      {error}
    </p>
  );
}

function BoxLabel({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="block text-[12px] leading-4 text-subtle">
        {children}
      </label>
      {optional ? (
        <span className="shrink-0 text-[12px] leading-4 text-subtle">Optional</span>
      ) : null}
    </div>
  );
}

function Question({ id, children, hidden }: { id: string; children: ReactNode; hidden?: boolean }) {
  return (
    <legend
      id={id}
      className={cn(
        "mb-4 block text-[22px] leading-[1.2] font-medium text-fg",
        hidden && "sr-only",
      )}
    >
      {children}
    </legend>
  );
}

const OptionalTag = () => (
  <span className="ml-2 align-middle text-[12px] font-normal text-subtle">Optional</span>
);

function TextBox({ field, answers, error, onChange, onBlur }: FieldViewProps) {
  if (
    field.kind !== "text" &&
    field.kind !== "textarea" &&
    field.kind !== "email" &&
    field.kind !== "tel"
  )
    return null;
  const id = `reg-${field.id}`;
  const value = text(answers[field.id]);
  const long = field.label.length > 46;
  const props = {
    id,
    name: field.id,
    value,
    placeholder: field.placeholder,
    autoComplete: field.autoComplete,
    maxLength: field.maxLength ?? (field.kind === "textarea" ? 1500 : 200),
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
    onBlur: () => onBlur(field.id),
    className: CONTROL,
  } as const;

  return (
    <div>
      {long ? (
        <label htmlFor={id} className="mb-3 block text-[22px] leading-[1.2] font-medium text-fg">
          {field.label}
          {field.optional ? <OptionalTag /> : null}
        </label>
      ) : null}
      <div className={box(value !== "", error)}>
        {long ? null : (
          <BoxLabel htmlFor={id} optional={field.optional}>
            {field.label}
          </BoxLabel>
        )}
        {field.kind === "textarea" ? (
          <textarea
            {...props}
            rows={long ? 3 : 2}
            className={cn(CONTROL, "resize-y")}
            onChange={(event) => onChange(field.id, event.target.value)}
          />
        ) : (
          <input
            {...props}
            type={field.kind === "text" ? "text" : field.kind}
            inputMode={field.inputMode}
            onChange={(event) => onChange(field.id, event.target.value)}
          />
        )}
      </div>
      <ErrorText id={id} error={error} />
    </div>
  );
}

function DateOfBirth({ field, answers, error, onChange, onBlur }: FieldViewProps) {
  const id = `reg-${field.id}`;
  const parts = [
    { key: DOB_DAY, label: "Day", placeholder: "DD", max: 2, autoComplete: "bday-day" },
    { key: DOB_MONTH, label: "Month", placeholder: "MM", max: 2, autoComplete: "bday-month" },
    { key: DOB_YEAR, label: "Year", placeholder: "YYYY", max: 4, autoComplete: "bday-year" },
  ];
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="sr-only">{field.label}</legend>
      <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-3">
        {parts.map((part) => (
          <div key={part.key} className={box(text(answers[part.key]) !== "", error)}>
            <BoxLabel htmlFor={`${id}-${part.key}`}>{part.label}</BoxLabel>
            <input
              id={`${id}-${part.key}`}
              name={part.key}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={part.autoComplete}
              placeholder={part.placeholder}
              maxLength={part.max}
              value={text(answers[part.key])}
              aria-invalid={error ? true : undefined}
              onChange={(event) => onChange(part.key, event.target.value.replace(/\D/g, ""))}
              onBlur={() => onBlur(field.id)}
              className={CONTROL}
            />
          </div>
        ))}
      </div>
      <ErrorText id={id} error={error} />
    </fieldset>
  );
}

function SelectBox({ field, answers, error, onChange, onBlur }: FieldViewProps) {
  if (field.kind !== "select") return null;
  const id = `reg-${field.id}`;
  const value = text(answers[field.id]);
  return (
    <div>
      <div className={box(value !== "", error, "relative")}>
        <BoxLabel htmlFor={id} optional={field.optional}>
          {field.label}
        </BoxLabel>
        <select
          id={id}
          name={field.id}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(field.id, event.target.value)}
          onBlur={() => onBlur(field.id)}
          className={cn(CONTROL, "appearance-none pr-8")}
        >
          <option value="">Select</option>
          {optionsFor(field, answers).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-fg"
        />
      </div>
      <ErrorText id={id} error={error} />
    </div>
  );
}

/** The mark on the right of an option card: a ring for one choice, a square for several. */
function Indicator({ selected, square }: { selected: boolean; square?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-[22px] shrink-0 place-items-center border-2 text-white transition-colors duration-150",
        square ? "rounded-[6px]" : "rounded-pill",
        selected ? "border-terracotta bg-terracotta" : "border-[#c4c4c4] bg-white",
      )}
    >
      {selected ? (
        square ? (
          <Check className="size-3.5" strokeWidth={3} />
        ) : (
          <span className="size-2 rounded-pill bg-white" />
        )
      ) : null}
    </span>
  );
}

function Choice({ field, answers, error, hideLabel, onChange, onBlur }: FieldViewProps) {
  if (field.kind !== "choice") return null;
  const id = `reg-${field.id}`;
  const value = text(answers[field.id]);
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <Question id={`${id}-question`} hidden={hideLabel}>
        {field.label}
        {field.optional ? <OptionalTag /> : null}
      </Question>
      {field.hint ? <p className="-mt-2 mb-4 text-body text-subtle">{field.hint}</p> : null}
      <div className="grid gap-3">
        {field.options.map((option) => (
          <label key={option} className="block">
            <input
              type="radio"
              name={field.id}
              value={option}
              checked={value === option}
              onChange={() => onChange(field.id, option)}
              onBlur={() => onBlur(field.id)}
              className="peer sr-only"
            />
            <span
              className={cn(CARD_BASE, value === option ? "border-terracotta" : "border-[#d9d9d9]")}
            >
              <span>{option}</span>
              <Indicator selected={value === option} />
            </span>
          </label>
        ))}
      </div>
      <ErrorText id={id} error={error} />
    </fieldset>
  );
}

function Multi({ field, answers, error, hideLabel, onChange, onBlur }: FieldViewProps) {
  if (field.kind !== "multi") return null;
  const id = `reg-${field.id}`;
  const chosen = Array.isArray(answers[field.id]) ? (answers[field.id] as string[]) : [];
  const toggle = (option: string) =>
    onChange(
      field.id,
      chosen.includes(option) ? chosen.filter((item) => item !== option) : [...chosen, option],
    );

  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <Question id={`${id}-question`} hidden={hideLabel}>
        {field.label}
        {field.optional ? <OptionalTag /> : null}
      </Question>
      <div className="grid gap-3">
        {field.options.map((option, index) => {
          const selected = chosen.includes(option);
          const key = detailKey(field.id, option);
          const detail = text(answers[key]);
          return (
            <div key={option}>
              <label className="block">
                <input
                  type="checkbox"
                  name={field.id}
                  value={option}
                  checked={selected}
                  onChange={() => toggle(option)}
                  onBlur={() => onBlur(field.id)}
                  className="peer sr-only"
                />
                <span
                  className={cn(CARD_BASE, selected ? "border-terracotta" : "border-[#d9d9d9]")}
                >
                  <span>{option}</span>
                  <Indicator selected={selected} square />
                </span>
              </label>
              {selected && field.details ? (
                <div className={box(detail !== "", undefined, "mt-2")}>
                  <BoxLabel htmlFor={`${id}-${index}-details`} optional>
                    Please provide details
                  </BoxLabel>
                  <textarea
                    id={`${id}-${index}-details`}
                    rows={2}
                    maxLength={500}
                    value={detail}
                    onChange={(event) => onChange(key, event.target.value)}
                    className={cn(CONTROL, "resize-y")}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <ErrorText id={id} error={error} />
    </fieldset>
  );
}

/** A checkbox row, as Hims draws its terms line: a small brand-red box, then the sentence. */
function Agree({ field, answers, error, onChange, onBlur }: FieldViewProps) {
  const id = `reg-${field.id}`;
  const checked = answers[field.id] === "yes";
  return (
    <div>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-3 text-[14px] leading-5 text-fg"
      >
        <input
          id={id}
          name={field.id}
          type="checkbox"
          checked={checked}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(field.id, event.target.checked ? "yes" : "")}
          onBlur={() => onBlur(field.id)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 grid size-[22px] shrink-0 place-items-center rounded-[6px] border-2 text-white transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-terracotta peer-focus-visible:ring-offset-2",
            checked ? "border-terracotta bg-terracotta" : "border-terracotta bg-white",
          )}
        >
          {checked ? <Check className="size-3.5" strokeWidth={3} /> : null}
        </span>
        <span>{field.label}</span>
      </label>
      <ErrorText id={id} error={error} />
    </div>
  );
}

/** One question of the registration, drawn for its kind. */
export function FieldView(props: FieldViewProps) {
  switch (props.field.kind) {
    case "text":
    case "textarea":
    case "email":
    case "tel":
      return <TextBox {...props} />;
    case "dob":
      return <DateOfBirth {...props} />;
    case "select":
      return <SelectBox {...props} />;
    case "choice":
      return <Choice {...props} />;
    case "multi":
      return <Multi {...props} />;
    case "agree":
      return <Agree {...props} />;
  }
}
