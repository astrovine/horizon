from fastapi import Depends
from fastapi import Response, status, HTTPException, APIRouter
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from typing import List
from sqlalchemy.sql.functions import func
from ..schemas import token, post
from ..models import models
from ..utils import oauth2
from app.utils.database import get_db

router = APIRouter(
    prefix="/posts",
    tags=["post"]
)


@router.get("/", response_model=List[post.PostDetailResponse])
def get_all_posts(db: Session = Depends(get_db), Limit: int = 10, Skip: int = 0, Search: str | None = ""):
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
        .options(joinedload(models.Post.owner))
        .filter(models.Post.title.contains(Search))
        .order_by(models.Post.created_at.desc())
        .limit(Limit)
        .offset(Skip)
        .all()
    )

    formatted_results = [
        {"Post": post, "votes": votes, "comments_count": comments}
        for post, votes, comments in results
    ]

    return formatted_results


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
        .label("votes")
    )
    comments_subquery = (
        select(func.count(models.Comments.id))
        .where(models.Comments.post_id == models.Post.id)
        .label("comments_count")
    )

    results = (
        db.query(models.Post, votes_subquery, comments_subquery)
        .options(joinedload(models.Post.owner))
        .filter(models.Post.user_id == user_id)
        .order_by(models.Post.created_at.desc())
        .limit(limit)
        .offset(skip)
        .all()
    )

    return [
        {"Post": post, "votes": votes, "comments_count": comments}
        for post, votes, comments in results
    ]


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=post.Postres)
async def create_post(post: post.PostCreate, db: Session = Depends(get_db), current_user: int = Depends(
    oauth2.get_current_user)):
    new_post = models.Post(user_id = current_user.id, **post.model_dump())
    print(current_user.id)
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(id: int, db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)):
    post_query = db.query(models.Post).filter(models.Post.id == id)
    post = post_query.first()
    db.commit()
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with id {id} does not exist")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to perform requested action")
    post_query.delete(synchronize_session=False)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/{id}")
def update_post(id: int, post: post.PostUpdate, db: Session = Depends(get_db), current_user: int = Depends(
    oauth2.get_current_user)):
    post_query = db.query(models.Post).filter(models.Post.id == id)
    updated_post = post_query.first()
    if updated_post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with id {id} does not exist")
    if updated_post.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to perform requested action")
    post_query.update(post.model_dump(), synchronize_session=False)
    db.commit()
    return {'data': post_query.first()}

@router.post("/{post_id}/comment", response_model=post.CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment_to_post(post_id: int, comment: post.CommentCreate, db: Session = Depends(get_db),
                        current_user: int = Depends(oauth2.get_current_user)):
    post_query = db.query(models.Post).filter(models.Post.id == post_id)
    found_post = post_query.first()
    if not found_post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with id {post_id} does not exist")
    new_comment = models.Comments(post_id=post_id, user_id=current_user.id, **comment.model_dump())
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    # eager load owner for response
    _ = new_comment.owner
    return new_comment


@router.get("/{post_id}/comments", response_model=list[post.CommentResponse])
def get_comments_for_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with id {post_id} does not exist")
    comments = (
        db.query(models.Comments)
        .options(joinedload(models.Comments.owner))
        .filter(models.Comments.post_id == post_id)
        .order_by(models.Comments.created_at.asc())
        .all()
    )

    return comments


@router.post("/{comment_id}/reply", response_model=post.CommentResponse, status_code=status.HTTP_201_CREATED)
def create_reply_to_comment(
        comment_id: int,
        reply: post.CommentCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(oauth2.get_current_user)
):

    parent_comment = db.query(models.Comments).filter(models.Comments.id == comment_id).first()
    if not parent_comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent comment not found")
    new_reply = models.Comments(
        comment=reply.comment,
        post_id=parent_comment.post_id,
        user_id=current_user.id,
        parent_id=comment_id
    )

    db.add(new_reply)
    db.commit()
    db.refresh(new_reply)
    _ = new_reply.owner

    return new_reply


# Comment likes
@router.post("/comments/{comment_id}/like")
def like_comment(comment_id: int, dir: int, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    comment = db.query(models.Comments).filter(models.Comments.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")

    existing = db.query(models.CommentLike).filter(
        models.CommentLike.comment_id == comment_id,
        models.CommentLike.user_id == current_user.id
    ).first()

    if dir == 1:
        if existing:
            return {"message": "Already liked"}
        new_like = models.CommentLike(user_id=current_user.id, comment_id=comment_id)
        db.add(new_like)
        db.commit()
        return {"message": "Liked"}
    else:
        if not existing:
            return {"message": "Already unliked"}
        db.delete(existing)
        db.commit()
        return {"message": "Unliked"}


@router.get("/{post_id}/comments/likes")
def get_comment_likes_for_post(post_id: int, db: Session = Depends(get_db)):
    # returns a mapping of comment_id -> likes_count for a given post
    rows = db.execute(
        select(models.Comments.id, func.count(models.CommentLike.user_id))
        .join(models.CommentLike, models.CommentLike.comment_id == models.Comments.id, isouter=True)
        .where(models.Comments.post_id == post_id)
        .group_by(models.Comments.id)
    ).all()
    return {comment_id: count for comment_id, count in rows}
