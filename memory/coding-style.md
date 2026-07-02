# 编码风格：Resume Analyzer

> **用途：** 详细的编码约定。AI Agent 必须严格遵循这些规则。

## 语言：TypeScript

### 通用原则

1. **可读性优于简洁性** — 代码被阅读的次数是编写的 10 倍以上
2. **显式优于隐式** — 明确类型、错误和意图
3. **一致性** — 遵循代码库中已建立的模式
4. **快速失败** — 在边界处验证输入，尽早返回
5. **DRY** — 不要重复自己，但清晰性优于强行抽象

### 函数设计

```typescript
// ✅ 好：清晰的名称、类型化参数、类型化返回值
async function getUserById(userId: string): Promise<User | null> {
  if (!isValidUUID(userId)) {
    throw new ValidationError(`Invalid user ID: ${userId}`);
  }
  return db.user.findUnique({ where: { id: userId } });
}

// ❌ 差：模糊的名称、无类型、无验证
async function getUser(id: any) {
  return db.user.findUnique({ where: { id } });
}
```

### 函数规则
- 单一职责 — 一个函数，一个目的
- 每个函数最多 40 行
- 最多 3 个参数（更多时使用对象）
- 尽早返回以避免深层嵌套
- 尽可能使用纯函数

### TypeScript 特定规则

```typescript
// ✅ 应该：使用 interface 定义对象形状
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// ✅ 应该：使用 type 定义联合类型
type Result<T> = { success: true; data: T } | { success: false; error: AppError };

// ✅ 应该：使用 const 断言
const COLORS = ['red', 'green', 'blue'] as const;
type Color = (typeof COLORS)[number];

// ✅ 应该：使用模板字面量类型
type Route = `/api/${string}`;

// ❌ 不要：使用 any
function process(data: any): any { ... }

// ✅ 应该：使用 unknown 和类型守卫
function process(data: unknown): Result<ProcessedData> {
  if (!isValidData(data)) {
    return { success: false, error: new ValidationError('Invalid data') };
  }
  // data 现在是类型化的
}
```

### 错误处理

```typescript
// 定义自定义错误类
class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`, 'NOT_FOUND', 404);
  }
}

class ValidationError extends AppError {
  constructor(message: string, public details?: ValidationDetail[]) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}
```

### 异步模式

```typescript
// ✅ 应该：处理 Promise 拒绝
async function fetchData(): Promise<Data> {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new AppError('Network error', 'NETWORK_ERROR', 500);
  }
}

// ✅ 应该：对独立操作使用 Promise.all
const [user, posts] = await Promise.all([
  fetchUser(userId),
  fetchPosts(userId),
]);

// ❌ 不要：对独立操作使用顺序 await
const user = await fetchUser(userId);
const posts = await fetchPosts(userId);
```

### 文件组织（Feature First（功能优先））

```
src/features/<功能名称>/
├── components/       # 功能特定组件
├── hooks/           # 功能特定 Hooks
├── services/        # 功能特定 API 调用
├── types.ts         # 功能特定类型
├── utils.ts         # 功能特定工具函数
├── constants.ts     # 功能特定常量
└── index.ts         # 功能的公共 API
```

---

## 前端：Next.js

### 组件模式

```typescript
// ✅ 组件模板
import { useState } from 'react';
import type { ComponentProps } from '@/types';

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  isLoading?: boolean;
}

export function UserCard({ user, onEdit, isLoading = false }: UserCardProps) {
  if (isLoading) return <UserCardSkeleton />;

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-semibold">{user.name}</h3>
      <p className="text-sm text-gray-600">{user.email}</p>
      {onEdit && (
        <button
          onClick={() => onEdit(user)}
          className="mt-2 text-sm text-primary-600 hover:text-primary-800"
        >
          Edit
        </button>
      )}
    </div>
  );
}
```

### 状态管理

```
// 状态层级：
// 1. URL 参数 — 可分享、可收藏的状态
// 2. 服务端状态 — React Query / SWR
// 3. 表单状态 — React Hook Form / 受控输入
// 4. UI 状态 — useState / useReducer
// 5. 全局状态 — Context / Zustand（谨慎使用）
```

---

## 后端：Next.js API 路由

### API 模式

```typescript
// Route → Controller → Service → Repository
// 保持路由处理器精简 — 业务逻辑放在服务中

// ✅ 路由处理器（精简）
async function getUserHandler(req: Request, res: Response) {
  const { id } = req.params;
  const user = await userService.getById(id);
  if (!user) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
  }
  return res.json({ data: user });
}

// ✅ 服务（业务逻辑在此）
class UserService {
  async getById(id: string): Promise<User | null> {
    if (!isValidUUID(id)) {
      throw new ValidationError('Invalid user ID format');
    }
    return userRepository.findById(id);
  }
}
```

### 中间件栈

```
Request → CORS → Rate Limiter → Auth → Validation → Route Handler → Response
                                                                    ↓
                                                              Error Handler
```

---

## 数据库：PostgreSQL

### 结构约定

- 表名：`snake_case`，复数（`users`、`user_profiles`）
- 列名：`snake_case`（`created_at`、`updated_at`）
- 每张表：`id`（UUID，主键）、`created_at`（时间戳）、`updated_at`（时间戳）
- 外键：`<表名单数>_id`（`user_id`、`post_id`）
- 软删除：`deleted_at`（可为空的时间戳）
- 索引：WHERE、JOIN、ORDER BY 中使用的列

### 查询指南

```typescript
// ✅ 应该：多表写入使用事务
await db.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.userProfile.create({ data: { ...profileData, userId: user.id } });
});

// ✅ 应该：仅选择需要的字段
const users = await db.user.findMany({
  select: { id: true, name: true, email: true },
  where: { status: 'active' },
});

// ❌ 不要：只需要少量字段时选择所有字段
const users = await db.user.findMany({ where: { status: 'active' } });

// ❌ 不要：N+1 查询
for (const post of posts) {
  const author = await db.user.findUnique({ where: { id: post.authorId } });
}

// ✅ 应该：使用 include 或批量查询
const posts = await db.post.findMany({
  include: { author: { select: { id: true, name: true } } },
});
```
