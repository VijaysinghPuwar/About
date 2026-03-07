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

    const ip_address =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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
      const knownAgents = new Set(recentEvents.map((e: any) => e.user_agent).filter(Boolean));
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
        email,
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
        user_email: email,
        user_id,
        message: `⚠️ Suspicious login: ${email} — ${reasons.join(", ")}. IP: ${ip_address}`,
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
