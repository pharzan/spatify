#!/usr/bin/env bash

set -euo pipefail

ENV_FILE=${ENV_FILE:-.env}

load_env_file() {
  if [[ -f "$ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
  fi
}

db_url_value() {
  local part="$1"

  if [[ -z "${DATABASE_URL:-}" ]]; then
    echo ""
    return
  fi

  if ! command -v python3 >/dev/null 2>&1; then
    echo ""
    return
  fi

  python3 - "$DATABASE_URL" "$part" <<'PY'
import sys
from urllib.parse import urlparse

if len(sys.argv) < 3:
    sys.exit(0)

raw_url = sys.argv[1]
component = sys.argv[2]

try:
    parsed = urlparse(raw_url)
except ValueError:
    sys.exit(0)

value = ''
if component == 'username':
    value = parsed.username or ''
elif component == 'password':
    value = parsed.password or ''
elif component == 'database':
    value = (parsed.path or '').lstrip('/')
elif component == 'port':
    value = str(parsed.port or '')

sys.stdout.write(value)
PY
}

load_env_file

DB_URL_USER=$(db_url_value "username")
DB_URL_PASSWORD=$(db_url_value "password")
DB_URL_DATABASE=$(db_url_value "database")
DB_URL_PORT=$(db_url_value "port")

CONTAINER_NAME=${CONTAINER_NAME:-spatify-db}
POSTGRES_USER=${POSTGRES_USER:-${DB_URL_USER:-spatify}}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-${DB_URL_PASSWORD:-spatify}}
POSTGRES_DB=${POSTGRES_DB:-${DB_URL_DATABASE:-spatify}}
POSTGRES_PORT=${POSTGRES_PORT:-${DB_URL_PORT:-5432}}
POSTGRES_IMAGE=${POSTGRES_IMAGE:-postgres:16}

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is required to run this script." >&2
    exit 1
  fi
}

connection_string() {
  printf "postgres://%s:%s@localhost:%s/%s\n" \
    "$POSTGRES_USER" \
    "$POSTGRES_PASSWORD" \
    "$POSTGRES_PORT" \
    "$POSTGRES_DB"
}

start_db() {
  if docker ps --format '{{.Names}}' | grep -qw "$CONTAINER_NAME"; then
    echo "Container '$CONTAINER_NAME' is already running."
    return
  fi

  if docker ps -a --format '{{.Names}}' | grep -qw "$CONTAINER_NAME"; then
    echo "Starting existing container '$CONTAINER_NAME'..."
    docker start "$CONTAINER_NAME" >/dev/null
  else
    echo "Creating and starting container '$CONTAINER_NAME'..."
    docker run -d \
      --name "$CONTAINER_NAME" \
      -e POSTGRES_USER="$POSTGRES_USER" \
      -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
      -e POSTGRES_DB="$POSTGRES_DB" \
      -p "$POSTGRES_PORT:5432" \
      "$POSTGRES_IMAGE" >/dev/null
  fi

  echo "PostgreSQL is up. Connection string:"
  connection_string
}

stop_db() {
  if ! docker ps -a --format '{{.Names}}' | grep -qw "$CONTAINER_NAME"; then
    echo "Container '$CONTAINER_NAME' does not exist."
    return
  fi

  echo "Stopping and removing container '$CONTAINER_NAME'..."
  docker rm -f "$CONTAINER_NAME" >/dev/null
  echo "PostgreSQL container removed."
}

usage() {
  cat <<EOF
Usage: $0 [up|down]

  up      Start (or create) the local PostgreSQL container.
  down    Stop and remove the local PostgreSQL container.
EOF
  exit 1
}

main() {
  require_docker

  case "${1:-}" in
    up) start_db ;;
    down) stop_db ;;
    *) usage ;;
  esac
}

main "$@"
