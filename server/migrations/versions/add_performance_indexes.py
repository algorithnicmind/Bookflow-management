"""Add performance indexes

Revision ID: add_performance_indexes
Revises: c73b5aa6ffd4
Create Date: 2026-07-05 18:25:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_performance_indexes'
down_revision = 'c73b5aa6ffd4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Employees
    op.create_index('ix_employees_organization_id', 'employees', ['organization_id'], unique=False)
    
    # Leave Requests
    op.create_index('ix_leave_requests_organization_id', 'leave_requests', ['organization_id'], unique=False)
    op.create_index('ix_leave_requests_user_id', 'leave_requests', ['user_id'], unique=False)
    
    # Notifications
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_notifications_user_id', table_name='notifications')
    op.drop_index('ix_leave_requests_user_id', table_name='leave_requests')
    op.drop_index('ix_leave_requests_organization_id', table_name='leave_requests')
    op.drop_index('ix_employees_organization_id', table_name='employees')
