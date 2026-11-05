"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type Attention, attentionItems, hasUrgent, type Tone } from "@/lib/pav-attention";
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

const TONE_CLASS: Record<Tone, string> = {
  urgent: "border-destructive/60 bg-destructive/5",
  action: "border-amber-500/60 bg-amber-500/5",
  info: "",
  clear: "opacity-70",
};

const errorMessage = (reason: unknown, fallback: string) => (reason instanceof Error ? reason.message : fallback);

export function Overview() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [attention, setAttention] = useState<Attention | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Either request can fail on its own; the other half of the page still shows.
    void Promise.allSettled([appRequest<Attention>("attention"), appRequest<OverviewResponse>("overview")]).then(
      ([attentionResult, overviewResult]) => {
        const problems: string[] = [];
        if (attentionResult.status === "fulfilled") setAttention(attentionResult.value);
        else problems.push(errorMessage(attentionResult.reason, "Could not load what needs attention"));
        if (overviewResult.status === "fulfilled") setData(overviewResult.value);
        else problems.push(errorMessage(overviewResult.reason, "Could not load the totals"));
        setErrors(problems);
        setLoaded(true);
      },
    );
  }, []);

  if (!loaded) return <p className="text-muted-foreground text-sm">Loading…</p>;

  const items = attention ? attentionItems(attention) : [];
  const tiles = data
    ? [
        { label: "Confirmed appointments", value: data.kpis.confirmedAppointments },
        { label: "Completed appointments", value: data.kpis.completedAppointments },
        { label: "All appointments", value: data.kpis.totalAppointments },
        { label: "Patients", value: data.kpis.totalPatients },
        { label: "Clinicians", value: data.kpis.totalClinicians },
        { label: "Active vans", value: data.kpis.activeVans },
        { label: "Deposits, confirmed and completed", value: `£${data.kpis.depositRevenueGbp}` },
        { label: "Treatment value, confirmed and completed", value: `£${data.kpis.totalRevenueGbp}` },
      ]
    : [];

  return (
    <div className="flex flex-col gap-8">
      {errors.map((message) => (
        <p key={message} className="text-destructive text-sm">
          {message}
        </p>
      ))}

      {attention ? (
        <section className="flex flex-col gap-3" aria-labelledby="attention-heading">
          <div className="flex items-center gap-2">
            <h2 id="attention-heading" className="font-semibold text-lg">
              Needs attention
            </h2>
            {hasUrgent(items) ? <Badge variant="destructive">Something is urgent</Badge> : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <Link key={item.key} href={item.href} className="rounded-xl focus-visible:outline-2">
                <Card className={`h-full transition-colors hover:bg-muted/40 ${TONE_CLASS[item.tone]}`}>
                  <CardHeader>
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className="text-3xl tabular-nums">{item.count}</CardTitle>
                    <CardDescription>{item.note}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">Updated {ukDateTime(attention.asOf)}</p>
        </section>
      ) : null}

      {data ? (
        <section className="flex flex-col gap-3" aria-labelledby="totals-heading">
          <h2 id="totals-heading" className="font-semibold text-lg">
            Totals
          </h2>
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
        </section>
      ) : null}
    </div>
  );
}
