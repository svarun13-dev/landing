from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.connection import get_db
from models.database import Contact, Deal, Note
from services.ai_service import CRMAIService
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/ai", tags=["ai"])
ai_service = CRMAIService()


class SummarizeRequest(BaseModel):
    note_ids: List[int]


class OutreachRequest(BaseModel):
    contact_id: int
    context: str = ""


@router.post("/summarize-notes")
async def summarize_notes(request: SummarizeRequest, db: Session = Depends(get_db)):
    """Summarize multiple notes using AI"""
    notes = db.query(Note).filter(Note.id.in_(request.note_ids)).all()
    note_texts = [note.content for note in notes]

    summary = await ai_service.summarize_notes(note_texts)

    return {
        "summary": summary,
        "note_count": len(notes)
    }


@router.get("/score-deal/{deal_id}")
async def score_deal(deal_id: int, db: Session = Depends(get_db)):
    """Get AI scoring for a deal"""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()

    if not deal:
        return {"error": "Deal not found"}

    deal_dict = {
        'title': deal.title,
        'value': deal.value,
        'stage': deal.stage.value,
        'probability': deal.probability,
        'created_at': deal.created_at
    }

    score_result = await ai_service.score_deal(deal_dict)

    return score_result


@router.get("/contact-insights/{contact_id}")
async def get_contact_insights(contact_id: int, db: Session = Depends(get_db)):
    """Get AI-powered insights for a contact"""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()

    if not contact:
        return {"error": "Contact not found"}

    contact_dict = {
        'name': contact.name,
        'company': contact.company,
        'timezone': contact.timezone,
        'location': contact.location,
        'contact_type': contact.contact_type.value
    }

    best_time = await ai_service.suggest_best_contact_time(contact_dict)

    return {
        "contact_id": contact_id,
        "best_contact_time": best_time,
        "timezone": contact.timezone or "Not specified"
    }


@router.post("/generate-outreach")
async def generate_outreach(request: OutreachRequest, db: Session = Depends(get_db)):
    """Generate personalized outreach email"""
    contact = db.query(Contact).filter(Contact.id == request.contact_id).first()

    if not contact:
        return {"error": "Contact not found"}

    contact_dict = {
        'name': contact.name,
        'company': contact.company,
        'contact_type': contact.contact_type.value
    }

    template = await ai_service.generate_outreach_template(contact_dict, request.context)

    return {
        "template": template,
        "contact_name": contact.name
    }


@router.get("/deal-prediction/{deal_id}")
async def predict_deal(deal_id: int, db: Session = Depends(get_db)):
    """Predict deal close date"""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()

    if not deal:
        return {"error": "Deal not found"}

    deal_dict = {
        'stage': deal.stage.value,
        'created_at': deal.created_at
    }

    prediction = await ai_service.predict_deal_close_date(deal_dict)

    return {
        "deal_id": deal_id,
        "prediction": prediction
    }
