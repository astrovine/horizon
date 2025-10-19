from fastapi import FastAPI
from .models import models
from fastapi.middleware.cors import CORSMiddleware
from app.utils.database import engine
from .routers import post, user, auth, vote, profile, follow, feed


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
models.Base.metadata.create_all(bind=engine)


app.include_router(post.router, tags=["post"])
app.include_router(user.router, tags=["user"])
app.include_router(auth.router)
app.include_router(vote.router)
app.include_router(profile.router, tags=["profile"])
app.include_router(follow.router, tags=["follow"])
app.include_router(feed.router, tags=["feed"])
