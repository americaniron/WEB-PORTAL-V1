# Release Checklist for American Iron Hub Pro

## Pre-Deployment Checklist

### 1. Code Quality & Security

- [ ] Run dependency audit
  ```bash
  npm audit --audit-level=moderate
  ```
  
- [ ] Run security scans
  ```bash
  # Check for exposed secrets
  git secrets --scan
  # Or use trufflehog
  trufflehog git file://. --since-commit HEAD~10
  ```

- [ ] Type check passes
  ```bash
  npm run type-check
  ```

- [ ] Lint check passes
  ```bash
  npm run lint
  ```

- [ ] No hardcoded secrets in code
  ```bash
  grep -r "apikey\|api_key\|password\|secret" --include="*.ts" --include="*.tsx" .
  ```

### 2. Environment Configuration

- [ ] `.env.production` created with all required variables
- [ ] All secrets rotated and unique for production
  ```bash
  # Generate new secrets
  openssl rand -base64 32  # SESSION_SECRET
  openssl rand -base64 64  # JWT_SECRET
  ```

- [ ] Database credentials configured
- [ ] API keys configured (GEMINI_API_KEY)
- [ ] Public URL configured correctly
- [ ] Cloudflare settings configured if applicable

### 3. Build & Test

- [ ] Production build succeeds
  ```bash
  npm run build:production
  ```
  **Expected**: Build completes without errors, `dist/` directory created

- [ ] Build artifacts verified
  ```bash
  ls -lh dist/
  ```
  **Expected**: Optimized JS/CSS files with hashes, index.html present

- [ ] Docker build succeeds (if using Docker)
  ```bash
  docker build -t american-iron-hub-pro:test .
  ```
  **Expected**: Build completes, image size < 500MB

### 4. Database Setup

- [ ] Database created
  ```bash
  createdb american_iron_portal
  # Or verify existing database
  psql -d american_iron_portal -c "SELECT version();"
  ```

- [ ] Database initialization successful
  ```bash
  npm run db:init
  ```
  **Expected**: Tables created, no errors

- [ ] Database migrations applied
  ```bash
  npm run db:migrate
  ```
  **Expected**: Migrations complete successfully

- [ ] Database connection pooling configured
  ```env
  DB_POOL_MIN=2
  DB_POOL_MAX=10
  ```

- [ ] Database backup strategy in place
  ```bash
  # Test backup
  pg_dump american_iron_portal > backup_$(date +%Y%m%d).sql
  ```

### 5. Health Checks & Endpoints

- [ ] Start server successfully
  ```bash
  NODE_ENV=production npm run server:prod
  ```
  **Expected**: Server starts on configured port

- [ ] Health endpoint responds
  ```bash
  curl -i http://localhost:3000/health
  ```
  **Expected Response**:
  ```
  HTTP/1.1 200 OK
  Content-Type: application/json
  
  {"status":"healthy","timestamp":"...","uptime":...}
  ```

- [ ] Ready endpoint responds with database connectivity
  ```bash
  curl -i http://localhost:3000/ready
  ```
  **Expected Response**:
  ```
  HTTP/1.1 200 OK
  
  {"status":"healthy","checks":{"database":{"status":"pass",...}}}
  ```

- [ ] Security headers present
  ```bash
  curl -I http://localhost:3000/
  ```
  **Expected Headers**:
  - `Content-Security-Policy`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security` (when HTTPS)

### 6. Cloudflare Compatibility (if applicable)

- [ ] Proxy trust enabled
  ```env
  TRUST_PROXY=true
  CLOUDFLARE_ENABLED=true
  ```

- [ ] Real IP extraction working
  ```bash
  # Test with CF-Connecting-IP header
  curl -H "CF-Connecting-IP: 1.2.3.4" http://localhost:3000/health
  ```

- [ ] HTTPS redirect working (behind Cloudflare)
  ```bash
  # Test with X-Forwarded-Proto
  curl -H "X-Forwarded-Proto: https" -I http://localhost:3000/
  ```

- [ ] Cloudflare SSL mode set to "Full (strict)"
- [ ] Cloudflare caching rules configured for static assets

### 7. Performance & Load Testing

- [ ] Response time acceptable
  ```bash
  curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/health
  ```
  **Expected**: < 100ms for health endpoint

- [ ] Compression enabled
  ```bash
  curl -H "Accept-Encoding: gzip" -I http://localhost:3000/
  ```
  **Expected**: `Content-Encoding: gzip` header present

- [ ] Static assets cached
  ```bash
  curl -I http://localhost:3000/assets/index-[hash].js
  ```
  **Expected**: `Cache-Control: public, max-age=31536000`

- [ ] Database connection pool healthy
  ```bash
  curl http://localhost:3000/status | jq '.database'
  ```
  **Expected**: Active connections within limits

### 8. Security Verification

- [ ] Rate limiting functional
  ```bash
  # Make 10 rapid requests
  for i in {1..10}; do curl http://localhost:3000/api/test; done
  ```
  **Expected**: 429 Too Many Requests after threshold

- [ ] CORS policy correct
  ```bash
  curl -H "Origin: https://evil.com" -I http://localhost:3000/api/
  ```
  **Expected**: No Access-Control-Allow-Origin for unauthorized origins

- [ ] Input sanitization working
  ```bash
  # Test XSS protection
  curl -X POST http://localhost:3000/api/test \
    -H "Content-Type: application/json" \
    -d '{"test":"<script>alert(1)</script>"}'
  ```
  **Expected**: Script tags removed/escaped

- [ ] SQL injection protection verified
  - All queries use parameterized statements
  - No string concatenation in SQL

- [ ] Authentication endpoints rate-limited
  ```bash
  # Test auth rate limit (stricter)
  for i in {1..6}; do 
    curl -X POST http://localhost:3000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"test@test.com","password":"wrong"}'; 
  done
  ```
  **Expected**: 429 after 5 attempts

### 9. Monitoring & Logging

- [ ] Structured logging enabled
  ```bash
  # Check logs are JSON formatted
  NODE_ENV=production npm run server:prod 2>&1 | head -n 5
  ```
  **Expected**: JSON formatted log entries

- [ ] Log level appropriate for production
  ```env
  LOG_LEVEL=info  # Not debug
  ```

- [ ] No secrets in logs
  ```bash
  # Generate some logs, then check
  grep -i "password\|secret\|token" logs/*.log
  ```
  **Expected**: All sensitive values marked as `[REDACTED]`

- [ ] Error tracking configured (optional: Sentry, etc.)

### 10. Documentation

- [ ] README.md updated with production deployment steps
- [ ] SECURITY.md created with security policy
- [ ] .env.example updated with all variables
- [ ] Release notes prepared
- [ ] Runbook created for operations team

### 11. Backup & Recovery

- [ ] Database backup tested
  ```bash
  pg_dump american_iron_portal > backup.sql
  psql -d american_iron_portal_test < backup.sql
  ```

- [ ] Backup retention policy defined
- [ ] Recovery procedure documented and tested
- [ ] Disaster recovery plan in place

### 12. Access Control

- [ ] Production environment variables secured
- [ ] Database access restricted to application only
- [ ] Firewall rules configured
- [ ] SSH access restricted (key-based only)
- [ ] Admin users documented
- [ ] API keys rotated

## Deployment Commands

### Quick Deploy (Docker Compose)

```bash
# 1. Pull latest code
git pull origin main

# 2. Review and update .env.production
nano .env.production

# 3. Build and deploy
docker-compose down
docker-compose build
docker-compose up -d

# 4. Verify
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

### Manual Deploy

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm ci --production

# 3. Build frontend
npm run build:production

# 4. Run database migrations
npm run db:migrate

# 5. Restart server
pm2 restart american-iron-hub-pro
# Or with systemd:
sudo systemctl restart american-iron-hub-pro

# 6. Verify
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

## Post-Deployment Verification

- [ ] Application accessible via public URL
- [ ] Health checks passing
- [ ] Database connectivity confirmed
- [ ] Authentication working
- [ ] Key user flows tested
- [ ] Monitoring dashboards show green status
- [ ] Error rates normal
- [ ] Response times acceptable

## Rollback Plan

If deployment fails:

```bash
# Docker
docker-compose down
docker-compose up -d --build <previous-tag>

# Manual
git checkout <previous-release-tag>
npm ci --production
npm run build:production
pm2 restart american-iron-hub-pro

# Database rollback (if needed)
psql -d american_iron_portal < backup_before_deployment.sql
```

## Audit Trail

| Check | Command | Expected Output | Status | Notes |
|-------|---------|-----------------|--------|-------|
| npm audit | `npm audit --production` | 0 vulnerabilities | ⬜ | |
| Build | `npm run build:production` | Success | ⬜ | |
| Health | `curl /health` | HTTP 200 | ⬜ | |
| Ready | `curl /ready` | HTTP 200 + DB check pass | ⬜ | |
| Security Headers | `curl -I /` | All headers present | ⬜ | |
| Rate Limit | Rapid requests | 429 after threshold | ⬜ | |
| Logs | Check format | JSON structured | ⬜ | |
| Database | Connection test | Success | ⬜ | |
| Cloudflare | IP extraction | Real IP logged | ⬜ | |

## Sign-off

**Deployment Date**: __________________

**Deployed By**: __________________

**Reviewed By**: __________________

**Production URL**: __________________

**Notes**:
___________________________________________________________________
___________________________________________________________________
___________________________________________________________________

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-08
