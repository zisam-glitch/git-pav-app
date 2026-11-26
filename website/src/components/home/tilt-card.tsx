import { useRef } from "react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 21st.dev 3D tilt card — perspective follow on pointer. */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * 12;
    const ry = (px - 0.5) * 16;
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div className="perspective-scene">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={cn(
          "preserve-3d relative rounded-xl glass p-6 transition-transform duration-150 ease-out will-change-transform",
          className,
        )}
        style={
          {
            transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
          } as CSSProperties
        }
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background:
              "radial-gradient(420px circle at var(--gx, 50%) var(--gy, 0%), color-mix(in oklab, var(--color-primary) 16%, transparent), transparent 55%)",
          }}
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
