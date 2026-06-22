# הצעד הבא — Next Step Rights

A right-to-left (Hebrew) rights portal for limb amputees in Israel. The site helps
users understand which rights they are entitled to and which authority handles
them, with a digital assistant, a browsable rights catalogue, and a
personalization wizard.

Migrated from a single-file Claude Design prototype
(`design-reference.dc.html`) into a real React frontend plus an Express backend
service.

## Stack

- **Frontend** — Vite + React 18 + **strict TypeScript** (no `any`), `zod` for validation, `react-router-dom` for routing.
- **Backend** — Node + Express + TypeScript, `zod`-validated requests.
- **Database & Auth** — Supabase (PostgreSQL). Uses real authentication (Email + Google SSO) via `@supabase/supabase-js`.
- npm workspaces monorepo.

## Layout

```
.
├── frontend/                 # Vite + React app
│   └── src/
│       ├── api/              # fetch client, supabase client, onboarding persistence
│       ├── components/       # Layout, Field, Card, icons, Logo, AuthShell
│       ├── data/             # rights catalogue + FAQ rendered by the UI
│       ├── hooks/            # useChat, useAuth
│       ├── pages/            # Home, Chat, Rights, Detail, Login, Signup
│       ├── schemas/          # zod schemas (forms + API DTOs)
│       ├── wizard/           # personalization wizard — also the onboarding (context + logic + UI)
│       ├── theme.ts          # design tokens
│       └── types.ts          # domain types
├── backend/                  # Express API
│   └── src/
│       ├── config/           # env validation (zod)
│       ├── data/             # rights content (source of truth for the assistant)
│       ├── middleware/       # body validation + error handling
│       ├── routes/           # /api/chat, /api/rights, /api/health
│       ├── schemas/          # zod request/response schemas
│       └── services/         # chat logic
└── supabase/
    └── migrations/           # Database migrations & triggers (Postgres)
```

## Getting started

```bash
npm install                 # installs both workspaces

# run both (separate terminals recommended on Windows):
npm run dev:backend         # http://localhost:4000
npm run dev:frontend        # http://localhost:5173 (proxies /api -> backend)
```

Copy `backend/.env.example` → `backend/.env` and `frontend/.env.example` →
`frontend/.env` to override defaults. **Make sure to provide your Supabase URL and Anon Key in the frontend `.env`**.

## Checks

```bash
npm run typecheck           # strict tsc for both workspaces
npm run build               # production build for both
```

## API

| Method | Path                     | Body                                                    | Notes                        |
| ------ | ------------------------ | ------------------------------------------------------- | ---------------------------- |
| GET    | `/api/health`            | —                                                       | liveness                     |
| POST   | `/api/chat`              | `{ message }`                                           | returns `{ reply, matched }` |
| GET    | `/api/rights/topics`     | —                                                       | full catalogue + groupings   |
| GET    | `/api/rights/topics/:id` | —                                                       | a single topic               |

## Notes / intentional scope

- The assistant returns curated demo answers; the backend `data/rights.ts` is the place to swap in a real rights database / LLM retrieval.
- Authentication and User Profiles are now handled by **Supabase**. The `supabase/migrations/` folder contains the SQL script to create the DB and the trigger required to automatically link authenticated users to the `profiles` table.
- The rights catalogue is duplicated in `frontend/src/data` (for instant rendering) and `backend/src/data` (source of truth for the assistant). They can be unified into a shared package if the content starts changing often.
- The personalization wizard (stepper) **is the onboarding** and follows the onboarding flowchart end to end: cause, insurer, a multi-select amputation matrix (limb × side × level), disability % and edge-case flags (dominant hand / phantom pain / CRPS), prosthetic use, education, gender and children. A logged-in user without a completed profile is prompted with it once per session.
- On finish it persists to Supabase (`api/onboarding.ts`): `profiles` (cause, insurer, prosthetic, `base_disability_percentage`, `is_dominant_hand_amputated`, `has_phantom_pain`, `has_crps`, education, gender, `amputation_type`), a `user_amputations` row per affected limb/side, and a `user_children` row per chosen age group. `amputation_type` doubles as the "onboarding completed" marker the auth gate checks. `weighted_disability_percentage` is left for the back office to compute.
- The logo is `frontend/src/assets/logo.png`, imported by `components/Logo.tsx`.
- The logo is `frontend/src/assets/logo.png`, imported by `components/Logo.tsx`.
