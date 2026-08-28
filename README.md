# Volviq AI

AI-powered motion graphics and advertisement generation platform — marketing site with early access signup.

## Local development

First, make sure to install dependencies in both the root folder (Vite landing/auth) and the subfolder (Next.js motion engine):

```bash
# Install root dependencies
npm install

# Install dashboard/motion engine dependencies
cd volviq-motion-engine
npm install
cd ..
```

Ensure you have created and configured the `.env` files in both the root directory and the `volviq-motion-engine` directory.

To run the apps:

```bash
# Start the landing page + onboarding + auth (on http://localhost:5173)
npm run dev:landing

# In a separate terminal, start the dashboard + prompt-to-video engine (on http://localhost:3000)
npm run dev:dashboard
```

## Deploy to Vercel

1. Push this repo to [github.com/shauryadevdesigner/volviq-ai](https://github.com/shauryadevdesigner/volviq-ai) (see below if push fails).
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Vite**
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy.

`vercel.json` includes SPA rewrites for React Router (`/request-access`).

## Push to GitHub (if you see 403)

Git is using a different account than `shauryadevdesigner`. Fix credentials, then:

```bash
git remote set-url origin https://github.com/shauryadevdesigner/volviq-ai.git
git push -u origin main
```

Or use GitHub Desktop / sign in as `shauryadevdesigner` in Windows Credential Manager.

## Supabase

Run `supabase/migrations/001_early_access_users.sql` in the Supabase SQL editor.
