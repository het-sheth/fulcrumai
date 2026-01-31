This is a highly feasible project. Because you are starting with San Francisco, you have a significant advantage: SF is one of the most "open data" friendly cities in the world.

Below is the technical sourcing strategy, categorized by impact level (Local, State, Federal) and data type (Legislative, Planning, Budgeting).

## I. San Francisco City & County (High Impact)

These are the most actionable sources. A citizen showing up to a Supervisor meeting or Planning hearing has disproportionate influence compared to national politics.

### 1. City Legislation & Board of Supervisors

This is where city laws (ordinances) are drafted and voted on.

**Primary Source:** SF Board of Supervisors Legistar
**URL:** https://sfbos.org/legislative-research-center-lrc

**Data to Scrape:**
- **Calendar:** Upcoming committee meetings (e.g., Land Use, Budget, Rules).
- **Legislation:** Search for "Ordinance" or "Resolution" files in "Introduced" status.
- **Sponsors:** Map bills to specific Supervisors (useful for matching to user's District).

**API Note:** Legistar often has a public API (usually http://webapi.legistar.com). If not, the HTML is very structured and easy to scrape with Python (BeautifulSoup or Selenium).

### 2. Housing, Construction & Zoning (The "NIMBY/YIMBY" Wars)

Most "quality of life" decisions happen here.

**Primary Source:** SF Planning Department "Public Notices"
**URL:** https://sfplanning.org/page/public-notices-project-applications

**Why it matters:** This lists specific addresses under review (Section 311 notices). You can alert a user: "A 5-story building is proposed 2 blocks from your house. Hearing is in 10 days."

**Secondary Source:** SF Planning Commission Hearings
**URL:** https://sfplanning.org/hearings-cpc-grid

**Data:** Weekly agendas for the Planning Commission.

### 3. Schools & Education

**Primary Source:** SFUSD Board of Education (BoardDocs)
**URL:** https://go.boarddocs.com/ca/sfusd/Board.nsf/Public

**Data:** Agendas are posted 72 hours in advance. Look for "Public Comment" sections.

**Tip:** School board politics in SF are intense; this is a high-engagement area for parents.

### 4. Transportation (Muni, Bike Lanes, Parking)

**Primary Source:** SFMTA Board of Directors
**URL:** https://www.sfmta.com/meetings-events

**Data:** Look for "Engineering Public Hearings" (often regarding removing parking spots or adding stop signs).

### 5. Police & Public Safety

**Primary Source:** SF Police Commission
**URL:** https://sf.gov/departments/police-commission

**Data:** Weekly meetings (usually Wednesdays). Key for users interested in police reform or public safety policy.

---

## II. California State Level (Medium Impact)

State politics affect housing laws, AI safety, and climate policy.

### 1. State Bills & Hearings

**Paid API Recommendation:** LegiScan or Open States
**Cost:** LegiScan is affordable (starts ~$25-$100/mo for state-level access).

**Why pay?** Scraping state legislature websites is painful and brittle. LegiScan provides clean JSON for:
- **Bill Text:** Full text of proposed laws.
- **Status:** "In Committee," "Floor Vote," etc.
- **Sponsors:** Which State Senator/Assemblymember proposed it.

**Free Alternative (Dev-friendly):** Open States API
**URL:** https://openstates.org/

**Data:** Excellent GraphQL API for finding bills by subject (e.g., "Housing", "Environment").

---

## III. Federal Level (Low Individual Impact, High Noise)

Harder for one person to shift, but high interest.

### 1. US Congress

**Source:** Congress.gov API
**URL:** https://api.congress.gov/

**Cost:** Free (Official US Gov API).

**Data:** Tracks bills in House and Senate. You can filter by bills sponsored by SF representatives (e.g., Nancy Pelosi, Kevin Mullin).

### 2. Federal Regulations (Public Comments)

**Source:** Regulations.gov API
**URL:** https://open.gsa.gov/api/regulationsgov/

**Data:** This is a "hidden gem." Federal agencies (EPA, FCC, FTC) must accept public comments on new rules.

**Use Case:** "The EPA is deciding on new emission standards. Submit a comment by Friday."

---

## IV. Social & Civil Society (Soft Power)

Where the protests and organizing happen.

### 1. Town Halls & Rallies

**Source:** Mobilize.us (Scraping)
**URL:** https://www.mobilize.us/

**Method:** Filter by Zip Code "941**". This is the standard platform for Democratic/Progressive organizing (phone banks, canvassing, rallies).

**Source:** Eventbrite API
**Filter:** Category "Politics & Government" + Location "San Francisco".

### 2. Real-time Sentiment (Twitter/Reddit)

**Source:** Reddit (r/sanfrancisco, r/bayarea)
**Method:** Use the Reddit API to watch for keywords like "Protest," "City Hall," "Vote," or "Hearing."

**Value:** Often catches "flash" events that aren't on official calendars.

---

## Summary of the "Data Pipeline"

| Domain | Source Name | Tech Strategy | Key Data Point |
|--------|-------------|---------------|----------------|
| City Laws | SF Board of Supervisors (Legistar) | Scrape / API | "File #230123: Zoning Change" |
| Housing | SF Planning Dept | Scrape HTML | "Public Hearing: 123 Main St" |
| Schools | SFUSD BoardDocs | Scrape HTML | "Agenda Item 4: Budget Cut" |
| State Laws | OpenStates / LegiScan | API (JSON) | "SB 423: Housing Streamlining" |
| Fed Laws | Congress.gov | API (JSON) | "HR 1: For the People Act" |
| Activism | Mobilize.us / Reddit | Scrape / API | "Rally at City Hall at 5 PM" |

---

# Fulcrum.ai Frontend Specification (React + Tailwind)

**Goal:** A "Magic" interface. Clean, dark-mode, futuristic (think "Palantir for Citizens").
**Vibe:** High-contrast, serious, data-dense but readable.

## 1. Page Flow

### A. Landing Page ("The Hook")
* **Hero:** "Democracy is decided by those who show up. We tell you where to show up."
* **Action:** Simple input field: [ Enter your Email / LinkedIn ] -> Button: "Analyze My Impact".

### B. The "Mirror" (Onboarding/Verification)
* **State:** Loading spinner saying "Analyzing digital footprint via Nyne.ai..." (Fake a 2s delay for effect).
* **Display:** Show a "Dossier" card.
    * "We found this about you:" [Avatar] [Job Title] [Inferred Neighborhood].
    * **Interaction:** "Is this correct?" [Yes/Edit].
* **The "Gap" Questions:**
    * After verification, slide in 3 cards asking specific lifestyle questions:
    * 1. [Icon: Car] "Do you drive in the city?" (Yes/No)
    * 2. [Icon: House] "Do you rent or own?" (Rent/Own)
    * 3. [Icon: Baby] "Do you have children in SFUSD?" (Yes/No)
* *Why:* This data is critical for the "Parking" and "Zoning" matching logic.

### C. The Dashboard ("The Fulcrum")
* **Layout:** Two columns.
    * **Left (Your Profile):** Small summary of the User + "Civic Strengths" (e.g., "Tech Policy Expert").
    * **Right (The Feed):** A list of "Impact Opportunities."
* **Card Design (Critical for Beauty Award):**
    * **Header:** "URGENT: Vote in 48h" (Red badge).
    * **Title:** "Parking Meter Extension"
    * **Why it matters (AI Gen):** "Because you drive a car and live in Mission, this will cost you ~$400/year."
    * **Action Buttons:** [Read Draft] [Email Supervisor (One-click)] [Ignore].

## 2. Technical Requirements
* **Framework:** Next.js or React (Vite).
* **Styling:** Tailwind CSS. Use "Zinc" or "Slate" colors.
* **Icons:** Lucide-React (use `Gavel`, `Car`, `Building`, `AlertTriangle`).
* **API:** Connects to the FastAPI backend endpoints defined above.

## 3. The "Wow" Factor (Demo Mode)
* When the user answers "Yes" to lifestyle questions, dynamically surface relevant impact opportunities with personalized explanations.

---

# Fulcrum.ai Backend Specification (FastAPI + Hyperspell + Nyne)

**Goal:** Build a high-velocity backend to match SF citizens with civic events.
**Time Limit:** 2 hours. Focus on "Happy Path" only.

## 1. Stack
* **Language:** Python 3.9+
* **Framework:** FastAPI
* **Database:** Hyperspell (https://docs.hyperspell.com/core/introduction)
* **Enrichment:** Nyne.ai API
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
    2.  Query Hyperspell for `CivicEvents` where `impact_tags` overlap with `User.interests` OR `User.attributes` (e.g., if `has_car`=true, match events tagged with "parking" or "traffic").
