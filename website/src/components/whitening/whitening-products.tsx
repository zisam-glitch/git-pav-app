import { BookButton, SectionHead, Section } from "@/components/hims";
import { PRODUCTS_DATA } from "./whitening-data";

/** The three live whitening ranges as Hims product cards: grey image tile, name, price, text, button. */
export function WhiteningProducts() {
  return (
    <Section id="products" theme="white" aria-labelledby="whitening-products-heading">
      <SectionHead
        id="whitening-products-heading"
        label="Our whitening ranges"
        accent="Award Winning"
        title="Whitening"
        action={<BookButton>Book Now</BookButton>}
      >
        Experience our award-winning whitening treatments for a brilliantly radiant smile. Discover
        the difference of our acclaimed whitening services today.
      </SectionHead>

      <ul className="mt-10 grid list-none gap-4 md:grid-cols-3">
        {PRODUCTS_DATA.map((product) => (
          <li key={product.id} className="flex flex-col rounded-[24px] bg-[#f7f7f7] p-3">
            <div className="overflow-hidden rounded-[18px] bg-[#efe9dd]">
              <img
                src={product.image}
                alt={product.alt}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col px-3 pt-5 pb-3">
              <h3 className="text-[28px] leading-[1.1] font-normal tracking-[-0.02em] text-[#2a2a2c]">
                {product.name} - <span className="tabular-nums">{product.price}</span>
              </h3>
              <ul className="mt-3 flex list-none flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-white px-3 py-1 text-[13px] text-[#55565a]"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex-1 text-[15px] leading-[1.5] text-[#6b6b70]">
                {product.description}
              </p>
              <div className="mt-6">
                <BookButton className="w-full">Appointment</BookButton>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
