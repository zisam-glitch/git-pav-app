import { BookButton, ButtonLink, ProductDetail } from "@/components/hims";

const OPTIONS = [
  { id: "acrylic", name: "Acrylic Denture", price: "£495", note: "Acrylic Denture – £495" },
  {
    id: "flexible",
    name: "Flexible (Valplast) Denture",
    price: "£795",
    note: "Flexible (Valplast) Denture – £795",
  },
  {
    id: "cobalt",
    name: "Cobalt Chromium Denture",
    price: "£1195",
    note: "Cobalt Chromium Denture – £1195",
  },
];

export function DenturesHero() {
  return (
    <ProductDetail
      label="Dentures at Pav Dental"
      pill="Dentures at Pav Dental"
      title={
        <>
          Customized Dentures for a <span className="text-[#8a4242]">Confident Smile :</span>
        </>
      }
      text={
        <p>
          At Pav Dental, we specialize in crafting high-quality dentures that not only look natural
          but also provide superior comfort. Our experienced team works closely with you to ensure
          your dentures are tailored to your needs, giving you a perfect fit and renewed confidence
          in your smile.
        </p>
      }
      images={[
        {
          src: "/images/generated/dentures-hero.jpg",
          alt: "Custom dental prosthetic model on a warm cream ceramic tray in soft studio light",
        },
        { src: "/images/generated/dentures-showcase.jpg", alt: "" },
        { src: "/images/generated/home-checkup.jpg", alt: "" },
        { src: "/images/generated/home-general-dentistry.jpg", alt: "" },
      ]}
      optionsTitle="Our Denture Prices:"
      options={OPTIONS}
      primary={() => <BookButton>Make an Appointment</BookButton>}
      secondary={
        <ButtonLink href="#contact" variant="outline">
          Contact us
        </ButtonLink>
      }
      accordions={[
        {
          title: "We offer a variety of denture solutions, including:",
          body: (
            <>
              <p className="font-medium text-[#2a2a2c]">We Are The Dentists That Come To You.</p>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                <li>Full Dentures</li>
                <li>Partial Dentures</li>
                <li>Implant-Supported Dentures</li>
                <li>Flexible Dentures</li>
              </ul>
            </>
          ),
        },
        {
          title: "Affordable Denture Options",
          body: (
            <p>
              Our team of skilled professionals uses the latest technology to scan, design, and fit
              dentures that look and feel natural. We prioritize both comfort and aesthetics in
              every set we create.
            </p>
          ),
        },
        {
          title: "Our Denture Prices:",
          body: (
            <>
              <p>Qualifications: Make sure the dentist is board-certified and has good reviews.</p>
              <ul className="mt-3 space-y-1">
                <li>• Acrylic Denture – £495</li>
                <li>• Flexible (Valplast) Denture – £795</li>
                <li>• Cobalt Chromium Denture – £1195</li>
              </ul>
            </>
          ),
        },
        {
          title: "Jump to",
          body: (
            <p className="flex flex-wrap gap-x-6 gap-y-2">
              <a href="#solutions" className="underline underline-offset-4">
                Denture Solutions
              </a>
              <a href="#pricing" className="underline underline-offset-4">
                Our Denture Prices (£495 – £1195)
              </a>
            </p>
          ),
        },
      ]}
    />
  );
}
