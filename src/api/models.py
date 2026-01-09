from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Enum, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from typing import List, Optional

db = SQLAlchemy()

ROLE_ENUM = Enum("cliente", "barbero", "admin",
                 name="role_enum", native_enum=False)
STATUS_ENUM = Enum("pendiente", "confirmada", "cancelada",
                   "completada", name="status_enum", native_enum=False)


# (Opcional) Tu modelo viejo. Puedes borrarlo luego si ya no lo usas.
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
            "phone": self.phone,
            "address": self.address,
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
