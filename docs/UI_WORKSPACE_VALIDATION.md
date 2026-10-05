# Workspace refresh validation — 2026-10-05

Branch: `ui/workspace-refresh`. PR #1 remains draft. No merge or production deployment.

## Changes in this pass

- Decision Snapshot preserves missing numbers as unavailable, keeps valid zero values,
  rejects invalid target/price inputs, and labels the five-factor average as a composite
  score. Non-stock instruments show performance and risk instead of company metrics.
- Risk labels now match the backend: annualized Sharpe, risk-free rate zero, calculated
  over available history up to two years. Removed unsupported 1Y and TTM assertions.
- Snapshot helper text wraps; four-column layout starts at a wider breakpoint to leave
  room for the existing assistant column. This adjustment still needs visual review.
- Header exposes Learn and sign-in at narrow widths and search throughout the tablet
  range. Added active-page semantics and restored a visible logo keyboard focus style.
- Market tape explicitly labels its one-month changes, avoids an unverified open/closed
  claim, and has loading/empty/error/retry states. Its request times out after 15 seconds;
  cancellation is optional in the existing API client and preserves auth headers.
- Existing lightweight-charts Terminal, auth, usage gating, E2EE, AI, analytics, Admin,
  Learn, Screener and Backtesting implementations remain in place. No backend changes.

## Validation results

| Check | Result |
| --- | --- |
| `npm ci` | Passed using the existing lockfile |
| `npm run build` | Passed before and after changes |
| `npm run test:ui` | 5 component contract/render tests passed; no browser or live API fixtures |
| Targeted ESLint on Header, MarketTape, DecisionSnapshot and api.js | Passed |
| `npm run lint` | 60 errors, 21 warnings; identical counts on base `6ac7227` and updated branch |
| `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests -q` | 6 passed, 8 deprecation warnings |
| FastAPI startup | Passed with documented requirements and `uvicorn app.main:app --port 8000` |
| Vite startup | Passed with `npm run dev -- --host 127.0.0.1` |
| Vite → FastAPI proxy `/api/health` | HTTP 200, `{"status":"ok"}` |
| Vite SPA routes `/`, `/screener`, `/backtest`, `/chart` | HTTP 200 HTML; this is not evidence of browser rendering |
| `/api/strategies`, `/api/screener/lists`, `/api/articles` | HTTP 200 JSON |
| `/api/agent/health` | HTTP 200, `{"status":"offline"}`; sidecar is not configured here |
| `/api/research/AAPL` | HTTP 400 in first run; subsequent timeout during provider delays |
| `/api/terminal/chart/AAPL`, `/api/backtest` | HTTP 400: `Too Many Requests. Rate limited. Try after a while.` |
| `/api/macro` | Timed out; synchronous provider work also delayed concurrent requests |

Dependency setup used a local Python venv and installed pytest separately for the
existing tests. No dependency versions were changed in the repository. The Vite
wildcard host attempt failed on this runtime's network-interface enumeration;
explicit loopback binding succeeded.

## Browser blocker and remaining review

Chromium could not be installed: both the runtime-provided and current Playwright
installers received invalid/truncated browser archives. The available cloud browser
rejected `http://localhost:5173` with `ERR_BLOCKED_BY_CLIENT`. No screenshots or visual
passes are claimed. Successful market-data views were not validated with synthetic
responses substituted for live data.

All cells below are pending:

| Surface | Desktop 1440px | Tablet 768px | Mobile 390px / 320px | Dark mode |
| --- | --- | --- | --- | --- |
| Research + Decision Snapshot | Pending | Pending | Pending | Pending |
| Screener + tables | Pending | Pending | Pending | Pending |
| Backtesting + results | Pending | Pending | Pending | Pending |
| Terminal + lightweight-charts | Pending | Pending | Pending | Pending |

Before marking ready: run both services in a browser-capable environment with working
market-provider access. Check navigation, assistant resize/collapse, keyboard focus,
chart sizes, table scrolling, loading/error/empty/retry states, and sign-in/usage gates.
Validate authenticated E2EE and AI behavior against an appropriately configured local
sidecar/account; neither was exercised here. Full-repository lint cleanup remains
separate from this focused UI pass.

Deployment workflow inspection: `.github/workflows/deploy-neo.yml` triggers on pushes
to `main` or manual dispatch only. This work targets only `ui/workspace-refresh`.
