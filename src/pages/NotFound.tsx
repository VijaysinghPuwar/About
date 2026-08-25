import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

/*
  This page was the Vite/Lovable scaffold until now: "Oops! Page not found", a
  bare underlined anchor, and a console.error on every miss. Three problems —
  the voice was nothing like the rest of the site, the <a href="/"> threw away
  the SPA and reloaded the whole bundle to get home, and the console.error
  shipped to production, so a mistyped URL logged an error a visitor could open
  the devtools and read. It now speaks in the site's own register and returns
  home the way every other link does.
*/
export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4 hero-grid-bg">
      <Helmet>
        <title>Page Not Found | Vijaysingh Puwar</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="relative w-full max-w-[440px] text-center">
        <div className="section-heading">Error 404</div>
        <h1 className="section-title mt-3">This page does not exist</h1>
        <p className="mt-3 text-[15px] text-muted-foreground">
          The address is wrong, or the page it pointed at is gone. The work, the
          journey and the résumé are all on the home page.
        </p>
        <Link
          to="/"
          className="btn-outline mt-7 inline-flex h-10 items-center rounded-md px-5 text-[13.5px] font-medium"
        >
          ← Back Home
        </Link>
      </div>
    </div>
  );
}
