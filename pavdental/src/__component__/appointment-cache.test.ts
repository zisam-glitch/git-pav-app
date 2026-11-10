import { findInCachedLists } from "@/features/booking/appointment-cache";

describe("findInCachedLists", () => {
  const entries: Array<[unknown, unknown]> = [
    [["my-appointments", { scope: "upcoming" }], [{ id: "a" }]],
    [["my-appointments", undefined], [{ id: "b", status: "confirmed" }, { id: "c" }]],
    [["my-appointments", "detail", "z"], { id: "z" }],
  ];
  const at = (key: unknown) => (Array.isArray(key) && key[1] === undefined ? 1000 : 500);

  it("finds the row in whichever list has it, with when that list was fetched", () => {
    expect(findInCachedLists(entries, at, "b")).toEqual({ row: { id: "b", status: "confirmed" }, updatedAt: 1000 });
    expect(findInCachedLists(entries, at, "a")?.updatedAt).toBe(500);
  });

  it("returns nothing for an unknown id, or no id", () => {
    expect(findInCachedLists(entries, at, "nope")).toBeUndefined();
    expect(findInCachedLists(entries, at, undefined)).toBeUndefined();
  });

  it("ignores cached entries that are not lists, such as another appointment's detail", () => {
    expect(findInCachedLists(entries, at, "z")).toBeUndefined();
  });
});
