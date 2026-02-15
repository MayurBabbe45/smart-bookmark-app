# Smart Bookmark App

A simple **Next.js 16** + **TypeScript** application that allows users to save and manage bookmarks. Built with Supabase for authentication and real-time database functionality, styled using Tailwind CSS and DaisyUI dark theme.


---

## 🧩 Features

- Email/password login via Supabase Auth
- List, add, and delete bookmarks stored in a Supabase table
- Real‑time updates using Supabase Realtime (Postgres changes)
- Responsive UI with TailwindCSS and DaisyUI dark theme
- Simple single‑page layout

## 🚀 Getting Started (Local Development)

1. **Clone** the repo:

   ```bash
   git clone <your-repo-url>
   cd smart-bookmark-app
   ```

2. **Install dependencies**:

   ```bash
   npm install
   # or yarn / pnpm
   ```

3. **Environment variables**

   - Copy `.env.example` to `.env` and fill in your Supabase project URL and anon key.
   - These variables are required for both development and production.

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   # visit http://localhost:3000
   ```

5. **Build & start** (optional):

   ```bash
   npm run build
   npm run start
   ```

## 📁 Project Structure

```
app/                  # Next.js App Router pages
components/           # UI components (Login form etc.)
lib/supabase.ts       # Supabase client factory
public/               # Static assets
tailwind.config.ts    # Tailwind + DaisyUI config (dark theme only)
.env                  # Local secrets (ignored by git)
.env.example          # Example env vars
```

## 🛠 Environment & Deployment

### Supabase

- Create a project at [supabase.com](https://supabase.com)
- Add a table called `bookmarks` with columns: `id`, `title`, `url`, `user_id`, `created_at`.
- Use the **anon** key and **project URL** in your `.env` file or Vercel environment variables.

### Vercel

This app is built with Next.js and works out of the box on Vercel. To deploy:

1. Connect your GitHub repository to Vercel.
2. Add the same environment variables in the Vercel dashboard under **Settings > Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. (Optional) create Vercel secrets and reference them in a `vercel.json`:
   ```json
   {
     "version": 2,
     "env": {
       "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
       "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
     }
   }
   ```
4. Push to `main` (or your production branch) and Vercel will build and deploy automatically.

> The default build command (`npm run build`) and output directory (`.next`) are standard for Next.js, so no additional configuration is required unless you customise the project.

## 🧾 Notes

- Dark theme colours are defined in `tailwind.config.ts` using DaisyUI. There is no light mode.
- Theme toggling components were removed; the layout sets `data-theme="smart-dark"` on the `<html>` element.
- If you need to change colours, modify the theme object in `tailwind.config.ts`.

---

Happy bookmarking! 🎯
