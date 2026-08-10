# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 3.3.x   | ✅ Active |
| < 3.3   | ❌ End of life |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

1. **Do NOT open a public GitHub issue.**
2. Email: **security@shaffoftir.uz**
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

| Step | Timeline |
|------|----------|
| Acknowledgement | Within 48 hours |
| Initial assessment | Within 7 days |
| Fix or mitigation | Within 30 days (severity-dependent) |
| Public disclosure | After fix is released |

## Security Measures

### Authentication
- JWT-based authentication with short-lived access tokens (15 min) and refresh token rotation (7 days)
- Password hashing via Django's PBKDF2 withArgon2 backend
- Account lockout after 5 failed attempts

### Authorization
- Five-tier RBAC (SUPER_ADMIN, MANAGER, INSTRUCTOR, EMPLOYEE, TECHSPEC)
- Route-level guards on all 72 pages
- Module-level access control via `canAccess()` in auth store
- Zero-edit policy on APPROVED/ARCHIVED protocols

### Data Protection
- All API communication over HTTPS/TLS
- Row-level security on employee-scoped data
- EMPLOYEE role can only view own results
- TECHSPEC role has no access to shooting results
- Audit journal tracks all sensitive actions

### Frontend Security
- No hardcoded secrets in client bundle (API keys via environment variables)
- Content Security Policy headers configured in deployment
- XSS protection via Vue's built-in template escaping
- No `v-html` usage without sanitization

### Backend Security
- CORS restricted to known origins
- Rate limiting on auth endpoints
- SQL injection protection via Django ORM
- CSRF protection on all state-changing endpoints

## Security Headers

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | `default-src 'self'` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

## Dependency Security

- Dependencies scanned via GitHub Dependabot
- CodeQL analysis runs on every PR and weekly
- `npm audit` in CI pipeline
- No runtime dependencies with known CVEs

## Best Practices for Contributors

- Never commit `.env` files or secrets
- Use environment variables for all configuration
- Run `npm audit` before submitting PRs
- Follow the principle of least privilege in role checks
- Validate all user input with Zod schemas
- Use parameterized queries (Django ORM handles this)
