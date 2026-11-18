import { motion } from "motion/react";

export function PricingHero() {
  return (
    <div>
      {/* Hero Headline */}
      <section className="pt-16 pb-12 sm:pt-20 sm:pb-16 text-center">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#844d1e] leading-[1.15]"
          >
            You don't have to Pay for it all at once.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed"
          >
            We offer 0% interest dental finance options that allow you to spread
            the cost of treatment with affordable monthly payments.
          </motion.p>
          </div>
        </div>
      </section>
    </div>
  );
}

