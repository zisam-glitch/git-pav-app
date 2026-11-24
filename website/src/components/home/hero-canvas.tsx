import { lazy, Suspense, useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/utils";

const HeroScene = lazy(() => import("./hero-scene").then((m) => ({ default: m.HeroScene })));

function FallbackOrb() {
  return (
    <div className="grid h-full w-full place-items-center" aria-hidden>
      <div
        className="size-48 rounded-full"
        style={{
          background: "radial-gradient(circle at 32% 28%, #fff8ee, #cf9448 42%, #925a27 78%)",
          boxShadow: "0 30px 80px rgb(146 90 39 / 0.28)",
          animation: "kenburns 10s ease-in-out infinite alternate",
        }}
      />
    </div>
  );
}

export function HeroCanvas() {
  const [ready, setReady] = useState(false);
  const [reduce, setReduce] = useState(true);

  useEffect(() => {
    setReduce(prefersReducedMotion());
    setReady(true);
  }, []);

  if (!ready || reduce) return <FallbackOrb />;

  return (
    <Suspense fallback={<FallbackOrb />}>
      <HeroScene />
    </Suspense>
  );
}
