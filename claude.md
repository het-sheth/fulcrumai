# Fulcrum.ai Backend Specification (FastAPI + Hyperspell + Nyne)

**Goal:** Build a high-velocity backend to match SF citizens with civic events.
**Time Limit:** 2 hours. Focus on "Happy Path" only.

## 1. Stack
* **Language:** Python 3.9+
* **Framework:** FastAPI
* **Database:** supabase
context agent: Hyperspell (https://docs.hyperspell.com/core/introduction)
* **Enrichment:** Nyne.ai API for what you prefer
* **LLM:** OpenAI/Anthropic (via LangChain or direct) for parsing legislation text.

## 2. Data Models (Hyperspell Schema)
We need two core "Nodes" in Hyperspell: `User` and `CivicEvent`.

* **User Object:**
    * `id`: email
    * `attributes`: { "zip_code": "94110", "has_car": true, "has_kids": false, "profession": "tech" }
    * `interests`: ["housing", "ai_safety", "bike_lanes"]

* **CivicEvent Object:**
    * `id`: source_url
    * `title`: "SFMTA Board Meeting - Slow Streets"
    * `impact_tags`: ["traffic", "parking", "families"]
    * `urgency`: "High" (Vote in 48h)
    * `summary`: "Vote to remove parking on Valencia St."

## 3. API Endpoints

### `POST /onboard`
* **Input:** `{ "email": "user@example.com", "linkedin_url": "..." }`
* **Logic:**
    1.  Call **Nyne.ai** with the email/LinkedIn to infer profile.
    2.  Return the inferred JSON to Frontend:
        ```json
        {
          "inferred": {
            "profession": "Software Engineer",
            "likely_location": "San Francisco, SoMa",
            "interests": ["Tech Policy", "Startups"]
          },
          "questions_to_ask": ["Do you own a car?", "Do you rent or own your home?"]
        }
        ```
    3.  *Note:* Do NOT save to Hyperspell yet. Wait for user confirmation.

### `POST /confirm-profile`
* **Input:** Final JSON with user-verified data + answers to questions (e.g., "has_car": true).
* **Logic:** Save/Update `User` node in Hyperspell.

### `GET /dashboard/{email}`
* **Logic:**
    1.  Fetch `User` from Hyperspell.
    2.  Query Hyperspell for `CivicEvents` where `impact_tags` overlap with `User.interests` 
