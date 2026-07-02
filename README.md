# Resume Analyzer

> AI驱动的简历分析工具

## 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/your-org/resume-analyzer.git
cd resume-analyzer

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的配置

# 启动开发服务器
npm run dev
```

## 📋 前置条件

- Node.js >= 20.x
- PostgreSQL
- Git

## 🛠️ 技术栈

| 分类 | 技术 |
|----------|-----------|
| **前端** | Next.js |
| **语言** | TypeScript |
| **UI 框架** | Tailwind + shadcn/ui |
| **后端** | Next.js API 路由 |
| **数据库** | PostgreSQL |
| **ORM** | Prisma |
| **认证** | Supabase Auth |
| **部署** | Vercel |
| **测试** | Vitest + Playwright |
| **CI/CD** | GitHub Actions |

## 📁 项目结构

```
resume-analyzer/
├── .github/                    # GitHub Actions 和模板
│   ├── workflows/              # CI/CD 工作流
│   ├── ISSUE_TEMPLATE.md       # Issue 模板
│   └── PULL_REQUEST_TEMPLATE.md
├── .claude/                    # Claude Code 配置
│   ├── commands/               # 自定义斜杠命令
│   ├── skills/                 # 自定义技能
│   └── settings.json           # 权限和钩子
├── .cursor/                    # Cursor IDE 配置
│   └── rules/                  # Cursor 规则
├── .vscode/                    # VSCode 配置
│   ├── settings.json
│   └── extensions.json
├── docs/                       # 项目文档
│   ├── PRD.md                  # 产品需求文档
│   ├── ARCHITECTURE.md         # 系统架构
│   ├── REQUIREMENTS.md         # 功能和非功能需求
│   ├── SPEC.md                 # 技术规格说明
│   ├── TASKS.md                # 任务分解
│   └── ROADMAP.md              # 项目路线图
├── memory/                     # AI 上下文文件
│   ├── project.md              # 项目概览
│   ├── coding-style.md         # 编码规范
│   ├── architecture.md         # 架构决策
│   ├── api.md                  # API 指南
│   ├── database.md             # 数据库结构
│   └── ui.md                   # UI 指南
├── prompts/                    # 可复用提示词
├── specs/                      # 功能规格
├── tasks/                      # 活跃任务跟踪
├── src/                        # 源代码
│   ├── app/                    # 应用代码
│   ├── components/             # 共享组件
│   ├── lib/                    # 工具和库
│   ├── styles/                 # 全局样式
│   └── types/                  # TypeScript 类型定义
├── public/                     # 静态资源
├── tests/                      # 测试文件
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .editorconfig               # 编辑器配置
├── .env.example                # 环境变量模板
├── .eslintrc.cjs               # ESLint 配置
├── .gitignore                  # Git 忽略规则
├── .prettierrc                 # Prettier 配置
├── AGENTS.md                   # AI Agent 定义
├── CLAUDE.md                   # AI 编码指令
└── README.md                   # 本文件
```

## 🧑‍💻 开发

### 命令

| 命令 | 描述 |
|---------|------------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run test` | 运行测试 |
| `npm run lint` | 代码检查 |
| `npm run format` | 格式化代码 |
| `npm run typecheck` | 类型检查 |

### 分支策略

- `main` — 生产就绪代码
- `develop` — 集成分支
- `feature/*` — 新功能
- `fix/*` — Bug 修复
- `chore/*` — 维护任务

### 提交规范

我们遵循 [约定式提交](https://www.conventionalcommits.org/)：

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

类型：`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`chore`、`ci`

## 🤖 AI 辅助开发

本项目已配置为支持 AI 辅助开发。Agent 可以读取：

- **CLAUDE.md** — 编码规则和约定
- **AGENTS.md** — 多 Agent 角色定义
- **memory/** — 项目上下文和决策
- **docs/** — 完整技术文档
- **commands/** — 工作流自动化脚本
- **skills/** — 可复用 AI 技能定义

## 📄 许可证

MIT
