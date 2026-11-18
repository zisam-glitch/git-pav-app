import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamShowcase } from "@/components/ui/team-showcase";
import { TEAM_MEMBERS } from "@/content/team-members";

// The people on the team page, as on the live site.
export function Team() {
  const members = TEAM_MEMBERS.map((member) => ({
    id: member.slug,
    name: member.name,
    role: member.role,
    image: member.photo.src,
  }));

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 border-t border-black/10 pt-14 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">Clinicians &amp; Staff</p>
            <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
              Meet Our <span className="text-[#754B3D]">Team</span>
            </h2>
            <p className="mt-3 max-w-xl text-base text-black/65">
              The dedicated professionals behind Pav Dental&apos;s exceptional care
            </p>
          </div>
          <Button asChild size="lg">
            <a href="/team">
              Meet our dentists
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </Button>
        </div>

        <TeamShowcase members={members} />
      </div>
    </section>
  );
}
