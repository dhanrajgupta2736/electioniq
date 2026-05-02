# ---- ElectionIQ — Cloud Run Container ----
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm install --production

# Copy application files
COPY server/ ./server/
COPY public/ ./public/

# Cloud Run listens on 8080 by default
EXPOSE 8080

CMD ["node", "server/index.js"]
