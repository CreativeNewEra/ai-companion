"""
WebSocket Manager
Manages WebSocket connections for real-time communication
"""

import logging
import json
from typing import Dict, List, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect
import asyncio

logger = logging.getLogger("ai_companion.websocket")

class ConnectionManager:
    """
    Manages WebSocket connections
    """
    
    def __init__(self):
        """
        Initialize the connection manager
        """
        self.active_connections: List[WebSocket] = []
        logger.info("Initialized WebSocket ConnectionManager")
    
    async def connect(self, websocket: WebSocket):
        """
        Connect a new WebSocket client
        
        Args:
            websocket: WebSocket connection
        """
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New WebSocket connection. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """
        Disconnect a WebSocket client
        
        Args:
            websocket: WebSocket connection
        """
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Remaining connections: {len(self.active_connections)}")
    
    async def send_message(self, message: Dict[str, Any], websocket: WebSocket):
        """
        Send a message to a specific client
        
        Args:
            message: Message to send
            websocket: WebSocket connection
        """
        await websocket.send_json(message)
    
    async def broadcast(self, message: Dict[str, Any]):
        """
        Broadcast a message to all connected clients
        
        Args:
            message: Message to broadcast
        """
        for connection in self.active_connections:
            await connection.send_json(message)
    
    async def broadcast_typing(self, is_typing: bool = True):
        """
        Broadcast typing indicator to all connected clients
        
        Args:
            is_typing: Whether the AI is typing
        """
        for connection in self.active_connections:
            await connection.send_json({
                "type": "typing_indicator",
                "is_typing": is_typing
            })
    
    async def stream_response(
        self,
        websocket: WebSocket,
        response_generator: Any,
        personality: Dict[str, Any],
        emotion: Dict[str, Any]
    ):
        """
        Stream a response to a client
        
        Args:
            websocket: WebSocket connection
            response_generator: Generator yielding response chunks
            personality: Personality data
            emotion: Emotion data
        """
        try:
            # Send typing indicator
            await self.send_message(
                {"type": "typing_indicator", "is_typing": True},
                websocket
            )
            
            # Stream response chunks
            full_response = ""
            for chunk in response_generator:
                response_text = chunk.get("response", "")
                full_response += response_text
                
                await self.send_message(
                    {
                        "type": "response_chunk",
                        "content": response_text,
                        "full_response": full_response
                    },
                    websocket
                )
                
                # Small delay for more natural typing effect
                await asyncio.sleep(0.05)
            
            # Send complete response with metadata
            await self.send_message(
                {
                    "type": "response_complete",
                    "content": full_response,
                    "personality": personality,
                    "emotion": emotion
                },
                websocket
            )
            
            # End typing indicator
            await self.send_message(
                {"type": "typing_indicator", "is_typing": False},
                websocket
            )
        except Exception as e:
            logger.error(f"Error streaming response: {str(e)}")
            # Send error message
            await self.send_message(
                {
                    "type": "error",
                    "message": f"Error streaming response: {str(e)}"
                },
                websocket
            )
