# 技能：测试

## 描述
使用 Vitest + Playwright 编写和维护测试，以确保代码质量并防止回归。

## 适用场景
- 为业务逻辑编写单元测试
- 为 UI 编写组件测试
- 为 API 端点编写集成测试
- 为关键流程编写 E2E 测试
- 搭建测试基础设施
- 调试不稳定的测试
- 提升测试覆盖率

## 输入
- 待测试的源代码
- 用户故事与验收标准
- API 契约
- 组件规范

## 输出
- 单元测试（`tests/unit/` 或就近放置 `*.test.ts`）
- 组件测试
- 集成测试（`tests/integration/`）
- E2E 测试（`tests/e2e/`）
- 测试夹具和 Mock
- 覆盖率报告

## 约束
- 测试必须是确定性的（无不稳定测试）
- 使用测试工厂/夹具，禁止使用生产数据
- 模拟外部服务（邮件、支付、S3、第三方 API）
- 每个测试应验证一个行为
- 测试应像文档一样可读
- 不测试实现细节 — 测试行为
- 测试必须在 CI 中无需人工干预即可通过

## AAA 模式

```typescript
describe('functionName', () => {
  it('should <预期行为> when <条件>', () => {
    // Arrange — 设置测试数据和条件
    const input = { ... };

    // Act — 执行被测代码
    const result = functionName(input);

    // Assert — 验证结果
    expect(result).toEqual(expected);
  });
});
```

## 最佳实践
1. **测试行为而非实现** — 如果重构内部代码，测试仍应通过
2. **每个测试一个断言概念** — 对同一逻辑结果允许多个 expect
3. **使用描述性测试名称** — `should throw ValidationError when email is empty`
4. **工厂优于夹具** — 使用带可覆盖默认值的函数创建测试数据
5. **优先测试错误情况** — 错误是 Bug 藏身之处
6. **覆盖率是指南而非目标** — 80% 有意义的覆盖率 > 100% 无意义的覆盖率
