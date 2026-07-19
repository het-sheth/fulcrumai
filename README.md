# Compile Before the Ballot (Fulcrum.ai)

A civic engagement platform that matches San Francisco residents with the local policy decisions, hearings, and votes that actually affect their lives — built as a hackathon project.

[![Built with FastAPI](https://img.shields.io/badge/Built%20with-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)

## The Problem

Most SF residents never hear about the parking changes, rent control hearings, school board votes, and transit proposals that directly impact them — until the decision has already been made. The information exists (Legistar publishes every Board of Supervisors meeting), but nobody has time to read committee agendas.

## What It Does

1. **Smart onboarding** — Enter your email (and optionally a LinkedIn URL). Nyne.ai enrichment infers your profession, location, work history, social profiles, and likely interests.
2. **Quick verification** — Review the inferred profile and answer a few targeted questions: Do you drive? Rent or own? Have kids? Use transit?
3. **Personalized dashboard** — A swipeable card stack presents civic events matched to your profile, sorted by urgency (vote in 48h = Urgent), each with a concrete action: Vote YES/NO, Attend, Testify.
4. **Action tracking** — Accepted cards land in a civic to-do list with Google Calendar links and EmailJS email reminders.

### Smart Matching

User attributes are converted into implicit interest tags, then matched against event `impact_tags`:

| Attribute | Matched interests |
|-----------|-------------------|
| Has a car | parking, traffic |
| No car | transportation, bike lanes |
| Has kids | families, education, youth |

Civic events are pulled live from the [SF Legistar API](https://webapi.legistar.com/v1/sfgov) (Board of Supervisors meetings and legislation), tagged by committee (e.g. Land Use → housing, zoning, transportation), and stored in Supabase.

## Tech Stack

**Backend** (`backend/`)
- Python 3.9+ / FastAPI / Pydantic
- Supabase (Postgres) for users and civic events
- Nyne.ai — async profile enrichment (enrichment, interactions, and article-search endpoints, with a mock fallback when no API key is set)
- Hyperspell — OAuth-connected memory search (token endpoint + search client)
- OpenAI — LLM analysis of enriched profiles into civic-interest dossiers
- httpx, pytest

**Frontend** (`frontend/`)
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui (Radix primitives)
- Framer Motion (card stack and scanning animations)
- TanStack Query, React Router, EmailJS, Vitest
- Ships fallback JSON data (`public/fallback-*.json`) so the demo runs even without the backend

## Getting Started

### Backend

```bash
# From the repo root
python -m venv venv && source venv/bin/activate
pip install -r backend/requirements.txt

cp backend/.env.example backend/.env   # add your keys

uvicorn backend.main:app --reload      # run from the repo root (package-relative imports)
```

API docs at http://localhost:8000/docs.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/onboard` | POST | Enrich a user profile from email/LinkedIn |
| `/confirm-profile` | POST | Save the user-verified profile |
| `/dashboard/{email}` | GET | Personalized civic events, sorted by urgency |
| `/hyperspell/token` | POST | Token for the Hyperspell OAuth connect flow |
| `/admin/refresh-events` | POST | Pull fresh events from Legistar into Supabase |
| `/admin/events-stats` | GET | Event statistics |

### Frontend

```bash
cd frontend
npm install
cp .env.example .env    # set VITE_API_URL and (optionally) EmailJS keys
npm run dev
```

### Environment Variables

Backend (`backend/.env`): `SUPABASE_URL`, `SUPABASE_KEY`, `NYNE_API_KEY`, `NYNE_API_SECRET`, `HYPERSPELL_API_KEY`, `OPENAI_API_KEY`. Nyne and OpenAI are optional — the backend falls back to mock enrichment without them.

Frontend (`frontend/.env`): `VITE_API_URL` (default `http://localhost:8000`), plus `VITE_EMAILJS_SERVICE_ID` / `VITE_EMAILJS_TEMPLATE_ID` / `VITE_EMAILJS_PUBLIC_KEY` for email reminders.

## Project Structure

```
.
├── backend/
│   ├── main.py                  # FastAPI app
│   ├── models.py                # Pydantic models
│   ├── routers/                 # onboard, profile, dashboard, hyperspell, admin
│   └── services/
│       ├── nyne.py              # Nyne.ai enrichment client (async, polling)
│       ├── llm_enrichment.py    # OpenAI civic-profile analysis
│       ├── hyperspell_client.py # Hyperspell memory search
│       ├── supabase_client.py   # Database access
│       └── scrapers/legistar.py # SF Legistar API scraper
└── frontend/
    └── src/
        ├── pages/Index.tsx      # Landing → scanning → verification → dashboard flow
        ├── components/          # landing, scanning, verification, dashboard, ui
        └── lib/                 # API client, EmailJS helper
```

## Team

- Het Sheth — [@het-sheth](https://github.com/het-sheth)
- Ishaan Narang — [@Ishaannarang22](https://github.com/Ishaannarang22)

## Acknowledgments

- [Nyne.ai](https://nyne.ai) — profile enrichment
- [Hyperspell](https://hyperspell.com) — context/memory agent
- [SF Legistar](https://sfgov.legistar.com) — civic data
- [shadcn/ui](https://ui.shadcn.com) — UI components
