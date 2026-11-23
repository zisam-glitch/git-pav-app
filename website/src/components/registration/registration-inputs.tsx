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
 * The fields of the registration flow, in the Hims intake style: a rounded box with a
 * small label above the value, option cards that turn black-edged when chosen, and
 * checkbox cards for "all that apply".
 */

const BOX =
  "rounded-[14px] border-2 border-border-strong bg-white px-4 pt-2 pb-1 transition-[border-color,box-shadow] duration-150 focus-within:border-black focus-within:ring-1 focus-within:ring-black";
const CONTROL =
  "w-full bg-transparent pb-1.5 text-label text-fg outline-none placeholder:font-normal placeholder:text-subtle";
const CARD =
  "block cursor-pointer rounded-[14px] border-2 border-border-strong bg-white px-4 py-3.5 text-label text-fg transition-[border-color,background-color,box-shadow] duration-150 hover:border-black peer-checked:border-black peer-checked:bg-cream peer-focus-visible:ring-2 peer-focus-visible:ring-black peer-focus-visible:ring-offset-2";

export interface FieldViewProps {
  field: Field;
  answers: Answers;
  error?: string;
  /** The screen's title already asks this question, so the label is kept for screen readers only. */
  hideLabel?: boolean;
  autoFocus?: boolean;
  onChange: (id: string, value: string | string[]) => void;
  onBlur: (id: string) => void;
}

const text = (value: string | string[] | undefined) => (typeof value === "string" ? value : "");

function ErrorText({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} role="alert" className="mt-1.5 text-small text-danger">
      {error}
    </p>
  );
}

function BoxLabel({ htmlFor, children, optional }: { htmlFor: string; children: ReactNode; optional?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="block text-caption text-subtle">
        {children}
      </label>
      {optional ? <span className="shrink-0 text-caption text-subtle">Optional</span> : null}
    </div>
  );
}

function Question({ id, children, hidden }: { id: string; children: ReactNode; hidden?: boolean }) {
  return (
    <legend id={id} className={cn("mb-3 block text-label text-fg", hidden && "sr-only")}>
      {children}
    </legend>
  );
}

function TextBox({ field, answers, error, autoFocus, onChange, onBlur }: FieldViewProps) {
  if (field.kind !== "text" && field.kind !== "textarea" && field.kind !== "email" && field.kind !== "tel") return null;
  const id = `reg-${field.id}`;
  const long = field.label.length > 46;
  const props = {
    id,
    name: field.id,
    value: text(answers[field.id]),
    placeholder: field.placeholder,
    autoComplete: field.autoComplete,
    maxLength: field.maxLength ?? (field.kind === "textarea" ? 1500 : 200),
    autoFocus,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
    onBlur: () => onBlur(field.id),
    className: CONTROL,
  } as const;

  return (
    <div>
      {long ? (
        <label htmlFor={id} className="mb-2 flex items-baseline justify-between gap-3 text-label text-fg">
          <span>{field.label}</span>
          {field.optional ? <span className="shrink-0 text-caption font-normal text-subtle">Optional</span> : null}
        </label>
      ) : null}
      <div className={cn(BOX, long && "pt-3 pb-1", error && "border-danger focus-within:border-danger focus-within:ring-danger")}>
        {long ? null : (
          <BoxLabel htmlFor={id} optional={field.optional}>
            {field.label}
          </BoxLabel>
        )}
        {field.kind === "textarea" ? (
          <textarea
            {...props}
            rows={3}
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

function DateOfBirth({ field, answers, error, autoFocus, onChange, onBlur }: FieldViewProps) {
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
        {parts.map((part, index) => (
          <div key={part.key} className={cn(BOX, error && "border-danger")}>
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
              autoFocus={autoFocus && index === 0}
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

function SelectBox({ field, answers, error, autoFocus, onChange, onBlur }: FieldViewProps) {
  if (field.kind !== "select") return null;
  const id = `reg-${field.id}`;
  return (
    <div>
      <div className={cn(BOX, "relative", error && "border-danger")}>
        <BoxLabel htmlFor={id} optional={field.optional}>
          {field.label}
        </BoxLabel>
        <select
          id={id}
          name={field.id}
          autoFocus={autoFocus}
          value={text(answers[field.id])}
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
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted"
        />
      </div>
      <ErrorText id={id} error={error} />
    </div>
  );
}

function Choice({ field, answers, error, hideLabel, autoFocus, onChange, onBlur }: FieldViewProps) {
  if (field.kind !== "choice") return null;
  const id = `reg-${field.id}`;
  const value = text(answers[field.id]);
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <Question id={`${id}-question`} hidden={hideLabel}>
        {field.label}
        {field.optional ? <span className="ml-2 text-caption font-normal text-subtle">Optional</span> : null}
      </Question>
      {field.hint ? <p className="-mt-1 mb-3 text-small text-muted">{field.hint}</p> : null}
      <div className={cn("grid gap-3", field.options.length === 2 || field.options.length === 3 ? "sm:grid-cols-2" : "")}>
        {field.options.map((option, index) => (
          <label key={option} className="block">
            <input
              type="radio"
              name={field.id}
              value={option}
              checked={value === option}
              autoFocus={autoFocus && index === 0}
              onChange={() => onChange(field.id, option)}
              onBlur={() => onBlur(field.id)}
              className="peer sr-only"
            />
            <span className={CARD}>{option}</span>
          </label>
        ))}
      </div>
      <ErrorText id={id} error={error} />
    </fieldset>
  );
}

function Multi({ field, answers, error, hideLabel, autoFocus, onChange, onBlur }: FieldViewProps) {
  if (field.kind !== "multi") return null;
  const id = `reg-${field.id}`;
  const chosen = Array.isArray(answers[field.id]) ? (answers[field.id] as string[]) : [];
  const toggle = (option: string) =>
    onChange(field.id, chosen.includes(option) ? chosen.filter((item) => item !== option) : [...chosen, option]);

  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <Question id={`${id}-question`} hidden={hideLabel}>
        {field.label}
        {field.optional ? <span className="ml-2 text-caption font-normal text-subtle">Optional</span> : null}
      </Question>
      <div className="grid gap-3">
        {field.options.map((option, index) => {
          const selected = chosen.includes(option);
          const key = detailKey(field.id, option);
          return (
            <div key={option}>
              <label className="block">
                <input
                  type="checkbox"
                  name={field.id}
                  value={option}
                  checked={selected}
                  autoFocus={autoFocus && index === 0}
                  onChange={() => toggle(option)}
                  onBlur={() => onBlur(field.id)}
                  className="peer sr-only"
                />
                <span className={cn(CARD, "flex items-center justify-between gap-4")}>
                  <span>{option}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-[6px] border-2 border-border-strong",
                      selected && "border-black bg-black text-white",
                    )}
                  >
                    {selected ? <Check className="size-3.5" /> : null}
                  </span>
                </span>
              </label>
              {selected && field.details ? (
                <div className={cn(BOX, "mt-2")}>
                  <BoxLabel htmlFor={`${id}-${index}-details`} optional>
                    Please provide details
                  </BoxLabel>
                  <textarea
                    id={`${id}-${index}-details`}
                    rows={2}
                    maxLength={500}
                    value={text(answers[key])}
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

function Agree({ field, answers, error, onChange, onBlur }: FieldViewProps) {
  const id = `reg-${field.id}`;
  return (
    <div>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-3 rounded-[14px] border-2 border-border-strong bg-white p-4 text-body text-fg transition-[border-color] duration-150 hover:border-black has-[:checked]:border-black has-[:checked]:bg-cream"
      >
        <input
          id={id}
          name={field.id}
          type="checkbox"
          checked={answers[field.id] === "yes"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(field.id, event.target.checked ? "yes" : "")}
          onBlur={() => onBlur(field.id)}
          className="mt-0.5 size-5 shrink-0 accent-black"
        />
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
