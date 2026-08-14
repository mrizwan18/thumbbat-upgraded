# ThumbBat 🏏

A real-time multiplayer cricket game built with Next.js, Socket.IO, and MongoDB.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js v18+ for the Next.js app; the socket server is pinned to **Node 22.x**
  for local/production parity (see `server/.node-version` and
  `server/package.json`'s `engines` field)
- MongoDB (a connection string, e.g. from MongoDB Atlas)
- npm

## Environment Setup

1. Create two `.env` files:

`.env.local` in the root directory:

```bash
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
DEV_FRONTEND_URL=http://localhost:3000
PROD_FRONTEND_URL=your_production_url
NEXT_PUBLIC_FILTER_USERNAME=false
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

`server/.env`:

```bash
MONGODB_URI=your_mongodb_uri
MONGODB_DB=thumbbat
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
DEV_FRONTEND_URL=http://localhost:3000
PROD_FRONTEND_URL=your_production_url
NEXT_PUBLIC_FILTER_USERNAME=false
PORT=5001
```

Notes on the socket server's env vars:

- `MONGODB_DB` is optional and defaults to `thumbbat` if omitted.
- `PORT` is optional locally (defaults to `5001`); in production (Render)
  it's injected automatically and must not be hardcoded.
- CORS is restricted to a configured origin rather than left open: the
  server reads `WEB_ORIGIN` in production and `DEV_FRONTEND_URL`
  otherwise. Leaving both unset falls back to allow-all with a startup
  warning — fine for a quick local test, not for anything reachable by
  anyone else.
- Neither `.env` file is committed (see `.gitignore`) — never commit real
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

You'll need to run both the client and socket server in separate terminal windows.

1. Start the Socket.IO server while staying in the /server directory:

```bash
npm run socket-server
```

This will start the WebSocket server on port 5001. A `GET /healthz` route
(returns `200 ok`) is available for a quick liveness check — it does not
depend on MongoDB being reachable, so it stays healthy even if the
database connection fails.

2. In a new terminal, start the Next.js development server while staying in the root directory:

```bash
npm run dev
```

This will start the client application on [http://localhost:3000](http://localhost:3000).

## Features

- Real-time multiplayer cricket game
- User authentication and email verification
- Leaderboard system
- Bot mode for single-player gameplay
- Responsive design
- Real-time score tracking
- Innings system

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS, Framer Motion
- **Backend**: Express, Socket.IO
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcrypt
- **Email**: Nodemailer
- **Type Safety**: TypeScript, Zod
- **Mobile game client**: the socket server also serves a Unity mobile
  client (separate repository) over the same private-room Socket.IO
  protocol — the web app and Unity are two independent clients of the
  one server in `/server`.

## Development Scripts

```bash
npm run dev          # Start Next.js development server
npm run socket-server # Start Socket.IO server
npm run build        # Build the production application
npm run start        # Start the production server
npm run lint         # Run ESLint
```

## Project Structure

- `/server` - Socket.IO server and game logic
- `/src/app` - Next.js application routes
- `/components` - React components
- `/utils` - Utility functions and game logic
- `/services` - Socket service and API calls
- `/styles` - Global CSS and TailwindCSS configuration

## Deployment

`render.yaml` at the repo root defines one Render.com web service,
`thumbbat-socket` (`rootDir: server`), deployed from this repo/branch
with `autoDeploy: true` and `healthCheckPath: /healthz`. **Only the
socket server is deployed on Render** — the real client is Unity (a
separate project), not this repo's Next.js app, so the web app is not
part of the Render deployment.

The server's in-memory room/match state means `thumbbat-socket` must run
as a **single instance** — it is not designed to be horizontally scaled
or run behind a load balancer without adding a shared-state adapter
first.

Required environment variables for `thumbbat-socket` in Render (set as
secrets/values in Render's dashboard, never committed):

- `NODE_ENV` — `production`
- `MONGODB_URI` — set as a secret, not synced from the repo
- `MONGODB_DB` — defaults to `thumbbat` if omitted
- `WEB_ORIGIN` — intentionally not set (no browser frontend is deployed
  alongside it, and Unity's native WebSocket client isn't subject to
  browser CORS at all). Add it with a real origin if a browser-based
  frontend is ever deployed separately — until then the server logs a
  warning and falls back to allow-all CORS rather than failing closed.

Node version for `thumbbat-socket` is pinned via `server/.node-version`
and `server/package.json`'s `engines` field — keep both in sync if the
pin ever changes. The root project (Next.js app) is separately pinned to
Node 22 via its own `.node-version`/`engines` for local development, but
is not deployed via `render.yaml`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
