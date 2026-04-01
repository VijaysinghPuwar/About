

# Security Fixes, Radar Stability, Mobile Polish & Logo Transformation

## Part 1: Security Fixes (Database Migration)

### Issue 1: `auth_events` public INSERT policy
The `WITH CHECK (true)` INSERT policy allows anyone to inject fake events.

**Fix**: Remove the public INSERT policy. Create a `SECURITY DEFINER` function `insert_auth_event` that validates `event_type` against an allowlist and inserts with `auth.uid()`. Only callable server-side or by authenticated users through the function.

### Issue 2: `profiles` UPDATE — users can change own `status`
Current UPDATE policy allows `auth.uid() = user_id` with no column restriction, so users can set their own status to `approved`.

**Fix**: Drop the current UPDATE policy. Create a new one that adds a `WITH CHECK` ensuring `status` equals the old status (prevent status changes). Alternatively, use a trigger to prevent status modification by non-admins — a `BEFORE UPDATE` trigger that checks if `status` is changing and if the caller is not admin, resets it. The trigger approach is more robust.

### Issue 3: `user_roles` — no INSERT restriction for non-admins
The `ALL` policy for admins covers INSERT, but there's no explicit denial for non-admin INSERT.

**Fix**: Already safe — the only INSERT-capable policy is the admin `ALL` policy. RLS is deny-by-default. Non-admins have no INSERT policy, so they can't insert. No change needed. Add a note confirming this.

### Issue 4: Unauthenticated event injection
Covered by Issue 1 fix — removing the public INSERT policy and replacing with a `SECURITY DEFINER` function.

**Migration SQL** (single migration):
```sql
-- 1. Drop unsafe auth_events INSERT policy
DROP POLICY IF EXISTS "System can insert auth_events" ON public.auth_events;

-- 2. Create secure insert function
CREATE OR REPLACE FUNCTION public.insert_auth_event(
  p_event_type TEXT,
  p_email TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_event_type NOT IN ('login','logout','signup','token_refresh','password_reset','failed_login','suspicious_activity') THEN
    RAISE EXCEPTION 'Invalid event type: %', p_event_type;
  END IF;
  INSERT INTO public.auth_events (user_id, event_type, email, ip_address, user_agent, metadata)
  VALUES (auth.uid(), p_event_type, p_email, p_ip_address, p_user_agent, p_metadata);
END;
$$;

-- 3. Prevent non-admin status changes on profiles
CREATE OR REPLACE FUNCTION public.prevent_status_self_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT has_role(auth.uid(), 'admin') THEN
      NEW.status := OLD.status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prevent_status_self_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_status_self_change();
```

**Code change**: Update any client-side code that does `supabase.from('auth_events').insert(...)` to use `supabase.rpc('insert_auth_event', {...})` instead.

| File | Change |
|------|--------|
| Search for `auth_events.*insert` | Replace with RPC call |

## Part 2: Radar Chart Stability

The SkillsRadar runs a perpetual `requestAnimationFrame` loop (line 131) that increments `setLerpTick` every frame forever, even when idle. This causes continuous re-renders and jank.

**Fix in `SkillsRadar.tsx`**:
- Stop the RAF loop when `needsUpdate` is `false` (all values have settled)
- Restart it only when targets change (via a `useEffect` watching hovered/tabHighlight/polyProgress)
- This eliminates the perpetual re-render cycle that causes mobile jank

Also: The `dotPulse` animation uses `transform: scale()` without `will-change` or `transform-origin` on SVG circle elements, causing layout recalculation. Replace the inline `<style>` keyframe with a simpler opacity-based pulse to avoid SVG transform bugs on mobile WebKit.

## Part 3: Mobile Polish

Minor remaining issues visible in the screenshots:

| Component | Fix |
|-----------|-----|
| `SkillsRadar.tsx` | Add `overflow: hidden` to the container div; cap SVG `max-width` at `min(100%, 360px)` on mobile |
| `ThreatLevelIndicator.tsx` | The "SCANNING" overlay clips text — truncate with `overflow-hidden text-ellipsis` |
| `TerminalHero.tsx` | Verify hero name caps at `text-xl` on mobile (already set in prior changes) |

## Part 4: Logo Theme Transformation

**`LogoIcon.tsx`**:
- Import `useTheme` hook
- Use unique gradient IDs (avoid SVG ID collisions when multiple logos render)
- Change gradient stops based on `isPentest`: cyan→purple for default, red→orange for pentest
- Add CSS transition on the gradient stops using `<animate>` SVG elements or by transitioning `stopColor` via inline styles
- Add a brief glow/pulse animation during `isTransitioning`: scale the hex path to 1.08 and add a `filter: drop-shadow` that fades in/out over 600ms
- Use `className` with conditional `animate-pulse` style during transition

**`ThemeTransition.tsx`**:
- No changes needed — already handles the overlay

## Files Summary

| File | Action |
|------|--------|
| DB Migration | Security fixes (drop policy, add functions, add trigger) |
| `src/components/SkillsRadar.tsx` | Stop perpetual RAF loop; simplify pulse animation; add mobile overflow guard |
| `src/components/LogoIcon.tsx` | Theme-aware gradient colors + transition glow animation |
| Client code using `auth_events` insert | Switch to RPC call |

