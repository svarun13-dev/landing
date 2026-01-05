# 🚀 Crypto BD CRM

A minimalistic Business Development CRM built for Crypto Projects and Institutions. Features deal pipeline management, contact tracking, and AI-powered insights.

## 🎨 Design

Built with **Everclear branding**:
- Navy blue & grey color scheme
- Sophisticated and bold aesthetic
- Optimized for crypto/tech industry

## ✨ Features

### Core CRM
- **Contact Management** - Track crypto projects, VCs, exchanges, and institutions
- **Deal Pipeline** - Visual kanban board with drag-and-drop
- **Dashboard** - Key metrics and upcoming activities
- **Activity Tracking** - Calls, meetings, emails, and notes

### AI-Powered Features
- Email summarization
- Deal scoring and predictions
- Contact insights (best time to reach out)
- Outreach template generation
- Action item extraction

## 🏗️ Architecture

**Backend:** Python FastAPI + SQLAlchemy + SQLite
**Frontend:** React + Vite + TailwindCSS + React Query
**AI:** Integrates with existing LLM infrastructure

```
crm/
├── backend/
│   ├── app/
│   │   └── main.py           # FastAPI application
│   ├── database/
│   │   └── connection.py     # Database setup
│   ├── models/
│   │   ├── database.py       # SQLAlchemy models
│   │   └── schemas.py        # Pydantic schemas
│   ├── routes/
│   │   ├── contacts.py       # Contact endpoints
│   │   ├── deals.py          # Deal endpoints
│   │   ├── dashboard.py      # Dashboard metrics
│   │   ├── activities.py     # Activity endpoints
│   │   └── ai.py             # AI endpoints
│   ├── services/
│   │   └── ai_service.py     # AI business logic
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/       # React components
    │   ├── pages/            # Page components
    │   ├── services/         # API client
    │   └── App.jsx
    ├── package.json
    └── vite.config.js
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd crm/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
cd app
python main.py
```

The API will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd crm/frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 📊 Database Schema

### Contacts
- Personal & company info
- Contact type (DeFi, L1/L2, VC, Exchange, Institution)
- Status (Hot, Warm, Cold)
- Social handles (Telegram, Twitter)

### Deals
- Title, description, value
- Pipeline stage (Prospect → Interested → Proposal → Negotiation → Won/Lost)
- Probability & expected close date
- Linked to contacts

### Activities
- Type (Call, Meeting, Email, Note, Task)
- Scheduled & completed dates
- Linked to contacts and deals

### Notes & Tasks
- Rich text content
- AI-generated flag
- Associations with contacts/deals

## 🔌 API Endpoints

### Contacts
- `GET /api/contacts/` - List all contacts
- `GET /api/contacts/{id}` - Get contact details
- `POST /api/contacts/` - Create contact
- `PUT /api/contacts/{id}` - Update contact
- `DELETE /api/contacts/{id}` - Delete contact

### Deals
- `GET /api/deals/` - List all deals
- `GET /api/deals/pipeline` - Get pipeline view
- `POST /api/deals/` - Create deal
- `PUT /api/deals/{id}` - Update deal
- `PATCH /api/deals/{id}/stage` - Update deal stage (for drag-and-drop)

### Dashboard
- `GET /api/dashboard/metrics` - Get key metrics

### AI Features
- `POST /api/ai/summarize-notes` - Summarize notes
- `GET /api/ai/score-deal/{id}` - Score deal
- `GET /api/ai/contact-insights/{id}` - Get contact insights
- `POST /api/ai/generate-outreach` - Generate outreach email

## 🎯 Usage

### Managing Contacts

1. Click "Add Contact" to create a new contact
2. Fill in details: name, email, company, type, status
3. Add social handles (Telegram, Twitter)
4. Set contact status (🔥 Hot, 🌤 Warm, ❄️ Cold)

### Pipeline Management

1. Navigate to Pipeline view
2. Drag and drop deals between stages:
   - **Prospect** - Initial outreach
   - **Interested** - They're engaged
   - **Proposal** - Sent proposal
   - **Negotiation** - In talks
   - **Won** - Deal closed!
   - **Lost** - Deal lost
3. Click on a deal to edit details

### Dashboard Insights

View at a glance:
- Total contacts & hot contacts
- Active deals & pipeline value
- Deals by stage
- Upcoming activities

## 🤖 AI Integration

The CRM includes AI-powered features that can be enhanced by integrating with your existing LLM infrastructure in `src/llm/`:

### To Enable Full AI Features:

1. Edit `crm/backend/services/ai_service.py`
2. Integrate with your LLM router from `src/llm/router.py`
3. Use existing agents from `src/agents/` for advanced features

Example integration:
```python
from src.llm.platforms.anthropic import AnthropicLLM

class CRMAIService:
    def __init__(self):
        self.llm = AnthropicLLM()

    async def summarize_notes(self, notes):
        prompt = f"Summarize: {notes}"
        return await self.llm.generate(prompt)
```

## 🎨 Customization

### Branding
Colors are defined in `frontend/tailwind.config.js`:
- Primary: Blue (#6575f1)
- Navy: Dark navy (#1a2138)
- Grey: Neutral grey

### Add Custom Fields
1. Update database models in `backend/models/database.py`
2. Update schemas in `backend/models/schemas.py`
3. Update frontend forms

## 📝 Development Roadmap

**MVP (Current):**
- ✅ Contact management
- ✅ Deal pipeline
- ✅ Dashboard metrics
- ✅ Activity tracking
- ✅ Basic AI features

**Future Enhancements:**
- 🔜 Multi-user authentication
- 🔜 Email integration
- 🔜 Calendar sync
- 🔜 Advanced reporting
- 🔜 Mobile app
- 🔜 Vector search for similar contacts
- 🔜 Automated follow-ups

## 🛠️ Tech Stack

**Backend:**
- FastAPI - Modern Python web framework
- SQLAlchemy - ORM
- SQLite - Database (easily switch to PostgreSQL)
- Pydantic - Data validation

**Frontend:**
- React 18 - UI library
- Vite - Build tool
- TailwindCSS - Styling
- React Query - Data fetching
- React Router - Routing
- Lucide Icons - Icons
- date-fns - Date formatting

## 📄 License

MIT License - feel free to use for your crypto consulting business!

## 🤝 Contributing

This is a private CRM for your consulting business. Customize as needed!

## 🔒 Security Notes

For production deployment:
1. Change database to PostgreSQL
2. Add authentication (JWT tokens)
3. Enable HTTPS
4. Add rate limiting
5. Implement proper logging
6. Add data backup strategy

## 📞 Support

For issues or questions, contact your development team.

---

Built with ❤️ for the crypto community
