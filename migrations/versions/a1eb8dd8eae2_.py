"""empty message

Revision ID: a1eb8dd8eae2
Revises: 5044ea5756e6
Create Date: 2026-01-15 01:51:27.615506

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1eb8dd8eae2'
down_revision = '5044ea5756e6'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('payments', schema=None) as batch_op:
        batch_op.add_column(sa.Column('stripe_session_id',
                            sa.String(length=255), nullable=True))
        batch_op.alter_column('appointment_id',
                              existing_type=sa.INTEGER(),
                              nullable=True)
        batch_op.create_unique_constraint(
            "uq_payments_stripe_session_id", ['stripe_session_id'])


def downgrade():
    with op.batch_alter_table('payments', schema=None) as batch_op:
        batch_op.drop_constraint(
            "uq_payments_stripe_session_id", type_='unique')
        batch_op.alter_column('appointment_id',
                              existing_type=sa.INTEGER(),
                              nullable=False)
        batch_op.drop_column('stripe_session_id')
