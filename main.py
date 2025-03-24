from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

ROOT_PATH = "/"
app = FastAPI()

# 1. 정적 파일 설정
app.mount('/static', StaticFiles(directory='.'), name='static')


@app.get(ROOT_PATH)
async def get_root_message():
    return {"message": "Hello World!!"}


@app.get("/add")
async def add_numbers(num1: int, num2: int):
    result = num1 + num2
    return {"num1": num1, "num2": num2, "sum": result}


# 2. 프론트 화면(html) 제공하는 엔드포인트
@app.get("/front", response_class=HTMLResponse)
async def get_front_page():
    with open("index.html", encoding='utf-8') as f:
        return HTMLResponse(content=f.read())
