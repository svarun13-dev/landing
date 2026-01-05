from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.database import Contact as ContactModel, ContactStatus
from models.schemas import Contact, ContactCreate, ContactUpdate
from datetime import datetime

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.get("/", response_model=List[Contact])
def get_contacts(
    skip: int = 0,
    limit: int = 100,
    status: ContactStatus = None,
    db: Session = Depends(get_db)
):
    """Get all contacts with optional filtering"""
    query = db.query(ContactModel)

    if status:
        query = query.filter(ContactModel.status == status)

    contacts = query.offset(skip).limit(limit).all()
    return contacts


@router.get("/{contact_id}", response_model=Contact)
def get_contact(contact_id: int, db: Session = Depends(get_db)):
    """Get a specific contact by ID"""
    contact = db.query(ContactModel).filter(ContactModel.id == contact_id).first()

    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    return contact


@router.post("/", response_model=Contact)
def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    """Create a new contact"""
    # Check if email already exists
    existing = db.query(ContactModel).filter(ContactModel.email == contact.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Contact with this email already exists")

    db_contact = ContactModel(**contact.dict())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)

    return db_contact


@router.put("/{contact_id}", response_model=Contact)
def update_contact(
    contact_id: int,
    contact_update: ContactUpdate,
    db: Session = Depends(get_db)
):
    """Update a contact"""
    contact = db.query(ContactModel).filter(ContactModel.id == contact_id).first()

    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    # Update only provided fields
    update_data = contact_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contact, field, value)

    contact.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(contact)

    return contact


@router.delete("/{contact_id}")
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    """Delete a contact"""
    contact = db.query(ContactModel).filter(ContactModel.id == contact_id).first()

    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(contact)
    db.commit()

    return {"message": "Contact deleted successfully"}


@router.get("/{contact_id}/deals")
def get_contact_deals(contact_id: int, db: Session = Depends(get_db)):
    """Get all deals for a specific contact"""
    contact = db.query(ContactModel).filter(ContactModel.id == contact_id).first()

    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    return contact.deals


@router.get("/{contact_id}/activities")
def get_contact_activities(contact_id: int, db: Session = Depends(get_db)):
    """Get all activities for a specific contact"""
    contact = db.query(ContactModel).filter(ContactModel.id == contact_id).first()

    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    return contact.activities
