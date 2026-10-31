# AI Marketing OS v2 — Local Full-Stack MVP

## Run
1. Install Node.js 20+.
2. Open this folder in Terminal.
3. Run `npm install`
4. Copy `.env.example` to `.env`.
5. Run `npm start`
6. Open http://localhost:3000

## Included
- Login / signup
- Business onboarding
- AI Marketing Assistant
- AI campaign planner
- Creative concept generator
- Campaign drafts
- Audience Intelligence
- Analytics
- Instagram automation drafts
- Leads
- CRM pipeline
- Meta connection scaffold
- Local JSON persistence

## Real AI
Set:
AI_PROVIDER=openai
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-6-luna

The server uses the current OpenAI Responses API pattern. Never put the API key in frontend code.

## Meta
Meta live execution is intentionally OFF by default.
Configure the Meta app credentials and permissions, test OAuth, then implement/verify the exact Marketing API payloads for the current Meta API version before enabling live launch.

## Frontend preview
You can also double-click `public/index.html` to preview the styled UI directly. Direct-file mode uses demo data; use `npm start` for the real local backend, login, persistence, and API routes.

## Windows run instructions

Open Command Prompt in the project ROOT folder (the folder containing `server.js` and `package.json`), not inside `public`.

Example:
`cd C:\Users\pathf\Downloads\AI_Marketing_OS_v2_DESIGNED`

Then:
`npm install`
`npm start`

When the terminal shows:
`AI Marketing OS running at http://localhost:3000`

open Chrome/Edge and type:
`http://localhost:3000`

Do NOT type `http://localhost:3000` as a Command Prompt command.
