from fastapi import FastAPI, WebSocket, UploadFile, File
from pydantic import BaseModel
import asyncio
import csv
from io import StringIO
from icmplib import async_ping
from datetime import datetime
from typing import List, Optional

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://frontend:3000",
    "ws://frontend:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)


class Host(BaseModel):
    ip: str
    status: str = "unknown"
    rtt: Optional[float] = None
    delivered: float = 0.0
    loss: float = 0.0
    last_ping: str = "00:00:00"

hosts_db: List[Host] = []
monitoring_task = None

def is_valid_ip(ip: str) -> bool:
    parts = ip.split('.')
    return len(parts) == 4 and all(
        part.isdigit() and 0 <= int(part) <= 255
        for part in parts
    )

async def ping_hosts():
    while True:
        for host in hosts_db:
            try:
                result = await async_ping(
                    host.ip,
                    count=1,
                    timeout=1,
                    privileged=False
                )
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
        await asyncio.sleep(1)

@app.on_event("startup")
async def startup_event():
    global monitoring_task
    monitoring_task = asyncio.create_task(ping_hosts())

@app.websocket("/api/ws/monitor")
async def monitor(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_json([host.dict() for host in hosts_db])
            await asyncio.sleep(1)
    except:
        await websocket.close()

@app.get("/api/hosts", response_model=List[Host])
async def get_hosts():
    return hosts_db

@app.post("/api/hosts")
async def add_host(host: Host):
    if not is_valid_ip(host.ip):
        return {"status": "error", "message": "Invalid IP"}
    if host.ip not in [h.ip for h in hosts_db]:
        hosts_db.append(host)
        return {"status": "success"}
    return {"status": "duplicate"}

@app.post("/api/import")
async def import_csv(file: UploadFile = File(...)):
    content = await file.read()
    reader = csv.reader(StringIO(content.decode()), delimiter=';')
    for row in reader:
        if row and is_valid_ip(row[0]):
            hosts_db.append(Host(ip=row[0]))
    return {"status": "success"}

from fastapi.responses import Response

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