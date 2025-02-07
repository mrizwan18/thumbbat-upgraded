# ThumbBat 🏏

A real-time multiplayer cricket game built with Next.js, Socket.IO, and MongoDB.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- MongoDB
- npm or yarn

## Environment Setup

1. Create two `.env` files:

`.env.local` in the root directory:

```bash
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
DEV_FRONTEND_URL=http://localhost:3000
PROD_FRONTEND_URL=your_production_url
NEXT_PUBLIC_FILTER_USERNAME=false
```

`server/.env`:

```bash
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
DEV_FRONTEND_URL=http://localhost:3000
PROD_FRONTEND_URL=your_production_url
NEXT_PUBLIC_FILTER_USERNAME=false
```

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

This will start the WebSocket server on port 5001.

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
