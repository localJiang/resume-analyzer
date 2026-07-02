# CLAUDE.md — Resume Analyzer AI 编码指令

> **用途：** 此文件告知 AI 编码 Agent 如何操作此代码库。
> 它会自动被 Claude Code、Codex CLI、Gemini CLI、Cursor 和 Windsurf 读取。

---

## 📋 项目标识

- **项目：** Resume Analyzer
- **描述：** AI驱动的简历分析工具
- **技术栈：** Next.js + Next.js API 路由 | TypeScript | PostgreSQL | Prisma

---

## 🔧 基本命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 测试（全部）
npm run test

# 测试（单文件）
npx vitest run path/to/file.test.ts

# 代码检查
npm run lint

# 格式化
npm run format

# 类型检查
npm run typecheck

# 数据库
npx prisma studio        # 图形化数据库浏览器
npx prisma migrate dev   # 创建并应用迁移
npx prisma db seed       # 填充种子数据
```

---

## 🏗️ 架构

本项目遵循 **Feature First（功能优先）** 架构。

### 目录约定

```
src/
├── app/           # 应用入口和路由
├── components/    # 可复用 UI 组件
├── features/      # 功能模块（功能优先）
├── lib/           # 共享工具和辅助函数
├── hooks/         # 自定义 React Hooks
├── services/      # API 服务层
├── stores/        # 状态管理
├── types/         # TypeScript 类型定义
└── styles/        # 全局样式和主题
```

### 核心原则

1. **关注点分离** — 每个模块做好一件事
2. **依赖反转** — 依赖抽象而非实现
3. **单一数据源** — 状态单向流动
4. **快速失败** — 尽早验证，提供清晰的错误信息
5. **组合优于继承** — 优先使用函数组合和 Hooks

---

## 📝 编码规范

### 命名约定

| 元素 | 约定 | 示例 |
|---------|-----------|---------|
| 文件（组件） | PascalCase | `UserProfile.tsx` |
| 文件（工具） | camelCase | `formatDate.ts` |
| 文件（类型） | camelCase | `user.types.ts` |
| 组件 | PascalCase | `function UserProfile()` |
| 函数 | camelCase | `function getUserById()` |
| 变量 | camelCase | `const userData = ...` |
| 常量 | UPPER_SNAKE_CASE | `const MAX_RETRIES = 3` |
| 类型/接口 | PascalCase | `interface UserProfile` |
| 数据库表 | snake_case（复数） | `user_profiles` |
| 数据库列 | snake_case | `created_at` |
| API 路由 | kebab-case | `/api/user-profiles` |
| CSS 类名 | kebab-case（Tailwind） | `bg-primary-500` |
| 环境变量 | UPPER_SNAKE_CASE | `NEXT_PUBLIC_API_URL` |

### TypeScript 规则

- 始终为公共函数定义显式返回类型
- 对象形状优先使用 `interface` 而非 `type`（可扩展）
- 联合类型、交叉类型和映射类型使用 `type`
- 在 `tsconfig.json` 中启用 `strict: true`
- 避免使用 `any` — 改用 `unknown` 和类型守卫
- 对不可变属性使用 `readonly`
- 对字面量类型使用 `as const`
- 优先使用 `?.`（可选链）和 `??`（空值合并）

### React 规则

- 使用函数组件和 Hooks — 不使用类组件
- 每个文件一个组件（小型子组件可共存于同一文件）
- 将可复用逻辑提取到自定义 Hooks 中
- 对昂贵的纯组件使用 `React.memo()`
- 仅在性能分析显示收益时使用 `useCallback()` 和 `useMemo()`
- Props：在同一文件中定义接口
- 页面使用默认导出，组件使用命名导出

### 错误处理

```typescript
// ✅ 正确：使用类型化错误进行显式错误处理
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// ✅ 正确：在边界处处理错误
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new AppError('Failed to fetch user', 'FETCH_ERROR', response.status);
    }
    return response.json();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Unexpected error', 'UNKNOWN', 500);
  }
}
```

### 导入顺序

```typescript
// 1. Node 内置模块
import { join } from 'path';

// 2. 第三方库
import { clsx } from 'clsx';
import React from 'react';

// 3. 内部模块（绝对路径）
import { Button } from '@/components/Button';
import { formatDate } from '@/lib/date';

// 4. 相对导入
import { UserAvatar } from './UserAvatar';

// 5. 类型
import type { User } from '@/types/user';

// 6. 样式
import styles from './Profile.module.css';
```

---

## 🔀 Git 工作流

### 分支命名

- `feature/<描述>` — 新功能
- `fix/<描述>` — Bug 修复
- `chore/<描述>` — 维护工作
- `refactor/<描述>` — 代码重构
- `docs/<描述>` — 文档

### 提交信息

```
<type>(<scope>): <祈使句描述>

feat(auth): add password reset functionality
fix(api): handle null response from user endpoint
refactor(utils): extract date formatting to shared lib
docs(readme): update installation instructions
```

### Pull Request

1. 从 `develop` 创建分支
2. 编写清晰的描述并附上上下文
3. 关联相关 Issue
4. 确保 CI 通过（lint、类型检查、测试、构建）
5. 请求合适的团队成员进行审查
6. Squash 合并到 `develop`

---

## 🧪 测试标准

### 测试结构

```typescript
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when found', async () => { ... });
    it('should throw NotFoundError when user does not exist', async () => { ... });
    it('should handle database connection errors gracefully', async () => { ... });
  });
});
```

### 测试原则

- **单元测试：** 快速、隔离、无 I/O。测试业务逻辑。
- **集成测试：** 一起测试 API 路由和数据库。
- **E2E 测试：** 测试关键用户流程（注册、登录、核心功能）。
- **覆盖率目标：** 核心业务逻辑覆盖率达到 80% 以上。
- **测试命名：** `should <预期行为> when <条件>`
- **AAA 模式：** Arrange → Act → Assert

---

## 🤖 Agent 工作流

当 AI Agent 在此项目上工作时，应遵循以下工作流：

### 1. 理解

- 阅读 `CLAUDE.md`（本文件）
- 阅读 `memory/project.md` 了解项目上下文
- 阅读 `memory/architecture.md` 了解架构决策
- 阅读 `docs/` 中的相关文档

### 2. 计划

- 将任务分解为小的、可验证的步骤
- 在编写代码前识别受影响的文件
- 如果任务复杂，在 `tasks/` 中编写计划
- 使用 `/plan` 命令进行结构化规划

### 3. 实现

- 编写遵循本文件所有约定的代码
- 添加类型、错误处理和基本验证
- 为变更的代码编写或更新测试
- 在声明完成前运行 `npm run test`
- 使用正确的约定式提交格式提交

### 4. 审查

- 自查：检查类型、lint、测试通过
- 验证没有残留的 console.log 或调试代码
- 检查安全问题（XSS、SQL 注入等）
- 验证 UI 变更的可访问性（a11y）

### 5. 文档

- 更新相关的 `memory/*.md` 文件
- 如果架构变更，更新 `docs/`
- 为公共 API 添加 JSDoc
- 如有需要，更新 README

---

## 🚫 禁止操作

### 绝不要做这些：

- ❌ **删除或修改** `.git/` 目录
- ❌ **未经明确许可修改** `CLAUDE.md`、`AGENTS.md` 或 `memory/` 文件
- ❌ **未经确认运行破坏性命令**（`rm -rf`、`DROP TABLE`、`git push --force`）
- ❌ **提交密钥** — API 密钥、令牌、密码
- ❌ **在 TypeScript 中使用 `any`** — 使用 `unknown` 和类型守卫
- ❌ **跳过新功能或 Bug 修复的测试**
- ❌ **留下没有跟踪 Issue 编号的 TODO 注释**：`// TODO(#123): ...`
- ❌ **修改生成的代码**（Prisma client、GraphQL 类型等）
- ❌ **更换包管理器**（坚持项目已选择的那一个）
- ❌ **使用内联样式** — 使用 Tailwind 工具类
- ❌ **直接提交到 `main`** — 始终使用功能分支

### 始终要做这些：

- ✅ 编写自文档化的代码，使用清晰的变量/函数名
- ✅ 保持函数小巧（< 40 行）
- ✅ 保持文件聚焦（< 300 行，然后拆分）
- ✅ 添加错误边界和有意义的错误信息
- ✅ 使用 TypeScript 严格模式特性
- ✅ 提交前运行 `npm run lint` 和 `npm run format`
- ✅ 在客户端和服务器端都验证用户输入

---

## 📚 参考资料

- [项目文档](./docs/)
- [项目记忆](./memory/)
- [Agent 定义](./AGENTS.md)
- [约定式提交](https://www.conventionalcommits.org/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/handbook/)
