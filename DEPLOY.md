# Quick Deploy to Vercel 🚀

## One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/parai-tutor-app)

## Manual Deploy Steps

### 1. Prerequisites

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Set up Neon database at https://neon.tech
```

### 2. Deploy to Vercel

```bash
# Option A: Via Dashboard
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Add environment variables (see below)
4. Click Deploy

# Option B: Via CLI
npm i -g vercel
vercel
```

### 3. Required Environment Variables

Add these in Vercel dashboard (Settings → Environment Variables):

```env
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
NEXTAUTH_SECRET=your-generated-secret-from-openssl
NEXTAUTH_URL=https://your-app.vercel.app
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_DEMO_MODE=false
```

### 4. After First Deploy

```bash
# Update NEXTAUTH_URL with your actual Vercel URL
# Then redeploy from Vercel dashboard
```

### 5. Seed Production Database

```bash
# Pull environment variables
vercel env pull .env.local

# Run migrations and seeds
npx prisma db push
npm run db:seed
npm run db:seed-expanded
```

---

## Full Documentation

See **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** for complete deployment guide including:
- Detailed setup instructions
- Troubleshooting common issues
- Performance optimization
- Custom domain setup
- Monitoring and analytics

---

## Quick Test After Deploy

- [ ] Landing page loads
- [ ] 3D Parai model displays
- [ ] Login/Register works
- [ ] Dashboard accessible
- [ ] Camera gesture recognition
- [ ] Audio feedback plays
- [ ] AI analysis works
- [ ] Metronome functions

---

## Support

- Vercel: https://vercel.com/docs
- Neon: https://neon.tech/docs
- Issues: Open an issue on GitHub

---

**Deployment time: ~5 minutes** ⚡
