# ---------- BUILD STAGE ----------
FROM node:20-alpine AS build
WORKDIR /app

# Copy manifests first for caching
COPY package*.json ./

# Install deps (including dev deps) + force TS toolchain availability
RUN npm ci \
  && npm i -D typescript @types/node

# Copy source
COPY . .

# Compile TS -> JS (expects "build" script uses tsc -p tsconfig.json)
RUN npm run build


# ---------- RUNTIME STAGE ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built output
COPY --from=build /app/dist ./dist

# Change this if your server listens on a different port
EXPOSE 8080

CMD ["node", "dist/server.js"]
