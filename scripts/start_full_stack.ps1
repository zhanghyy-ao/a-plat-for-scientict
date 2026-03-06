# 全栈启动脚本
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "计算机学院实验室全栈启动脚本" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan

# 启动后端服务
Write-Host "1. 启动后端服务..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "..\backend"
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File start_backend.ps1" -WorkingDirectory $backendPath

# 等待后端服务启动
Write-Host "等待后端服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 启动前端服务
Write-Host "\n2. 启动前端服务..." -ForegroundColor Cyan
$startScriptPath = Join-Path $PSScriptRoot "start.ps1"
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$startScriptPath`"" -WorkingDirectory $PSScriptRoot

# 显示访问信息
Write-Host "\n====================================" -ForegroundColor Cyan
Write-Host "服务启动完成！" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "前端访问地址: http://localhost:5173" -ForegroundColor Green
Write-Host "后端API地址: http://localhost:5000" -ForegroundColor Green
Write-Host "API文档地址: http://localhost:5000/swagger-ui/" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "按Enter键退出..." -ForegroundColor Yellow

Read-Host
