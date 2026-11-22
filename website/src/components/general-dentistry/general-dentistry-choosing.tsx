import { IncludedList, type IncludedItem } from "@/components/hims/included-list";

const CHOOSING_FACTORS = [
  {
    title: "Qualifications",
    desc: "Make sure the dentist is board-certified and has good reviews.",
  },
  { title: "Location", desc: "A conveniently located clinic will make regular visits easier." },
  {
    title: "Services Offered",
    desc: "Ensure that the dental office offers the range of services you and your family may need.",
  },
  { title: "Insurance", desc: "Check if the dental practice accepts your insurance." },
] as const;

const ITEMS: readonly IncludedItem[] = CHOOSING_FACTORS.map((factor) => ({
  text: (
    <>
      <strong className="font-semibold">{`${factor.title}:`}</strong> {factor.desc}
    </>
  ),
}));

export function GeneralDentistryChoosing() {
  return (
    <IncludedList theme="white" title="How to Choose a" accent="General Dentist" items={ITEMS} />
  );
}
