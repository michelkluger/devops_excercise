FROM oven/bun:1 AS build

WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build the app
COPY . .
RUN bun run build

# Serve with nginx
FROM nginx:alpine

LABEL org.opencontainers.image.title="PSI VM Provisioning UI"
LABEL org.opencontainers.image.description="React frontend for VM provisioning"

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
    CMD ["wget", "-qO-", "http://localhost:80/", "||", "exit", "1"]
