

## Plan: Google OAuth, Admin Approval, Email Notifications

### Overview

This is a multi-part implementation: add Google OAuth login, user approval gating (pending/approved/blocked), admin user management panel, and email notifications on signup/approval. Remove any platform branding.

---

### 1. Database Migration

Add columns to the existing `profiles` table and update the trigger:

```sql
-- Add status, avatar_url, last_login_at to profiles
ALTER TABLE public.profiles 
  ADD COLUMN status text NOT NULL DEFAULT 'pending',
  ADD COLUMN avatar_url text,
  ADD COLUMN last_login_at timestamptz;

-- Validation trigger for status values
CREATE OR REPLACE FUNCTION validate_profile_status()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'approved', 'blocked') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_profile_status
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION validate_profile_status();
```

Update `handle_new_user` trigger function to populate `avatar_url` from Google metadata and set `status = 'pending'`.

Add RLS policy: users cannot update their own `status` column (use a security definer function for admin status updates).

Create a `update_profile_status` security definer function that only admins can call:

```sql
CREATE OR REPLACE FUNCTION update_profile_status(target_user_id uuid, new_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE profiles SET status = new_status WHERE user_id = target_user_id;
END;
$$;
```

### 2. Google OAuth Setup

- Call the **Configure Social Auth** tool to generate the `src/integrations/lovable/` module
- This provides `lovable.auth.signInWithOAuth("google", { redirect_uri })` 

### 3. New Pages

**`/login` page** (replaces `/auth`):
- "Continue with Google" button using `lovable.auth.signInWithOAuth("google")`
- Subtitle: "Sign in with Google to request access."
- Styled consistently with the cybersecurity theme
- After OAuth success, redirect based on profile status

**`/pending` page**:
- Message: "Your access request is pending approval. You'll receive an email once approved."
- Shield icon, minimal layout

**`/blocked` page**:
- Message: "Access denied. Contact admin."

### 4. Auth Context Refactoring (`useAuth.tsx`)

- Add `status: 'pending' | 'approved' | 'blocked' | null` to context
- After auth state change, fetch profile from `profiles` table (includes status)
- Update `last_login_at` on each login
- Add `signInWithGoogle()` method using the lovable module
- Populate `avatar_url` from Google user metadata on login

### 5. Route Protection (`ProtectedRoute.tsx`)

New wrapper component with logic:
- Not authenticated → redirect to `/login`
- Status `pending` → redirect to `/pending`
- Status `blocked` → redirect to `/blocked`
- Status `approved` → render children

Wrap protected routes (`/projects`, `/writeups`, `/resume`, `/admin`, etc.) with this component. Keep `/`, `/about`, `/contact` as public.

### 6. Admin Dashboard Updates (`/admin`)

Add a **User Management** tab/section:
- Fetch all profiles (admin RLS policy already allows this)
- Show users grouped by status (Pending / Approved / Blocked)
- Approve button → calls `update_profile_status(user_id, 'approved')`
- Block button → calls `update_profile_status(user_id, 'blocked')`
- Revoke button → sets back to `pending`
- Show user email, name, avatar, signup date

### 7. Email Notifications (Edge Function)

Create edge function `notify-admin` that:
- Accepts a payload with `type` (signup/login/status_change), user info
- Sends email to admin using the project's email system
- Called from:
  - `handle_new_user` trigger (signup notification) — via `pg_net` HTTP call to the edge function
  - Client-side after status change in admin panel (approval/block notification to user)

**Alternative simpler approach**: Since transactional emails to arbitrary addresses aren't supported via the auth email system, use an **in-app notification system**:
- Add a `notifications` table for admin
- Show badge count on admin nav item
- For user notifications (approval/block), use the auth email templates or a simple toast on next login

Given the constraint, the most reliable approach is:
- Admin signup notification: Store in a `admin_notifications` table, show badge in nav
- User approval email: Not feasible without a transactional email provider — show status on the `/pending` page instead

### 8. Navigation Updates (`Navigation.tsx`)

- Replace "Sign In" link → routes to `/login` (not `/auth`)
- When logged in: show avatar (from profile `avatar_url`) with dropdown menu (Profile info, Logout)
- If status is `pending`: show small "Pending" badge next to avatar
- Remove "Sign Up" button (Google OAuth handles both)

### 9. Remove Platform Branding

- `Footer.tsx` line 147: "Built with React + Vite" — already clean, no changes needed
- `index.html`: check `<title>` tag for any branding
- Edge function code in `auth-email-hook/index.ts` has internal references — these are not user-visible, no changes needed

### 10. Route Updates (`App.tsx`)

- Add `/login` route → `Login` page
- Add `/pending` route → `Pending` page  
- Add `/blocked` route → `Blocked` page
- Remove or redirect `/auth` → `/login`
- Wrap protected routes with `<ProtectedRoute>`

---

### Files to Create/Modify

| File | Action |
|------|--------|
| Database migration | Add `status`, `avatar_url`, `last_login_at` to profiles; update trigger; add RPC function |
| Configure Social Auth tool | Generate lovable OAuth module |
| `src/pages/Login.tsx` | Create — Google OAuth login page |
| `src/pages/Pending.tsx` | Create — awaiting approval page |
| `src/pages/Blocked.tsx` | Create — access denied page |
| `src/components/ProtectedRoute.tsx` | Create — route gating component |
| `src/hooks/useAuth.tsx` | Refactor — add status, Google sign-in, avatar |
| `src/components/Navigation.tsx` | Update — avatar dropdown, login button, pending badge |
| `src/pages/Admin.tsx` | Update — add user management section |
| `src/App.tsx` | Update — new routes, protected route wrapper |
| `src/pages/Auth.tsx` | Remove or redirect to `/login` |

### Security Summary

- `status` column protected by RLS — users can only read, not write their own status
- Admin status changes go through a `SECURITY DEFINER` function that checks `has_role`
- `/admin` route protected both client-side (redirect) and server-side (RLS + RPC)
- Google OAuth managed automatically — no API keys needed

