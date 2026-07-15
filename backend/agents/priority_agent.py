"""
Priority Agent  Determines complaint urgency.
Priority Levels:
    - P1  Critical
    - P2  High
    - P3  Medium
    - P4  Low
Factors considered: Urgency, Impact, Keywords
"""

from langchain_groq import ChatGroq
from backend.database.config import settings
from backend.utils.logger import setup_logger

logger = setup_logger(__name__)
VALID_PRIORITIES = ["P1", "P2", "P3", "P4"]


def run_priority_agent(cleaned_text: str, domain: str) -> str:
    """
    Determine the priority level of the complaint.
    Args:
        cleaned_text: Cleaned complaint text.
        domain: The detected domain.
    Returns:
        Priority level string: P1, P2, P3, or P4.
    """
    logger.info("Priority Agent: Assessing complaint priority...")
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=settings.GROQ_API_KEY,
        temperature=0.1,
    )
    prompt = f"""You are a complaint priority assessment agent. Analyze the complaint and assign a priority level.
Priority Levels:
- P1 (Critical): Service outage, safety hazard, emergency situations, affects many users, immediate action required
- P2 (High): Significant issue, important feature broken, affects multiple users, needs prompt attention
- P3 (Medium): Moderate issue, inconvenience, affects some users, can be scheduled
- P4 (Low): Minor issue, cosmetic problem, suggestion, affects few users, low impact
Factors to consider:
- Urgency: How time-sensitive is the complaint?
- Impact: How many people are affected?
- Keywords: Words like "emergency", "broken", "outage", "safety", "dangerous" indicate higher priority
Domain: {domain}
Complaint Text:
{cleaned_text}
Instructions:
- Analyze the complaint based on the factors above
- Return ONLY the priority level (P1, P2, P3, or P4), nothing else
Priority:"""
    response = llm.invoke(prompt)
    priority = response.content.strip().upper()
    if priority in VALID_PRIORITIES:
        logger.info("Priority Agent: Priority assigned  %s", priority)
        return priority
    for p in VALID_PRIORITIES:
        if p in priority:
            logger.info("Priority Agent: Priority extracted  %s", p)
            return p
    logger.warning(
        "Priority Agent: Could not parse priority from '%s'. Defaulting to P3.",
        priority,
    )
    return "P3"
