# Deploy AI Marketing OS to Netlify

## 1. Upload to GitHub
Create a GitHub repository and upload this folder.

## 2. Netlify
Netlify -> Add new site -> Import an existing project -> choose GitHub repository.

Build command: leave empty.
Publish directory: `.`

`netlify.toml` already configures the Functions directory and API redirects.

## 3. Supabase
Create a Supabase project.
Open SQL Editor and run:
`supabase/schema.sql`

Then in Netlify -> Site configuration -> Environment variables add:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- OPENAI_API_KEY (optional)
- OPENAI_MODEL (optional)
- META_APP_ID (later)
- META_APP_SECRET (later)
- META_REDIRECT_URI (later)
- META_LIVE_ENABLED=false

Redeploy after adding variables.

## 4. Result
Frontend: Netlify
Database/Auth: Supabase
AI server calls: Netlify Functions
Meta integration: Netlify Functions
No local server is required for production.
