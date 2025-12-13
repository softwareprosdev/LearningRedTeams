FROM node:18-alpine AS base
RUN npm install -g pnpm

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages ./packages
COPY --from=dependencies /app/package.json ./package.json
COPY --from=dependencies /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=dependencies /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY apps/frontend ./apps/frontend
COPY turbo.json ./
COPY tsconfig.json ./

# Build workspace packages first
RUN pnpm --filter @zdi/config run build || true
RUN pnpm --filter @zdi/types run build || true
RUN pnpm --filter @zdi/utils run build || true

# Generate Prisma client
RUN pnpm --filter @zdi/database run db:generate || true

# Build frontend from workspace root
ENV DATABASE_URL="postgres://stub:stub@localhost:5432/stub"
RUN pnpm --filter @zdi/frontend run build

FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

# Copy built frontend
COPY --from=build /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=build /app/apps/frontend/public ./apps/frontend/public
COPY --from=build /app/apps/frontend/package.json ./apps/frontend/package.json

# Copy workspace files
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/node_modules ./node_modules

WORKDIR /app/apps/frontend
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
