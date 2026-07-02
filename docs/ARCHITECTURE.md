# 系统架构：Resume Analyzer

> **版本：** 1.0
> **日期：** 2026-06-30
> **作者：** Architect Agent

---

## 概述

本文档描述 Resume Analyzer 的技术架构。

---

## 架构风格

**Feature First（功能优先）**

按功能模块组织代码——每个功能文件夹包含自己的组件、hooks、服务、类型和测试。相关代码集中管理，便于添加、修改或删除功能。

---

## 高层架构

```
┌──────────────────────────────────────────────────────┐
│                    客户端层                           │
│  ┌────────────────────────────────────────────────┐  │
│  │          Next.js SPA / SSR                 │  │
│  │  • Next.js with TypeScript             │  │
│  │  • Tailwind + shadcn/ui (UI 组件)                 │  │
│  │  • React Query (服务端状态)                    │  │
│  │  • Zustand (客户端状态)                        │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────┘
                       │ HTTPS / REST
┌──────────────────────┴───────────────────────────────┐
│                    API 层                              │
│  ┌────────────────────────────────────────────────┐  │
│  │          Next.js API 路由 API 服务端                  │  │
│  │  • 路由处理（薄层）                              │  │
│  │  • 中间件（认证、CORS、限流）                    │  │
│  │  • 服务层（业务逻辑）                            │  │
│  │  • 校验（Zod）                                   │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────┴───────────────────────────────┐
│                    数据层                              │
│  ┌──────────────┐                                     │
│  │  Prisma     │                                     │
│  │  ORM         │                                     │
│  └──────┬───────┘                                     │
│         │                                            │
│  ┌──────┴───────┐                                    │
│  │  PostgreSQL│                                    │
│  │  主数据库     │                                    │
│  └──────────────┘                                    │
└──────────────────────────────────────────────────────┘
```

---

## 组件详情

### 前端架构

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # 根布局
│   ├── page.tsx              # 首页 /
│   ├── (auth)/               # 认证路由组
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/          # 仪表盘路由组
│   │   ├── layout.tsx        # 工作台布局（Header + 内容区）
│   │   └── dashboard/page.tsx
│   └── analysis/             # 分析报告路由
│       └── [id]/page.tsx     # 单次分析报告
├── components/
│   ├── ui/                   # shadcn 基础组件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── layout/               # 布局组件
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── common/               # 共享功能组件
├── features/                 # 功能模块
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   └── resume/               # 简历分析模块
│       ├── components/       # UploadZone, AnalysisReport, HistoryList
│       ├── hooks/            # useUpload, useAnalysis
│       ├── services/         # analysis.api.ts
│       └── types.ts
├── lib/                      # 工具库
│   ├── api.ts                # API 客户端配置
│   ├── auth.ts               # 认证辅助
│   ├── db.ts                 # 数据库客户端
│   └── utils.ts              # 通用工具
├── hooks/                    # 共享 hooks
├── stores/                   # 全局状态
├── types/                    # 共享类型
└── styles/                   # 全局样式
```

### 后端架构（Next.js API 路由）

```
src/
├── app/
│   └── api/                   # API 路由（文件即路由）
│       ├── auth/
│       │   ├── signup/route.ts
│       │   ├── signin/route.ts
│       │   ├── signout/route.ts
│       │   └── refresh/route.ts
│       ├── resume/
│       │   ├── route.ts       # POST 上传简历
│       │   └── [id]/
│       │       └── route.ts   # GET 简历详情
│       └── analysis/
│           ├── route.ts       # POST 创建分析
│           └── [id]/
│               └── route.ts   # GET 分析报告
├── lib/
│   ├── db.ts                  # Prisma 客户端
│   ├── auth.ts                # 认证辅助（Supabase Auth）
│   ├── llm.ts                 # LLM 调用封装
│   └── parser.ts              # 文件解析（pdf-parse / mammoth）
├── services/                  # 业务逻辑（被 API 路由调用）
│   ├── analysis.service.ts
│   └── resume.service.ts
└── types/                     # 共享类型
    ├── resume.ts
    └── analysis.ts

prisma/
└── schema.prisma              # 数据库模式
```

---

## 数据流

### 请求生命周期

```
1. 客户端请求 Next.js API 路由
   ↓
2. Supabase Auth 中间件（验证 JWT/Session）
   ↓
3. Zod 输入校验（在路由 handler 内部）
   ↓
4. 路由 handler 调用 service 层（业务逻辑）
   ↓
5. Service 通过 Prisma 访问 PostgreSQL
   ↓
6. 返回 JSON 响应（或 4xx/5xx 错误）
```

### 认证流程

```
登录：
  客户端 → POST /api/auth/signin { email, password }
       → 验证凭据（Supabase Auth）
       → 返回 session（含 access_token + refresh_token）
       → 客户端将 session 存储在 Supabase client 中

已认证请求：
  客户端 → GET /api/analysis (Authorization: Bearer <access_token>)
       → Supabase Auth 中间件验证 session
       → 路由处理执行
       → 返回响应

令牌刷新：
  Supabase Auth 自动处理 refresh token 轮换，前端无需手动调用
```

---

## 安全架构

### 安全措施

| 关注点 | 实现方式 |
|---------|---------------|
| 身份认证 | Supabase Auth（JWT + 刷新令牌轮换） |
| 权限控制 | RBAC（USER、ADMIN、MODERATOR 角色） |
| 输入校验 | 所有输入使用 Zod 模式校验 |
| 速率限制 | 令牌桶，已认证用户 60 次/分钟 |
| CORS | 白名单允许的来源 |
| CSRF | SameSite=Strict cookies + CSRF 令牌 |
| XSS | Content-Security-Policy 响应头 |
| SQL 注入 | Prisma 参数化查询 |
| 数据加密 | 传输中 TLS 1.3，静态存储 AES-256 |
| 密钥管理 | 环境变量，绝不写入代码 |
| 依赖扫描 | CI 中使用 Dependabot / Snyk |

---

## 部署架构

### 环境：Vercel

```
┌──────────────────────────────────────────┐
│              GitHub 仓库                   │
│                                          │
│  main ←── PR（Squash Merge）←── feature  │
└────────────────┬─────────────────────────┘
                 │ 推送到 main
                 ▼
┌──────────────────────────────────────────┐
│            GitHub Actions（GitHub Actions）        │
│                                          │
│  1. 安装依赖                              │
│  2. Lint 与格式化检查                     │
│  3. 类型检查                              │
│  4. 单元测试                              │
│  5. 集成测试                              │
│  6. 构建                                  │
│  7. 部署到 Vercel                  │
└──────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│            Vercel                  │
│                                          │
│  预览部署（每个 PR）                       │
│  预发布环境（develop 分支）                │
│  生产环境（main 分支）                     │
└──────────────────────────────────────────┘
```

---

## 关键设计决策

| 决策 | 理由 | 备选方案 |
|----------|-----------|------------------------|
| 前端使用 Next.js | SSR + 静态生成，生态强大 | Remix、SvelteKit |
| API 使用 Next.js API 路由 | 类型安全、自动文档、异步支持 | Express、Hono |
| PostgreSQL + Prisma | 类型安全查询、迁移支持 | Drizzle、Knex |
| 认证使用 Supabase Auth | 托管认证、内置社交登录 | Auth0、Clerk、自定义 |
| Feature First（功能优先） 结构 | 可扩展的组织方式 | MVC、分层架构 |

---

## 性能目标

| 指标 | 目标值 | 测量方式 |
|--------|--------|-------------|
| First Contentful Paint (FCP) | < 1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Time to Interactive (TTI) | < 3.5s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| API 响应时间 (p95) | < 200ms | APM/监控 |
| 数据库查询 (p95) | < 50ms | APM |

---

## 监控与可观测性

- **日志：** 结构化 JSON 日志
- **指标：** 请求速率、错误率、延迟百分位数
- **告警：** 错误率 > 1%、p95 延迟 > 500ms、数据库连接错误
- **错误追踪：** Sentry 或类似工具
- **运行时间监控：** 每 60 秒外部健康检查
