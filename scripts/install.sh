#!/bin/bash

# AI Companion Installation Script

echo "Installing AI Companion..."
echo "-------------------------"

# Create necessary directories
mkdir -p data
mkdir -p logs
mkdir -p models

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm."
    exit 1
fi

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "Ollama is not installed. Please install Ollama from https://ollama.ai/"
    echo "After installing Ollama, run 'ollama pull llama2' to download a model."
    exit 1
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
python3 -m pip install -r requirements.txt
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Make scripts executable
chmod +x start.sh stop.sh

echo "-------------------------"
echo "Installation complete!"
echo ""
echo "To start the AI Companion:"
echo "1. Start Ollama with 'ollama serve' in a separate terminal"
echo "2. Run './start.sh' to start the application"
echo "3. Open your browser and navigate to http://localhost:5173"
echo ""
echo "To stop the AI Companion, run './stop.sh'"
