import { Briefcase, Plane, Cpu, GraduationCap, Building, Users, Sparkles } from "lucide-react";

export function VacanciesHero() {
  return (
    <section className="relative overflow-hidden bg-[#2a1c12] h-[70vh] min-h-[500px]">
      {/* Background image with overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/media/hero-clinic.jpg"
          alt=""
          className="h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2a1c12] via-[#2a1c12]/95 to-[#2a1c12]/80" />
      </div>

      {/* Decorative ambient lights */}
      <div className="pointer-events-none absolute -left-40 -top-40 size-[500px] rounded-full bg-[#d4a574]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-20 size-[500px] rounded-full bg-[#cf9448]/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 h-full flex flex-col justify-center text-center">
        

        {/* Headline */}
        <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1]">
          Build Your Future at <span className="text-[#d4a574]">PavDental</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg leading-relaxed text-white/80 max-w-2xl mx-auto">
          Join a growing practice committed to clinical excellence, mentorship, and supporting dental professionals at every stage of their career.
        </p>

        {/* Key benefits grid */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className=" p-4">
            <Plane className="size-6 text-[#d4a574] mx-auto mb-2" />
            <h3 className="font-display text-sm font-bold text-white text-center">Visa Sponsorship</h3>
          </div>

          <div className=" p-4">
            <Cpu className="size-6 text-[#d4a574] mx-auto mb-2" />
            <h3 className="font-display text-sm font-bold text-white text-center">Advanced Tech</h3>
          </div>

          <div className=" p-4">
            <GraduationCap className="size-6 text-[#d4a574] mx-auto mb-2" />
            <h3 className="font-display text-sm font-bold text-white text-center">Mentorship</h3>
          </div>

          <div className=" p-4">
            <Users className="size-6 text-[#d4a574] mx-auto mb-2" />
            <h3 className="font-display text-sm font-bold text-white text-center">Supportive Team</h3>
          </div>
        </div>

        {/* Stats row */}
       
      </div>
    </section>
  );
}

