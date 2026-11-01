"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { appRequest, ukDateTime } from "@/lib/pav-schedule";
import {
  type AdminOperator,
  type AdminVan,
  type AreaPolygon,
  currentAssignments,
  parseAreaGeoJson,
  previewPaths,
} from "@/lib/pav-vans";

function AreaPreview({ polygons, size = 120 }: { polygons: AreaPolygon[]; size?: number }) {
  const paths = useMemo(() => previewPaths(polygons, size), [polygons, size]);
  if (paths.length === 0) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Outline of the service area, north at the top"
      className="shrink-0 rounded-md border bg-muted/40"
    >
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          fill="currentColor"
          fillOpacity={0.15}
          stroke="currentColor"
          strokeWidth={1.5}
          fillRule="evenodd"
        />
      ))}
    </svg>
  );
}

function AddArea({ van, onAdded }: { van: AdminVan; onAdded: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const parsed = useMemo(() => (text.trim() ? parseAreaGeoJson(text) : null), [text]);

  async function save() {
    if (!parsed?.ok) return;
    if (name.trim().length < 2) {
      toast.error("Give the area a name, for example a postcode district.");
      return;
    }
    setBusy(true);
    try {
      // A MultiPolygon or several features become one area each.
      for (const [i, polygon] of parsed.polygons.entries()) {
        const sectorName = parsed.polygons.length > 1 ? `${name.trim()} (${i + 1})` : name.trim();
        await appRequest(`vans/${van.id}/polygons`, {
          method: "POST",
          body: JSON.stringify({ sectorName, polygonGeoJson: polygon }),
        });
      }
      toast.success(`Service area added to ${van.name}`);
      setName("");
      setText("");
      await onAdded();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The area wasn't saved");
      await onAdded();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border p-3">
      <p className="font-medium text-sm">Add a service area</p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`area-name-${van.id}`}>Name</Label>
        <Input
          id={`area-name-${van.id}`}
          placeholder="e.g. SW - South West London"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`area-shape-${van.id}`}>Shape (GeoJSON)</Label>
        <Textarea
          id={`area-shape-${van.id}`}
          rows={5}
          className="font-mono text-xs"
          placeholder='Draw the area at geojson.io, then paste what it shows on the right, e.g. {"type":"FeatureCollection",...}'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <p className="text-muted-foreground text-xs">
          Polygons only, as [longitude, latitude] points. Patients whose address is inside the area can request this
          van.
        </p>
      </div>
      {parsed && !parsed.ok ? (
        <p className="text-destructive text-sm" role="alert">
          {parsed.error}
        </p>
      ) : null}
      {parsed?.ok ? (
        <div className="flex items-center gap-3">
          <AreaPreview polygons={parsed.polygons} />
          <p className="text-muted-foreground text-sm">
            {parsed.polygons.length === 1 ? "1 area" : `${parsed.polygons.length} areas`} ready to add. Check the
            outline looks right.
          </p>
        </div>
      ) : null}
      <Button className="self-start" onClick={save} disabled={busy || !parsed?.ok}>
        {busy ? "Adding..." : "Add area"}
      </Button>
    </div>
  );
}

export function VansEditor() {
  const [vans, setVans] = useState<AdminVan[] | null>(null);
  const [operators, setOperators] = useState<AdminOperator[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [assignTo, setAssignTo] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const [v, o] = await Promise.all([appRequest<AdminVan[]>("vans"), appRequest<AdminOperator[]>("operators")]);
      setVans(v);
      setOperators(o);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't load the vans");
      setVans((current) => current ?? []);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(key: string, action: () => Promise<unknown>, done: string) {
    setBusy(key);
    try {
      await action();
      toast.success(done);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "That didn't work");
    } finally {
      setBusy(null);
      await load();
    }
  }

  if (vans === null) {
    return <div className="flex h-40 items-center justify-center text-muted-foreground">Loading the vans...</div>;
  }

  const activeOperators = operators.filter((o) => o.isActive);

  return (
    <div className="flex flex-col gap-6">
      {vans.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-muted-foreground text-sm">
            No vans yet. Add one under Team &amp; Services first.
          </CardContent>
        </Card>
      ) : null}

      {vans.map((van) => {
        const current = currentAssignments(van);
        return (
          <Card key={van.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2">
                {van.name}
                {!van.isActive ? <Badge variant="secondary">Retired</Badge> : null}
                {van.servicePolygons.length === 0 ? <Badge variant="destructive">No service area</Badge> : null}
              </CardTitle>
              <CardDescription>
                {van.registrationPlate} · {van.vehicleModel}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="font-medium text-sm">Operator</p>
                {current.length > 0 ? (
                  <ul className="flex flex-col gap-1">
                    {current.map((assignment) => (
                      <li key={assignment.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span>
                          {assignment.operator.fullName}
                          <span className="text-muted-foreground"> · since {ukDateTime(assignment.startsAt)}</span>
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy !== null}
                          onClick={() =>
                            void run(
                              `end-${assignment.id}`,
                              () => appRequest(`vans/${van.id}/assignments/${assignment.id}/end`, { method: "POST" }),
                              `${assignment.operator.fullName} is no longer assigned to ${van.name}`,
                            )
                          }
                        >
                          End assignment
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Nobody is assigned, so no one can start a shift on this van.
                  </p>
                )}
                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`assign-${van.id}`}>Assign an operator</Label>
                    <NativeSelect
                      id={`assign-${van.id}`}
                      value={assignTo[van.id] ?? ""}
                      onChange={(e) => setAssignTo({ ...assignTo, [van.id]: e.target.value })}
                    >
                      <NativeSelectOption value="">Choose an operator</NativeSelectOption>
                      {activeOperators.map((o) => (
                        <NativeSelectOption key={o.id} value={o.id}>
                          {o.fullName} ({o.email}){o.currentAssignment ? `, now on ${o.currentAssignment.vanName}` : ""}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </div>
                  <Button
                    size="sm"
                    disabled={busy !== null || !assignTo[van.id] || !van.isActive}
                    onClick={() => {
                      const operator = operators.find((o) => o.id === assignTo[van.id]);
                      void run(
                        `assign-${van.id}`,
                        () =>
                          appRequest(`vans/${van.id}/assignments`, {
                            method: "POST",
                            body: JSON.stringify({ operatorId: assignTo[van.id] }),
                          }),
                        `${operator?.fullName ?? "Operator"} assigned to ${van.name}`,
                      ).then(() => setAssignTo({ ...assignTo, [van.id]: "" }));
                    }}
                  >
                    Assign
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs">
                  An operator drives one van at a time: assigning them here ends their other assignment.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <p className="font-medium text-sm">Service areas</p>
                {van.servicePolygons.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    None yet. Patients can't request this van until it has an area.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {van.servicePolygons.map((area) => (
                      <li key={area.id} className="flex items-center gap-3 text-sm">
                        <AreaPreview polygons={[area.polygonGeoJson]} size={56} />
                        <span className="flex-1">{area.sectorName}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy !== null}
                          onClick={() => {
                            if (
                              !window.confirm(
                                `Remove "${area.sectorName}"? Patients there won't be covered by ${van.name}.`,
                              )
                            )
                              return;
                            void run(
                              `remove-${area.id}`,
                              () => appRequest(`vans/${van.id}/polygons/${area.id}`, { method: "DELETE" }),
                              `"${area.sectorName}" removed`,
                            );
                          }}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                <AddArea van={van} onAdded={load} />
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardHeader>
          <CardTitle>Van operators</CardTitle>
          <CardDescription>Add operators under Team &amp; Services. Assign them to a van above.</CardDescription>
        </CardHeader>
        <CardContent>
          {operators.length === 0 ? (
            <p className="text-muted-foreground text-sm">No operators yet.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {operators.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {o.fullName}
                    <span className="text-muted-foreground"> · {o.email}</span>
                    {!o.isActive ? <span className="text-muted-foreground"> · deactivated</span> : null}
                  </span>
                  <span className="text-muted-foreground">
                    {o.currentAssignment ? `On ${o.currentAssignment.vanName}` : "Not assigned"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
