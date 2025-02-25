"""
Conversation Engine
Manages the conversation flow between the user and AI companion
"""

import logging
import json
import time
from typing import Dict, Any, List, Optional, Union, Generator
import asyncio
from datetime import datetime

from .model_manager import ModelManager
from .personality import PersonalitySystem
from .memory import MemorySystem

logger = logging.getLogger("ai_companion.conversation")

class ConversationEngine:
    """
    Manages the conversation flow between the user and AI companion
    """
    
    def __init__(
        self,
        model_manager: ModelManager,
        personality_system: PersonalitySystem,
        memory_system: MemorySystem
    ):
        """
        Initialize the conversation engine
        
        Args:
            model_manager: Model manager instance
            personality_system: Personality system instance
            memory_system: Memory system instance
        """
        self.model_manager = model_manager
        self.personality_system = personality_system
        self.memory_system = memory_system
        
        logger.info("Initialized ConversationEngine")
    
    async def process_message(
        self,
        message: str,
        model_id: Optional[str] = None,
        stream: bool = False,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """
        Process a user message and generate a response
        
        Args:
            message: User message
            model_id: Optional model ID to use
            stream: Whether to stream the response
            temperature: Sampling temperature
            
        Returns:
            Dictionary with response and metadata
        """
        start_time = time.time()
        
        # Update personality and emotion based on the message
        personality, emotion = self.personality_system.update_from_message(message)
        
        # Process message in memory system
        memory_result = self.memory_system.process_message(message, is_user=True)
        
        # Get conversation context
        context = self.memory_system.get_conversation_context(message_count=5)
        
        # Get system prompt based on personality and emotion
        system_prompt = self.personality_system.get_system_prompt()
        
        # Construct the full prompt
        full_prompt = f"""
Previous conversation:
{context}

User: {message}

Remember any facts or preferences the user has shared. Respond in a helpful, engaging, and natural way.
"""
        
        # Generate response
        try:
            if stream:
                # For streaming, we'll return a generator
                response_generator = self.model_manager.generate_text(
                    prompt=full_prompt,
                    model=model_id,
                    system_prompt=system_prompt,
                    stream=True,
                    temperature=temperature
                )
                
                # We'll handle streaming at the API level
                return {
                    "response_generator": response_generator,
                    "personality": personality,
                    "emotion": emotion,
                    "processing_time": time.time() - start_time
                }
            else:
                # For non-streaming, get the full response
                response_data = self.model_manager.generate_text(
                    prompt=full_prompt,
                    model=model_id,
                    system_prompt=system_prompt,
                    stream=False,
                    temperature=temperature
                )
                
                ai_response = response_data.get("response", "I'm not sure how to respond to that.")
                
                # Process AI response in memory system
                self.memory_system.process_message(ai_response, is_user=False)
                
                return {
                    "response": ai_response,
                    "personality": personality,
                    "emotion": emotion,
                    "processing_time": time.time() - start_time,
                    "model_used": model_id or self.model_manager.get_default_model()
                }
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return {
                "response": "I'm having trouble processing that right now. Could you try again?",
                "personality": personality,
                "emotion": emotion,
                "error": str(e),
                "processing_time": time.time() - start_time
            }
    
    async def generate_image(
        self,
        prompt: str,
        model_id: Optional[str] = None,
        negative_prompt: Optional[str] = None,
        width: int = 512,
        height: int = 512
    ) -> Dict[str, Any]:
        """
        Generate an image based on a prompt
        
        Args:
            prompt: Image generation prompt
            model_id: Optional model ID to use
            negative_prompt: Things to avoid in the generated image
            width: Image width
            height: Image height
            
        Returns:
            Dictionary with image data and metadata
        """
        start_time = time.time()
        
        try:
            # Generate image
            image_data = self.model_manager.generate_image(
                prompt=prompt,
                model=model_id,
                negative_prompt=negative_prompt,
                width=width,
                height=height
            )
            
            # Add to memory as a special message type
            self.memory_system.add_message(
                content=f"Generated image with prompt: {prompt}",
                is_user=False,
                importance=0.7
            )
            
            return {
                "image": image_data.get("image", ""),
                "prompt": prompt,
                "negative_prompt": negative_prompt,
                "width": width,
                "height": height,
                "model_used": model_id or self.model_manager.get_default_model("image"),
                "generation_time": time.time() - start_time
            }
        except Exception as e:
            logger.error(f"Error generating image: {str(e)}")
            return {
                "error": str(e),
                "prompt": prompt,
                "generation_time": time.time() - start_time
            }
    
    def get_conversation_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the conversation
        
        Returns:
            Dictionary with conversation statistics
        """
        memory_summary = self.memory_system.get_memory_summary()
        
        return {
            "message_count": memory_summary.get("message_count", 0),
            "user_message_count": memory_summary.get("user_message_count", 0),
            "ai_message_count": memory_summary.get("ai_message_count", 0),
            "fact_count": memory_summary.get("fact_count", 0),
            "personality": self.personality_system.get_personality(),
            "emotion": self.personality_system.get_emotion()
        }
