# 后端启动脚本
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "计算机学院实验室后端启动脚本" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan

# 检查Python是否安装
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "错误: 未找到Python，请先安装Python 3.7+" -ForegroundColor Red
    Read-Host "按Enter键退出..."
    exit 1
}

# 检查pip是否安装
if (-not (Get-Command pip -ErrorAction SilentlyContinue)) {
    Write-Host "错误: 未找到pip，请先安装Python 3.7+" -ForegroundColor Red
    Read-Host "按Enter键退出..."
    exit 1
}

# 显示Python版本
$pythonVersion = python --version
Write-Host "Python版本: $pythonVersion" -ForegroundColor Yellow

# 安装依赖
Write-Host "\n安装项目依赖..." -ForegroundColor Cyan
pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 依赖安装失败" -ForegroundColor Red
    Read-Host "按Enter键退出..."
    exit 1
}
Write-Host "依赖安装成功！" -ForegroundColor Green

# 启动Flask服务器
Write-Host "\n启动Flask服务器..." -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "服务器启动后，可通过 http://localhost:5000 访问API" -ForegroundColor Green
Write-Host "API文档地址: http://localhost:5000/swagger-ui/" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan

# 启动服务器
python app.py

Read-Host "按Enter键退出..."