

## Plan: Contact Email Update, Auth Flow Refactor, Contact Form Backend, Suspicious Login Alerts

This is a large change spanning email updates, auth behavior changes, a new contact form backend, database schema additions, and admin panel updates.

---

### 1. Global Email Update

Replace all email references across the codebase with `contact@vijaysinghpuwar.com`:

| File | Current | New |
|------|---------|-----|
| `src/pages/Contact.tsx` | `vpuwar77@gmail.com`, `+1-929-400-2052` | `contact@vijaysinghpuwar.com` (keep phone) |
| `src/components/Footer.tsx` | `mailto:vijaysingh.puwar@example.com` | `mailto:contact@vijaysinghpuwar.com` |
| `src/pages/Resume.tsx` | `vpuwar77@gmail.com` | `contact@vijaysinghpuwar.com` |

---

### 2. Database Migrations

**a) `contact_messages` table:**
```sql
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read boolean NOT NULL DEFAULT false
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
-- Anyone can insert (public contact form)
CREATE POLICY "Anyone can submit contact" ON public.contact_messages FOR INSERT WITH CHECK (true);
-- Only admins can read
CREATE POLICY "Admins can read contacts" ON public.contact_messages FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contacts" ON public.contact_messages FOR UPDATE USING (has_role(auth.uid(), 'admin'));
```

**b) `auth_events` table (audit log):**
```sql
CREATE TABLE public.auth_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text,
  event_type text NOT NULL,
  ip_address text,
  user_agent text,
  risk_level text DEFAULT 'normal',
  flagged_suspicious boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.auth_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read auth_events" ON public.auth_events FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert auth_events" ON public.auth_events FOR INSERT WITH CHECK (true);
```

**c) Update `handle_new_user` trigger** — remove the `admin_notifications` INSERT for new signups (quiet by default). Just create the profile with `status = 'approved'` (no more mandatory approval).

**d) Update `update_profile_status` RPC** — keep for manual blocking if needed.

---

### 3. Remove Mandatory Approval Flow

- Update `handle_new_user` to set `status = 'approved'` by default instead of `'pending'`
- Update `ProtectedRoute.tsx` — remove pending/blocked redirects (users auto-approved)
- Keep the `/pending` and `/blocked` pages for edge cases (manual blocking)
- Update `Login.tsx` — remove "admin approval" copy, just say "Sign in with Google"

---

### 4. Contact Form Backend

**Create edge function `send-contact-email`:**
- Accepts `{ name, email, subject, message }`
- Inserts into `contact_messages` table
- Sends email to `contact@vijaysinghpuwar.com` via the project's transactional email system (using `sendLovableEmail`)
- Includes Reply-To header with sender's email
- Rate limiting: check last submission from same email (e.g., max 3 per hour via DB query)

**Update `Contact.tsx`:**
- Replace the fake `setTimeout` with actual `supabase.functions.invoke('send-contact-email', ...)`
- Add proper loading/error states

---

### 5. Suspicious Login Detection

**Create edge function `log-auth-event`:**
- Called from client after each login
- Receives: user_id, email, user_agent, event_type
- Inserts into `auth_events` table
- Checks for suspicious patterns:
  - New user agent compared to last 10 logins
  - More than 5 logins in last hour (rapid attempts)
  - First-ever login (informational, not necessarily suspicious)
- If suspicious: sends security alert email to `contact@vijaysinghpuwar.com`
- IP address: extracted from request headers in the edge function

**Update `useAuth.tsx`:**
- After successful login, call `log-auth-event` edge function with user agent info

---

### 6. Admin Dashboard Updates

**Add tabs to Admin.tsx:**
- **Contact Messages** tab: list submissions from `contact_messages`, mark as read
- **Auth Events** tab: list from `auth_events`, filter by suspicious
- Keep existing Users and Projects tabs
- Remove the old "Notifications" tab (replace with Contact Messages + Auth Events)

---

### 7. Files to Create/Modify

| File | Action |
|------|--------|
| DB migration | Create `contact_messages`, `auth_events` tables; update `handle_new_user` |
| `supabase/functions/send-contact-email/index.ts` | Create — contact form handler |
| `supabase/functions/log-auth-event/index.ts` | Create — login audit + suspicious detection |
| `supabase/config.toml` | Add new function entries |
| `src/pages/Contact.tsx` | Update email + wire to edge function |
| `src/components/Footer.tsx` | Update email |
| `src/pages/Resume.tsx` | Update email |
| `src/pages/Login.tsx` | Remove approval-required copy |
| `src/pages/Pending.tsx` | Keep but update copy |
| `src/hooks/useAuth.tsx` | Call `log-auth-event` after login |
| `src/components/ProtectedRoute.tsx` | Remove pending redirect (auto-approve) |
| `src/pages/Admin.tsx` | Add Contact Messages + Auth Events tabs |

