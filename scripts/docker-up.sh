#!/usr/bin/env zsh
# Kill processes using common dev ports and bring up docker-compose.dev.yml
# Ports we expect to need: 3000 (frontend), 4000 (api), 5432 (postgres default), 6379 (redis), 9000 (minio)
# Note: the compose file maps postgres to host 5433 to avoid clashing; include 5433 too.
PORTS=(3000 4000 5432 5433 6379 9000)

echo "Checking and killing processes on ports: ${PORTS[*]}"
for p in ${PORTS[@]}; do
  pid=$(lsof -ti tcp:${p})
  if [[ -n "$pid" ]]; then
    echo "Killing process on port $p -> PID $pid"
    kill -9 $pid || echo "Failed to kill $pid"
  fi
done

# Start compose
echo "Starting docker compose (detached, build)..."
docker compose -f docker-compose.dev.yml up --build -d

echo "Done. Use 'docker compose -f docker-compose.dev.yml logs -f' to follow logs."
