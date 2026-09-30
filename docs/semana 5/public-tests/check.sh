#!/usr/bin/env bash
set -euo pipefail
test -e 'src/lib/sync/queue.ts' && test -e 'src/lib/storage/schema.ts' && test -e 'src/lib/sync/conflict-policy.ts' && test -e 'docs/sync-policy.md' && test -e 'tests/sync.spec.ts'
test -f README.md
! rg -n -i '(api[_-]?key|secret|password|token)[[:space:]]*[:=][[:space:]]*"[^"]{8,}"' src public scripts tests package.json next.config.mjs
! rg -n -i "(api[_-]?key|secret|password|token)[[:space:]]*[:=][[:space:]]*'[^']{8,}'" src public scripts tests package.json next.config.mjs
echo PUBLIC_OK

