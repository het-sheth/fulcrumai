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
