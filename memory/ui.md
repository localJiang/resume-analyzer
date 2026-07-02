# UI 指南：Resume Analyzer

> **用途：** 前端 Agent 的 UI/UX 标准。
> **框架：** Next.js
> **UI 库：** Tailwind + shadcn/ui

## 设计原则

1. **清晰优于巧妙** — 让显而易见的操作变得简单
2. **渐进式披露** — 仅在需要时展示复杂性
3. **一致性** — 相同的模式，相同的位置
4. **反馈** — 每个操作都有可见的响应
5. **可访问性优先** — 为所有用户设计

## 组件分类

| 类型 | 用途 | 示例 |
|------|---------|---------|
| **原子** | 基础 UI 原语 | Button、Input、Label |
| **分子** | 简单组合 | SearchBar、FormField |
| **有机体** | 复杂区块 | UserProfileCard、DataTable |
| **模板** | 页面布局 | DashboardLayout、AuthLayout |
| **页面** | 完整界面 | HomePage、SettingsPage |

## 组件状态

每个交互式组件必须处理以下状态：

```typescript
interface ComponentStates {
  default: JSX.Element;   // 正常状态
  loading: JSX.Element;   // 获取数据中
  empty: JSX.Element;     // 无数据可显示
  error: JSX.Element;     // 发生错误
  success: JSX.Element;   // 操作成功（瞬时）
  disabled: JSX.Element;  // 不可交互
}
```

### 示例：UserList 组件

```typescript
function UserList() {
  const { data, isLoading, isError, error } = useUsers();

  // 加载状态
  if (isLoading) {
    return <UserListSkeleton count={5} />;
  }

  // 错误状态
  if (isError) {
    return (
      <ErrorBanner
        title="Failed to load users"
        message={error.message}
        onRetry={() => refetch()}
      />
    );
  }

  // 空状态
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<UsersIcon />}
        title="No users yet"
        description="Create your first user to get started."
        action={<Button onClick={openCreateDialog}>Create User</Button>}
      />
    );
  }

  // 正常状态
  return (
    <div className="space-y-4">
      {data.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  );
}
```

## 响应式设计

### 断点（Tailwind）

```
sm:  640px   — 手机横屏
md:  768px   — 平板竖屏
lg:  1024px  — 平板横屏 / 小桌面
xl:  1280px  — 桌面
2xl: 1536px  — 大桌面
```

### 移动优先方法

```typescript
// ✅ 移动优先：从移动端样式开始，逐层向上叠加
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <UserCard />
  <UserCard />
  <UserCard />
</div>

// ❌ 桌面优先：不要从桌面端开始然后向下隐藏
<div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1">
```

## 可访问性（WCAG 2.1 AA）

### 每个组件的检查清单

- [ ] **键盘导航** — 所有交互元素可通过 Tab 键到达
- [ ] **焦点指示器** — 可见的焦点环（`focus:ring-2 ring-primary-500`）
- [ ] **ARIA 标签** — 纯图标按钮需 `aria-label`
- [ ] **语义化 HTML** — 使用 `<button>`，而非 `<div onClick>`
- [ ] **颜色对比度** — 文本最低 4.5:1，大文本 3:1
- [ ] **Alt 文本** — 每张图片都有 `alt` 属性
- [ ] **表单标签** — 每个输入框都有关联的 `<label>`
- [ ] **错误消息** — 可见且由屏幕阅读器播报
- [ ] **标题层级** — h1→h2→h3，不跳级
- [ ] **减少动画** — 尊重 `prefers-reduced-motion`

### 可访问组件示例

```typescript
function IconButton({ icon, label, onClick }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}                    // 屏幕阅读器标签
      className={`
        rounded-lg p-2
        hover:bg-gray-100
        focus:outline-none focus:ring-2 focus:ring-primary-500  // 焦点环
        transition-colors
      `}
    >
      <IconComponent aria-hidden="true" />   {/* 隐藏装饰性图标 */}
    </button>
  );
}
```

## 加载模式

### 骨架屏（推荐）

```typescript
function UserCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border p-4">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-gray-200" />
          <div className="h-3 w-1/2 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
```

### 加载状态层级

1. **页面导航** → 目标页面的骨架屏
2. **列表加载** → 匹配布局的骨架卡片
3. **表单提交** → 提交按钮上的旋转图标 + 禁用
4. **文件上传** → 进度条
5. **后台刷新** → 微妙指示器，不阻止交互

## 错误处理

### 错误显示模式

```typescript
// 1. 内联错误（表单）
<FormField error="Email is required" />

// 2. 横幅错误（区块）
<ErrorBanner
  title="Unable to save changes"
  message="Please check your connection and try again."
  onRetry={handleRetry}
/>

// 3. Toast 通知（后台操作）
toast.error("Failed to delete user");

// 4. 错误页面（灾难性故障）
<ErrorPage statusCode={500} />
```

## 表单

### 表单模板

```typescript
function EditProfileForm({ user }: { user: User }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(EditProfileSchema),
    defaultValues: { name: user.name, email: user.email },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField label="Name" error={errors.name?.message}>
        <Input {...register('name')} placeholder="Your name" />
      </FormField>

      <FormField label="Email" error={errors.email?.message}>
        <Input {...register('email')} type="email" placeholder="you@example.com" />
      </FormField>

      <div className="flex gap-4">
        <Button type="submit" isLoading={isSubmitting}>
          Save Changes
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

## 颜色系统

使用 Tailwind CSS 设计令牌。在 `tailwind.config.ts` 中定义项目颜色：

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // 基准
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // 添加 secondary、accent、neutral、success、warning、error
      },
    },
  },
};
```

## 排版

- **字体：** 使用系统字体栈以提高性能
- **字号：** 使用 Tailwind 的字号体系（`text-sm` → `text-6xl`）
- **行高：** 正文使用 `leading-relaxed`，标题使用 `leading-tight`
- **最大宽度：** 长文本使用 `max-w-prose`（~65ch）

## 动画

```typescript
// 保持动画微妙且有目的性
// ✅ 好：微妙的悬停、焦点过渡
<button className="transition-colors duration-150 hover:bg-primary-600">

// ✅ 好：模态框的入场动画
<div className="animate-in fade-in zoom-in-95 duration-200">

// ❌ 差：过度、缓慢或纯装饰性的动画
<button className="animate-bounce transition-all duration-1000">
```
