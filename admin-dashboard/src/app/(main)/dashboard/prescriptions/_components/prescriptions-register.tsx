"use client";

import { useCallback, useEffect, useState } from "react";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { pageCount } from "@/lib/pav-appointments";
import {
  PRESCRIPTION_STATE_LABEL,
  PRESCRIPTIONS_PAGE_SIZE,
  type PrescriptionFilters,
  type PrescriptionRow,
  prescriptionState,
  prescriptionsPath,
} from "@/lib/pav-prescriptions";
import { appRequest, type Clinician, ukDateTime } from "@/lib/pav-schedule";

type Page = { prescriptions: PrescriptionRow[]; total: number };

const STATE_VARIANT = { sent: "default", signed: "secondary", unsigned: "destructive" } as const;

export function PrescriptionsRegister() {
  const [filters, setFilters] = useState<PrescriptionFilters>({ clinicianId: "", from: "", to: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page>({ prescriptions: [], total: 0 });
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appRequest<Clinician[]>("clinicians")
      .then(setClinicians)
      .catch(() => {
        // The register still works without the dentist filter.
      });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await appRequest<Page>(prescriptionsPath(filters, page)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load the prescriptions register");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const setFilter = <K extends keyof PrescriptionFilters>(key: K, value: PrescriptionFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const pages = pageCount(data.total, PRESCRIPTIONS_PAGE_SIZE);

  let content: React.ReactNode;
  if (loading) {
    content = (
      <div className="flex h-40 items-center justify-center text-muted-foreground">Loading the register...</div>
    );
  } else if (data.prescriptions.length === 0) {
    content = <p className="text-muted-foreground text-sm">No prescriptions match.</p>;
  } else {
    content = (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Issued</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Issued by</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Visit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.prescriptions.map((rx) => {
              const state = prescriptionState(rx);
              return (
                <TableRow key={rx.id}>
                  <TableCell className="whitespace-nowrap">{ukDateTime(rx.issuedAt)}</TableCell>
                  <TableCell className="font-mono text-xs">{rx.reference ?? "None"}</TableCell>
                  <TableCell>
                    <div>{rx.clinicianName ?? "Unknown"}</div>
                    {rx.clinicianRole ? <div className="text-muted-foreground text-xs">{rx.clinicianRole}</div> : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATE_VARIANT[state]}>{PRESCRIPTION_STATE_LABEL[state]}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {rx.dispatchedAt ? ukDateTime(rx.dispatchedAt) : "Not yet"}
                  </TableCell>
                  <TableCell className="max-w-40 truncate font-mono text-xs" title="Appointment ID">
                    {rx.appointmentId ?? "None"}
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
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="rx-from">From</Label>
          <Input id="rx-from" type="date" value={filters.from} onChange={(e) => setFilter("from", e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="rx-to">To</Label>
          <Input id="rx-to" type="date" value={filters.to} onChange={(e) => setFilter("to", e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="rx-clinician">Issued by</Label>
          <NativeSelect
            id="rx-clinician"
            value={filters.clinicianId}
            onChange={(e) => setFilter("clinicianId", e.target.value)}
          >
            <NativeSelectOption value="">Anyone</NativeSelectOption>
            {clinicians.map((clinician) => (
              <NativeSelectOption key={clinician.id} value={clinician.id}>
                {clinician.fullName}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>

      {content}

      <div className="flex items-center justify-between text-muted-foreground text-sm">
        <span>
          {data.total} prescription{data.total === 1 ? "" : "s"} · page {page} of {pages}
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
