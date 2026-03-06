@echo off
chcp 65001

echo 正在启动计算机学院实验室后端服务器...
echo ================================

rem 尝试激活conda环境（可选）
echo 尝试激活conda环境（如果可用）...
call conda activate myenv 2>nul
if %errorlevel% neq 0 (
    echo 提示: conda环境未找到，将使用系统Python
)

rem 检查是否安装了Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未找到Python，请先安装Python 3.7+
    pause
    exit /b 1
)

rem 检查是否安装了pip
where pip >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未找到pip，请先安装Python 3.7+
    pause
    exit /b 1
)

echo 正在安装依赖...
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo 依赖安装成功，正在启动Flask服务器...
echo ================================
echo 服务器启动后，可通过 http://localhost:5000 访问API
echo API文档地址: http://localhost:5000/swagger-ui/
echo ================================

python app.py

pause
