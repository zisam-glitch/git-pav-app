import { createFileRoute, notFound } from "@tanstack/react-router";
import { teamProfileHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { TeamProfile } from "@/components/team/team-profile";
import { NotFoundPage } from "@/components/not-found/not-found-page";
import { findTeamMember } from "@/content/team-members";

// "team_" keeps this a sibling of /team rather than a child of it, so /team does
// not need to render an Outlet.
export const Route = createFileRoute("/team_/$slug")({
  loader: ({ params }) => {
    const member = findTeamMember(params.slug);
    if (!member) throw notFound();
    return member;
  },
  head: ({ params }) => teamProfileHead(params.slug),
  // Its own not-found page, so that this route's head (noindex) applies. When only the root has
  // one, the router skips the child's head.
  notFoundComponent: NotFoundPage,
  component: TeamProfileRoute,
});

function TeamProfileRoute() {
  const member = Route.useLoaderData();
  return (
    <main className="min-h-screen bg-[#FBF8F5] text-fg">
      <Header />
      <TeamProfile member={member} />
      <Footer />
    </main>
  );
}
