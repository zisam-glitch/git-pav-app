"use client";

import { useEffect, useState } from "react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { appRequest, ukDateTime } from "@/lib/pav-schedule";

interface OverviewResponse {
  kpis: {
    totalPatients: number;
    totalClinicians: number;
    totalAppointments: number;
    confirmedAppointments: number;
    completedAppointments: number;
    activeVans: number;
    depositRevenueGbp: string;
    totalRevenueGbp: string;
  };
  updatedAt: string;
}

export function Overview() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    appRequest<OverviewResponse>("overview")
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load the overview"));
  }, []);

  if (error) return <p className="text-destructive text-sm">{error}</p>;
  if (!data) return <p className="text-muted-foreground text-sm">Loading…</p>;

  const { kpis } = data;
  const tiles = [
    { label: "Confirmed appointments", value: kpis.confirmedAppointments },
    { label: "Completed appointments", value: kpis.completedAppointments },
    { label: "All appointments", value: kpis.totalAppointments },
    { label: "Patients", value: kpis.totalPatients },
    { label: "Clinicians", value: kpis.totalClinicians },
    { label: "Active vans", value: kpis.activeVans },
    { label: "Deposits, confirmed and completed", value: `£${kpis.depositRevenueGbp}` },
    { label: "Treatment value, confirmed and completed", value: `£${kpis.totalRevenueGbp}` },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardHeader>
              <CardDescription>{tile.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{tile.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <p className="text-muted-foreground text-xs">Updated {ukDateTime(data.updatedAt)}</p>
    </div>
  );
}
