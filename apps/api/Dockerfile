FROM node:18-bullseye-slim AS base
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@8.15.1

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile --shamefully-hoist

FROM base AS build
RUN npm install -g @nestjs/cli
WORKDIR /app
# Copy node_modules and workspace packages; also ensure root workspace files are present for pnpm -w
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages ./packages
COPY --from=dependencies /app/package.json ./package.json
COPY --from=dependencies /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=dependencies /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY apps/api ./apps/api
COPY turbo.json ./
COPY tsconfig.json ./
# Build workspace packages from workspace root, then build the API app
WORKDIR /app
RUN pnpm -w -r run build
# Ensure compiled workspace packages are available under node_modules so runtime `require('@zdi/...')` works
RUN mkdir -p /app/node_modules/@zdi \
	&& for p in config database types utils; do \
		mkdir -p /app/node_modules/@zdi/$p; \
		if [ -d "packages/$p/dist" ]; then cp -r "packages/$p/dist" "/app/node_modules/@zdi/$p/dist" || true; fi; \
		if [ -f "packages/$p/package.json" ]; then cp "packages/$p/package.json" "/app/node_modules/@zdi/$p/package.json" || true; fi; \
	done
RUN if [ -f /app/packages/database/dist/index.js ]; then cp /app/packages/database/dist/index.js /app/node_modules/@zdi/database/dist/index.js || true; fi
RUN if [ -f /app/packages/database/dev-prisma-stub.js ]; then \
	cp /app/packages/database/dev-prisma-stub.js /app/node_modules/@zdi/database/dev-prisma-stub.js || true; \
	printf "module.exports = require('./dev-prisma-stub.js');\n" > /app/node_modules/@zdi/database/index.js || true; \
elif [ -f /app/packages/database/dist/index.js ]; then \
	cp /app/packages/database/dist/index.js /app/node_modules/@zdi/database/dist/index.js || true; \
	printf "module.exports = require('./dist/index.js');\n" > /app/node_modules/@zdi/database/index.js || true; \
fi
RUN if [ -f /app/node_modules/@zdi/database/package.json ]; then \
	node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('/app/node_modules/@zdi/database/package.json','utf8'));p.main='index.js';fs.writeFileSync('/app/node_modules/@zdi/database/package.json',JSON.stringify(p,null,2));" || true; \
fi
ENV DATABASE_URL="postgres://postgres:IOijEjIbIn0RB5dJLqPYI6Ztpz5HpQMH4ApgTaVXod06VHoTSAqX712S28vKphWS@kk8wc0cow088k88cooscs08g:5432/postgres"
RUN pnpm --filter @zdi/database run db:generate || true
# If a generated Prisma client is not available at build time, we expect a local
# stub file to exist at `packages/database/dist/index.js`. Previously we tried
# to generate a stub during image build; that made the Dockerfile fragile. The
# workspace now includes a stable stub for local dev, so we skip on-image stub
# generation.
WORKDIR /app/apps/api
RUN pnpm build

FROM base AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./
COPY --from=build /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/main.js"]
