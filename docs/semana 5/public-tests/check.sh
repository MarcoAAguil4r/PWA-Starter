#!/usr/bin/env bash
set -euo pipefail
test -e 'src/lib/sync/queue.ts' && test -e 'src/lib/storage/schema.ts' && test -e 'src/lib/sync/conflict-policy.ts' && test -e 'docs/sync-policy.md' && test -e 'tests/sync.spec.ts'
test -e 'src/lib/storage/inspection-store.ts' && test -e 'src/lib/sync/synthetic-server.ts' && test -e 'src/lib/sync/synthetic-transport.ts' && test -e 'src/app/api/inspections/sync/route.ts' && test -e 'src/components/inspection-workspace.tsx'
test -f README.md
node scripts/check-secrets.mjs
echo PUBLIC_OK

