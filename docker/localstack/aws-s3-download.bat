@echo off
setlocal enabledelayedexpansion

:: 내부 IP 마지막 자리 입력
set /p LAST_OCTET="내부 IP의 마지막 숫자를 입력하세요 (예: 100): "
set "ENDPOINT_IP=192.168.45.%LAST_OCTET%"

:: S3 버킷 목록 가져오기
set count=0
for /f "tokens=3" %%a in ('aws s3 ls --endpoint-url=http://%ENDPOINT_IP%:4566') do (
    set /a count+=1
    set "BUCKETS[!count!]=%%a"
    echo !count!. %%a
)

:: 버킷 선택
set /p BUCKET_CHOICE="사용할 S3 버킷 번호를 선택하세요: "
if not defined BUCKET_CHOICE (
    echo [오류] 유효한 버킷 번호를 입력하세요.
    exit /b
)
set "SELECTED_BUCKET=!BUCKETS[%BUCKET_CHOICE%]!"
if not defined SELECTED_BUCKET (
    echo [오류] 존재하는 버킷 번호를 입력하세요.
    exit /b
)
echo 선택한 버킷: %SELECTED_BUCKET%

:: 다운로드 또는 업로드 선택
echo.
echo 1. 파일 다운로드
echo 2. 파일 업로드
set /p ACTION="실행할 작업을 선택하세요 (1: 다운로드, 2: 업로드): "
set "ACTION=%ACTION: =%"  :: 공백 제거

:: 입력값 검증
if not defined ACTION (
    echo [오류] 입력값이 없습니다.
    exit /b
)

if "%ACTION%"=="1" (echo hi1)
if "%ACTION%"=="2" (echo hi2)

:: --- 파일 다운로드 ---
if "%ACTION%"=="1" (
    echo [파일 다운로드 시작]
    set file_count=0
    for /f "tokens=4" %%b in ('aws s3 ls s3://%SELECTED_BUCKET% --endpoint-url=http://%ENDPOINT_IP%:4566') do (
        set /a file_count+=1
        set "FILES[!file_count!]=%%b"
        echo !file_count!. %%b
    )

    if %file_count%==0 (
        echo [오류] 선택한 버킷에 파일이 없습니다.
        exit /b
    )

    set /p FILE_CHOICE="다운로드할 파일 번호를 선택하세요: "
    if not defined FILE_CHOICE (
        echo [오류] 잘못된 입력입니다.
        exit /b
    )

    set "SELECTED_FILE=!FILES[%FILE_CHOICE%]!"
    if not defined SELECTED_FILE (
        echo [오류] 유효한 파일 번호를 입력하세요.
        exit /b
    )

    aws s3 cp "s3://%SELECTED_BUCKET%/%SELECTED_FILE%" . --endpoint-url=http://%ENDPOINT_IP%:4566
    echo 다운로드 완료: %SELECTED_FILE%
)

:: --- 파일 업로드 ---
if "%ACTION%"=="2" (
    echo [파일 업로드 시작]

    for /f "delims=" %%d in ('powershell -Command "pwd | Select-Object -ExpandProperty Path"') do set "CURRENT_PATH=%%d"
    echo 현재 경로: %CURRENT_PATH%

    set file_index=0
    echo 현재 폴더의 파일 목록:
    for /f "delims=" %%e in ('powershell -Command "Get-ChildItem -File | Select-Object -ExpandProperty Name"') do (
        set /a file_index+=1
        set "LOCAL_FILES[!file_index!]=%%e"
        echo !file_index!. %%e
    )

    if %file_index%==0 (
        echo [오류] 현재 폴더에 업로드할 파일이 없습니다.
        exit /b
    )

    set /p FILE_CHOICE="업로드할 파일 번호를 선택하세요: "
    if not defined FILE_CHOICE (
        echo [오류] 잘못된 입력입니다.
        exit /b
    )

    set "UPLOAD_FILE=!LOCAL_FILES[%FILE_CHOICE%]!"
    if not defined UPLOAD_FILE (
        echo [오류] 유효한 파일 번호를 입력하세요.
        exit /b
    )

    aws s3 cp "%CURRENT_PATH%\%UPLOAD_FILE%" "s3://%SELECTED_BUCKET%" --endpoint-url=http://%ENDPOINT_IP%:4566
    echo 업로드 완료: %UPLOAD_FILE%
)

echo end

pause

