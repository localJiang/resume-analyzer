# 技术规范：Resume Analyzer

> **版本：** 1.0
> **日期：** 2026-06-30
> **受众：** AI Agent 与开发者

---

## 技术栈

| 层级 | 技术 | 版本 | 选型理由 |
|-------|-----------|---------|-----------|
| 前端 | Next.js | 最新 | 支持 SSR、SSG 和 API 路由的 React 框架——最适合全栈应用 |
| 语言 | TypeScript | 严格模式 | 类型安全 |
| UI 库 | Tailwind + shadcn/ui | 最新 | 原子化 CSS + 无障碍组件——最佳开发体验 |
| 后端 | Next.js API 路由 | 最新 | API 与前端同仓部署——简单全栈方案 |
| 数据库 | PostgreSQL | 最新 | 功能强大的关系型数据库——适合大多数应用 |
| ORM | Prisma | 最新 | 类型安全查询 |
| 认证 | Supabase Auth | 最新 | 托管认证 |
| 测试 | Vitest + Playwright | 最新 | 基于 Vite 的快速单元测试 + 可靠的 E2E 测试 |
| CI/CD | GitHub Actions | — | 自动化流水线 |

---

## 开发环境

### 前置要求
- Node.js >= 20.x
- 本地安装 PostgreSQL 或使用云服务
- Git
- 包管理器：npm

### 环境搭建
```bash
# 克隆仓库
git clone https://github.com/your-org/resume-analyzer.git
cd resume-analyzer

# 安装依赖
npm install

# 环境变量
cp .env.example .env
# 填写所需的环境变量

# 数据库
npx prisma migrate dev --name init && npx prisma db seed

# 运行
npm run dev
```

---

## 项目配置

### TypeScript 配置

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### ESLint 配置

```javascript
// .eslintrc.cjs
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
};
```

---

## 数据库模式

### 核心表

```
users
├── id (UUID, PK)
├── email (VARCHAR 255, UNIQUE)
├── name (VARCHAR 255)
├── password_hash (VARCHAR 255)
├── role (ENUM: USER, ADMIN)
├── status (VARCHAR 50, DEFAULT 'active')
├── created_at (TIMESTAMPTZ)
├── updated_at (TIMESTAMPTZ)
└── deleted_at (TIMESTAMPTZ, nullable)

user_profiles
├── id (UUID, PK)
├── user_id (UUID, FK → users.id, UNIQUE)
├── avatar_url (TEXT, nullable)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

resumes
├── id (UUID, PK)
├── user_id (UUID, FK → users.id)
├── original_filename (VARCHAR 500)
├── file_type (ENUM: PDF, DOCX, TXT)
├── file_size_bytes (INTEGER)
├── parsed_text (TEXT)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

analyses
├── id (UUID, PK)
├── resume_id (UUID, FK → resumes.id, UNIQUE)
├── user_id (UUID, FK → users.id)
├── status (ENUM: PENDING, PROCESSING, COMPLETED, FAILED)
├── overall_score (INTEGER, nullable)          -- 0-100
├── dimension_scores (JSONB, nullable)          -- { completeness: 75, keywords: 82, format: 68, language: 90 }
├── llm_model (VARCHAR 100)
├── started_at (TIMESTAMPTZ, nullable)
├── completed_at (TIMESTAMPTZ, nullable)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

analysis_results
├── id (UUID, PK)
├── analysis_id (UUID, FK → analyses.id)
├── dimension (ENUM: COMPLETENESS, KEYWORDS, FORMAT, LANGUAGE)
├── severity (ENUM: HIGH, MEDIUM, LOW)
├── title (VARCHAR 500)
├── description (TEXT)
├── suggestion (TEXT)
├── position_hint (VARCHAR 255, nullable)      -- 简历中对应位置，如 "工作经历第2条"
└── created_at (TIMESTAMPTZ)
```

### 实体关系

```
users 1 ──── 0..1 user_profiles
users 1 ──── 0..* resumes
resumes 1 ──── 0..1 analyses
analyses 1 ──── 0..* analysis_results
```

### Prisma Schema

```prisma
model User {
  id           String        @id @default(uuid())
  email        String        @unique
  name         String
  passwordHash String        @map("password_hash")
  role         UserRole      @default(USER)
  status       String        @default("active")

  profile      UserProfile?
  resumes      Resume[]

  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")
  deletedAt    DateTime?     @map("deleted_at")

  @@index([email])
  @@index([status])
  @@map("users")
}

model UserProfile {
  id        String   @id @default(uuid())
  userId    String   @unique @map("user_id")
  avatarUrl String?  @map("avatar_url")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("user_profiles")
}

model Resume {
  id               String    @id @default(uuid())
  userId           String    @map("user_id")
  originalFilename String    @map("original_filename")
  fileType         FileType  @map("file_type")
  fileSizeBytes    Int       @map("file_size_bytes")
  parsedText       String    @map("parsed_text") @db.Text

  user             User      @relation(fields: [userId], references: [id])
  analysis         Analysis?

  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  @@index([userId])
  @@index([createdAt])
  @@map("resumes")
}

model Analysis {
  id              String           @id @default(uuid())
  resumeId        String           @unique @map("resume_id")
  userId          String           @map("user_id")
  status          AnalysisStatus   @default(PENDING)
  overallScore    Int?             @map("overall_score")
  dimensionScores Json?            @map("dimension_scores") @db.JsonB
  llmModel        String           @map("llm_model")
  startedAt       DateTime?        @map("started_at")
  completedAt     DateTime?        @map("completed_at")

  resume          Resume           @relation(fields: [resumeId], references: [id])
  user            User             @relation(fields: [userId], references: [id])
  results         AnalysisResult[]

  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")

  @@index([userId])
  @@index([status])
  @@map("analyses")
}

model AnalysisResult {
  id           String           @id @default(uuid())
  analysisId   String           @map("analysis_id")
  dimension    AnalysisDimension
  severity     Severity         @default(MEDIUM)
  title        String           @db.VarChar(500)
  description  String           @db.Text
  suggestion   String           @db.Text
  positionHint String?          @map("position_hint")

  analysis     Analysis         @relation(fields: [analysisId], references: [id], onDelete: Cascade)

  createdAt    DateTime         @default(now()) @map("created_at")

  @@index([analysisId])
  @@index([dimension, severity])
  @@map("analysis_results")
}

enum UserRole {
  USER
  ADMIN
}

enum FileType {
  PDF
  DOCX
  TXT
}

enum AnalysisStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum AnalysisDimension {
  COMPLETENESS   // 内容完整度
  KEYWORDS       // 关键词匹配
  FORMAT         // 格式规范
  LANGUAGE       // 语言表达
}

enum Severity {
  HIGH
  MEDIUM
  LOW
}
```

---

## API 规范

### 基础 URL
```
开发环境：http://localhost:3000/api
生产环境：https://your-domain.vercel.app/api
```

### 通用请求头
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

### 接口列表

#### 认证
| 方法 | 路径 | 需要认证 | 描述 |
|--------|------|------|-------------|
| POST | /api/auth/signup | 否 | 创建账户 |
| POST | /api/auth/signin | 否 | 登录 |
| POST | /api/auth/signout | 是 | 退出登录 |
| POST | /api/auth/refresh | 否 | 刷新令牌 |
| POST | /api/auth/reset-password | 否 | 请求重置密码 |

#### 简历
| 方法 | 路径 | 需要认证 | 描述 |
|--------|------|------|-------------|
| POST | /api/resume | 是 | 上传简历文件 |
| GET | /api/resume/:id | 是（本人） | 获取简历详情及解析文本 |

#### 分析
| 方法 | 路径 | 需要认证 | 描述 |
|--------|------|------|-------------|
| POST | /api/analysis | 是 | 创建分析（触发 AI 分析） |
| GET | /api/analysis | 是（本人） | 获取用户的分析历史列表 |
| GET | /api/analysis/:id | 是（本人） | 获取单次分析报告（含逐条结果） |

---

## 组件树

```
App
├── Providers
│   ├── ThemeProvider
│   ├── AuthProvider (Supabase)
│   └── QueryClientProvider (React Query)
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation (首页 | 工作台)
│   │   └── UserMenu (Avatar + DropdownMenu)
│   ├── Main
│   │   └── <页面内容>
│   └── Footer
```

---

## 状态管理

### 缓存策略

| 数据类型 | 策略 | 过期时间 | 缓存时间 |
|-----------|----------|-----------|------------|
| 用户资料 | React Query | 5 分钟 | 30 分钟 |
| 分析历史列表 | React Query | 1 分钟 | 10 分钟 |
| 分析报告 | React Query | 30 分钟 | 1 小时 |
| 参考数据 | React Query | 1 小时 | 24 小时 |
| 表单状态 | React Hook Form | N/A（本地） | N/A |
| UI 状态 | Zustand | N/A（本地） | N/A |

---

## 构建与部署

### 构建命令
```bash
npm run build
```

### 构建产物
```
.next/
├── static/
│   ├── chunks/
│   │   ├── *.js
│   │   └── *.css
│   └── media/
│       └── *.svg
├── server/
│   └── pages/     # SSR 页面
└── ...
```

### 环境变量

| 变量名 | 必填 | 描述 |
|----------|----------|-------------|
| `DATABASE_URL` | 是 | PostgreSQL 数据库连接字符串 |
| `NEXT_PUBLIC_SUPABASE_URL` | 是 | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 是 | Supabase 匿名密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | 是 | Supabase 服务角色密钥（服务端） |
| `LLM_API_KEY` | 是 | LLM API 密钥（OpenAI / Anthropic） |
| `LLM_MODEL` | 是 | LLM 模型名（如 `claude-opus-4-8`） |
| `NEXT_PUBLIC_API_URL` | 是 | 公开 API 基础 URL |
| `ALLOWED_ORIGINS` | 是 | CORS 允许的来源，逗号分隔 |
| `NODE_ENV` | 是 | 环境模式（development/production） |

---

## 测试策略

### 测试类型

| 类型 | 工具 | 范围 | 目标 |
|------|------|-------|--------|
| 单元测试 | Vitest | 函数、hooks、工具 | 80%+ 覆盖率 |
| 组件测试 | Vitest + Testing Library | UI 组件 | 所有组件 |
| 集成测试 | Vitest + Supertest | API + 数据库 | 所有接口 |
| E2E 测试 | Playwright | 关键流程 | 核心路径 |

### 测试文件位置
```
src/
├── features/
│   └── auth/
│       ├── services/
│       │   ├── auth.service.ts
│       │   └── auth.service.test.ts     # 同目录测试文件
│       └── ...
tests/
├── unit/                                  # 独立单元测试
├── integration/                           # API 集成测试
├── e2e/                                   # 端到端测试
└── fixtures/                              # 测试数据
```
