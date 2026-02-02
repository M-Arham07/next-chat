# ---------- BUILD STAGE ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./

# Install deps (include toolchain needed to compile TS)
RUN npm ci && npm i -D typescript @types/node

# Copy source
COPY . .

# Force compile server.ts -> dist/server.js (guarantees /app/dist exists)
# Uses tsconfig if present for path/module settings, but still forces outDir.
RUN npx tsc -p tsconfig.json --outDir dist || \
    npx tsc server.ts --outDir dist --module commonjs --target ES2020 --esModuleInterop

    

# ---------- RUNTIME STAGE ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 8080
CMD ["node", "dist/server.js"]
