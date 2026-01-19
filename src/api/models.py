from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Enum, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from typing import List, Optional
db = SQLAlchemy()

ROLE_ENUM = Enum("cliente", "barbero", "admin",
                 name="role_enum", native_enum=False)
STATUS_ENUM = Enum("pendiente", "confirmada", "cancelada",
                   "completada", name="status_enum", native_enum=False)


PAYMENT_METHOD_ENUM = Enum(
    "efectivo", "tarjeta", "transferencia", "zelle", "otro", "stripe",
    name="payment_method_enum",
    native_enum=False
)

PAYMENT_STATUS_ENUM = Enum(
    "pendiente", "pagado", "anulado", "reembolsado", "fallido",
    name="payment_status_enum",
    native_enum=False
)

# Borrar este modelo


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)

    def serialize(self):
        return {"id": self.id, "email": self.email}


class Usuario(db.Model):
    __tablename__ = "usuarios"
    user_id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        ROLE_ENUM, nullable=False, default="cliente")
    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=True)
    is_admin: Mapped[bool] = mapped_column(
        Boolean(), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(25))
    address: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    photo_url: Mapped[Optional[str]] = mapped_column(
        db.String(500), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(db.Text, nullable=True)
    specialties: Mapped[Optional[str]] = mapped_column(db.Text, nullable=True)
    # availability: Mapped[Optional[str]] = mapped_column(db.JSON, nullable=True)  # para sqlite también sirve

    # Relaciones: citas donde soy cliente / barbero
    appointments_as_client: Mapped[List["Appointment"]] = relationship(
        "Appointment",
        foreign_keys="Appointment.client_id",
        back_populates="client",
        cascade="all, delete-orphan"
    )

    appointments_as_barber: Mapped[List["Appointment"]] = relationship(
        "Appointment",
        foreign_keys="Appointment.barber_id",
        back_populates="barber",
        cascade="all, delete-orphan"
    )

    def serialize(self):
        return {
            "user_id": self.user_id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active,
            "is_admin": bool(self.is_admin),   # <-- importante
            "phone": self.phone,
            "address": self.address,
            "photo_url": self.photo_url,
            "bio": self.bio,
            "specialties": self.specialties,
            "created_at": self.created_at.isoformat()
        }


class Service(db.Model):
    __tablename__ = "services"
    service_id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(nullable=False, default=30)

    def serialize(self):
        return {
            "service_id": self.service_id,
            "name": self.name,
            "price": float(self.price),
            "duration_minutes": self.duration_minutes
        }


class Appointment(db.Model):
    __tablename__ = "appointments"
    appointment_id: Mapped[int] = mapped_column(primary_key=True)
    client_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.user_id"), nullable=False)
    barber_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.user_id"), nullable=False)
    service_id: Mapped[int] = mapped_column(
        ForeignKey("services.service_id"), nullable=False)
    appointment_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(
        STATUS_ENUM, nullable=False, default="pendiente")
    notes: Mapped[Optional[str]] = mapped_column(db.Text)

    client: Mapped["Usuario"] = relationship(
        "Usuario",
        foreign_keys=[client_id],
        back_populates="appointments_as_client"
    )
    barber: Mapped["Usuario"] = relationship(
        "Usuario",
        foreign_keys=[barber_id],
        back_populates="appointments_as_barber"
    )
    service: Mapped["Service"] = relationship("Service")

    def serialize(self):
        return {
            "appointment_id": self.appointment_id,
            "client": self.client.serialize(),
            "barber": self.barber.serialize(),
            "service": self.service.serialize(),
            "appointment_date": self.appointment_date.isoformat(),
            "status": self.status,
            "notes": self.notes
        }


class Payment(db.Model):
    __tablename__ = "payments"
    __table_args__ = (
        UniqueConstraint("stripe_session_id",
                         name="uq_payments_stripe_session_id"),
    )
    payment_id: Mapped[int] = mapped_column(primary_key=True)
    # permitir pagos SIN cita
    appointment_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("appointments.appointment_id",
                   name="fk_payments_appointment_id"),
        nullable=True
    )
    #  quién pagó (cliente) ojo analizar bien esto

    payer_user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey(
            "usuarios.user_id",
            name="fk_payments_payer_user_id"
        ),
        nullable=True
    )
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    method: Mapped[str] = mapped_column(
        PAYMENT_METHOD_ENUM, nullable=False, default="efectivo"
    )
    status: Mapped[str] = mapped_column(
        PAYMENT_STATUS_ENUM, nullable=False, default="pagado"  # pendiente chap
    )
    paid_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    # usuario que cobró: admin o barbero
    created_by_user_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.user_id", name="fk_payments_created_by_user_id"),
        nullable=False
    )
    notes: Mapped[Optional[str]] = mapped_column(db.Text, nullable=True)
#  ANTI-DUPLICADOS: guardamos session.id de Stripe (único)
    stripe_session_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    # Opcional (si quieres trazabilidad extra):
    # stripe_payment_intent: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # appointment: Mapped["Appointment"] = relationship("Appointment")
    # appointment: Mapped[Optional["Appointment"]] = relationship("Appointment", backref="payments")
    # created_by: Mapped["Usuario"] = relationship("Usuario")

    appointment: Mapped[Optional["Appointment"]] = relationship("Appointment")
    payer: Mapped[Optional["Usuario"]] = relationship(
        "Usuario", foreign_keys=[payer_user_id])
    created_by: Mapped["Usuario"] = relationship(
        "Usuario", foreign_keys=[created_by_user_id])

    def serialize(self):
        return {
            "payment_id": self.payment_id,
            "appointment_id": self.appointment_id,
            "amount": float(self.amount),
            "method": self.method,
            "status": self.status,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
            "created_by_user_id": self.created_by_user_id,
            "created_by_name": self.created_by.name if self.created_by else None,
            "notes": self.notes
        }
