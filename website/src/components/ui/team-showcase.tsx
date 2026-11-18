import { useState } from "react";
import { Linkedin, Twitter, Instagram, Instagram as Behance } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    behance?: string;
  };
}

interface TeamShowcaseProps {
  members: TeamMember[];
}

export function TeamShowcase({ members }: TeamShowcaseProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const col1 = members.filter((_, i) => i % 3 === 0);
  const col2 = members.filter((_, i) => i % 3 === 1);
  const col3 = members.filter((_, i) => i % 3 === 2);

  return (
    <div className="mx-auto flex w-full select-none flex-col items-center gap-10 py-6 font-sans md:flex-row lg:gap-14">
      {/* Left: staggered photo grid */}
      <div className="flex flex-shrink-0 gap-3 overflow-x-auto pb-2 md:pb-0">
        <div className="flex flex-col gap-3">
          {col1.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="h-[130px] w-[112px] sm:h-[155px] sm:w-[136px] md:h-[235px] md:w-[210px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        <div className="mt-[44px] flex flex-col gap-3 sm:mt-[54px] md:mt-[64px]">
          {col2.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="h-[140px] w-[120px] sm:h-[168px] sm:w-[146px] md:h-[245px] md:w-[220px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        <div className="mt-[20px] flex flex-col gap-3 sm:mt-[24px] md:mt-[30px]">
          {col3.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="h-[135px] w-[116px] sm:h-[160px] sm:w-[140px] md:h-[235px] md:w-[210px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>
      </div>

      {/* Right: member name directory */}
      <div className="flex w-full flex-1 flex-col divide-y divide-black/10 border-y border-black/10">
        {members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            hoveredId={hoveredId}
            onHover={setHoveredId}
          />
        ))}
      </div>
    </div>
  );
}

function PhotoCard({
  member,
  className,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  className: string;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;

  return (
    <a
      href={`/team/${member.id}`}
      className={cn(
        "block flex-shrink-0 overflow-hidden rounded-[1.25rem] border border-black/6 bg-[#FAF8F2] transition-all duration-300",
        className,
        isDimmed ? "opacity-55" : "opacity-100",
        isActive && "ring-2 ring-[#1B3745]",
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <img
        src={member.image}
        alt={member.name}
        className="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-[1.03]"
      />
    </a>
  );
}

function MemberRow({
  member,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;
  const hasSocial =
    member.social?.twitter ??
    member.social?.linkedin ??
    member.social?.instagram ??
    member.social?.behance;

  return (
    <a
      href={`/team/${member.id}`}
      className={cn(
        "group flex items-center justify-between gap-4 py-4 transition-opacity duration-200",
        isDimmed ? "opacity-50" : "opacity-100",
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "h-2.5 w-2.5 flex-shrink-0 rounded-full transition-all duration-200",
            isActive ? "scale-125 bg-[#1B3745]" : "bg-[#754B3D]/35",
          )}
        />
        <div>
          <span
            className={cn(
              "block font-display text-lg font-normal tracking-[-0.02em] transition-colors",
              isActive ? "text-[#1B3745]" : "text-black",
            )}
          >
            {member.name}
          </span>
          <span className="block text-xs text-black/55">{member.role}</span>
        </div>
      </div>

      {hasSocial && (
        <div className="flex items-center gap-1.5">
          {member.social?.twitter && (
            <span className="p-1 text-black/45">
              <Twitter size={12} />
            </span>
          )}
          {member.social?.linkedin && (
            <span className="p-1 text-black/45">
              <Linkedin size={12} />
            </span>
          )}
          {member.social?.instagram && (
            <span className="p-1 text-black/45">
              <Instagram size={12} />
            </span>
          )}
          {member.social?.behance && (
            <span className="p-1 text-black/45">
              <Behance size={12} />
            </span>
          )}
        </div>
      )}
    </a>
  );
}
