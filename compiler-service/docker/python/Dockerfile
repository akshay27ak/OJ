FROM python:3.9-alpine

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

# Set resource limits
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Entry point with dumb-init for proper signal handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
