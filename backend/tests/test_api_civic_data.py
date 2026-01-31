"""
Tests for API endpoints returning civic/legislative data.
Verifies the API correctly surfaces laws, bills, city meetings, and civic events.
"""
import pytest
import os
import sys

# Setup path for imports
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
parent_dir = os.path.dirname(backend_dir)
sys.path.insert(0, parent_dir)

from fastapi.testclient import TestClient
from dotenv import load_dotenv

load_dotenv(os.path.join(backend_dir, ".env"))

# Import using package name
from backend.main import app

client = TestClient(app)


class TestDashboardEndpoint:
    """Test GET /dashboard/{email} returns civic event data"""

    def test_dashboard_returns_200_for_existing_user(self):
        """Verify dashboard returns 200 for known user"""
        response = client.get("/dashboard/test@anthropic.com")
        assert response.status_code == 200

    def test_dashboard_returns_404_for_unknown_user(self):
        """Verify dashboard returns 404 for non-existent user"""
        response = client.get("/dashboard/nonexistent_user_xyz@example.com")
        assert response.status_code == 404

    def test_dashboard_returns_user_profile(self):
        """Verify dashboard response contains user profile"""
        response = client.get("/dashboard/test@anthropic.com")
        data = response.json()

        assert "user" in data
        assert data["user"]["email"] == "test@anthropic.com"
        assert "interests" in data["user"]

    def test_dashboard_returns_civic_events(self):
        """Verify dashboard returns civic events list"""
        response = client.get("/dashboard/test@anthropic.com")
        data = response.json()

        assert "events" in data
        assert isinstance(data["events"], list)
        assert len(data["events"]) > 0, "Expected at least one civic event"

    def test_dashboard_returns_match_explanation(self):
        """Verify dashboard includes match explanation"""
        response = client.get("/dashboard/test@anthropic.com")
        data = response.json()

        assert "match_explanation" in data
        assert len(data["match_explanation"]) > 0


class TestCivicEventData:
    """Test the structure and content of civic event data"""

    def test_events_have_required_fields(self):
        """Verify each event has required fields"""
        response = client.get("/dashboard/test@anthropic.com")
        data = response.json()

        required_fields = ["id", "source_url", "title"]
        for event in data["events"]:
            for field in required_fields:
                assert field in event, f"Event missing required field: {field}"

    def test_events_have_civic_content_fields(self):
        """Verify events have civic content fields (summary, tags, urgency)"""
        response = client.get("/dashboard/test@anthropic.com")
        data = response.json()

        civic_fields = ["summary", "impact_tags", "urgency"]
        for event in data["events"]:
            for field in civic_fields:
                assert field in event, f"Event missing civic field: {field}"

    def test_events_contain_legislative_data(self):
        """Verify at least some events are about laws/legislation"""
        response = client.get("/dashboard/test@anthropic.com")
        data = response.json()

        legislative_keywords = [
            "ordinance", "legislation", "bill", "resolution",
            "vote", "board", "commission", "meeting", "hearing"
        ]

        has_legislative_content = False
        for event in data["events"]:
            title_lower = event["title"].lower()
            summary_lower = (event.get("summary") or "").lower()
            combined = title_lower + " " + summary_lower

            if any(keyword in combined for keyword in legislative_keywords):
                has_legislative_content = True
                break

        assert has_legislative_content, "Expected at least one event with legislative content"

    def test_events_have_valid_urgency_values(self):
        """Verify urgency field has valid values"""
        response = client.get("/dashboard/test@anthropic.com")
        data = response.json()

        valid_urgencies = {"High", "Medium", "Low"}
        for event in data["events"]:
            assert event["urgency"] in valid_urgencies, \
                f"Invalid urgency: {event['urgency']}"

    def test_events_have_impact_tags_as_array(self):
        """Verify impact_tags is an array"""
        response = client.get("/dashboard/test@anthropic.com")
        data = response.json()

        for event in data["events"]:
            tags = event.get("impact_tags")
            assert isinstance(tags, list), "impact_tags should be a list"

    def test_events_cover_civic_topics(self):
        """Verify events cover expected civic topics"""
        response = client.get("/dashboard/test@anthropic.com")
        data = response.json()

        all_tags = set()
        for event in data["events"]:
            all_tags.update(event.get("impact_tags", []))

        # Check for common civic topics
        civic_topics = ["housing", "transportation", "education", "budget",
                       "zoning", "public_safety", "legislation"]

        found_topics = all_tags & set(civic_topics)
        assert len(found_topics) >= 1, \
            f"Expected events to cover civic topics. Found tags: {all_tags}"

    def test_events_have_source_urls(self):
        """Verify events have source URLs for verification"""
        response = client.get("/dashboard/test@anthropic.com")
        data = response.json()

        for event in data["events"]:
            url = event.get("source_url", "")
            assert len(url) > 0, "Event should have source_url"
            assert url.startswith("http"), f"Invalid URL format: {url}"


class TestEventMatching:
    """Test that events match user interests correctly"""

    def test_events_match_user_interests(self):
        """Verify returned events match user's interests"""
        response = client.get("/dashboard/test@anthropic.com")
        data = response.json()

        user_interests = set(data["user"]["interests"])

        # At least some events should have overlapping tags
        matched_events = 0
        for event in data["events"]:
            event_tags = set(event.get("impact_tags", []))
            if user_interests & event_tags:
                matched_events += 1

        assert matched_events > 0, \
            f"Expected events matching user interests {user_interests}"

    def test_high_urgency_events_appear_first(self):
        """Verify high urgency events are prioritized"""
        response = client.get("/dashboard/test@anthropic.com")
        data = response.json()

        events = data["events"]
        if len(events) < 2:
            pytest.skip("Need multiple events to test ordering")

        # Find first high urgency and first low urgency
        urgency_order = {"High": 0, "Medium": 1, "Low": 2}

        for i in range(len(events) - 1):
            current_urgency = urgency_order.get(events[i]["urgency"], 2)
            next_urgency = urgency_order.get(events[i + 1]["urgency"], 2)
            # High urgency should come before lower urgency
            assert current_urgency <= next_urgency, \
                f"Events not sorted by urgency: {events[i]['urgency']} before {events[i + 1]['urgency']}"


class TestOnboardEndpoint:
    """Test POST /onboard endpoint"""

    def test_onboard_returns_200(self):
        """Verify onboard returns 200 for valid input"""
        response = client.post(
            "/onboard",
            json={"email": "newuser@test.com"}
        )
        assert response.status_code == 200

    def test_onboard_returns_inferred_profile(self):
        """Verify onboard returns inferred profile data"""
        response = client.post(
            "/onboard",
            json={"email": "newuser@techcompany.com"}
        )
        data = response.json()

        assert "inferred" in data
        assert "profession" in data["inferred"]
        assert "interests" in data["inferred"]

    def test_onboard_returns_followup_questions(self):
        """Verify onboard returns questions to ask user"""
        response = client.post(
            "/onboard",
            json={"email": "newuser@test.com"}
        )
        data = response.json()

        assert "questions_to_ask" in data
        assert isinstance(data["questions_to_ask"], list)

    def test_onboard_with_linkedin(self):
        """Verify onboard accepts linkedin_url"""
        response = client.post(
            "/onboard",
            json={
                "email": "newuser@test.com",
                "linkedin_url": "https://linkedin.com/in/testuser"
            }
        )
        assert response.status_code == 200


class TestConfirmProfileEndpoint:
    """Test POST /confirm-profile endpoint"""

    def test_confirm_profile_creates_user(self):
        """Verify confirm-profile saves user data"""
        test_email = "pytest_user_123@test.com"

        response = client.post(
            "/confirm-profile",
            json={
                "email": test_email,
                "zip_code": "94110",
                "has_car": False,
                "has_kids": False,
                "profession": "Engineer",
                "interests": ["housing", "technology"]
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data or "id" in data or data.get("success") == True

    def test_confirm_profile_requires_email(self):
        """Verify confirm-profile requires email"""
        response = client.post(
            "/confirm-profile",
            json={
                "zip_code": "94110",
                "interests": ["housing"]
            }
        )
        # Should fail validation
        assert response.status_code == 422


class TestHealthCheck:
    """Test API health"""

    def test_root_or_health_endpoint(self):
        """Verify API has a health/root endpoint"""
        # Try common health endpoints
        for path in ["/", "/health", "/api/health"]:
            response = client.get(path)
            if response.status_code == 200:
                return

        # If no health endpoint, just verify API is running by checking any endpoint
        response = client.get("/dashboard/test@anthropic.com")
        assert response.status_code in [200, 404], "API should be responding"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
