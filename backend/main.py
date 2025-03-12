import ipaddress
import os
import logging
from fastapi import FastAPI, WebSocket, UploadFile, File, HTTPException
from pydantic import BaseModel
import asyncio
import csv
import uvicorn
from io import StringIO
from icmplib import async_ping
from datetime import datetime
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from starlette.websockets import WebSocketDisconnect
from contextlib import asynccontextmanager


# Определение lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Запуск фоновой задачи при старте
    asyncio.create_task(ping_hosts())
    logger.info("Приложение запущено. Фоновая задача ping_hosts активирована.")

    yield  # Приложение работает

    logger.info("Приложение завершает работу.")


app = FastAPI(lifespan=lifespan)

origins = [
    'https://localhost:8443',
    'https://localhost',
    'https://backend:443',
    'http://localhost:3000',  # для отладки
]

# В настройках CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Настройка логирования
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


class Host(BaseModel):
    ip: str
    status: str = "unknown"
    rtt: Optional[float] = None
    delivered: float = 0.0
    loss: float = 0.0
    last_ping: str = "00:00:00"

    class Config:
        from_attributes = True


hosts_db: List[Host] = []
active_connections = []

monitoring_task = None


# Валидация IP-адреса
def is_valid_ip(ip: str) -> bool:
    try:
        ipaddress.IPv4Address(ip)
        return True
    except ipaddress.AddressValueError:
        return False


# Пинг хостов
async def ping_hosts():
    while True:
        tasks = [ping_host(host) for host in hosts_db]
        await asyncio.gather(*tasks)
        await broadcast_hosts_update()
        await asyncio.sleep(0.5)


async def ping_host(host):
    logger.info(f"{datetime.now()}: Проверка хоста: {host.ip}, статус: {host.status}")
    try:
        result = await async_ping(host.ip, interval=0.1, count=10, timeout=1)
        host.status = "online" if result.is_alive else "offline"
        host.rtt = result.avg_rtt * 1000 if result.is_alive else None
        host.loss = result.packet_loss * 100
        host.delivered = 100 - host.loss
        host.last_ping = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    except Exception as e:
        host.status = "error"
        host.rtt = None
        host.loss = 100.0
        host.delivered = 0.0


@app.websocket("/api/ws/monitor")
async def websocket_monitor(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    closed = False  # Флаг для отслеживания состояния

    try:
        # Отправляем текущее состояние при подключении
        await websocket.send_json([host.dict() for host in hosts_db])

        while True:
            try:
                # Ожидаем данные от клиента
                data = await websocket.receive_text()
                if data == "refresh":
                    await websocket.send_json([host.dict() for host in hosts_db])
            except WebSocketDisconnect:
                # Клиент корректно закрыл соединение
                closed = True
                break
            except Exception:
                closed = True
                break

    finally:
        # Безопасное удаление соединения
        if websocket in active_connections:
            active_connections.remove(websocket)
        # Закрываем только если соединение ещё активно
        if not closed:
            await websocket.close()


# Получение всех хостов
@app.get("/api/hosts")
async def get_hosts():
    return hosts_db


# Рассылка обновлений всем клиентам
async def broadcast_hosts_update():
    data = [host.dict() for host in hosts_db]
    for connection in list(active_connections):  # Используем копию списка
        try:
            await connection.send_json(data)
        except Exception:
            print('Удалили соединение... host ')
            active_connections.remove(connection)


# Добавление хоста
@app.post("/api/hosts")
async def add_host(host: Host):
    # Проверка дубликатов
    if not is_valid_ip(host.ip):
        raise HTTPException(400, "Invalid IP address")

    if host.ip.lower() in [h.ip.lower() for h in hosts_db]:
        raise HTTPException(409, "Host already exists")

    hosts_db.append(host)
    await broadcast_hosts_update()  # Мгновенное обновление для всех клиентов
    return {"status": "success", "host": host.model_dump()}


@app.post("/api/import")
async def import_csv(file: UploadFile = File(...)):
    try:
        content = await file.read()
        reader = csv.reader(StringIO(content.decode()), delimiter=';')
        added = 0
        for row in reader:
            if row and is_valid_ip(row[0]):
                ip = row[0]
                if ip not in [h.ip for h in hosts_db]:
                    hosts_db.append(Host(ip=ip))
                    added += 1
        return {"status": "success", "added": added}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ошибка при импорте CSV: {str(e)}")


@app.get("/api/export")
async def export_csv():
    output = StringIO()
    writer = csv.writer(output, delimiter=';')
    writer.writerow([
        "IP", "Статус", "RTT, мс",
        "% доставки", "% потерь", "Последний пинг"
    ])
    for host in hosts_db:
        writer.writerow([
            host.ip,
            host.status,
            f"{host.rtt:.1f}" if host.rtt else "n/a",
            f"{host.delivered:.1f}%",
            f"{host.loss:.1f}%",
            host.last_ping
        ])
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=hosts.csv"}
    )


if __name__ == "__main__":
    use_ssl = os.getenv('USE_SSL', 'True').lower() == 'true'
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8443 if use_ssl else 8080,
        reload=True,
        ssl_keyfile="/app/certs/key.pem" if use_ssl else None,
        ssl_certfile="/app/certs/cert.pem" if use_ssl else None
    )
