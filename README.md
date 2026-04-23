# STC Colorado — FSA State Technical Committee

Meeting management, document intake, and appeal-analysis support for the
Colorado FSA State Technical Committee. Committee works for Jerry Sonnenberg,
State Executive Director.

Live: https://stc-state-fsa.onrender.com

## Stack

- **Client:** React 18 + Vite, MSAL-browser for Microsoft sign-in
- **Server:** Node 20+, Express, Microsoft Entra JWT validation
- **Database:** SQLite (`better-sqlite3`), file at `${DATA_DIR}/pfa.db`
- **Document sync:** Microsoft Graph pulls files from a SharePoint folder
- **Hosting:** Render (single web service, auto-deploys from `main`)

## Repository layout

```
.
├── render.yaml          Render deploy config (canonical after this lands)
├── .env.example         Env var template
├── package.json         engines.node pins to Node 20+
├── vite.config.js       Vite config (default dist/ output)
├── index.html           Vite entry
├── public/              Static assets (manifest, service worker)
├── src/                 React client source
│   ├── App.jsx
│   ├── main.jsx
│   ├── auth/            MSAL config + AuthContext
│   ├── components/
│   ├── data/
│   ├── pages/
│   └── styles/
└── server/              Express server source
    ├── index.js         Entry point; static-serves dist/ + mounts /api/*
    ├── db/schema.sql
    ├── middleware/auth.js       JWT verification against Microsoft JWKS
    ├── routes/                  calendar, documents, entries, expenses, issues, nct, teams
    └── services/                database, export, graph, parser, teams-watcher
```

## Local development

Requires Node 20 or later.

```bash
git clone https://github.com/mcconnellentllc-cloud/STC---State-FSA.git
cd STC---State-FSA
cp .env.example .env
# Fill in MICROSOFT_* and SHAREPOINT_* values from the Entra app registration
# and the SharePoint site. Get these from the project owner.
npm install
npm run dev
```

`npm run dev` runs the Express server and Vite dev server concurrently. The
client is at http://localhost:5173, the API at http://localhost:3000/api/*.

For a production-like run: `npm run build && npm start`. The built client is
served from `dist/` by the Express process; everything runs on `PORT` (3000
by default).

## Environment variables

All env vars are documented inline in `.env.example`. Short summary:

| Variable | Purpose |
|---|---|
| `PORT`, `HOST` | Server bind |
| `DATA_DIR` (optional), `SQLITE_PATH` (optional), `UPLOADS_DIR` (optional) | Data persistence paths — unset = `server/data/` for local dev |
| `MICROSOFT_TENANT_ID`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` | Server-side Entra + Graph |
| `VITE_MICROSOFT_TENANT_ID`, `VITE_MICROSOFT_CLIENT_ID` | Client-side MSAL (same values, `VITE_` prefix for browser exposure) |
| `SHAREPOINT_SITE_URL`, `SHAREPOINT_LIBRARY`, `SHAREPOINT_WATCH_FOLDER` | Microsoft Graph document sync |

Secret values never appear in the repo, screenshots, logs, chat transcripts,
or export packages. If a secret leaks, rotate in the owning console:

- Microsoft Entra admin center → App registrations → this app → Certificates & secrets
- Render dashboard → service → Environment (for any non-secret overrides)

## Deployment

Hosting is Render (rule 36). The service auto-deploys from `main` on commit.

Configuration of record lives in `render.yaml`:

- Service name: `stc-state-fsa`
- Region: Oregon
- Plan: Starter
- Build: `npm install && npm run build`
- Start: `node server/index.js`
- Health check: `/api/health`
- Persistent disk: `stc-data`, 1 GB, mounted at `/var/data` (SQLite + uploads)
- PR previews: off
- Custom domain: none (rule 40)

Any change to region, plan, build/start commands, disk, or env var names is
made in `render.yaml` and then the dashboard is updated to match on the same
push. Host change requires written reason, not preference (rule 36).

## Adding or removing committee members

**Current (pre-Task-2):** the allowed email list is hardcoded in
`server/middleware/auth.js`. To add a member:

1. Edit the `ALLOWED_USERS` array in `server/middleware/auth.js`
2. Add the member's Microsoft account email (lowercase)
3. Commit and push to `main` — Render auto-deploys
4. Member signs in at https://stc-state-fsa.onrender.com

**Changing in Task 2:** the allowlist will move to a `committee_members`
table in SQLite, with owner-only CRUD via an admin UI. No code deploys
required to add/remove members after that ships.

## Data persistence

SQLite and uploaded files live under `DATA_DIR`. In production this is the
mounted Render disk at `/var/data`. The disk survives deploys; files in the
app's unmounted directories do not.

Backup strategy: not yet implemented. Tracked as future work.

## Future improvements (tracked, not blocking)

- Automated backup of the Render disk (cron-pushed to SharePoint or blob storage)
- Move `ALLOWED_USERS` to the database (Task 2)
- Enable Render PR previews once a preview env-var strategy exists
- Introduce a migration tool and wire `preDeployCommand` in `render.yaml`
