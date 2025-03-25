from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

ROOT_PATH = "/"
app = FastAPI()

# 1. 정적 파일 설정
app.mount('/static', StaticFiles(directory='.'), name='static')

@app.get("/favicon.ico")
async def get_favicon():
    return FileResponse("favicon.png")

@app.get(ROOT_PATH)
async def get_root_message():
    return {"message": "Hello World!!"}
