FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Build CAP artifacts for production
RUN npx cds build

# Expose default CAP port
EXPOSE 4004

# Environment variables
ENV NODE_ENV=production
ENV PORT=4004

# Start CAP server
CMD ["npm", "start"]
