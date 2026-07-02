# Prisma 规则

> **适用于：** 数据库模式、迁移、查询
> **文件：** `prisma/schema.prisma`

## 模式设计

### 正确做法 ✅

```prisma
// 使用 @@map() 定义表名（snake_case，复数）
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  role      UserRole @default(USER)
  status    String   @default("active")

  profile   UserProfile?
  posts     Post[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  @@index([email])
  @@index([status])
  @@index([createdAt])
  @@map("users")
}

// 枚举：UPPER_SNAKE_CASE 值
enum UserRole {
  USER
  ADMIN
  MODERATOR
}

// 关系：始终定义双向关系
model UserProfile {
  id        String  @id @default(uuid())
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String  @unique @map("user_id")
  bio       String? @db.Text

  @@map("user_profiles")
}
```

### 错误做法 ❌

```prisma
// ❌ 不使用自增 ID
id Int @id @default(autoincrement())

// ✅ 改用 UUID
id String @id @default(uuid())

// ❌ 不省略 @@map() — 显式定义表名可避免意外
model UserProfile { ... }

// ✅ 始终添加 @@map()
model UserProfile { ... @@map("user_profiles") }
```

## 查询模式

```typescript
// ✅ 仅选择需要的字段
const users = await db.user.findMany({
  select: { id: true, name: true, email: true },
  where: { status: 'active' },
});

// ✅ 使用 include 加载关联
const posts = await db.post.findMany({
  include: { author: { select: { id: true, name: true } } },
});

// ✅ 所有列表查询进行分页
const [data, total] = await Promise.all([
  db.user.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
  db.user.count({ where }),
]);

// ✅ 多表操作使用事务
await db.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.userProfile.create({ data: { ...profile, userId: user.id } });
});

// ❌ 避免 N+1 查询
for (const post of posts) {
  const author = await db.user.findUnique({ where: { id: post.authorId } });
}

// ✅ 改用 include 或批量查询
```

## 迁移规则

```bash
# 创建迁移（始终检查生成的 SQL）
npx prisma migrate dev --name describe_change

# 在生产环境应用
npx prisma migrate deploy

# 绝不修改已应用的迁移
# 创建新迁移来修复问题

# 始终先在预发布环境测试迁移
```

## 最佳实践

1. **使用 UUID 作为主键** — 而非自增（更适合分布式系统）
2. **始终使用 @@map()** — 显式定义表名/列名
3. **始终定义 onDelete** — 显式 cascade/set null/restrict
4. **仅选择需要的字段** — 绝不使用 `select *`
5. **使用事务保证一致性** — 多表写入放在事务中
6. **为查询模式创建索引** — 为 WHERE、JOIN、ORDER BY 中的列添加 @@index
7. **软删除** — 重要数据使用 `deletedAt` 列
8. **检查生成的 SQL** — Prisma 自动生成 SQL；验证其是否符合预期
