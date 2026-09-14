#!/usr/bin/env bash
set -euo pipefail

test -e 'public/manifest.webmanifest' && test -e 'src/app/layout.tsx' && test -e 'src/app/page.tsx' && test -e 'src/components/app-shell.tsx' && test -e 'tests/manifest.spec.ts'
test -f README.md
! rg -n -i '(api[_-]?key|secret|password|token)\s*[:=]' \
	--glob '!public-tests/check.sh' \
	--glob '!docs/**' \
	--glob '!reports/**' \
	--glob '!node_modules/**' \
	--glob '!.next/**' \
	--glob '!package-lock.json' \
	.
echo PUBLIC_OK

