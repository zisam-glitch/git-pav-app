"use client";

import { useCallback, useEffect, useState } from "react";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  APPOINTMENT_CHANNELS,
  APPOINTMENT_STATUSES,
  APPOINTMENTS_PAGE_SIZE,
  type AppAppointment,
  type AppointmentFilters,
  type AppointmentStatus,
  appointmentsPath,
  CHANNEL_LABELS,
  pageCount,
  STATUS_LABELS,
  statusChangeQuestion,
} from "@/lib/pav-appointments";
import { appRequest, todayInUk, ukDateTime } from "@/lib/pav-schedule";
import { formatPounds } from "@/lib/pav-team";

import { VideoActivityDialog } from "./video-activity-dialog";

type Page = { appointments: AppAppointment[]; total: number };

const STATUS_VARIANT: Partial<Record<AppointmentStatus, "default" | "secondary" | "destructive" | "outline">> = {
  confirmed: "default",
  in_progress: "secondary",
  cancelled: "destructive",
  no_show: "destructive",
};

export function AppointmentsList() {
  const [filters, setFilters] = useState<AppointmentFilters>({ status: "", channel: "", from: todayInUk(), to: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page>({ appointments: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await appRequest<Page>(appointmentsPath(filters, page)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const setFilter = <K extends keyof AppointmentFilters>(key: K, value: AppointmentFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const changeStatus = async (appointment: AppAppointment, to: AppointmentStatus) => {
    if (!confirm(statusChangeQuestion(appointment, to))) return;
    setBusyId(appointment.id);
    try {
      await appRequest(`appointments/${appointment.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: to }),
      });
      toast.success(`Marked as ${STATUS_LABELS[to].toLowerCase()}`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to change the status");
    } finally {
      setBusyId(null);
    }
  };

  const pages = pageCount(data.total, APPOINTMENTS_PAGE_SIZE);

  let content: React.ReactNode;
  if (loading) {
    content = (
      <div className="flex h-40 items-center justify-center text-muted-foreground">Loading appointments...</div>
    );
  } else if (data.appointments.length === 0) {
    content = <p className="text-muted-foreground text-sm">No appointments match these filters.</p>;
  } else {
    content = (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Visit</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Change status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell className="whitespace-nowrap">{ukDateTime(appointment.startTimeUtc)}</TableCell>
                <TableCell>
                  <div className="font-medium">{appointment.dependantName ?? appointment.patientName}</div>
                  {appointment.dependantName ? (
                    <div className="text-muted-foreground text-xs">Booked by {appointment.patientName}</div>
                  ) : null}
                </TableCell>
                <TableCell>
                  <div>{appointment.serviceName}</div>
                  <div className="text-muted-foreground text-xs">
                    {[CHANNEL_LABELS[appointment.channel], appointment.placeName, appointment.clinicianName]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                  {appointment.channel === "video" ? (
                    <VideoActivityDialog
                      appointmentId={appointment.id}
                      patientName={appointment.dependantName ?? appointment.patientName}
                    />
                  ) : null}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div>{formatPounds(appointment.depositPaidPence)} deposit</div>
                  <div className="text-muted-foreground text-xs">of {formatPounds(appointment.totalPricePence)}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[appointment.status] ?? "outline"}>
                    {STATUS_LABELS[appointment.status] ?? appointment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {appointment.allowedStatuses.length === 0 ? (
                    <span className="text-muted-foreground text-xs">Final</span>
                  ) : (
                    <NativeSelect
                      aria-label={`Change status for ${appointment.patientName}`}
                      value=""
                      disabled={busyId === appointment.id}
                      onChange={(e) => {
                        const to = e.target.value as AppointmentStatus;
                        if (to) void changeStatus(appointment, to);
                      }}
                    >
                      <NativeSelectOption value="">Choose...</NativeSelectOption>
                      {appointment.allowedStatuses.map((status) => (
                        <NativeSelectOption key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="appt-from">From</Label>
          <Input id="appt-from" type="date" value={filters.from} onChange={(e) => setFilter("from", e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="appt-to">To</Label>
          <Input id="appt-to" type="date" value={filters.to} onChange={(e) => setFilter("to", e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="appt-status">Status</Label>
          <NativeSelect
            id="appt-status"
            value={filters.status}
            onChange={(e) => setFilter("status", e.target.value as AppointmentFilters["status"])}
          >
            <NativeSelectOption value="">Any status</NativeSelectOption>
            {APPOINTMENT_STATUSES.map((status) => (
              <NativeSelectOption key={status} value={status}>
                {STATUS_LABELS[status]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="appt-channel">Type</Label>
          <NativeSelect
            id="appt-channel"
            value={filters.channel}
            onChange={(e) => setFilter("channel", e.target.value as AppointmentFilters["channel"])}
          >
            <NativeSelectOption value="">Any type</NativeSelectOption>
            {APPOINTMENT_CHANNELS.map((channel) => (
              <NativeSelectOption key={channel} value={channel}>
                {CHANNEL_LABELS[channel]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>

      {content}

      <div className="flex items-center justify-between text-muted-foreground text-sm">
        <span>
          {data.total} appointment{data.total === 1 ? "" : "s"} · page {page} of {pages}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={page >= pages || loading} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
