# 技能：API 设计

## 描述
遵循项目标准设计和文档化 RESTful API。

## 适用场景
- 设计新 API 端点
- 审查 API 契约
- API 版本管理
- 使用 OpenAPI/Swagger 编写 API 文档
- 设计错误响应格式

## 输入
- 功能需求
- 数据库模式
- 认证要求
- 性能目标

## 输出
- API 端点规范
- OpenAPI/Swagger 文档
- 校验模式（Zod）
- 请求/响应类型定义
- 错误码目录

## 约束
- RESTful URL 约定（名词而非动词）
- 统一响应格式：`{ data }` 或 `{ error: { code, message, details? } }`
- 正确的 HTTP 状态码（2xx 成功，4xx 客户端错误，5xx 服务端错误）
- 所有列表端点需分页：`{ data, meta: { page, pageSize, total } }`
- 每个端点需进行输入校验
- 除显式公开路由外均需认证
- 认证端点和公开端点需限流

## 最佳实践
1. **URL 使用名词而非动词** — `/api/users`，而非 `/api/getUsers`
2. **集合使用复数** — `/api/users`，而非 `/api/user`
3. **谨慎嵌套资源** — 最多 2 层深度
4. **统一错误格式** — 所有错误遵循相同结构
5. **从一开始就做版本控制** — `/api/v1/...`
6. **全面文档化** — 每个端点都需要 OpenAPI 规范

## 示例

```typescript
// GET /api/v1/users?page=1&limit=20&sort=createdAt&order=desc
// 响应 200：
{
  "data": [
    { "id": "abc", "email": "user@example.com", "name": "John" }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 150, "totalPages": 8 }
}

// POST /api/v1/users
// 请求：
{ "email": "user@example.com", "name": "John", "password": "s3cret!!" }
// 响应 201：
{ "data": { "id": "abc", "email": "user@example.com", "name": "John" } }

// 错误 400：
{ "error": { "code": "VALIDATION_ERROR", "message": "输入无效", "details": [...] } }
```
