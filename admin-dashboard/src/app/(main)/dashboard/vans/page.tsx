import { VansEditor } from "./_components/vans-editor";

export default function VansPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Vans &amp; service areas</h1>
        <p className="text-muted-foreground text-sm">
          Where each van goes and who drives it. Patients can only request a van when their address is inside one of its
          areas and its operator is on shift.
        </p>
      </div>

      <VansEditor />
    </div>
  );
}
