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
ENV DATABASE_URL="file:///app/db/custom.db"

# Create database directories and ensure they are writable
RUN mkdir -p /db && chmod -R 777 /db
RUN mkdir -p /app/db && chmod -R 777 /app/db

# Overwrite .env file in build container to prevent local env loader from overriding our DATABASE_URL
RUN echo 'DATABASE_URL="file:///app/db/custom.db"' > /app/.env

# Remove pre-existing sqlite db from build copy to prevent system/user permission lockouts at runtime
RUN rm -f /app/db/custom.db || true

# Copy Python scripts, model, and dataset / upload scenarios to the standalone server directory
# Next.js compiler does not trace non-JS assets dynamically executed via CLI (python predict.py)
RUN mkdir -p .next/standalone/src/lib/
RUN cp src/lib/predict.py .next/standalone/src/lib/
RUN cp src/lib/tumor_model.joblib .next/standalone/src/lib/
RUN cp -r upload .next/standalone/upload

# Expose port (Railway overrides this dynamically with PORT env)
EXPOSE 3000

# Start server: run Prisma db push on startup to initialize database tables, then start the server
CMD ["sh", "-c", "npx prisma db push && node .next/standalone/server.js"]
