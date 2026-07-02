FROM node:26-trixie-slim

WORKDIR /common
COPY ../* ./

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY src .
COPY *.json .

EXPOSE 3000
