import { Link } from "@tanstack/react-router";
import { BookButton, ButtonLink, CallButton } from "@/components/hims";
import { TEAM_MEMBERS } from "@/content/team-members";

/**
 * Team and contact band for the About page, in the same Hims-on-white language as the
 * rest of the page: the Mobbin "Leadership" photo-grid with a caption under each photo,
 * set in the soft white shadow cards of Hims "by the numbers", then a lavender call-out
 * that picks up the banner colours.
 */
const TITLE =
  "text-[clamp(36px,4.4vw,64px)] leading-[1.03] font-normal tracking-[-0.03em] text-[#1b1b1b]";

export function Team() {
  return (
    <>
      <section className="bg-white py-14 md:py-24">
        <div className="wrap-bento max-w-[1396px]">
          <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
            <h2 className={TITLE}>
              Care led by real <span className="text-[#8b8d92]">clinicians and care team</span>
            </h2>
            <p className="text-[clamp(18px,1.5vw,22px)] leading-[1.35] text-[#55565a]">
              The dedicated dentists, compliance leads, and support team behind Pav Dental in
              Bradford.
            </p>
          </div>

          <ul className="mt-12 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {TEAM_MEMBERS.map((member, index) => (
              <li key={member.slug}>
                <Link
                  to="/team/$slug"
                  params={{ slug: member.slug }}
                  className="group flex h-full flex-col rounded-[22px] bg-white p-2.5 shadow-[0_10px_36px_rgba(20,20,40,0.07)] t-lift md:p-3"
                >
                  <div className="aspect-[4/5] overflow-hidden rounded-[16px] bg-[#f4f1ea]">
                    <img
                      // Restyled portraits for this section only, in team order; /team and the profiles keep the live site's photos.
                      src={`/images/about/team-${index + 1}.webp`}
                      alt={member.name}
                      loading="lazy"
                      className="size-full object-cover object-top t-lift group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="px-1.5 pt-4 pb-2">
                    <p className="text-[18px] leading-tight text-[#1b1b1b]">{member.name}</p>
                    <p className="mt-1 text-[14px] leading-snug text-[#55565a]">{member.role}</p>
                    {member.gdc ? (
                      <p className="mt-2 text-[13px] text-[#5b3fc4]">GDC {member.gdc}</p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex justify-center">
            <ButtonLink to="/team" variant="outline">
              Meet our dentists
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="bg-white pb-14 md:pb-24">
        <div className="wrap-bento max-w-[1396px]">
          <div className="rounded-[28px] bg-gradient-to-br from-[#d9cdf6] via-[#ece6fa] to-[#f7f3fd] px-6 py-14 text-center md:px-10 md:py-20">
            <h2 className={TITLE}>Get In Touch</h2>
            <p className="mx-auto mt-5 max-w-[34rem] text-[clamp(18px,1.5vw,22px)] leading-[1.35] text-[#55565a]">
              Ready to take control of your dental health? Contact us to book your appointment
              today!
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <BookButton>Book Now</BookButton>
              <ButtonLink to="/contact-us" variant="outline">
                Contact Us
              </ButtonLink>
              <CallButton variant="outline" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
