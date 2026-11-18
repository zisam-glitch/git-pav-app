import React from "react";

const DETAILED_STEPS = [
  {
    title: "Booking Your Virtual Dental Consultation",
    desc: "Initiate your dental care journey by scheduling a video consultation via the Pav Dental app or website. Select a convenient date and time for your appointment, and await confirmation from one of our dentists. This step ensures a seamless integration of dental care into your schedule.",
  },
  {
    title: "Establishing the Connection",
    desc: "Upon appointment confirmation, you'll receive a link to access your video consultation. At the designated time, simply use your computer, smartphone, or tablet to click the link and start the video call. This direct line to your dentist facilitates a personal and effective consultation environment.",
  },
  {
    title: "Engaging in the Consultation",
    desc: "The consultation is your opportunity to voice dental concerns and undergo a virtual examination of your teeth and gums. The dentist will collaborate with you to formulate a comprehensive treatment plan. This interactive session allows for real-time questions and personalized advice.",
  },
  {
    title: "Post-Consultation Outcomes",
    desc: "Following your consultation, outcomes include: Professional Advice, Online Prescription sent to your pharmacy, Home Visit Coordination for in-person care, and Clinic Treatment Planning for in-clinic appointments.",
  },
];

export function VirtualDentistryHowItWorks() {
  return (
    <section className="py-20 sm:py-28 bg-[#fffdf9]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
            How it works?
          </h2>
          <p className="mt-4 text-[#6b5848] text-sm sm:text-base leading-relaxed">
            Our virtual dental consultation process is designed to be simple, convenient, and effective. Here's how it works step by step.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8 pt-8  ">
          {DETAILED_STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-col">
              <span className="font-mono text-xs font-bold text-[#925a27] mb-4">
                Step {i + 1}
              </span>
              <h3 className="font-display text-xl font-bold text-[#2a1c12] mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-[#6b5848] leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}