#!/usr/bin/env python3
"""
AI Companion Backend Server
Main entry point for the FastAPI backend application
"""

import argparse
import os
import sys
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler
import json
import asyncio
import time
from pathlib import Path

# Import app modules
from app.api import router as api_router
from app.api.websocket import ConnectionManager
from app.core.model_manager import ModelManager
from app.core.personality import PersonalitySystem
from app.core.memory import MemorySystem
from app.core.conversation import ConversationEngine

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

# Create WebSocket connection manager
manager = ConnectionManager()

# Create core system instances
model_manager = ModelManager(
    ollama_url=os.environ.get("OLLAMA_URL", "http://localhost:11434")
)
personality_system = PersonalitySystem(
    data_dir=os.environ.get("DATA_DIR", "data")
)
memory_system = MemorySystem(
    data_dir=os.environ.get("DATA_DIR", "data")
)
conversation_engine = ConversationEngine(
    model_manager=model_manager,
    personality_system=personality_system,
    memory_system=memory_system
)

# Routes
@app.get("/")
async def root():
    return {"status": "online", "version": "2.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

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
                content = message_data.get("content", "")
                model_id = message_data.get("model_id")
                stream = message_data.get("stream", False)
                temperature = message_data.get("temperature", 0.7)
                
                if not content:
                    await manager.send_message(
                        {"error": "Message content is required"},
                        websocket
                    )
                    continue
                
                # Process the message
                if stream:
                    # For streaming responses
                    response_data = await conversation_engine.process_message(
                        message=content,
                        model_id=model_id,
                        stream=True,
                        temperature=temperature
                    )
                    
                    # Stream the response
                    await manager.stream_response(
                        websocket=websocket,
                        response_generator=response_data.get("response_generator"),
                        personality=response_data.get("personality", {}),
                        emotion=response_data.get("emotion", {})
                    )
                else:
                    # For regular responses
                    response_data = await conversation_engine.process_message(
                        message=content,
                        model_id=model_id,
                        stream=False,
                        temperature=temperature
                    )
                    
                    # Send the response
                    await manager.send_message(
                        {
                            "type": "response",
                            "content": response_data.get("response", ""),
                            "personality": response_data.get("personality", {}),
                            "emotion": response_data.get("emotion", {}),
                            "model_used": response_data.get("model_used", ""),
                            "processing_time": response_data.get("processing_time", 0)
                        },
                        websocket
                    )
                
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received: {data}")
                await manager.send_message({"error": "Invalid JSON"}, websocket)
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")
                await manager.send_message({"error": str(e)}, websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Include the API router
app.include_router(api_router.router)

def parse_args():
    parser = argparse.ArgumentParser(description="AI Companion Backend Server")
    parser.add_argument("--port", type=int, default=8000, help="Port to run the server on")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host to run the server on")
    parser.add_argument("--production", action="store_true", help="Run in production mode")
    parser.add_argument("--ollama-url", type=str, help="Ollama API URL")
    parser.add_argument("--data-dir", type=str, help="Data directory")
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    
    # Set environment variables from command line arguments
    if args.ollama_url:
        os.environ["OLLAMA_URL"] = args.ollama_url
    
    if args.data_dir:
        os.environ["DATA_DIR"] = args.data_dir
    
    logger.info(f"Starting AI Companion Backend on {args.host}:{args.port}")
    logger.info(f"Production mode: {args.production}")
    logger.info(f"Ollama URL: {os.environ.get('OLLAMA_URL', 'http://localhost:11434')}")
    logger.info(f"Data directory: {os.environ.get('DATA_DIR', 'data')}")
    
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
