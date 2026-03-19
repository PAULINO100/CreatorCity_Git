# Atlas City - Deployment Guide (Vercel)

Follow these steps to synchronize the Phase 1 implementation with a production environment.

## 1. Environment Configuration (Vercel Dashboard)
Add these variables in `Settings > Environment Variables`:

| Variable | Recommended Value |
| :--- | :--- |
| `PROJECT_MODE` | `production` |
| `DATABASE_URL` | `postgresql://...` (Accelerate/Pooled) |
| `DIRECT_URL` | `postgresql://...` (Direct session) |
| `NEXTAUTH_URL` | `https://atlas-city-seven.vercel.app` |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| `GITHUB_ID` | From GitHub OAuth App |
| `GITHUB_SECRET` | From GitHub OAuth App |

## 2. Database Migration
Since Phase 1 uses PostgreSQL in production, you must push the local schema to your PG instance:

```bash
npx prisma db push
```

## 3. Build Command
The build is automated via `vercel.json` using:
`npm run build:vercel`

## 4. Post-Deployment Verification
- [ ] Access `/dashboard` (Should redirect to GitHub login).
- [ ] Access `/city` (SVG grid should render with all citizens).
- [ ] Verify `/api/score/test` returns JSON `{"status": "online"}`.
- [ ] Check security headers using `curl -I`.

## Troubleshooting
- **Prisma Error**: Ensure `DATABASE_URL` uses `postgresql` protocol.
- **Auth Error**: Check if the GitHub Callback URL is set to `https://atlas-city-seven.vercel.app/api/auth/callback/github`.
