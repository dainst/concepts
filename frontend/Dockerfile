# run from project root!

FROM node:26-trixie-slim AS builder

COPY common /common
COPY frontend/package*.json /app/.
COPY frontend/tsconfig*.json /app/.
COPY frontend/angular.json /app/.
COPY frontend/src /app/src

WORKDIR /app

RUN npm ci
RUN npm run build


FROM nginx:stable-alpine-slim AS production

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/concepts-frontend/browser /usr/share/nginx/html
COPY frontend/config/nginx.conf /etc/nginx/templates/default.conf.template
COPY frontend/public/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

