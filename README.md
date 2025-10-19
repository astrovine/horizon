# Horizon

A full web social app built with FastAPI (Python) and React (Vite). It includes authentication, posts, votes, profiles and follow graph, feed, and a comments system with threaded replies and likes. The UI supports a dark/light theme toggle and uses a clean, glass‑inspired design.

## Table of Contents
- Overview
- Features
- Architecture
- Tech Stack
- Project Structure
- Getting Started
  - Prerequisites
  - Backend Setup
  - Frontend Setup
- Environment Variables
- Database & Migrations
- API Overview
- UI Notes
- Demo
- Roadmap
- Troubleshooting

## Overview
This project demonstrates a modern social platform with a production‑style backend, a responsive frontend, and a focus on clean developer experience. It is suitable for portfolio/recruiter review and as a base for further extensions.

## Features
- JWT Authentication (register, login)
- Posts (create, list, update, delete)
- Votes on posts
- Profiles with followers/following and stats
- Personalized feed
- Comments with threaded replies
- Likes on comments
- Dark/light theme toggle (persists in localStorage)

## Architecture
- Backend: FastAPI + SQLAlchemy + Alembic + PostgreSQL
- Frontend: React 18 + Vite + Tailwind CSS
- API: REST over JSON with Pydantic schemas

## Tech Stack
- Python 3.11+, FastAPI, SQLAlchemy, Alembic, Pydantic
- PostgreSQL
- Node 18+, React, Vite, Tailwind CSS, Axios

## Project Structure
```
app/                  # FastAPI application
  routers/            # Route modules (auth, user, profile, post, etc.)
  models/             # SQLAlchemy models
  schemas/            # Pydantic schemas
  utils/              # DB, OAuth2/JWT, config
frontend/             # React application (Vite)
  src/
    pages/            # Route screens (Home, PostDetail, Login, etc.)
    components/       # UI components
    context/          # Auth, Theme, Toast providers
alembic/              # Database migrations
alembic.ini           # Alembic configuration
README.md             # This file
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node 18+
- PostgreSQL (local instance)

### Backend Setup
1. Create and activate a virtual environment, then install dependencies:
```
cd C:\Code\Python\social-media
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
2. Create a PostgreSQL database and set environment variables in a `.env` (see Environment Variables):
```
DATABASE_NAME=your_db
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
TABLE_NAME=public
SECRET_KEY=change_me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```
3. Apply migrations:
```
alembic upgrade head
```
4. Start the API:
```
uvicorn app.main:app --reload
```
API docs will be available at http://localhost:8000/docs

### Frontend Setup
```
cd C:\Code\Python\social-media\frontend
npm install
npm run dev
```
The app will be available at http://localhost:5173

## Environment Variables
Backend reads configuration from `.env` in the project root (see `app/utils/config.py`).
- DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, DATABASE_HOST, DATABASE_PORT
- TABLE_NAME
- SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

## Database & Migrations
- Migrations are managed with Alembic (see `alembic/versions`).
- If Alembic reports multiple heads, list and merge them:
```
alembic heads
alembic merge -m "merge heads" <head1> <head2>
alembic upgrade head
```

## API Overview (selected)
- Auth
  - POST `/login` (form-urlencoded: username, password)
  - POST `/users/` (register)
- Posts
  - GET `/posts/` (Limit, Skip, Search)
  - POST `/posts/`
  - PUT `/posts/{id}`
  - DELETE `/posts/{id}`
- Comments
  - POST `/posts/{post_id}/comment`
  - GET `/posts/{post_id}/comments`
  - POST `/posts/{comment_id}/reply` (threaded replies)
  - POST `/posts/comments/{comment_id}/like?dir=1|0` (like/unlike a comment)
- Profiles/Feed
  - GET `/profile/me`, PUT `/profile/me`
  - GET `/profile/{user_id}`
  - GET `/profile/{user_id}/posts`
  - GET `/feed`

## UI Notes
- Theme toggle is available in the left sidebar (desktop) and bottom bar (mobile). Preference is stored in localStorage.
- The interface uses neutral color tokens and a light glass (blur) effect for a clean, modern look.
- Comments support nesting (replies) and likes per comment.

## RM
- Collapsible threads and relative timestamps on comments
- Image uploads for posts and avatars
- Search (users, posts)
- Notification improvements and real‑time updates
- Basic unit/integration tests (FastAPI, component tests)

## Troubleshooting
- If frontend shows a blank page, check the browser console for import errors. Restart `npm run dev` after changes.
- If migrations fail, verify `.env` and DB connectivity, then run `alembic heads` and merge if needed.
- Use separate terminals for backend and frontend during development on Windows.
