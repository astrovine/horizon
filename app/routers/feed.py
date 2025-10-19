from fastapi import Depends
from fastapi import Response, status, HTTPException, APIRouter
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy.sql.functions import func
from ..schemas import token, post
from ..models import models
from ..utils import oauth2
from app.utils.database import get_db

router = APIRouter()
@router.get("/feed", response_model=List[post.PostDetailResponse]) # Make sure the response_model is correct
def get_feed(db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user), Limit: int = 10, Skip: int = 0):
    """Get posts from users that the current user follows."""
    # This subquery correctly gets the IDs of users you follow
    followed_users_subquery = (
        select(models.followers_table.c.followed_id)
        .where(models.followers_table.c.follower_id == current_user.id)
    )

    votes_subquery = (
        select(func.count(models.Vote.post_id))
        .where(models.Vote.post_id == models.Post.id)
        .label("votes")
    )
    comments_subquery = (
        select(func.count(models.Comments.id))
        .where(models.Comments.post_id == models.Post.id)
        .label("comments_count")
    )

    results = (
        db.query(models.Post, votes_subquery, comments_subquery)
        .filter(models.Post.user_id.in_(followed_users_subquery)) # Changed from owner_id to user_id
        .order_by(models.Post.created_at.desc()) # Order by most recent posts
        .limit(Limit)
        .offset(Skip)
        .all()
    )

    formatted_results = [
        {"Post": post, "votes": votes, "comments_count": comments}
        for post, votes, comments in results
    ]

    return formatted_results