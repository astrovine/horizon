from pydantic import BaseModel, EmailStr, conint
from datetime import datetime

from app.schemas.user import Userout


class PostBase(BaseModel):
    title: str
    content: str
    published: bool = True


class PostCreate(PostBase):
    pass

class PostUpdate(PostBase):
    pass


class Postres(BaseModel):
    id: int
    title: str
    content: str
    published: bool = True
    created_at: datetime
    user_id: int
    owner: Userout
    class Config:
        from_attributes = True


class PostDetailResponse(BaseModel):
    Post: Postres
    votes: int
    comments_count: int

    class Config:
        from_attributes = True

class Postvote(BaseModel):
    Post: Postres
    votes: int

    class Config:
        from_attributes = True

class CommentBase(BaseModel):
    comment: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(BaseModel):
    id: int
    user_id: int
    post_id: int
    comment: str
    created_at: datetime
    parent_id: int | None = None
    owner: Userout

    class Config:
        from_attributes = True