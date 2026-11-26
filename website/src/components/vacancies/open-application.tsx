import { CallButton } from "@/components/hims";
import { PRACTICE_EMAIL } from "@/lib/enquiry";

export function OpenApplication() {
  return (
    <section
      id="open-application"
      className="mx-auto w-full max-w-[1392px] scroll-mt-24 px-4 py-16 md:py-24"
    >
      <h2 className="text-[clamp(44px,7vw,112px)] leading-[0.92] font-medium tracking-[-0.045em]">
        Don&apos;t see your
        <span className="block text-black/35">perfect role?</span>
      </h2>
      <div className="mt-10 grid gap-8 border-t border-black pt-8 lg:grid-cols-2 lg:gap-16">
        <p className="text-[20px] leading-[1.45] text-black/75">
          We welcome applications from dental professionals looking to join our team at 786 Leeds
          Road, Bradford, BD3 9TY or via{" "}
          <a href={`mailto:${PRACTICE_EMAIL}`} className="text-black underline underline-offset-4">
            {PRACTICE_EMAIL}
          </a>
          .
        </p>
        <div className="flex flex-wrap items-start gap-3">
          <a
            href="/contact-us"
            className="inline-flex h-12 items-center rounded-full bg-black px-7 text-[16px] font-medium text-white t-colors hover:bg-black/80"
          >
            Send Open Application
          </a>
          <CallButton variant="outline" />
        </div>
      </div>
    </section>
  );
}
