"use client";

import { useEffect, useState } from "react";
import { ApiKeyGenerator } from "@/components/api-key-generator";

type UserInfo = {
  email: string;
  displayName?: string;
};

export default function ApiKeysSection() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: { email?: string; displayName?: string }) => {
        setUser({
          email: data.email ?? "",
          displayName: data.displayName ?? undefined,
        });
      })
      .catch(() => setUser({ email: "" }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-500 text-sm tracking-widest">
        LOADING CREDENTIALS...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-6">
      <ApiKeyGenerator email={user.email} displayName={user.displayName} />
    </div>
  );
}
