# 项目概览：Resume Analyzer

> **用途：** 为 AI Agent 提供快速上下文。开始任何任务前先阅读此文件。

## 项目标识

- **项目名称：** Resume Analyzer
- **描述：** AI驱动的简历分析工具
- **仓库：** 待创建
- **环境：** Vercel

## 技术栈

| 层级 | 技术 | 版本 |
|-------|-----------|---------|
| 前端 | Next.js | latest |
| 语言 | TypeScript | strict mode |
| UI | Tailwind + shadcn/ui | latest |
| 后端 | Next.js API 路由 | latest |
| 数据库 | PostgreSQL | latest |
| ORM | Prisma | latest |
| 认证 | Supabase Auth | latest |
| 测试 | Vitest + Playwright | latest |
| CI/CD | GitHub Actions | — |

## 架构风格

Feature First（功能优先）

### 核心模式

- **功能隔离：** 每个功能模块自包含
- **就近原则：** 组件、hooks、类型放在一起
- **统一出口：** 每个功能通过 index.ts 导出公开 API
- **共享核心：** 公共工具放在 src/lib/，共享 UI 放在 src/components/

## 核心功能

1. **用户认证** — 注册、登录、密码重置、会话管理
2. **简历上传与解析** — 支持 PDF/DOCX/TXT 上传，自动解析文本内容
3. **AI 简历分析** — 多维度分析（内容完整度、关键词匹配、格式规范、语言表达），输出评分和逐条建议
4. **分析历史管理** — 查看历史分析记录，支持重新分析

## 关键决策

| 日期 | 决策 | 理由 |
|------|----------|-----------|
| 2026-06-30 | 使用 Next.js + Next.js API 路由 | 全栈同仓，SSR/SSG 支持，生态成熟 |

## 约束

- 必须支持现代浏览器（最新 2 个版本）
- 要求移动端响应式设计
- 最低 WCAG 2.1 AA 可访问性标准
- 所有 API 端点必须有认证（公开路由除外）
- 数据库迁移必须是可逆的

## 相关链接

- [架构决策](./architecture.md)
- [API 指南](./api.md)
- [数据库结构](./database.md)
- [UI 指南](./ui.md)
- [编码规范](./coding-style.md)
