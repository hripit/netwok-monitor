# Network Monitor

Приложение для мониторинга состояния сетевых хостов.  
Позволяет добавлять IP-адреса, отслеживать их доступность, а также экспортировать и импортировать данные в формате CSV.

## Основные функции

- **Мониторинг хостов**: Отслеживание статуса (online/offline), времени отклика (RTT), процента потерь и доставки пакетов.
- **WebSocket**: Реальное время обновления данных через WebSocket.
- **Импорт/Экспорт**: Возможность импорта и экспорта данных в формате CSV.
- **SSL**: Поддержка HTTPS для безопасного соединения.

---

## Технический стек

### Backend
- **Фреймворк**:
  - **FastAPI**: Асинхронный веб-фреймворк для Python.
  - **Uvicorn**: ASGI-сервер для запуска FastAPI.
  - **Pydantic**: Для валидации данных и типизации.
- **Базовые технологии**:
  - **Python 3.9**.
  - **asyncio**: Для асинхронных операций.
  - **ICMP-пинг**: Через библиотеку `icmplib` для мониторинга хостов.
- **Контейнеризация**:
  - **Docker**: С многоэтапной сборкой (используется `python:3.9-slim`).
  - **SSL-сертификаты**: Для HTTPS через Nginx.
- **Другие инструменты**:
  - **CORS**: Настройка кросс-доменных запросов.
  - **CSV-обработка**: Импорт/экспорт данных.

### Frontend
- **Фреймворк**:
  - **React**: Создан через Create React App.
  - **TypeScript**: Для статической типизации.
- **UI-библиотеки**:
  - **Material-UI (MUI)**: Компоненты интерфейса.
  - **ag-Grid**: Таблица для отображения данных.
  - **React Router**: Маршрутизация.
- **Контейнеризация**:
  - **Docker**: С Nginx для обслуживания статических файлов.
  - **WebSocket**: Для реального времени через `wss://`.
- **Дополнительно**:
  - **CSV-экспорт**: Через `react-csv`.
  - **Проксирование запросов**: Через `http-proxy-middleware`.

### Инфраструктура
- **Оркестрация**:
  - **Docker Compose**: Для связки backend/frontend.
  - **Сеть**: Bridge-сеть `app-network` для взаимодействия контейнеров.
- **Безопасность**:
  - **HTTPS**: Через самоподписанные сертификаты в `certs/`.
  - **CORS**: Строгая настройка разрешенных origin.
- **Сборка**:
  - **Nginx**: В качестве reverse-proxy для frontend.
  - **Node.js 18**: Для сборки React-приложения.

---

## Установка и запуск

1. **Клонируйте репозиторий**:
   ```bash
   git clone https://github.com/your-repo/network-monitor.git
   cd network-monitor
   docker-compose up --build
2. **Приложение будет доступно по адресам**:
   http://localhost  или https://localhost 
