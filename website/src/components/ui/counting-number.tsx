import { useEffect, useState } from "react";

export function CountingNumber({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    let rafId = 0;
    const duration = 1200;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      if (!active) return;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(target * easeOutQuart));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };
    rafId = requestAnimationFrame(animate);
    return () => {
      active = false;
      cancelAnimationFrame(rafId);
    };
  }, [target]);

  return <span>{count}</span>;
}
