"""empty message

Revision ID: 5a630b9671fa
Revises: a1eb8dd8eae2
Create Date: 2026-01-16 15:06:05.609318
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5a630b9671fa'
down_revision = 'a1eb8dd8eae2'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('payments', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('payer_user_id', sa.Integer(), nullable=True)
        )

        batch_op.create_foreign_key(
            'fk_payments_payer_user_id_usuarios',
            'usuarios',
            ['payer_user_id'],
            ['user_id']
        )


def downgrade():
    with op.batch_alter_table('payments', schema=None) as batch_op:
        batch_op.drop_constraint(
            'fk_payments_payer_user_id_usuarios',
            type_='foreignkey'
        )

        batch_op.drop_column('payer_user_id')
