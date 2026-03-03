# 计算机学院实验室官网启动脚本
# 功能：检查环境、安装依赖、验证代码、启动服务器

$frontendPath = Join-Path $PSScriptRoot "..\frontend"
Set-Location $frontendPath

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "计算机学院实验室官网启动脚本" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan

# 1. 检查系统环境
Write-Host "1. 检查系统环境..." -ForegroundColor Cyan

# 检查Node.js是否安装
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "错误: 未找到Node.js，请先安装Node.js" -ForegroundColor Red
    Read-Host "按Enter键退出..."
    exit 1
}

# 检查npm是否安装
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "错误: 未找到npm，请先安装Node.js" -ForegroundColor Red
    Read-Host "按Enter键退出..."
    exit 1
}

# 检查Node.js版本
$nodeVersion = node -v
Write-Host "Node.js版本: $nodeVersion" -ForegroundColor Yellow

# 检查npm版本
$npmVersion = npm -v
Write-Host "npm版本: $npmVersion" -ForegroundColor Yellow

# 2. 安装依赖
Write-Host "\n2. 安装项目依赖..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 依赖安装失败" -ForegroundColor Red
    Read-Host "按Enter键退出..."
    exit 1
}
Write-Host "依赖安装成功！" -ForegroundColor Green

# 3. 验证代码质量
Write-Host "\n3. 验证代码质量..." -ForegroundColor Cyan
npm run build -- --mode=development

if ($LASTEXITCODE -ne 0) {
    Write-Host "警告: 代码编译存在问题，但仍将尝试启动开发服务器" -ForegroundColor Yellow
} else {
    Write-Host "代码编译成功！" -ForegroundColor Green
}

# 4. 启动开发服务器
Write-Host "\n4. 启动开发服务器..." -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "服务器启动后，可通过 http://localhost:5173 访问" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan

# 启动开发服务器
npm run dev

Read-Host "按Enter键退出..."
