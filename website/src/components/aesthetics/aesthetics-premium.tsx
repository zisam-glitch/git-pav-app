import { BookButton, ButtonLink, HUB_CARD, Section } from "@/components/hims";

export function AestheticsPremium() {
  return (
    <Section theme="white" space="sm" aria-labelledby="aesthetics-premium-heading">
      <div className={`${HUB_CARD} grid items-center gap-8 p-4 md:p-6 lg:grid-cols-2 lg:gap-14`}>
        <div className="overflow-hidden rounded-[20px]">
          <img
            src="/images/generated/aesthetics-premium.jpg"
            alt="Curated aesthetic skincare vials and clinical ceramic tray in warm studio light"
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
        <div className="px-3 py-4 md:px-6">
          <h2
            id="aesthetics-premium-heading"
            className="text-[clamp(30px,3.4vw,44px)] leading-[1.08] font-normal tracking-[-0.02em] text-[#2a2a2c]"
          >
            <span className="text-[#8a4242]">We exclusively utilise premium-grade products</span> of
            exceptional quality
          </h2>
          <p className="mt-5 text-[18px] leading-[1.45] text-[#55565a]">
            Experience excellence with our Aesthetics services, where we use only the finest
            products to ensure exceptional results each time.
          </p>
          <p className="mt-4 text-[15px] leading-[1.5] text-[#6b6b70]">
            Indulge in the finest aesthetic treatments you'll ever experience. Through meticulous
            research, we have curated a selection of top-notch products, ensuring utmost quality and
            satisfaction for our esteemed clients. Prepare to be impressed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Book Now</BookButton>
            <ButtonLink href="#pricing" variant="outline">
              Aesthetics Price List
            </ButtonLink>
          </div>
        </div>
      </div>
    </Section>
  );
}
