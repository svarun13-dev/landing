from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.database import Deal as DealModel, DealStage
from models.schemas import Deal, DealCreate, DealUpdate
from datetime import datetime

router = APIRouter(prefix="/deals", tags=["deals"])


@router.get("/", response_model=List[Deal])
def get_deals(
    skip: int = 0,
    limit: int = 100,
    stage: DealStage = None,
    db: Session = Depends(get_db)
):
    """Get all deals with optional filtering by stage"""
    query = db.query(DealModel)

    if stage:
        query = query.filter(DealModel.stage == stage)

    deals = query.offset(skip).limit(limit).all()
    return deals


@router.get("/pipeline", response_model=dict)
def get_pipeline(db: Session = Depends(get_db)):
    """Get deals organized by pipeline stage (for kanban view)"""
    pipeline = {}

    for stage in DealStage:
        deals = db.query(DealModel).filter(DealModel.stage == stage).all()
        pipeline[stage.value] = [
            {
                "id": deal.id,
                "title": deal.title,
                "value": deal.value,
                "probability": deal.probability,
                "contact_id": deal.contact_id,
                "expected_close_date": deal.expected_close_date
            }
            for deal in deals
        ]

    return pipeline


@router.get("/{deal_id}", response_model=Deal)
def get_deal(deal_id: int, db: Session = Depends(get_db)):
    """Get a specific deal by ID"""
    deal = db.query(DealModel).filter(DealModel.id == deal_id).first()

    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    return deal


@router.post("/", response_model=Deal)
def create_deal(deal: DealCreate, db: Session = Depends(get_db)):
    """Create a new deal"""
    db_deal = DealModel(**deal.dict())
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)

    return db_deal


@router.put("/{deal_id}", response_model=Deal)
def update_deal(
    deal_id: int,
    deal_update: DealUpdate,
    db: Session = Depends(get_db)
):
    """Update a deal"""
    deal = db.query(DealModel).filter(DealModel.id == deal_id).first()

    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    # Update only provided fields
    update_data = deal_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(deal, field, value)

    deal.updated_at = datetime.utcnow()

    # If deal is marked as won or lost, set closed_at
    if deal.stage in [DealStage.WON, DealStage.LOST] and not deal.closed_at:
        deal.closed_at = datetime.utcnow()

    db.commit()
    db.refresh(deal)

    return deal


@router.patch("/{deal_id}/stage")
def update_deal_stage(
    deal_id: int,
    stage: DealStage,
    db: Session = Depends(get_db)
):
    """Update deal stage (for kanban drag-and-drop)"""
    deal = db.query(DealModel).filter(DealModel.id == deal_id).first()

    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    deal.stage = stage
    deal.updated_at = datetime.utcnow()

    # If deal is marked as won or lost, set closed_at
    if stage in [DealStage.WON, DealStage.LOST] and not deal.closed_at:
        deal.closed_at = datetime.utcnow()

    db.commit()
    db.refresh(deal)

    return {"message": "Deal stage updated", "deal": deal}


@router.delete("/{deal_id}")
def delete_deal(deal_id: int, db: Session = Depends(get_db)):
    """Delete a deal"""
    deal = db.query(DealModel).filter(DealModel.id == deal_id).first()

    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    db.delete(deal)
    db.commit()

    return {"message": "Deal deleted successfully"}
