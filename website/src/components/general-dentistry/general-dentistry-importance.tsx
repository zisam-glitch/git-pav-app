import { Heading, Section } from "@/components/hims";
import { IncludedList, type IncludedItem } from "@/components/hims/included-list";

const IMPORTANCE_POINTS = [
  {
    title: "Early Diagnosis",
    desc: "Regular dental visits help in early detection of oral health problems like cavities and gum disease.",
  },
  {
    title: "Prevention",
    desc: "General dentistry focuses on preventative care, which can save you from more extensive and expensive treatments down the line.",
  },
  {
    title: "Education",
    desc: "Dentists not only treat but also educate patients on the best practices for oral care.",
  },
  {
    title: "Family Care",
    desc: "General dentistry caters to the dental needs of the entire family, from children to seniors.",
  },
] as const;

const ITEMS: readonly IncludedItem[] = IMPORTANCE_POINTS.map((point, index) => ({
  text: (
    <>
      <strong className="font-semibold">{`${index + 1}. ${point.title}:`}</strong> {point.desc}
    </>
  ),
}));

export function GeneralDentistryImportance() {
  return (
    <>
      <IncludedList
        theme="cream"
        title="Why General Dentistry is"
        accent="Important?"
        items={ITEMS}
      />
      <Section theme="cream" space="none" className="pb-10 md:pb-20">
        <div className="rounded-xl bg-white p-6 md:p-[60px]">
          <div className="grid gap-4 md:grid-cols-2 md:gap-28">
            <Heading as="h3" size="h3-md">
              Cost and Insurance
            </Heading>
            <p className="text-lead text-muted">
              The cost of general dentistry services varies depending on the treatment and location.
              Many dental insurance plans cover the cost of preventative care treatments like
              regular check-ups and cleanings.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
