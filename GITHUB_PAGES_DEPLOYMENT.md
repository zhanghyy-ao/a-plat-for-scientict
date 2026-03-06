# GitHub Pages 免费部署指南

## 免费域名

GitHub Pages 提供免费的子域名：

```
https://zhanghyy-ao.github.io/a-plat-for-scientict
```

## 部署步骤

### 1. 启用 GitHub Pages

1. 打开 GitHub 仓库页面
2. 点击 **Settings** 标签
3. 左侧菜单选择 **Pages**
4. **Source** 选择 "GitHub Actions"

### 2. 配置完成后的自动部署

每次推送到以下分支，都会自动部署：

| 分支 | 部署环境 |
|------|----------|
| `main` | 正式环境 |
| `beta` | 测试环境 |
| `staging` | 体验环境 |
| `v2.0-dev` | 2.0 开发环境 |

### 3. 查看部署状态

1. 打开 GitHub 仓库
2. 点击 **Actions** 标签
3. 查看工作流运行状态

## 访问地址

部署成功后，访问地址为：

```
https://zhanghyy-ao.github.io/a-plat-for-scientict
```

## 重要配置说明

### 前端路由

已配置为 Hash 模式（`HashRouter`），支持 GitHub Pages 的静态托管：

```typescript
// App.tsx
import { HashRouter as Router } from 'react-router-dom';
```

访问链接格式：
```
https://zhanghyy-ao.github.io/a-plat-for-scientict/#/dashboard
https://zhanghyy-ao.github.io/a-plat-for-scientict/#/login
```

### API 配置

需要在 `api.ts` 中配置你的后端服务器地址：

```typescript
const API_BASE_URL = isGitHubPages 
  ? 'https://your-backend-server.com'  // ← 修改为你的后端地址
  : 'http://localhost:5000';
```

### 后端服务器选项

GitHub Pages 只能托管静态前端，后端需要另外部署：

#### 选项 1：使用 Render（免费）
1. 访问 https://render.com
2. 创建 Web Service
3. 连接你的 GitHub 仓库
4. 选择后端目录，自动部署

#### 选项 2：使用 Railway（免费额度）
1. 访问 https://railway.app
2. 导入项目
3. 部署后端服务

#### 选项 3：使用 Heroku（需信用卡）
1. 访问 https://heroku.com
2. 创建应用并部署

#### 选项 4：使用自己的服务器
如果你有云服务器，可以直接部署在上面。

## 本地开发

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

本地访问：http://localhost:5173

## 构建测试

```bash
# 构建生产版本
cd frontend
npm run build

# 预览构建结果
npm run preview
```

## 注意事项

1. **GitHub Pages 限制**：
   - 仓库大小限制 1GB
   - 每月 100GB 带宽
   - 每小时 10 次构建

2. **后端服务**：
   - GitHub Pages 不支持后端代码
   - 需要单独部署后端服务
   - 确保后端支持 CORS

3. **环境变量**：
   - 在 GitHub 仓库 Settings > Secrets 中配置
   - 工作流中通过 `${{ secrets.XXX }}` 使用

## 故障排查

### 部署失败

1. 检查 Actions 日志
2. 确认 `vite.config.ts` 配置正确
3. 确认 `package.json` 有 build 脚本

### 页面空白

1. 检查浏览器控制台错误
2. 确认 `base: './'` 配置
3. 检查资源路径是否正确

### API 请求失败

1. 确认后端服务已部署
2. 检查 CORS 配置
3. 确认 API 地址配置正确
