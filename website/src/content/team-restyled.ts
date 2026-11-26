import { TEAM_MEMBERS } from "./team-members";

/**
 * The restyled portraits (one pose, one outfit, warm sand backdrop) used on the About and Team
 * pages. They sit in public/images/about/, in team order. The live site's own photos stay in
 * public/images/team/ and in team-members.ts, because those files are checked against the live
 * copy.
 */
export function restyledPhoto(slug: string): string {
  const index = TEAM_MEMBERS.findIndex((member) => member.slug === slug);
  return `/images/about/team-${(index === -1 ? 0 : index) + 1}.webp`;
}
