"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  email: string;
  displayName?: string;
}

type ApiKeyRecord = {
  id: string;
  name: string;
  key_prefix: string;
  last4: string | null;
  scopes: string[];
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  revoked_reason: string | null;
};

type BillingStatus = {
  account_id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

export function ApiKeyGenerator({ email, displayName }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [redirectingBilling, setRedirectingBilling] = useState<"checkout" | "portal" | null>(null);
  const [newPlaintextKey, setNewPlaintextKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const activeKeys = useMemo(
    () => keys.filter((key) => !key.revoked_at),
    [keys],
  );

  useEffect(() => {
    void refreshData();
  }, []);

  async function refreshData() {
    setLoading(true);
    setError(null);

    try {
      const [keysRes, billingRes] = await Promise.all([
        fetch("/api/keys", { cache: "no-store" }),
        fetch("/api/billing/status", { cache: "no-store" }),
      ]);

      const keysData = (await keysRes.json()) as { error?: string; keys?: ApiKeyRecord[] };
      const billingData = (await billingRes.json()) as {
        error?: string;
        billing?: BillingStatus;
      };

      if (!keysRes.ok) {
        setError(keysData.error ?? "Could not load API keys.");
      } else {
        setKeys(keysData.keys ?? []);
      }

      if (billingRes.ok && billingData.billing) {
        setBilling(billingData.billing);
      }
    } catch {
      setError("Could not load account data.");
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    setError(null);
    setCreating(true);
    setNewPlaintextKey(null);

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || `${displayName ?? email} API key`,
          scopes: ["verify:read", "verify:write"],
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Failed to create API key.");
        setCreating(false);
        return;
      }

      const data = (await res.json()) as {
        key?: { plaintext?: string };
      };

      setNewPlaintextKey(data.key?.plaintext ?? null);
      setName("");
      await refreshData();
    } catch {
      setError("Key creation failed.");
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(keyId: string) {
    const reason = window.prompt("Reason for revocation (optional)")?.trim() ?? "";
    const res = await fetch(`/api/keys/${keyId}/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason || undefined }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not revoke API key.");
      return;
    }

    await refreshData();
  }

  async function copyNewestSecret() {
    if (!newPlaintextKey) {
      return;
    }
    await navigator.clipboard.writeText(newPlaintextKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 1800);
  }

  async function redirectToCheckout() {
    setRedirectingBilling("checkout");
    setError(null);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnTo: "/get-your-api-key" }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout.");
        setRedirectingBilling(null);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Could not start checkout.");
      setRedirectingBilling(null);
    }
  }

  async function redirectToPortal() {
    setRedirectingBilling("portal");
    setError(null);

    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not open billing portal.");
        setRedirectingBilling(null);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Could not open billing portal.");
      setRedirectingBilling(null);
    }
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/sign-in");
  }

  if (loading) {
    return (
      <section className="border-t border-foreground/10 bg-foreground/[0.015] py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-12">
          <p className="text-sm text-muted-foreground">Loading account dashboard...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-foreground/10 bg-foreground/[0.015] py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-12">
        <div>
          <span className="mb-6 inline-flex items-center gap-3 font-subtitle text-sm uppercase tracking-[0.18em] text-muted-foreground">
            API Key Dashboard
          </span>
          <h1 className="mb-6 text-4xl font-display tracking-tight lg:text-6xl">
            Manage account API access.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Manage account-scoped API keys and billing. New key secrets are displayed one time only.
          </p>
          <div className="mt-10 space-y-4 text-sm text-muted-foreground">
            <p>Signed in as <strong>{displayName ?? email}</strong>.</p>
            <p>Active keys: <strong>{activeKeys.length}</strong>.</p>
            <p>Billing plan: <strong>{billing?.plan ?? "free"}</strong> ({billing?.status ?? "inactive"}).</p>
            <p>Key material is never stored in plaintext.</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              type="button"
              className="rounded-full"
              onClick={redirectToCheckout}
              disabled={redirectingBilling !== null}
            >
              {redirectingBilling === "checkout" ? "Opening checkout..." : "Upgrade billing"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={redirectToPortal}
              disabled={redirectingBilling !== null}
            >
              {redirectingBilling === "portal" ? "Opening portal..." : "Manage billing"}
            </Button>
            <Button type="button" variant="outline" className="rounded-full" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>

        <div className="border border-foreground/10 bg-background p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)] lg:p-10 space-y-6">
          <label className="block space-y-2">
            <span className="text-sm font-medium">API key name</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-none border-foreground/15"
              placeholder="e.g. Production backend"
            />
          </label>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          {newPlaintextKey ? (
            <div className="space-y-2 rounded-none border border-emerald-600/30 bg-emerald-50 p-4">
              <p className="text-xs font-medium uppercase tracking-widest text-emerald-900">
                New API key (shown once)
              </p>
              <code className="block break-all text-xs text-emerald-950">{newPlaintextKey}</code>
              <Button type="button" variant="outline" className="rounded-full" onClick={copyNewestSecret}>
                {copiedKey ? "Copied" : "Copy key"}
              </Button>
            </div>
          ) : null}

          <Button
            type="button"
            disabled={creating}
            onClick={createKey}
            className="h-12 w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
          >
            {creating ? "Creating API key..." : "Create API key"}
          </Button>

          <div className="border-t border-foreground/10 pt-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Existing keys
            </p>
            <div className="space-y-3">
              {keys.length === 0 ? (
                <p className="text-sm text-muted-foreground">No keys created yet.</p>
              ) : (
                keys.map((key) => (
                  <div key={key.id} className="rounded-none border border-foreground/10 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{key.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {key.key_prefix}••••{key.last4 ?? "----"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(key.created_at).toLocaleString()}
                        </p>
                        {key.revoked_at ? (
                          <p className="text-xs text-amber-700">
                            Revoked {new Date(key.revoked_at).toLocaleString()} ({key.revoked_reason ?? "no reason"})
                          </p>
                        ) : null}
                      </div>
                      {!key.revoked_at ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => revokeKey(key.id)}
                        >
                          Revoke
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
