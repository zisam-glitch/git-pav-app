import { PrescriptionsRegister } from "./_components/prescriptions-register";

export default function PrescriptionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-3xl tracking-tight">Prescriptions register</h1>
        <p className="text-muted-foreground text-sm">
          Every prescription issued in the app, newest first: who issued it, when, and whether it was signed and sent.
          It deliberately doesn't show what was prescribed or who it was for; that stays in the clinical record.
        </p>
      </div>

      <PrescriptionsRegister />
    </div>
  );
}
