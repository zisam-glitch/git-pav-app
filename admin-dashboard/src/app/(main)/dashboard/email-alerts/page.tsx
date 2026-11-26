import { EmailAlertsForm } from "./_components/email-alerts-form";

export default function EmailAlertsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-3xl tracking-tight">Email alerts</h1>
        <p className="text-muted-foreground text-sm">
          Choose who gets an email when someone sends the website's contact, booking, job or registration form. The
          email says who sent it and links back here; what they wrote stays in the dashboard.
        </p>
      </div>

      <EmailAlertsForm />
    </div>
  );
}
