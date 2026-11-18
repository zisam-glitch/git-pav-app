import { Link } from "@tanstack/react-router";
import { TEAM_MEMBERS } from "@/content/team-members";
import { TeamPhoto } from "./team-photo";

/** The team page: one card per person, each linking to their own profile page. */
export function TeamGrid() {
  return (
    <div className="bg-[#fffdf9] pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">Dentists &amp; Staff</h1>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6b5848]">
            We have a dedicated team consisting of highly skilled dentists and staff who works relentlessly to preserve your
            happy smile.
          </p>
        </header>

        <ul className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {TEAM_MEMBERS.map((member, index) => (
            <li key={member.slug}>
              <Link
                to="/team/$slug"
                params={{ slug: member.slug }}
                className="group block overflow-hidden rounded-xl   bg-white shadow-sm transition-colors hover:border-[#925a27]"
              >
                <TeamPhoto
                  member={member}
                  priority={index < 4}
                  className="aspect-[4/5] w-full bg-[#faf6f0] object-cover object-top"
                />
                <span className="block p-3 sm:p-5">
                  <span className="block font-display text-base sm:text-lg font-bold text-[#2a1c12] group-hover:text-[#925a27]">
                    {member.name}
                  </span>
                  <span className="mt-1 block text-xs sm:text-sm text-[#6b5848]">{member.role}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
