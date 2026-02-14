# GameHub - eSports Platform Prototype

GameHub is a full-stack eSports web application prototype upgraded from a static showcase into a dynamic platform with tournaments, authentication, dashboard analytics, leaderboard rankings, news/blog, comments, chat, feedback, and admin tooling.

## Overview

- Frontend: HTML, CSS, JavaScript (no frameworks)
- Backend: Node.js + Express
- Database: MongoDB
- Architecture: `client/` + `server/`
- Design: Dark esports aesthetic with neon accents and responsive card-based UI

## Features

### Homepage Enhancements
- Animated hero section
- Featured tournaments carousel
- Trending games section
- Upcoming events ticker
- Smooth responsive navigation

### Tournament System
- Tournament listing with search and filters
- Tournament detail page
- Team registration form
- Player list input
- Entry confirmation state
- Countdown timer to start
- Status labels (Upcoming / Live / Completed)
- MongoDB persistence for registrations

### User System
- Sign up / Login with JWT auth
- Profile page with edit support
- Favorite teams support
- Logout

### Dashboard
- Registered tournaments
- Upcoming matches
- Notifications
- Quick actions

### Leaderboard
- Global rankings
- Player and team tabs
- Filter by game
- Sort by points/wins/losses/name

### News / Blog
- Articles listing
- Featured posts
- Category filtering
- Read-more article page

### Community
- Comments on tournaments and news
- Live chat room (simple polling)
- Feedback form

### UI/UX
- Dark theme default
- Neon accents
- Hover interactions
- Loading skeletons
- Toast notifications

### Real-Time Feel
- Live countdown timers
- Dynamic event ticker
- Notification popups

### Bonus
- Match scheduling system
- Admin panel for tournament/match/news creation
- Mock email notification entries on registration
- Search and filtering across modules
- Favorite teams
- PWA support (manifest + service worker)

## Screenshots

- Desktop preview: `Gaming-website-main/readme-images/desktop.png`

## Project Structure

```text
client/
  assets/
  css/
  js/
  index.html
  tournaments.html
  tournament.html
  dashboard.html
  leaderboard.html
  news.html
  article.html
  profile.html
  login.html
  register.html
  admin.html
  manifest.webmanifest
  sw.js

server/
  src/
    config/
    middleware/
    models/
    routes/
    utils/
    index.js
  package.json
  .env.example
```

## Installation

### 1. Clone and open

```bash
git clone <your-repo-url>
cd Gaming-Website
```

### 2. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Update `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/gamehub
JWT_SECRET=replace_this_with_a_long_secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://127.0.0.1:5500,http://localhost:5500,http://localhost:3000
AUTO_SEED=true
```

Start backend:

```bash
npm run dev
```

### 3. Frontend setup

Serve `client/` with any static server.

Example using VS Code Live Server:
- Open `client/index.html`
- Start Live Server

Or using Node static server:

```bash
npx serve client
```

## Usage

- Register a new account or login with seeded admin:
  - Email: `admin@gamehub.gg`
  - Password: `Admin@123`
- Browse tournaments, open details, and register teams
- Use dashboard to view registrations/matches/notifications
- Use admin panel to create tournaments, matches, and articles
- Explore leaderboard and news modules with filters

## Deployment

### Frontend (GitHub Pages / Vercel)
- Deploy `client/` as static site
- Ensure backend API URL is reachable from deployed frontend origin

### Backend (Render / Railway)
- Deploy `server/`
- Set environment variables from `.env.example`
- Point MongoDB URI to hosted database
- Update CORS `CLIENT_ORIGIN` with deployed frontend URL

## Future Scope

- WebSocket-based real-time chat and live match updates
- Bracket visualization and match result reporting
- Role-based moderator tools
- OTP/email verification integration
- Payment flow for premium tournaments
- Advanced analytics and player performance dashboards

## Author

Sudheer Yadav (`sudheerxdev`)
