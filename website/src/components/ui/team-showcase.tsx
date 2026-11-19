import { Link } from "@tanstack/react-router";
import { Carousel } from "@/components/hims";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  gdc?: string;
}

interface TeamShowcaseProps {
  members: TeamMember[];
}

export function TeamShowcase({ members }: TeamShowcaseProps) {
  return (
    <Carousel label="Pav Dental team">
      {members.map((member) => (
        <Link
          key={member.id}
          to="/team/$slug"
          params={{ slug: member.id }}
          className="group flex h-full flex-col rounded-lg bg-tile-cream p-4 t-lift"
        >
          <div className="aspect-[4/3] overflow-hidden rounded-md bg-sand">
            <img
              src={member.image}
              alt={member.name}
              loading="lazy"
              className="size-full object-cover object-top t-zoom"
            />
          </div>
          <div className="mt-4 flex flex-1 flex-col justify-between">
            <div>
              <h3 className="text-body font-medium text-fg">{member.name}</h3>
              <p className="mt-1 text-small text-muted">{member.role}</p>
            </div>
            {member.gdc ? (
              <p className="mt-3 text-caption font-medium text-terracotta">GDC {member.gdc}</p>
            ) : null}
          </div>
        </Link>
      ))}
    </Carousel>
  );
}
