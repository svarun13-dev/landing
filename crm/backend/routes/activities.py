from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.database import Activity as ActivityModel
from models.schemas import Activity, ActivityCreate, ActivityUpdate
from datetime import datetime

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("/", response_model=List[Activity])
def get_activities(
    skip: int = 0,
    limit: int = 100,
    contact_id: int = None,
    deal_id: int = None,
    db: Session = Depends(get_db)
):
    """Get all activities with optional filtering"""
    query = db.query(ActivityModel)

    if contact_id:
        query = query.filter(ActivityModel.contact_id == contact_id)

    if deal_id:
        query = query.filter(ActivityModel.deal_id == deal_id)

    activities = query.order_by(ActivityModel.scheduled_at.desc()).offset(skip).limit(limit).all()
    return activities


@router.get("/{activity_id}", response_model=Activity)
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    """Get a specific activity by ID"""
    activity = db.query(ActivityModel).filter(ActivityModel.id == activity_id).first()

    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    return activity


@router.post("/", response_model=Activity)
def create_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    """Create a new activity"""
    db_activity = ActivityModel(**activity.dict())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)

    return db_activity


@router.put("/{activity_id}", response_model=Activity)
def update_activity(
    activity_id: int,
    activity_update: ActivityUpdate,
    db: Session = Depends(get_db)
):
    """Update an activity"""
    activity = db.query(ActivityModel).filter(ActivityModel.id == activity_id).first()

    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Update only provided fields
    update_data = activity_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(activity, field, value)

    # If marked as completed, set completed_at
    if activity.is_completed and not activity.completed_at:
        activity.completed_at = datetime.utcnow()

    activity.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(activity)

    return activity


@router.delete("/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    """Delete an activity"""
    activity = db.query(ActivityModel).filter(ActivityModel.id == activity_id).first()

    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    db.delete(activity)
    db.commit()

    return {"message": "Activity deleted successfully"}
