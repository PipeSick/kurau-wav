# Build stage
FROM node:22.22.3-alpine3.22@sha256:cd7807368cf24826297cbad5dca1a44972ccfd770647db52a8c7589eb4599ac8 AS builder

WORKDIR /home/container

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Production stage
FROM node:22.22.3-alpine3.22@sha256:cd7807368cf24826297cbad5dca1a44972ccfd770647db52a8c7589eb4599ac8 AS runtime

# Add runtime dependencies
RUN apk add --no-cache tini

# Pelican/Wings images conventionally run as container in /home/container.
RUN adduser -D -h /home/container container

WORKDIR /home/container

# Copy node modules from builder
COPY --from=builder --chown=container:container /home/container/node_modules ./node_modules

# Copy application files
COPY --chown=container:container . .
COPY --chown=container:container docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Switch to non-root user
USER container

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--", "/entrypoint.sh"]

# Verify the bot is still writing its runtime heartbeat.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD ["node", "-e", "const fs=require('fs');const p=process.env.HEALTHCHECK_HEARTBEAT_PATH||'/tmp/beatdock-alive';try{const s=fs.statSync(p);process.exit(Date.now()-s.mtimeMs<120000?0:1)}catch{process.exit(1)}"]

# Start the application
CMD ["node", "src/index.js"]
