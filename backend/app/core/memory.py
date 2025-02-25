"""
Memory System
Manages the AI companion's memory of conversations and facts
"""

import logging
import json
import time
from typing import Dict, Any, List, Optional
from pathlib import Path
import sqlite3
from datetime import datetime

logger = logging.getLogger("ai_companion.memory")

class MemorySystem:
    """
    Manages the AI companion's memory of conversations and facts
    """
    
    def __init__(self, data_dir: str = "data"):
        """
        Initialize the memory system
        
        Args:
            data_dir: Directory for storing memory data
        """
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        self.db_path = self.data_dir / "memory.db"
        
        # Initialize database
        self._init_database()
        
        logger.info("Initialized MemorySystem")
    
    def _init_database(self) -> None:
        """
        Initialize the SQLite database
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create messages table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                is_user BOOLEAN NOT NULL,
                timestamp TEXT NOT NULL,
                importance REAL DEFAULT 0.5
            )
            ''')
            
            # Create facts table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS facts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject TEXT NOT NULL,
                predicate TEXT NOT NULL,
                object TEXT NOT NULL,
                confidence REAL DEFAULT 1.0,
                source TEXT,
                timestamp TEXT NOT NULL
            )
            ''')
            
            conn.commit()
            conn.close()
            
            logger.info("Initialized memory database")
        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
            raise
    
    def add_message(self, content: str, is_user: bool, importance: float = 0.5) -> int:
        """
        Add a message to memory
        
        Args:
            content: Message content
            is_user: Whether the message is from the user (True) or AI (False)
            importance: Importance score (0.0 to 1.0)
            
        Returns:
            ID of the added message
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            timestamp = datetime.now().isoformat()
            
            cursor.execute(
                "INSERT INTO messages (content, is_user, timestamp, importance) VALUES (?, ?, ?, ?)",
                (content, is_user, timestamp, importance)
            )
            
            message_id = cursor.lastrowid
            
            conn.commit()
            conn.close()
            
            logger.info(f"Added message to memory with ID: {message_id}")
            
            return message_id
        except Exception as e:
            logger.error(f"Error adding message to memory: {str(e)}")
            raise
    
    def add_fact(self, subject: str, predicate: str, object: str, confidence: float = 1.0, source: Optional[str] = None) -> int:
        """
        Add a fact to memory
        
        Args:
            subject: Subject of the fact
            predicate: Predicate (relation)
            object: Object of the fact
            confidence: Confidence score (0.0 to 1.0)
            source: Source of the fact (e.g., "conversation", "user_profile")
            
        Returns:
            ID of the added fact
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            timestamp = datetime.now().isoformat()
            
            cursor.execute(
                "INSERT INTO facts (subject, predicate, object, confidence, source, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
                (subject, predicate, object, confidence, source, timestamp)
            )
            
            fact_id = cursor.lastrowid
            
            conn.commit()
            conn.close()
            
            logger.info(f"Added fact to memory with ID: {fact_id}")
            
            return fact_id
        except Exception as e:
            logger.error(f"Error adding fact to memory: {str(e)}")
            raise
    
    def get_recent_messages(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get recent messages from memory
        
        Args:
            limit: Maximum number of messages to retrieve
            
        Returns:
            List of message dictionaries
        """
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT * FROM messages ORDER BY timestamp DESC LIMIT ?",
                (limit,)
            )
            
            messages = [dict(row) for row in cursor.fetchall()]
            
            conn.close()
            
            return messages
        except Exception as e:
            logger.error(f"Error retrieving recent messages: {str(e)}")
            return []
    
    def get_facts_about(self, subject: str) -> List[Dict[str, Any]]:
        """
        Get facts about a specific subject
        
        Args:
            subject: Subject to query
            
        Returns:
            List of fact dictionaries
        """
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT * FROM facts WHERE subject = ? ORDER BY confidence DESC",
                (subject,)
            )
            
            facts = [dict(row) for row in cursor.fetchall()]
            
            conn.close()
            
            return facts
        except Exception as e:
            logger.error(f"Error retrieving facts about {subject}: {str(e)}")
            return []
    
    def search_messages(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Search messages containing the query
        
        Args:
            query: Search query
            limit: Maximum number of messages to retrieve
            
        Returns:
            List of message dictionaries
        """
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT * FROM messages WHERE content LIKE ? ORDER BY timestamp DESC LIMIT ?",
                (f"%{query}%", limit)
            )
            
            messages = [dict(row) for row in cursor.fetchall()]
            
            conn.close()
            
            return messages
        except Exception as e:
            logger.error(f"Error searching messages: {str(e)}")
            return []
    
    def get_conversation_context(self, message_count: int = 5) -> str:
        """
        Get recent conversation context as a formatted string
        
        Args:
            message_count: Number of recent messages to include
            
        Returns:
            Formatted conversation context
        """
        messages = self.get_recent_messages(limit=message_count)
        
        if not messages:
            return "No previous conversation."
        
        # Format messages into a context string
        context_parts = []
        
        for msg in reversed(messages):  # Oldest to newest
            speaker = "User" if msg["is_user"] else "AI"
            content = msg["content"]
            context_parts.append(f"{speaker}: {content}")
        
        return "\n".join(context_parts)
    
    def extract_facts_from_message(self, message: str, is_user: bool) -> List[Dict[str, Any]]:
        """
        Extract potential facts from a message
        
        Args:
            message: Message content
            is_user: Whether the message is from the user
            
        Returns:
            List of extracted facts
        """
        # In a real implementation, this would use NLP to extract facts
        # For the MVP, we'll use a simple rule-based approach for user messages only
        
        extracted_facts = []
        
        # Only extract facts from user messages for simplicity
        if is_user:
            # Simple pattern matching for "I like/love/hate X" statements
            message_lower = message.lower()
            
            # Check for preferences
            for verb in ["like", "love", "enjoy", "prefer"]:
                if f"i {verb} " in message_lower:
                    # Extract what comes after "I like/love/enjoy "
                    parts = message_lower.split(f"i {verb} ")
                    if len(parts) > 1:
                        object_part = parts[1].split(".")[0].split(",")[0].strip()
                        if object_part:
                            extracted_facts.append({
                                "subject": "user",
                                "predicate": f"likes" if verb != "hate" else "dislikes",
                                "object": object_part,
                                "confidence": 0.8,
                                "source": "conversation"
                            })
            
            # Check for dislikes
            for verb in ["hate", "dislike", "don't like"]:
                if f"i {verb} " in message_lower:
                    # Extract what comes after "I hate/dislike/don't like "
                    parts = message_lower.split(f"i {verb} ")
                    if len(parts) > 1:
                        object_part = parts[1].split(".")[0].split(",")[0].strip()
                        if object_part:
                            extracted_facts.append({
                                "subject": "user",
                                "predicate": "dislikes",
                                "object": object_part,
                                "confidence": 0.8,
                                "source": "conversation"
                            })
        
        return extracted_facts
    
    def process_message(self, content: str, is_user: bool) -> Dict[str, Any]:
        """
        Process a message: add to memory and extract facts
        
        Args:
            content: Message content
            is_user: Whether the message is from the user
            
        Returns:
            Dictionary with processing results
        """
        # Add message to memory
        message_id = self.add_message(content, is_user)
        
        # Extract and add facts
        facts = []
        if is_user:
            extracted_facts = self.extract_facts_from_message(content, is_user)
            
            for fact in extracted_facts:
                fact_id = self.add_fact(
                    subject=fact["subject"],
                    predicate=fact["predicate"],
                    object=fact["object"],
                    confidence=fact["confidence"],
                    source=fact["source"]
                )
                facts.append({**fact, "id": fact_id})
        
        return {
            "message_id": message_id,
            "extracted_facts": facts
        }
    
    def get_memory_summary(self) -> Dict[str, Any]:
        """
        Get a summary of the memory system state
        
        Returns:
            Dictionary with memory statistics
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Count messages
            cursor.execute("SELECT COUNT(*) FROM messages")
            message_count = cursor.fetchone()[0]
            
            # Count user vs AI messages
            cursor.execute("SELECT COUNT(*) FROM messages WHERE is_user = 1")
            user_message_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM messages WHERE is_user = 0")
            ai_message_count = cursor.fetchone()[0]
            
            # Count facts
            cursor.execute("SELECT COUNT(*) FROM facts")
            fact_count = cursor.fetchone()[0]
            
            conn.close()
            
            return {
                "message_count": message_count,
                "user_message_count": user_message_count,
                "ai_message_count": ai_message_count,
                "fact_count": fact_count
            }
        except Exception as e:
            logger.error(f"Error getting memory summary: {str(e)}")
            return {
                "message_count": 0,
                "user_message_count": 0,
                "ai_message_count": 0,
                "fact_count": 0
            }
