import { BookButton, ButtonLink, CallButton, Section } from "@/components/hims";

export function GrillzPricing() {
  return (
    <Section
      id="guarantee"
      theme="white"
      className="bg-[#f6f3ec]"
      aria-labelledby="grillz-guarantee-heading"
    >
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="overflow-hidden rounded-[24px] bg-[#120d08]">
          <img
            src="/images/generated/custom-grillz-craft.jpg"
            alt="Custom-crafted dental grillz presentation box in warm studio light"
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
        <div>
          <h2
            id="grillz-guarantee-heading"
            className="mt-3 text-[clamp(36px,4.4vw,60px)] leading-[1.04] font-normal tracking-[-0.03em] text-[#2a1c12]"
          >
            One Year <span className="text-[#8a4242]">Guarantee</span>
          </h2>
          <p className="mt-5 text-[19px] leading-[1.45] text-[#55565a]">
            We stand by our craftsmanship. All our grillz come with a 1-year guarantee, ensuring
            your satisfaction and peace of mind.
          </p>
          <div className="mt-8 grid gap-3">
            <div className="rounded-[20px] bg-white p-6">
              <h3 className="mt-2 text-[22px] leading-[1.15] font-normal text-[#2a1c12]">
                A Dazzling Smile, Just a Click Away!
              </h3>
              <p className="mt-2 text-[15px] leading-[1.5] text-[#6b6b70]">
                At Pav Dental, we believe in making luxury accessible. That&apos;s why we&apos;re
                thrilled to offer our exclusive grillz with worldwide delivery. No matter where you
                are, you can have custom-crafted, dazzling grillz delivered right to your doorstep.
              </p>
            </div>
            <div className="rounded-[20px] bg-white p-6">
              <h3 className="mt-2 text-[22px] leading-[1.15] font-normal text-[#2a1c12]">
                Shine in Your Unique Way
              </h3>
              <p className="mt-2 text-[15px] leading-[1.5] text-[#6b6b70]">
                Ready to create your signature grillz? Contact Pav Dental today for a consultation.
                Our experts are excited to help you design a piece that&apos;s as unique as you are.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Book Now</BookButton>
            <ButtonLink href="#contact" variant="outline">
              Get a design quote
            </ButtonLink>
            <CallButton variant="ghost" />
          </div>
        </div>
      </div>
    </Section>
  );
}
