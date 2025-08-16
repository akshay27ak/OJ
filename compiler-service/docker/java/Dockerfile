FROM openjdk:11-alpine

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

# Set JVM options for security and performance
ENV JAVA_OPTS="-Xmx256m -Xms64m -XX:+UseSerialGC -Djava.security.manager -Djava.security.policy=/workspace/java.policy"

# Entry point with dumb-init for proper signal handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
