# 공식 Python slim 이미지를 베이스로 사용
FROM python:3.10-slim

WORKDIR /app

# 의존성 파일 복사 후 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 소스 복사
COPY . .

# 로그를 저장할 디렉토리 생성 (로그는 app 내에서 파일로 남기도록 설정)
RUN mkdir -p /var/log/fastapi

# 8000번 포트를 개방
EXPOSE 8000

# uvicorn을 통해 FastAPI 앱 실행 (main.py 내에 app 인스턴스가 정의되어 있어야 함)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

