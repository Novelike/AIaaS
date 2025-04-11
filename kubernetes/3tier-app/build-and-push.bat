@echo off

:: Docker Hub 로그인
docker login kc-sfacspace.kr-central-2.kcr.dev --username 3c41de12a5914a34b737808a59a4925f --password 165638666ebad648e994dbd0417dd5582c4855b59f79e0499fbb9096fcb237b74646a8
if %ERRORLEVEL% neq 0 (
    echo Docker 로그인 실패. 스크립트를 종료합니다.
    exit /b 1
)

:: 프론트엔드 이미지 빌드 및 푸시
cd frontend
docker build -t kc-sfacspace.kr-central-2.kcr.dev/kjh-repo/kjh-3tier-frontend:latest . --no-cache
if %ERRORLEVEL% neq 0 (
    echo 프론트엔드 이미지 빌드 실패. 스크립트를 종료합니다.
    exit /b 1
)
docker push kc-sfacspace.kr-central-2.kcr.dev/kjh-repo/kjh-3tier-frontend:latest
if %ERRORLEVEL% neq 0 (
    echo 프론트엔드 이미지 푸시 실패. 스크립트를 종료합니다.
    exit /b 1
)

:: 백엔드 이미지 빌드 및 푸시
cd ../backend
docker build -t kc-sfacspace.kr-central-2.kcr.dev/kjh-repo/kjh-3tier-backend:latest . --no-cache
if %ERRORLEVEL% neq 0 (
    echo 백엔드 이미지 빌드 실패. 스크립트를 종료합니다.
    exit /b 1
)
docker push kc-sfacspace.kr-central-2.kcr.dev/kjh-repo/kjh-3tier-backend:latest
if %ERRORLEVEL% neq 0 (
    echo 백엔드드 이미지 푸시 실패. 스크립트를 종료합니다.
    exit /b 1
)

:: 데이터베이스 이미지 빌드 및 푸시 (선택 사항)
cd ../database
docker build -t kc-sfacspace.kr-central-2.kcr.dev/kjh-repo/kjh-3tier-database:latest . --no-cache
if %ERRORLEVEL% neq 0 (
    echo 데이터베이스 이미지 빌드 실패. 스크립트를 종료합니다.
    exit /b 1
)
docker push kc-sfacspace.kr-central-2.kcr.dev/kjh-repo/kjh-3tier-database:latest
if %ERRORLEVEL% neq 0 (
    echo 데이터베이스 이미지 푸시 실패. 스크립트를 종료합니다.
    exit /b 1
)

echo 모든 작업이 완료되었습니다.
exit /b 0