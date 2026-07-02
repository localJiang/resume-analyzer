# TypeScript 规则

> **适用于：** 所有 `.ts` 和 `.tsx` 文件
> **配置：** `tsconfig.json` 开启 `strict: true`

## 类型系统

### 正确做法 ✅

```typescript
// 使用 interface 定义对象形状
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// 使用 type 定义联合类型、交叉类型、映射类型
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: AppError };

type Role = 'user' | 'admin' | 'moderator';

// 对不可变属性使用 readonly
interface Config {
  readonly apiUrl: string;
  readonly maxRetries: number;
}

// 使用 as const 进行字面量推断
const COLORS = ['red', 'green', 'blue'] as const;
type Color = (typeof COLORS)[number]; // 'red' | 'green' | 'blue'

// 使用可选链和空值合并
const name = user?.profile?.name ?? 'Anonymous';

// 使用模板字面量类型
type ApiRoute = `/api/${string}`;
type EventName = `user.${'created' | 'updated' | 'deleted'}`;

// 使用 satisfies 进行类型检查而不拓宽类型
const config = {
  apiUrl: 'https://api.example.com',
  maxRetries: 3,
} satisfies Config;

// 使用可辨识联合类型表示状态
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
```

### 错误做法 ❌

```typescript
// ❌ 绝不使用 any
function process(data: any): any { ... }

// ❌ 不要无缘无故使用 ts-ignore
// ✅ 如果绝对必要，使用 ts-expect-error 并附带注释说明
// @ts-expect-error — 库的类型定义在 v2.1 中有误
library.method();

// ❌ 如非绝对必要，不要使用类型断言
const user = data as User;

// ✅ 改用类型守卫
function isUser(data: unknown): data is User {
  return typeof data === 'object' && data !== null && 'id' in data && 'email' in data;
}

// ❌ 不要为简单常量使用 enum
enum Status { Active, Inactive }

// ✅ 使用带 as const 的 const 对象
const Status = { Active: 'active', Inactive: 'inactive' } as const;
type Status = (typeof Status)[keyof typeof Status];
```

## 命名

```typescript
// ✅ 接口：PascalCase，不加 I 前缀
interface UserProfile { ... }

// ✅ 类型别名：PascalCase
type UserRole = 'admin' | 'user';

// ✅ 函数：camelCase
function getUserById(id: string): Promise<User> { ... }

// ✅ 变量：camelCase
const userData = await fetchUser();

// ✅ 常量：UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';

// ✅ 枚举/const 对象：PascalCase
const UserRole = { ... } as const;

// ✅ 泛型参数：单个大写字母或 PascalCase 前缀
function map<T, U>(items: T[], fn: (item: T) => U): U[] { ... }
function getProperty<TData, TKey extends keyof TData>(obj: TData, key: TKey) { ... }
```

## 函数

```typescript
// ✅ 始终为公共函数声明返回类型
export function formatDate(date: Date, format: DateFormat): string {
  // ...
}

// ✅ 3 个及以上参数使用对象参数
interface CreateUserParams {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}

async function createUser(params: CreateUserParams): Promise<User> {
  // ...
}

// ✅ 使用默认参数代替 null 检查
function greet(name: string = 'World'): string {
  return `Hello, ${name}!`;
}

// ✅ 回调函数优先使用箭头函数
const users = data.filter(user => user.isActive).map(user => user.name);
```

## 错误处理

```typescript
// ✅ 使用类型化错误
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// ✅ 对预期失败使用 Result 类型
type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return { success: false, error: new NotFoundError('User', id) };
    }
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: new AppError('数据库错误', 'DB_ERROR') };
  }
}
```
