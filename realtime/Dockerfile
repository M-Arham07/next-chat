# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps (better caching)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Only install production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built output
COPY --from=build /app/dist ./dist

# If you have runtime assets (views/public/prisma/etc), copy them too:
# COPY --from=build /app/public ./public
# COPY --from=build /app/views ./views
# COPY --from=build /app/prisma ./prisma

# Expose your app port (adjust if not 3000)
EXPOSE 3000

# Start
CMD ["node", "dist/server.js"]
