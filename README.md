# LinkPulse — corrected API demo

This package keeps the existing Vite/React frontend and adds API routes for links, redirects, link health checks, analytics, folders, campaigns, bio pages, link updates/deletion, and test clicks.

## Run locally

1. Install Node.js (20.19+ or 22.12+ recommended for Vite 8).
2. Run `npm install`.
3. Run `npm run build` to verify the frontend build.

For a local API smoke test, the Vercel routing in `vercel.json` is intended for deployment. Use Vercel CLI (`npx vercel dev`) to exercise both the frontend and `/api/*` routes locally.

## Important limitation

The API currently uses in-memory demo storage. On serverless hosting, state may disappear between invocations and is not shared reliably across instances. **Do not use this as a production link shortener or store sensitive links yet.** Before a real deployment, replace the in-memory store with a persistent database and add authentication/authorization.

The URL health-check endpoint fetches user-supplied URLs; a production implementation should add SSRF protections and rate limiting.


## Neon PostgreSQL setup (corrected backend)

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to your Neon connection string.
2. Run `npm install`.
3. Run `npm run dev` and open http://127.0.0.1:5173.
4. Check http://127.0.0.1:3001/api/health. It should report `storage: "neon-postgresql"`.
5. The API creates/upgrades its required tables automatically on first request.

For Vercel, add `DATABASE_URL` in Project Settings -> Environment Variables for the environments you use, then redeploy. Do not upload `.env`.

This project does not implement authentication or per-user data isolation; treat the demo as a shared workspace until authentication and authorization are added.
