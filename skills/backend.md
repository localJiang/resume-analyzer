# 技能：后端开发

## 描述
使用 Next.js API 路由 配合 TypeScript 构建和维护后端 API。

## 适用场景
- 创建新 API 端点
- 实现业务逻辑
- 设置中间件
- 集成外部服务
- 修复后端缺陷
- 性能优化

## 输入
- Architect Agent 提供的 API 契约
- Database Agent 提供的数据库模式
- PM Agent 提供的业务需求
- 现有服务层

## 输出
- 路由处理器（薄控制器）
- 包含业务逻辑的服务层
- 中间件（认证、校验、限流）
- 输入校验模式（Zod）
- API 文档（OpenAPI/Swagger）
- 集成测试

## 约束
- 路由处理器必须保持轻薄 — 业务逻辑放在服务层
- 每个端点必须进行输入校验
- 统一的错误响应格式
- 所有端点必须有 OpenAPI 文档
- 使用正确的 HTTP 状态码
- 中间件中不放置业务逻辑
- 公开/敏感端点需设置限流
- 密钥从环境变量获取，严禁硬编码

## 路由处理器模板

```typescript
import { z } from 'zod';
import type { Request, Response } from 'express';

// 定义校验模式
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8),
});

// 路由处理器（轻薄 — 委托给服务层）
async function createUser(req: Request, res: Response) {
  // 1. 校验输入
  const parsed = CreateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: '输入无效',
        details: parsed.error.issues,
      },
    });
  }

  // 2. 调用服务层
  try {
    const user = await userService.create(parsed.data);
    return res.status(201).json({ data: user });
  } catch (error) {
    // 3. 处理已知错误
    if (error instanceof ConflictError) {
      return res.status(409).json({
        error: { code: 'CONFLICT', message: error.message },
      });
    }
    throw error; // 让全局错误处理器捕获未知错误
  }
}
```

## 最佳实践
1. **薄路由、厚服务** — 路由负责校验 + 委托，服务层负责具体工作
2. **快速失败** — 在边界处校验，尽早返回
3. **类型化结果** — 对预期错误使用 Result 类型而非抛出异常
4. **幂等写入** — PUT 操作可重复执行而无副作用
5. **结构化日志** — JSON 格式日志，附带请求 ID 以便追踪
6. **缓存昂贵操作** — 但要正确设置失效策略
7. **绝不信任客户端输入** — 即使前端已校验，后端仍需再次校验
