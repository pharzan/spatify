# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy the build output
# Note: Next.js 'export' output is in 'out' folder
COPY --from=builder /app/out /usr/share/nginx/html

# Copy custom Nginx config to handle routing and basePath
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
