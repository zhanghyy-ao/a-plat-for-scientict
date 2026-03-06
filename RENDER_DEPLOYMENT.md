# Render 后端部署指南

## 问题原因

之前的错误是因为 Render 默认在根目录查找 `package.json`，但你的后端代码在 `backend/` 子目录中。

## 解决方案

已创建 `render.yaml` 配置文件，告诉 Render 正确的构建和启动命令。

## 部署步骤

### 1. 提交代码到 GitHub

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin beta
```

### 2. 在 Render 上创建服务

1. 访问 https://render.com
2. 点击 **New +** → **Web Service**
3. 连接你的 GitHub 仓库
4. 选择仓库 `zhanghyy-ao/a-plat-for-scientict`

### 3. 配置 Render 服务

Render 会自动读取 `render.yaml` 文件，配置如下：

- **Name**: lab-management-backend
- **Runtime**: Python
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `cd backend && gunicorn app:app --bind 0.0.0.0:$PORT`

### 4. 环境变量（可选）

在 Render 控制台设置环境变量：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SECRET_KEY` | Flask 密钥 | 自动生成 |
| `DATABASE_URL` | 数据库 URL | SQLite |
| `FLASK_ENV` | 环境模式 | production |

### 5. 部署完成

部署成功后，你会获得一个类似以下的 URL：

```
https://lab-management-backend-xxx.onrender.com
```

## 更新前端 API 地址

获取到 Render 的后端地址后，更新前端配置：

编辑 `frontend/src/utils/api.ts`：

```typescript
const API_BASE_URL = isGitHubPages 
  ? 'https://lab-management-backend-xxx.onrender.com'  // ← 你的 Render 地址
  : 'http://localhost:5000';
```

然后重新构建并部署前端。

## 注意事项

### 免费版限制

- **休眠**：15分钟无访问会休眠，下次访问需要等待启动（约30秒）
- **带宽**：每月 100GB
- **构建时间**：每月 500 分钟

### 数据库

当前使用 SQLite，数据存储在容器内。免费版每次部署后数据会重置。

**解决方案**：
1. 使用 Render 的 PostgreSQL 服务（免费 90 天）
2. 或者使用外部数据库服务

### CORS 配置

后端已配置 CORS，支持跨域访问：

```python
CORS(app)  # 允许所有域名访问
```

如果需要限制特定域名：

```python
CORS(app, origins=['https://zhanghyy-ao.github.io'])
```

## 故障排查

### 部署失败

1. 检查 Render 日志
2. 确认 `requirements.txt` 包含所有依赖
3. 确认 `render.yaml` 配置正确

### 服务启动失败

1. 检查端口是否正确绑定到 `$PORT`
2. 检查环境变量是否正确设置
3. 查看 Render 控制台日志

### API 请求失败

1. 确认后端服务已启动
2. 检查 CORS 配置
3. 确认前端 API 地址正确

## 完整部署架构

```
GitHub Pages (前端)          Render (后端)
    ↓                            ↓
https://zhanghyy-ao.github.io  https://lab-management-backend-xxx.onrender.com
    ↓                            ↓
   静态页面                    Flask API
                                 ↓
                              SQLite 数据库
```

## 后续优化

1. **数据库升级**：迁移到 PostgreSQL
2. **文件存储**：使用云存储服务
3. **缓存**：添加 Redis 缓存
4. **监控**：添加应用监控
