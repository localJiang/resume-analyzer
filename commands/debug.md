# /debug — 调试工作流

## 用途
系统性地识别和修复 Bug。

## 使用场景
- 当有 Bug 被报告时
- 当测试意外失败时
- 当应用行为不正确时
- 当排查性能问题时

## 工作流

### 第 1 步：复现
1. **收集信息：**
   - 发生了什么？（实际 vs 预期）
   - 在哪里发生？（页面、组件、接口）
   - 何时发生？（总是、偶尔、第一次？）
   - 复现步骤是什么？
   - 什么环境？（浏览器、操作系统、设备）

2. **复现 Bug：**
   - 按照报告的步骤操作
   - 尝试变化（不同数据、不同浏览器）
   - 检查是否稳定复现

### 第 2 步：隔离
1. **检查最近的变更：**
   ```bash
   git log --oneline --since="7 days ago" -- <受影响的文件>
   ```

2. **缩小范围：**
   - 前端 Bug → 检查浏览器控制台、网络面板、React DevTools
   - 后端 Bug → 检查服务器日志、数据库状态、API 响应
   - 数据库 Bug → 检查模式、迁移、数据完整性

3. **二分查找法：**
   - 禁用一半代码路径 → 仍然有问题？
   - 持续缩小范围，直到找到最小复现用例

### 第 3 步：诊断

#### 前端 Bug
```typescript
// 1. 检查数据流
console.log('Props:', props);
console.log('State:', state);
console.log('API Response:', data);

// 2. 检查渲染
// React DevTools → Components 选项卡 → 检查组件树

// 3. 检查网络
// DevTools → Network 选项卡 → 找到失败的请求
// 检查：URL、请求头、请求体、响应状态码、响应体

// 4. 检查控制台
// 红色错误、警告、未处理的 Promise 拒绝
```

#### 后端 Bug
```bash
# 1. 检查服务器日志
# 查找错误堆栈跟踪

# 2. 直接测试 API
curl -v http://localhost:3000/api/users/123 \
  -H "Authorization: Bearer $TOKEN"

# 3. 检查数据库
npx prisma studio
SELECT * FROM users WHERE id = '123';

# 4. 检查中间件
# 认证是否通过？校验是否通过？
```

#### 数据库 Bug
```bash
# 1. 检查迁移状态
npx prisma migrate status

# 2. 检查模式
npx prisma db pull

# 3. 运行诊断查询
EXPLAIN ANALYZE <慢查询>;

# 4. 检查索引
SELECT * FROM pg_indexes WHERE tablename = '<表名>';
```

### 第 4 步：修复
1. 编写一个能复现 Bug 的失败测试
2. 实施修复
3. 验证测试通过
4. 检查没有其他测试被破坏
5. 考虑此类 Bug 是否存在于其他地方

### 第 5 步：预防
1. **编写回归测试** — 确保 Bug 不再复发
2. **根因分析** — 为什么会发生？
   - 缺少校验？
   - 错误的假设？
   - 竞态条件？
   - 缺少错误处理？
3. **预防措施：**
   - 添加校验
   - 添加错误处理
   - 添加类型约束
   - 更新文档
   - 添加监控告警

## 调试工具

| 问题 | 工具 |
|---------|------|
| 前端渲染 | React DevTools |
| 网络请求 | 浏览器 DevTools → Network |
| 性能 | Lighthouse、React Profiler |
| API 问题 | curl、Postman、REST Client |
| 数据库问题 | Prisma Studio |
| 日志 | 服务器日志、Vercel/Netlify 日志 |
| 错误追踪 | Sentry、LogRocket |

## Bug 报告模板

```markdown
## Bug：[简要描述]

### 环境
- **浏览器：** Chrome 120 / Firefox 121 / Safari 17
- **操作系统：** macOS 14 / Windows 11 / iOS 17
- **设备：** 桌面 / 平板 / 手机
- **应用版本：** [版本号或提交哈希]

### 复现步骤
1. 前往 '...'
2. 点击 '...'
3. 输入 '...'
4. 看到错误

### 预期行为
[应该发生什么]

### 实际行为
[实际发生了什么]

### 截图/日志
[附上相关截图或错误日志]

### 发生频率
- [ ] 总是发生
- [ ] 偶尔发生（约 X% 的概率）
- [ ] 只发生过一次

### 附加上下文
[任何其他相关信息]
```

## 约束条件
- 不要猜测 — 先复现，再修复
- 始终为每个 Bug 编写回归测试
- 不要修复表象 — 找到并修复根因
- 在同一区域搜索类似的 Bug
- 记录根因以供未来参考
