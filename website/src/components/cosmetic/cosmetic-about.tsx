import { Heading, Section } from "@/components/hims";
import { StackedFlow } from "@/components/hims/stacked-flow";

export function CosmeticAbout() {
  return (
    <Section theme="white">
      <StackedFlow
        lead={
          <Heading as="h2" size="h2-md" accent="Cosmetic Dentistry?" tone="terracotta" inline>
            What is
          </Heading>
        }
      >
        <p className="text-lead text-muted">
          Cosmetic Dentistry refers to dental work that improves the appearance of teeth, gums,
          and/or bite. It primarily focuses on improvement in dental aesthetics such as color,
          position, shape, size, and overall smile appearance.
        </p>
      </StackedFlow>
    </Section>
  );
}
