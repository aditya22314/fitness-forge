# ---- Build stage ----
# Produces the TanStack Start build output (Cloudflare Worker bundle in .output/).
FROM oven/bun:1.2 AS build
WORKDIR /app

# Install deps first for better layer caching
COPY package.json bun.lockb* bunfig.toml* ./
RUN bun install --frozen-lockfile || bun install

# Copy the rest of the source
COPY . .

# Build-time public env vars (safe to bake in — they're VITE_ publishable values)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
    VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID

RUN bun run build

# ---- Runtime stage ----
# The real runtime target is Cloudflare Workers. This container serves the
# built client assets + runs `vite preview` so you can smoke-test the build
# locally (`docker run -p 4173:4173 iron`). It is NOT production SSR.
FROM oven/bun:1.2-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4173

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output
COPY --from=build /app/dist ./dist
COPY --from=build /app/vite.config.ts ./vite.config.ts

EXPOSE 4173
CMD ["bun", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]