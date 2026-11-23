// Run with `npm test`.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { enquiryAlertConfig, enquiryAlertEmail, sendEnquiryAlert } from "./enquiry-alert.ts";

const env = {
  POSTMARK_SERVER_TOKEN: "pm-test-token",
  CLINIC_NOTIFICATION_EMAIL: "reception@example.test",
  DASHBOARD_URL: "https://dashboard.example.test/",
};
const alert = { kind: "contact", name: "Jane Example", email: "jane@example.test", phone: "07700 900123" };
const now = new Date("2026-11-18T14:05:00Z");

/** A stand-in for fetch that records the request and answers with `status`. */
function fakeFetch(status = 200, body = {}) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url, init, payload: JSON.parse(init.body) });
    return new Response(JSON.stringify(body), { status });
  };
  return { impl, calls };
}

/** Runs `fn` with console.error captured, and returns what it logged. */
async function capturingErrors(fn) {
  const original = console.error;
  const lines = [];
  console.error = (...args) => lines.push(JSON.stringify(args));
  try {
    return { result: await fn(), logged: lines.join("\n") };
  } finally {
    console.error = original;
  }
}

describe("enquiryAlertConfig", () => {
  it("stays off without a Postmark token or a practice address", () => {
    assert.equal(enquiryAlertConfig({}), null);
    assert.equal(enquiryAlertConfig({ POSTMARK_SERVER_TOKEN: "pm-test-token" }), null);
    assert.equal(enquiryAlertConfig({ CLINIC_NOTIFICATION_EMAIL: "reception@example.test" }), null);
  });

  it("treats placeholder tokens as not set up", () => {
    assert.equal(enquiryAlertConfig({ ...env, POSTMARK_SERVER_TOKEN: "pm_server_token_replace_me" }), null);
    assert.equal(enquiryAlertConfig({ ...env, POSTMARK_SERVER_TOKEN: "mock-token" }), null);
  });

  it("sends from noreply@pavdental.com unless told otherwise and trims the dashboard link", () => {
    assert.deepEqual(enquiryAlertConfig(env), {
      token: "pm-test-token",
      to: "reception@example.test",
      from: "noreply@pavdental.com",
      dashboardUrl: "https://dashboard.example.test",
    });
    assert.equal(enquiryAlertConfig({ ...env, FROM_EMAIL: "alerts@example.test" }).from, "alerts@example.test");
  });
});

describe("enquiryAlertEmail", () => {
  it("says which form came in, when, who sent it, and links to the dashboard", () => {
    const email = enquiryAlertEmail(alert, "https://dashboard.example.test", now);
    assert.equal(email.subject, "New website enquiry");
    assert.match(email.text, /A contact form enquiry came in through the website on 18 Nov 2026, 14:05\./);
    assert.match(email.text, /Name: Jane Example\nEmail: jane@example.test\nPhone: 07700 900123/);
    assert.match(email.text, /Read it in the dashboard: https:\/\/dashboard.example.test\/dashboard\/submissions/);
    assert.match(email.text, /What they wrote stays in the dashboard/);
  });

  it("sends booking requests to the Bookings page and names the role for job applications", () => {
    const booking = enquiryAlertEmail({ ...alert, kind: "booking" }, "https://dashboard.example.test", now);
    assert.equal(booking.subject, "New booking request from the website");
    assert.match(booking.text, /\/dashboard\/bookings/);
    const job = enquiryAlertEmail({ ...alert, kind: "vacancy", position: "Dental nurse" }, null, now);
    assert.match(job.text, /Role: Dental nurse/);
    assert.match(job.text, /Read it on the dashboard's Submissions page\./);
  });

  it("announces a patient registration with contact details only, never the answers", () => {
    const email = enquiryAlertEmail({ ...alert, kind: "registration" }, "https://dashboard.example.test", now);
    assert.equal(email.subject, "New patient registration from the website");
    assert.match(email.text, /A patient registration came in through the website/);
    assert.match(email.text, /\/dashboard\/submissions/);
    assert.match(email.text, /health details never travel by email/);
    assert.doesNotMatch(email.text, /NHS|medical|allerg/i);
  });

  it("escapes what the sender typed in the HTML version", () => {
    const email = enquiryAlertEmail({ ...alert, name: "<b>Jane</b> & co" }, null, now);
    assert.match(email.html, /Name: &lt;b&gt;Jane&lt;\/b&gt; &amp; co/);
    assert.doesNotMatch(email.html, /<b>Jane/);
  });
});

describe("sendEnquiryAlert", () => {
  it("sends one Postmark email to the practice", async () => {
    const { impl, calls } = fakeFetch(200);
    assert.equal(await sendEnquiryAlert(alert, { env, fetchImpl: impl, now }), "sent");
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://api.postmarkapp.com/email");
    assert.equal(calls[0].init.headers["X-Postmark-Server-Token"], "pm-test-token");
    assert.equal(calls[0].payload.To, "reception@example.test");
    assert.equal(calls[0].payload.From, "noreply@pavdental.com");
    assert.equal(calls[0].payload.Subject, "New website enquiry");
    assert.equal(calls[0].payload.MessageStream, "outbound");
  });

  it("does nothing when email is not set up", async () => {
    const { impl, calls } = fakeFetch(200);
    assert.equal(await sendEnquiryAlert(alert, { env: {}, fetchImpl: impl, now }), "skipped");
    assert.equal(calls.length, 0);
  });

  it("reports a refusal without throwing, and logs no contact details", async () => {
    const { impl } = fakeFetch(422, { ErrorCode: 300, Message: "Invalid 'To' address: reception@example.test" });
    const { result, logged } = await capturingErrors(() => sendEnquiryAlert(alert, { env, fetchImpl: impl, now }));
    assert.equal(result, "failed");
    assert.match(logged, /"errorCode":300/);
    assert.doesNotMatch(logged, /example\.test|Jane/);
  });

  it("survives a network failure", async () => {
    const failing = async () => {
      throw new TypeError("fetch failed");
    };
    const { result, logged } = await capturingErrors(() => sendEnquiryAlert(alert, { env, fetchImpl: failing, now }));
    assert.equal(result, "failed");
    assert.match(logged, /TypeError/);
  });
});
