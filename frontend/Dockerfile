# ── Estágio build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

ARG VITE_API_URL=http://localhost:3333/api
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Estágio runtime (Nginx) ───────────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Config Nginx para SPA (redireciona 404 → index.html para React Router)
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  gzip on;\n\
  gzip_types text/plain text/css application/javascript application/json;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
  location ~* \\.(js|css|png|jpg|gif|ico|svg|woff2?)$ {\n\
    expires 1y;\n\
    add_header Cache-Control "public, immutable";\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
