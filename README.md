# Parai Tutor App

Learn the art of Parai drumming — a traditional Tamil drum. This repo is configured for **local demo** and **production** deployment.

## Quick start (demo)

1. **Install**

   ```bash
   npm install
   ```

2. **Environment**

   ```bash
   cp .env.example .env
   ```

   Set `NEXTAUTH_SECRET` to a long random string (e.g. `openssl rand -base64 32`).

3. **Database (SQLite)**

   ```bash
   npx prisma db push
   npm run db:seed
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (after seed)

| Email | Password |
|-------|----------|
| `demo@parai.app` | `demo123` |
| `admin@parai.app` | `admin123` |

Set `NEXT_PUBLIC_DEMO_MODE=true` in `.env` to show the demo banner and login hints.

## Production

- **Build:** `npm run build`
- **Start:** `npm start`
- **Health check:** `GET /api/health` — use for load balancers and uptime monitors
- **Security:** `next.config.mjs` sets common HTTP security headers
- **SEO:** `app/sitemap.js` and `app/robots.js` use `NEXTAUTH_URL` as the public site URL — set it to your domain in production

### Docker

```bash
docker compose up --build
```

Uses SQLite on a named volume (`parai-data`). Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL` in the environment or in a `.env` file next to `docker-compose.yml`.

### Vercel / Node hosting

1. Set environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`).
2. For SQLite on serverless, prefer **PostgreSQL** (see below) or a persistent volume; SQLite on Vercel is not recommended.
3. Build command: `prisma generate && prisma db push && npm run build` (or use migrations) and `npm run db:seed` once.

### Using PostgreSQL or SQL Server instead of SQLite

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql" // or "sqlserver"
  url      = env("DATABASE_URL")
}
```

Then run `npx prisma db push` or `npx prisma migrate dev` with the appropriate `DATABASE_URL`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm run db:push` | Sync Prisma schema to DB |
| `npm run db:seed` | Seed tutorials and demo users |
| `npm run generate:audio` | Regenerate placeholder WAV files in `public/audio` |

## ML: Parai stroke classifier

Pretrained **AST (AudioSet)** weights from [Hugging Face](https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593), fine-tuned on folders under `data/parai/`. See `data/DATA_SOURCES.md` and `model_training/README.md`.

## Tech stack

Next.js 15, React 19, Tailwind CSS 4, NextAuth.js, Prisma (SQLite by default), Framer Motion, Three.js.
