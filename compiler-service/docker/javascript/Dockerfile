FROM node:18-alpine

# Install security tools and create non-root user
RUN apk add --no-cache \
    dumb-init \
    && addgroup -g 1000 coderunner \
    && adduser -D -s /bin/sh -u 1000 -G coderunner coderunner

# Set working directory
WORKDIR /workspace

# Create necessary directories
RUN mkdir -p /tmp/execution && chown coderunner:coderunner /tmp/execution

# Switch to non-root user
USER coderunner

# Set Node.js environment
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=256"

# Entry point with dumb-init for proper signal handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
