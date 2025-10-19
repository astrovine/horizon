from pydantic import BaseModel, EmailStr, conint
from datetime import datetime

class vote(BaseModel):
    post_id: int
    dir: conint(ge=0, le=1)



