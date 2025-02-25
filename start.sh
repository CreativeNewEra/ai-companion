#!/bin/bash

# AI Companion Startup Script

# Create necessary directories
mkdir -p data
mkdir -p logs

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "Ollama is not running. Please start Ollama first."
    echo "You can start Ollama with 'ollama serve' in a separate terminal."
    exit 1
fi

# Check for available models
echo "Checking available Ollama models..."
MODELS=$(curl -s http://localhost:11434/api/tags)
if [[ $MODELS == *"models\":[]"* ]]; then
    echo "No models found in Ollama. Please pull at least one model."
    echo "You can pull a model with 'ollama pull llama2' or another model of your choice."
    exit 1
fi

# Start the backend server
echo "Starting AI Companion backend server..."
cd backend
python main.py --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 3

# Check if backend is running
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "Backend failed to start. Check logs for details."
    exit 1
fi

echo "Backend server is running on http://localhost:8000"

# Start the frontend development server
echo "Starting frontend development server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Frontend development server is running."
echo "You can access the AI Companion at http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers."

# Trap Ctrl+C to kill both servers
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Wait for both processes
wait
