"""
Test Nyne.ai enrichment with real API calls.

Uses all 3 Nyne endpoints:
1. /person/enrichment - Profile, career, education, posts
2. /person/interactions - Twitter following (psychographic)
3. /person/articlesearch - Press mentions
"""
import asyncio
import pytest
import json
import os
from datetime import datetime
from pathlib import Path

# Load .env BEFORE importing nyne module (which reads env vars at import time)
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path, override=True)

# Add parent directory to path for imports
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

# Now set the env vars in the nyne module directly
import services.nyne as nyne_module
nyne_module.NYNE_API_KEY = os.getenv('NYNE_API_KEY')
nyne_module.NYNE_API_SECRET = os.getenv('NYNE_API_SECRET')

# Verify env vars are loaded
print(f"NYNE_API_KEY set: {bool(nyne_module.NYNE_API_KEY)}")
print(f"NYNE_API_SECRET set: {bool(nyne_module.NYNE_API_SECRET)}")

from services.nyne import enrich_profile
from services.llm_enrichment import generate_quick_interests, generate_civic_profile


# Test data
TEST_EMAIL = ""
TEST_LINKEDIN = "https://www.linkedin.com/in/garrytan/"

@pytest.mark.asyncio
async def test_nyne_enrichment_real():
    """
    Test real Nyne API call with email + LinkedIn.
    This test requires NYNE_API_KEY and NYNE_API_SECRET to be set.
    """
    print(f"\n{'='*60}")
    print(f"Testing Nyne Enrichment")
    print(f"Email: {TEST_EMAIL}")
    print(f"LinkedIn: {TEST_LINKEDIN}")
    print(f"{'='*60}\n")

    # Call the enrichment API
    result = await enrich_profile(
        email=TEST_EMAIL,
        linkedin_url=TEST_LINKEDIN
    )

    # Print results in a readable format
    print("\n" + "="*60)
    print("ENRICHMENT RESULTS")
    print("="*60)

    # Basic Info
    print("\n📋 BASIC INFO")
    print(f"  Full Name: {result.get('full_name')}")
    print(f"  Email Verified: {result.get('email_verified')}")
    print(f"  Phone: {result.get('phone')}")
    print(f"  Photo: {result.get('profile_photo')}")
    print(f"  Birthday: {result.get('birthday')}")

    # Professional
    print("\n💼 PROFESSIONAL")
    print(f"  Profession: {result.get('profession')}")
    print(f"  Company: {result.get('company')}")
    print(f"  Industry: {result.get('industry')}")
    print(f"  Seniority: {result.get('seniority')}")
    print(f"  Years Experience: {result.get('years_experience')}")

    # Location
    print("\n📍 LOCATION")
    print(f"  Location: {result.get('likely_location')}")
    print(f"  City: {result.get('city')}")
    print(f"  State: {result.get('state')}")
    print(f"  Country: {result.get('country')}")
    print(f"  Timezone: {result.get('timezone')}")

    # Headline & Bio
    print("\n📝 HEADLINE & BIO")
    print(f"  Headline: {result.get('headline')}")
    bio = result.get('bio') or ""
    if bio:
        print(f"  Bio: {bio[:200]}..." if len(bio) > 200 else f"  Bio: {bio}")

    # Social Profiles
    print("\n🔗 SOCIAL PROFILES")
    social = result.get('social_profiles', {})
    if isinstance(social, dict):
        for platform, url in social.items():
            if url and platform != 'other':
                print(f"  {platform.capitalize()}: {url}")
        if social.get('other'):
            print(f"  Other: {social['other']}")

    # Work History
    print("\n💼 WORK HISTORY")
    work_history = result.get('work_history', [])
    for i, job in enumerate(work_history[:5], 1):
        if isinstance(job, dict):
            print(f"  {i}. {job.get('title')} @ {job.get('company')}")
            if job.get('start_date'):
                print(f"     {job.get('start_date')} - {job.get('end_date') or 'Present'}")

    # Education
    print("\n🎓 EDUCATION")
    education = result.get('education', [])
    for i, edu in enumerate(education[:3], 1):
        if isinstance(edu, dict):
            print(f"  {i}. {edu.get('school')}")
            if edu.get('degree'):
                print(f"     {edu.get('degree')} in {edu.get('field_of_study')}")

    # Skills
    print("\n🛠️ SKILLS")
    skills = result.get('skills', [])
    if skills:
        print(f"  {', '.join(skills[:15])}")

    # Languages
    print("\n🌐 LANGUAGES")
    languages = result.get('languages', [])
    if languages:
        print(f"  {', '.join(languages)}")

    # Recommendations
    print("\n⭐ RECOMMENDATIONS")
    recommendations = result.get('recommendations', [])
    for i, rec in enumerate(recommendations[:3], 1):
        if isinstance(rec, dict):
            print(f"  {i}. From: {rec.get('recommender')}")
            text = rec.get('text') or ""
            if text:
                print(f"     \"{text[:100]}...\"" if len(text) > 100 else f"     \"{text}\"")

    # Volunteering & Causes
    print("\n🤝 VOLUNTEERING & CAUSES")
    volunteering = result.get('volunteering', [])
    for vol in volunteering[:3]:
        if isinstance(vol, dict):
            print(f"  - {vol.get('role')} @ {vol.get('organization')}")
    causes = result.get('causes', [])
    if causes:
        print(f"  Causes: {', '.join(causes[:5])}")

    # Twitter Following (Psychographic)
    print("\n🐦 TWITTER FOLLOWING (Psychographic)")
    twitter_following = result.get('twitter_following', [])
    if twitter_following:
        print(f"  Following {len(twitter_following)} accounts:")
        for acc in twitter_following[:10]:
            if isinstance(acc, dict):
                handle = acc.get('handle') or acc.get('name')
                bio = acc.get('bio') or ""
                print(f"    @{handle}: {bio[:50]}..." if len(bio) > 50 else f"    @{handle}: {bio}")
    else:
        print("  (No Twitter following data)")

    # Press Mentions
    print("\n📰 PRESS MENTIONS")
    press = result.get('press_mentions', [])
    if press:
        for article in press[:5]:
            if isinstance(article, dict):
                print(f"  - {article.get('title')}")
                print(f"    Source: {article.get('source')} | {article.get('date')}")
    else:
        print("  (No press mentions found)")

    # Recent Posts
    print("\n📱 RECENT POSTS")
    posts = result.get('recent_posts', [])
    if posts:
        for post in posts[:5]:
            if isinstance(post, dict):
                platform = post.get('platform', 'unknown')
                content = post.get('content') or ""
                print(f"  [{platform}] {content[:100]}..." if len(content) > 100 else f"  [{platform}] {content}")
    else:
        print("  (No recent posts found)")

    # Inferred Interests
    print("\n🎯 INFERRED CIVIC INTERESTS")
    interests = result.get('interests', [])
    if interests:
        print(f"  {', '.join(interests)}")

    # Metadata
    print("\n📊 METADATA")
    print(f"  Confidence Score: {result.get('confidence_score')}")
    print(f"  Data Source: {result.get('data_source')}")

    # Assertions
    assert result is not None, "Result should not be None"
    assert isinstance(result, dict), "Result should be a dictionary"

    # If we got real data (not mock), verify we have some fields
    if result.get('data_source') == 'nyne_api':
        print("\n✅ Got real Nyne API data!")
    else:
        print(f"\n⚠️ Using fallback data source: {result.get('data_source')}")

    # === LLM ENRICHMENT ===
    print("\n" + "="*60)
    print("🤖 LLM CIVIC ANALYSIS")
    print("="*60)

    # Quick interests (fast, structured)
    print("\nGenerating quick interests with LLM...")
    quick_result = await generate_quick_interests(result)

    if quick_result and quick_result.get("success"):
        print("\n📍 LLM-INFERRED CIVIC INTERESTS:")
        print(f"  Primary: {quick_result.get('primary_interests', [])}")
        print(f"  Secondary: {quick_result.get('secondary_interests', [])}")
        print(f"  Engagement Level: {quick_result.get('engagement_level')}")
        print(f"  Summary: {quick_result.get('summary')}")

        if quick_result.get("likely_stance"):
            print("\n  Likely Stances:")
            for topic, stance in quick_result.get("likely_stance", {}).items():
                print(f"    {topic}: {stance}")

        # Save LLM results
        result["llm_quick_interests"] = quick_result
    else:
        print(f"  ⚠️ Quick interests failed: {quick_result}")

    # Full civic profile (slower, comprehensive)
    print("\nGenerating full civic profile with LLM...")
    civic_result = await generate_civic_profile(result)

    if civic_result and civic_result.get("success"):
        print("\n📋 FULL CIVIC ANALYSIS:")
        print("-" * 40)
        analysis = civic_result.get("civic_analysis", "")
        # Print first 2000 chars
        print(analysis[:2000])
        if len(analysis) > 2000:
            print(f"\n... [truncated, full analysis is {len(analysis)} chars]")

        result["llm_civic_profile"] = civic_result
    else:
        print(f"  ⚠️ Civic profile failed: {civic_result}")

    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60)

    return result


@pytest.mark.asyncio
async def test_nyne_email_only():
    """Test enrichment with email only (no LinkedIn)."""
    print(f"\n{'='*60}")
    print(f"Testing Email-Only Enrichment")
    print(f"Email: {TEST_EMAIL}")
    print(f"{'='*60}\n")

    result = await enrich_profile(email=TEST_EMAIL)

    print(f"Full Name: {result.get('full_name')}")
    print(f"Profession: {result.get('profession')}")
    print(f"Location: {result.get('likely_location')}")
    print(f"Interests: {result.get('interests')}")

    assert result is not None
    return result


def run_test():
    """Run the test directly (not via pytest)."""
    print(f"\n🚀 Running Nyne Enrichment Test")
    print(f"Time: {datetime.now().isoformat()}")

    result = asyncio.run(test_nyne_enrichment_real())

    # Save full result including raw_data for debugging
    output_file = Path(__file__).parent / "nyne_test_output.json"
    with open(output_file, 'w') as f:
        json.dump(result, f, indent=2, default=str)
    print(f"\n📁 Full results saved to: {output_file}")

    # Also print raw_data separately for debugging
    raw_data = result.get('raw_data', {})
    if raw_data:
        print("\n" + "="*60)
        print("RAW NYNE API RESPONSE")
        print("="*60)
        print(json.dumps(raw_data, indent=2, default=str)[:3000])

    return result


if __name__ == "__main__":
    run_test()
