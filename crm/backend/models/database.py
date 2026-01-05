from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()


class ContactStatus(str, enum.Enum):
    HOT = "hot"
    WARM = "warm"
    COLD = "cold"
    UNQUALIFIED = "unqualified"


class ContactType(str, enum.Enum):
    DEFI_PROJECT = "defi_project"
    L1_L2_PROTOCOL = "l1_l2_protocol"
    VC_FUND = "vc_fund"
    EXCHANGE = "exchange"
    INSTITUTION = "institution"
    OTHER = "other"


class DealStage(str, enum.Enum):
    PROSPECT = "prospect"
    INTERESTED = "interested"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    WON = "won"
    LOST = "lost"


class ActivityType(str, enum.Enum):
    CALL = "call"
    MEETING = "meeting"
    EMAIL = "email"
    NOTE = "note"
    TASK = "task"


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True)
    company = Column(String(255))
    role = Column(String(255))
    phone = Column(String(50))
    telegram = Column(String(100))
    twitter = Column(String(100))

    # Classification
    contact_type = Column(Enum(ContactType), default=ContactType.OTHER)
    status = Column(Enum(ContactStatus), default=ContactStatus.COLD)

    # Metadata
    source = Column(String(255))  # How did we meet them?
    location = Column(String(255))
    timezone = Column(String(50))
    tags = Column(String(500))  # Comma-separated tags

    # Partnership strategy
    partnership_strategy = Column(Text)  # Tailored engagement flow for each partner
    next_steps = Column(String(500))  # What needs to happen next

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_contact_date = Column(DateTime)

    # Relationships
    deals = relationship("Deal", back_populates="contact", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="contact", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="contact", cascade="all, delete-orphan")


class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    value = Column(Float)  # Deal value in USD

    # Pipeline
    stage = Column(Enum(DealStage), default=DealStage.PROSPECT)
    probability = Column(Integer, default=0)  # 0-100%

    # Dates
    expected_close_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    closed_at = Column(DateTime)

    # Foreign Keys
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)

    # Relationships
    contact = relationship("Contact", back_populates="deals")
    activities = relationship("Activity", back_populates="deal", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="deal", cascade="all, delete-orphan")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(ActivityType), nullable=False)
    subject = Column(String(500))
    description = Column(Text)

    # Scheduling
    scheduled_at = Column(DateTime)
    completed_at = Column(DateTime)
    is_completed = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign Keys
    contact_id = Column(Integer, ForeignKey("contacts.id"))
    deal_id = Column(Integer, ForeignKey("deals.id"))

    # Relationships
    contact = relationship("Contact", back_populates="activities")
    deal = relationship("Deal", back_populates="activities")


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    is_ai_generated = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign Keys
    contact_id = Column(Integer, ForeignKey("contacts.id"))
    deal_id = Column(Integer, ForeignKey("deals.id"))

    # Relationships
    contact = relationship("Contact", back_populates="notes")
    deal = relationship("Deal", back_populates="notes")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    priority = Column(Integer, default=0)  # 0=low, 1=medium, 2=high
    is_completed = Column(Boolean, default=False)

    # Dates
    due_date = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign Keys
    contact_id = Column(Integer, ForeignKey("contacts.id"))
    deal_id = Column(Integer, ForeignKey("deals.id"))
