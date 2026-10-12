# Build stage
FROM node:22.16.0-alpine3.22@sha256:41e4389f3d988d2ed55392df4db1420ad048ae53324a8e2b7c6d19508288107e AS builder

WORKDIR /opt/kurau

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Production stage
FROM node:22.16.0-alpine3.22@sha256:41e4389f3d988d2ed55392df4db1420ad048ae53324a8e2b7c6d19508288107e AS runtime

# Add runtime dependencies
RUN apk add --no-cache tini

# Pelican/Wings images conventionally run as container in /home/container.
RUN adduser -D -h /home/container container

WORKDIR /opt/kurau

# Copy node modules from builder
COPY --from=builder --chown=container:container /opt/kurau/node_modules ./node_modules

# Copy application files
COPY --chown=container:container . .
COPY --chown=container:container docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
    && mkdir -p /home/container \
    && chown container:container /home/container

# Switch to non-root user
USER container

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--", "/entrypoint.sh"]

# Verify the bot is still writing its runtime heartbeat.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD ["node", "-e", "const fs=require('fs');const p=process.env.HEALTHCHECK_HEARTBEAT_PATH||'/tmp/beatdock-alive';try{const s=fs.statSync(p);process.exit(Date.now()-s.mtimeMs<120000?0:1)}catch{process.exit(1)}"]

# Start the application
CMD ["node", "/opt/kurau/src/index.js"]
