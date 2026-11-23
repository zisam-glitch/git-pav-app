"use client";

import { useCallback, useEffect, useState } from "react";

import { format } from "date-fns";
import { CheckCircle, CircleDot, Eye, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { type Submission, SubmissionDetailSheet } from "./submission-detail-sheet";

export function SubmissionsTable() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [formTypeFilter, setFormTypeFilter] = useState("all");
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (formTypeFilter !== "all") params.append("form_type", formTypeFilter);
      const res = await fetch(`/api/v1/admin/submissions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setSubmissions(json.data || []);
    } catch {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [formTypeFilter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  async function markRead(id: string, is_read: boolean) {
    try {
      const res = await fetch(`/api/v1/admin/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read }),
      });
      if (!res.ok) throw new Error("Update failed");
      setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, is_read } : s)));
      toast.success(is_read ? "Marked as read" : "Marked as unread");
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function deleteSub(id: string) {
    if (!confirm("Delete this submission?")) return;
    try {
      const res = await fetch(`/api/v1/admin/submissions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Submission deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  const BADGE_COLORS: Record<string, string> = {
    contact: "bg-blue-500/10 text-blue-600 border-blue-200",
    vacancy: "bg-purple-500/10 text-purple-600 border-purple-200",
    petition: "bg-amber-500/10 text-amber-600 border-amber-200",
    registration: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    other: "bg-muted text-muted-foreground",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Select value={formTypeFilter} onValueChange={setFormTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Form Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Form Types</SelectItem>
            <SelectItem value="contact">Contact Messages</SelectItem>
            <SelectItem value="vacancy">Job Applications</SelectItem>
            <SelectItem value="petition">Petitions</SelectItem>
            <SelectItem value="registration">Patient Registrations</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={fetchSubmissions}>
          Refresh
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>Type</TableHead>
              <TableHead>Sender / Applicant</TableHead>
              <TableHead>Subject / Summary</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Loading submissions...
                </TableCell>
              </TableRow>
            ) : submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Mail className="size-8 mx-auto mb-2 text-muted-foreground/50" />
                  No form submissions received yet.
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((sub) => {
                const name = sub.data?.name || sub.data?.fullName || "Anonymous";
                const email = sub.data?.email || "No email";
                const summary =
                  sub.data?.subject || sub.data?.position || sub.data?.summary || sub.data?.message?.slice(0, 50) || "—";

                return (
                  <TableRow
                    key={sub.id}
                    className={`cursor-pointer hover:bg-muted/50 ${!sub.is_read ? "font-semibold bg-muted/20" : ""}`}
                    onClick={() => {
                      setSelectedSub(sub);
                      setSheetOpen(true);
                      if (!sub.is_read) markRead(sub.id, true);
                    }}
                  >
                    <TableCell>
                      {!sub.is_read ? <CircleDot className="size-3.5 text-primary fill-primary" /> : <span />}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={BADGE_COLORS[sub.form_type] || ""}>
                        {sub.form_type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground">{email}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{summary}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(sub.submitted_at), "MMM d, p")}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => {
                            setSelectedSub(sub);
                            setSheetOpen(true);
                          }}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive"
                          onClick={() => deleteSub(sub.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <SubmissionDetailSheet
        submission={selectedSub}
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onMarkRead={markRead}
        onDelete={deleteSub}
      />
    </div>
  );
}
