import React from "react";
import {
  Building2,
  Home,
  MapPin,
  Compass,
  Calendar,
  Scan,
  Package,
  Truck,
  Mail,
  Send,
  Clock,
  Flag,
  Gem,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step {
  icon: LucideIcon;
  title: string;
  desc: string;
  position: "left" | "right";
}

const CLINIC_STEPS: Step[] = [
  { icon: Calendar, title: "Book an appointment", desc: "Schedule your visit at Pav Dental clinic", position: "left" },
  { icon: Scan, title: "Digital scan", desc: "We take a precise digital scan of your teeth", position: "right" },
  { icon: Package, title: "Manufacturing", desc: "Your custom mouthguard is created", position: "left" },
  { icon: Truck, title: "Delivery", desc: "Delivered straight to your address", position: "right" },
];

const HOME_STEPS: Step[] = [
  { icon: Mail, title: "Mould kit sent", desc: "We send you a mould kit to your door", position: "left" },
  { icon: Home, title: "Take impression", desc: "You take the impression at home", position: "right" },
  { icon: Send, title: "Return kit", desc: "Use the prepaid label to return it", position: "left" },
  { icon: Clock, title: "Receive guard", desc: "We create it and send it back to you", position: "right" },
];

// Builds a wandering, hand-drawn-feeling trail through each step's waypoint.
function buildTrail(steps: Step[]) {
  const rowHeight = 100;
  const height = steps.length * rowHeight + 70;
  const points = [{ x: 50, y: 0 }];
  steps.forEach((s, i) => points.push({ x: s.position === "left" ? 18 : 82, y: i * rowHeight + 70 }));
  points.push({ x: 50, y: height - 15 });

  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cy = (p0.y + p1.y) / 2;
    d += ` C ${p0.x},${cy} ${p1.x},${cy} ${p1.x},${p1.y}`;
  }
  return { d, height };
}

interface TrailProps {
  steps: Step[];
  accent: string;
  accentSoft: string;
  label: string;
}

function Trail({ steps, accent, accentSoft }: TrailProps) {
  const { d, height } = buildTrail(steps);

  return (
    <div className="relative">
      {/* Start flag */}


      {/* Winding dotted trail + waypoints */}
      <div className="relative">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
        >
          <path
            d={d}
            fill="none"
            stroke={accent}
            strokeWidth="1.4"
            strokeDasharray="0.5 6"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>

        <div className="relative z-10 space-y-10 py-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isRight = step.position === "right";
            return (
              <div
                key={step.title}
                className={`flex items-center gap-4 ${isRight ? "flex-row-reverse" : ""}`}
              >
                {/* Waypoint medallion */}
                <div className="relative flex-shrink-0">

                  {/* small pennant with the stop number */}
                  {/* <div
                    className="absolute -top-1.5 -right-1.5 size-5 flex items-center justify-center text-[10px] font-bold text-white rounded-sm rotate-6 shadow-sm"
                    style={{ backgroundColor: accent }}
                  >
                    {index + 1}
                  </div> */}
                </div>

                {/* Parchment tag */}
                <div
                  className={`flex-1 min-w-0 px-4 py-3 bg-[#fffaf0]  border-dashed rounded-sm shadow-sm ${
                    isRight ? "text-right -rotate-1" : "rotate-1"
                  }`}
                  style={{ borderColor: accentSoft }}
                >
                  <h4 className="font-semibold text-[#2a1c12] leading-snug">{step.title}</h4>
                  <p className="mt-0.5 text-sm text-[#6b5848] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* X marks the spot */}

    </div>
  );
}

export function MouthguardsOrdering() {
  return (
    <section
      id="ordering"
      className="relative overflow-hidden  bg-[#faf6f0] py-20 sm:py-28"
    >

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <h2 className="font-display text-3xl font-bold text-[#2a1c12] sm:text-5xl">
              How to Order Your Mouthguard
            </h2>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#6b5848] sm:text-base">
            Every mouthguard is custom-made just for you. Follow the clinic trail or the home
            route — both lead to the same perfect fit.
          </p>
        </div>

        <div className="relative grid gap-16 md:grid-cols-2 md:gap-12">
          {/* Center divider with compass */}
          <div className="absolute left-1/2 top-8 hidden h-[calc(100%-2rem)] w-px -translate-x-1/2 border-l-2 border-dashed  md:block" />


          {/* Clinic trail */}
          <div>
            <div className="mb-8 flex items-center gap-3 justify-center">
              <div className="text-center">
                <h3 className="font-display text-2xl font-bold text-[#2a1c12]">Visit Our Clinic</h3>
                <p className="text-sm font-medium text-[#925a27]">Accurate digital scan with quick delivery</p>
              </div>
            </div>

            <Trail steps={CLINIC_STEPS} accent="#925a27" accentSoft="#cf9448" label="picked up or delivered" />


          </div>

          {/* Home trail */}
          <div>
            <div className="mb-8 flex items-center gap-3 justify-center">
              <div className="text-center">
                <h3 className="font-display text-2xl font-bold text-[#2a1c12]">Order From Home</h3>
                <p className="text-sm font-medium text-[#4a7c59]">Easy mould kit sent to your door</p>
              </div>
            </div>

            <Trail steps={HOME_STEPS} accent="#4a7c59" accentSoft="#6b9b7a" label="mailed straight to you" />


          </div>
        </div>

      </div>
    </section>
  );
}