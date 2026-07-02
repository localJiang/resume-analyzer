# 技能：多 Agent 编排

## 描述
使用 AGENTS.md 角色定义协调多个 AI Agent 协同完成复杂任务。

## 适用场景
- 将复杂功能分解为 Agent 任务
- 运行设计-审查-实现-测试循环
- 协调前端/后端/数据库的并行工作
- 设置 Agent 通信协议
- 调试 Agent 冲突或不一致

## 输入
- PM Agent 提供的功能需求
- Architect Agent 提供的架构约束
- 当前项目状态（git、任务看板）
- 可用的 Agent 能力

## 输出
- Agent 任务分配
- 工作协调计划
- 集成验证
- Agent 性能报告

## 约束
- 每个 Agent 保持在其既定角色内（参见 AGENTS.md）
- Agent 通过结构化产物进行通信，而非临时消息
- Architect Agent 对技术决策拥有最终决定权
- PM Agent 对范围和优先级拥有最终决定权
- 所有决策记录在 memory/ 文件中
- Agent 未经审查不得修改彼此的工作

## Agent 交接协议

```
PM Agent        → 用户故事      → Architect Agent
Architect Agent → API 契约     → Frontend + Backend Agents
Database Agent  → 模式 + 迁移 → Backend Agent
Backend Agent   → API 实现     → Frontend Agent + Reviewer
Frontend Agent  → UI 实现      → Reviewer + Tester
Tester Agent    → 测试结果     → Reviewer
Reviewer Agent  → 审查结论     → 所有 Agent
```

## 最佳实践
1. **清晰的接口** — 每个 Agent 明确知道自己的产出和输入
2. **无重叠** — 每个 Agent 有明确的职责边界
3. **记录决策** — 为什么选择这种方法而非其他替代方案？
4. **有依赖时串行、无依赖时并行执行**
5. **PM 把控范围** — 不要让 Agent 超出需求进行构建
6. **Architect 把控设计** — 不要让 Agent 做出冲突的架构选择
7. **Reviewer 作为质量门禁** — 未经审查不得合并
