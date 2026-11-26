import { BookButton, Section, SectionHead, WhyCards } from "@/components/hims";

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

export function GeneralDentistryImportance() {
  return (
    <Section theme="white" aria-labelledby="gd-importance-heading">
      <SectionHead
        id="gd-importance-heading"
        title="Why General Dentistry is Important?"
        action={<BookButton>Book Appointment</BookButton>}
      />
      <div className="mt-10">
        <WhyCards
          items={IMPORTANCE_POINTS.map((p, i) => ({
            lead: `${i + 1}.`,
            rest: `${p.title}:`,
            text: p.desc,
          }))}
        />
      </div>
      <div className="mt-3 rounded-[24px] bg-[#f7f7f7] p-7 md:p-9">
        <h3 className="text-[24px] font-normal text-[#2a2a2c]">Cost and Insurance</h3>
        <p className="mt-3 max-w-3xl text-[16px] leading-[1.5] text-[#6b6b70]">
          The cost of general dentistry services varies depending on the treatment and location.
          Many dental insurance plans cover the cost of preventative care treatments like regular
          check-ups and cleanings.
        </p>
      </div>
    </Section>
  );
}
