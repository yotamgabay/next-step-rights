# הצעד הבא — Next Step Rights

A right-to-left (Hebrew) rights portal for limb amputees in Israel. The site helps
users understand which rights they are entitled to and which authority handles
them, with a digital assistant, a browsable rights catalogue, and a
personalization wizard.

Migrated from a single-file Claude Design prototype
(`design-reference.dc.html`) into a real React frontend plus an Express backend
service.

## Stack

- **Frontend** — Vite + React 18 + **strict TypeScript** (no `any`), `zod` for
  validation, `react-router-dom` for routing.
- **Backend** — Node + Express + TypeScript, `zod`-validated requests.
- npm workspaces monorepo.

## Layout

```
.
├── frontend/                 # Vite + React app
│   └── src/
│       ├── api/              # typed fetch client (validates responses with zod)
│       ├── components/       # Layout, Field, Card, icons, Logo, AuthShell
│       ├── data/             # rights catalogue + FAQ rendered by the UI
│       ├── hooks/            # useChat
│       ├── pages/            # Home, Chat, Rights, Detail, Login, Signup
│       ├── schemas/          # zod schemas (forms + API DTOs)
│       ├── wizard/           # personalization wizard (context + logic + UI)
│       ├── theme.ts          # design tokens
│       └── types.ts          # domain types
└── backend/                  # Express API
    └── src/
        ├── config/           # env validation (zod)
        ├── data/             # rights content (source of truth for the assistant)
        ├── middleware/       # body validation + error handling
        ├── routes/           # /api/chat, /api/auth, /api/rights, /api/health
        ├── schemas/          # zod request/response schemas
        └── services/         # chat + auth logic
```

## Getting started

```bash
npm install                 # installs both workspaces

# run both (separate terminals recommended on Windows):
npm run dev:backend         # http://localhost:4000
npm run dev:frontend        # http://localhost:5173 (proxies /api -> backend)
```

Copy `backend/.env.example` → `backend/.env` and `frontend/.env.example` →
`frontend/.env` to override defaults.

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
| POST   | `/api/auth/login`        | `{ email, password }`                                   | demo session (stub)          |
| POST   | `/api/auth/signup`       | `{ name, email, phone, age, amputationType, password }` | demo session (stub)          |

## Notes / intentional scope

- The assistant returns curated demo answers; the backend `data/rights.ts` is the
  place to swap in a real rights database / LLM retrieval.
- Auth endpoints return a stub session — there is no user store yet.
- The rights catalogue is duplicated in `frontend/src/data` (for instant
  rendering) and `backend/src/data` (source of truth for the assistant). They can
  be unified into a shared package if the content starts changing often.
- The personalization wizard implements the **stepper** variant only (the
  design's default and first variation). The prototype's alternate chat/guided
  layouts were intentionally left out.
- The logo is an inline SVG wordmark (`components/Logo.tsx`) so the build needs no
  binary asset.
