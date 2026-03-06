# 计算机实验室管理系统 - 开发规范文档

## 1. 代码风格规范

### 1.1 前端代码风格

#### 1.1.1 TypeScript/React 代码风格

- **文件命名**：使用 PascalCase 命名组件文件，使用 camelCase 命名工具文件
  - 示例：`HomePage.tsx`、`api.ts`

- **组件命名**：使用 PascalCase 命名组件
  - 示例：`HomePage`、`LoginForm`

- **变量命名**：
  - 使用 camelCase 命名变量和函数
  - 使用 PascalCase 命名类型和接口
  - 使用 UPPER_SNAKE_CASE 命名常量
  - 示例：`userName`、`getUserInfo`、`UserType`、`MAX_LENGTH`

- **代码缩进**：使用 2 个空格进行缩进

- **代码换行**：
  - 每行代码长度不超过 100 个字符
  - 适当使用换行提高代码可读性

- **注释**：
  - 为复杂的逻辑添加注释
  - 为组件添加 JSDoc 注释，说明组件的用途、props 和返回值

- **导入顺序**：
  1. 外部库导入
  2. 内部组件导入
  3. 工具函数导入
  4. 样式导入

- **React 最佳实践**：
  - 使用函数式组件和 Hooks
  - 合理使用 `useState`、`useEffect`、`useContext` 等 Hooks
  - 组件拆分合理，职责单一
  - 使用 TypeScript 类型定义确保类型安全

#### 1.1.2 CSS/Tailwind 风格

- **Tailwind 类名顺序**：
  1. 布局相关（flex, grid, position）
  2. 尺寸相关（w-*, h-*, p-*, m-*）
  3. 样式相关（bg-*, text-*, border-*）
  4. 动画相关（transition, transform）

- **自定义样式**：
  - 对于复杂的样式，在 Tailwind 配置文件中定义自定义工具类
  - 避免在组件中直接使用内联样式

### 1.2 后端代码风格

#### 1.2.1 Python/Flask 代码风格

- **文件命名**：使用 snake_case 命名文件
  - 示例：`app.py`、`database.py`

- **函数命名**：使用 snake_case 命名函数和方法
  - 示例：`get_user_info`、`create_student`

- **变量命名**：
  - 使用 snake_case 命名变量
  - 使用 PascalCase 命名类
  - 示例：`user_name`、`Student`

- **代码缩进**：使用 4 个空格进行缩进

- **代码换行**：
  - 每行代码长度不超过 100 个字符
  - 适当使用换行提高代码可读性

- **注释**：
  - 为复杂的逻辑添加注释
  - 为函数添加文档字符串，说明函数的用途、参数和返回值

- **导入顺序**：
  1. 标准库导入
  2. 第三方库导入
  3. 本地模块导入

- **Flask 最佳实践**：
  - 使用蓝图（Blueprint）组织路由
  - 合理使用装饰器
  - 错误处理机制完善
  - 配置管理规范

## 2. 目录结构规范

### 2.1 前端目录结构

```
frontend/
├── src/
│   ├── components/              # 组件目录
│   │   ├── common/              # 通用组件
│   │   ├── layout/              # 布局组件
│   │   ├── pages/               # 页面组件
│   │   │   ├── content/         # 内容管理页面
│   │   │   ├── mentor/          # 导师页面
│   │   │   └── student/         # 学生页面
│   │   └── ui/                  # UI组件
│   ├── contexts/                # 上下文
│   ├── utils/                   # 工具函数
│   ├── App.tsx                  # 应用入口
│   └── main.tsx                 # 主入口
├── public/                      # 静态资源
├── package.json                 # 依赖配置
└── vite.config.ts               # Vite配置
```

### 2.2 后端目录结构

```
backend/
├── app.py                       # 应用主文件
├── models/                      # 数据模型
├── routes/                      # 路由
├── services/                    # 业务逻辑
├── utils/                       # 工具函数
├── requirements.txt             # 依赖配置
└── .env                         # 环境变量
```

## 3. 命名约定

### 3.1 前端命名约定

- **组件名**：使用 PascalCase，描述组件的功能
  - 示例：`LoginPage`、`StudentCard`

- **变量名**：使用 camelCase，描述变量的用途
  - 示例：`userName`、`isLoading`

- **函数名**：使用 camelCase，描述函数的动作
  - 示例：`getUserInfo`、`handleSubmit`

- **接口名**：使用 PascalCase，以 `I` 开头
  - 示例：`IUser`、`IProgressReport`

- **类型名**：使用 PascalCase
  - 示例：`UserType`、`ProgressStatus`

- **常量名**：使用 UPPER_SNAKE_CASE
  - 示例：`MAX_LENGTH`、`API_BASE_URL`

### 3.2 后端命名约定

- **文件名**：使用 snake_case，描述文件的功能
  - 示例：`user_model.py`、`auth_route.py`

- **函数名**：使用 snake_case，描述函数的动作
  - 示例：`get_user_info`、`create_student`

- **变量名**：使用 snake_case，描述变量的用途
  - 示例：`user_name`、`is_active`

- **类名**：使用 PascalCase，描述类的功能
  - 示例：`User`、`Student`

- **常量名**：使用 UPPER_SNAKE_CASE
  - 示例：`MAX_PAGE_SIZE`、`SECRET_KEY`

- **数据库表名**：使用 snake_case，复数形式
  - 示例：`users`、`students`

- **数据库字段名**：使用 snake_case
  - 示例：`user_id`、`created_at`

## 4. 代码质量保证

### 4.1 前端代码质量

- **ESLint**：使用 ESLint 检查代码风格和潜在问题
- **TypeScript**：使用 TypeScript 进行类型检查
- **Prettier**：使用 Prettier 格式化代码
- **单元测试**：为组件和工具函数编写单元测试
- **集成测试**：为关键功能编写集成测试

### 4.2 后端代码质量

- **Pylint**：使用 Pylint 检查代码风格和潜在问题
- **Flake8**：使用 Flake8 检查代码风格
- **单元测试**：为函数和方法编写单元测试
- **集成测试**：为 API 接口编写集成测试
- **代码覆盖率**：确保代码覆盖率达到 80% 以上

## 5. 版本控制规范

### 5.1 Git 分支管理

- **main**：主分支，用于发布生产版本
- **develop**：开发分支，集成所有功能开发
- **feature/xxx**：功能分支，用于开发新功能
- **bugfix/xxx**： bug 修复分支，用于修复 bug
- **hotfix/xxx**：热修复分支，用于紧急修复生产环境问题

### 5.2 Git 提交规范

- **提交信息格式**：
  ```
  <type>(<scope>): <subject>
  
  <body>
  
  <footer>
  ```

- **type**：
  - `feat`：新功能
  - `fix`：修复 bug
  - `docs`：文档更新
  - `style`：代码风格调整
  - `refactor`：代码重构
  - `test`：测试代码
  - `chore`：构建过程或辅助工具的变动

- **scope**：可选，指定提交影响的范围

- **subject**：简短描述提交的内容

- **body**：详细描述提交的内容，可选

- **footer**：包含关闭 issue 的信息，可选

- **示例**：
  ```
  feat(auth): 添加用户登录功能
  
  - 实现登录表单组件
  - 集成后端登录 API
  - 添加登录状态管理
  
  Closes #123
  ```

## 6. 开发流程规范

### 6.1 需求分析

- 分析产品需求文档（PRD）
- 明确功能需求和非功能需求
- 识别技术挑战和风险

### 6.2 设计阶段

- 技术架构设计
- 数据库设计
- API 接口设计
- 前端页面设计

### 6.3 开发阶段

- 创建功能分支
- 编写代码
- 编写测试
- 代码审查

### 6.4 测试阶段

- 单元测试
- 集成测试
- 系统测试
- 性能测试

### 6.5 部署阶段

- 构建前端应用
- 部署后端服务
- 配置数据库
- 监控系统运行

### 6.6 维护阶段

-  bug 修复
- 功能优化
- 安全更新
- 性能优化

## 7. 安全规范

### 7.1 前端安全

- **XSS 防护**：使用 React 的 JSX 防止 XSS 攻击
- **CSRF 防护**：使用 CSRF token 防止 CSRF 攻击
- **敏感信息保护**：不在前端存储敏感信息
- **输入验证**：在前端对用户输入进行验证

### 7.2 后端安全

- **SQL 注入防护**：使用 ORM 或参数化查询防止 SQL 注入
- **密码安全**：使用 bcrypt 等算法加密存储密码
- **认证授权**：使用 JWT 进行身份认证，实现基于角色的权限控制
- **API 安全**：对 API 接口进行权限检查
- **敏感信息保护**：使用环境变量存储敏感配置

## 8. 文档规范

### 8.1 技术文档

- **架构文档**：描述系统的技术架构、组件关系和数据流
- **API 文档**：描述 API 接口的用法、参数和返回值
- **数据库文档**：描述数据库表结构和关系

### 8.2 开发文档

- **开发规范**：本文档，规范代码风格、命名约定等
- **部署文档**：描述如何部署系统
- **测试文档**：描述测试策略和测试用例

### 8.3 用户文档

- **用户手册**：指导用户如何使用系统
- **管理员手册**：指导管理员如何管理系统

## 9. 工具使用规范

### 9.1 前端工具

- **Vite**：构建工具
- **ESLint**：代码检查工具
- **Prettier**：代码格式化工具
- **Jest**：测试工具
- **React DevTools**：React 开发工具

### 9.2 后端工具

- **Flask**：Web 框架
- **SQLAlchemy**：ORM 工具
- **Postman**：API 测试工具
- **Pytest**：测试工具
- **PyCharm**：IDE（推荐）

## 10. 总结

本开发规范文档旨在确保团队开发的一致性和代码质量，提高开发效率和系统可维护性。所有开发人员应严格遵守本规范，确保代码风格统一、命名规范、质量可靠。

随着项目的发展和技术的演进，本规范将不断更新和完善，以适应新的需求和挑战。