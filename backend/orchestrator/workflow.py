"""
LangGraph Orchestrator  Coordinates the complete AI workflow.
Workflow: Intake → Category → Priority → Assignment → Explanation → Save
Uses LangGraph StateGraph to define the processing pipeline as a
directed acyclic graph.
"""
from typing import TypedDict
from uuid import UUID
from langgraph.graph import StateGraph, END
from sqlalchemy.orm import Session
from backend.models.domain import Domain
from backend.agents.intake_agent import run_intake_agent
from backend.agents.category_agent import run_category_agent
from backend.agents.priority_agent import run_priority_agent
from backend.agents.assignment_agent import run_assignment_agent
from backend.agents.explanation_agent import run_explanation_agent
from backend.utils.logger import setup_logger
logger = setup_logger(__name__)
class ComplaintState(TypedDict):
    """State object passed through the LangGraph workflow."""
    raw_text: str
    title: str
    user_selected_domain: str
    db: Session
    cleaned_text: str
    detected_domain: str
    priority: str
    assignment: dict | None
    explanation: str
    domain_id: UUID | None
    domain_head_id: UUID | None
    error: str | None
def intake_node(state: ComplaintState) -> dict:
    """Node 1: Clean and normalize the complaint text."""
    try:
        cleaned = run_intake_agent(state["raw_text"])
        return {"cleaned_text": cleaned}
    except Exception as e:
        logger.error("Intake Agent failed: %s", str(e))
        return {"cleaned_text": state["raw_text"]}
def category_node(state: ComplaintState) -> dict:
    """Node 2: Detect the complaint domain."""
    try:
        db: Session = state["db"]
        domains = db.query(Domain).all()
        available_domains = [d.domain_name for d in domains]
        if not available_domains:
            return {"detected_domain": state["user_selected_domain"]}
        detected = run_category_agent(state["cleaned_text"], available_domains)
        user_domain = state.get("user_selected_domain", "")
        if user_domain and user_domain != detected:
            logger.info(
                "Category Agent: User selected '%s', but AI corrected it to '%s'.",
                user_domain,
                detected,
            )
        return {"detected_domain": detected}
    except Exception as e:
        logger.error("Category Agent failed: %s", str(e))
        return {"detected_domain": state.get("user_selected_domain", "")}
def priority_node(state: ComplaintState) -> dict:
    """Node 3: Assign priority level."""
    try:
        priority = run_priority_agent(
            state["cleaned_text"], state["detected_domain"]
        )
        return {"priority": priority}
    except Exception as e:
        logger.error("Priority Agent failed: %s", str(e))
        return {"priority": "P3"}
def assignment_node(state: ComplaintState) -> dict:
    """Node 4: Assign complaint to a domain head."""
    try:
        db: Session = state["db"]
        result = run_assignment_agent(state["detected_domain"], db)
        if result:
            return {
                "assignment": result,
                "domain_id": result["domain_id"],
                "domain_head_id": result["domain_head_id"],
            }
        else:
            domain = (
                db.query(Domain)
                .filter(Domain.domain_name == state["detected_domain"])
                .first()
            )
            return {
                "assignment": None,
                "domain_id": domain.id if domain else None,
                "domain_head_id": None,
            }
    except Exception as e:
        logger.error("Assignment Agent failed: %s", str(e))
        return {"assignment": None, "domain_id": None, "domain_head_id": None}
def explanation_node(state: ComplaintState) -> dict:
    """Node 5: Generate AI explanation."""
    try:
        explanation = run_explanation_agent(
            state["cleaned_text"],
            state["detected_domain"],
            state["priority"],
        )
        return {"explanation": explanation}
    except Exception as e:
        logger.error("Explanation Agent failed: %s", str(e))
        return {
            "explanation": f"Assigned priority {state.get('priority', 'P3')} based on complaint analysis."
        }
def build_orchestrator_graph() -> StateGraph:
    """
    Build and compile the LangGraph orchestrator workflow.
    Graph structure:
        intake_agent → category_agent → priority_agent → assignment_agent → explanation_agent → END
    """
    workflow = StateGraph(ComplaintState)
    workflow.add_node("intake_agent", intake_node)
    workflow.add_node("category_agent", category_node)
    workflow.add_node("priority_agent", priority_node)
    workflow.add_node("assignment_agent", assignment_node)
    workflow.add_node("explanation_agent", explanation_node)
    workflow.set_entry_point("intake_agent")
    workflow.add_edge("intake_agent", "category_agent")
    workflow.add_edge("category_agent", "priority_agent")
    workflow.add_edge("priority_agent", "assignment_agent")
    workflow.add_edge("assignment_agent", "explanation_agent")
    workflow.add_edge("explanation_agent", END)
    return workflow.compile()
orchestrator_graph = build_orchestrator_graph()
def run_orchestrator(
    title: str,
    description: str,
    user_selected_domain: str,
    db: Session,
) -> dict:
    """
    Run the complete AI orchestration workflow for a complaint.
    Args:
        title: Complaint title.
        description: Complaint description (raw text from user).
        user_selected_domain: Domain selected by the user.
        db: Database session.
    Returns:
        Dictionary with all AI results:
            - cleaned_text
            - detected_domain
            - priority
            - domain_id
            - domain_head_id
            - explanation
    """
    logger.info("Orchestrator: Starting AI workflow for complaint '%s'...", title)
    initial_state: ComplaintState = {
        "raw_text": f"{title}. {description}",
        "title": title,
        "user_selected_domain": user_selected_domain,
        "db": db,
        "cleaned_text": "",
        "detected_domain": "",
        "priority": "P3",
        "assignment": None,
        "explanation": "",
        "domain_id": None,
        "domain_head_id": None,
        "error": None,
    }
    result = orchestrator_graph.invoke(initial_state)
    logger.info(
        "Orchestrator: Workflow complete. Domain=%s, Priority=%s",
        result.get("detected_domain"),
        result.get("priority"),
    )
    return {
        "cleaned_text": result.get("cleaned_text", ""),
        "detected_domain": result.get("detected_domain", user_selected_domain),
        "priority": result.get("priority", "P3"),
        "domain_id": result.get("domain_id"),
        "domain_head_id": result.get("domain_head_id"),
        "explanation": result.get("explanation", ""),
    }
