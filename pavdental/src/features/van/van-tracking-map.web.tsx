import React from "react";
import type { TrackingView } from "./tracking";

type Props = { view: TrackingView; fallback: React.ReactNode };

/** The web build has no native map: it shows the status panel instead. */
export function VanTrackingMap({ fallback }: Props) {
  return <>{fallback}</>;
}
