FROM node:20-alpine
WORKDIR /app

RUN apk add git

COPY ./cc/client /app
COPY ./.envs/.development/.frontend /app/.env

RUN npm install --force --legacy-peer-deps
