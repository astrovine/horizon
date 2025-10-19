from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from .post import router
from ..utils.database import get_db


from ..models import models
from ..schemas import token, user
from ..utils import utils
from ..utils import oauth2

router = APIRouter(
    prefix="/users",
    tags=["user"]
)

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=
user.UserProfileResponse)
def create_user(known_user: user.UserCreate, db: Session = Depends(get_db)):
    try:
        hashed = utils.hash_password(known_user.password)
        known_user.password = hashed
        new_user = models.User(**known_user.model_dump())
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        db.rollback()
        print(e)
        raise HTTPException(status_code=400, detail="Failed to create user")


@router.get("/{name}", response_model=user.Usergetprofile)
def get_user(name: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.name == name).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User {name} was not found")
    user_data = user.__dict__
    user_data["followers_count"] = len(user.followers)
    user_data["following_count"] = len(user.following)
    return user_data

@router.get("/", response_model=List[user.UserCreate])
def get_all_users(db: Session = Depends(get_db)):
    query = db.query(models.User).all()
    return query

@router.delete('/me', status_code=status.HTTP_204_NO_CONTENT)
def delete_user (db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)):
    user = db.query(models.User).filter(models.User.id == current_user.id)
    specified_user = user.first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized")
    user.delete(synchronize_session=False)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)






