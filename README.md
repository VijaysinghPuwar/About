# Vijaysingh Puwar — Portfolio

Personal portfolio site for a cybersecurity engineer: a single-page terminal-themed
site covering skills, projects, experience, and contact, with a gated project
showcase and an admin console behind Google sign-in.

**Live:** https://vijaysinghpuwar.com

---

## Stack

| Layer      | Tech                                                        |
| ---------- | ----------------------------------------------------------- |
| Build      | Vite 5, TypeScript 5.8, SWC                                  |
| UI         | React 18, Tailwind CSS 3, shadcn/ui (Radix), Framer Motion   |
| Data/state | TanStack Query, React Hook Form + Zod                        |
| Backend    | Supabase (Postgres, Auth, Edge Functions)                    |
| Auth       | Google OAuth via Supabase, with an approval-gated allowlist  |

## Architecture

The public site is **one scrolling page** (`src/pages/Index.tsx`) with `#home`,
`#skills`, `#projects`, `#experience`, and `#contact` sections. Navigation
scroll-spies these anchors rather than routing between pages.

Routes in `src/App.tsx`:

| Route                      | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| `/`                        | The portfolio page                         |
| `/login`                   | Google sign-in                             |
| `/auth/callback`           | OAuth redirect handler                     |
| `/.lovable/oauth/consent`  | OAuth consent screen                       |
| `/pending`                 | Account awaiting approval                  |
| `/blocked`                 | Account denied                             |
| `/admin`                   | Admin console (admin role required)        |

Access is tiered: visitors see the hero, skills, experience, and contact form;
project details, repository links, and the resume download unlock after sign-in.

### Layout

```
src/
  components/      Site components + shadcn/ui primitives in ui/
  pages/           Route components
  hooks/           useAuth, useTheme, useProjects, use-mobile, use-toast
  lib/             Utilities, auth redirect, MCP tool definitions
  data/            Static project seed data (projects.json)
  integrations/    Supabase and Lovable clients
supabase/
  functions/       Edge functions (see below)
```

### Edge functions

| Function             | Role                                          |
| -------------------- | --------------------------------------------- |
| `send-contact-email` | Delivers contact-form submissions             |
| `auth-email-hook`    | Custom auth email templating                  |
| `log-auth-event`     | Audit logging for auth events                 |
| `mcp`                | MCP server exposing portfolio data as tools   |

Projects merge two sources: rows from Supabase take precedence, and entries in
`src/data/projects.json` fill in anything not yet in the database.

## Local development

Requires Node.js 18+ (install via [nvm](https://github.com/nvm-sh/nvm)).

```sh
git clone https://github.com/VijaysinghPuwar/About.git
cd About
npm install
cp .env.example .env      # fill in your Supabase values
npm run dev               # http://localhost:8080
```

### Environment

Both variables are required; the app will not reach Supabase without them.

| Variable                         | Description                          |
| -------------------------------- | ------------------------------------ |
| `VITE_SUPABASE_URL`              | Supabase project URL                 |
| `VITE_SUPABASE_PUBLISHABLE_KEY`  | Supabase anon/publishable key        |

`.env` is gitignored — never commit real credentials. Only `VITE_`-prefixed
variables reach the browser, so keep service-role keys out of this file entirely.

### Scripts

| Command             | Description                            |
| ------------------- | -------------------------------------- |
| `npm run dev`       | Dev server on port 8080                |
| `npm run build`     | Production build to `dist/`            |
| `npm run build:dev` | Development-mode build                 |
| `npm run preview`   | Serve the built `dist/` locally        |
| `npm run lint`      | ESLint over the repo                   |

## Deployment

The site builds to static assets in `dist/`. Because routing is client-side,
the host must rewrite unknown paths to `/index.html` or deep links will 404.

Published through [Lovable](https://lovable.dev/projects/333daae3-0cbf-4e76-9385-c2fc173762cc)
(Share → Publish); a custom domain is configured under Project → Settings → Domains.

## Security

`SECURITY_AUDIT.md` records a review of authentication, access control, and data
handling. Notable measures: the email address is obfuscated behind
`ProtectedEmail` rather than rendered in markup, admin routes are guarded by
`ProtectedRoute` with a role check, and sign-ups land in a pending state until
approved.
