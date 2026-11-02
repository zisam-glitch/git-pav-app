import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AccountLinkLayout, OpenAppLink } from "@/components/account/account-link-layout";
import { confirmEmail, takeTokenFromUrl } from "@/lib/app-account";

// Opened from the "verify your email" email when the app isn't installed (or
// the link opened in a browser). The one-time token is read, then removed from
// the address bar.
export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: "Verify your email | Pav Dental" },
      { name: "referrer", content: "no-referrer" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerifyEmailPage,
});

type State = { kind: "checking" } | { kind: "done" } | { kind: "failed"; message: string };

function VerifyEmailPage() {
  const [state, setState] = useState<State>({ kind: "checking" });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = takeTokenFromUrl();
    if (!token) {
      setState({ kind: "failed", message: "This link is incomplete. Open it again from the email." });
      return;
    }
    void confirmEmail(token).then((r) => setState(r.ok ? { kind: "done" } : { kind: "failed", message: r.message }));
  }, []);

  if (state.kind === "checking") {
    return (
      <AccountLinkLayout title="Verifying your email">
        <p role="status">One moment…</p>
      </AccountLinkLayout>
    );
  }
  if (state.kind === "done") {
    return (
      <AccountLinkLayout title="Your email is verified">
        <p role="status">Thanks. You can carry on in the Pav Dental app.</p>
        <OpenAppLink />
      </AccountLinkLayout>
    );
  }
  return (
    <AccountLinkLayout title="We couldn't verify your email">
      <p role="alert">{state.message}</p>
      <p>In the app, go to Profile, then Security, and choose to resend the verification email.</p>
      <OpenAppLink />
    </AccountLinkLayout>
  );
}
