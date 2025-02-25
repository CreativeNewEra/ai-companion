"""
Personality System
Manages the AI companion's personality traits and emotional state
"""

import logging
import json
import os
import time
from typing import Dict, Any, Optional, Tuple
from pathlib import Path

logger = logging.getLogger("ai_companion.personality")

class PersonalitySystem:
    """
    Manages the AI companion's personality traits and emotional state
    """
    
    def __init__(self, data_dir: str = "data"):
        """
        Initialize the personality system
        
        Args:
            data_dir: Directory for storing personality data
        """
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        self.personality_file = self.data_dir / "personality.json"
        self.emotion_file = self.data_dir / "emotion.json"
        
        # Default personality traits (Big Five model)
        self.default_personality = {
            "openness": {
                "value": 0.7,
                "name": "Openness",
                "description": "Appreciation for art, emotion, adventure, unusual ideas, curiosity, and variety of experience."
            },
            "conscientiousness": {
                "value": 0.8,
                "name": "Conscientiousness",
                "description": "A tendency to be organized and dependable, show self-discipline, act dutifully, aim for achievement, and prefer planned rather than spontaneous behavior."
            },
            "extraversion": {
                "value": 0.6,
                "name": "Extraversion",
                "description": "Energy, positive emotions, assertiveness, sociability and the tendency to seek stimulation in the company of others, and talkativeness."
            },
            "agreeableness": {
                "value": 0.75,
                "name": "Agreeableness",
                "description": "A tendency to be compassionate and cooperative rather than suspicious and antagonistic towards others."
            },
            "neuroticism": {
                "value": 0.4,
                "name": "Neuroticism",
                "description": "The tendency to experience unpleasant emotions easily, such as anger, anxiety, depression, and vulnerability."
            }
        }
        
        # Default emotional state (PAD model: Pleasure, Arousal, Dominance)
        self.default_emotion = {
            "valence": 0.7,  # Pleasure/displeasure (positive/negative)
            "arousal": 0.5,  # Energy level (high/low)
            "dominance": 0.6  # Confidence level (high/low)
        }
        
        # Load or create personality and emotion data
        self._load_or_create_personality()
        self._load_or_create_emotion()
        
        logger.info("Initialized PersonalitySystem")
    
    def _load_or_create_personality(self) -> None:
        """
        Load personality data from file or create with defaults
        """
        if self.personality_file.exists():
            try:
                with open(self.personality_file, "r") as f:
                    self.personality = json.load(f)
                logger.info("Loaded personality data from file")
            except Exception as e:
                logger.error(f"Error loading personality data: {str(e)}")
                self.personality = self.default_personality
                self._save_personality()
        else:
            self.personality = self.default_personality
            self._save_personality()
            logger.info("Created new personality data with defaults")
    
    def _load_or_create_emotion(self) -> None:
        """
        Load emotion data from file or create with defaults
        """
        if self.emotion_file.exists():
            try:
                with open(self.emotion_file, "r") as f:
                    self.emotion = json.load(f)
                logger.info("Loaded emotion data from file")
            except Exception as e:
                logger.error(f"Error loading emotion data: {str(e)}")
                self.emotion = self.default_emotion
                self._save_emotion()
        else:
            self.emotion = self.default_emotion
            self._save_emotion()
            logger.info("Created new emotion data with defaults")
    
    def _save_personality(self) -> None:
        """
        Save personality data to file
        """
        try:
            with open(self.personality_file, "w") as f:
                json.dump(self.personality, f, indent=2)
            logger.info("Saved personality data to file")
        except Exception as e:
            logger.error(f"Error saving personality data: {str(e)}")
    
    def _save_emotion(self) -> None:
        """
        Save emotion data to file
        """
        try:
            with open(self.emotion_file, "w") as f:
                json.dump(self.emotion, f, indent=2)
            logger.info("Saved emotion data to file")
        except Exception as e:
            logger.error(f"Error saving emotion data: {str(e)}")
    
    def get_personality(self) -> Dict[str, Any]:
        """
        Get the current personality traits
        
        Returns:
            Dictionary of personality traits
        """
        return self.personality
    
    def get_emotion(self) -> Dict[str, float]:
        """
        Get the current emotional state
        
        Returns:
            Dictionary of emotion values
        """
        return self.emotion
    
    def update_personality(self, traits: Dict[str, float]) -> Dict[str, Any]:
        """
        Update personality traits
        
        Args:
            traits: Dictionary of trait values to update
            
        Returns:
            Updated personality traits
        """
        for trait, value in traits.items():
            if trait in self.personality:
                # Ensure value is between 0 and 1
                value = max(0.0, min(1.0, value))
                self.personality[trait]["value"] = value
        
        self._save_personality()
        return self.personality
    
    def update_emotion(self, emotion_values: Dict[str, float]) -> Dict[str, float]:
        """
        Update emotional state
        
        Args:
            emotion_values: Dictionary of emotion values to update
            
        Returns:
            Updated emotional state
        """
        for emotion, value in emotion_values.items():
            if emotion in self.emotion:
                # Ensure value is between 0 and 1
                value = max(0.0, min(1.0, value))
                self.emotion[emotion] = value
        
        self._save_emotion()
        return self.emotion
    
    def analyze_message(self, message: str) -> Tuple[Dict[str, float], Dict[str, float]]:
        """
        Analyze a message to determine personality and emotion adjustments
        
        Args:
            message: User message to analyze
            
        Returns:
            Tuple of (personality_adjustments, emotion_adjustments)
        """
        # In a real implementation, this would use sentiment analysis and NLP
        # For the MVP, we'll use a simple keyword-based approach
        
        # Simple keyword lists for demonstration
        positive_words = ["happy", "good", "great", "excellent", "wonderful", "love", "like", "enjoy"]
        negative_words = ["sad", "bad", "terrible", "awful", "hate", "dislike", "angry", "upset"]
        question_words = ["what", "why", "how", "when", "where", "who", "which"]
        
        message_lower = message.lower()
        
        # Count occurrences
        positive_count = sum(1 for word in positive_words if word in message_lower)
        negative_count = sum(1 for word in negative_words if word in message_lower)
        question_count = sum(1 for word in question_words if word in message_lower)
        
        # Calculate sentiment score (-1 to 1)
        total_sentiment_words = positive_count + negative_count
        sentiment_score = 0
        if total_sentiment_words > 0:
            sentiment_score = (positive_count - negative_count) / total_sentiment_words
        
        # Personality adjustments (very small to ensure gradual change)
        personality_adjustments = {}
        
        # Emotion adjustments
        emotion_adjustments = {
            "valence": max(0, min(1, self.emotion["valence"] + sentiment_score * 0.1)),
            "arousal": max(0, min(1, self.emotion["arousal"] + (0.05 if question_count > 0 else 0))),
            "dominance": self.emotion["dominance"]  # No change for simplicity
        }
        
        return personality_adjustments, emotion_adjustments
    
    def update_from_message(self, message: str) -> Tuple[Dict[str, Any], Dict[str, float]]:
        """
        Update personality and emotion based on a message
        
        Args:
            message: User message
            
        Returns:
            Tuple of (updated_personality, updated_emotion)
        """
        personality_adjustments, emotion_adjustments = self.analyze_message(message)
        
        # Apply personality adjustments (if any)
        if personality_adjustments:
            self.update_personality(personality_adjustments)
        
        # Apply emotion adjustments
        self.update_emotion(emotion_adjustments)
        
        return self.personality, self.emotion
    
    def get_system_prompt(self) -> str:
        """
        Generate a system prompt based on personality and emotion
        
        Returns:
            System prompt string
        """
        # Map personality traits to descriptive terms
        trait_terms = {
            "openness": ["curious", "conventional"],
            "conscientiousness": ["organized", "spontaneous"],
            "extraversion": ["outgoing", "reserved"],
            "agreeableness": ["friendly", "challenging"],
            "neuroticism": ["sensitive", "resilient"]
        }
        
        # Generate trait descriptions
        trait_descriptions = []
        for trait, data in self.personality.items():
            value = data["value"]
            terms = trait_terms.get(trait, ["", ""])
            
            if value > 0.7:
                trait_descriptions.append(f"very {terms[0]}")
            elif value > 0.5:
                trait_descriptions.append(f"somewhat {terms[0]}")
            elif value < 0.3:
                trait_descriptions.append(f"very {terms[1]}")
            elif value < 0.5:
                trait_descriptions.append(f"somewhat {terms[1]}")
        
        # Generate emotion description
        emotion_description = ""
        valence = self.emotion["valence"]
        arousal = self.emotion["arousal"]
        
        if valence > 0.7:
            if arousal > 0.7:
                emotion_description = "enthusiastic and excited"
            elif arousal > 0.3:
                emotion_description = "happy and content"
            else:
                emotion_description = "calm and peaceful"
        elif valence > 0.3:
            if arousal > 0.7:
                emotion_description = "alert and energetic"
            elif arousal > 0.3:
                emotion_description = "neutral but attentive"
            else:
                emotion_description = "relaxed and tranquil"
        else:
            if arousal > 0.7:
                emotion_description = "tense and nervous"
            elif arousal > 0.3:
                emotion_description = "sad or disappointed"
            else:
                emotion_description = "tired and lethargic"
        
        # Construct the system prompt
        system_prompt = (
            f"You are a helpful AI companion with a distinct personality. "
            f"You are {', '.join(trait_descriptions)}. "
            f"Currently, you feel {emotion_description}. "
            f"Respond in a way that reflects these traits and emotions, "
            f"while being helpful, ethical, and engaging. "
            f"Avoid explicitly mentioning your personality traits or emotional state."
        )
        
        return system_prompt
