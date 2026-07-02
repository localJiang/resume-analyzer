# Tailwind CSS 规则

> **适用于：** 所有样式编写
> **配置：** `tailwind.config.ts`

## 核心规则

### 正确做法 ✅

```typescript
// 仅使用工具类
<div className="flex items-center gap-4 rounded-lg border p-4 shadow-sm">

// 移动优先的响应式设计
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// 使用 Tailwind 配置中的设计令牌
<button className="bg-primary-500 text-white hover:bg-primary-600">

// 将重复模式提取为组件，而非自定义 CSS 类
// ✅ 提取为组件
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {children}
    </div>
  );
}

// 使用 clsx 或 cn 工具处理条件类名
import { clsx } from 'clsx';

function Button({ variant, isLoading, children }: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-lg px-4 py-2 font-medium transition-colors',
        variant === 'primary' && 'bg-primary-500 text-white hover:bg-primary-600',
        variant === 'secondary' && 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        variant === 'ghost' && 'text-gray-600 hover:bg-gray-100',
        isLoading && 'cursor-not-allowed opacity-50',
      )}
      disabled={isLoading}
    >
      {children}
    </button>
  );
}
```

### 错误做法 ❌

```html
<!-- ❌ 不使用内联样式 -->
<div style="padding: 16px; color: red;">

<!-- ❌ 新代码不使用 CSS 模块 -->
<div className={styles.container}>

<!-- ❌ 非必要不使用任意值 -->
<div className="w-[327px]">  <!-- 除非需要精确像素级匹配，否则使用 w-80 或 w-96 -->

<!-- ❌ 不使用 @apply 定义组件样式 -->
<!-- 改为提取为 React 组件 -->
```

## 间距系统

```
p-0 (0px)     p-1 (4px)     p-2 (8px)     p-3 (12px)
p-4 (16px)    p-5 (20px)    p-6 (24px)    p-8 (32px)
p-10 (40px)   p-12 (48px)   p-16 (64px)

gap-2 (8px)   gap-4 (16px)   gap-6 (24px)  gap-8 (32px)
```

## 颜色使用

```typescript
// 文字：gray-900（主要）、gray-600（次要）、gray-400（禁用）
// 背景：white（卡片）、gray-50（页面）、gray-100（悬停）
// 主要操作：primary-500 → primary-600（悬停）→ primary-700（按下）
// 破坏性操作：red-500 → red-600（悬停）
// 成功：green-500
// 警告：yellow-500
// 边框：gray-200（默认）、gray-300（悬停）

// ✅ 语义化颜色使用
<h1 className="text-gray-900">标题</h1>
<p className="text-gray-600">描述</p>
<span className="text-gray-400">元数据</span>
<a className="text-primary-600 hover:text-primary-700">链接</a>
```

## 响应式断点

```typescript
// sm: 640px   — 手机横屏
// md: 768px   — 平板
// lg: 1024px  — 笔记本
// xl: 1280px  — 桌面
// 2xl: 1536px — 大桌面

// ✅ 移动优先模式
<div className="
  flex flex-col           // 移动端：垂直堆叠
  md:flex-row             // 平板及以上：水平排列
  lg:gap-8                // 桌面端：更大间距
">
```

## 最佳实践

1. **移动优先** — 从移动端样式开始，通过断点逐步增强
2. **绝不使用内联样式** — 仅使用 Tailwind 类
3. **提取组件而非 CSS** — 重复模式变为 React 组件
4. **使用 cn() 工具** — 用于条件性类名合并
5. **在配置中定义设计令牌** — 在 tailwind.config.ts 中定义颜色、间距、字体
6. **PurgeCSS 内置** — 未使用的类在生产构建中自动移除
