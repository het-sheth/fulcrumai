# COmpile Before the Ballot (Fulcrum.ai) - Project Overview

## The Problem

Most San Francisco residents are unaware of civic decisions that directly impact their lives—parking changes, rent control hearings, school board votes, transit proposals—until it's too late to participate.

## The Solution

A **personalized civic engagement platform** that matches SF citizens with local policy decisions, meetings, and votes based on their unique circumstances, interests, and lifestyle.

---

## How It Works

1. **Smart Onboarding** - Enter your email/LinkedIn → AI (Nyne.ai) infers your profession, location, and likely interests
2. **Quick Verification** - Answer a few targeted questions (Do you have a car? Rent or own? Have kids?)
3. **Personalized Dashboard** - A Tinder-like card stack presents civic opportunities filtered to YOU, with specific actions: Vote YES/NO, Attend, Testify

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python, FastAPI, Supabase |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| AI Enrichment | Nyne.ai (80+ profile fields from email) |
| Civic Data | SF Legistar API (Board of Supervisors) |
| UX | Framer Motion (card animations), shadcn/ui |
| Integrations | Google Calendar, EmailJS notifications |

---

## Key Features

- **AI-Powered Profile Enrichment** - One email unlocks profession, work history, social profiles, interests
- **Smart Matching** - Car owner → parking policies matter. Renter → rent control matters. Parent → education funding matters
- **Swipeable Card UX** - Skip or Accept opportunities; skipped cards rotate to end (never lost)
- **Three-Tier Urgency** - Urgent (vote in 48h), Soon, Upcoming
- **Action Tracking** - Todo list with calendar + email integration
- **Sponsored Content** - Native ads for civic orgs (YIMBY Action, TogetherSF) after organic content

---

## Architecture

### Backend (Python/FastAPI)

- **Framework:** FastAPI for high-performance async REST APIs
- **Database:** Supabase (PostgreSQL) for storing user profiles and civic events
- **Data Enrichment:** Nyne.ai API for comprehensive user profile inference
- **Data Sources:** Legistar API for SF Board of Supervisors meetings and legislation

### Frontend (React + TypeScript)

- **Framework:** React 18.3 with Vite
- **Routing:** React Router for single-page navigation
- **State Management:** TanStack React Query for server state
- **UI Library:** shadcn/ui (Radix UI components) with Tailwind CSS
- **Animations:** Framer Motion for smooth card stack interactions

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/onboard` | POST | User onboarding with AI profile enrichment |
| `/confirm-profile` | POST | Save verified user profile to database |
| `/dashboard/{email}` | GET | Get personalized civic events for user |
| `/admin/refresh-events` | POST | Refresh civic data from Legistar |
| `/admin/events-stats` | GET | Get event statistics |

---

## Data Models

### User
- Email (primary key)
- Zip code, profession, company
- Attributes: has_car, has_kids, owns_home
- Interests: housing, transportation, education, etc.
- Full enriched profile from Nyne.ai

### CivicEvent
- Source URL (unique key)
- Title, summary, location, event date
- Impact tags: housing, zoning, families, etc.
- Urgency: High, Medium, Low
- Recommended action: Vote YES/NO, Attend, Testify
- Sponsored by (optional)

---

## Smart Matching Algorithm

The platform converts user attributes into implicit interests:

| User Attribute | Inferred Interests |
|----------------|-------------------|
| Has car | Parking, traffic policies |
| Rents | Rent control, tenant rights |
| Has kids | Education funding, family services |
| Uses transit | Transportation, SFMTA decisions |

Events are matched by overlapping impact tags and sorted by urgency.

---

## Impact

Transforms citizens from passive observers into active participants by making civic engagement feel natural—not like a burden.

- Higher voter turnout
- More informed public comment
- Stronger community input on local policy

---

## LinkedIn Post Summary

> "We built a Tinder for civic engagement—swipe through local policy decisions that actually affect your life, powered by AI that understands who you are."

This project demonstrates rapid prototyping, modern full-stack development (FastAPI + React + AI APIs), and thoughtful UX design for a critical social problem.
