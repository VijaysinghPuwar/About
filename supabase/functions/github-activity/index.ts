/*
  Real contribution counts, including private repositories.

  The strip on the homepage can read GitHub's public REST feed on its own, but
  that feed has two limits it cannot get past. Private repositories never
  appear in it, and its PushEvent payloads for this account carry no commit
  count at all, so the browser can only ever chart pushes to public work.

  The number a reader actually wants lives in the GraphQL API, under
  `contributionsCollection`, and reaching it requires an authenticated token.
  A token cannot ship in a frontend bundle, so it lives here as a function
  secret and never leaves the server. What the browser gets back is a small
  array of daily counts, which reveals nothing a contribution graph on the
  GitHub profile would not already show.

  Deploy and configure:

    npx supabase secrets set GITHUB_TOKEN=ghp_xxx --project-ref xyhyqukvfcshqwengxth
    npx supabase functions deploy github-activity --project-ref xyhyqukvfcshqwengxth

  The token needs `read:user` only. It must NOT carry `repo`: this function
  reads counts, never code, and a token that can read private source is a
  token worth stealing. Private contribution totals are included as long as
  "Include private contributions on my profile" is enabled in GitHub settings.
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const USER = "VijaysinghPuwar";
const DAYS = 30;

/** Served to every caller for this long, so one token spends few requests. */
const CACHE_SECONDS = 6 * 60 * 60;

const QUERY = `
  query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        restrictedContributionsCount
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const token = Deno.env.get("GITHUB_TOKEN");
  if (!token) {
    // The caller renders nothing when this happens, so a missing secret
    // degrades to the strip being absent rather than to a broken strip.
    return new Response(
      JSON.stringify({ error: "GITHUB_TOKEN is not configured" }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const to = new Date();
  const from = new Date(to.getTime() - (DAYS - 1) * 86400000);

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "vijaysinghpuwar.com",
      },
      body: JSON.stringify({
        query: QUERY,
        variables: {
          login: USER,
          from: from.toISOString(),
          to: to.toISOString(),
        },
      }),
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `GitHub responded ${res.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await res.json();

    // GraphQL answers 200 with an `errors` array, so a bad token or a renamed
    // field arrives looking like success unless this is checked.
    if (body.errors?.length) {
      return new Response(
        JSON.stringify({ error: body.errors[0]?.message ?? "GraphQL error" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const collection = body?.data?.user?.contributionsCollection;
    if (!collection) {
      return new Response(
        JSON.stringify({ error: "No contribution data for that login" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const days: { date: string; count: number }[] = [];
    for (const week of collection.contributionCalendar?.weeks ?? []) {
      for (const day of week.contributionDays ?? []) {
        days.push({ date: day.date, count: day.contributionCount ?? 0 });
      }
    }
    days.sort((a, b) => a.date.localeCompare(b.date));
    const window = days.slice(-DAYS);

    return new Response(
      JSON.stringify({
        days: window,
        total: window.reduce((n, d) => n + d.count, 0),
        // Reported separately so the site can say plainly that some of the
        // work is in repositories a visitor cannot open.
        privateCount: collection.restrictedContributionsCount ?? 0,
        commitTotal: collection.totalCommitContributions ?? 0,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
        },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown failure" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
