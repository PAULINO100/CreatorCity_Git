# Security Policy - Atlas City

## Content Security Policy (CSP)
Atlas City implements a strict Content Security Policy to mitigate Cross-Site Scripting (XSS) and other code injection attacks.

### Directives
- **default-src**: 'self'
- **script-src**: 'self', 'unsafe-inline', 'unsafe-eval'
- **img-src**: 'self', data:, https:
- **connect-src**: 'self', https://atlas-city-seven.vercel.app, https://api.github.com, https://accounts.google.com
- **frame-src**: 'self', https://github.com

## Security Headers
The following headers are also applied in production:
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Restricted access to camera, microphone, and geolocation.
## VOTING & REPUTATION POLICY
To maintain the integrity of the Atlas City Social Graph, the following rules apply:
1. **Self-Voting**: Forbidden and blocked at API level.
2. **Rate Limiting**: Users are limited to 5 peer votes per rolling week.
3. **Sybil-Resistance**: Reciprocal votes (A votes B, B votes A) carry a 50% weight penalty to discourage collusion circles.
4. **Temporal Decay**: Trust is earned, not static. Each vote loses influence over a 90-day period.

## CONTACT
If you discover a vulnerability, please report it via [GitHub Issues](https://github.com/atlas-city/atlas-city/issues) (marking as Private if possible) or contact the core team directly.
