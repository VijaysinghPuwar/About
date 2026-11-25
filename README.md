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
| UI         | React 18, Tailwind CSS 3, shadcn/ui (Radix), CSS animation   |
| Data/state | Static JSON for content, React Hook Form + Zod               |
| Backend    | Supabase (Postgres, Auth, Edge Functions)                    |
| Auth       | Supabase Auth — Google (primary), GitHub, magic link          |

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
| `/blocked`                 | Account denied                             |
| `/admin`                   | Admin console (admin role required)        |

### Access model

There is no approval queue — a visitor who signs in successfully gets normal
authenticated access immediately.

| Tier          | Sees                                                                   |
| ------------- | ---------------------------------------------------------------------- |
| Anonymous     | The whole public portfolio: hero, skills, **all projects** with their public repository links, experience, the resume page and PDF, and the contact card. No part of the email address is shown. |
| Authenticated | The above plus the contact email address and the book reader. |
| Administrator | The above plus `/admin`. Admin comes from a row in `user_roles`, never from signing in. |

The contact section is a centered contact card and availability list. The
homepage contact form was removed deliberately — do not restore it.

### Layout

```
src/
  components/      Site components + shadcn/ui primitives in ui/
  pages/           Route components
  hooks/           useAuth, useTheme, use-mobile, use-toast
  lib/             Utilities, auth redirect, MCP tool definitions
  data/            The site's content: projects.json, books.json, videos
  integrations/    Supabase and Lovable clients
supabase/
  functions/       Edge functions (see below)
```

### Edge functions

| Function             | Role                                          |
| -------------------- | --------------------------------------------- |
| `send-contact-email` | Contact delivery (no homepage form currently calls it) |
| `auth-email-hook`    | Custom auth email templating                  |
| `log-auth-event`     | Audit logging for auth events                 |
| `mcp`                | MCP server exposing portfolio data as tools   |

Projects come from `src/data/projects.json` and nowhere else. The `projects`
table still exists and the `mcp` function reads it, but the website does not.

A signed-out visitor makes no request to the backend and does not download the
Supabase client: `useAuth` loads it only on the sign-in routes or when the
browser already holds a session. `npm run verify` fails if that stops being
true.

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

> **Vite inlines these at build time.** A wrong `VITE_SUPABASE_URL` is baked
> into the bundle and cannot be corrected at runtime — this is how production
> once shipped pointing at a retired Supabase project. `src/integrations/supabase/client.ts`
> now throws when it loads (on the sign-in routes, or for a returning session)
> if the configured URL matches a retired project ref, so a bad value fails
> loudly instead of silently reaching a dead backend.
> The active project is `xyhyqukvfcshqwengxth`.

### Scripts

| Command             | Description                            |
| ------------------- | -------------------------------------- |
| `npm run dev`       | Dev server on port 8080                |
| `npm run build`     | Production build to `dist/`            |
| `npm run build:dev` | Development-mode build                 |
| `npm run preview`   | Serve the built `dist/` locally        |
| `npm run lint`      | ESLint over the repo                   |
| `npm run verify`    | Build, then test the build in headless Chrome: the terminal, navigation, layout at every width, and what a visit costs the backend. Run before every push. Needs Node 22+ and Chrome. |

## Deployment

The site builds to static assets in `dist/`. Because routing is client-side,
the host must rewrite unknown paths to `/index.html` or deep links will 404.

Published through [Lovable](https://lovable.dev/projects/333daae3-0cbf-4e76-9385-c2fc173762cc)
(Share → Publish); a custom domain is configured under Project → Settings → Domains.

## Security

`SECURITY_AUDIT.md` records a review of authentication, access control, and data
handling. Notable measures: the email address is obfuscated behind
`ProtectedEmail` rather than rendered in markup, admin routes are guarded by
`ProtectedRoute` with a role check against `user_roles`, and a database trigger
prevents a user from changing their own `status`.

The address is assembled at call time via `src/lib/contact-email.ts` rather than
written as one literal — esbuild constant-folds an inline template, which had
been shipping the real address in plaintext inside the Command Palette chunk.
