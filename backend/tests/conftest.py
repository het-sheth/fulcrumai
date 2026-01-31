"""
Pytest configuration for Fulcrum.ai backend tests.
"""
import pytest
import sys
import os

# Add backend to path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure pytest-asyncio
pytest_plugins = ['pytest_asyncio']


@pytest.fixture(scope="session", autouse=True)
def load_env():
    """Load environment variables before tests"""
    from dotenv import load_dotenv

    # Try multiple locations for .env
    env_paths = [
        os.path.join(os.path.dirname(__file__), '..', '.env'),
        os.path.join(os.path.dirname(__file__), '..', '..', '.env'),
    ]

    for path in env_paths:
        if os.path.exists(path):
            load_dotenv(path)
            break


@pytest.fixture
def supabase_client():
    """Provide a Supabase client for tests"""
    from services.supabase_client import get_supabase
    return get_supabase()
