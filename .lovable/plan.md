## Sign-In Page Enhancement — GitHub OAuth + Magic Link

### Heads-up on GitHub
GitHub OAuth is not natively supported by Lovable Cloud's managed social auth (only Google/Apple are). I'll wire the UI and the `signInWithOAuth({ provider: 'github' })` call as requested, but the button will surface an error toast until GitHub is enabled at the Supabase backend level (which on Lovable Cloud is not exposed in the UI). The Google and magic link flows will work fully.

### Files Modified
| File | Change |
|------|--------|
| `src/pages/Login.tsx` | Add GitHub button, "or" divider, email input + magic link button, success state |
| `src/pages/AuthCallback.tsx` | NEW — handles OAuth + magic link redirect, exchanges code for session, routes user by profile status |
| `src/App.tsx` | Register `/auth/callback` route |

No new dependencies. No database changes. No design system changes.

### `src/pages/Login.tsx` changes

Layout inside existing `.glass-card` (top-to-bottom):
1. Keep VJ logo + "Welcome" heading. Update subtitle to: *"Sign in to request access to the full portfolio."*
2. Existing "Continue with Google" button (unchanged).
3. NEW "Continue with GitHub" button:
   - Same width/height/radius as Google button (`w-full h-12 rounded-md`)
   - Dark style: `bg-[#1F1F1F] text-white hover:bg-[#2A2A2A]` (kept as raw values per spec since these are brand-specific GitHub button colors, not theme tokens)
   - `Github` icon from `lucide-react`
   - Loading spinner state via local `githubLoading` state
   - `aria-label="Continue with GitHub"`
   - Handler: `supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: \`${window.location.origin}/auth/callback\` } })`; toast on error
4. NEW "or" divider:
   - Flex row: `<Separator />` left, muted text "or" center, `<Separator />` right
   - Uses existing `@/components/ui/separator` and `text-muted-foreground text-xs uppercase tracking-wider`
5. NEW magic link form:
   - `<label htmlFor="email" class="sr-only">Email</label>`
   - shadcn `<Input id="email" type="email" placeholder="you@example.com" />` (already used in Contact page)
   - Inline error `<p role="alert" class="text-destructive text-xs">` shown when invalid
   - Primary button "Email me a sign-in link" — same `w-full h-12` shape, uses `bg-primary text-primary-foreground hover:bg-primary/90`
   - Validation: zod `z.string().trim().email().max(255)` before submit
   - Handler: `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: \`${window.location.origin}/auth/callback\`, shouldCreateUser: true } })`
   - Success: replace input+button area with centered success block:
     - `CheckCircle2` icon (lucide, `text-primary w-12 h-12`)
     - Heading "Check your email"
     - Body: `We sent a sign-in link to <bold>{email}</bold>. Click the link to continue.`
     - Text-button "Use a different email" → resets `sent` state and clears the email field
   - Error: `toast.error(error.message)`; form stays usable
6. Keep existing footer text unchanged.

State additions:
```ts
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState<string | null>(null);
const [emailLoading, setEmailLoading] = useState(false);
const [emailSent, setEmailSent] = useState(false);
const [githubLoading, setGithubLoading] = useState(false);
```

### `src/pages/AuthCallback.tsx` (new)

- Mounts a centered `Loader2` spinner.
- On mount, calls `supabase.auth.exchangeCodeForSession(window.location.href)` — handles both the OAuth `?code=…` redirect (Google, GitHub) and the magic link's `?code=…` token.
- On success: rely on the existing `useAuth` provider's `onAuthStateChange` to pick up the session; this page simply navigates to `/` once `user && profile` are present. ProtectedRoute / Login's existing redirect logic already routes by profile status (approved → `/`, pending → `/pending`, blocked → `/blocked`), so we just `navigate('/', { replace: true })` and let downstream redirects handle it.
- On error: `toast.error(error.message)` and `navigate('/login', { replace: true })`.

### `src/App.tsx` changes

- Import `AuthCallback` (regular import; this page is tiny).
- Add `<Route path="/auth/callback" element={<AuthCallback />} />` inside the existing `<Routes>` block, before the `*` catch-all.

### Accessibility
- All buttons have visible text or `aria-label`.
- Email input has associated `<label>` (sr-only) and `aria-invalid` when error is shown.
- Inline error uses `role="alert"`.
- Tab order: Google → GitHub → email input → magic link button → footer.

### Verification after build
1. `/login` renders with three buttons + email field, no console errors.
2. Click GitHub → spinner shows; will return an error toast on current backend (expected per heads-up above).
3. Enter invalid email → inline error appears, button submit blocked.
4. Enter valid email → button disables, success block replaces form, "Use a different email" resets.
5. `/auth/callback?code=...` resolves session and redirects (manually testable by hitting the route directly).
