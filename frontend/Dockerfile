# Сборка приложения
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./

COPY frontend/ ./
RUN npm install
RUN npm run build

# Финальный образ с Nginx и SSL
FROM nginx:alpine

# Отключаем ненужные скрипты в /docker-entrypoint.d/
RUN chmod -x /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
RUN chmod -x /docker-entrypoint.d/20-envsubst-on-templates.sh

# Копируем собранный фронтенд
COPY --from=build /app/build /usr/share/nginx/html

# Открываем порт 443 для HTTPS
EXPOSE 443