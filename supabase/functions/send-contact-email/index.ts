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
    const { name, email: clientEmail, subject, message } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // A verified user session is required. Anonymous submissions used to be
    // accepted with a caller-supplied address, and the hourly cap was keyed on
    // that address, so changing it reset the cap: unlimited inserts through the
    // service role. The site has no anonymous contact form, so nothing
    // legitimate depends on the anonymous path.
    //
    // The token is validated with an anon-key client that forwards it (the
    // same pattern as log-auth-event): validating on the service-role client
    // can fail under asymmetric signing keys.
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Sign in to send a message" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: userData, error: authError } = await authClient.auth.getUser();
    if (authError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Sign in to send a message" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = userData.user.id;

    // The service role bypasses RLS, so the blocked check has to happen here.
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();
    if (profile?.status === "blocked") {
      return new Response(
        JSON.stringify({ error: "This account cannot send messages" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // The reply-to address may differ from the account address (the MCP tool
    // asks for one), but it no longer drives the rate limit.
    const senderEmail = clientEmail || userData.user.email;

    // Validate inputs
    if (!name || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Name, subject, and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!senderEmail) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Type before length. `name.length` on a non-string is undefined, and
    // `undefined > 100` is false, so a JSON object or number slipped past the
    // size guard entirely and went to the insert as-is.
    if (
      typeof name !== "string" ||
      typeof senderEmail !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string"
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid field types" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (name.length > 100 || senderEmail.length > 255 || subject.length > 200 || message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Input too long" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting: max 3 submissions per hour per verified account. A failed
    // count is refused rather than read as zero, so a database error cannot
    // switch the cap off.
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", oneHourAgo);

    if (countError || count === null) {
      console.error("Rate-limit count failed:", countError);
      return new Response(
        JSON.stringify({ error: "Could not send right now. Please try again later." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (count >= 3) {
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from("contact_messages")
      .insert({ name, email: senderEmail, subject, message, user_id: userId })
      .select("id, created_at")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save message" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      // A narrow receipt: the id and time only, never the stored row.
      JSON.stringify({ success: true, id: inserted.id, created_at: inserted.created_at }),
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
