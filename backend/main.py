#!/usr/bin/env python3
"""
AI Companion Backend Server
Main entry point for the FastAPI backend application
"""

import argparse
import os
import sys
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler
import json
import asyncio
import time
import datetime
from pathlib import Path

# Configure logging
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)
log_file = log_dir / "backend.log"

logger = logging.getLogger("ai_companion")
logger.setLevel(logging.INFO)
file_handler = RotatingFileHandler(log_file, maxBytes=10*1024*1024, backupCount=5)
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(file_handler)
console_handler = logging.StreamHandler()
console_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
logger.addHandler(console_handler)

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(title="AI Companion API", version="2.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New WebSocket connection. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Remaining connections: {len(self.active_connections)}")

    async def send_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Models
class Message(BaseModel):
    content: str
    role: str = "user"
    timestamp: Optional[float] = None

class ChatResponse(BaseModel):
    message: Message
    personality: Dict[str, Any] = {}
    emotion: Dict[str, Any] = {}

# API Router
from fastapi import APIRouter

api_router = APIRouter(prefix="/api")

# Routes
@app.get("/")
async def root():
    return {"status": "online", "version": "2.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# API Routes
@api_router.get("/personality/current")
async def get_personality_current():
    """
    Get the current personality state of the AI companion
    """
    return {
        "traits": {
            "openness": 0.7,
            "conscientiousness": 0.8,
            "extraversion": 0.6,
            "agreeableness": 0.75,
            "neuroticism": 0.4
        }
    }

@api_router.get("/emotions/current")
async def get_emotions_current():
    """
    Get the current emotional state of the AI companion
    """
    return {
        "valence": 0.8,  # Positive
        "arousal": 0.5,  # Moderate energy
        "dominance": 0.6  # Moderate confidence
    }

@api_router.get("/messages")
async def get_messages():
    """
    Get message history
    """
    # In a real implementation, this would fetch messages from a database
    return [
        {
            "id": "1",
            "content": "Hello! How can I help you today?",
            "isUser": False,
            "timestamp": (datetime.datetime.now() - datetime.timedelta(hours=1)).isoformat(),
            "status": "sent"
        }
    ]

@api_router.post("/chat")
async def chat(message: Message):
    """
    Process a chat message and return a response
    """
    logger.info(f"Received message: {message.content}")
    
    # In a real implementation, this would process the message through the AI model
    # For now, we'll just echo back a simple response
    
    # Simulate processing time
    await asyncio.sleep(1)
    
    # Return a response in the format expected by the frontend
    return {
        "response": f"I received your message: {message.content}"
    }

@api_router.post("/images/generate")
async def generate_image(prompt: Dict[str, str]):
    """
    Generate an image based on a text prompt
    """
    logger.info(f"Image generation request: {prompt}")
    
    # In a real implementation, this would use the image generation model
    # For now, we'll just return a placeholder response
    
    # Placeholder base64 image (1x1 transparent pixel)
    base64_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    
    return {
        "image": base64_image,
        "prompt": prompt.get("prompt", ""),
        "generation_time": 1.5,
        "model": "flux",
        "metadata": {
            "negative_prompt": prompt.get("negative_prompt", ""),
            "num_inference_steps": 30,
            "guidance_scale": 7.5,
            "width": 512,
            "height": 512
        }
    }

@api_router.get("/models")
async def list_models():
    """
    List available AI models
    """
    # In a real implementation, this would scan the models directory
    # For now, we'll just return a placeholder response
    
    return {
        "models": [
            {
                "id": "llama2",
                "name": "Llama 2",
                "type": "chat",
                "size": "7B",
                "quantization": "Q4_K_M",
                "context_length": 4096
            }
        ]
    }

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"WebSocket received: {data}")
            
            # Parse the incoming message
            try:
                message_data = json.loads(data)
                message = Message(**message_data)
                
                # Process the message (in a real implementation, this would use the AI model)
                await asyncio.sleep(1)  # Simulate processing time
                
                # Create a response
                response = ChatResponse(
                    message=Message(
                        content=f"I received your message: {message.content}",
                        role="assistant",
                        timestamp=time.time()
                    ),
                    personality={
                        "openness": 0.7,
                        "conscientiousness": 0.8,
                        "extraversion": 0.6,
                        "agreeableness": 0.75,
                        "neuroticism": 0.4
                    },
                    emotion={
                        "valence": 0.8,  # Positive
                        "arousal": 0.5,  # Moderate energy
                        "dominance": 0.6  # Moderate confidence
                    }
                )
                
                # Send the response
                await manager.send_message(json.dumps(response.dict()), websocket)
                
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received: {data}")
                await manager.send_message(json.dumps({"error": "Invalid JSON"}), websocket)
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")
                await manager.send_message(json.dumps({"error": str(e)}), websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Include the API router
app.include_router(api_router)

def parse_args():
    parser = argparse.ArgumentParser(description="AI Companion Backend Server")
    parser.add_argument("--port", type=int, default=8000, help="Port to run the server on")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host to run the server on")
    parser.add_argument("--production", action="store_true", help="Run in production mode")
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    
    logger.info(f"Starting AI Companion Backend on {args.host}:{args.port}")
    logger.info(f"Production mode: {args.production}")
    
    # Save the current working directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Change to the directory containing this file
    os.chdir(current_dir)
    
    # Run the server
    uvicorn.run(
        "main:app",
        host=args.host,
        port=args.port,
        log_level="info",
        reload=not args.production,
        workers=4 if args.production else 1
    )
