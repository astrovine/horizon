from sqlalchemy.orm import relationship
from app.utils.database import Base
from sqlalchemy import Table, ForeignKey, Integer, String, Column, Boolean, TIMESTAMP, text

followers_table = Table(
    "followers",
    Base.metadata,
    Column("follower_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("followed_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("created_at", TIMESTAMP(timezone=True), server_default=text('now()'), nullable=False)
)


class Post(Base):
    __tablename__ = "post"
    id = Column(Integer, primary_key=True, nullable=False)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    published = Column(Boolean, nullable=False, server_default='True')
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Use back_populates for a clear, two-way link
    owner = relationship("User", back_populates="posts")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String, nullable=False)
    user_name = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text('now()'), nullable=False)
    bio = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    location = Column(String, nullable=True)

    posts = relationship("Post", back_populates="owner")
    following = relationship(
        "User",
        secondary=followers_table,
        primaryjoin=(followers_table.c.follower_id == id),
        secondaryjoin=(followers_table.c.followed_id == id),
        back_populates="followers"
    )

    # This relationship is created automatically by the 'back_populates' above
    followers = relationship(
        "User",
        secondary=followers_table,
        primaryjoin=(followers_table.c.followed_id == id),
        secondaryjoin=(followers_table.c.follower_id == id),
        back_populates="following"
    )


class Comments(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, nullable=False)
    comment = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(Integer, ForeignKey("post.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text('now()'), nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)

    # Changed 'author' to 'owner' to match the schema
    owner = relationship("User", backref="comments")
    post = relationship("Post", backref="comments")
    replies = relationship("Comments", backref="parent", remote_side=[id])


class Vote(Base):
    __tablename__ = "votes"
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    post_id = Column(Integer, ForeignKey("post.id", ondelete="CASCADE"), primary_key=True)

    # Add these
    user = relationship("User", backref="votes")
    post = relationship("Post", backref="votes")


class CommentLike(Base):
    __tablename__ = "comment_likes"
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    comment_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), primary_key=True)

    user = relationship("User", backref="comment_likes")
    comment = relationship("Comments", backref="likes")
