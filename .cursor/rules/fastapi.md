# FastAPI 规则

> **适用于：** 所有 Python 后端文件
> **版本：** FastAPI 0.100+

## 路由定义

### 正确做法 ✅

```python
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter(prefix="/api/v1/users", tags=["users"])

# 请求/响应模型
class UserCreate(BaseModel):
    email: str = Field(..., pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
    name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=8)

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: str

# 端点
@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Database = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建新用户。"""
    existing = await db.users.find_by_email(user_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "CONFLICT", "message": "邮箱已注册"},
        )
    user = await user_service.create(db, user_data)
    return UserResponse.from_orm(user)
```

### 错误做法 ❌

```python
# ❌ 不要在路由处理器中放置业务逻辑
@router.get("/{user_id}")
async def get_user(user_id: str):
    # 100 行业务逻辑写在这里 — 不行！
    pass

# ✅ 委托给服务层
@router.get("/{user_id}")
async def get_user(user_id: str, service: UserService = Depends(get_user_service)):
    user = await service.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "用户未找到"})
    return user
```

## 依赖注入

```python
# 数据库会话
async def get_db() -> AsyncGenerator[Database, None]:
    async with create_session() as session:
        yield session

# 当前用户（认证）
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    user = await auth_service.verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail={"code": "UNAUTHORIZED"})
    return user

# 基于角色的访问控制
def require_role(*roles: str):
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail={"code": "FORBIDDEN"})
        return current_user
    return role_checker
```

## 错误处理

```python
# 统一的错误响应格式
class AppError(HTTPException):
    def __init__(self, status_code: int, code: str, message: str, details: list = None):
        super().__init__(
            status_code=status_code,
            detail={"error": {"code": code, "message": message, "details": details or []}},
        )

# 全局异常处理器
@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(status_code=exc.status_code, content=exc.detail)
```

## 最佳实践

1. **薄路由、厚服务** — 业务逻辑放在服务层
2. **Pydantic 模型** — 用于所有请求/响应校验
3. **依赖注入** — 使用 `Depends()` 共享依赖
4. **默认异步** — I/O 密集型端点使用 `async def`
5. **统一错误格式** — 所有错误遵循 `{ error: { code, message, details? } }` 格式
6. **自动生成文档** — FastAPI 从类型提示自动生成 OpenAPI 文档
7. **后台任务** — 使用 `BackgroundTasks` 处理非关键的异步工作
