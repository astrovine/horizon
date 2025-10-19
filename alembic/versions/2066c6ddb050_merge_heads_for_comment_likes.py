"""merge heads for comment_likes

Revision ID: 2066c6ddb050
Revises: 06854bda6d93, a1b2c3d4e5f6
Create Date: 2025-10-19 11:51:57.569435

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2066c6ddb050'
down_revision: Union[str, Sequence[str], None] = ('06854bda6d93', 'a1b2c3d4e5f6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
