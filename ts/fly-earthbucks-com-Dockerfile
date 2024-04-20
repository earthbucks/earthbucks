# syntax = docker/dockerfile:1

FROM node:20-alpine as base

LABEL fly_launch_runtime="Remix"

WORKDIR /app

ENV NODE_ENV="production"

ARG PNPM_VERSION=8.15.3
RUN npm install -g pnpm@$PNPM_VERSION

FROM base as build

WORKDIR /app

COPY --link ./pnpm-lock.yaml ./
COPY --link ./pnpm-workspace.yaml ./
RUN pnpm install --prod=false

COPY --link . .

WORKDIR /app/earthbucks-com

RUN pnpm install --prod=false

RUN pnpm run build

RUN pnpm prune --prod

FROM base

WORKDIR /app

COPY --from=build /app /app

WORKDIR /app/earthbucks-com

EXPOSE 3000
CMD [ "pnpm", "run", "start" ]
