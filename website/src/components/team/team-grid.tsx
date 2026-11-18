import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { TEAM_MEMBERS } from "@/content/team-members";
import { TeamPhoto } from "./team-photo";

/** The team page: one card per person, each linking to their own profile page. */
export function TeamGrid() {
  return (
    <div className="bg-[#FBF8F5] pb-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Our Practice Team
          </p>
          <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.04em] leading-[1.06] text-black sm:text-5xl lg:text-6xl">
            Dentists &amp; <span className="text-[#754B3D]">Staff</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-black/65 sm:text-base">
            We have a dedicated team consisting of highly skilled dentists and staff who works
            relentlessly to preserve your happy smile.
          </p>
        </header>

        <ul className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {TEAM_MEMBERS.map((member, index) => (
            <li key={member.slug}>
              <Link
                to="/team/$slug"
                params={{ slug: member.slug }}
                className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-black/6 bg-[#FAF8F2] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_28px_rgba(0,0,0,0.05)]"
              >
                <div className="overflow-hidden bg-[#F2EDE5]">
                  <TeamPhoto
                    member={member}
                    priority={index < 4}
                    className="aspect-[4/5] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <span className="flex flex-1 flex-col justify-between p-4 sm:p-6">
                  <span>
                    <span className="block font-display text-lg font-normal tracking-[-0.025em] text-black group-hover:text-[#1B3745] sm:text-xl">
                      {member.name}
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-black/60 sm:text-sm">
                      {member.role}
                    </span>
                    {member.gdc && (
                      <span className="mt-2 inline-block rounded-full bg-[#F2EDE5] px-2.5 py-0.5 text-[11px] font-medium text-[#1B3745]">
                        GDC {member.gdc}
                      </span>
                    )}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#754B3D] group-hover:text-[#1B3745]">
                    View profile
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
