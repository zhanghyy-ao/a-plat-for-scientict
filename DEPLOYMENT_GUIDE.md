# 多环境部署指南

## 环境说明

| 环境 | 分支 | 用途 | 访问地址 |
|------|------|------|----------|
| 测试版 | `beta` | 新功能测试，内部预览 | https://beta.your-domain.com |
| 体验服 | `staging` | 预发布环境，接近生产 | https://staging.your-domain.com |
| 正式服 | `main` | 生产环境，稳定版本 | https://your-domain.com |
| 2.0开发 | `v2.0-dev` | 大版本独立开发 | https://v2-dev.your-domain.com |

## 如何进入测试版分支

```bash
# 切换到 beta 分支
git checkout beta

# 拉取最新代码
git pull origin beta
```

## 自动部署流程

GitHub Actions 已配置，推送代码到对应分支会自动触发部署：

### 1. 测试版部署流程

```bash
# 1. 确保你在 develop 分支完成了功能开发
git checkout develop

# 2. 合并到 beta 分支
git checkout beta
git merge develop

# 3. 推送触发自动部署
git push origin beta
```

推送后，GitHub Actions 会自动：
1. 构建前端项目
2. 准备后端依赖
3. 部署到测试版服务器

### 2. 查看部署状态

1. 打开 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 查看工作流运行状态

### 3. 部署进度

- 🟡 **黄色**：正在部署
- 🟢 **绿色**：部署成功
- 🔴 **红色**：部署失败

## 手动部署（备用）

如果自动部署失败，可以手动部署：

```bash
# 1. 构建前端
cd frontend
npm install
npm run build

# 2. 准备后端
cd ../backend
pip install -r requirements.txt

# 3. 部署到服务器（根据你的服务器配置）
# 例如：rsync, scp, FTP 等
```

## 环境配置

### GitHub Secrets 配置

在 GitHub 仓库设置中添加以下 Secrets：

| Secret 名称 | 说明 |
|-------------|------|
| `API_URL` | 后端 API 地址 |
| `DEPLOY_KEY` | 服务器部署密钥（可选） |

设置路径：**Settings > Secrets and variables > Actions**

## 分支切换命令速查

```bash
# 切换到测试版
git checkout beta

# 切换到体验服
git checkout staging

# 切换到正式服
git checkout main

# 切换到 2.0 开发
git checkout v2.0-dev

# 切换到开发主干
git checkout develop
```

## 发布流程

### 标准发布流程

```bash
# 1. 功能开发在 develop
# ... 开发代码 ...

# 2. 发布到测试版
git checkout beta
git merge develop
git push origin beta
# 等待测试验证

# 3. 发布到体验服
git checkout staging
git merge beta
git push origin staging
# 等待最终验证

# 4. 发布到正式服
git checkout main
git merge staging
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin main --tags
```

## 故障排查

### 部署失败怎么办？

1. 查看 GitHub Actions 日志
2. 检查构建错误
3. 修复问题后重新推送

### 回滚版本

```bash
# 回滚到上一个版本
git revert HEAD
git push origin beta
```

## 注意事项

1. **beta 分支**：用于日常测试，可随时更新
2. **staging 分支**：接近生产环境，发布前最后验证
3. **main 分支**：生产环境，谨慎操作
4. **v2.0-dev 分支**：独立开发，不影响主线
