# Parai Tutor App – New Files & Features

## Files Added (Original Completion)

| File | Purpose |
|------|---------|
| `public/parai-drum.svg` | Drum icon for dashboard and inputs |
| `app/api/nilai/[id]/route.js` | API to fetch single Nilai by ID with beats |
| `scripts/generate-audio.js` | Generates placeholder WAV files for beats |
| `prisma/seed.js` | Database seed (admin, tutorial, 3 nilais) |
| `middleware.js` | Protects /dashboard and /profile routes |
| `.env.example` | Environment variables template |
| `public/audio/*.wav` | Placeholder audio (thi, tha, theem, ku, ka) |

---

## New Features Added (This Session)

### 1. **Navbar** – `components/Navbar.js`
- Sticky navigation with Home, Dashboard, Profile, About
- Sign in / Sign out based on session
- Dark mode toggle (Sun/Moon icon)
- Links to Login and Register when unauthenticated

### 2. **Dark Mode** – `hooks/useTheme.js`
- Toggle between light and dark theme
- Persists preference in localStorage
- Applies `dark` class to `<html>` for Tailwind

### 3. **Toast Notifications** – `hooks/useToast.js`
- ToastProvider wraps app in SessionWrapper
- `addToast(message, type)` for success/error/info
- Auto-dismiss after 3 seconds
- Fixed bottom-right position

### 4. **Profile Page** – `app/profile/page.js`
- Account info (name, email)
- Progress stats (beats completed, progress bar)
- Number of Nilais available
- Protected route (redirects to login if not authenticated)

### 5. **About Page** – `app/about/page.js`
- Info about Parai drum and the app
- Feature list
- Contact section

### 6. **Custom 404** – `app/not-found.js`
- Custom "Page not found" with Parai-themed message
- Link back to home

### 7. **Dashboard Search** – `app/dashboard/page.js`
- Search input to filter Nilais by name
- Real-time filtering as you type

### 8. **Favorites** – `hooks/useFavorites.js` + `app/dashboard/page.js`
- Heart icon on each Nilai card
- Toggle favorite (stored in localStorage)
- Filled heart when favorited

### 9. **Keyboard Shortcuts** – `app/tutorials/nilai/[id]/page.js`
- Press 1–9 to play corresponding beat
- Press Esc to close practice modal
- Shortcut hint shown on page

### 10. **Practice Timer** – `app/tutorials/nilai/[id]/page.js`
- Stopwatch (MM:SS) in top-right
- Start/Pause button
- Auto-starts when "Play Full Sequence" is clicked

### 11. **Stats API** – `app/api/stats/route.js`
- GET /api/stats returns totalBeats, completedBeats, percentComplete, nilaisCount
- Used by Profile page for progress display

### 12. **SessionWrapper Updates** – `components/SessionWrapper.js`
- Wraps app with ToastProvider
- Renders Navbar above all pages

### 13. **Dark Mode Styling**
- Dashboard, Profile, About, Nilai page, 404 support dark mode
- Navbar, modals, cards use dark: variants
