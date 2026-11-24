import { BookButton, ButtonLink, ProductDetail } from "@/components/hims";

const OPTIONS = [
  {
    id: "clinic",
    name: "Visit Our Clinic",
    price: "Digital scan",
    note: "Accurate digital scan with quick delivery",
  },
  {
    id: "home",
    name: "Order From Home",
    price: "Mould kit",
    note: "Easy mould kit sent to your door",
  },
];

export function MouthguardsHero() {
  return (
    <ProductDetail
      label="Custom sports mouthguards"
      pill="Athletic & Everyday Oral Protection"
      title={
        <>
          Custom Sports <span className="text-[#8a4242]">Mouthguards</span>
        </>
      }
      text={
        <>
          <p className="font-medium text-[#2a2a2c]">
            Designed for comfort, accuracy and full protection
          </p>
          <p className="mt-3 text-[16px] leading-[1.5]">
            At Pav Dental, you can order a high quality custom mouthguard in the way that suits you
            best. Every mouthguard is created using precise digital or physical impressions with
            full control over colour, style and custom features.
          </p>
        </>
      }
      images={[
        {
          src: "/images/generated/mouthguards-hero.jpg",
          alt: "Custom sports mouthguard on a warm cream tray in soft studio light",
        },
        { src: "/images/generated/home-checkup.jpg", alt: "" },
        { src: "/images/generated/home-general-dentistry.jpg", alt: "" },
      ]}
      optionsTitle="How to Order Your Mouthguard"
      options={OPTIONS}
      primary={() => <BookButton>Make an Appointment</BookButton>}
      secondary={
        <ButtonLink href="#contact" variant="outline">
          Contact us
        </ButtonLink>
      }
      accordions={[
        {
          title: "Impressions: digital or mould kit",
          body: (
            <p>
              Digital Scan or Mould Kit: every mouthguard is created using precise digital or
              physical impressions.
            </p>
          ),
        },
        {
          title: "Choose Your Colour",
          body: (
            <p>
              You can choose from a variety of colour options, including single colour, two colour
              combinations, mixed colours, or glitter and special finishes for a more unique look.
            </p>
          ),
        },
        {
          title: "Add Personalisation",
          body: (
            <p>
              Personalise your mouthguard with your name, initials, team name, number, or even a
              custom logo if required.
            </p>
          ),
        },
        {
          title: "Jump to",
          body: (
            <p className="flex flex-wrap gap-x-6 gap-y-2">
              <a href="#ordering" className="underline underline-offset-4">
                How to Order Your Mouthguard
              </a>
              <a href="#colour" className="underline underline-offset-4">
                Choose Your Colour
              </a>
              <a href="#personalisation" className="underline underline-offset-4">
                Add Personalisation
              </a>
            </p>
          ),
        },
      ]}
    />
  );
}
