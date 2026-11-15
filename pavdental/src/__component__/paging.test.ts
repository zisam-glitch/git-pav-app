import { nextOffset, flattenPages, uniqueById } from "@/lib/paging";

describe("nextOffset", () => {
  it("asks for the next page when the last one was full", () => {
    expect(nextOffset(new Array(50).fill({}), 50, 50)).toBe(50);
    expect(nextOffset(new Array(50).fill({}), 100, 50)).toBe(100);
  });
  it("stops when the last page was short or empty", () => {
    expect(nextOffset(new Array(12).fill({}), 62, 50)).toBeUndefined();
    expect(nextOffset([], 50, 50)).toBeUndefined();
  });
  it("stops when the server sent something that is not a list", () => {
    expect(nextOffset({ error: "x" }, 0, 50)).toBeUndefined();
    expect(nextOffset(undefined, 0, 50)).toBeUndefined();
  });
});

describe("flattenPages", () => {
  it("joins pages in order", () => {
    expect(flattenPages<number>([[1, 2], [3]])).toEqual([1, 2, 3]);
  });
  it("skips a page that is not a list, and copes with none", () => {
    expect(flattenPages<number>([[1], null, { a: 1 }, [2]])).toEqual([1, 2]);
    expect(flattenPages(undefined)).toEqual([]);
  });
});

describe("uniqueById", () => {
  it("keeps the first of a repeated id, so a shifted page does not show a row twice", () => {
    expect(uniqueById([{ id: "a", n: 1 }, { id: "b", n: 2 }, { id: "a", n: 3 }])).toEqual([
      { id: "a", n: 1 },
      { id: "b", n: 2 },
    ]);
  });
});
