# Security Policy

## Reporting Security Vulnerabilities

We take the security of American Iron Hub Pro seriously. If you discover a security vulnerability, please follow responsible disclosure practices.

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report security issues via email to:

**security@americaniron.com**

Or use GitHub's Security Advisory feature:
1. Go to the repository's Security tab
2. Click "Report a vulnerability"
3. Fill out the advisory form

### What to Include

When reporting a security vulnerability, please include:

- **Description**: Clear description of the vulnerability
- **Impact**: Potential impact and attack scenario
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Affected Versions**: Which versions are affected
- **Suggested Fix**: If you have suggestions for fixing the issue
- **Your Contact Information**: So we can follow up with questions

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Varies based on severity (Critical: 7 days, High: 30 days, Medium: 90 days)

## Security Best Practices

### For Operators/Administrators

1. **Environment Variables**
   - Never commit `.env.local` or `.env.production` files
   - Rotate all secrets immediately after initial deployment
   - Use a secrets management system (AWS Secrets Manager, HashiCorp Vault, etc.)
   - Set up automated secret rotation policies

2. **Database Security**
   - Use strong, unique database credentials
   - Enable SSL/TLS for database connections in production
   - Regularly backup databases and test restore procedures
   - Apply principle of least privilege for database users
   - Keep PostgreSQL updated with latest security patches

3. **Network Security**
   - Always run behind HTTPS (use Let's Encrypt or similar)
   - Enable Cloudflare proxy or similar DDoS protection
   - Configure firewall rules to restrict access
   - Use VPN or IP whitelisting for administrative access
   - Enable rate limiting to prevent brute force attacks

4. **Authentication & Authorization**
   - Enforce strong password policies
   - Enable two-factor authentication where possible
   - Regularly audit user permissions and access logs
   - Implement session timeouts
   - Review and revoke unused API tokens

5. **Monitoring & Logging**
   - Enable structured logging in production
   - Set up alerts for suspicious activities
   - Regularly review audit logs
   - Monitor for exposed credentials using tools like GitGuardian
   - Implement SIEM integration for enterprise deployments

6. **Updates & Patches**
   - Subscribe to security advisories for dependencies
   - Regularly run `npm audit` and address vulnerabilities
   - Keep Node.js and system packages updated
   - Test updates in staging before production deployment

### For Developers

1. **Code Security**
   - Never hardcode secrets, API keys, or credentials
   - Always use parameterized queries to prevent SQL injection
   - Validate and sanitize all user inputs
   - Use Content Security Policy (CSP) headers
   - Implement CSRF protection for state-changing operations

2. **Dependencies**
   - Run `npm audit` before adding new dependencies
   - Review dependency licenses and maintainer reputation
   - Use exact versions in package-lock.json
   - Regularly update dependencies to patch vulnerabilities
   - Avoid deprecated or unmaintained packages

3. **Testing**
   - Write security-focused test cases
   - Test authentication and authorization flows
   - Validate input handling and edge cases
   - Test for common vulnerabilities (OWASP Top 10)

## Known Security Assumptions

### Current Implementation

1. **Authentication**
   - Currently uses simple token-based authentication
   - Passwords are hashed using bcrypt with configurable rounds
   - Session secrets must be configured via environment variables

2. **Authorization**
   - Role-based access control (RBAC) with admin/user/employee roles
   - Authorization checks are enforced server-side
   - Client-side checks are for UI purposes only

3. **Data Protection**
   - Sensitive data is sanitized in logs
   - Database connections use pooling with timeout controls
   - HTTPS is enforced in production deployments

4. **Rate Limiting**
   - General API: 100 requests per 15 minutes
   - Auth endpoints: 5 attempts per 15 minutes
   - Configurable via environment variables

5. **Third-Party Services**
   - Google Generative AI (Gemini) for AI features
   - All external API calls require valid API keys
   - SSRF protection for user-controlled URLs

## Security Headers

The application implements the following security headers:

- **Content-Security-Policy**: Restricts resource loading
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: Enables browser XSS protection
- **Strict-Transport-Security**: Enforces HTTPS
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

## Cloudflare Integration

When deployed behind Cloudflare:

- Real client IP is extracted from `CF-Connecting-IP` header
- HTTPS enforcement is handled correctly
- Rate limiting works with Cloudflare proxy
- WebSocket connections are supported
- Cache rules are configured for static assets

## Compliance Notes

- **GDPR**: Audit logs track data access and modifications
- **PCI DSS**: Payment data handling follows secure practices
- **SOC 2**: Logging and monitoring capabilities support audit requirements

## Security Contact

For security concerns, questions, or to report vulnerabilities:

**Email**: security@americaniron.com

## Version History

- **v1.0.0** (2026-02-08): Initial security policy and production hardening

---

**Last Updated**: 2026-02-08
