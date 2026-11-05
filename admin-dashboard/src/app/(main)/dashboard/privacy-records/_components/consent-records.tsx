"use client";

import { useCallback, useEffect, useState } from "react";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { pageCount } from "@/lib/pav-appointments";
import {
  CONSENT_TYPES,
  type ConsentFilters,
  type ConsentRow,
  type ConsentStatus,
  consentLabel,
  consentsPath,
  lawfulBasisLabel,
  PRIVACY_PAGE_SIZE,
} from "@/lib/pav-privacy";
import { appRequest, ukDateTime } from "@/lib/pav-schedule";

import { Pager } from "./pager";

type Page = { consents: ConsentRow[]; total: number };

export function ConsentRecords() {
  const [filters, setFilters] = useState<ConsentFilters>({ consentType: "", status: "", patientId: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page>({ consents: [], total: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await appRequest<Page>(consentsPath(filters, page)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load consent records");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const setFilter = <K extends keyof ConsentFilters>(key: K, value: ConsentFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  let content: React.ReactNode;
  if (loading) {
    content = (
      <div className="flex h-40 items-center justify-center text-muted-foreground">Loading consent records...</div>
    );
  } else if (data.consents.length === 0) {
    content = <p className="text-muted-foreground text-sm">No consent records match.</p>;
  } else {
    content = (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Consent</TableHead>
              <TableHead>Lawful basis</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Given</TableHead>
              <TableHead>Withdrawn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.consents.map((consent) => (
              <TableRow key={consent.id}>
                <TableCell>
                  <button
                    type="button"
                    className="text-left underline-offset-2 hover:underline"
                    title="Show only this patient"
                    onClick={() => setFilter("patientId", consent.patientId)}
                  >
                    {consent.patientName}
                  </button>
                </TableCell>
                <TableCell>
                  {consentLabel(consent.consentType)}
                  <span className="ml-2 text-muted-foreground text-xs">v{consent.version}</span>
                </TableCell>
                <TableCell>{lawfulBasisLabel(consent.lawfulBasis)}</TableCell>
                <TableCell>
                  <Badge variant={consent.isGranted ? "default" : "destructive"}>
                    {consent.isGranted ? "In force" : "Withdrawn"}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">{ukDateTime(consent.grantedAt)}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {consent.withdrawnAt ? ukDateTime(consent.withdrawnAt) : "Not withdrawn"}
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
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="consent-type">Consent</Label>
          <NativeSelect
            id="consent-type"
            value={filters.consentType}
            onChange={(e) => setFilter("consentType", e.target.value as ConsentFilters["consentType"])}
          >
            <NativeSelectOption value="">Any</NativeSelectOption>
            {CONSENT_TYPES.map((type) => (
              <NativeSelectOption key={type} value={type}>
                {consentLabel(type)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="consent-status">Status</Label>
          <NativeSelect
            id="consent-status"
            value={filters.status}
            onChange={(e) => setFilter("status", e.target.value as ConsentStatus)}
          >
            <NativeSelectOption value="">Any</NativeSelectOption>
            <NativeSelectOption value="granted">In force</NativeSelectOption>
            <NativeSelectOption value="withdrawn">Withdrawn</NativeSelectOption>
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="consent-patient">Patient ID</Label>
          <Input
            id="consent-patient"
            placeholder="Paste a patient ID"
            value={filters.patientId}
            onChange={(e) => setFilter("patientId", e.target.value)}
          />
        </div>
      </div>

      {content}

      <Pager
        total={data.total}
        noun="record"
        page={page}
        pages={pageCount(data.total, PRIVACY_PAGE_SIZE)}
        loading={loading}
        onPage={setPage}
      />
    </div>
  );
}
