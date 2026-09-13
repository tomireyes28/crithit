# CritHit

CritHit is a gaming review platform, often described as "Letterboxd for games".

## Tech Stack

- **Monorepo**: Turborepo
- **Package Manager**: NPM Workspaces
- **Frontend**: Next.js 15 (App Router)
- **Backend**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- NPM (v10+)

### Installation

1. Clone the repository
2. Run `npm install` to install dependencies
3. Copy `.env.example` to `.env` and fill in the necessary environment variables
4. Start the database and Redis using Docker:
   ```bash
   docker-compose up -d
   ```
5. Generate Prisma client and run migrations:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

### Development

To start the development servers for all apps and packages, run:

```bash
npm run dev
```

### Available Scripts

- `npm run dev`: Starts the development servers
- `npm run build`: Builds all apps and packages
- `npm run lint`: Runs ESLint across the workspace
- `npm run type-check`: Runs TypeScript type checking
- `npm run format`: Formats code using Prettier
- `npm run clean`: Cleans turbo cache and dist folders
- `npm run db:generate`: Generates Prisma client
- `npm run db:push`: Pushes schema state to the database
- `npm run db:migrate`: Runs database migrations
- `npm run db:seed`: Seeds the database with initial data
- `npm run db:studio`: Opens Prisma Studio to view database records
