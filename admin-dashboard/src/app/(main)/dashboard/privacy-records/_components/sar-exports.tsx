"use client";

import { useCallback, useEffect, useState } from "react";

import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { pageCount } from "@/lib/pav-appointments";
import { fileSize, PRIVACY_PAGE_SIZE, type SarExportRow, type SarFilters, sarExportsPath } from "@/lib/pav-privacy";
import { appRequest, ukDateTime } from "@/lib/pav-schedule";

import { Pager } from "./pager";

type Page = { exports: SarExportRow[]; total: number };

export function SarExports() {
  const [filters, setFilters] = useState<SarFilters>({ from: "", to: "", patientId: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page>({ exports: [], total: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await appRequest<Page>(sarExportsPath(filters, page)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load data access bundles");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const setFilter = <K extends keyof SarFilters>(key: K, value: SarFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  let content: React.ReactNode;
  if (loading) {
    content = <div className="flex h-40 items-center justify-center text-muted-foreground">Loading...</div>;
  } else if (data.exports.length === 0) {
    content = <p className="text-muted-foreground text-sm">No data access bundles match.</p>;
  } else {
    content = (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Made</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Size</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.exports.map((bundle) => (
              <TableRow key={bundle.id}>
                <TableCell className="whitespace-nowrap">{ukDateTime(bundle.createdAt)}</TableCell>
                <TableCell>
                  <button
                    type="button"
                    className="text-left underline-offset-2 hover:underline"
                    title="Show only this patient"
                    onClick={() => setFilter("patientId", bundle.patientId)}
                  >
                    {bundle.patientName}
                  </button>
                </TableCell>
                <TableCell>{fileSize(bundle.fileSizeBytes)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Patients generate these themselves in the app, and the bundle goes straight to their own document vault. Staff
        can see that one was made and when, which starts the one-month clock for the request. The bundle can't be opened
        from here.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="sar-from">From</Label>
          <Input id="sar-from" type="date" value={filters.from} onChange={(e) => setFilter("from", e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sar-to">To</Label>
          <Input id="sar-to" type="date" value={filters.to} onChange={(e) => setFilter("to", e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sar-patient">Patient ID</Label>
          <Input
            id="sar-patient"
            placeholder="Paste a patient ID"
            value={filters.patientId}
            onChange={(e) => setFilter("patientId", e.target.value)}
          />
        </div>
      </div>

      {content}

      <Pager
        total={data.total}
        noun="bundle"
        page={page}
        pages={pageCount(data.total, PRIVACY_PAGE_SIZE)}
        loading={loading}
        onPage={setPage}
      />
    </div>
  );
}
