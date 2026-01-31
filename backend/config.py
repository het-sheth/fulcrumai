"""
Configuration for Fulcrum.ai Backend
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://voinyofgowlphehfxfnm.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")  # Set via environment

# Nyne.ai
NYNE_API_KEY = os.getenv("NYNE_API_KEY", "")
NYNE_API_SECRET = os.getenv("NYNE_API_SECRET", "")

# Hyperspell
HYPERSPELL_API_KEY = os.getenv("HYPERSPELL_API_KEY", "")

# OpenAI (for text parsing)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
