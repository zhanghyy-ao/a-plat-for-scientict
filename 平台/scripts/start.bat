@echo off
chcp 65001

echo 正在启动计算机学院实验室官网开发服务器...
echo ================================

cd /d "%~dp0..\frontend"

rem 检查是否安装了npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未找到npm，请先安装Node.js
    pause
    exit /b 1
)

echo 正在安装依赖...
npm install

if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo 依赖安装成功，正在启动开发服务器...
echo ================================
echo 服务器启动后，可通过 http://localhost:5173 访问

npm run dev

pause
