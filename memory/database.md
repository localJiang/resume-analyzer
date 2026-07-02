# 数据库指南：Resume Analyzer

> **用途：** 数据库结构约定、迁移规则和查询模式。
> **数据库：** PostgreSQL
> **ORM：** Prisma

## 结构约定

### 命名

| 元素 | 约定 | 示例 |
|---------|-----------|---------|
| 表 | `snake_case`，复数 | `user_profiles` |
| 列 | `snake_case` | `created_at` |
| 主键 | `id` | `id UUID PRIMARY KEY` |
| 外键 | `<单数表名>_id` | `user_id REFERENCES users(id)` |
| 索引 | `idx_<表>_<列>` | `idx_users_email` |
| 唯一约束 | `uq_<表>_<列>` | `uq_users_email` |
| 枚举表 | `snake_case`，单数 | `user_role` |
| 关联表 | `<表1>_<表2>` | `post_tags`（字母顺序） |

### 必需列 — 每张表

```sql
id          UUID        PRIMARY KEY DEFAULT gen_random_uuid()
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

可选但推荐用于可软删除的实体：
```sql
deleted_at  TIMESTAMPTZ  -- NULL = 未删除，时间戳 = 已软删除
```

### 列类型

| 数据类型 | PostgreSQL | Prisma |
|-----------|-----------|--------|
| ID | `UUID` | `String @id @default(uuid())` |
| 短文本 | `VARCHAR(255)` | `String @db.VarChar(255)` |
| 长文本 | `TEXT` | `String @db.Text` |
| 布尔 | `BOOLEAN` | `Boolean` |
| 整数 | `INTEGER` | `Int` |
| 大整数 | `BIGINT` | `BigInt` |
| 小数 | `DECIMAL(10,2)` | `Decimal @db.Decimal(10,2)` |
| 日期/时间 | `TIMESTAMPTZ` | `DateTime @db.Timestamptz()` |
| JSON | `JSONB` | `Json @db.JsonB` |
| 枚举 | `ENUM` 或查找表 | `enum` 或 relation |
| 文件/图片 | `TEXT`（URL） | `String` |

---

## 结构示例（Prisma）

```prisma
// Resume Analyzer — 实际 Schema
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
  id           String              @id @default(uuid())
  analysisId   String              @map("analysis_id")
  dimension    AnalysisDimension
  severity     Severity            @default(MEDIUM)
  title        String              @db.VarChar(500)
  description  String              @db.Text
  suggestion   String              @db.Text
  positionHint String?             @map("position_hint")

  analysis     Analysis            @relation(fields: [analysisId], references: [id], onDelete: Cascade)

  createdAt    DateTime            @default(now()) @map("created_at")

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

## 迁移规则

### 应该做的
- ✅ 始终使用迁移文件（绝不直接编辑数据库）
- ✅ 应用前审查生成的 SQL
- ✅ 尽可能使迁移可逆
- ✅ 先在 staging 数据库上测试迁移
- ✅ 保持迁移小巧且聚焦
- ✅ 当结构变更需要时包含数据迁移

### 不要做的
- ❌ 绝不要修改已应用的迁移 — 创建新的
- ❌ 绝不要在不先备份数据的情况下删除列
- ❌ 绝不要在流量高峰期运行迁移
- ❌ 绝不要提交包含 SQL 错误的迁移文件
- ❌ 绝不要在没有过渡期的情况下重命名表/列

### 迁移命令
```bash
# 创建迁移
npx prisma migrate dev --name <描述>

# 应用迁移
npx prisma migrate deploy

# 回滚（如果支持）
npx prisma migrate reset（仅开发环境）

# 查看迁移状态
npx prisma migrate status

# 从结构生成类型
npx prisma generate
```

---

## 查询最佳实践

### 1. 仅选择你需要的字段

```typescript
// ❌ 差：获取所有列
const users = await db.user.findMany({ where: { status: 'active' } });

// ✅ 好：选择特定列
const users = await db.user.findMany({
  select: { id: true, name: true, email: true },
  where: { status: 'active' },
});
```

### 2. 避免 N+1 查询

```typescript
// ❌ 差：N+1（1 次查询帖子 + N 次查询作者）
const posts = await db.post.findMany();
for (const post of posts) {
  const author = await db.user.findUnique({ where: { id: post.authorId } });
}

// ✅ 好：单次查询并使用 include
const posts = await db.post.findMany({
  include: { author: { select: { id: true, name: true } } },
});

// ✅ 也好：批量查询
const authorIds = posts.map(p => p.authorId);
const authors = await db.user.findMany({
  where: { id: { in: authorIds } },
  select: { id: true, name: true },
});
```

### 3. 使用分页

```typescript
// 列表查询始终分页
async function listUsers(page: number = 1, pageSize: number = 20) {
  const [users, total] = await Promise.all([
    db.user.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    db.user.count(),
  ]);
  return { data: users, meta: { page, pageSize, total } };
}
```

### 4. 使用事务

```typescript
// 当多个相关记录必须全部成功或全部失败时
await db.$transaction(async (tx) => {
  const order = await tx.order.create({ data: orderData });
  await tx.orderItem.createMany({
    data: items.map(item => ({ ...item, orderId: order.id })),
  });
  await tx.inventory.decrement({ where: { ... }, data: { stock: ... } });
});
```

### 5. 索引策略

```sql
-- 为 WHERE 子句中使用的列建立索引
CREATE INDEX idx_posts_status ON posts(status);

-- 为外键建立索引
CREATE INDEX idx_posts_author_id ON posts(author_id);

-- 为 ORDER BY 中使用的列建立索引
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- 为常见查询模式建立复合索引
CREATE INDEX idx_posts_author_status ON posts(author_id, status);

-- 为过滤查询建立部分索引
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';
```

---

## 种子数据

```typescript
// seed.ts — 始终提供基本的种子脚本
async function seed() {
  // 创建演示用户（仅在开发环境）
  if (process.env.NODE_ENV === 'development') {
    const user = await db.user.create({
      data: {
        email: 'demo@example.com',
        name: 'Demo User',
        passwordHash: await hash('demo1234'),
        role: 'USER',
      },
    });

    // 创建示例简历
    const resume = await db.resume.create({
      data: {
        userId: user.id,
        originalFilename: 'demo_resume.pdf',
        fileType: 'PDF',
        fileSizeBytes: 102400,
        parsedText: '张三\n前端工程师\n工作经验：3年\n...',
      },
    });

    // 创建示例分析
    const analysis = await db.analysis.create({
      data: {
        resumeId: resume.id,
        userId: user.id,
        status: 'COMPLETED',
        overallScore: 78,
        dimensionScores: { completeness: 70, keywords: 82, format: 75, language: 85 },
        llmModel: 'claude-opus-4-8',
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    // 创建示例分析结果
    await db.analysisResult.createMany({
      data: [
        {
          analysisId: analysis.id,
          dimension: 'COMPLETENESS',
          severity: 'HIGH',
          title: '缺少项目量化结果',
          description: '工作经历中没有使用具体数字描述成果，HR无法评估你的贡献规模。',
          suggestion: '在工作经历的每个条目中添加量化指标，如"提升页面加载速度 40%"或"服务 10 万+ 用户"。',
          positionHint: '工作经历第1-3条',
        },
        {
          analysisId: analysis.id,
          dimension: 'KEYWORDS',
          severity: 'MEDIUM',
          title: '核心技能关键词密度不足',
          description: '简历中 "React" 只出现了1次，"TypeScript" 未出现。但你的岗位要求中包含这些关键词。',
          suggestion: '在技能列表和项目经历中更多地自然提及目标岗位的技术关键词。',
        },
      ],
    });
  }
}
```

---

## 数据安全

1. **绝不存储明文密码** — 始终哈希（bcrypt/argon2）
2. **静态加密 PII** — GDPR/CCPA 合规
3. **审计敏感操作** — 记录谁在何时做了什么更改
4. **迁移前备份** — 尤其是破坏性变更
5. **使用只读副本** 处理报告/分析查询
6. **生产环境使用连接池**
