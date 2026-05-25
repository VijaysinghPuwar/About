# Strip Raw Email From All Logged-Out UI/DOM

The previous fix only gated the email row on `/contact`. The same address still leaks via:

| File | Line | Leak |
|---|---|---|
| `index.html` | 36 | `"email"` field in JSON-LD schema (crawler-visible) |
| `src/pages/Index.tsx` | 159 | Hero social icons `mailto:` href |
| `src/pages/Index.tsx` | 297 | Public Contact section — full email text + `mailto:` |
| `src/pages/About.tsx` | 168 | Social icon `mailto:` href |
| `src/components/Footer.tsx` | 46 | Footer icon `mailto:` href |
| `src/components/CommandPalette.tsx` | 42 | "Send Email" action sets `window.location` to `mailto:` |

(`Resume.tsx` and `Pending.tsx` stay as-is — both are behind authenticated routes already.)

## Approach

### 1. New helper component `src/components/ProtectedEmail.tsx`
Single source of truth for the address. Reads `useAuth().user`. Two render modes:

- `variant="row"` — icon + email text (used in Contact card on Index + Contact page)
  - **Logged in:** real `<a href="mailto:…">contact@vijaysinghpuwar.com</a>`
  - **Logged out:** `<button onClick={() => navigate('/login')}>` with
    - blurred masked text `cont••••@vijaysinghpuwar.com`
    - lock icon + "Sign in to unlock" hint
    - **no `mailto:` and no real address in the DOM**
- `variant="icon"` — icon-only (hero, About, Footer)
  - **Logged in:** real `mailto:` anchor
  - **Logged out:** `<button>` with lock-overlay icon → routes to `/login`; `aria-label="Sign in to email"`

Email constant lives in this file only (`EMAIL = 'contact' + '@' + 'vijaysinghpuwar.com'` split to avoid trivial source-grep scrapers — minor, but cheap).

### 2. Replace existing usages
- `Index.tsx` hero icons → `<ProtectedEmail variant="icon" />`
- `Index.tsx` contact card row → `<ProtectedEmail variant="row" />` (drop the email entry from the mapped array; render it separately above GitHub/LinkedIn so the public/auth branching is clean)
- `About.tsx` social row → same icon variant
- `Footer.tsx` email icon → same icon variant
- `Contact.tsx` → swap inline gated block for `<ProtectedEmail variant="row" />` (keeps current premium look, single implementation)
- `CommandPalette.tsx` "Send Email" command:
  - Logged in: keep `mailto:` action
  - Logged out: navigate to `/login` instead, label flips to "Sign in to email"

### 3. `index.html` JSON-LD schema
- Remove `"email"` field
- Add `"contactPoint": { "@type": "ContactPoint", "contactType": "professional", "url": "https://vijaysinghpuwar.com/contact" }`
- SEO impact: neutral — Google accepts ContactPoint with URL; removes the only crawler-visible raw address

## Verification
- `rg "contact@vijaysinghpuwar"` in source → should only return `ProtectedEmail.tsx`, `Resume.tsx`, `Pending.tsx` (both auth-gated)
- View page source on `/`, `/about`, `/contact` logged out → no `mailto:` and no email substring in rendered HTML
- Logged in → all entry points reveal real `mailto:` with smooth fade
- Mobile: 44px tap targets preserved; layouts unchanged

## Out of Scope
- No design redesign, no nav/hero/project/perf changes
- Pending/Resume left alone (already behind auth)
- No new deps, no Supabase calls
