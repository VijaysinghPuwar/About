import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type AuthorizationDetails = {
  client?: { name?: string | null } | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

const oauth = (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error: detailsError } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (detailsError) {
        setError(detailsError.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error: decisionError } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (decisionError) {
      setBusy(false);
      setError(decisionError.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "an app";

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-24">
      <Helmet>
        <title>Authorize access | Vijay Singh Puwar</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Secure authorization
          </span>
        </div>

        {error ? (
          <>
            <h1 className="text-xl font-semibold mb-2">Authorization failed</h1>
            <p className="text-sm text-muted-foreground mb-6">{error}</p>
            <a href="/" className="text-sm text-primary underline underline-offset-4">
              Back to home
            </a>
          </>
        ) : !details ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading authorization request…
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold mb-2">Connect {clientName} to your account</h1>
            <p className="text-sm text-muted-foreground mb-8">
              This lets {clientName} use this site's tools as you. It can read the projects you already
              have access to and send contact messages on your behalf.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => decide(true)}
                className="flex-1 min-h-[44px] rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
              >
                {busy ? "Working…" : "Approve"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => decide(false)}
                className="flex-1 min-h-[44px] rounded-md border border-border text-sm font-medium disabled:opacity-60"
              >
                Deny
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
