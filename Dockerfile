# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=21.6.2
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install pnpm
ARG PNPM_VERSION=9.12.3
RUN npm install -g pnpm@$PNPM_VERSION


# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
# First, copy only the workspace config and root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Then copy the server package.json
COPY ./server/package.json ./server/
RUN pnpm install --frozen-lockfile

COPY ./server ./server
# WORKDIR /app/server

# RUN pnpm run build

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

ENV PORT=3000
# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "node", "server/dist/main.js" ]
