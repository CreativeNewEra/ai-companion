#!/bin/bash

# Set error handling
set -e
trap 'handle_error $? $LINENO' ERR

# Default configuration
BACKEND_PORT=${BACKEND_PORT:-8000}
FRONTEND_PORT=${FRONTEND_PORT:-5173}
OLLAMA_PORT=${OLLAMA_PORT:-11434}
LOG_DIR="logs"
LOG_FILE="$LOG_DIR/startup.log"
MODE=${MODE:-development}

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Initialize log file
echo "=== Starting application $(date) ===" > "$LOG_FILE"

# Logging function
log() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo "$message" | tee -a "$LOG_FILE"
}

# Error handling function
handle_error() {
    local exit_code=$1
    local line_number=$2
    log "Error on line $line_number: Command exited with status $exit_code"
    cleanup
    exit 1
}

# Function to check if a process is running on a port
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    # Check Python version
    local python_version=$(python3 --version 2>&1 | cut -d' ' -f2)
    log "Python version: $python_version"
    
    # Check Node.js version
    local node_version=$(node --version 2>&1)
    log "Node.js version: $node_version"
    
    # Check available memory
    local total_memory=$(free -m | awk '/^Mem:/{print $2}')
    local available_memory=$(free -m | awk '/^Mem:/{print $7}')
    log "Available memory: ${available_memory}MB / ${total_memory}MB"
    
    if [ "$available_memory" -lt 1024 ]; then
        log "Warning: Less than 1GB of available memory"
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local port=$1
    local service=$2
    local max_attempts=60
    local attempt=1
    local timeout=2

    log "Waiting for $service to be ready on port $port..."
    while true; do
        if [ $attempt -ge $max_attempts ]; then
            log "Error: $service failed to start after $max_attempts attempts"
            return 1
        fi

        if [ "$port" = "$OLLAMA_PORT" ]; then
            # For Ollama, check the API endpoint
            if curl -s "http://localhost:${port}/api/tags" >/dev/null; then
                break
            fi
        else
            # For other services, check the port
            if check_port $port; then
                break
            fi
        fi

        log "Attempt $attempt/$max_attempts..."
        sleep $timeout
        attempt=$((attempt + 1))
    done
    log "$service is ready!"
}

# Function to manage Ollama service
manage_ollama() {
    log "Managing Ollama service..."
    
    # Check if Ollama is installed
    if ! command -v ollama &> /dev/null; then
        log "Error: Ollama is not installed"
        exit 1
    fi
    
    # Stop Ollama service if running
    log "Stopping Ollama service..."
    sudo systemctl stop ollama || log "Warning: Failed to stop Ollama service"
    sleep 2
    
    # Start Ollama service
    log "Starting Ollama service..."
    if ! sudo systemctl start ollama; then
        log "Error: Failed to start Ollama service"
        sudo systemctl status ollama
        exit 1
    fi
    
    # Wait for service to be ready
    wait_for_service $OLLAMA_PORT "Ollama service"
}

# Cleanup function
cleanup() {
    log "Cleaning up processes..."
    
    # Kill processes on ports if they exist
    for port in $BACKEND_PORT $FRONTEND_PORT; do
        if check_port $port; then
            log "Killing process on port $port"
            kill $(lsof -t -i:$port) 2>/dev/null || true
        fi
    done
    
    # Kill any remaining background jobs
    kill $(jobs -p) 2>/dev/null || true
    
    log "Cleanup completed"
}

# Main execution
log "Starting application in $MODE mode..."

# Check system requirements
check_requirements

# Kill any existing processes on our ports
log "Cleaning up existing processes..."
cleanup

# Activate Python virtual environment
log "Activating virtual environment..."
if ! source venv/bin/activate; then
    log "Error: Failed to activate virtual environment"
    exit 1
fi

# Install required packages
log "Installing required packages..."
if ! pip install -r requirements.txt; then
    log "Error: Failed to install Python requirements"
    exit 1
fi

# Manage Ollama service
manage_ollama

# Start backend server
log "Starting backend server on port $BACKEND_PORT..."
cd backend
if [ "$MODE" = "production" ]; then
    python main.py --port $BACKEND_PORT --production &
else
    python main.py --port $BACKEND_PORT &
fi
cd ..
wait_for_service $BACKEND_PORT "Backend server"

# Start frontend server
log "Starting frontend server on port $FRONTEND_PORT..."
cd frontend
if [ "$MODE" = "production" ]; then
    npm run build && npm run preview -- --port $FRONTEND_PORT &
else
    npm run dev -- --port $FRONTEND_PORT &
fi
cd ..
wait_for_service $FRONTEND_PORT "Frontend server"

log "All services are running!"
log "You can now access the application at: http://localhost:$FRONTEND_PORT"
log "Mode: $MODE"
log "Logs available at: $LOG_FILE"

# Set up trap to catch script termination
trap cleanup EXIT SIGINT SIGTERM

# Keep script running and wait for Ctrl+C
echo "Press Ctrl+C to stop all services"
wait
