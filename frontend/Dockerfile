# Сборка приложения
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
#RUN npm install

COPY . .
RUN npm run build

# Финальный образ с Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80