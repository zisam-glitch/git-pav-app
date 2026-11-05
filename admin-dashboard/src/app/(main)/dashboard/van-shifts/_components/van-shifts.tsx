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
  freshness,
  freshnessLabel,
  SHIFT_STATUS_LABEL,
  SHIFTS_PAGE_SIZE,
  type ShiftFilters,
  type ShiftState,
  shiftLength,
  shiftsPath,
  type VanShiftRow,
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
    </div>
  );
}
