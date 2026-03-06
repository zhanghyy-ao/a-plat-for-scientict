# 计算机实验室管理系统 - 部署指南

## 1. 系统要求

### 1.1 前端要求

- Node.js 16.0 或更高版本
- npm 7.0 或更高版本
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 1.2 后端要求

- Python 3.9 或更高版本
- MySQL 8.0 或更高版本
- pip 20.0 或更高版本

## 2. 环境配置

### 2.1 前端环境配置

1. **安装 Node.js**
   - 访问 [Node.js 官网](https://nodejs.org/) 下载并安装最新版本的 Node.js
   - 验证安装：`node -v` 和 `npm -v`

2. **安装依赖**
   ```bash
   # 进入前端目录
   cd frontend
   
   # 安装依赖
   npm install
   ```

### 2.2 后端环境配置

1. **安装 Python**
   - 访问 [Python 官网](https://www.python.org/) 下载并安装 Python 3.9 或更高版本
   - 验证安装：`python --version` 或 `python3 --version`

2. **安装 MySQL**
   - 访问 [MySQL 官网](https://dev.mysql.com/downloads/) 下载并安装 MySQL 8.0 或更高版本
   - 配置 MySQL 服务并启动
   - 创建数据库：`CREATE DATABASE lab_management_system;`

3. **安装依赖**
   ```bash
   # 进入后端目录
   cd backend
   
   # 安装依赖
   pip install -r requirements.txt
   ```

4. **配置环境变量**
   - 复制 `.env.example` 文件为 `.env`
   - 编辑 `.env` 文件，配置数据库连接信息和其他环境变量
   ```
   # .env
   SECRET_KEY=your-secret-key-change-in-production
   DATABASE_URL=mysql+pymysql://root:password@localhost:3306/lab_management_system
   ```

## 3. 数据库初始化

1. **创建数据库表**
   - 运行后端应用，自动创建数据库表
   ```bash
   # 进入后端目录
   cd backend
   
   # 运行应用
   python app.py
   ```
   - 或使用 `database.sql` 文件初始化数据库
   ```bash
   # 登录 MySQL
   mysql -u root -p
   
   # 选择数据库
   USE lab_management_system;
   
   # 执行 SQL 文件
   SOURCE database.sql;
   ```

2. **初始化示例数据**
   - 后端应用启动时会自动创建管理员、导师和学生的示例账号
   - 管理员账号：`admin` / `admin123`
   - 导师账号：`mentor1` / `mentor123`
   - 学生账号：`student1` / `student123`

## 4. 运行系统

### 4.1 运行前端

```bash
# 进入前端目录
cd frontend

# 启动开发服务器
npm run dev

# 或构建生产版本
npm run build
npm run preview
```

### 4.2 运行后端

```bash
# 进入后端目录
cd backend

# 启动开发服务器
python app.py

# 或使用启动脚本
# Windows
./start_backend.bat

# PowerShell
./start_backend.ps1
```

### 4.3 运行完整系统

使用项目根目录下的启动脚本同时启动前端和后端：

```bash
# 进入项目根目录
cd 平台

# Windows
./start_full_stack.bat

# PowerShell
./start_full_stack.ps1
```

## 5. 部署到生产环境

### 5.1 前端部署

1. **构建生产版本**
   ```bash
   cd frontend
   npm run build
   ```

2. **部署到静态文件服务器**
   - 将 `dist` 目录下的文件部署到 Nginx、Apache 或 CDN
   - 配置服务器以支持单页应用路由

### 5.2 后端部署

1. **使用 Gunicorn 作为 WSGI 服务器**
   ```bash
   # 安装 Gunicorn
   pip install gunicorn
   
   # 启动 Gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

2. **使用 Nginx 作为反向代理**
   ```nginx
   server {
       listen 80;
       server_name example.com;
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
       
       location / {
           root /path/to/frontend/dist;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. **配置 SSL 证书**
   - 使用 Let's Encrypt 或其他 SSL 证书提供商获取 SSL 证书
   - 配置 Nginx 以支持 HTTPS

### 5.3 数据库部署

1. **使用 MySQL 生产环境配置**
   - 配置 MySQL 以支持高并发
   - 开启慢查询日志
   - 设置合适的缓存大小

2. **定期备份数据库**
   - 使用 `mysqldump` 定期备份数据库
   - 存储备份文件到安全的位置

## 6. 监控与维护

### 6.1 日志管理

- **前端日志**：使用浏览器开发者工具查看前端日志
- **后端日志**：配置 Flask 日志，记录错误和警告信息
- **服务器日志**：监控 Nginx 和 Gunicorn 日志

### 6.2 性能监控

- **前端性能**：使用 Lighthouse 或 WebPageTest 测试前端性能
- **后端性能**：使用 New Relic 或 Datadog 监控后端性能
- **数据库性能**：监控 MySQL 查询性能，优化慢查询

### 6.3 安全维护

- **定期更新依赖**：更新前端和后端依赖，修复安全漏洞
- **安全扫描**：使用安全扫描工具定期扫描系统
- **权限管理**：定期检查用户权限，移除不必要的权限

### 6.4 常见问题排查

| 问题 | 可能原因 | 解决方案 |
|------|---------|----------|
| 前端无法连接后端 | 后端服务未启动或端口不正确 | 检查后端服务状态和端口配置 |
| 数据库连接失败 | 数据库服务未启动或连接信息错误 | 检查数据库服务状态和连接配置 |
| 登录失败 | 用户名或密码错误 | 检查账号密码是否正确 |
| API 响应缓慢 | 数据库查询优化不足 | 优化数据库查询，添加索引 |
| 前端页面加载缓慢 | 前端资源过大 | 优化前端资源，使用代码分割 |

## 7. 扩展与升级

### 7.1 系统扩展

- **添加新功能**：遵循开发规范，创建功能分支进行开发
- **扩展数据库**：添加新表或修改现有表结构时，确保数据迁移
- **扩展 API**：添加新 API 接口时，遵循 RESTful 设计规范

### 7.2 系统升级

- **前端升级**：更新依赖包，测试兼容性
- **后端升级**：更新依赖包，测试 API 兼容性
- **数据库升级**：执行数据迁移，确保数据安全

## 8. 总结

本部署指南提供了系统的部署和维护方法，包括环境配置、数据库初始化、运行系统、部署到生产环境以及监控与维护等内容。通过遵循本指南，可以确保系统的稳定运行和安全维护。

如果在部署过程中遇到问题，请参考常见问题排查部分，或联系开发团队获取帮助。