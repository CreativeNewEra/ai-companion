#!/bin/bash

echo "Stopping AI Companion services..."

# Function to kill process by port
kill_port() {
    local port=$1
    local name=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "Stopping $name..."
        kill $(lsof -t -i:$port) 2>/dev/null
    fi
}

# Stop frontend (Vite)
kill_port 5173 "frontend server"

# Stop backend (FastAPI)
kill_port 8000 "backend server"

# Stop Ollama if requested
read -p "Do you want to stop Ollama server? (y/N) " stop_ollama
if [[ $stop_ollama =~ ^[Yy]$ ]]; then
    echo "Stopping Ollama..."
    sudo pkill ollama || {
        echo "Failed to stop Ollama. You may need to stop it manually with: sudo pkill ollama"
    }
else
    echo "Ollama server was left running as it might be used by other applications."
fi

echo "All services stopped!"
