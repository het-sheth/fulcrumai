"""
Hyperspell Service - Memory Search Integration

Provides search functionality for user memories connected via OAuth.
Use as a tool in AI/LLM calls for context-aware responses.
"""
import os
from typing import Optional
from hyperspell import Hyperspell

from ..config import HYPERSPELL_API_KEY


def search_memories(user_id: str, query: str, answer: bool = True):
    """
    Search through user's connected memories.

    Args:
        user_id: The user's email (used as their Hyperspell ID)
        query: The search query - phrase as a question for best results
        answer: If True, returns AI-generated answer. If False, returns raw documents.

    Returns:
        Response with:
        - answer: AI-generated answer from memories (when answer=True)
        - documents: Source documents that matched the query
    """
    if not HYPERSPELL_API_KEY:
        raise ValueError("HYPERSPELL_API_KEY not configured")

    client = Hyperspell(
        api_key=HYPERSPELL_API_KEY,
        user_id=user_id
    )

    response = client.memories.search(
        query=query,
        answer=answer
    )

    return response


# Tool definition for OpenAI function calling
HYPERSPELL_TOOL_OPENAI = {
    "type": "function",
    "function": {
        "name": "search_memories",
        "description": (
            "Search through the user's connected memories including emails, Slack messages, "
            "and documents. Use this tool BEFORE answering questions that might require "
            "information from the user's personal or work data. Phrase your query as a "
            "question for best results."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search query to find relevant memories"
                }
            },
            "required": ["query"]
        }
    }
}


# Tool definition for Anthropic/Claude
HYPERSPELL_TOOL_ANTHROPIC = {
    "name": "search_memories",
    "description": (
        "Search through the user's connected memories including emails, Slack messages, "
        "and documents. Use this tool BEFORE answering questions that might require "
        "information from the user's personal or work data. Phrase your query as a "
        "question for best results."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The search query to find relevant memories"
            }
        },
        "required": ["query"]
    }
}


async def handle_tool_call(user_id: str, tool_name: str, arguments: dict) -> Optional[dict]:
    """
    Handle a tool call from an LLM.

    Usage with OpenAI:
        for tool_call in response.choices[0].message.tool_calls:
            if tool_call.function.name == "search_memories":
                args = json.loads(tool_call.function.arguments)
                result = await handle_tool_call(user_email, "search_memories", args)

    Usage with Anthropic:
        for block in response.content:
            if block.type == "tool_use" and block.name == "search_memories":
                result = await handle_tool_call(user_email, block.name, block.input)
    """
    if tool_name == "search_memories":
        query = arguments.get("query", "")
        result = search_memories(user_id, query, answer=True)
        return {
            "answer": getattr(result, "answer", None),
            "documents": [
                {"title": doc.title, "text": doc.text}
                for doc in getattr(result, "documents", [])
            ]
        }
    return None
