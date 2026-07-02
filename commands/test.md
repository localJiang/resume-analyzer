# /test — 测试工作流

## 用途
编写和运行测试以确保代码质量并防止回归。

## 使用场景
- 实现新代码之后
- 提交 PR 之前
- 调试 Bug 时（编写回归测试）
- 重构时（确保测试仍然通过）

## 工作流

### 第 1 步：确定测试类型

| 测试类型 | 何时编写 | 工具 |
|-----------|--------------|------|
| **单元测试** | 业务逻辑、工具函数、hooks | Vitest |
| **组件测试** | 隔离的 UI 组件 | Vitest + Testing Library |
| **集成测试** | API 接口 + 数据库 | Vitest + Supertest |
| **E2E 测试** | 关键用户流程 | Playwright |

### 第 2 步：编写测试（AAA 模式）

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    // Arrange → Act → Assert

    it('should create a user with valid data', async () => {
      // Arrange
      const validInput = { email: 'test@example.com', name: 'Test User' };

      // Act
      const result = await userService.createUser(validInput);

      // Assert
      expect(result).toMatchObject({
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should throw ValidationError when email is invalid', async () => {
      // Arrange
      const invalidInput = { email: 'not-an-email', name: 'Test' };

      // Act & Assert
      await expect(userService.createUser(invalidInput))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ConflictError when email already exists', async () => {
      // Arrange — 先创建一个已存在的用户
      await userService.createUser({ email: 'existing@example.com', name: 'Existing' });

      // Act & Assert
      await expect(
        userService.createUser({ email: 'existing@example.com', name: 'New' })
      ).rejects.toThrow(ConflictError);
    });
  });
});
```

### 第 3 步：测试命名约定

```
describe('<模块或组件>', () => {
  describe('<函数或行为>', () => {
    it('should <预期行为> when <条件>', () => { ... });
  });
});
```

### 第 4 步：运行测试

```bash
# 全部测试
npm run test

# 指定文件
npx vitest run path/to/file.test.ts

# 监听模式（开发期间）
npx vitest

# 覆盖率报告
npx vitest run --coverage
```

### 第 5 步：验证覆盖率

- **业务逻辑：** 80%+ 行覆盖率
- **UI 组件：** 所有状态均已渲染
- **API 接口：** 正常路径 + 4xx + 5xx 响应
- **E2E：** 关键用户旅程已覆盖

## 始终要包含的测试用例

### 针对函数
- [ ] 正常路径（有效输入 → 预期输出）
- [ ] Null/undefined 输入
- [ ] 空输入
- [ ] 边界值
- [ ] 错误条件

### 针对 API 接口
- [ ] 200/201 — 请求成功
- [ ] 400 — 无效输入
- [ ] 401 — 未认证
- [ ] 403 — 无权限
- [ ] 404 — 未找到
- [ ] 500 — 服务器错误（如适用）

### 针对 UI 组件
- [ ] 正确渲染默认状态
- [ ] 正确渲染加载状态
- [ ] 正确渲染空状态
- [ ] 正确渲染错误状态
- [ ] 处理用户交互（点击、输入等）
- [ ] 可通过键盘访问

## 约束条件
- 测试必须是确定性的（无不稳定测试）
- 使用测试工厂数据，而非生产数据
- 模拟外部服务（邮件、支付、S3）
- 测试应能在 CI 中无需手动设置即可运行
- 绝不要为了赶期限而跳过测试
