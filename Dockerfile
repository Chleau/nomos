# --- Étape de base (commune) ---
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# --- Étape Développement ---
FROM base AS development
RUN npm install --legacy-peer-deps
COPY . .
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# --- Étape Build (pour la prod) ---
FROM base AS build-step
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# --- Étape Production (l'image finale légère) ---
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
USER nextjs

COPY --from=build-step /app/.next ./.next
COPY --from=build-step /app/node_modules ./node_modules
COPY --from=build-step /app/package.json ./package.json

CMD ["npm", "start"]