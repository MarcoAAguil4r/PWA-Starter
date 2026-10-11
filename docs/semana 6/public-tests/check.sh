#!/usr/bin/env bash
set -euo pipefail
test -e 'src/lib/device/camera.ts' && test -e 'src/lib/device/geolocation.ts' && test -e 'src/lib/notifications/client.ts' && test -e 'docs/capabilities.md' && test -e 'tests/capabilities.spec.ts'
test -f README.md
node scripts/check-secrets.mjs
echo PUBLIC_OK
