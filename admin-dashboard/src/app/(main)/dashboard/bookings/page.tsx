"use client";

import { useState } from "react";

import { format } from "date-fns";

import { BookingsStats } from "./_components/bookings-stats";
import { BookingsTable } from "./_components/bookings-table";

export default function BookingsPage() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Website requests</h1>
        <p className="text-muted-foreground text-sm">
          Requests sent from the website form, with the day and time the person would like. A website request doesn't
          hold a slot or take a deposit, and it is separate from App Appointments, where visits booked in the app are
          managed. Today is {format(new Date(), "PPP")}.
        </p>
      </div>

      <BookingsStats stats={stats} />

      <BookingsTable onCountChange={setStats} />
    </div>
  );
}
