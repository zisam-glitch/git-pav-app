import { createFileRoute } from "@tanstack/react-router";
import { RegistrationFlow } from "@/components/registration/registration-flow";
import { seoHead } from "@/lib/seo";

// The registration is the whole page: it opens straight into the form, with no site header or footer.
export const Route = createFileRoute("/services/regestration")({
  head: () => seoHead("/services/regestration"),
  component: RegistrationFlow,
});
