

## Plan: Smart Contact Form for Logged-in Users

### Overview
Pre-fill the contact form with authenticated user data, hide the email field for logged-in users, and pass `user_id` to the backend for authenticated submissions. The edge function will extract the email server-side from the JWT for authenticated users.

---

### 1. Frontend — `src/pages/Contact.tsx`

- Import `useAuth` hook to get `user`, `profile`
- **Logged-in state:**
  - Show "Signed in as user@email.com" helper text above the form
  - Hide the email input field entirely
  - Pre-fill `name` from `profile.full_name` if available (still editable)
  - On submit: send `{ name, subject, message }` — no email field. Pass the auth token via the standard Supabase invoke (already included automatically)
- **Logged-out state:**
  - Show full form as-is (name + email + subject + message)

### 2. Backend — `supabase/functions/send-contact-email/index.ts`

- Extract the `Authorization` header from the request
- If a valid JWT is present:
  - Decode it via `supabase.auth.getUser(token)` to get `user.email` and `user.id`
  - Use the **server-verified email** (ignore any client-sent email)
  - Save `user_id` in the `contact_messages` insert
- If no JWT / anonymous:
  - Require `email` in the request body (current behavior)
  - `user_id` = null
- Include `authenticated: true/false` and `user_id` in the stored record

### 3. Database Migration

Add `user_id` column to `contact_messages`:
```sql
ALTER TABLE public.contact_messages 
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
```

### Files to Modify

| File | Action |
|------|--------|
| `src/pages/Contact.tsx` | Add useAuth, conditional form fields, prefill logic |
| `supabase/functions/send-contact-email/index.ts` | Extract JWT user, use server-side email for auth'd users, save user_id |
| DB migration | Add `user_id` column to `contact_messages` |

