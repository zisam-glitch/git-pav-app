import { buildVideoActivity, callOutcome, type VideoActivityInput } from "../lib/video-activity";
import { appointmentEmailRecord } from "../lib/patient-email";

const now = new Date("2026-11-12T12:00:00Z");
const base: VideoActivityInput = {
  status: "completed",
  startTimeUtc: new Date("2026-11-12T09:00:00Z"),
  endTimeUtc: new Date("2026-11-12T09:30:00Z"),
  patientWaitingSince: new Date("2026-11-12T08:58:00Z"),
  triage: { admittedAt: "2026-11-12T09:03:00Z", completedAt: "2026-11-12T09:25:00Z", symptoms: "private answers" },
  pushes: [],
  reminders: [],
  thread: null,
};

describe("Video visit activity for staff (V41)", () => {
  it("says the call took place and how long the patient waited", () => {
    const a = buildVideoActivity(base, now);
    expect(a.call.outcome).toBe("took_place");
    expect(a.call.waitedMinutes).toBe(5);
    expect(a.call.admittedAt).toBe("2026-11-12T09:03:00.000Z");
    expect(a.call.completedAt).toBe("2026-11-12T09:25:00.000Z");
  });

  it("never carries triage answers or anything beyond the three times", () => {
    expect(JSON.stringify(buildVideoActivity(base, now))).not.toContain("private answers");
  });

  it("tells a visit that is still ahead from one whose time passed with nothing recorded", () => {
    const end = new Date("2026-11-12T13:00:00Z");
    expect(callOutcome("confirmed", end, now)).toBe("upcoming");
    expect(callOutcome("confirmed", new Date("2026-11-12T11:00:00Z"), now)).toBe("not_recorded");
  });

  it("maps the other statuses straight through", () => {
    const end = new Date("2026-11-12T13:00:00Z");
    expect(callOutcome("in_progress", end, now)).toBe("in_progress");
    expect(callOutcome("no_show", end, now)).toBe("no_show");
    expect(callOutcome("cancelled", end, now)).toBe("cancelled");
  });

  it("lists pushes and reminders together, earliest first, a pending reminder at its due time", () => {
    const a = buildVideoActivity(
      {
        ...base,
        pushes: [{ type: "appointment_booked", title: "Booking confirmed", sentAt: new Date("2026-11-10T10:00:00Z"), status: "sent" }],
        reminders: [
          { title: "Video consultation in 1 hour", scheduledFor: new Date("2026-11-12T08:00:00Z"), sentAt: new Date("2026-11-12T08:00:20Z"), status: "sent" },
          { title: "Your video consultation is about to start", scheduledFor: new Date("2026-11-12T08:50:00Z"), sentAt: null, status: "cancelled" },
        ],
      },
      now
    );
    expect(a.notices.map((n) => `${n.kind}:${n.status}`)).toEqual(["push:sent", "reminder:sent", "reminder:cancelled"]);
    expect(a.notices[2].at).toBe("2026-11-12T08:50:00.000Z");
  });

  it("copes with a visit nobody joined", () => {
    const a = buildVideoActivity({ ...base, status: "confirmed", patientWaitingSince: null, triage: null }, now);
    expect(a.call).toMatchObject({ outcome: "not_recorded", patientWaitingSince: null, admittedAt: null, completedAt: null, waitedMinutes: null });
  });

  it("ignores unreadable stored times and a wait that would be negative", () => {
    const a = buildVideoActivity({ ...base, triage: { admittedAt: "nonsense", completedAt: 42 } }, now);
    expect(a.call.admittedAt).toBeNull();
    expect(a.call.completedAt).toBeNull();
    const b = buildVideoActivity({ ...base, patientWaitingSince: new Date("2026-11-12T09:10:00Z") }, now);
    expect(b.call.waitedMinutes).toBeNull();
  });

  it("reports the conversation size and last message time, not its text", () => {
    const a = buildVideoActivity({ ...base, thread: { messageCount: 3, lastMessageAt: new Date("2026-11-12T09:26:00Z") } }, now);
    expect(a.conversation).toEqual({ messageCount: 3, lastMessageAt: "2026-11-12T09:26:00.000Z" });
    expect(buildVideoActivity(base, now).conversation).toBeNull();
  });

  it("shows an email as an email, not a push (V6)", () => {
    const a = buildVideoActivity(
      {
        ...base,
        pushes: [
          { type: "push", title: "Booking confirmed", sentAt: new Date("2026-11-10T10:00:00Z"), status: "sent" },
          { type: "email", title: "Your video consultation is booked", sentAt: new Date("2026-11-10T10:00:05Z"), status: "failed" },
        ],
      },
      now
    );
    expect(a.notices.map((n) => `${n.kind}:${n.status}`)).toEqual(["push:sent", "email:failed"]);
  });
});

describe("The record kept of an appointment email (V6)", () => {
  const input = { userId: "u1", appointmentId: "a1", kind: "booked" as const, subject: "Your video consultation is booked", delivered: true };

  it("is tied to the appointment, keeps the subject and never a body", () => {
    expect(appointmentEmailRecord(input)).toEqual({
      userId: "u1",
      type: "email",
      title: "Your video consultation is booked",
      body: "",
      data: { type: "appointment_booked", appointmentId: "a1" },
      status: "sent",
    });
  });

  it("records a failed delivery as failed", () => {
    expect(appointmentEmailRecord({ ...input, delivered: false }).status).toBe("failed");
  });
});
