# 计算机实验室管理系统

## 项目简介

计算机实验室管理系统是一个综合性平台，用于管理实验室的学生、导师、项目、新闻和成果等信息。系统采用前后端分离的架构设计，通过RESTful API实现前后端通信。

### 核心功能

- **用户认证**：支持管理员、导师和学生三种角色的登录和权限管理
- **学生管理**：添加、编辑、删除学生，为学生分配导师
- **导师管理**：添加、编辑、删除导师
- **课题进度**：学生提交课题进度，导师审阅和反馈
- **内容管理**：管理新闻、成果、关于我们和联系方式

## 技术栈

### 前端技术栈

- React 19.2.0
- TypeScript 5.9.3
- Vite 5.4.10
- Tailwind CSS 3.4.0
- React Router 6.30.3
- Framer Motion 12.34.3
- Chart.js 4.5.1
- React Icons 5.5.0

### 后端技术栈

- Python 3.9+
- Flask 2.0+
- Flask-RESTx
- Flask-SQLAlchemy
- Flask-CORS
- PyJWT
- Passlib
- MySQL 8.0+

## 目录结构

```
平台/
├── frontend/              # 前端代码
│   ├── src/              # 源代码
│   ├── public/           # 静态资源
│   └── package.json      # 依赖配置
├── backend/               # 后端代码
│   ├── app.py            # 应用主文件
│   ├── requirements.txt  # 依赖配置
│   └── .env              # 环境变量
├── docs/                 # 文档
│   ├── arch.md           # 技术架构文档
│   ├── development_guidelines.md # 开发规范文档
│   ├── deployment_guide.md # 部署指南
│   └── user_manual.md    # 用户手册
└── scripts/              # 启动脚本
```

## 快速开始

### 1. 环境配置

#### 前端环境

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install
```

#### 后端环境

```bash
# 进入后端目录
cd backend

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
# 复制 .env.example 文件为 .env 并配置数据库连接信息
```

### 2. 数据库初始化

```bash
# 进入后端目录
cd backend

# 运行后端应用，自动创建数据库表和示例数据
python app.py
```

### 3. 运行系统

#### 运行前端

```bash
# 进入前端目录
cd frontend

# 启动开发服务器
npm run dev
```

#### 运行后端

```bash
# 进入后端目录
cd backend

# 启动开发服务器
python app.py
```

#### 运行完整系统

使用项目根目录下的启动脚本同时启动前端和后端：

```bash
# 进入项目根目录
cd 平台

# Windows
./start_full_stack.bat

# PowerShell
./start_full_stack.ps1
```

## 默认账号

- **管理员**：用户名 `admin`，密码 `admin123`
- **导师**：用户名 `mentor1`，密码 `mentor123`
- **学生**：用户名 `student1`，密码 `student123`

## 文档

- [技术架构文档](docs/arch.md)：系统的技术架构、组件关系和数据流
- [开发规范文档](docs/development_guidelines.md)：代码风格、命名约定和开发流程
- [部署指南](docs/deployment_guide.md)：系统部署和维护方法
- [用户手册](docs/user_manual.md)：系统使用方法和操作指南

## 系统特点

- **前后端分离**：采用现代前后端分离架构，提高开发效率和系统可维护性
- **角色权限**：支持管理员、导师和学生三种角色，实现精细化权限控制
- **响应式设计**：适配桌面端、平板和移动端，提供良好的用户体验
- **数据可视化**：使用 Chart.js 实现数据可视化，直观展示实验室成果和统计数据
- **安全可靠**：使用 JWT 进行身份认证，密码加密存储，防止 SQL 注入和 XSS 攻击

## 未来规划

- **项目管理**：添加项目管理功能，支持项目创建、分配和跟踪
- **论文管理**：添加论文管理和引用追踪功能
- **实验室资源预约**：支持实验室设备和场地的预约管理
- **团队协作**：添加团队协作功能，支持任务分配和进度跟踪
- **数据导出**：支持数据导出为 Excel、PDF 等格式
- **移动端适配**：进一步优化移动端体验，开发移动端应用

## 贡献

欢迎贡献代码、报告问题或提出建议。请遵循项目的开发规范和代码风格。

## 许可证

本项目采用 MIT 许可证。