import { describe, expect, it } from "vitest";
import { canClaim, utcDay, type FlameState } from "./flame";

const ready: FlameState = { status: "ready", flame: 10, claimedOn: null, claiming: false, justGained: null };
const noon = new Date(Date.UTC(2026, 10, 25, 12));

describe("daily flame", () => {
  it("counts days in UTC", () => {
    expect(utcDay(noon)).toBe("2026-11-25");
    expect(utcDay(new Date(Date.UTC(2026, 10, 25, 23, 59)))).toBe("2026-11-25");
  });

  it("can be claimed once per UTC day", () => {
    expect(canClaim(ready, noon)).toBe(true);
    expect(canClaim({ ...ready, claimedOn: "2026-11-24" }, noon)).toBe(true);
    expect(canClaim({ ...ready, claimedOn: "2026-11-25" }, noon)).toBe(false);
  });

  it("can't be claimed before the balance loads or while a claim is on its way", () => {
    expect(canClaim({ ...ready, status: "loading" }, noon)).toBe(false);
    expect(canClaim({ ...ready, status: "off" }, noon)).toBe(false);
    expect(canClaim({ ...ready, claiming: true }, noon)).toBe(false);
  });
});
