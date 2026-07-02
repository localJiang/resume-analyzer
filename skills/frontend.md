# 技能：前端开发

## 描述
使用 Next.js 配合 TypeScript 和 Tailwind + shadcn/ui 构建和维护前端应用。

## 适用场景
- 创建新页面或组件
- 实现 UI 功能
- 修复前端缺陷
- 优化前端性能
- 搭建前端工具链

## 输入
- 设计稿或线框图
- 后端提供的 API 契约
- PM 提供的功能需求
- 现有组件库

## 输出
- 带 TypeScript 类型的 React/Vue/Svelte 组件
- 包含所有状态的页面实现
- 共享逻辑的自定义 Hook
- 组件测试
- 更新后的 UI 文档

## 约束
- 必须使用 Tailwind + shadcn/ui 作为组件库
- 必须使用 Tailwind CSS 进行样式编写（禁止内联样式）
- 必须支持移动端、平板和桌面端
- 必须满足 WCAG 2.1 AA 无障碍标准
- 组件必须处理加载中、空数据、错误和成功状态
- 初始 JS 包体积 < 200KB（未压缩）
- 使用函数式组件配合 Hook（禁止类组件）
- 每个文件一个组件（可附带小型子组件）

## 组件模板

```typescript
import { type FC } from 'react';

interface ComponentProps {
  /** 属性的描述 */
  data: DataType;
  /** 可选的回调函数 */
  onAction?: (data: DataType) => void;
  /** 加载状态 */
  isLoading?: boolean;
}

export const Component: FC<ComponentProps> = ({
  data,
  onAction,
  isLoading = false,
}) => {
  if (isLoading) return <ComponentSkeleton />;
  if (!data) return <EmptyState />;

  return (
    <div className="...">
      {/* 组件内容 */}
    </div>
  );
};
```

## 最佳实践
1. **从移动端设计开始** — 使用 Tailwind 的移动优先断点
2. **相关文件就近放置** — 组件、Hook、类型、测试放在一起
3. **缓存昂贵计算** — 但仅在性能分析显示有收益时才做
4. **组合优于继承** — 优先使用组件组合
5. **全面类型化** — Props、状态、Ref、事件 — 不使用 `any`
6. **提取可复用逻辑** — 放入自定义 Hook
7. **保持组件专注** — 如果组件超过 300 行，进行拆分

## 示例：功能实现

```typescript
// src/features/users/components/UserList.tsx
import { useUsers } from '../hooks/useUsers';
import { UserCard } from './UserCard';
import { UserListSkeleton } from './UserListSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorBanner } from '@/components/common/ErrorBanner';

export function UserList() {
  const { data, isLoading, isError, error, refetch } = useUsers();

  if (isLoading) return <UserListSkeleton count={6} />;

  if (isError) {
    return (
      <ErrorBanner
        title="加载用户失败"
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  if (!data?.length) {
    return (
      <EmptyState
        icon={<UsersIcon />}
        title="暂无用户"
        description="创建您的第一个用户以开始使用。"
        action={<Button onClick={openCreateDialog}>创建用户</Button>}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```
