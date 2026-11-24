import { useState } from "react";
import { BookButton, ButtonLink, CallButton, Section } from "@/components/hims";
import { cn } from "@/lib/utils";

const GALLERY = [
  {
    src: "/images/generated/dentures-hero.jpg",
    alt: "Custom dental prosthetic model on a warm cream ceramic tray in soft studio light",
  },
  {
    src: "/images/generated/dentures-showcase.jpg",
    alt: "Acrylic and flexible denture craftsmanship on a calm dark studio surface",
  },
  { src: "/images/generated/home-checkup.jpg", alt: "A dentist checking a patient's smile" },
] as const;

/** The three priced types from the live page; `note` is the live "Intermediate / Premium" line where there is one. */
const TYPES = [
  {
    id: "acrylic",
    name: "Acrylic Denture",
    price: "£495",
    note: "Intermediate - acrylic with clasps",
  },
  {
    id: "flexible",
    name: "Flexible (Valplast) Denture",
    price: "£795",
    note: "Premium - Flexible denture",
  },
  { id: "cobalt", name: "Cobalt Chromium Denture", price: "£1195", note: null },
] as const;

const DETAILS = [
  {
    title: "Denture solutions",
    body: (
      <>
        <p className="font-medium text-fg">We offer a variety of denture solutions, including:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Full Dentures</li>
          <li>Partial Dentures</li>
          <li>Implant-Supported Dentures</li>
          <li>Flexible Dentures</li>
        </ul>
        <p className="mt-3">We Are The Dentists That Come To You.</p>
      </>
    ),
  },
  {
    title: "Affordable Denture Options",
    body: (
      <p>
        Our team of skilled professionals uses the latest technology to scan, design, and fit
        dentures that look and feel natural. We prioritize both comfort and aesthetics in every set
        we create.
      </p>
    ),
  },
  {
    title: "Our Denture Prices",
    body: (
      <>
        <p>Qualifications: Make sure the dentist is board-certified and has good reviews.</p>
        <ul className="mt-2 space-y-1 tabular-nums">
          <li>• Acrylic Denture – £495</li>
          <li>• Flexible (Valplast) Denture – £795</li>
          <li>• Cobalt Chromium Denture – £1195</li>
        </ul>
      </>
    ),
  },
] as const;

export function DenturesProduct() {
  const [active, setActive] = useState(0);
  const [type, setType] = useState<(typeof TYPES)[number]["id"]>("acrylic");
  const chosen = TYPES.find((t) => t.id === type) ?? TYPES[0];

  return (
    <Section
      id="top"
      theme="white"
      space="none"
      className="pt-6 pb-14 md:pt-10 md:pb-20"
      aria-label="Dentures at Pav Dental"
    >
      <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <div className="lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-[24px] bg-[#efe9dd]">
            <img
              src={GALLERY[active].src}
              alt={GALLERY[active].alt}
              className="aspect-[5/4] size-full object-cover"
            />
          </div>
          <div className="mt-4 flex justify-center gap-3" role="group" aria-label="Gallery">
            {GALLERY.map((g, i) => (
              <button
                key={g.src}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-pressed={i === active}
                className={cn(
                  "size-16 overflow-hidden rounded-full border-2 t-colors",
                  i === active ? "border-fg" : "border-transparent opacity-80 hover:opacity-100",
                )}
              >
                <img src={g.src} alt="" aria-hidden className="size-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="inline-flex rounded-pill bg-[#8a4242] px-3 py-1 text-caption font-medium text-white">
            Dentures at Pav Dental
          </p>
          <h1 className="mt-4 text-[clamp(38px,4.6vw,60px)] leading-[1.02] font-normal tracking-[-0.03em] text-[#2a2a2c]">
            Customized Dentures for a Confident Smile
          </h1>
          <p className="mt-4 text-lead text-muted">
            At Pav Dental, we specialize in crafting high-quality dentures that not only look
            natural but also provide superior comfort. Our experienced team works closely with you
            to ensure your dentures are tailored to your needs, giving you a perfect fit and renewed
            confidence in your smile.
          </p>

          <fieldset className="mt-7">
            <legend className="text-small font-medium text-fg">Our Denture Prices:</legend>
            <div className="mt-3 grid gap-3">
              {TYPES.map((t) => {
                const on = t.id === type;
                return (
                  <label
                    key={t.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-4 rounded-[16px] border p-4 t-colors",
                      on ? "border-fg bg-[#f4f2ee]" : "border-border bg-white hover:border-fg/40",
                    )}
                  >
                    <input
                      type="radio"
                      name="denture-type"
                      value={t.id}
                      checked={on}
                      onChange={() => setType(t.id)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full border",
                        on ? "border-fg bg-fg" : "border-border",
                      )}
                    >
                      {on ? <span className="size-2 rounded-full bg-white" /> : null}
                    </span>
                    <span className="flex-1">
                      <span className="block text-body font-medium text-fg">{t.name}</span>
                      {t.note ? (
                        <span className="block text-small text-muted">{t.note}</span>
                      ) : null}
                    </span>
                    <span className="text-h4 text-fg tabular-nums">{t.price}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <p className="mt-4 text-small text-muted" aria-live="polite">
            Selected: {chosen.name} – {chosen.price}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <BookButton className="min-w-48 flex-1">Make an Appointment</BookButton>
            <ButtonLink href="#contact" variant="outline">
              Contact us
            </ButtonLink>
            <CallButton variant="ghost" />
          </div>

          <p className="mt-6 text-body font-medium text-fg">
            Book your free consultation today with one of our GDC-registered dentists to start your
            journey towards a confident, healthy smile.
          </p>

          <div className="mt-6 border-t border-border">
            {DETAILS.map((d, i) => (
              <details key={d.title} className="group border-b border-border" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-body font-medium text-fg">
                  {d.title}
                  <span aria-hidden className="text-muted t-colors group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="pb-5 text-body text-muted">{d.body}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
