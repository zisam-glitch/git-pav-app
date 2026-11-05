"use client";

import { Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface StatsProps {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
}

export function BookingsStats({ stats }: { stats: StatsProps }) {
  const cards = [
    {
      title: "Total requests",
      value: stats.total,
      icon: Calendar,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Pending Confirmation",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Confirmed",
      value: stats.confirmed,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.title} className="p-4 shadow-xs">
            <CardContent className="p-0 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{c.title}</p>
                <p className="text-2xl font-bold tracking-tight mt-1">{c.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${c.bg}`}>
                <Icon className={`size-5 ${c.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
