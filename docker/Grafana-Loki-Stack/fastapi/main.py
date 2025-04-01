import logging
import json
import time
from fastapi import FastAPI, Request
from datetime import datetime, timezone, timedelta

# JSON 포맷터 설정
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.now(timezone.utc).astimezone(timezone(timedelta(hours=9))).strftime("%Y-%m-%d %H:%M:%S"),
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
        }
        return json.dumps(log_record)

# 로깅 설정
log_formatter = JSONFormatter()
file_handler = logging.FileHandler("/var/log/fastapi/app.log")
file_handler.setFormatter(log_formatter)

stream_handler = logging.StreamHandler()
stream_handler.setFormatter(log_formatter)

logger = logging.getLogger("fastapi-app")
logger.setLevel(logging.INFO)
logger.addHandler(file_handler)
logger.addHandler(stream_handler)

app = FastAPI()

# 요청 및 응답 로깅 미들웨어
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    logger.info(json.dumps({
        "event": "Request started",
        "method": request.method,
        "path": request.url.path
    }))

    response = await call_next(request)

    process_time = time.time() - start_time
    logger.info(json.dumps({
        "event": "Request completed",
        "method": request.method,
        "path": request.url.path,
        "duration": f"{process_time:.4f}s"
    }))

    return response

@app.get("/")
async def root():
    logger.info(json.dumps({"event": "Root endpoint called"}))
    return {"message": "Hello World"}

@app.get("/health")
async def health():
    logger.info(json.dumps({"event": "Health check called"}))
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/error")
async def trigger_error():
    logger.error(json.dumps({"event": "Error triggered"}))
    return {"error": "This is a sample error log message"}

@app.post("/log")
async def log_message(message: str):
    logger.info(json.dumps({"event": "Custom log", "message": message}))
    return {"status": "logged", "message": message}
