# Stage 1: Build React app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm install --silent
COPY . .
# VITE_API_URL is the backend Cloud Run URL, passed at build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Nginx config to support React Router (single-page app)
RUN echo 'server { listen 8080; location / { root /usr/share/nginx/html; try_files $uri /index.html; } }' \
    > /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
