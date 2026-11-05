import { VanShifts } from "./_components/van-shifts";

export default function VanShiftsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-3xl tracking-tight">Van shifts</h1>
        <p className="text-muted-foreground text-sm">
          Which vans are out now and recent shifts, newest first. A van that is on shift but hasn't reported in for ten
          minutes is flagged. If a shift was left running, End shift frees the van and operator to start again. Where a
          van is, and who its requests are from, aren't shown here.
        </p>
      </div>

      <VanShifts />
    </div>
  );
}
