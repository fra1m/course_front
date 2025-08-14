# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /app

# Копируем package.json + lock, если есть
COPY package.json ./
COPY package-lock.json ./

# Если есть package-lock.json — используем воспроизводимый npm ci, иначе обычный install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Копируем остальной код
COPY . .

# Vite читает переменные VITE_* на этапе билд
ARG VITE_API_BASE=/course_api
ENV VITE_API_BASE=$VITE_API_BASE

# Запуск стандартного билда (из твоего package.json: "build": "tsc -b && vite build")
RUN npm run build

# ---------- nginx ----------
FROM alpine:3.20
RUN apk add --no-cache nginx && mkdir -p /run/nginx

# Наш конфиг кладём в место, которое использует пакетный nginx на Alpine
# (у package nginx путь include по умолчанию — /etc/nginx/http.d/*.conf)
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Статика фронта
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]