from fastapi import Depends, APIRouter, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from ..schemas import token
from ..models import models
from ..utils import utils
from ..utils import oauth2, database
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
router = APIRouter(
    tags=["Authentication"]
)

@router.post("/login", response_model=token.Token)
def login(user_cred: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(
        or_(
            models.User.email == user_cred.username,
            models.User.user_name == user_cred.username
        )
    ).first()
    if not user or not utils.verify_password(user_cred.password, user.password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")
    access_token = oauth2.create_access_token(data={"user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}
