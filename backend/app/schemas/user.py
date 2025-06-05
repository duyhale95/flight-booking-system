from pydantic import BaseModel, EmailStr, Field


class BaseUser(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1)
    is_active: bool = True
    is_superuser: bool = False


class UserCreate(BaseUser):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1)
    password: str = Field(min_length=8, max_length=40)


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    name: str | None = Field(default=None, min_length=1)


class UserUpdateStatus(BaseModel):
    is_active: bool | None = None
    is_superuser: bool | None = None


class UserPublic(BaseUser):
    id: str


class UsersPublic(BaseModel):
    data: list[UserPublic]
    count: int


class UpdatePassword(BaseModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)
