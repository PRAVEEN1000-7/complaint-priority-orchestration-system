"""
Explanation Agent  Generates a human-readable explanation of the AI decision.
Provides a short explanation of why the complaint received its
assigned priority and domain classification.
"""

from langchain_groq import ChatGroq
from backend.database.config import settings
from backend.utils.logger import setup_logger

logger = setup_logger(__name__)


def run_explanation_agent(cleaned_text: str, domain: str, priority: str) -> str:
    """
    Generate a short explanation for the AI's priority and domain decision.
    Args:
        cleaned_text: Cleaned complaint text.
        domain: The assigned domain.
        priority: The assigned priority (P1-P4).
    Returns:
        A concise explanation string.
    """
    logger.info("Explanation Agent: Generating AI explanation...")
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=settings.GROQ_API_KEY,
        temperature=0.1,
    )
    priority_labels = {
        "P1": "Critical",
        "P2": "High",
        "P3": "Medium",
        "P4": "Low",
    }
    priority_label = priority_labels.get(priority, "Unknown")
    prompt = f"""You are an AI explanation agent. Write a brief, clear explanation (2-3 sentences) describing why this complaint was assigned its priority level and domain.
Complaint Text:
{cleaned_text}
Assigned Domain: {domain}
Assigned Priority: {priority} ({priority_label})
Instructions:
- Explain what factors led to this priority assignment
- Mention relevant urgency, impact, or keyword factors
- Keep the explanation concise and professional
- Do NOT start with "This complaint"  vary your phrasing
Explanation:"""
    response = llm.invoke(prompt)
    explanation = response.content.strip()
    logger.info("Explanation Agent: Explanation generated.")
    return explanation
