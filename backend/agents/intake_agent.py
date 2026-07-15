"""
Intake Agent  Cleans and normalizes complaint text.
Responsibilities:
    - Remove unnecessary characters
    - Fix formatting issues
    - Standardize input for downstream agents
"""

from langchain_groq import ChatGroq
from backend.database.config import settings
from backend.utils.logger import setup_logger

logger = setup_logger(__name__)


def run_intake_agent(complaint_text: str) -> str:
    """
    Clean and normalize the complaint text using Gemini.
    Args:
        complaint_text: Raw complaint description from the user.
    Returns:
        Cleaned and standardized complaint text.
    """
    logger.info("Intake Agent: Processing complaint text...")
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=settings.GROQ_API_KEY,
        temperature=0.1,
    )
    prompt = f"""You are a text preprocessing agent. Your job is to clean and normalize the following complaint text.
Instructions:
- Fix spelling and grammar errors
- Remove unnecessary special characters and extra whitespace
- Preserve the original meaning completely
- Do NOT add any new information or change the intent
- Return ONLY the cleaned text, nothing else
Complaint Text:
{complaint_text}
Cleaned Text:"""
    response = llm.invoke(prompt)
    cleaned = response.content.strip()
    logger.info("Intake Agent: Text cleaned successfully.")
    return cleaned
