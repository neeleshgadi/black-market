# Black Market Alien Store

An immersive, story-driven e-commerce platform where users can explore, collect, and purchase rare alien character cards from across the galaxy.

## Project Structure

```
black-market/
├── client/          # React frontend
├── server/          # Express.js backend
├── package.json     # Root package.json for scripts
└── README.md
```

## Getting Started

1. Install dependencies for all packages:

   ```bash
   npm run install:all
   ```

2. Start development servers:
   ```bash
   npm run dev
   ```

This will start both the React frontend (http://localhost:5173) and Express backend (http://localhost:5000) concurrently.

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **Development**: Concurrently, Nodemon

## Environment Variables

Create `.env` files in both client and server directories with the required environment variables (see respective README files).
