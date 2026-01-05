from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.connection import get_db
from models.database import Contact, Deal, DealStage, ContactStatus, Activity
from models.schemas import DashboardMetrics
from datetime import datetime, timedelta

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/metrics", response_model=DashboardMetrics)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Get key metrics for dashboard"""

    # Total contacts
    total_contacts = db.query(Contact).count()

    # Hot contacts
    hot_contacts = db.query(Contact).filter(Contact.status == ContactStatus.HOT).count()

    # Active deals (not won or lost)
    active_deals = db.query(Deal).filter(
        Deal.stage.notin_([DealStage.WON, DealStage.LOST])
    ).count()

    # Total pipeline value
    pipeline_value = db.query(func.sum(Deal.value)).filter(
        Deal.stage.notin_([DealStage.WON, DealStage.LOST])
    ).scalar() or 0

    # Deals by stage
    deals_by_stage = {}
    for stage in DealStage:
        count = db.query(Deal).filter(Deal.stage == stage).count()
        value = db.query(func.sum(Deal.value)).filter(Deal.stage == stage).scalar() or 0
        deals_by_stage[stage.value] = {
            "count": count,
            "value": value
        }

    # Upcoming activities (next 7 days)
    next_week = datetime.utcnow() + timedelta(days=7)
    upcoming_activities = db.query(Activity).filter(
        Activity.scheduled_at.isnot(None),
        Activity.scheduled_at <= next_week,
        Activity.is_completed == False
    ).order_by(Activity.scheduled_at).limit(10).all()

    return DashboardMetrics(
        total_contacts=total_contacts,
        hot_contacts=hot_contacts,
        active_deals=active_deals,
        total_pipeline_value=pipeline_value,
        deals_by_stage=deals_by_stage,
        upcoming_activities=upcoming_activities
    )
