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
VERBOSE=${VERBOSE:-false}
MAX_LOG_SIZE_MB=10
MAX_LOG_FILES=5

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --port=*)
      FRONTEND_PORT="${1#*=}"
      shift
      ;;
    --backend-port=*)
      BACKEND_PORT="${1#*=}"
      shift
      ;;
    --mode=*)
      MODE="${1#*=}"
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --help)
      echo "Usage: ./start.sh [options]"
      echo "Options:"
      echo "  --port=PORT            Set frontend port (default: 5173)"
      echo "  --backend-port=PORT    Set backend port (default: 8000)"
      echo "  --mode=MODE            Set mode (development or production, default: development)"
      echo "  --verbose              Enable verbose logging"
      echo "  --help                 Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Log rotation function
rotate_logs() {
    if [ -f "$LOG_FILE" ]; then
        # Get size in MB
        local size=$(du -m "$LOG_FILE" | cut -f1)
        if [ "$size" -ge "$MAX_LOG_SIZE_MB" ]; then
            # Rotate logs
            for i in $(seq $((MAX_LOG_FILES-1)) -1 1); do
                if [ -f "$LOG_FILE.$i" ]; then
                    mv "$LOG_FILE.$i" "$LOG_FILE.$((i+1))"
                fi
            done
            mv "$LOG_FILE" "$LOG_FILE.1"
        fi
    fi
}

# Rotate logs before starting
rotate_logs

# Initialize log file
echo "=== Starting AI Companion v2.0.0 ($(date)) ===" > "$LOG_FILE"
echo "=== Mode: $MODE, Frontend: $FRONTEND_PORT, Backend: $BACKEND_PORT ===" >> "$LOG_FILE"

# Logging function
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Format with color based on level
    case $level in
        "INFO")
            local colored_level="\033[0;32mINFO\033[0m"
            ;;
        "WARN")
            local colored_level="\033[0;33mWARN\033[0m"
            ;;
        "ERROR")
            local colored_level="\033[0;31mERROR\033[0m"
            ;;
        *)
            local colored_level=$level
            ;;
    esac
    
    # Log to file always
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    # Log to console with color
    echo -e "[$timestamp] [$colored_level] $message"
    
    # Additional verbose logging
    if [ "$level" = "DEBUG" ] && [ "$VERBOSE" != "true" ]; then
        return
    fi
}

# Error handling function
handle_error() {
    local exit_code=$1
    local line_number=$2
    log "ERROR" "Error on line $line_number: Command exited with status $exit_code"
    cleanup
    exit 1
}

# Log system information
log_system_info() {
    log "INFO" "System information:"
    
    # OS information
    if [ -f /etc/os-release ]; then
        os_name=$(grep -E "^NAME=" /etc/os-release | cut -d= -f2 | tr -d '"')
        os_version=$(grep -E "^VERSION=" /etc/os-release | cut -d= -f2 | tr -d '"')
        log "INFO" "OS: $os_name $os_version"
    fi
    
    # CPU information
    cpu_info=$(grep "model name" /proc/cpuinfo | head -n 1 | cut -d: -f2 | xargs)
    cpu_cores=$(grep -c "processor" /proc/cpuinfo)
    log "INFO" "CPU: $cpu_info ($cpu_cores cores)"
    
    # Memory information
    total_mem=$(free -h | awk '/^Mem:/ {print $2}')
    available_mem=$(free -h | awk '/^Mem:/ {print $7}')
    log "INFO" "Memory: $available_mem available / $total_mem total"
    
    # Disk information
    disk_space=$(df -h . | awk 'NR==2 {print $4 " available / " $2 " total"}')
    log "INFO" "Disk space: $disk_space"
    
    # GPU information if available
    if command -v nvidia-smi &> /dev/null; then
        gpu_info=$(nvidia-smi --query-gpu=name,memory.total --format=csv,noheader | head -n 1)
        log "INFO" "GPU: $gpu_info"
    else
        log "WARN" "No NVIDIA GPU detected. Image generation will be slower."
    fi
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
