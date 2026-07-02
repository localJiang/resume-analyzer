# Git 规则

## 分支策略

```
main         ← 生产环境（可部署，受保护）
  └── develop  ← 集成分支（受保护）
        ├── feature/xxx  ← 新功能
        ├── fix/xxx      ← Bug 修复
        ├── chore/xxx    ← 维护工作
        ├── refactor/xxx ← 代码优化
        └── docs/xxx     ← 仅文档变更
```

## 分支命名

```bash
# ✅ 好的命名 — 描述性，kebab-case
feature/user-authentication
feature/add-email-verification
fix/login-redirect-loop
fix/null-pointer-in-profile
chore/update-dependencies
refactor/extract-auth-service
docs/api-documentation-update

# ❌ 不好的命名
my-branch
fix
feature/new_stuff
john-branch
WIP
```

## 提交信息

### 格式
```
<type>(<scope>): <祈使句描述>

[可选正文 — 解释为什么，而非是什么]

[可选脚注 — BREAKING CHANGE、closes #123]
```

### 类型
| 类型 | 使用场景 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 仅文档变更 |
| `style` | 格式调整、缺失分号（非代码变更） |
| `refactor` | 既不修复 Bug 也不添加功能的代码变更 |
| `perf` | 性能优化 |
| `test` | 添加或修复测试 |
| `chore` | 构建流程、依赖、工具链 |
| `ci` | CI/CD 配置变更 |

### 示例
```bash
# ✅ 好的
feat(auth): add password reset flow
fix(api): handle null user in profile endpoint
refactor(db): extract query builder to shared utility
docs(readme): add deployment instructions
chore(deps): update prisma to 5.x

# ❌ 不好的
fixed bug
updates
wip
stuff
asdf
```

## Pull Request 流程

1. **从 `develop` 创建分支**
2. **在功能/修复分支上工作** — 使用良好信息定期提交
3. **保持 PR 小巧** — 尽可能控制在 400 行变更以内
4. **编写 PR 描述：**
   - 变更了什么以及为什么
   - UI 变更附上截图
   - 测试说明
   - 破坏性变更（如有）
5. **CI 必须通过** — Lint、类型检查、测试、构建
6. **获得审查** — 至少一个批准
7. **Squash 合并** 到 `develop`

## PR 描述模板
```markdown
## 概要
[变更的简要描述]

## 变更内容
- [变更 1]
- [变更 2]

## 截图
[UI 变更的前后对比]

## 测试
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 在 [浏览器/设备] 上完成手动测试

## 检查清单
- [ ] 类型正确（无 `any`）
- [ ] 错误处理已就位
- [ ] 测试已编写
- [ ] Lint 通过
- [ ] 自查完成

Closes #[issue-number]
```

## 最佳实践

1. **每个分支一个功能** — 不要混合无关变更
2. **频繁提交** — 小而逻辑清晰的提交 > 一个巨大提交
3. **推送前拉取** — `git pull --rebase origin develop`
4. **绝不强制推送到共享分支** — `main`、`develop`
5. **Squash 合并 PR** — 保持主分支历史清晰
6. **合并后删除功能分支**
7. **不提交密钥** — 使用 `.env` 文件，不硬编码值
8. **不提交生成的代码** — `node_modules`、`.next`、`dist`、`build`
