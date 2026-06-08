import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/(identity)/sign-out/route";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

function request(origin?: string) {
  return new NextRequest("https://app.example/sign-out", {
    method: "POST",
    headers: origin ? { origin } : undefined,
  });
}

describe("sign-out route", () => {
  it("rejects cross-origin POST attempts before touching auth", async () => {
    const signOut = vi.fn();
    mocks.createClient.mockResolvedValue({ auth: { signOut } });

    const response = await POST(request("https://evil.example"));

    expect(response.status).toBe(403);
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();
  });

  it("allows same-origin POST sign-out", async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });
    mocks.createClient.mockResolvedValue({ auth: { signOut } });

    const response = await POST(request("https://app.example"));

    expect(signOut).toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://app.example/");
  });
});
