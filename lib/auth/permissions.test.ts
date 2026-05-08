import { describe, expect, it } from "vitest";
import { canManageApiKeys, canManageBilling } from "./permissions";

describe("auth gating permissions", () => {
  it("allows owners and admins to manage API keys", () => {
    expect(canManageApiKeys("owner")).toBe(true);
    expect(canManageApiKeys("admin")).toBe(true);
    expect(canManageApiKeys("member")).toBe(false);
  });

  it("allows owners and admins to manage billing", () => {
    expect(canManageBilling("owner")).toBe(true);
    expect(canManageBilling("admin")).toBe(true);
    expect(canManageBilling("member")).toBe(false);
  });
});
