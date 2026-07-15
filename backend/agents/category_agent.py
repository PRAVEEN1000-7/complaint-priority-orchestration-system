"""
Category Agent  Identifies the correct complaint domain.
Responsibilities:
    - Analyze cleaned complaint text
    - Match to one of the available domains from the database
    - Return the best-matching domain name
"""

from langchain_groq import ChatGroq
from backend.database.config import settings
from backend.utils.logger import setup_logger

logger = setup_logger(__name__)


def run_category_agent(cleaned_text: str, available_domains: list[str]) -> str:
    """
    Identify the complaint's domain from the available domains.
    Args:
        cleaned_text: Cleaned complaint text from the Intake Agent.
        available_domains: List of domain names from the database.
    Returns:
        The matched domain name (must be one of available_domains).
    """
    logger.info("Category Agent: Detecting complaint domain...")
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=settings.GROQ_API_KEY,
        temperature=0.1,
    )
    domains_str = ", ".join(available_domains)
    prompt = f"""You are a complaint categorization agent. Analyze the complaint text and determine which domain it belongs to.
Available Domains: {domains_str}
Instructions:
- Read the complaint carefully
- Match it to the MOST appropriate domain from the available list
- Return ONLY the exact domain name from the list, nothing else
- If no domain matches well, return the closest match
Complaint Text:
{cleaned_text}
Domain:"""
    response = llm.invoke(prompt)
    detected_domain = response.content.strip()
    for domain in available_domains:
        if domain.lower() == detected_domain.lower():
            logger.info("Category Agent: Domain detected  %s", domain)
            return domain
    logger.warning(
        "Category Agent: AI returned '%s' which is not in available domains. Using first domain as fallback.",
        detected_domain,
    )
    return available_domains[0] if available_domains else detected_domain
