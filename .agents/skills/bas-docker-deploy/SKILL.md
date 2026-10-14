---
name: bas-docker-deploy
description: Deploy Buddhist Art MFU (BAS) to the MFU Beta Docker host (192.168.11.90) under bas.beta.mfu.ac.th. Supports container builds, docker-compose.production.yml execution, health check verification, and reverse proxy validation. WHEN: "deploy bas", "deploy buddhist art", "deploy to beta", "bas-deploy", "bas docker deploy".
---

# BAS Docker Deploy (Buddhist Art MFU Deployment Skill)

Standardized release and deployment guide for **Buddhist Art MFU (BAS)** at Mae Fah Luang University.

---

## 1. Hosting & Infrastructure Architecture

| Parameter | Value | Description |
| :--- | :--- | :--- |
| **Target Host** | `192.168.11.90` | MFU Internal Beta / UAT Server |
| **Public Hostname** | `https://bas.beta.mfu.ac.th` | TLS terminated by Host Nginx |
| **Published Loopback Port** | `8082:80` (`127.0.0.1:8082`) | Bound to Frontend Nginx container |
| **Backend Service** | Port `8081` (internal network `buddhist-art-network`) | Express Node.js application |
| **Database** | MongoDB Atlas or Local Replica Set | Configured via `.env.production` |
| **Compose File** | `docker-compose.production.yml` | Production multi-container definition |
| **SSH User** | `uatenv@192.168.11.90` | Internal server SSH access |

---

## 2. Pre-Deployment Health Verification

Before deploying or redeploying:
1. Ensure `backend` tests pass:
   ```bash
   cd backend && pnpm test
   ```
2. Ensure `frontend` builds cleanly:
   ```bash
   cd frontend && npm run build
   ```
3. Verify environment variables in `.env.production` or `.env`.

---

## 3. Deployment Protocol

Execute compose release using `docker-compose.production.yml`:

```bash
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d --remove-orphans
```

### Healthcheck Endpoints:
- **Backend Health:** `http://127.0.0.1:8081/healthz` (Status: 200 OK)
- **Frontend Health:** `http://127.0.0.1:8082/` (Status: 200 OK)
- **Domain Verification:** `https://bas.beta.mfu.ac.th/`

---

## 4. Rollback & Troubleshooting

- Inspect backend container logs:
  ```bash
  docker compose -f docker-compose.production.yml logs -f --tail=100 backend
  ```
- Inspect frontend container logs:
  ```bash
  docker compose -f docker-compose.production.yml logs -f --tail=100 frontend
  ```
- If container fails to start, verify environment file permissions and MongoDB connection strings.
