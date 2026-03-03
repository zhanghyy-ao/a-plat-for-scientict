@echo off
chcp 65001

echo 计算机学院实验室全栈启动脚本
echo ================================

rem 获取当前脚本所在目录
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..

rem 启动后端服务
echo 1. 启动后端服务...
start "后端服务" cmd /c "chcp 65001 && cd /d %PROJECT_ROOT%\backend && start_backend.bat"

rem 等待后端服务启动
echo 等待后端服务启动...
timeout /t 5 /nobreak >nul

rem 检查Node.js版本
echo 2. 检查前端环境...
node --version > "%TEMP%\node_version.txt" 2>&1
set /p NODE_VERSION=<"%TEMP%\node_version.txt"
del "%TEMP%\node_version.txt"

rem 提取版本号数字部分
for /f "tokens=2 delims=." %%a in ("%NODE_VERSION%") do set NODE_MAJOR=%%a

if %NODE_MAJOR% lss 20 (
    echo 警告: Node.js版本过低，当前版本: %NODE_VERSION%
    echo 前端服务需要Node.js 20.19+或22.12+版本
    echo 请升级Node.js版本后再启动前端服务
) else (
    echo 启动前端服务...
    start "前端服务" cmd /c "chcp 65001 && cd /d %SCRIPT_DIR% && start.bat"
)

rem 显示访问信息
echo ================================
echo 服务启动完成！
echo ================================
echo 前端访问地址: http://localhost:5173
echo 后端API地址: http://localhost:5000
echo API文档地址: http://localhost:5000/swagger-ui/
echo ================================
echo 注意: 如果前端服务未启动，请检查Node.js版本是否满足要求
echo 按任意键退出...
pause >nul
