# ZeroDayInstitute.com

A full-stack cybersecurity learning platform focused on Red Team, Blue Team, and Purple Team training with integrated MITRE ATT&CK Framework, live testing suites, and certificate issuance.

## 🎯 Project Overview

ZeroDayInstitute.com is a comprehensive cybersecurity education platform built with modern web technologies. Our platform provides:

- **Comprehensive Courses**: Expert-led cybersecurity training across Red/Blue/Purple teaming
- **Live Testing Labs**: Browser-based virtual environments for hands-on practice
- **CTF Challenges**: Automated capture-the-flag challenges with real-time validation
- **Code Execution**: Sandboxed code evaluation engine for programming challenges
- **Network Simulations**: Multi-container network topologies for attack/defense scenarios
- **MITRE ATT&CK Integration**: Course and challenge mapping to MITRE framework
- **Certificates**: Automated certificate generation with blockchain-ready verification
- **Video Streaming**: Self-hosted HLS video streaming with DRM
- **Team Management**: Organization and team-based subscriptions via Stripe

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router, Server Components, TypeScript)
- **Tailwind CSS** + **shadcn/ui** for beautiful, accessible UI components
- **Zustand** for state management
- **React Query** for server state and caching
- **Video.js** for video playback

### Backend
- **NestJS** (Node.js/TypeScript enterprise framework)
- **Prisma** ORM with PostgreSQL
- **Passport.js** + **JWT** for authentication
- **GraphQL** + **REST** hybrid API
- **BullMQ** for background job processing

### Infrastructure
- **PostgreSQL 15** (primary database)
- **Redis 7** (caching, sessions, queues, leaderboards)
- **MinIO** (S3-compatible object storage)
- **Docker** + **Docker Compose** (containerization)
- **NGINX** (reverse proxy, HLS video streaming)
- **Coolify** (deployment platform)

### Testing & Security
- **Docker-in-Docker** for isolated lab environments
- **gVisor** for enhanced container security
- **noVNC** for browser-based lab access
- **FFmpeg** for video transcoding

## 📋 Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** 8+ (fast, disk-efficient package manager)
- **Docker** & **Docker Compose** (for local development)
- **PostgreSQL** 15+ (or use Docker)
- **Redis** 7+ (or use Docker)

## 🚀 Quick Start

Get up and running with ZeroDayInstitute.com in just a few minutes!

### 1. Install Dependencies

```bash
# Install pnpm globally if you haven't
npm install -g pnpm@8.15.1

# Install project dependencies
pnpm install
```

### 2. Setup Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit .env and fill in your configuration
# IMPORTANT: Change JWT secrets, Stripe keys, etc.
```

See [`.env.example`](./.env.example) for a complete list of required environment variables.

### 3. Start Development Services

```bash
# Start PostgreSQL, Redis, MinIO, Mailhog via Docker
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready (check with docker-compose ps)
```

> **Note**: The development services are configured in [`docker-compose.dev.yml`](./docker-compose.dev.yml)

### 4. Setup Database

```bash
# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:push

# (Optional) Seed database with sample data
pnpm db:seed
```

### 5. Start Development Servers

```bash
# Start all apps in development mode
pnpm dev

# Or start individual apps:
# API: pnpm --filter @zdi/api dev
# Frontend: pnpm --filter @zdi/frontend dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000/api/v1
- **API Docs**: http://localhost:4000/api/docs (Swagger)
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **Mailhog**: http://localhost:8025 (email testing)

## 📁 Project Structure

```text
LearningRedTeams/
├── apps/
│   ├── api/                    # NestJS backend API
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/       # Authentication module
│   │   │   │   ├── users/      # User management
│   │   │   │   ├── courses/    # Course management
│   │   │   │   ├── videos/     # Video streaming
│   │   │   │   ├── labs/       # Virtual labs
│   │   │   │   └── ...         # Other modules
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   ├── frontend/               # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/         # Auth pages
│   │   │   ├── (dashboard)/    # Protected pages
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/             # shadcn components
│   │   │   └── auth/           # Auth components
│   │   └── package.json
│   │
│   └── workers/                # Background workers
│       ├── transcoder/         # Video transcoding
│       ├── judge/              # Code execution
│       └── email/              # Email notifications
│
├── packages/                   # Shared packages
│   ├── database/               # Prisma schema & client
│   ├── types/                  # Shared TypeScript types
│   ├── config/                 # Environment configuration
│   └── utils/                  # Utility functions
│
├── infrastructure/
│   ├── coolify/
│   │   └── docker-compose.yml  # Production deployment
│   └── nginx/
│       └── nginx.conf          # NGINX configuration
│
├── docker-compose.dev.yml      # Development services
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # pnpm workspaces
└── package.json                # Root package.json
```

## 📝 Available Scripts

### Root Level

```bash
pnpm dev          # Start all apps in development mode
pnpm build        # Build all apps for production
pnpm start        # Start all apps in production mode
pnpm lint         # Lint all apps
pnpm test         # Run tests across all apps
pnpm clean        # Clean all build artifacts
pnpm format       # Format code with Prettier
```

### Database Scripts

```bash
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema changes to database
pnpm db:migrate   # Run database migrations
pnpm db:studio    # Open Prisma Studio (database GUI)
pnpm db:seed      # Seed database with sample data
```

### Individual App Scripts

```bash
# API
pnpm --filter @zdi/api dev
pnpm --filter @zdi/api build
pnpm --filter @zdi/api test

# Frontend
pnpm --filter @zdi/frontend dev
pnpm --filter @zdi/frontend build
pnpm --filter @zdi/frontend lint
```

## 🔐 Environment Variables

See [`.env.example`](./.env.example) for a complete list of required environment variables.

### Critical Variables (MUST CHANGE IN PRODUCTION)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for signing access tokens (min 32 chars) | `your-super-secret-key-here` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | `another-secret-key-here` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `MINIO_ACCESS_KEY` | MinIO/S3 access key | `your-access-key` |
| `MINIO_SECRET_KEY` | MinIO/S3 secret key | `your-secret-key` |

## 🐳 Docker Development

### Start all services

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### View logs

```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Stop all services

```bash
docker-compose -f docker-compose.dev.yml down
```

### Reset everything (including volumes)

```bash
docker-compose -f docker-compose.dev.yml down -v
```

## 🚢 Deployment (Coolify)

### Prerequisites

1. Coolify instance running
2. Docker registry access (GitHub Container Registry)
3. Environment variables configured in Coolify

### Deployment Steps

1. **Build Docker Images**:
```bash
# API
docker build -f apps/api/Dockerfile -t ghcr.io/your-org/zdi-api:latest .

# Frontend
docker build -f apps/frontend/Dockerfile -t ghcr.io/your-org/zdi-frontend:latest .
```

2. **Push to Registry**:
```bash
docker push ghcr.io/your-org/zdi-api:latest
docker push ghcr.io/your-org/zdi-frontend:latest
```

3. **Deploy via Coolify**:
   - Use [`infrastructure/coolify/docker-compose.yml`](./infrastructure/coolify/docker-compose.yml)
   - Configure environment variables in Coolify dashboard
   - Set up domains and SSL certificates
   - Deploy!

### CI/CD with GitHub Actions

The project includes GitHub Actions workflows for:
- **CI**: Linting, type checking, testing, building
- **CD**: Docker image building and deployment

See [`.github/workflows/`](./.github/workflows/) for details.

## 🗄️ Database Schema

The database schema includes comprehensive models for:

- **Users & Authentication**: Multi-factor auth, session management, role-based access
- **Organizations**: Multi-tenant support with team management
- **Courses**: Hierarchical course structure with modules and lessons
- **Videos**: HLS streaming with multiple qualities and DRM
- **Labs**: Docker-based virtual environments with resource management
- **Challenges**: CTF-style challenges with automated validation
- **Certificates**: Verifiable certificates with blockchain-ready hashing
- **MITRE ATT&CK**: Complete framework integration with technique mapping
- **Subscriptions**: Stripe-powered subscription management

Run `pnpm db:studio` to explore the schema visually.

## 🎓 Key Features Implementation

### Authentication

- JWT-based authentication with access & refresh tokens
- Access tokens expire in 15 minutes
- Refresh tokens valid for 30 days
- Multi-factor authentication (TOTP) ready
- Session management with Redis
- Role-based access control (RBAC)

### Video Streaming

- Self-hosted HLS (HTTP Live Streaming)
- FFmpeg transcoding to multiple qualities (360p, 720p, 1080p)
- AES-128 encryption for DRM
- Signed URLs with expiration
- Progress tracking
- Watermarking support

### Virtual Labs

- Docker-in-Docker for isolation
- gVisor runtime for enhanced security
- noVNC for browser-based access
- Automatic cleanup and resource limits
- Network topology simulation
- Objective tracking and validation

### CTF Challenges

- Static and dynamic flag generation
- Real-time leaderboards (Redis sorted sets)
- Anti-cheat measures
- Hint system with time-based unlocking
- MITRE ATT&CK technique mapping

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific app
pnpm --filter @zdi/api test
pnpm --filter @zdi/frontend test

# Run tests in watch mode
pnpm --filter @zdi/api test:watch

# Generate coverage report
pnpm --filter @zdi/api test:cov
```

## 🐛 Debugging

### API Debugging

1. Set `NODE_ENV=development` in `.env`
2. API logs will show database queries and detailed errors
3. Use Prisma Studio to inspect database: `pnpm db:studio`
4. Check Swagger docs for API endpoints: http://localhost:4000/api/docs

### Frontend Debugging

1. Next.js error overlay shows detailed errors in development
2. Check browser console for client-side errors
3. Use React DevTools for component debugging

### Database Debugging

```bash
# View database logs
docker-compose -f docker-compose.dev.yml logs postgres

# Connect to PostgreSQL directly
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d zeroday_institute
```

## 📚 Documentation

- **API Documentation**: http://localhost:4000/api/docs (Swagger/OpenAPI)
- **Database Schema**: Run `pnpm db:studio`
- **Component Library**: Shadcn/ui components documented at https://ui.shadcn.com

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and pull requests to help improve the platform.

### Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `pnpm test`
4. Run linter: `pnpm lint`
5. Commit with conventional commits: `git commit -m "feat: add new feature"`
6. Push and create a pull request

## 📊 Monitoring & Performance

### Development

- Next.js has built-in performance metrics
- NestJS logging shows request duration
- Prisma logs queries in development mode

### Production

- Set up Prometheus + Grafana using provided configs
- Monitor container resource usage
- Track API response times and error rates
- Set up alerts for critical metrics

## 🔒 Security Considerations

### Before Going to Production

- [ ] Change all default passwords and secrets
- [ ] Use strong JWT secrets (min 32 characters)
- [ ] Enable HTTPS/TLS for all services
- [ ] Configure firewall rules
- [ ] Set up DDoS protection (Cloudflare)
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Scan Docker images for vulnerabilities
- [ ] Set up automated security updates
- [ ] Implement proper backup strategy
- [ ] Configure monitoring and alerting

## 📞 Support

For issues and questions:
- **GitHub Issues**: Please use the Issues tab in this repository
- **Email**: support@zerodayinstitute.com

## 📄 License

[Your License Here]

---

Built with ❤️ for the cybersecurity community
