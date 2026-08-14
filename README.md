# ThumbBat 🏏

A real-time multiplayer cricket game. This repo is the Next.js web app
(marketing/auth/leaderboard pages). The real-time gameplay backend
(Socket.IO server) lives in its own repository —
[`mrizwan18/thumbbat-server`](https://github.com/mrizwan18/thumbbat-server)
— and is what the **Unity mobile client** (a separate project) actually
connects to for multiplayer matches. This repo and the Unity client are
two independent clients of that one backend; this repo does not run or
deploy the backend itself.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 22.x (pinned via `.node-version` and `package.json`'s
  `engines` field)
- MongoDB (a connection string, e.g. from MongoDB Atlas) — shared with
  the backend repo; both connect to the same database
- npm

## Environment Setup

Create `.env.local` in the root directory:

```bash
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
DEV_FRONTEND_URL=http://localhost:3000
PROD_FRONTEND_URL=your_production_url
NEXT_PUBLIC_FILTER_USERNAME=false
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

`NEXT_PUBLIC_SOCKET_URL` should point at wherever you're running
`thumbbat-server` locally (default port `5001`) or its deployed URL.

This file is never committed (see `.gitignore`) — never commit real
credentials.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/mrizwan18/thumbbat-upgraded.git
cd thumbbat-upgraded
```

2. Install dependencies:

```bash
npm install
```

## Running the Application

This repo only runs the web app. If you also need the multiplayer
backend running locally, clone and start
[`thumbbat-server`](https://github.com/mrizwan18/thumbbat-server)
separately (see that repo's own README) — it listens on port `5001` by
default and exposes `GET /healthz` for a liveness check.

Start the Next.js development server:

```bash
npm run dev
```

This will start the client application on [http://localhost:3000](http://localhost:3000).

## Features

- Real-time multiplayer cricket game (via the separate `thumbbat-server` backend)
- Google sign-in (email/password signup + confirmation is deprecated —
  see the `@deprecated` notices on `src/app/api/auth/{signup,login,confirm}`)
- Leaderboard system
- Bot mode for single-player gameplay
- Responsive design
- Real-time score tracking
- Innings system

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS, Framer Motion
- **Database**: MongoDB with Mongoose (`src/models/`, `src/lib/db.ts`)
- **Authentication**: Google sign-in, JWT
- **Type Safety**: TypeScript, Zod
- **Mobile game client**: Unity (separate repository) — the actual
  real-time gameplay client, connecting directly to `thumbbat-server`.
  This web app does not implement gameplay itself.

## Development Scripts

```bash
npm run dev    # Start Next.js development server
npm run build  # Build the production application
npm run start  # Start the production server
npm run lint   # Run ESLint
```

## Project Structure

- `/src/app` - Next.js application routes
- `/src/models` - Mongoose models this web app reads/writes directly
  (`User`, deprecated `VerificationToken`)
- `/src/lib` - Shared utilities (`db.ts` for the Mongo connection,
  `socket.ts` for the Socket.IO client connecting to `thumbbat-server`)
- `/components` - React components
- `/styles` - Global CSS and TailwindCSS configuration

## Deployment

This repo is **not** deployed via the `render.yaml` used for the
backend — that lives in `thumbbat-server`. Deploy this Next.js app
however you prefer (Vercel, Render, etc.); it just needs `.env.local`'s
variables set in whatever platform you choose, and
`NEXT_PUBLIC_SOCKET_URL` pointed at wherever `thumbbat-server` is
actually running.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
