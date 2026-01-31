#!/usr/bin/env python3
"""
Test script for Nyne.ai integration
"""
import asyncio
import json
import os
import sys

# Set API credentials
os.environ["NYNE_API_KEY"] = "b0e550d873f8343599019990b343739e"
os.environ["NYNE_API_SECRET"] = "1da2e75ef901f727"

from services.nyne import enrich_profile, generate_followup_questions


async def test_enrichment(email: str, linkedin_url: str = None):
    print(f"\n{'='*60}")
    print(f"Testing Nyne Enrichment")
    print(f"Email: {email}")
    print(f"LinkedIn: {linkedin_url or 'Not provided'}")
    print(f"{'='*60}\n")

    result = await enrich_profile(email, linkedin_url)

    # Print parsed result (without raw_data for readability)
    display_result = {k: v for k, v in result.items() if k != "raw_data"}
    print("Parsed Profile:")
    print(json.dumps(display_result, indent=2))

    # Print follow-up questions
    questions = generate_followup_questions(result)
    print("\nFollow-up Questions:")
    for i, q in enumerate(questions, 1):
        print(f"  {i}. {q}")

    # Print raw data if available
    if result.get("raw_data"):
        print("\n" + "-"*40)
        print("Raw Nyne Response (truncated):")
        raw_str = json.dumps(result["raw_data"], indent=2)
        if len(raw_str) > 2000:
            print(raw_str[:2000] + "\n... [truncated]")
        else:
            print(raw_str)

    return result


if __name__ == "__main__":
    # Default test - you can override with command line args
    email = sys.argv[1] if len(sys.argv) > 1 else "test@example.com"
    linkedin = sys.argv[2] if len(sys.argv) > 2 else None

    asyncio.run(test_enrichment(email, linkedin))
