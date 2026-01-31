# Fulcrum.ai Backend Implementation Plan

## Phase 1: Data Acquisition - Civic Event Scraping
**Goal:** Get real SF civic data flowing into the system

### 1A. SF Board of Supervisors (Legistar)
- [x] ~~Scrape https://sfbos.org/legislative-research-center-lrc~~ (API returns stale data)
- [x] Created scraper skeleton at `backend/services/scrapers/legistar.py`
- [ ] TODO: Use alternative data source or manual scraping

### 1B. SF Planning Commission
- [ ] Scrape https://sfplanning.org/hearings-cpc-grid
- [ ] Extract: weekly hearing agendas, project addresses, hearing dates
- [ ] Parse into CivicEvent format

### 1C. SFMTA Board Meetings
- [ ] Scrape https://www.sfmta.com/meetings-events
- [ ] Extract: engineering hearings, parking/bike lane decisions
- [ ] Parse into CivicEvent format

### 1D. Store in Supabase
- [x] Create `civic_events` table
- [x] Create `users` table
- [x] Seeded 10 sample civic events for demo
- [ ] TODO: Automated scraping pipeline

---

## Phase 2: Nyne.ai Integration - User Enrichment
**Goal:** Get user profile inference working

- [x] Set up Nyne.ai API client (with mock fallback)
- [x] Mock enrichment based on email domain
- [x] Map response → UserProfile schema
- [x] Generate dynamic follow-up questions
- [ ] TODO: Integrate real Nyne.ai API when key available

---

## Phase 3: Hyperspell Context Agent Setup
**Goal:** Store users and enable semantic matching

- [ ] Initialize Hyperspell with User node type
- [ ] Initialize Hyperspell with CivicEvent node type
- [ ] Sync CivicEvents from Supabase → Hyperspell
- [ ] Test semantic query: "find events matching user interests"

---

## Phase 4: FastAPI Endpoints (Wire It All Up)
**Goal:** Three working endpoints - COMPLETE

### Project Structure
```
backend/
├── main.py           ✅
├── config.py         ✅
├── models.py         ✅
├── routers/
│   ├── onboard.py    ✅
│   ├── profile.py    ✅
│   └── dashboard.py  ✅
└── services/
    ├── nyne.py           ✅ (mock)
    ├── supabase_client.py ✅
    └── scrapers/
        └── legistar.py    ✅ (skeleton)
```

### `POST /onboard` ✅
- [x] Input: `{ email, linkedin_url }`
- [x] Call Nyne.ai → get inferred profile
- [x] Return: `{ inferred: {...}, questions_to_ask: [...] }`

### `POST /confirm-profile` ✅
- [x] Input: confirmed profile + answers
- [x] Save User to Supabase
- [x] Return: `{ success: true, user_id }`

### `GET /dashboard/{email}` ✅
- [x] Fetch User from Supabase
- [x] Query matching CivicEvents by interests + attributes
- [x] Return: sorted list by urgency

---

## Phase 5: End-to-End Test
**Goal:** Verify the full flow works - COMPLETE

- [x] Seeded sample data in Supabase
- [x] Tested: onboard → confirm → dashboard
- [x] Verified events appear for test user
- [x] Interest matching working (7/10 events matched for test user)

---

## Execution Order

| Phase | Task | Priority |
|-------|------|----------|
| 1D | Set up Supabase civic_events table | NOW |
| 1A | Scrape SF Board of Supervisors | NOW |
| 2 | Nyne.ai integration | NOW |
| 4 | FastAPI endpoints (with mocks first) | NEXT |
| 3 | Hyperspell setup | NEXT |
| 1B-1C | Additional scrapers | IF TIME |
| 5 | E2E test | FINAL |

---

## Environment Variables Needed
```
SUPABASE_URL=
SUPABASE_KEY=
NYNE_API_KEY=
HYPERSPELL_API_KEY=
OPENAI_API_KEY=  # for LLM parsing if needed
```
