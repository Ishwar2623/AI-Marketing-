# AI Marketing OS — Auth Setup

1. Netlify Environment Variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`. Add `OPENAI_API_KEY` later for live AI.
2. Supabase → Authentication → Providers → Email: enable Email.
3. Keep email confirmation enabled if you want verification before first login.
4. Supabase → Authentication → URL Configuration: set Site URL to your Netlify URL and add it to Redirect URLs.
5. Run `supabase/schema.sql` if the tables/policies are not already present.
6. Push these files to GitHub; Netlify will redeploy.

Flow: Signup → verification email → Login → first-time business setup → Dashboard. Forgot password and reset password are included. There is no demo-login bypass.
