'use client';

import { useState, useTransition } from 'react';
import { createApiKey, listApiKeys, revokeApiKey, type CustomerApiKey } from '@/lib/customer-data';

export function CustomerDashboard({ user }: { user: { id: string; email: string } }) {
  const [keys, setKeys] = useState<CustomerApiKey[]>([]);
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  const [keyName, setKeyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleLoadKeys() {
    startTransition(async () => {
      const result = await listApiKeys();
      if ('error' in result) {
        setError(result.error);
      } else {
        setKeys(result.keys);
        setLoaded(true);
      }
    });
  }

  function handleCreateKey(formData: FormData) {
    const name = (formData.get('keyName') as string)?.trim();
    if (!name) return;
    startTransition(async () => {
      const result = await createApiKey(name);
      if ('error' in result) {
        setError(result.error);
      } else {
        setNewKeySecret(result.secret);
        setKeyName('');
        handleLoadKeys();
      }
    });
  }

  function handleRevokeKey(keyId: string) {
    startTransition(async () => {
      const result = await revokeApiKey(keyId);
      if ('error' in result) {
        setError(result.error);
      } else {
        setKeys((prev) => prev.map((k) => k.id === keyId ? { ...k, revoked_at: new Date().toISOString() } : k));
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">API Keys</h1>
          <p className="mt-1 text-sm text-slate-600">{user.email}</p>
        </div>
        <form action="/auth/sign-out" method="post">
          <button
            type="submit"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </form>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {newKeySecret ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm space-y-2">
          <p className="font-semibold text-emerald-800">New API key created — copy it now, it will not be shown again.</p>
          <code className="block break-all rounded bg-emerald-100 px-3 py-2 font-mono text-xs text-emerald-900">
            {newKeySecret}
          </code>
          <button
            type="button"
            onClick={() => setNewKeySecret(null)}
            className="text-xs text-emerald-700 underline"
          >
            I&apos;ve saved it
          </button>
        </div>
      ) : null}

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold">Create API key</h2>
        <form action={handleCreateKey} className="mt-4 flex gap-3">
          <input
            name="keyName"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="Key name (e.g. CI pipeline)"
            className="flex-1 rounded-2xl border border-slate-300 px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={isPending || !keyName.trim()}
            className="rounded-full bg-[#114d3f] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Create
          </button>
        </form>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Your keys</h2>
          <button
            type="button"
            onClick={handleLoadKeys}
            disabled={isPending}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            {loaded ? 'Refresh' : 'Load keys'}
          </button>
        </div>

        {loaded && keys.length === 0 ? (
          <p className="text-sm text-slate-500">No active keys yet. Create one above.</p>
        ) : null}

        {keys.map((key) => (
          <div
            key={key.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 mt-2"
          >
            <div className="min-w-0">
              <p className="font-medium text-sm text-slate-900">{key.name}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{key.key_prefix}…</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {key.revoked_at
                  ? `Revoked ${new Date(key.revoked_at).toLocaleDateString()}`
                  : `Created ${new Date(key.created_at).toLocaleDateString()}`}
              </p>
            </div>
            {!key.revoked_at ? (
              <button
                type="button"
                onClick={() => handleRevokeKey(key.id)}
                disabled={isPending}
                className="shrink-0 rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Revoke
              </button>
            ) : (
              <span className="shrink-0 rounded-full bg-slate-200 px-3 py-1.5 text-xs text-slate-500">
                Revoked
              </span>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
