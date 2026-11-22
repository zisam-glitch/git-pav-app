import { Heading, Section } from "@/components/hims";
import { KeyLineList } from "@/components/hims/key-line-list";

export function DenturesShowcase() {
  return (
    <Section theme="brown" space="lg">
      <div className="grid items-center gap-8 md:grid-cols-[1fr_1.4fr] md:gap-16">
        <Heading as="h2" size="h2-md" tone="gold">
          Dentures
        </Heading>
        <KeyLineList
          size="lg"
          items={[
            { title: "Intermediate - acrylic with clasps" },
            { title: "Premium - Flexible denture" },
          ]}
          className="[&_p]:text-white"
        />
      </div>
    </Section>
  );
}
