#!/usr/bin/env bash
# Start local-dev API (H2 file DB + seeded dinners + loopback JWT).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"
SECRET="${LOCAL_DEV_JWT_SECRET:-local-dev-secret-at-least-32-bytes-ok}"
mkdir -p data
mvn -q -DskipTests package
exec env SPRING_PROFILES_ACTIVE=local-dev LOCAL_DEV_JWT_SECRET="$SECRET" \
  java -jar target/backend-0.1.0-SNAPSHOT.jar
