# Сборка приложения
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm run build

# Финальный образ с Nginx и SSL
FROM nginx:alpine

# Исправленный путь к сертификатам
COPY ./certs /etc/nginx/certs

# Копируем конфиг NGINX
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранный фронтенд
COPY --from=build /app/build /usr/share/nginx/html

# Открываем порт 443 для HTTPS
EXPOSE 443