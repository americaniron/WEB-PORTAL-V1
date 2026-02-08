<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# American Iron Hub Pro

Enterprise industrial management terminal for global logistics and stockpile operations.

[![CI/CD Pipeline](https://github.com/americaniron/WEB-PORTAL-V1/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/americaniron/WEB-PORTAL-V1/actions)
[![Security](https://img.shields.io/badge/security-hardened-green.svg)](./SECURITY.md)

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Cloudflare Integration](#cloudflare-integration)
- [Security](#security)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **Enterprise Management**: Complete CRM, inventory, and project management
- **AI-Powered Insights**: Integrated with Google Generative AI (Gemini)
- **Real-time Operations**: Live dashboard with system health monitoring
- **Multi-role Access**: Admin, user, and employee role-based access control
- **Production-Ready**: Hardened security, health checks, and observability
- **Cloudflare Compatible**: Optimized for deployment behind Cloudflare proxy

## 📦 Prerequisites

- **Node.js**: 20.x or higher
- **PostgreSQL**: 14.x or higher (for production)
- **Docker**: Optional, for containerized deployment
- **npm**: 9.x or higher

## 🚀 Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/americaniron/WEB-PORTAL-V1.git
cd WEB-PORTAL-V1
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env.local` file from the example:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set at minimum:

```env
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://localhost:5432/american_iron_portal
```

### 4. Run Development Server

Frontend only (Vite dev server):

```bash
npm run dev
```

Access at: `http://localhost:5173`

## 🏭 Production Deployment

### Option 1: Docker Compose (Recommended)

The easiest way to run the application in a production-like environment:

```bash
# 1. Create .env.local with your secrets
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# 2. Start services
docker-compose up -d

# 3. Check health
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

### Option 2: Manual Deployment

#### Step 1: Environment Configuration

Create `.env.production` with production values:

```bash
cp .env.example .env.production
```

**Critical environment variables to configure:**

```env
NODE_ENV=production
VITE_APP_ENV=production

# Database (REQUIRED)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# API Keys (REQUIRED)
GEMINI_API_KEY=your_production_api_key

# Security (REQUIRED - Generate secure values!)
SESSION_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)

# Server
PORT=3000
HOST=0.0.0.0

# Cloudflare
TRUST_PROXY=true
CLOUDFLARE_ENABLED=true

# Public URL
VITE_PUBLIC_URL=https://portal.americaniron.com
```

#### Step 2: Install Production Dependencies

```bash
npm ci --production
```

#### Step 3: Build Frontend

```bash
npm run build:production
```

This creates optimized production build in `dist/` directory.

#### Step 4: Initialize Database

```bash
# Create database
createdb american_iron_portal

# Run initialization script
npm run db:init
```

#### Step 5: Start Production Server

```bash
NODE_ENV=production npm run server:prod
```

#### Step 6: Verify Deployment

```bash
# Health check (should return 200)
curl http://localhost:3000/health

# Readiness check (should return 200 with database connectivity)
curl http://localhost:3000/ready
```

### Option 3: Docker Build

Build and run using Docker:

```bash
# Build image
docker build -t american-iron-hub-pro:latest .

# Run container
docker run -d \
  --name american-iron-app \
  -p 3000:3000 \
  --env-file .env.production \
  american-iron-hub-pro:latest

# Check logs
docker logs -f american-iron-app
```

## 🔧 Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host/db` |
| `GEMINI_API_KEY` | Google AI API key | `AIza...` |
| `SESSION_SECRET` | Session encryption key | Generate with `openssl rand -base64 32` |
| `JWT_SECRET` | JWT signing key | Generate with `openssl rand -base64 64` |

### Optional Variables

See [.env.example](./.env.example) for complete list of configuration options.

## 💾 Database Setup

### Local Development

Using Docker:

```bash
docker run -d \
  --name american-iron-postgres \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=american_iron_portal \
  -p 5432:5432 \
  postgres:16-alpine
```

### Production

1. **Create Database**:
   ```bash
   createdb american_iron_portal
   ```

2. **Configure Connection Pooling**:
   ```env
   DB_POOL_MIN=2
   DB_POOL_MAX=10
   DB_POOL_IDLE_TIMEOUT_MS=30000
   DB_CONNECTION_TIMEOUT_MS=5000
   ```

3. **Initialize Schema**:
   ```bash
   npm run db:init
   ```

4. **Run Migrations**:
   ```bash
   npm run db:migrate
   ```

### Database Security

- ✅ Use strong, unique credentials
- ✅ Enable SSL/TLS for connections
- ✅ Apply principle of least privilege
- ✅ Regular backups and tested restore procedures
- ✅ Keep PostgreSQL updated

## ☁️ Cloudflare Integration

### Configuration

Enable Cloudflare compatibility:

```env
TRUST_PROXY=true
CLOUDFLARE_ENABLED=true
```

### Cloudflare Settings

1. **SSL/TLS**: Set to "Full (strict)"
2. **Always Use HTTPS**: Enabled
3. **WebSockets**: Enabled (if using real-time features)
4. **Caching**: Configure cache rules for static assets

### Verified Headers

The application correctly handles:
- `CF-Connecting-IP` - Real client IP
- `X-Forwarded-Proto` - Protocol (http/https)
- `X-Forwarded-For` - Proxy chain

## 🔒 Security

### Security Features

- ✅ **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- ✅ **Rate Limiting**: Configurable per-endpoint limits
- ✅ **Input Validation**: Sanitization and validation
- ✅ **SQL Injection Protection**: Parameterized queries
- ✅ **XSS Protection**: Output encoding and CSP
- ✅ **CSRF Protection**: Token-based protection
- ✅ **SSRF Protection**: URL allowlisting

### Security Checklist

Before production deployment:

- [ ] Rotate all secrets and API keys
- [ ] Review and update `.env.production`
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Review SECURITY.md
- [ ] Enable automated backups
- [ ] Test disaster recovery procedures

See [SECURITY.md](./SECURITY.md) for detailed security information.

## 📊 Monitoring & Health Checks

### Health Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `/health` | Liveness probe | 200 if app is running |
| `/ready` | Readiness probe | 200 if ready to serve traffic |
| `/status` | Detailed system info | Requires authentication in prod |

### Example Health Check

```bash
# Liveness
curl http://localhost:3000/health

# Readiness (includes DB check)
curl http://localhost:3000/ready
```

### Structured Logging

Logs are output in JSON format:

```json
{
  "timestamp": "2026-02-08T09:00:00.000Z",
  "level": "info",
  "message": "Server started successfully",
  "context": {
    "port": 3000,
    "environment": "production"
  }
}
```

Configure log level:

```env
LOG_LEVEL=info  # error | warn | info | debug
```

## 🔍 Troubleshooting

### Database Connection Issues

```bash
# Test database connectivity
npm run db:init

# Check connection string
echo $DATABASE_URL
```

### Build Failures

```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build:production
```

### Health Check Failures

```bash
# Check server logs
docker logs american-iron-app

# Verify database
curl http://localhost:3000/ready
```

### Performance Issues

- Increase database connection pool size
- Enable compression
- Review slow query logs
- Check memory usage in `/status` endpoint

## 📚 Additional Resources

- [Security Policy](./SECURITY.md)
- [Environment Variables](./.env.example)
- [Release Checklist](./RELEASE_CHECKLIST.md)
- [Docker Compose](./docker-compose.yml)
- [Dockerfile](./Dockerfile)

## 🤝 Contributing

1. Follow security best practices
2. Run `npm audit` before committing
3. Never commit secrets or credentials
4. Write tests for new features
5. Update documentation

## 📄 License

Proprietary - American Iron Hub Pro

## 🆘 Support

For issues, questions, or support:

- **Security Issues**: security@americaniron.com
- **GitHub Issues**: [Create an issue](https://github.com/americaniron/WEB-PORTAL-V1/issues)

---

**Last Updated**: 2026-02-08
