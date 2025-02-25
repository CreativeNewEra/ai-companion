#!/bin/bash

# AI Companion Stop Script

# Find and kill the backend server
echo "Stopping backend server..."
pkill -f "python main.py"

# Find and kill the frontend development server
echo "Stopping frontend development server..."
pkill -f "vite"

echo "AI Companion servers have been stopped."
