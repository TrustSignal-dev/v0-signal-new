#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

FILES=(
  "$ROOT/README.md"
  "$ROOT/app"
  "$ROOT/components/landing"
)

PATTERNS=(
  "production-ready"
  "zero-knowledge verification"
  "AI fraud scoring"
  "universal verification engine"
  "cryptographic fraud prevention platform"
)

echo "Checking public-facing website messaging for risky terms..."

for pattern in "${PATTERNS[@]}"; do
  if rg -n -i --glob '!**/node_modules/**' --glob '!**/.next/**' "$pattern" "${FILES[@]}"; then
    echo
    echo "Found flagged term: $pattern"
    exit 1
  fi
done

if rg -n -i --glob '!**/node_modules/**' --glob '!**/.next/**' "HIPAA|SOC 2|GDPR" "${FILES[@]}"; then
  echo
  echo "Found unsupported compliance language in public-facing source"
  exit 1
fi

echo "Website messaging guardrail check passed."
