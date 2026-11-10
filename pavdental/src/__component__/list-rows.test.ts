import { buildGroupedRows } from "@/lib/list-rows";

describe("buildGroupedRows", () => {
  it("puts a heading before each group's items and leaves out empty groups", () => {
    const rows = buildGroupedRows([
      { key: "active", title: "Active", items: [{ id: "1" }, { id: "2" }] },
      { key: "past", title: "Past courses", items: [] },
    ]);
    expect(rows.map((r) => r.kind)).toEqual(["heading", "item", "item"]);
    expect(rows[0]).toMatchObject({ title: "Active" });
  });

  it("keeps keys unique when the same id is in two groups", () => {
    const rows = buildGroupedRows([
      { key: "a", title: "A", items: [{ id: "x" }] },
      { key: "b", title: "B", items: [{ id: "x" }] },
    ]);
    expect(new Set(rows.map((r) => r.key)).size).toBe(rows.length);
  });

  it("returns nothing when every group is empty", () => {
    expect(buildGroupedRows([{ key: "a", title: "A", items: [] }])).toEqual([]);
  });
});
