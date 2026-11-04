import { Overview } from "./_components/overview";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-3xl tracking-tight">Overview</h1>
        <p className="text-muted-foreground text-sm">The app's patients, appointments and vans at a glance.</p>
      </div>
      <Overview />
    </div>
  );
}
