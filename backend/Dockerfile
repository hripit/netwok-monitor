# Сборка
FROM python:3.9-slim AS builder

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --user -r requirements.txt

# Финальный образ
FROM python:3.9-slim

WORKDIR /app
COPY --from=builder /root/.local /root/.local

# Копируем сертификаты из корня проекта
COPY ./certs /app/certs

COPY backend/. .
ENV PATH=/root/.local/bin:$PATH

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "443", "--ssl-keyfile", "/app/certs/key.pem", "--ssl-certfile", "/app/certs/cert.pem"]