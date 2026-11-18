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
    <section className="pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-medium">Meet Our Team</h2>
          <p className="mt-4 text-muted">
            The dedicated professionals behind PavDental's exceptional care
          </p>
        </div>
        <TeamShowcase members={members} />
        <div className="mt-10 text-center">
          <a
            href="/team"
            className="inline-flex items-center gap-2 rounded-full   bg-white px-6 py-2.5 text-sm font-semibold text-primary shadow-xs transition-all hover:border-primary hover:bg-primary hover:text-white"
          >
            <span>Meet our dentists</span>
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
