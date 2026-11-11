// Run with `npm test`. Node strips the types from pav-video-activity.ts when it is imported.

import { conversationLabel, noticeKindLabel, noticeStatusLabel, OUTCOME_LABELS, waitedLabel } from "./pav-video-activity.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("video visit activity wording", () => {
  it("has a plain label for every call outcome the backend can send", () => {
    for (const outcome of ["took_place", "in_progress", "no_show", "cancelled", "upcoming", "not_recorded"]) {
      assert.ok(OUTCOME_LABELS[outcome], `missing label for ${outcome}`);
    }
  });

  it("names notice kinds and delivery statuses, and passes an unknown status through", () => {
    assert.equal(noticeKindLabel("push"), "Push");
    assert.equal(noticeKindLabel("email"), "Email");
    assert.equal(noticeKindLabel("reminder"), "Reminder");
    assert.equal(noticeStatusLabel("sent"), "Sent");
    assert.equal(noticeStatusLabel("cancelled"), "Not sent, visit changed");
    assert.equal(noticeStatusLabel("mystery"), "mystery");
  });

  it("says how long the patient waited, or nothing when it is not known", () => {
    assert.equal(waitedLabel(null), null);
    assert.equal(waitedLabel(0), "Waited under a minute");
    assert.equal(waitedLabel(1), "Waited 1 minute");
    assert.equal(waitedLabel(5), "Waited 5 minutes");
  });

  it("sizes the conversation without showing any of it", () => {
    assert.equal(conversationLabel(null), "No messages yet");
    assert.equal(conversationLabel({ messageCount: 0, lastMessageAt: null }), "No messages yet");
    assert.equal(conversationLabel({ messageCount: 1, lastMessageAt: "2026-11-12T09:00:00Z" }), "1 message");
    assert.equal(conversationLabel({ messageCount: 3, lastMessageAt: null }), "3 messages");
  });
});
