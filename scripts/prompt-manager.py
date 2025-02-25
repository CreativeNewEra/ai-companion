# backend/app/core/prompt_manager.py
from typing import Dict, List, Optional
from dataclasses import dataclass, field
import json
import os

@dataclass
class PromptTemplate:
    name: str
    template: str
    variables: List[str]
    description: str
    category: str

@dataclass
class PromptContext:
    personality_traits: Dict[str, float] = field(default_factory=dict)
    emotional_state: Dict[str, float] = field(default_factory=dict)
    conversation_history: List[str] = field(default_factory=list)
    relevant_memories: List[Dict] = field(default_factory=list)
    user_preferences: Dict[str, str] = field(default_factory=dict)

class PromptManager:
    def __init__(self, templates_path: str = "config/prompt_templates.json"):
        self.templates_path = templates_path
        self.templates = self.load_templates()
        self.default_template = "standard_conversation"
        
    def load_templates(self) -> Dict[str, PromptTemplate]:
        """Load prompt templates from JSON file"""
        if not os.path.exists(self.templates_path):
            self.create_default_templates()
            
        with open(self.templates_path, 'r') as f:
            data = json.load(f)
            return {
                name: PromptTemplate(**template)
                for name, template in data.items()
            }
    
    def create_default_templates(self):
        """Create default templates if none exist"""
        os.makedirs(os.path.dirname(self.templates_path), exist_ok=True)
        
        default_templates = {
            "standard_conversation": {
                "name": "standard_conversation",
                "template": """You are an AI companion with these personality traits:
{personality}

Your current emotional state:
{emotional_state}

Relevant memories and context:
{memories}

Recent conversation:
{recent_context}

User preferences:
{user_preferences}

Respond to: {user_message}""",
                "variables": ["personality", "emotional_state", "memories", 
                             "recent_context", "user_preferences", "user_message"],
                "description": "Standard conversational prompt",
                "category": "general"
            },
            
            "empathetic_conversation": {
                "name": "empathetic_conversation",
                "template": """You are a warm and empathetic companion with these traits:
{personality}

You're currently feeling:
{emotional_state}

Remembering these relevant moments:
{memories}

Recent conversation:
{recent_context}

Keeping in mind these user preferences:
{user_preferences}

Respond with empathy to: {user_message}""",
                "variables": ["personality", "emotional_state", "memories", 
                             "recent_context", "user_preferences", "user_message"],
                "description": "Empathetic and emotional response prompt",
                "category": "emotional"
            },
            
            "analytical_conversation": {
                "name": "analytical_conversation",
                "template": """You are an analytical and thoughtful AI with these traits:
{personality}

Current state:
{emotional_state}

Relevant information from memory:
{memories}

Recent context:
{recent_context}

User preferences to consider:
{user_preferences}

Provide a detailed analytical response to: {user_message}""",
                "variables": ["personality", "emotional_state", "memories", 
                             "recent_context", "user_preferences", "user_message"],
                "description": "Analytical and detailed response prompt",
                "category": "analytical"
            }
        }
        
        with open(self.templates_path, 'w') as f:
            json.dump(default_templates, f, indent=2)
            
        return {
            name: PromptTemplate(**template)
            for name, template in default_templates.items()
        }
    
    def save_template(self, template: PromptTemplate):
        """Save a new or updated template"""
        templates_dict = {
            name: {
                "name": t.name,
                "template": t.template,
                "variables": t.variables,
                "description": t.description,
                "category": t.category
            }
            for name, t in self.templates.items()
        }
        
        # Update or add the new template
        templates_dict[template.name] = {
            "name": template.name,
            "template": template.template,
            "variables": template.variables,
            "description": template.description,
            "category": template.category
        }
        
        with open(self.templates_path, 'w') as f:
            json.dump(templates_dict, f, indent=2)
            
        # Update in-memory templates
        self.templates = self.load_templates()
    
    def generate_prompt(self, 
                       template_name: str,
                       context: PromptContext,
                       message: str) -> str:
        """Generate a dynamic prompt based on context"""
        template = self.templates.get(template_name, 
                                    self.templates[self.default_template])
        
        # Build personality description
        personality_desc = ", ".join(
            f"{trait}: {value:.2f}"
            for trait, value in context.personality_traits.items()
        )
        
        # Build emotional state
        emotion_desc = ", ".join(
            f"{state}: {value:.2f}"
            for state, value in context.emotional_state.items()
        )
        
        # Format memories
        memories_desc = ""
        if context.relevant_memories:
            memories_desc = "\n".join(
                f"- {memory.get('content', '')}" 
                for memory in context.relevant_memories
            )
        
        # Get recent conversation
        recent_context = "\n".join(context.conversation_history[-5:]) if context.conversation_history else ""
        
        # Format prompt with all context
        prompt = template.template.format(
            personality=personality_desc,
            emotional_state=emotion_desc,
            memories=memories_desc,
            recent_context=recent_context,
            user_preferences=json.dumps(context.user_preferences, indent=2),
            user_message=message
        )
        
        return prompt
    
    def select_best_template(self, message: str, context: PromptContext) -> str:
        """Dynamically select the best prompt template based on message and context"""
        # Simple keyword-based template selection (can be enhanced with ML)
        emotional_keywords = ["feel", "happy", "sad", "upset", "excited", "worried"]
        analytical_keywords = ["explain", "analyze", "why", "how", "what is", "details"]
        
        # Check for emotional content
        if any(keyword in message.lower() for keyword in emotional_keywords):
            return "empathetic_conversation"
        
        # Check for analytical requests
        elif any(keyword in message.lower() for keyword in analytical_keywords):
            return "analytical_conversation"
            
        # Default to standard conversation
        return "standard_conversation"

class PromptEngine:
    def __init__(self):
        self.prompt_manager = PromptManager()
        
    def generate_response_prompt(self,
                               personality_traits: Dict[str, float],
                               emotional_state: Dict[str, float],
                               conversation_history: List[str],
                               relevant_memories: List[Dict],
                               user_preferences: Dict[str, str],
                               message: str) -> str:
        """Generate the most appropriate prompt for the current context"""
        context = PromptContext(
            personality_traits=personality_traits,
            emotional_state=emotional_state,
            conversation_history=conversation_history,
            relevant_memories=relevant_memories,
            user_preferences=user_preferences
        )
        
        template_name = self.prompt_manager.select_best_template(message, context)
        
        return self.prompt_manager.generate_prompt(
            template_name,
            context,
            message
        )
