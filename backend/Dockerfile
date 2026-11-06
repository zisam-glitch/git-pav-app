# backend/Dockerfile — Pav Dental API
# Release command: npx prisma migrate deploy (DK-1)
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY prisma ./prisma

RUN mkdir -p /app/uploads && chown -R node:node /app
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 3000) + '/livez').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Hosts that cannot run a separate release command (for example Render's free
# plan) set RUN_MIGRATIONS=1 so pending migrations apply before the server
# starts; a failed migration stops the start. Left unset, it just starts.
CMD ["sh", "-c", "if [ \"$RUN_MIGRATIONS\" = \"1\" ]; then npx prisma migrate deploy; fi && exec node dist/src/server.js"]
