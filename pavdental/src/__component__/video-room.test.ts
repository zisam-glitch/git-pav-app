import { callScreenCopy, requestVideoRoom } from "@/features/video/video-room";
import { callErrorMessage } from "@/features/video/call-health";

const reply = (ok: boolean, body: unknown) => async () => ({ ok, json: async () => body });

describe("requestVideoRoom", () => {
  it("returns the room and token the server sends", async () => {
    const out = await requestVideoRoom("a1", reply(true, { url: "https://x.daily.co/r", token: "t" }));
    expect(out).toEqual({ ok: true, room: { url: "https://x.daily.co/r", token: "t" } });
  });

  it("asks for this appointment's room", async () => {
    const post = jest.fn(reply(true, { url: "u", token: "t" }));
    await requestVideoRoom("a1", post);
    expect(post).toHaveBeenCalledWith({ appointmentId: "a1" });
  });

  it("does not ask the server when there is no appointment", async () => {
    const post = jest.fn();
    const out = await requestVideoRoom(undefined, post);
    expect(post).not.toHaveBeenCalled();
    expect(out.ok).toBe(false);
  });

  it("uses the server's own sentence when it sends one, such as 'not let in yet'", async () => {
    const out = await requestVideoRoom("a1", reply(false, { error: "Your clinician hasn't let you in yet." }));
    expect(out).toEqual({ ok: false, message: "Your clinician hasn't let you in yet." });
  });

  it("gives a general sentence when the answer has no room or token", async () => {
    const out = await requestVideoRoom("a1", reply(true, { url: "u" }));
    expect(out).toEqual({ ok: false, message: "We couldn't open the video room. Please try again." });
  });

  it("copes with an answer that is not JSON", async () => {
    const out = await requestVideoRoom("a1", async () => ({ ok: false, json: async () => Promise.reject(new Error("bad")) }));
    expect(out.ok).toBe(false);
  });

  it("says the person seems to be offline when the request throws", async () => {
    const out = await requestVideoRoom("a1", async () => Promise.reject(new TypeError("Network request failed")));
    expect(out).toEqual({ ok: false, message: "You seem to be offline. Check your connection and try again." });
  });
});

describe("callScreenCopy", () => {
  it("covers each state of the screen", () => {
    expect(callScreenCopy({ loading: true, error: null, opened: false }).title).toBe("Opening your room");
    expect(callScreenCopy({ loading: false, error: "Offline", opened: false })).toEqual({ title: "Can't join yet", body: "Offline" });
    expect(callScreenCopy({ loading: false, error: null, opened: true }).title).toBe("You left the call");
    expect(callScreenCopy({ loading: false, error: null, opened: false }).title).toBe("Your clinician is ready");
  });

  it("shows the error rather than 'left the call' when both apply", () => {
    expect(callScreenCopy({ loading: false, error: "Offline", opened: true }).title).toBe("Can't join yet");
  });
});

describe("callErrorMessage", () => {
  it("says the consultation ended when the room has expired or the person was removed", () => {
    for (const raw of ["meeting has ended", "room expired", "ejected by owner"]) {
      expect(callErrorMessage(raw)).toBe("This consultation has ended.");
    }
  });
  it("says video is unavailable for an account or payment problem, without the provider's words", () => {
    expect(callErrorMessage("account payment required")).toBe("Video calls aren't available right now. Please contact the practice.");
  });
  it("tells a lost connection apart", () => {
    expect(callErrorMessage("network error")).toContain("lost its connection");
  });
  it("never passes raw text through", () => {
    expect(callErrorMessage("TypeError: undefined is not an object")).toBe("The video call stopped unexpectedly. Please try again.");
    expect(callErrorMessage(undefined)).toBe("The video call stopped unexpectedly. Please try again.");
  });
});
