#!/usr/bin/env bash
# Runs a command; if it fails, repeats its last 25 output lines as error
# annotations so the reason shows on the run's summary page.
# Usage: .github/scripts/run.sh "<title>" <command> [args...]
title="$1"; shift
log="$(mktemp)"
if "$@" 2>&1 | tee "$log"; [ "${PIPESTATUS[0]}" -eq 0 ]; then
  exit 0
fi
tail -n 25 "$log" | sed 's/%/%25/g' | while IFS= read -r line; do
  [ -n "$line" ] && echo "::error title=$title::$line"
done
exit 1
