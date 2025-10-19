from pydantic import BaseModel, EmailStr, conint
from datetime import datetime
from typing import List

class User(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    name: str
    user_name: str
    email: EmailStr
    password: str
    location: str | None = None
    bio: str | None = None
    avatar_url: str | None = None

    class Config:
        from_attributes = True

class Userout(BaseModel):
    id: int
    name: str
    user_name: str
    email: EmailStr

    class Config:
        from_attributes = True

class Userget(UserCreate):
    followers: conint(ge=0)
    following: conint(ge=0)
    bio: str
    location: str

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: int
    email: str
    user_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfileResponse(BaseModel):
    id: int
    name: str
    user_name: str
    email: EmailStr
    created_at: datetime
    location: str | None = None
    bio: str | None = None
    avatar_url: str | None = None

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    name: str | None = None
    user_name: str | None = None
    location: str | None = None
    bio: str | None = None
    avatar_url: str | None = None

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserFollowInfo(BaseModel):
    id: int
    name: str
    user_name: str

    class Config:
        from_attributes = True



class UserProfileWithFollows(BaseModel):
    id: int
    name: str
    user_name: str
    email: EmailStr
    bio: str | None = None
    avatar_url: str | None = None
    location: str | None = None
    created_at: datetime

    followers: List[UserFollowInfo]
    following: List[UserFollowInfo]

    class Config:
        from_attributes = True


class Usergetprofile(BaseModel):
    id: int
    name: str
    user_name: str
    email: EmailStr
    created_at: datetime
    location: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    followers_count: int
    following_count: int

    class Config:
        from_attributes = True
