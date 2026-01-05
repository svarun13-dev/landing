from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models.database import ContactStatus, ContactType, DealStage, ActivityType


# Contact Schemas
class ContactBase(BaseModel):
    company: str
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    telegram: Optional[str] = None
    twitter: Optional[str] = None
    contact_type: ContactType = ContactType.OTHER
    status: ContactStatus = ContactStatus.COLD
    source: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None
    tags: Optional[str] = None
    partnership_strategy: Optional[str] = None
    next_steps: Optional[str] = None


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    company: Optional[str] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    telegram: Optional[str] = None
    twitter: Optional[str] = None
    contact_type: Optional[ContactType] = None
    status: Optional[ContactStatus] = None
    source: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None
    tags: Optional[str] = None
    partnership_strategy: Optional[str] = None
    next_steps: Optional[str] = None


class Contact(ContactBase):
    id: int
    created_at: datetime
    updated_at: datetime
    last_contact_date: Optional[datetime] = None

    class Config:
        from_attributes = True


# Deal Schemas
class DealBase(BaseModel):
    title: str
    description: Optional[str] = None
    value: Optional[float] = None
    stage: DealStage = DealStage.PROSPECT
    probability: int = 0
    expected_close_date: Optional[datetime] = None
    contact_id: int


class DealCreate(DealBase):
    pass


class DealUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    value: Optional[float] = None
    stage: Optional[DealStage] = None
    probability: Optional[int] = None
    expected_close_date: Optional[datetime] = None


class Deal(DealBase):
    id: int
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Activity Schemas
class ActivityBase(BaseModel):
    type: ActivityType
    subject: Optional[str] = None
    description: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    contact_id: Optional[int] = None
    deal_id: Optional[int] = None


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    is_completed: Optional[bool] = None


class Activity(ActivityBase):
    id: int
    is_completed: bool
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Note Schemas
class NoteBase(BaseModel):
    content: str
    contact_id: Optional[int] = None
    deal_id: Optional[int] = None
    is_ai_generated: bool = False


class NoteCreate(NoteBase):
    pass


class Note(NoteBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: int = 0
    due_date: Optional[datetime] = None
    contact_id: Optional[int] = None
    deal_id: Optional[int] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[int] = None
    is_completed: Optional[bool] = None
    due_date: Optional[datetime] = None


class Task(TaskBase):
    id: int
    is_completed: bool
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Dashboard Metrics
class DashboardMetrics(BaseModel):
    total_contacts: int
    hot_contacts: int
    active_deals: int
    total_pipeline_value: float
    deals_by_stage: dict
    upcoming_activities: List[Activity]
