# run from project root!

FROM node:26-trixie-slim AS builder

COPY common /common
COPY backend/package*.json /app/.
COPY backend/tsconfig*.json /app/.
COPY backend/nest-cli.json /app/nest-cli.json
COPY backend/src /app/src

WORKDIR /app

RUN npm ci
RUN npm run build

FROM node:26-trixie-slim AS production
RUN mkdir /app

COPY backend/package*.json /app/.

WORKDIR /app

ENV NODE_ENV=production
RUN npm ci --omit=dev

COPY --from=builder /app/dist /app/.

CMD ["node", "main.js"]

EXPOSE 3000

