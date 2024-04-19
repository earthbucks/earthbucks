# syntax = docker/dockerfile:1

FROM node:20-alpine as base

LABEL fly_launch_runtime="Remix"

WORKDIR /app

ENV NODE_ENV="production"

ARG PNPM_VERSION=8.15.3
RUN npm install -g pnpm@$PNPM_VERSION

FROM base as build

# COPY --link package.json pnpm-lock.yaml ./
# RUN pnpm install --frozen-lockfile --prod=false
COPY --link package.json ./
RUN pnpm install --prod=false

COPY --link . .

RUN pnpm run build

RUN pnpm prune --prod

FROM base

COPY --from=build /app /app

EXPOSE 3000
CMD [ "pnpm", "run", "start" ]
