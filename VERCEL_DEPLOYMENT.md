# Vercel Deployment Guide for Parai Tutor

## Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier works)
3. **Neon/PostgreSQL Database** - Get a free database at [neon.tech](https://neon.tech)
4. **OpenAI API Key** - Get from [platform.openai.com](https://platform.openai.com)

---

## Step 1: Prepare Your Repository

### Push to GitHub (if not already done)

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

## Step 2: Set Up Database (Neon)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy your **connection string** (it looks like):
   ```
   postgresql://username:password@host.neon.tech/neondb?sslmode=require
   ```
4. Keep this handy for Vercel environment variables

### Run Database Migrations

```bash
# In your local terminal with DATABASE_URL set:
npx prisma db push
npm run db:seed
npm run db:seed-expanded
```

---

## Step 3: Deploy on Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com/new](https://vercel.com/new)**

2. **Import your GitHub repository**
   - Click "Import Git Repository"
   - Select your `parai-tutor-app` repo
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (should auto-detect)
   - Root Directory: `./` (leave as is)
   - Build Command: `prisma generate && next build` (should be set)
   - Output Directory: `.next` (default)

4. **Add Environment Variables** (click "Environment Variables" section)

   Add these variables:

   ```env
   DATABASE_URL=postgresql://YOUR_NEON_CONNECTION_STRING
   
   NEXTAUTH_SECRET=GENERATE_THIS_WITH_COMMAND_BELOW
   NEXTAUTH_URL=https://your-app-name.vercel.app
   
   OPENAI_API_KEY=sk-your-openai-api-key
   OPENAI_MODEL=gpt-4o-mini
   
   NEXT_PUBLIC_DEMO_MODE=false
   NEXT_PUBLIC_HERO_GLB_URL=/models/Parai.glb
   
   # Optional: GitHub OAuth (if you want GitHub login)
   GITHUB_ID=your-github-oauth-client-id
   GITHUB_SECRET=your-github-oauth-secret
   ```

   **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

5. **Click "Deploy"**
   - Vercel will build and deploy your app
   - This takes 2-5 minutes

6. **After Deployment**
   - You'll get a URL like `https://parai-tutor-app.vercel.app`
   - Update `NEXTAUTH_URL` environment variable with your actual URL:
     - Go to Project Settings → Environment Variables
     - Edit `NEXTAUTH_URL` to your production URL
     - Redeploy (Vercel will prompt you)

---

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts, then add environment variables via dashboard
```

---

## Step 4: Post-Deployment Configuration

### 1. Update NextAuth URL

After your first deployment, update the environment variable:

```
NEXTAUTH_URL=https://your-actual-vercel-url.vercel.app
```

Then redeploy or wait for auto-redeploy.

### 2. Seed Production Database

If you haven't seeded the production database:

```bash
# Set production DATABASE_URL locally
export DATABASE_URL="your-production-database-url"

# Run seeds
npx prisma db push
npm run db:seed
npm run db:seed-expanded
```

Or use Vercel CLI:

```bash
vercel env pull .env.local
npm run db:seed
npm run db:seed-expanded
```

### 3. Test Your Deployment

Visit your Vercel URL and test:
- [ ] Landing page loads
- [ ] 3D model displays
- [ ] Register/Login works
- [ ] Dashboard accessible after login
- [ ] Camera gesture recognition works
- [ ] Audio plays on gestures
- [ ] AI feedback works (requires OpenAI key)
- [ ] Metronome functions
- [ ] Nilai lessons load

---

## Step 5: Custom Domain (Optional)

1. Go to your Vercel project
2. Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXTAUTH_URL` to your custom domain

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string from Neon |
| `NEXTAUTH_SECRET` | ✅ Yes | Random 32-char string for session encryption |
| `NEXTAUTH_URL` | ✅ Yes | Your production URL |
| `OPENAI_API_KEY` | ✅ Yes | For AI feedback and chatbot |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o-mini` |
| `NEXT_PUBLIC_DEMO_MODE` | No | Set to `false` for production |
| `GITHUB_ID` | No | For GitHub OAuth login |
| `GITHUB_SECRET` | No | For GitHub OAuth login |
| `NEXT_PUBLIC_HERO_GLB_URL` | No | Path to 3D model |

---

## Troubleshooting

### Build Fails: "Prisma Client not found"

**Solution:** Vercel should run `prisma generate` in the build command. Check that `vercel.json` has:
```json
{
  "buildCommand": "prisma generate && next build"
}
```

Or ensure `package.json` has:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Database Connection Errors

**Solution:**
- Verify `DATABASE_URL` is correct (use **pooled** connection string from Neon)
- Ensure `?sslmode=require` is in the connection string
- Check Neon dashboard that database is active

### NextAuth Errors: "Callback URL Mismatch"

**Solution:**
- Ensure `NEXTAUTH_URL` matches your actual Vercel URL
- If using custom domain, update `NEXTAUTH_URL` accordingly
- Redeploy after changing environment variables

### 3D Model Not Loading

**Solution:**
- Verify `/public/models/Parai.glb` exists in your repo
- Check browser console for 404 errors
- Ensure file path is correct in `NEXT_PUBLIC_HERO_GLB_URL`

### Audio Files Not Playing

**Solution:**
- Verify `/public/audio/*.wav` files exist
- Check browser console for CORS errors
- Ensure files are committed to Git

### Slow Performance / High Costs

**Solution:**
- Enable Vercel's Edge Functions for faster response times
- Consider upgrading Neon database tier for more connections
- Monitor OpenAI API usage (can get expensive with many users)
- Add rate limiting to API routes

---

## Performance Optimization

### Enable Vercel Analytics

1. Go to your project dashboard
2. Analytics tab
3. Enable Web Analytics (free)

### Enable Speed Insights

1. Install package:
   ```bash
   npm install @vercel/speed-insights
   ```

2. Add to layout:
   ```javascript
   import { SpeedInsights } from '@vercel/speed-insights/next';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <SpeedInsights />
         </body>
       </html>
     );
   }
   ```

### Configure Caching

Add to `next.config.js`:
```javascript
module.exports = {
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com'],
  },
  async headers() {
    return [
      {
        source: '/audio/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/models/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

---

## Continuous Deployment

Vercel automatically redeploys when you push to your GitHub main branch.

**Development Workflow:**
```bash
# Make changes locally
git add .
git commit -m "Add feature X"
git push origin main

# Vercel automatically deploys
# Preview URL available in ~2 minutes
```

**Preview Deployments:**
- Every branch and PR gets its own preview URL
- Test features before merging to main

---

## Monitoring & Logs

### View Logs

1. Go to your Vercel project
2. Click on a deployment
3. View "Functions" tab for API logs
4. View "Build" tab for build logs

### Set Up Alerts

1. Project Settings → Integrations
2. Add Slack/Discord/Email notifications
3. Get notified on deployment failures

---

## Cost Estimates

### Free Tier (Hobby Plan)
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless function executions
- ✅ Preview deployments
- ❌ No team features
- ❌ Limited analytics

### Pro Plan ($20/month)
- ✅ Team collaboration
- ✅ Password protection
- ✅ Advanced analytics
- ✅ Higher limits

**External Costs:**
- **Neon Database:** Free tier (0.5GB storage, 10 branches)
- **OpenAI API:** Pay per use (~$0.01-0.10 per session with feedback)
- **Domain:** $10-15/year (optional)

---

## Security Checklist

- [ ] `NEXTAUTH_SECRET` is unique and secure
- [ ] Database credentials not in code
- [ ] `.env` added to `.gitignore`
- [ ] API keys stored in Vercel environment variables
- [ ] CORS configured properly
- [ ] Rate limiting on API routes (recommended)
- [ ] Input validation on forms

---

## Next Steps After Deployment

1. **Share Your App:** Get user feedback
2. **Monitor Analytics:** Track usage and errors
3. **Iterate:** Add features based on user needs
4. **Scale:** Upgrade plans as you grow

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs

---

## Quick Deploy Button (Add to README)

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/parai-tutor-app&env=DATABASE_URL,NEXTAUTH_SECRET,NEXTAUTH_URL,OPENAI_API_KEY&envDescription=Required%20environment%20variables&envLink=https://github.com/YOUR_USERNAME/parai-tutor-app/blob/main/.env.example)
```

---

**Your Parai Tutor app is now ready for the world! 🎉🪘**
