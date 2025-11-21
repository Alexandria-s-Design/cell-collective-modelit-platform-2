FROM node:20-alpine as frontend-build-prod

ARG CC_GIT_COMMIT
ARG CC_GIT_BRANCH
ARG CC_GIT_TAG

ENV CC_GIT_COMMIT=$CC_GIT_COMMIT
ENV CC_GIT_BRANCH=$CC_GIT_BRANCH
ENV CC_GIT_TAG=$CC_GIT_TAG

WORKDIR /app

RUN apk add git

COPY ./cc/client /app
COPY ./.envs/.production/.frontend /app/.env
ENV NODE_OPTIONS=--max-old-space-size=6144
RUN npm install --force --legacy-peer-deps
RUN npm run build

FROM nginx:alpine
COPY ./docker/production/proxy/config/conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build-prod /app/dist /build