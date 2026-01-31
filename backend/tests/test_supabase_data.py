"""
Tests for Supabase data retrieval.
Verifies connection and data access for users and civic_events tables.
"""
import pytest
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from services.supabase_client import (
    get_supabase,
    get_user_by_email,
    get_all_events,
    get_events_by_tags,
)


class TestSupabaseConnection:
    """Test basic Supabase connectivity"""

    def test_supabase_client_initializes(self):
        """Verify we can create a Supabase client"""
        client = get_supabase()
        assert client is not None

    def test_supabase_url_configured(self):
        """Verify Supabase URL is set"""
        url = os.getenv("SUPABASE_URL")
        assert url is not None, "SUPABASE_URL must be set"
        assert "supabase.co" in url

    def test_supabase_key_configured(self):
        """Verify Supabase key is set"""
        key = os.getenv("SUPABASE_KEY")
        assert key is not None, "SUPABASE_KEY must be set"
        assert len(key) > 20, "SUPABASE_KEY appears invalid"


class TestUsersTable:
    """Test users table data retrieval"""

    def test_can_query_users_table(self):
        """Verify we can query the users table"""
        client = get_supabase()
        response = client.table("users").select("*").limit(10).execute()
        assert response is not None
        assert hasattr(response, "data")

    def test_users_table_has_data(self):
        """Verify users table contains at least one record"""
        client = get_supabase()
        response = client.table("users").select("*").limit(10).execute()
        assert response.data is not None
        assert len(response.data) >= 1, "Expected at least 1 user in database"

    def test_user_has_required_fields(self):
        """Verify user records have required fields"""
        client = get_supabase()
        response = client.table("users").select("*").limit(1).execute()

        assert response.data, "No users found"
        user = response.data[0]

        required_fields = ["id", "email"]
        for field in required_fields:
            assert field in user, f"User missing required field: {field}"

    def test_user_has_expected_optional_fields(self):
        """Verify user records have expected optional fields"""
        client = get_supabase()
        response = client.table("users").select("*").limit(1).execute()

        assert response.data, "No users found"
        user = response.data[0]

        optional_fields = ["zip_code", "has_car", "has_kids", "profession", "interests"]
        for field in optional_fields:
            assert field in user, f"User schema missing field: {field}"

    @pytest.mark.asyncio
    async def test_get_user_by_email_returns_user(self):
        """Test get_user_by_email function with existing user"""
        # First get any existing email
        client = get_supabase()
        response = client.table("users").select("email").limit(1).execute()

        if not response.data:
            pytest.skip("No users in database to test")

        email = response.data[0]["email"]
        user = await get_user_by_email(email)

        assert user is not None
        assert user["email"] == email

    @pytest.mark.asyncio
    async def test_get_user_by_email_returns_none_for_nonexistent(self):
        """Test get_user_by_email returns None for non-existent email"""
        user = await get_user_by_email("nonexistent_user_12345@example.com")
        assert user is None


class TestCivicEventsTable:
    """Test civic_events table data retrieval"""

    def test_can_query_civic_events_table(self):
        """Verify we can query the civic_events table"""
        client = get_supabase()
        response = client.table("civic_events").select("*").limit(10).execute()
        assert response is not None
        assert hasattr(response, "data")

    def test_civic_events_table_has_data(self):
        """Verify civic_events table contains records"""
        client = get_supabase()
        response = client.table("civic_events").select("*").limit(10).execute()
        assert response.data is not None
        assert len(response.data) >= 1, "Expected at least 1 civic event in database"

    def test_civic_event_has_required_fields(self):
        """Verify civic event records have required fields"""
        client = get_supabase()
        response = client.table("civic_events").select("*").limit(1).execute()

        assert response.data, "No civic events found"
        event = response.data[0]

        required_fields = ["id", "source_url", "title"]
        for field in required_fields:
            assert field in event, f"Event missing required field: {field}"

    def test_civic_event_has_spec_fields(self):
        """Verify civic events have fields from spec"""
        client = get_supabase()
        response = client.table("civic_events").select("*").limit(1).execute()

        assert response.data, "No civic events found"
        event = response.data[0]

        spec_fields = ["impact_tags", "urgency", "summary"]
        for field in spec_fields:
            assert field in event, f"Event schema missing spec field: {field}"

    def test_civic_event_urgency_valid_values(self):
        """Verify urgency field contains valid values"""
        client = get_supabase()
        response = client.table("civic_events").select("urgency").execute()

        valid_urgencies = {"High", "Medium", "Low", None}
        for event in response.data:
            assert event["urgency"] in valid_urgencies, f"Invalid urgency: {event['urgency']}"

    def test_civic_event_impact_tags_is_array(self):
        """Verify impact_tags is an array"""
        client = get_supabase()
        response = client.table("civic_events").select("impact_tags").limit(5).execute()

        for event in response.data:
            tags = event.get("impact_tags")
            assert tags is None or isinstance(tags, list), "impact_tags should be an array"

    @pytest.mark.asyncio
    async def test_get_all_events_returns_list(self):
        """Test get_all_events returns a list"""
        events = await get_all_events(limit=10)
        assert isinstance(events, list)

    @pytest.mark.asyncio
    async def test_get_all_events_respects_limit(self):
        """Test get_all_events respects limit parameter"""
        events = await get_all_events(limit=3)
        assert len(events) <= 3

    @pytest.mark.asyncio
    async def test_get_events_by_tags_filters_correctly(self):
        """Test get_events_by_tags returns matching events"""
        # First get existing tags
        client = get_supabase()
        response = client.table("civic_events").select("impact_tags").limit(5).execute()

        all_tags = set()
        for event in response.data:
            if event.get("impact_tags"):
                all_tags.update(event["impact_tags"])

        if not all_tags:
            pytest.skip("No tagged events in database")

        # Query with one of the existing tags
        test_tag = list(all_tags)[0]
        events = await get_events_by_tags([test_tag], limit=10)

        # All returned events should have the tag
        for event in events:
            assert test_tag in event.get("impact_tags", []), \
                f"Event returned without matching tag: {event.get('title')}"

    @pytest.mark.asyncio
    async def test_get_events_by_tags_empty_list_returns_empty(self):
        """Test get_events_by_tags with empty tags returns empty list"""
        events = await get_events_by_tags([], limit=10)
        assert events == []


class TestDataIntegrity:
    """Test data integrity and relationships"""

    def test_user_interests_can_match_event_tags(self):
        """Verify user interests can potentially match event impact_tags"""
        client = get_supabase()

        # Get user interests
        users_response = client.table("users").select("interests").execute()
        user_interests = set()
        for user in users_response.data:
            if user.get("interests"):
                user_interests.update(user["interests"])

        # Get event tags
        events_response = client.table("civic_events").select("impact_tags").execute()
        event_tags = set()
        for event in events_response.data:
            if event.get("impact_tags"):
                event_tags.update(event["impact_tags"])

        # There should be some overlap for the system to work
        overlap = user_interests & event_tags
        print(f"\nUser interests: {user_interests}")
        print(f"Event tags: {event_tags}")
        print(f"Overlap: {overlap}")

        # This is a soft check - warn but don't fail
        if not overlap:
            pytest.skip(
                "Warning: No overlap between user interests and event tags. "
                "Dashboard matching may return empty results."
            )


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
