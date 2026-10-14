#!/usr/bin/env bash
set -euo pipefail

DEPLOY_HOST="${DEPLOY_HOST:-192.168.11.90}"
DEPLOY_USER="${DEPLOY_USER:-uatenv}"
DEPLOY_SSH_KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/pts_gitlab_deploy}"
DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-22}"
PUBLISHED_PORT="${PUBLISHED_PORT:-8082}"
PUBLIC_DOMAIN="${PUBLIC_DOMAIN:-bas.beta.mfu.ac.th}"

RELEASE_SHA="$(git rev-parse --short HEAD)"
REMOTE_BASE="/opt/buddhist-art-mfu"
REMOTE_RELEASE_DIR="${REMOTE_BASE}/releases/${RELEASE_SHA}"

echo "=========================================="
echo " Buddhist Art MFU (BAS) Deployment"
echo " Target Host:   ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_SSH_PORT}"
echo " Release SHA:   ${RELEASE_SHA}"
echo " Remote Dir:    ${REMOTE_RELEASE_DIR}"
echo " Domain:        https://${PUBLIC_DOMAIN}"
echo "=========================================="

ssh_command=(ssh -i "$DEPLOY_SSH_KEY" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -p "$DEPLOY_SSH_PORT")

echo "--> Step 1: Pre-flight check on remote host..."
"${ssh_command[@]}" "${DEPLOY_USER}@${DEPLOY_HOST}" "mkdir -p '${REMOTE_RELEASE_DIR}'"

echo "--> Step 2: Syncing application source to remote release directory..."
rsync -az --delete \
  --exclude='.git' \
  --exclude='.agents' \
  --exclude='node_modules' \
  --exclude='*/node_modules' \
  --exclude='frontend/dist' \
  --exclude='.env*' \
  --exclude='.DS_Store' \
  --exclude='*/.DS_Store' \
  --exclude='backend/tmp' \
  --exclude='backend/coverage' \
  --exclude='frontend/coverage' \
  --exclude='screenshots' \
  --exclude='*.swp' \
  -e "${ssh_command[*]}" \
  ./ "${DEPLOY_USER}@${DEPLOY_HOST}:${REMOTE_RELEASE_DIR}/"

echo "--> Step 3: Copying production environment configuration..."
scp -i "$DEPLOY_SSH_KEY" -P "$DEPLOY_SSH_PORT" .env.production "${DEPLOY_USER}@${DEPLOY_HOST}:${REMOTE_RELEASE_DIR}/.env.production"
"${ssh_command[@]}" "${DEPLOY_USER}@${DEPLOY_HOST}" "cp '${REMOTE_RELEASE_DIR}/.env.production' '${REMOTE_BASE}/.env.production'"

echo "--> Step 4: Building and launching Docker Compose on remote host..."
"${ssh_command[@]}" "${DEPLOY_USER}@${DEPLOY_HOST}" bash -s -- "$RELEASE_SHA" "$REMOTE_RELEASE_DIR" "$DEPLOY_HOST" "$PUBLISHED_PORT" "$PUBLIC_DOMAIN" <<'REMOTE'
set -euo pipefail
release_sha="$1"
release_dir="$2"
deploy_host="$3"
published_port="$4"
public_domain="$5"

cd "$release_dir"
test -f .env.production

echo "Validating compose config..."
docker compose -p buddhist-art -f docker-compose.production.yml config --quiet

echo "Building images for release ${release_sha}..."
docker compose -p buddhist-art -f docker-compose.production.yml build --pull

echo "Bringing up containers..."
docker compose -p buddhist-art -f docker-compose.production.yml up -d --remove-orphans

echo "Waiting for services to become healthy..."
docker compose -p buddhist-art -f docker-compose.production.yml ps

backend_ready=false
for attempt in $(seq 1 30); do
  status=$(docker inspect buddhist-art-backend-1 --format '{{.State.Health.Status}}' 2>/dev/null || echo "starting")
  if [[ "$status" == "healthy" ]]; then
    backend_ready=true
    echo "Backend is healthy!"
    break
  fi
  echo "Attempt $attempt/30: Backend health is '$status', waiting..."
  sleep 2
done

if [[ "$backend_ready" != true ]]; then
  echo "Backend failed to become healthy. Logs:"
  docker compose -p buddhist-art -f docker-compose.production.yml logs --tail=50 backend
  exit 1
fi

frontend_ready=false
for attempt in $(seq 1 20); do
  status=$(docker inspect buddhist-art-frontend-1 --format '{{.State.Health.Status}}' 2>/dev/null || echo "starting")
  if [[ "$status" == "healthy" ]]; then
    frontend_ready=true
    echo "Frontend is healthy!"
    break
  fi
  echo "Attempt $attempt/20: Frontend health is '$status', waiting..."
  sleep 2
done

if [[ "$frontend_ready" != true ]]; then
  echo "Frontend failed to become healthy. Logs:"
  docker compose -p buddhist-art -f docker-compose.production.yml logs --tail=50 frontend
  exit 1
fi

echo "Verifying local loopback HTTP endpoint (http://${deploy_host}:${published_port})..."
curl -fsSI "http://${deploy_host}:${published_port}" | head -n 1

echo "Remote deployment completed successfully."
REMOTE

echo "--> Step 5: Multi-layer Verification..."
echo "Verifying published host port (${DEPLOY_HOST}:${PUBLISHED_PORT})..."
curl -fsSI "http://${DEPLOY_HOST}:${PUBLISHED_PORT}" | head -n 5

echo "Verifying public HTTPS endpoint (https://${PUBLIC_DOMAIN})..."
curl -skI "https://${PUBLIC_DOMAIN}" | head -n 5

echo "Verifying backend API health through Nginx proxy..."
curl -skI "https://${PUBLIC_DOMAIN}/api/v1/submission" | head -n 5 || true

echo "=========================================="
echo " Deployment SUCCESSFUL for release ${RELEASE_SHA}!"
echo " URL: https://${PUBLIC_DOMAIN}"
echo "=========================================="
