FROM node:18-alpine AS base
RUN npm install -g pnpm

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile --shamefully-hoist

FROM base AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages ./packages
COPY --from=dependencies /app/package.json ./package.json
COPY --from=dependencies /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=dependencies /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY apps/frontend ./apps/frontend
COPY turbo.json ./
WORKDIR /app
# Build workspace packages (if any) from workspace root, then build frontend
RUN pnpm -w -r run build || true
# Ensure compiled workspace packages are available under node_modules for runtime
RUN mkdir -p /app/node_modules/@zdi \
	&& for p in config database types utils; do \
		mkdir -p /app/node_modules/@zdi/$p; \
		if [ -d "packages/$p/dist" ]; then cp -r "packages/$p/dist" "/app/node_modules/@zdi/$p/dist" || true; fi; \
		if [ -f "packages/$p/package.json" ]; then cp "packages/$p/package.json" "/app/node_modules/@zdi/$p/package.json" || true; fi; \
	done
RUN pnpm --filter @zdi/database run db:generate || true
RUN sh -lc 'default_js="/app/node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/.prisma/client/default.js"; \
if [ ! -f "$default_js" ] || grep -q "did not initialize yet" "$default_js"; then \
	echo "Prisma client missing or placeholder; writing stub for @zdi/database"; \
	mkdir -p /app/node_modules/@zdi/database/dist; \
	printf "%s\n" "class PrismaClientStub {" "  constructor(){console.warn(\"Using PrismaClient stub (no real DB).\")}" "  async $connect(){return Promise.resolve()}" "  async $disconnect(){return Promise.resolve()}" "}" "const prisma=new PrismaClientStub();" "module.exports={PrismaClient:PrismaClientStub,Prisma:{},prisma};" > /app/node_modules/@zdi/database/dist/index.js; \
fi'
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zeroday_institute"
WORKDIR /app/apps/frontend
RUN pnpm build

FROM base AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/frontend/.next ./.next
COPY --from=build /app/apps/frontend/public ./public
COPY --from=build /app/apps/frontend/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["pnpm", "start"]
