<<<<<<< HEAD
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import random
import asyncio

app = FastAPI()

app.mount("/public", StaticFiles(directory="public"), name="public")

connected_clients = []
called_numbers = set()  # ここで出た数字を管理

async def broadcast(message: str):
    for client in connected_clients:
        await client.send_text(message)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    # 新規クライアントにこれまでの数字を全部送る
    for num in called_numbers:
        await websocket.send_text(str(num))
    try:
        while True:
            # 新しい数字をランダムに選ぶけど、重複禁止
            if len(called_numbers) == 75:
                # 全部出たらリセット
                called_numbers.clear()
            while True:
                number = random.randint(1, 75)
                if number not in called_numbers:
                    break
            called_numbers.add(number)
            await broadcast(str(number))
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        connected_clients.remove(websocket)

@app.get("/")
async def root():
    return RedirectResponse(url="/public/index.html")
=======
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import random
import asyncio

app = FastAPI()

app.mount("/public", StaticFiles(directory="public"), name="public")

connected_clients = []
called_numbers = set()  # ここで出た数字を管理

async def broadcast(message: str):
    for client in connected_clients:
        await client.send_text(message)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    # 新規クライアントにこれまでの数字を全部送る
    for num in called_numbers:
        await websocket.send_text(str(num))
    try:
        while True:
            # 新しい数字をランダムに選ぶけど、重複禁止
            if len(called_numbers) == 75:
                # 全部出たらリセット
                called_numbers.clear()
            while True:
                number = random.randint(1, 75)
                if number not in called_numbers:
                    break
            called_numbers.add(number)
            await broadcast(str(number))
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        connected_clients.remove(websocket)

@app.get("/")
async def root():
    return RedirectResponse(url="/public/index.html")
>>>>>>> 3abe4b1 (初めてのコミット！)
