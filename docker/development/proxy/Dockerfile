FROM node:20-alpine as frontend-build
WORKDIR /app
RUN apk add git
COPY ./cc/client /app
COPY ./.envs/.development/.frontend /app/.env
RUN npm install --force --legacy-peer-deps
ENV NODE_OPTIONS=--max-old-space-size=6144
# RUN npm run build 

FROM nginx:alpine
COPY ./docker/development/proxy/config/conf.d/default.conf /etc/nginx/conf.d/default.conf
# COPY --from=frontend-build /app/dist /build