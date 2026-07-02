# API 指南：Resume Analyzer

> **用途：** API 设计标准。后端 Agent 必须遵循这些规则。

## RESTful 约定

### URL 设计

```
✅ /api/users              # 集合（复数，kebab-case）
✅ /api/users/:id          # 单个资源
✅ /api/users/:id/posts    # 嵌套资源
✅ /api/users?page=2&limit=20   # 使用查询参数分页

❌ /api/getUsers           # URL 中不要使用动词
❌ /api/user               # 集合使用复数
❌ /api/user_list          # 不要使用 snake_case
❌ /api/Users              # 不要使用 PascalCase
```

### HTTP 方法

| 方法 | 操作 | 幂等 | 安全 |
|--------|--------|-----------|------|
| GET | 检索 | 是 | 是 |
| POST | 创建 | 否 | 否 |
| PUT | 替换 | 是 | 否 |
| PATCH | 部分更新 | 否 | 否 |
| DELETE | 删除 | 是（软删除） | 否 |

### HTTP 状态码

```typescript
// 2xx — 成功
200 OK            // 一般成功
201 Created       // 资源已创建（返回该资源）
204 No Content    // 成功但无响应体（DELETE）

// 3xx — 重定向
301 Moved Permanently
304 Not Modified

// 4xx — 客户端错误
400 Bad Request   // 无效输入
401 Unauthorized  // 缺少或错误的认证
403 Forbidden     // 认证有效但无权限
404 Not Found     // 资源不存在
409 Conflict      // 资源已存在
422 Unprocessable // 验证失败
429 Too Many Requests // 被限流

// 5xx — 服务端错误
500 Internal Server Error  // 意外错误（绝不暴露详情）
503 Service Unavailable    // 维护/下游故障
```

---

## 响应格式

### 成功响应

```typescript
// 单个资源
{
  "data": {
    "id": "abc-123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}

// 集合（分页）
{
  "data": [
    { "id": "abc-123", "name": "John" },
    { "id": "def-456", "name": "Jane" }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 错误响应

```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for 2 field(s)",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "password", "message": "Must be at least 8 characters" }
    ],
    "requestId": "req_abc123"  // 用于调试，与日志关联
  }
}
```

### 错误代码

| 代码 | HTTP 状态码 | 含义 |
|------|-------------|---------|
| `VALIDATION_ERROR` | 400 | 输入验证失败 |
| `UNAUTHORIZED` | 401 | 缺少或无效的认证令牌 |
| `FORBIDDEN` | 403 | 已认证但无权限 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `CONFLICT` | 409 | 资源已存在 |
| `RATE_LIMITED` | 429 | 请求过多 |
| `INTERNAL_ERROR` | 500 | 意外服务端错误 |

---

## 验证规则

每个端点都必须验证：

```typescript
import { z } from 'zod';

// 定义模式
const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['user', 'admin']).default('user'),
});

// 在中间件或处理器中验证
async function createUser(req: Request, res: Response) {
  const parsed = CreateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: parsed.error.issues.map(i => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
    });
  }
  // parsed.data 类型正确
}
```

---

## 分页

```typescript
// 标准分页参数
interface PaginationParams {
  page?: number;    // 默认：1
  limit?: number;   // 默认：20，最大：100
  sort?: string;     // 默认：'createdAt'
  order?: 'asc' | 'desc';  // 默认：'desc'
}

// 响应中的分页元数据
interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
```

---

## 认证

所有 API 路由都需要认证，除非明确标记为公开。

```typescript
// 标记公开路由
export const PUBLIC_ROUTES = [
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/auth/refresh',
  '/api/health',
];

// 认证中间件
async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
  }
  try {
    const payload = await verifyToken(token);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
    });
  }
}
```

---

## 速率限制

```typescript
// 速率限制等级
const RATE_LIMITS = {
  public: { window: '1m', max: 30 },     // 公开端点 30 次/分钟
  authenticated: { window: '1m', max: 60 },  // 已认证 60 次/分钟
  sensitive: { window: '1m', max: 5 },    // 登录/重置等 5 次/分钟
};
```

---

## CORS

```typescript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 小时预检缓存
};
```

---

## API 版本管理

- 使用 URL 前缀：`/api/v1/users`
- 破坏性变更时递增主版本号
- 废弃后继续维护上一版本 6 个月
- 在响应头中发送废弃警告：
  ```
  Deprecation: true
  Sunset: Sat, 01 Jan 2025 00:00:00 GMT
  ```
