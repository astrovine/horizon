from fastapi import Depends, status, HTTPException, APIRouter
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List
from ..models import models
from ..schemas import token, user
from ..schemas import post
from ..utils import oauth2
from ..utils.database import get_db

router = APIRouter(
    prefix="/profile",
    tags=["profile"]
)


@router.get("/me", response_model=user.UserProfileResponse)
def get_my_profile(
        db: Session = Depends(get_db),
        current_user: models.User = Depends(oauth2.get_current_user)
):
    """Get current user's profile with stats."""
    # Calculate stats for current user
    followers_count = db.query(models.followers_table).filter(
        models.followers_table.c.followed_id == current_user.id
    ).count()

    following_count = db.query(models.followers_table).filter(
        models.followers_table.c.follower_id == current_user.id
    ).count()

    posts_count = db.query(models.Post).filter(
        models.Post.user_id == current_user.id
    ).count()

    return {
        **current_user.__dict__,
        "followers_count": followers_count,
        "following_count": following_count,
        "posts_count": posts_count,
        "is_following": False  # User doesn't follow themselves
    }


@router.get("/{user_id}", response_model=user.UserProfileResponse)
def get_user_profile(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(oauth2.get_current_user)
):
    """Get user profile with stats."""
    user_obj = db.query(models.User).filter(models.User.id == user_id).first()
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")

    # Calculate stats
    followers_count = db.query(models.followers_table).filter(
        models.followers_table.c.followed_id == user_id
    ).count()

    following_count = db.query(models.followers_table).filter(
        models.followers_table.c.follower_id == user_id
    ).count()

    posts_count = db.query(models.Post).filter(models.Post.user_id == user_id).count()

    # Check if current user follows this user
    is_following = db.query(models.followers_table).filter(
        models.followers_table.c.follower_id == current_user.id,
        models.followers_table.c.followed_id == user_id
    ).first() is not None

    return {
        **user_obj.__dict__,
        "followers_count": followers_count,
        "following_count": following_count,
        "posts_count": posts_count,
        "is_following": is_following
    }


@router.put("/me", response_model=user.UserProfileResponse)
def update_my_profile(
        profile_update: user.UserProfileUpdate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(oauth2.get_current_user)
):
    """Update current user's profile."""
    update_data = profile_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    # Return with stats
    followers_count = db.query(models.followers_table).filter(
        models.followers_table.c.followed_id == current_user.id
    ).count()

    following_count = db.query(models.followers_table).filter(
        models.followers_table.c.follower_id == current_user.id
    ).count()

    posts_count = db.query(models.Post).filter(
        models.Post.user_id == current_user.id
    ).count()

    return {
        **current_user.__dict__,
        "followers_count": followers_count,
        "following_count": following_count,
        "posts_count": posts_count,
        "is_following": False
    }


@router.get("/{user_id}/posts", response_model=List[post.PostDetailResponse])
def get_user_posts(
        user_id: int,
        db: Session = Depends(get_db),
        limit: int = 10,
        skip: int = 0
):
    """Get all posts by a specific user."""
    votes_subquery = (
        select(func.count(models.Vote.post_id))
        .where(models.Vote.post_id == models.Post.id)
        .correlate_except(models.Vote)
        .scalar_subquery()
    )

    results = (
        db.query(models.Post, votes_subquery.label("votes"))
        .filter(models.Post.user_id == user_id)
        .order_by(models.Post.created_at.desc())
        .limit(limit)
        .offset(skip)
        .all()
    )

    return [
        {**post.__dict__, "votes": votes if votes else 0}
        for post, votes in results
    ]

