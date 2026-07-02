# Next.js 规则

> **适用于：** 所有 Next.js App Router 文件
> **版本：** Next.js 14+ 配合 App Router

## 路由

### 正确做法 ✅

```typescript
// App Router：页面位于 app/ 目录中
// app/page.tsx → /
// app/about/page.tsx → /about
// app/users/[id]/page.tsx → /users/:id

// 路由组用于布局共享（括号内的文件夹名称）
// app/(auth)/login/page.tsx
// app/(auth)/signup/page.tsx
// app/(dashboard)/settings/page.tsx

// 并行路由用于复杂布局
// app/@modal/login/page.tsx

// 使用 layout.tsx 在多个路由间共享 UI
// app/layout.tsx — 根布局（必需）
// app/(dashboard)/layout.tsx — 仪表盘布局
```

### 错误做法 ❌

```typescript
// ❌ 不要混用 Pages Router 和 App Router
// 选择其一，完整迁移

// ❌ 不要到处使用 'use client'
// 尽可能保持服务端渲染
```

## 服务端与客户端组件

```typescript
// 服务端组件（默认）— 无 'use client' 指令
// ✅ 可以是异步的
// ✅ 可以直接访问数据库
// ✅ 不影响打包体积
export default async function UsersPage() {
  const users = await db.user.findMany(); // 直接访问数据库！
  return <UserList users={users} />;
}

// 客户端组件 — 必须添加 'use client' 指令
// ✅ 用于交互：onClick、onChange、useState、useEffect
// ✅ 用于浏览器 API：localStorage、geolocation
'use client';
export function UserSearch() {
  const [query, setQuery] = useState('');
  return <Input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

## 数据获取

```typescript
// 服务端组件 — 直接获取数据
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  const json = await data.json();
  return <Display data={json} />;
}

// 客户端组件 — 使用 React Query 或 SWR
'use client';
function UserList() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  });
}
```

## 最佳实践

1. **服务端组件默认优先** — 仅在必要时添加 'use client'
2. **流式渲染** — 使用 `loading.tsx` 实现路由级别的加载状态
3. **错误边界** — 使用 `error.tsx` 实现路由级别的错误处理
4. **元数据** — 导出 `metadata` 对象或 `generateMetadata` 函数
5. **图片** — 使用 `next/image` 优化图片
6. **字体** — 使用 `next/font/google` 优化字体加载
7. **静态优先** — 尽可能优先使用静态生成而非 SSR
