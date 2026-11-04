import { type FormEvent, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AccountLinkLayout, OpenAppLink } from "@/components/account/account-link-layout";
import { passwordProblems, resetPassword, takeTokenFromUrl } from "@/lib/app-account";

// Opened from password-reset emails and from staff invitations ("set up your
// account"), when the app isn't installed or the link opened in a browser.
export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set your password | Pav Dental" },
      { name: "referrer", content: "no-referrer" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setToken(takeTokenFromUrl());
  }, []);

  const problems = passwordProblems(password);
  const mismatch = confirm.length > 0 && confirm !== password;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!token || problems.length > 0 || password !== confirm) return;
    setBusy(true);
    setError(null);
    const r = await resetPassword(token, password);
    setBusy(false);
    if (r.ok) {
      setDone(true);
      setPassword("");
      setConfirm("");
    } else {
      setError(r.message);
    }
  }

  if (token === undefined) {
    return (
      <AccountLinkLayout title="Set your password">
        <p role="status">One moment…</p>
      </AccountLinkLayout>
    );
  }
  if (done) {
    return (
      <AccountLinkLayout title="Your password is set">
        <p role="status">
          You can now sign in with your email and new password, in the Pav Dental app or, for staff, the staff dashboard.
        </p>
        <OpenAppLink />
      </AccountLinkLayout>
    );
  }
  if (!token) {
    return (
      <AccountLinkLayout title="This link is incomplete">
        <p role="alert">Open the link again from the email. If it still doesn't work, ask for a new one with "Forgot password" in the app.</p>
      </AccountLinkLayout>
    );
  }

  const field = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none";
  return (
    <AccountLinkLayout title="Set your password">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="new-password" className="font-medium text-slate-900">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            className={field}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby="password-rules"
          />
          <ul id="password-rules" className="mt-2 space-y-1 text-xs">
            {["At least 8 characters", "An uppercase letter", "A lowercase letter", "A number"].map((rule) => {
              const met = password.length > 0 && !problems.includes(rule);
              return (
                <li key={rule} className={met ? "text-emerald-700" : "text-slate-500"}>
                  {met ? "✓" : "•"} {rule}
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <label htmlFor="confirm-password" className="font-medium text-slate-900">
            Type it again
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            className={field}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={mismatch}
          />
          {mismatch ? <p className="mt-1 text-xs text-red-700">The passwords don't match.</p> : null}
        </div>
        {error ? (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy || problems.length > 0 || password !== confirm}
          className="w-full rounded-full bg-slate-900 px-5 py-3 font-semibold text-sm text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Saving…" : "Set password"}
        </button>
      </form>
    </AccountLinkLayout>
  );
}
