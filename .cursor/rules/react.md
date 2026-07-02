# React 规则

> **适用于：** 所有 `.tsx` 组件文件
> **版本：** React 18+ 配合 Hooks

## 组件结构

### 正确做法 ✅

```typescript
// 使用 TypeScript 编写函数式组件
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  isLoading?: boolean;
}

export function UserCard({ user, onEdit, isLoading = false }: UserCardProps) {
  // 1. Hooks 放在顶部
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 2. 派生状态
  const fullName = `${user.firstName} ${user.lastName}`;
  
  // 3. 事件处理器
  const handleEdit = () => onEdit?.(user);
  
  // 4. 条件渲染
  if (isLoading) return <UserCardSkeleton />;
  if (!user) return <EmptyState />;
  
  // 5. 主渲染
  return (
    <div className="rounded-lg border p-4">
      <h3>{fullName}</h3>
      {onEdit && <Button onClick={handleEdit}>编辑</Button>}
    </div>
  );
}

// 小型子组件可共存于同一文件中
function UserCardSkeleton() {
  return <div className="animate-pulse rounded-lg border p-4">...</div>;
}
```

### 错误做法 ❌

```typescript
// ❌ 不使用类组件
class UserCard extends React.Component { ... }

// ❌ 不写超大组件（> 300 行）
// 拆分为更小的组件和 Hooks

// ❌ 不使用内联样式
<div style={{ padding: '16px', color: 'red' }}>

// ✅ 使用 Tailwind
<div className="p-4 text-red-500">

// ❌ Props 传递不超过 2 层
// 使用 Context、组合或状态管理
```

## Hooks 规则

```typescript
// ✅ 自定义 Hook 用于可复用逻辑
function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  return { users, isLoading, error, refetch: () => { ... } };
}

// ✅ 仅在性能分析显示收益时使用 useMemo
const expensiveValue = useMemo(() => {
  return computeExpensive(data);
}, [data]);

// ✅ 仅在传递给已记忆化的子组件时使用 useCallback
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

## 状态管理层级

```
1. URL 参数     → 可分享/可收藏的状态
2. 服务端状态   → React Query / SWR（缓存、同步）
3. 表单状态     → React Hook Form（本地、高性能）
4. UI 状态      → useState / useReducer（本地）
5. 全局状态     → Context + useReducer / Zustand（谨慎使用）
```

## 最佳实践
1. **每个文件一个组件**（小型子组件可共存于同一文件）
2. **就近放置** — 组件、Hooks、类型放在功能文件夹中
3. **Props 接口在同一文件中定义**，若组件被共享则导出
4. **组件使用命名导出**，仅页面使用默认导出
5. **避免 Props 层层传递** — 使用组合、Context 或状态管理
6. **错误边界** — 在功能边界处设置
7. **懒加载路由** — 使用 `React.lazy()` + `Suspense`
