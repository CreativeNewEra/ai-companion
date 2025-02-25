"""
API Router
Defines the API endpoints for the AI companion
"""

import logging
import json
import time
from typing import Dict, Any, List, Optional, Union
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query, Body
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import asyncio
from datetime import datetime

from ..core.model_manager import ModelManager
from ..core.personality import PersonalitySystem
from ..core.memory import MemorySystem
from ..core.conversation import ConversationEngine

logger = logging.getLogger("ai_companion.api")

# Models
class Message(BaseModel):
    content: str
    model_id: Optional[str] = None
    stream: bool = False
    temperature: float = Field(0.7, ge=0.0, le=1.0)

class ImagePrompt(BaseModel):
    prompt: str
    model_id: Optional[str] = None
    negative_prompt: Optional[str] = None
    width: int = Field(512, ge=64, le=1024)
    height: int = Field(512, ge=64, le=1024)

class PersonalityUpdate(BaseModel):
    traits: Dict[str, float]

class EmotionUpdate(BaseModel):
    values: Dict[str, float]

# Router
router = APIRouter(prefix="/api")

# Dependencies
def get_model_manager():
    return ModelManager()

def get_personality_system():
    return PersonalitySystem()

def get_memory_system():
    return MemorySystem()

def get_conversation_engine(
    model_manager: ModelManager = Depends(get_model_manager),
    personality_system: PersonalitySystem = Depends(get_personality_system),
    memory_system: MemorySystem = Depends(get_memory_system)
):
    return ConversationEngine(
        model_manager=model_manager,
        personality_system=personality_system,
        memory_system=memory_system
    )

# Routes
@router.get("/models")
async def list_models(model_manager: ModelManager = Depends(get_model_manager)):
    """
    List available AI models
    """
    models = model_manager.list_models()
    return {"models": models}

@router.post("/chat")
async def chat(
    message: Message,
    conversation_engine: ConversationEngine = Depends(get_conversation_engine)
):
    """
    Process a chat message and return a response
    """
    if message.stream:
        # For streaming responses
        async def stream_response():
            response_data = await conversation_engine.process_message(
                message=message.content,
                model_id=message.model_id,
                stream=True,
                temperature=message.temperature
            )
            
            response_generator = response_data.get("response_generator")
            personality = response_data.get("personality", {})
            emotion = response_data.get("emotion", {})
            
            # Stream the response chunks
            for chunk in response_generator:
                # Add personality and emotion to the first chunk
                if "personality" not in chunk:
                    chunk["personality"] = personality
                    chunk["emotion"] = emotion
                
                yield f"data: {json.dumps(chunk)}\n\n"
            
            yield "data: [DONE]\n\n"
        
        return StreamingResponse(
            stream_response(),
            media_type="text/event-stream"
        )
    else:
        # For regular responses
        response_data = await conversation_engine.process_message(
            message=message.content,
            model_id=message.model_id,
            stream=False,
            temperature=message.temperature
        )
        
        return response_data

@router.post("/images/generate")
async def generate_image(
    prompt: ImagePrompt,
    conversation_engine: ConversationEngine = Depends(get_conversation_engine)
):
    """
    Generate an image based on a text prompt
    """
    image_data = await conversation_engine.generate_image(
        prompt=prompt.prompt,
        model_id=prompt.model_id,
        negative_prompt=prompt.negative_prompt,
        width=prompt.width,
        height=prompt.height
    )
    
    if "error" in image_data:
        raise HTTPException(status_code=500, detail=image_data["error"])
    
    return image_data

@router.get("/personality/current")
async def get_personality_current(
    personality_system: PersonalitySystem = Depends(get_personality_system)
):
    """
    Get the current personality state of the AI companion
    """
    return personality_system.get_personality()

@router.post("/personality/update")
async def update_personality(
    update: PersonalityUpdate,
    personality_system: PersonalitySystem = Depends(get_personality_system)
):
    """
    Update the personality traits of the AI companion
    """
    updated_personality = personality_system.update_personality(update.traits)
    return updated_personality

@router.get("/emotions/current")
async def get_emotions_current(
    personality_system: PersonalitySystem = Depends(get_personality_system)
):
    """
    Get the current emotional state of the AI companion
    """
    return personality_system.get_emotion()

@router.post("/emotions/update")
async def update_emotions(
    update: EmotionUpdate,
    personality_system: PersonalitySystem = Depends(get_personality_system)
):
    """
    Update the emotional state of the AI companion
    """
    updated_emotion = personality_system.update_emotion(update.values)
    return updated_emotion

@router.get("/messages")
async def get_messages(
    limit: int = Query(10, ge=1, le=100),
    memory_system: MemorySystem = Depends(get_memory_system)
):
    """
    Get message history
    """
    messages = memory_system.get_recent_messages(limit=limit)
    
    # Format messages for the frontend
    formatted_messages = []
    for msg in messages:
        formatted_messages.append({
            "id": str(msg["id"]),
            "content": msg["content"],
            "isUser": bool(msg["is_user"]),
            "timestamp": msg["timestamp"],
            "status": "sent"
        })
    
    return formatted_messages

@router.get("/memory/stats")
async def get_memory_stats(
    conversation_engine: ConversationEngine = Depends(get_conversation_engine)
):
    """
    Get memory statistics
    """
    return conversation_engine.get_conversation_stats()

@router.get("/memory/facts")
async def get_facts(
    subject: str = Query("user"),
    memory_system: MemorySystem = Depends(get_memory_system)
):
    """
    Get facts about a subject
    """
    facts = memory_system.get_facts_about(subject)
    return {"facts": facts}

@router.get("/system/prompt")
async def get_system_prompt(
    personality_system: PersonalitySystem = Depends(get_personality_system)
):
    """
    Get the current system prompt
    """
    system_prompt = personality_system.get_system_prompt()
    return {"system_prompt": system_prompt}
