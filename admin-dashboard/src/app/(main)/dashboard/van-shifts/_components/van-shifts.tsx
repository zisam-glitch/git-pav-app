"use client";

import { useCallback, useEffect, useState } from "react";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { pageCount } from "@/lib/pav-appointments";
import { appRequest, ukDateTime } from "@/lib/pav-schedule";
import type { AdminVan } from "@/lib/pav-vans";
import {
  endShiftBody,
  endShiftQuestion,
  freshness,
  freshnessLabel,
  SHIFT_STATUS_LABEL,
  SHIFTS_PAGE_SIZE,
  type ShiftFilters,
  type ShiftState,
  shiftLength,
  shiftsPath,
  stopStaffActions,
  type VanShiftDetail,
  type VanShiftRow,
  type VanShiftStop,
} from "@/lib/pav-van-shifts";

type Page = { shifts: VanShiftRow[]; total: number };

// Live shifts change by the minute, so the list refreshes itself.
const REFRESH_MS = 60_000;

export function VanShifts() {
  const [filters, setFilters] = useState<ShiftFilters>({ state: "", vanId: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page>({ shifts: [], total: 0 });
  const [vans, setVans] = useState<Pick<AdminVan, "id" | "name">[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [endingId, setEndingId] = useState<string | null>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [detail, setDetail] = useState<VanShiftDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStopId, setUpdatingStopId] = useState<string | null>(null);

  useEffect(() => {
    appRequest<Pick<AdminVan, "id" | "name">[]>("vans")
      .then(setVans)
      .catch(() => {
        // The list still works without the van filter.
      });
  }, []);

  const load = useCallback(
    async (quiet = false) => {
      if (!quiet) setLoading(true);
      try {
        setData(await appRequest<Page>(shiftsPath(filters, page)));
        setNow(new Date());
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load van shifts");
      } finally {
        setLoading(false);
      }
    },
    [filters, page],
  );

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(true), REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  const loadDetail = useCallback(async (shiftId: string) => {
    setSelectedShiftId(shiftId);
    setLoadingDetail(true);
    try {
      setDetail(await appRequest<VanShiftDetail>(`van-shifts/${shiftId}`));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load shift stops");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const updateStopPhase = async (stop: VanShiftStop, phase: "completed" | "no_show") => {
    const label = phase === "completed" ? "completed" : "no-show";
    if (!confirm(`Mark ${stop.patientName}'s visit (${stop.serviceName}) as ${label}?`)) return;
    setUpdatingStopId(stop.id);
    try {
      await appRequest(`van-requests/${stop.id}/phase`, {
        method: "POST",
        body: JSON.stringify({ phase }),
      });
      toast.success(`Stop marked as ${label}.`);
      if (selectedShiftId) await loadDetail(selectedShiftId);
      await load(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Could not mark stop as ${label}`);
    } finally {
      setUpdatingStopId(null);
    }
  };

  const cancelStop = async (stop: VanShiftStop) => {
    if (!confirm(`Cancel ${stop.patientName}'s visit (${stop.serviceName}) with a full refund?`)) return;
    setUpdatingStopId(stop.id);
    try {
      await appRequest(`van-requests/${stop.id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: "crew_unavailable" }),
      });
      toast.success("Stop cancelled and refunded.");
      if (selectedShiftId) await loadDetail(selectedShiftId);
      await load(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not cancel stop");
    } finally {
      setUpdatingStopId(null);
    }
  };

  const endShift = async (shift: VanShiftRow, cancelRemaining = false) => {
    if (!confirm(endShiftQuestion(shift, cancelRemaining))) return;
    setEndingId(shift.id);
    try {
      const body = endShiftBody(cancelRemaining);
      const result = await appRequest<{ expiredRequests: number; depositReleasesFailed: number }>(
        `van-shifts/${shift.id}/end`,
        {
          method: "POST",
          ...(body ? { body: JSON.stringify(body) } : {}),
        },
      );
      let successMessage = "Shift ended.";
      if (result.depositReleasesFailed > 0) {
        successMessage = `Shift ended. ${result.depositReleasesFailed} deposit hold(s) couldn't be released yet and will be retried.`;
      } else if (cancelRemaining) {
        successMessage = "Shift ended and open stops cancelled with full refunds.";
      }
      toast.success(successMessage);
      await load(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't end the shift");
    } finally {
      setEndingId(null);
    }
  };

  const pages = pageCount(data.total, SHIFTS_PAGE_SIZE);

  let content: React.ReactNode;
  if (loading) {
    content = <div className="flex h-40 items-center justify-center text-muted-foreground">Loading van shifts...</div>;
  } else if (data.shifts.length === 0) {
    content = <p className="text-muted-foreground text-sm">No shifts match.</p>;
  } else {
    content = (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Van</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Length</TableHead>
              <TableHead>Last reported in</TableHead>
              <TableHead className="text-right">Open requests</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.shifts.map((shift) => {
              const seen = freshness(shift, now);
              return (
                <TableRow key={shift.id}>
                  <TableCell>
                    <div>{shift.vanName}</div>
                    <div className="font-mono text-muted-foreground text-xs">{shift.registrationPlate}</div>
                  </TableCell>
                  <TableCell>{shift.operatorName}</TableCell>
                  <TableCell>
                    {shift.live ? (
                      <Badge variant={shift.status === "online" ? "default" : "secondary"}>
                        {SHIFT_STATUS_LABEL[shift.status]}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Ended</Badge>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{ukDateTime(shift.startedAt)}</TableCell>
                  <TableCell className="whitespace-nowrap">{shiftLength(shift, now)}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {seen.kind === "stale" || seen.kind === "never" ? (
                      <Badge variant="destructive">{freshnessLabel(seen)}</Badge>
                    ) : (
                      freshnessLabel(seen)
                    )}
                  </TableCell>
                  <TableCell className="text-right">{shift.live ? shift.openRequests : "None"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant={selectedShiftId === shift.id ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => void loadDetail(shift.id)}
                      >
                        Stops
                      </Button>
                      {shift.live ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={endingId === shift.id}
                            onClick={() => void endShift(shift, false)}
                          >
                            {endingId === shift.id ? "Ending..." : "End shift"}
                          </Button>
                          {shift.openRequests > 0 ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={endingId === shift.id}
                              onClick={() => void endShift(shift, true)}
                            >
                              End &amp; cancel open
                            </Button>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
        <div className="flex flex-col gap-2">
          <Label htmlFor="shift-state">Show</Label>
          <NativeSelect
            id="shift-state"
            value={filters.state}
            onChange={(e) => {
              setFilters({ ...filters, state: e.target.value as ShiftState });
              setPage(1);
            }}
          >
            <NativeSelectOption value="">Live first, then recent</NativeSelectOption>
            <NativeSelectOption value="live">Live shifts only</NativeSelectOption>
            <NativeSelectOption value="ended">Ended shifts only</NativeSelectOption>
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="shift-van">Van</Label>
          <NativeSelect
            id="shift-van"
            value={filters.vanId}
            onChange={(e) => {
              setFilters({ ...filters, vanId: e.target.value });
              setPage(1);
            }}
          >
            <NativeSelectOption value="">Any van</NativeSelectOption>
            {vans.map((van) => (
              <NativeSelectOption key={van.id} value={van.id}>
                {van.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {content}

      <div className="flex items-center justify-between text-muted-foreground text-sm">
        <span>
          {data.total} shift{data.total === 1 ? "" : "s"} · page {page} of {pages} · refreshes every minute
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

      {selectedShiftId ? (
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-base">
                {detail ? `${detail.vanName} (${detail.vanPlate}) — ${detail.operatorName}` : "Shift stops"}
              </h3>
              {detail ? (
                <p className="text-muted-foreground text-xs">
                  Started {ukDateTime(detail.startedAt)} · {detail.stops.length} stop
                  {detail.stops.length === 1 ? "" : "s"}
                </p>
              ) : null}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedShiftId(null);
                setDetail(null);
              }}
            >
              Close
            </Button>
          </div>
          {loadingDetail && !detail ? (
            <p className="py-4 text-muted-foreground text-sm">Loading stops and timeline...</p>
          ) : null}
          {detail && detail.stops.length === 0 ? (
            <p className="py-4 text-muted-foreground text-sm">No stops recorded on this shift.</p>
          ) : null}
          {detail && detail.stops.length > 0 ? (
            <div className="flex flex-col gap-3">
              {detail.stops.map((stop) => {
                const actions = stopStaffActions(stop);
                return (
                  <div key={stop.id} className="rounded-md border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-medium text-sm">
                          {stop.queuePosition != null ? `#${stop.queuePosition} ` : ""}
                          {stop.patientName} — {stop.serviceName}
                        </span>
                        <div className="mt-1 flex items-center gap-2 text-muted-foreground text-xs">
                          <Badge variant="outline">{stop.status}</Badge>
                          <span>Phase: {stop.phase}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {actions.canComplete ? (
                          <Button
                            size="sm"
                            disabled={updatingStopId === stop.id}
                            onClick={() => void updateStopPhase(stop, "completed")}
                          >
                            Mark completed
                          </Button>
                        ) : null}
                        {actions.canNoShow ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={updatingStopId === stop.id}
                            onClick={() => void updateStopPhase(stop, "no_show")}
                          >
                            Mark no-show
                          </Button>
                        ) : null}
                        {actions.canCancel ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={updatingStopId === stop.id}
                            onClick={() => void cancelStop(stop)}
                          >
                            Cancel stop
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    {stop.events.length > 0 ? (
                      <ul className="mt-2 space-y-1 border-t pt-2 text-muted-foreground text-xs">
                        {stop.events.map((ev) => (
                          <li key={ev.id}>
                            {ukDateTime(ev.at)} · {ev.type}
                            {ev.fromPhase && ev.toPhase ? ` (${ev.fromPhase} → ${ev.toPhase})` : ""}
                            {ev.reason ? ` · ${ev.reason}` : ""}
                            {ev.actorRole ? ` · by ${ev.actorRole}` : ""}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
