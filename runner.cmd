@echo off
REM �������� ������� ����������� ������������
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Git �� ����������. ���������� Git � ��������� �������.
    pause
    exit /b 1
)

where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Python �� ����������. ���������� Python � ��������� �������.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Node.js/npm �� ����������. ���������� Node.js � ��������� �������.
    pause
    exit /b 1
)

REM ������������ �����������
echo ������������ �����������...
git clone https://github.com/hripit/network-monitor.git
if %ERRORLEVEL% neq 0 (
    echo ������ ��� ������������ �����������.
    pause
    exit /b 1
)
cd network-monitor

REM ��������� ������������ �������
echo ��������� ������������ �������...
cd backend
python -m venv venv
call venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo ������ ��� ��������� ������������ �������.
    pause
    exit /b 1
)
cd ..

REM ��������� ������������ ���������
echo ��������� ������������ ���������...
cd frontend
call npm install --no-fund
if %ERRORLEVEL% neq 0 (
    echo ������ ��� ��������� ������������ ���������.
    pause
    exit /b 1
)
cd ..

REM ������ �������
echo ������ �������...
cd backend
set USE_SSL=False
start "Backend Server" cmd /c "call venv\Scripts\activate && set USE_SSL=False && uvicorn main:app --host 0.0.0.0 --port 8080"
cd ..

REM ������ ���������
echo ������ ���������...
cd frontend
start "Frontend Server" cmd /c "npm start"
cd ..

echo ������ �������!
echo ������ �������� �� ������: https://localhost:8443
echo �������� �������� �� ������: http://localhost:3000
pause