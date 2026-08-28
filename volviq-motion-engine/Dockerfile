FROM node:20-alpine

# Install system dependencies needed for compiling fonts or native canvas additions
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy dependency configs
COPY package.json package-lock.json ./

# Install dependencies (clean install)
RUN npm ci

# Copy codebase
COPY . .

# Set build-time environments
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Hugging Face Spaces requires port 7860
ENV PORT=7860
ENV HOSTNAME="0.0.0.0"

# Build production bundle
RUN npm run build

# Expose the port
EXPOSE 7860

# Start Next.js server
CMD ["npm", "start"]
