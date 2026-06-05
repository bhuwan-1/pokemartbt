#!/usr/bin/env bash
# Verify the RLS posture with ONLY the anon key (SPEC.md §14 security criteria).
# Usage: ./scripts/verify-rls.sh   (reads VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY from .env)
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -f .env ]]; then
  set -a; source .env; set +a
fi

URL="${VITE_SUPABASE_URL:-}"
KEY="${VITE_SUPABASE_ANON_KEY:-}"

if [[ -z "$URL" || -z "$KEY" ]]; then
  echo "ERROR: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set (populate .env first)." >&2
  exit 1
fi

AUTH=(-H "apikey: $KEY" -H "Authorization: Bearer $KEY")
PASS=0
FAIL=0

check() { # <description> <actual_status> <expected_pattern (extended regex)>
  local desc="$1" status="$2" expected="$3"
  if [[ "$status" =~ $expected ]]; then
    echo "PASS  $desc (HTTP $status)"
    PASS=$((PASS + 1))
  else
    echo "FAIL  $desc — got HTTP $status, expected $expected"
    FAIL=$((FAIL + 1))
  fi
}

echo "== anon writes on products must be rejected =="

status=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$URL/rest/v1/products" \
  "${AUTH[@]}" -H "Content-Type: application/json" \
  -d '{"product_type":"sealed","name":"rls-probe","condition":"SEALED","price":1}')
check "INSERT rejected" "$status" '^(401|403)$'

status=$(curl -s -o /dev/null -w '%{http_code}' -X PATCH \
  "$URL/rest/v1/products?name=eq.rls-probe" \
  "${AUTH[@]}" -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d '{"price":0}')
body=$(curl -s -X PATCH "$URL/rest/v1/products?name=eq.rls-probe" \
  "${AUTH[@]}" -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d '{"price":0}')
# RLS silently matches 0 rows for UPDATE/DELETE: 2xx with an empty result is also a pass.
if [[ "$status" =~ ^(401|403)$ || "$body" == "[]" ]]; then
  echo "PASS  UPDATE rejected or affects 0 rows (HTTP $status, body $body)"
  PASS=$((PASS + 1))
else
  echo "FAIL  UPDATE — HTTP $status, body: $body"
  FAIL=$((FAIL + 1))
fi

body=$(curl -s -X DELETE "$URL/rest/v1/products?name=eq.rls-probe" \
  "${AUTH[@]}" -H "Prefer: return=representation")
if [[ "$body" == "[]" || "$body" == *'"code"'* ]]; then
  echo "PASS  DELETE rejected or affects 0 rows (body $body)"
  PASS=$((PASS + 1))
else
  echo "FAIL  DELETE — body: $body"
  FAIL=$((FAIL + 1))
fi

echo "== anon must not see inactive rows =="
body=$(curl -s "$URL/rest/v1/products?is_active=eq.false&select=id" "${AUTH[@]}")
if [[ "$body" == "[]" ]]; then
  echo "PASS  inactive rows invisible to anon"
  PASS=$((PASS + 1))
else
  echo "FAIL  anon can read inactive rows: $body"
  FAIL=$((FAIL + 1))
fi

echo "== anon uploads to product-images must be rejected =="
status=$(curl -s -o /dev/null -w '%{http_code}' -X POST \
  "$URL/storage/v1/object/product-images/rls-probe.txt" \
  "${AUTH[@]}" -H "Content-Type: text/plain" -d 'probe')
check "storage upload rejected" "$status" '^(400|401|403)$'

echo
echo "$PASS passed, $FAIL failed"
[[ $FAIL -eq 0 ]]
