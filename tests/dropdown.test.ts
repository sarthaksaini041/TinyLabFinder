import assert from "node:assert/strict";
import { test } from "node:test";

interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
  textLabel?: string;
}

type OptionItem<T extends string = string> =
  | DropdownOption<T>
  | T
  | [T, string];

function normalizeOption<T extends string>(item: OptionItem<T>): DropdownOption<T> {
  if (typeof item === "string") {
    return { value: item as T, label: item, textLabel: item };
  }
  if (Array.isArray(item)) {
    return { value: item[0], label: item[1], textLabel: String(item[1]) };
  }
  return {
    ...item,
    textLabel:
      item.textLabel ??
      (typeof item.label === "string" ? item.label : String(item.value)),
  };
}

test("DropdownOption normalization handles strings, tuples, and objects", () => {
  const o1 = normalizeOption("newest");
  assert.deepEqual(o1, { value: "newest", label: "newest", textLabel: "newest" });

  const o2 = normalizeOption(["oldest", "Oldest (cheapest) first"]);
  assert.deepEqual(o2, { value: "oldest", label: "Oldest (cheapest) first", textLabel: "Oldest (cheapest) first" });

  const o3 = normalizeOption({ value: "threads", label: "Most CPU threads", disabled: true });
  assert.deepEqual(o3, { value: "threads", label: "Most CPU threads", disabled: true, textLabel: "Most CPU threads" });
});

test("Sort options match finder expected values", () => {
  type Sort = "newest" | "oldest" | "threads" | "drives";
  const SORT_OPTIONS: { value: Sort; label: string }[] = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest (cheapest) first" },
    { value: "threads", label: "Most CPU threads" },
    { value: "drives", label: "Most drive bays" },
  ];

  const normalized = SORT_OPTIONS.map((opt) => normalizeOption<Sort>(opt));
  assert.equal(normalized.length, 4);
  assert.equal(normalized[0].value, "newest");
  assert.equal(normalized[1].value, "oldest");
  assert.equal(normalized[2].value, "threads");
  assert.equal(normalized[3].value, "drives");
});
