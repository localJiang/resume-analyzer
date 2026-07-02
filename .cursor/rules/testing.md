# 测试规则

> **框架：** Vitest + Playwright
> **覆盖率目标：** 业务逻辑行覆盖率 80%+

## 测试原则

1. **测试行为而非实现** — 重构内部代码不应破坏测试
2. **测试即文档** — 测试名称应描述预期行为
3. **确定性** — 相同输入始终产生相同结果（无不稳定测试）
4. **快速** — 单元测试以毫秒计，集成测试以秒计
5. **隔离** — 每个测试设置自己的数据，不依赖其他测试

## 测试结构（AAA 模式）

```typescript
describe('ComponentOrModule', () => {
  describe('functionOrBehavior', () => {
    it('should <预期行为> when <条件>', () => {
      // Arrange — 设置
      const input = { ... };

      // Act — 执行
      const result = functionUnderTest(input);

      // Assert — 验证
      expect(result).toEqual(expected);
    });
  });
});
```

## 测试什么

### 单元测试
```typescript
// ✅ 测试：业务逻辑、工具函数、Hooks、校验
// ✅ 测试：错误条件、边界情况、边界值
// ❌ 不测试：框架内部实现、简单的 getter/setter

describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });
  it('should return false for email without @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });
  it('should return false for empty string', () => {
    expect(validateEmail('')).toBe(false);
  });
  it('should return false for null', () => {
    expect(validateEmail(null as unknown as string)).toBe(false);
  });
});
```

### 组件测试
```typescript
// ✅ 测试：所有状态的渲染、用户交互、无障碍性
describe('UserCard', () => {
  it('should render user name and email', () => { ... });
  it('should render skeleton when loading', () => { ... });
  it('should render error state with retry button', () => { ... });
  it('should call onEdit when edit button clicked', () => { ... });
  it('should be keyboard accessible', () => { ... });
});
```

### API 集成测试
```typescript
// ✅ 测试：正常路径、校验错误、认证错误、未找到
describe('POST /api/users', () => {
  it('should create user and return 201', async () => {
    const res = await request(app).post('/api/users').send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ email: validUser.email });
  });
  it('should return 400 for invalid email', async () => {
    const res = await request(app).post('/api/users').send({ email: 'bad' });
    expect(res.status).toBe(400);
  });
  it('should return 401 without auth token', async () => {
    const res = await request(app).post('/api/users').send(validUser);
    expect(res.status).toBe(401);
  });
});
```

## 测试数据

```typescript
// ✅ 使用带可覆盖默认值的工厂函数
function createUser(overrides: Partial<User> = {}): User {
  return {
    id: randomUUID(),
    email: `user-${randomUUID()}@test.com`,
    name: 'Test User',
    role: 'USER',
    createdAt: new Date(),
    ...overrides,
  };
}

// ❌ 不使用生产数据或硬编码的共享夹具
```

## Mock

```typescript
// ✅ 仅模拟外部服务
vi.mock('@/lib/email');
vi.mock('@/lib/payment');

// ❌ 不模拟自己的代码（测试它！）
// ❌ 不模拟数据库 — 使用测试数据库或内存数据库
```
