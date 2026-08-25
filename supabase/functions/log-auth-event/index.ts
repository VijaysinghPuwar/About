import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, email, event_type, user_agent } = await req.json();

    if (!user_id || !email || !event_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const VALID_EVENT_TYPES = [
      "login",
      "logout",
      "signup",
      "token_refresh",
      "password_reset",
      "failed_login",
      "suspicious_activity",
    ];
    if (typeof event_type !== "string" || !VALID_EVENT_TYPES.includes(event_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid event type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (typeof user_id !== "string" || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid field types" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (email.length > 255 || (user_agent && typeof user_agent === "string" && user_agent.length > 1000)) {
      return new Response(
        JSON.stringify({ error: "Field too long" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ip_address =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Require a valid user JWT and confirm it matches the user_id being logged.
    // Without this, anyone could forge auth_events / suspicious-login notifications
    // for arbitrary users (the function uses the service role and bypasses RLS).
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // Validate the caller's JWT with an anon-key client that forwards the
    // Authorization header. Validating on the service-role client can fail
    // under asymmetric signing keys, which surfaced as spurious 401s.
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: userData, error: authError } = await authClient.auth.getUser();
    if (authError || !userData?.user || userData.user.id !== user_id) {
      console.error("Auth validation failed:", authError?.message ?? "user mismatch");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record the address on the verified token, not the one in the body. The
    // caller could previously log its own user_id against any email it liked,
    // and that string is what lands in the auth_events audit trail and in the
    // admin "suspicious login" notification — an audit record an authenticated
    // user could author. The body value is only a fallback for the rare token
    // with no email claim.
    const verifiedEmail = userData.user.email ?? email;


    // Check for suspicious patterns
    let flagged_suspicious = false;
    let risk_level = "normal";
    const reasons: string[] = [];

    // 1. Check for new user agent (compared to last 10 logins)
    const { data: recentEvents } = await supabase
      .from("auth_events")
      .select("user_agent, created_at")
      .eq("user_id", user_id)
      .eq("event_type", "login")
      .order("created_at", { ascending: false })
      .limit(10);

    if (recentEvents && recentEvents.length > 0 && user_agent) {
      const knownAgents = new Set(recentEvents.map((e: { user_agent: string | null }) => e.user_agent).filter(Boolean));
      if (knownAgents.size > 0 && !knownAgents.has(user_agent)) {
        flagged_suspicious = true;
        risk_level = "medium";
        reasons.push("New device/browser detected");
      }
    }

    // 2. Check for rapid login attempts (>5 in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await supabase
      .from("auth_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user_id)
      .gte("created_at", oneHourAgo);

    if ((recentCount || 0) >= 5) {
      flagged_suspicious = true;
      risk_level = "high";
      reasons.push("Rapid repeated login attempts (>5 in last hour)");
    }

    // Insert the auth event
    const { error: insertError } = await supabase
      .from("auth_events")
      .insert({
        user_id,
        email: verifiedEmail,
        event_type,
        ip_address,
        user_agent,
        risk_level,
        flagged_suspicious,
        metadata: { reasons },
      });

    if (insertError) {
      console.error("Insert error:", insertError);
    }

    // If suspicious, create an admin notification
    if (flagged_suspicious) {
      await supabase.from("admin_notifications").insert({
        type: "suspicious_login",
        user_email: verifiedEmail,
        user_id,
        message: `⚠️ Suspicious login: ${verifiedEmail} — ${reasons.join(", ")}. IP: ${ip_address}`,
      });
    }

    return new Response(
      JSON.stringify({ success: true, flagged_suspicious }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
