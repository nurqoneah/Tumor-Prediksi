FROM node:20-slim

# Install Python, pip, and compilation tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create symlink so 'python' runs 'python3'
RUN ln -s /usr/bin/python3 /usr/bin/python

# Install Python ML packages
# Use --break-system-packages as we are in a dedicated system container environment
RUN pip3 install --no-cache-dir numpy joblib scikit-learn --break-system-packages

WORKDIR /app

# Install bun globally
RUN npm install -g bun

# Copy configuration files
COPY package.json bun.lock* ./

# Install project dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Generate Prisma Client
RUN bun run db:generate

# Build Next.js application (output will be in .next/standalone)
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Next.js standalone server configuration
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production

# Expose port (Railway overrides this dynamically with PORT env)
EXPOSE 3000

# Start server directly using node to bind properly and forward signals
CMD ["node", ".next/standalone/server.js"]
