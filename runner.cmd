@echo off
REM Проверка наличия необходимых инструментов
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Git не установлен. Установите Git и повторите попытку.
    pause
    exit /b 1
)

where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Python не установлен. Установите Python и повторите попытку.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Node.js/npm не установлен. Установите Node.js и повторите попытку.
    pause
    exit /b 1
)

REM Клонирование репозитория
echo Клонирование репозитория...
git clone https://github.com/hripit/network-monitor.git
if %ERRORLEVEL% neq 0 (
    echo Ошибка при клонировании репозитория.
    pause
    exit /b 1
)
cd network-monitor

REM Установка зависимостей бэкенда
echo Установка зависимостей бэкенда...
cd backend
python -m venv venv
call venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo Ошибка при установке зависимостей бэкенда.
    pause
    exit /b 1
)
cd ..

REM Установка зависимостей фронтенда
echo Установка зависимостей фронтенда...
cd frontend
call npm install --no-fund
if %ERRORLEVEL% neq 0 (
    echo Ошибка при установке зависимостей фронтенда.
    pause
    exit /b 1
)
cd ..

REM Запуск бэкенда
echo Запуск бэкенда...
cd backend
set USE_SSL=False
start "Backend Server" cmd /c "call venv\Scripts\activate && set USE_SSL=False && uvicorn main:app --host 0.0.0.0 --port 8080"
cd ..

REM Запуск фронтенда
echo Запуск фронтенда...
cd frontend
start "Frontend Server" cmd /c "npm start"
cd ..

echo Проект запущен!
echo Бэкенд доступен по адресу: https://localhost:8443
echo Фронтенд доступен по адресу: http://localhost:3000
pause