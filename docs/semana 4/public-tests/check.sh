#!/usr/bin/env bash
set -euo pipefail
test -e 'src/app/inspecciones/page.tsx' && test -e 'src/app/inspecciones/[id]/page.tsx' && test -e 'src/app/inspecciones/error.tsx' && test -e 'src/app/inspecciones/[id]/error.tsx' && test -e 'src/components/loading-state.tsx' && test -e 'scripts/measure-rendering.mjs' && test -e 'docs/rendering-decision.md' && test -e 'tests/rendering.spec.ts'
test -f README.md
! rg -n -i '(api[_-]?key|secret|password|token)[[:space:]]*[:=][[:space:]]*"[^"]{8,}"' src public scripts tests package.json next.config.mjs
! rg -n -i "(api[_-]?key|secret|password|token)[[:space:]]*[:=][[:space:]]*'[^']{8,}'" src public scripts tests package.json next.config.mjs
echo PUBLIC_OK

