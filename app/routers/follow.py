from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from .post import router
from ..schemas.user import UserProfileWithFollows
from ..utils.database import get_db
from ..models import models
from ..schemas import token
from ..utils import utils
from ..utils import oauth2


router = APIRouter(
    prefix="/follow",
    tags=["follow"]
)


@router.post("/users/{user_name}/follow", status_code=status.HTTP_204_NO_CONTENT)
def follow_user(
        user_name: str,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(oauth2.get_current_user)
):
    user_to_follow = db.query(models.User).filter(models.User.user_name == user_name).first()
    if not user_to_follow:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if current_user.user_name == user_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot follow yourself")

    if user_to_follow in current_user.following:
        # idempotent: already following
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    current_user.following.append(user_to_follow)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)



@router.delete("/users/{user_id}/follow", status_code=status.HTTP_204_NO_CONTENT)
def unfollow_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):

    user_to_unfollow = db.query(models.User).filter(models.User.id == user_id).first()


    if not user_to_unfollow:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user_to_unfollow not in current_user.following:
        # idempotent: already not following
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    current_user.following.remove(user_to_unfollow)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
