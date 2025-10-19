"""add comment likes table

Revision ID: a1b2c3d4e5f6
Revises: eb0cc8f7a472
Create Date: 2025-10-19

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'eb0cc8f7a472'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'comment_likes',
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('comment_id', sa.Integer(), sa.ForeignKey('comments.id', ondelete='CASCADE'), primary_key=True),
    )


def downgrade():
    op.drop_table('comment_likes')

