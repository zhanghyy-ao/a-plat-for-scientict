# Git 分支管理指南

## 分支架构

```
main (正式服/生产环境)
  │
  ├── develop (开发主干)
  │     │
  │     ├── feature/xxx (功能分支)
  │     ├── feature/yyy
  │     └── ...
  │
  ├── staging (体验服/预发布环境)
  │
  ├── beta (测试版环境)
  │
  └── v2.0-dev (2.0版本开发分支)
        └── feature/v2-xxx
```

## 分支说明

| 分支 | 用途 | 部署环境 |
|------|------|----------|
| `main` | 生产环境代码，稳定版本 | 正式服 |
| `staging` | 预发布测试，接近生产环境 | 体验服 |
| `beta` | 新功能测试，给内部/种子用户 | 测试版 |
| `develop` | 日常开发主干 | 开发环境 |
| `v2.0-dev` | 2.0大版本开发 | 独立开发环境 |
| `feature/*` | 具体功能开发 | 本地开发 |

## 工作流程

### 1. 日常开发流程

```bash
# 从 develop 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication

# 开发完成后合并回 develop
git checkout develop
git merge feature/user-authentication
git push origin develop
```

### 2. 发布流程

```bash
# 1. 发布到测试版 (beta)
git checkout beta
git merge develop
git push origin beta

# 2. 发布到体验服 (staging)
git checkout staging
git merge beta
git push origin staging

# 3. 发布到正式服 (main)
git checkout main
git merge staging
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags
```

### 3. 2.0版本开发

```bash
# 从 main 创建 2.0 开发分支
git checkout main
git checkout -b v2.0-dev

# 2.0 功能开发
git checkout -b feature/v2-new-architecture
# ... 开发完成后合并到 v2.0-dev
```

## 常用命令速查

```bash
# 查看所有分支
git branch -a

# 切换分支
git checkout <branch-name>

# 创建并切换到新分支
git checkout -b <new-branch-name>

# 推送分支到远程
git push origin <branch-name>

# 删除本地分支
git branch -d <branch-name>

# 删除远程分支
git push origin --delete <branch-name>

# 拉取最新代码
git pull origin <branch-name>
```

## 分支保护建议

在 GitHub 仓库设置中，建议开启以下保护：

1. **main 分支**：需要 PR 审核，禁止直接推送
2. **staging 分支**：需要 PR 审核
3. **beta 分支**：可选保护
4. **v2.0-dev 分支**：需要 PR 审核

## 环境对应关系

- **测试版 (beta)**：`https://beta.your-domain.com`
- **体验服 (staging)**：`https://staging.your-domain.com`
- **正式服 (main)**：`https://your-domain.com`
- **2.0开发版 (v2.0-dev)**：`https://v2-dev.your-domain.com`
