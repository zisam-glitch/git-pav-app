"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { appRequest, ukDateTime } from "@/lib/pav-schedule";
import {
  conversationLabel,
  noticeKindLabel,
  noticeStatusLabel,
  OUTCOME_LABELS,
  type VideoActivity,
  waitedLabel,
} from "@/lib/pav-video-activity";

// For one video visit: did the call happen, and which notices went to the patient.
export function VideoActivityDialog({ appointmentId, patientName }: { appointmentId: string; patientName: string }) {
  const [open, setOpen] = useState(false);
  const [activity, setActivity] = useState<VideoActivity | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setActivity(null);
    setError(null);
    appRequest<VideoActivity>(`appointments/${appointmentId}/video-activity`)
      .then((result) => {
        if (!cancelled) setActivity(result);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load the call details");
      });
    return () => {
      cancelled = true;
    };
  }, [open, appointmentId]);

  const waited = activity ? waitedLabel(activity.call.waitedMinutes) : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="h-auto p-0 text-xs" aria-label={`Call and notices for ${patientName}`}>
          Call and notices
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Video visit: {patientName}</DialogTitle>
          <DialogDescription>Times and delivery only. Message text and answers are never shown here.</DialogDescription>
        </DialogHeader>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        {!error && !activity ? <p className="text-muted-foreground text-sm">Loading...</p> : null}

        {activity ? (
          <div className="flex flex-col gap-4 text-sm">
            <section className="flex flex-col gap-1">
              <h3 className="font-medium">Call</h3>
              <p>{OUTCOME_LABELS[activity.call.outcome]}</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 text-muted-foreground text-xs">
                {activity.call.patientWaitingSince ? (
                  <>
                    <dt>Patient reported in</dt>
                    <dd>{ukDateTime(activity.call.patientWaitingSince)}</dd>
                  </>
                ) : null}
                {activity.call.admittedAt ? (
                  <>
                    <dt>Let in</dt>
                    <dd>{ukDateTime(activity.call.admittedAt)}</dd>
                  </>
                ) : null}
                {activity.call.completedAt ? (
                  <>
                    <dt>Ended</dt>
                    <dd>{ukDateTime(activity.call.completedAt)}</dd>
                  </>
                ) : null}
              </dl>
              {waited ? <p className="text-muted-foreground text-xs">{waited}</p> : null}
            </section>

            <section className="flex flex-col gap-1">
              <h3 className="font-medium">Notices to the patient</h3>
              {activity.notices.length === 0 ? (
                <p className="text-muted-foreground text-xs">None recorded for this visit. Emails sent before they were recorded do not appear.</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {activity.notices.map((notice) => (
                    <li key={`${notice.kind}:${notice.at}:${notice.title}`} className="flex items-start justify-between gap-3">
                      <span>
                        <span className="text-muted-foreground text-xs">{noticeKindLabel(notice.kind)} · </span>
                        {notice.title}
                        <span className="block text-muted-foreground text-xs">{ukDateTime(notice.at)}</span>
                      </span>
                      <Badge variant={notice.status === "failed" ? "destructive" : "outline"}>
                        {noticeStatusLabel(notice.status)}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="flex flex-col gap-1">
              <h3 className="font-medium">Conversation</h3>
              <p>{conversationLabel(activity.conversation)}</p>
              {activity.conversation?.lastMessageAt ? (
                <p className="text-muted-foreground text-xs">Last message {ukDateTime(activity.conversation.lastMessageAt)}</p>
              ) : null}
            </section>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
