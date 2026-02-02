# Fulcrum.ai - Civic Engagement Platform

> A Tinder for civic engagement—swipe through local policy decisions that actually affect your life, powered by AI.

[![Built with FastAPI](https://img.shields.io/badge/Built%20with-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)

## Overview

Fulcrum.ai matches San Francisco residents with civic events and policy decisions that directly affect their lives. Using AI-powered profile enrichment, the platform understands who you are and surfaces the opportunities that matter most to you.

## Features

- **AI-Powered Onboarding** - Enter your email, get a complete profile inferred via Nyne.ai
- **Smart Matching** - Car owners see parking policies; renters see rent control hearings
- **Swipeable Card UI** - Fast, engaging way to review civic opportunities
- **Action Tracking** - Todo list with Google Calendar and email integration
- **Real-Time Data** - Direct integration with SF government APIs (Legistar)

## Tech Stack

### Backend
- Python 3.9+
- FastAPI
- Supabase (PostgreSQL)
- Nyne.ai (profile enrichment)
- Legistar API (civic data)

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Framer Motion
- TanStack Query

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- Supabase account
- Nyne.ai API key

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your API keys to .env

uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/onboard` | POST | Onboard user with AI profile enrichment |
| `/confirm-profile` | POST | Save verified user profile |
| `/dashboard/{email}` | GET | Get personalized civic events |
| `/admin/refresh-events` | POST | Refresh civic data from sources |
| `/admin/events-stats` | GET | Get event statistics |

## Environment Variables

### Backend (.env)

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
NYNE_API_KEY=your_nyne_api_key
OPENAI_API_KEY=your_openai_key  # Optional
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:8000
VITE_EMAILJS_SERVICE_ID=your_emailjs_service
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_key
```

## Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI application
│   ├── services/
│   │   ├── nyne.py          # Nyne.ai integration
│   │   ├── legistar.py      # Legistar API scraper
│   │   └── supabase.py      # Database client
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilities
│   └── package.json
└── README.md
```

## How It Works

1. **Onboarding** - User provides email/LinkedIn URL
2. **Enrichment** - Nyne.ai infers 80+ profile fields (profession, location, interests)
3. **Verification** - User confirms profile and answers follow-up questions
4. **Matching** - Platform matches civic events based on user interests and attributes
5. **Action** - User swipes through opportunities, adds to todo list, gets calendar/email reminders

## Smart Matching

User attributes are converted to implicit interests:

| Attribute | Interests |
|-----------|-----------|
| Has car | Parking, traffic |
| Rents | Rent control, tenant rights |
| Has kids | Education, family services |
| Uses transit | Transportation, SFMTA |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Nyne.ai](https://nyne.ai) for profile enrichment API
- [SF Legistar](https://sfgov.legistar.com) for civic data
- [shadcn/ui](https://ui.shadcn.com) for UI components

---

Built with care for San Francisco civic engagement.
