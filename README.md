# Parai Tutor App

Learn the art of Parai drumming — a traditional Tamil drum. Preserve culture through rhythm with guided tutorials and practice tools.

## Features

- **Landing Page** – Hero, features, testimonials, and call-to-action
- **Authentication** – Register, login (credentials + optional GitHub OAuth)
- **Dashboard** – Browse Nilais (lessons) with progress tracking
- **Tutorial Nilai Pages** – Dynamic lessons with beats (Thi, Tha, Theem, Ku, Ka)
- **Beat Practice** – Play audio, practice modal, mark beats complete
- **Progress Tracking** – UserBeatProgress for completion status
- **Audio** – Placeholder WAV files for each beat (replace with real recordings)
- **Protected Routes** – Dashboard requires login

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL and NEXTAUTH_SECRET
   ```

3. **Database**
   ```bash
   npx prisma db push
   npm run db:seed
   ```

4. **Generate audio** (optional; placeholders already in `public/audio/`)
   ```bash
   npm run generate:audio
   ```

5. **Run**
   ```bash
   npm run dev
   ```

## Seed Data

- **Admin user**: `admin@parai.app` / `admin123`
- **Tutorial**: Parai Basics with 3 Nilais
- **Nilai 1**: Thi, Tha, Theem
- **Nilai 2**: Ku, Ka
- **Nilai 3**: Thi, Tha, Theem, Ku

## Tech Stack

- Next.js 15, React 19, Tailwind CSS 4
- NextAuth.js, Prisma, SQL Server
- Framer Motion, Three.js, Lucide icons
