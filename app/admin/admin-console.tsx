"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { AdminApiKey } from "@/lib/admin-data";

type ReceiptLookup = {
  status?: string;
  decision?: string;
  revoked?: boolean;
  anchor?: {
    status?: string;
    txHash?: string;
  };
  receipt?: {
    receiptId?: string;
    createdAt?: string;
  };
} | null;

export function AdminConsole({
  initialKeys,
}: {
  initialKeys: AdminApiKey[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [keys, setKeys] = useState(initialKeys);
  const [error, setError] = useState<string | null>(null);
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [receiptLookup, setReceiptLookup] = useState<ReceiptLookup>(null);

  async function handleLogin(formData: FormData) {
    setError(null);
    const password = String(formData.get("password") ?? "");

    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setError("Invalid admin password.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  async function handleLogout() {
    setError(null);
    await fetch("/api/admin/session", { method: "DELETE" });
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleCreateKey(formData: FormData) {
    setError(null);
    setRawKey(null);
    const name = String(formData.get("name") ?? "").trim();
    const scopes = String(formData.get("scopes") ?? "")
      .split(",")
      .map((scope) => scope.trim())
      .filter(Boolean);

    const response = await fetch("/api/admin/keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, scopes }),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(body.error || "Failed to create API key.");
      return;
    }

    setRawKey(body.rawKey);
    setKeys((current) => [body.created, ...current]);
  }

  async function handleRevokeKey(keyId: string) {
    setError(null);
    const response = await fetch(`/api/admin/keys/${keyId}/revoke`, {
      method: "POST",
    });

    if (!response.ok) {
      setError("Failed to revoke API key.");
      return;
    }

    setKeys((current) =>
      current.map((key) =>
        key.id === keyId ? { ...key, revoked_at: new Date().toISOString() } : key
      )
    );
  }

  async function handleReceiptLookup(formData: FormData) {
    setError(null);
    setReceiptLookup(null);
    const receiptId = String(formData.get("receiptId") ?? "").trim();
    if (!receiptId) {
      setError("Receipt ID is required.");
      return;
    }

    const response = await fetch(`/api/admin/receipts/${encodeURIComponent(receiptId)}`, {
      method: "GET",
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      setError(body?.error || "Receipt lookup failed.");
      return;
    }

    setReceiptLookup(body);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            Founder Console
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Operator dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Create hashed API keys, revoke keys, and inspect receipts against the canonical
            TrustSignal API.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Log out
        </button>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {rawKey ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Raw API key. It is shown once only:
          <div className="mt-2 overflow-x-auto rounded-xl bg-slate-950 px-4 py-3 font-mono text-xs text-emerald-300">
            {rawKey}
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Create API key</h2>
          <form
            action={async (formData) => {
              await handleCreateKey(formData);
            }}
            className="mt-5 space-y-4"
          >
            <label className="block text-sm font-medium text-slate-700">
              Label
              <input
                name="name"
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Pilot key"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Scopes
              <input
                name="scopes"
                defaultValue="verify,read,anchor,revoke"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Create key
            </button>
          </form>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Search receipt</h2>
          <form
            action={async (formData) => {
              await handleReceiptLookup(formData);
            }}
            className="mt-5 space-y-4"
          >
            <label className="block text-sm font-medium text-slate-700">
              Receipt ID
              <input
                name="receiptId"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="uuid"
              />
            </label>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-[#114d3f] px-5 py-3 text-sm font-semibold text-white"
            >
              Fetch receipt
            </button>
          </form>

          {receiptLookup ? (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <div>Status: {receiptLookup.status ?? "unknown"}</div>
              <div>Anchor: {receiptLookup.anchor?.status ?? "unknown"}</div>
              <div>Created: {receiptLookup.receipt?.createdAt ?? "unknown"}</div>
            </div>
          ) : null}
        </section>
      </div>

      <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Issued keys</h2>
            <p className="mt-1 text-sm text-slate-600">
              Prefix and metadata only. Raw secrets are never stored.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="pb-3 pr-4 font-medium">Prefix</th>
                <th className="pb-3 pr-4 font-medium">Label</th>
                <th className="pb-3 pr-4 font-medium">Scopes</th>
                <th className="pb-3 pr-4 font-medium">Created</th>
                <th className="pb-3 pr-4 font-medium">Last used</th>
                <th className="pb-3 pr-4 font-medium">Revoked</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {keys.map((key) => (
                <tr key={key.id}>
                  <td className="py-3 pr-4 font-mono text-xs">{key.key_prefix}</td>
                  <td className="py-3 pr-4">{key.name}</td>
                  <td className="py-3 pr-4">{key.scopes.join(", ")}</td>
                  <td className="py-3 pr-4">{new Date(key.created_at).toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    {key.last_used_at ? new Date(key.last_used_at).toLocaleString() : "Never"}
                  </td>
                  <td className="py-3 pr-4">
                    {key.revoked_at ? new Date(key.revoked_at).toLocaleString() : "Active"}
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      disabled={Boolean(key.revoked_at)}
                      onClick={() => void handleRevokeKey(key.id)}
                      className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function AdminLogin() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-16">
      <div className="w-full rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          TrustSignal Admin
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Founder-only access
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This console creates hashed API keys in Supabase and looks up receipts from the
          canonical API.
        </p>
        <form
          action={async (formData) => {
            setError(null);
            const password = String(formData.get("password") ?? "");
            const response = await fetch("/api/admin/session", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ password }),
            });
            if (!response.ok) {
              setError("Invalid admin password.");
              return;
            }
            router.refresh();
          }}
          className="mt-6 space-y-4"
        >
          <label className="block text-sm font-medium text-slate-700">
            Admin password
            <input
              type="password"
              name="password"
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            />
          </label>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button
            type="submit"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Open admin
          </button>
        </form>
      </div>
    </div>
  );
}
