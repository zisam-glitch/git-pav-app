import { queryKeys } from "@/lib/query-keys";

describe("queryKeys (B2)", () => {
  it("produces prefix-compatible keys for appointments, messages, and van tracking", () => {
    expect(queryKeys.appointments.list({ scope: "upcoming" })[0]).toBe(queryKeys.appointments.all()[0]);
    expect(queryKeys.appointments.detail("a1")[0]).toBe(queryKeys.appointments.all()[0]);
    expect(queryKeys.slots.list({ date: "2026-11-15" })[0]).toBe(queryKeys.slots.all()[0]);
    expect(queryKeys.messages.threads("summary")[0]).toBe(queryKeys.messages.all()[0]);
    expect(queryKeys.messages.thread("t1")[0]).toBe(queryKeys.messages.all()[0]);
    expect(queryKeys.van.liveRequest("r1")[0]).toBe(queryKeys.van.liveRequestAll()[0]);
    expect(queryKeys.van.operatorShift()).toEqual(["operator-shift"]);
  });
});
