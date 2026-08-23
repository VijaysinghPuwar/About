# Show your own brand on the Google sign-in screen

## Why "Lovable" appears

Google sign-in is currently running on Lovable's **managed** Google OAuth credentials. Google always shows the name of the app that owns the OAuth client on the consent screen, so it reads "to continue to Lovable" with the Lovable logo. This is not something in the site's code — the site never sends that name.

The only way to change it is to use your own Google Cloud OAuth client, whose consent screen is branded "Vijaysingh Puwar" (with your own logo and domain).

## What to do

1. In Google Cloud Console, create a project (or reuse one) and configure the OAuth consent screen:
   - App name: `Vijaysingh Puwar`
   - Support email, app logo, and homepage `https://vijaysinghpuwar.com`
   - Authorized domains: `vijaysinghpuwar.com`, `lovable.app`
   - Scopes: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`
2. Create an OAuth Client ID (type: Web application) and register the callback URL shown in Cloud → Users → Authentication Settings → Google.
3. Paste the Client ID and Client Secret into Cloud → Users → Authentication Settings → Sign-in Methods → Google. Credentials stay server-side; nothing goes into the code or env files.
4. Sign in once from the live site and confirm the consent screen now reads "to continue to Vijaysingh Puwar".

## Code changes

None. `signInWithGoogle` in `src/hooks/useAuth.tsx` and the login page keep working unchanged — swapping credentials is purely a backend auth setting.

## Note

Until Google verifies your consent screen, personal Gmail users may see an "unverified app" warning. Verification is requested from the same consent screen page and usually only matters once the app is public-facing.
