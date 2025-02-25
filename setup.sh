#!/bin/bash

# Set error handling
set -e
trap 'echo "Error: Setup failed on line $LINENO. Check the error message above."' ERR

echo "Setting up AI Companion v2.0.0..."

# Function to check version
check_version() {
    local cmd=$1
    local version=$2
    local min_version=$3
    local name=$4
    
    if ! command -v $cmd &> /dev/null; then
        echo "❌ $name is required but not installed. Please install $name and try again."
        echo "   Visit the project README for installation instructions."
        exit 1
    fi
    
    if [ "$cmd" = "python3" ]; then
        current_version=$($cmd -c "import sys; print('.'.join(map(str, sys.version_info[:2])))")
    else
        current_version=$($cmd --version | sed -n 's/.*v\([0-9.]*\).*/\1/p')
    fi
    
    if [ "$(printf '%s\n' "$min_version" "$current_version" | sort -V | head -n1)" != "$min_version" ]; then
        echo "❌ $name version $current_version is installed but version $min_version or higher is required."
        exit 1
    fi
    
    echo "✅ $name version $current_version found (minimum required: $min_version)"
}

# Check Python version (minimum 3.9)
check_version "python3" "$(python3 --version 2>&1)" "3.9" "Python"

# Check Node.js version (minimum 18.0)
check_version "node" "$(node --version 2>&1)" "18.0" "Node.js"

# Check npm version (minimum 8.0)
check_version "npm" "$(npm --version 2>&1)" "8.0" "npm"

# Check CUDA availability
echo "Checking CUDA toolkit..."
if ! command -v nvcc &> /dev/null; then
    echo "Warning: CUDA toolkit not found. Image generation will run on CPU (slower)."
    echo "For better performance, install CUDA toolkit from: https://developer.nvidia.com/cuda-downloads"
else
    cuda_version=$(nvcc --version | grep "release" | awk '{print $5}' | cut -d',' -f1)
    echo "Found CUDA version $cuda_version"
    
    # Check GPU memory
    if command -v nvidia-smi &> /dev/null; then
        gpu_memory=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | head -n 1)
        if [ "$gpu_memory" -lt 8000 ]; then
            echo "Warning: GPU has less than 8GB VRAM ($gpu_memory MB). Image generation may be limited."
        fi
    fi
fi

# Check if Ollama is installed and running
if ! command -v ollama &> /dev/null; then
    echo "Ollama is not installed. Please visit https://ollama.ai to install Ollama first."
    exit 1
fi

# Verify Ollama is responsive
if ! curl -s "http://localhost:11434/api/tags" &> /dev/null; then
    echo "Warning: Ollama is installed but not running. Please start Ollama service before proceeding."
    exit 1
fi

# Create and activate Python virtual environment
echo "Creating Python virtual environment..."
if [ -d "venv" ]; then
    echo "Found existing virtual environment, recreating..."
    rm -rf venv
fi

if ! python3 -m venv venv; then
    echo "Failed to create virtual environment. Please check your Python installation."
    exit 1
fi

if ! source venv/bin/activate; then
    echo "Failed to activate virtual environment."
    exit 1
fi

echo "Virtual environment created and activated successfully"

# Install Python dependencies with progress indicator
echo "Installing Python dependencies..."
if ! pip install --upgrade pip; then
    echo "Failed to upgrade pip. Please check your internet connection."
    exit 1
fi

echo "Installing project requirements..."
if ! pip install -r requirements.txt; then
    echo "Failed to install Python dependencies. Please check the error message above."
    exit 1
fi

# Install Node.js dependencies with error handling
echo "Installing Node.js dependencies..."
cd frontend
if ! npm install; then
    echo "Failed to install Node.js dependencies. Please check the error message above."
    cd ..
    exit 1
fi
cd ..

# Pull Ollama model with verification
echo "Pulling Ollama llama2 model..."
if ! ollama pull llama2; then
    echo "Failed to pull llama2 model. Please check your internet connection and Ollama service."
    exit 1
fi

# Verify model was pulled successfully
if ! ollama list | grep -q "llama2"; then
    echo "Failed to verify llama2 model installation."
    exit 1
fi

# Create necessary directories
echo "Creating project directories..."
mkdir -p models/{diffusers,safetensors,checkpoints,gguf}
mkdir -p data
mkdir -p logs
mkdir -p backend/data
mkdir -p backend/logs

# Set up environment file
echo "Setting up environment configuration..."
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env file with default configuration..."
    cat > backend/.env << EOF
# Hugging Face token for model access
HF_AUTH_TOKEN=

# Database and storage paths
DATABASE_PATH=data/memory.db
VECTOR_STORE_PATH=data/vector_store
MODEL_DIR=models

# Logging configuration
LOG_LEVEL=INFO
EOF
    echo "Created backend/.env with default settings"
    echo "Please edit backend/.env to add your Hugging Face token"
fi

# Check for Hugging Face token
echo "Checking Hugging Face token..."
if [ -f "backend/.env" ]; then
    HF_TOKEN=$(grep "HF_AUTH_TOKEN" backend/.env | cut -d'=' -f2 | tr -d ' ')
    if [ -z "$HF_TOKEN" ]; then
        echo "⚠️ No Hugging Face token found in backend/.env"
        echo "Please add your token to enable image generation:"
        echo "1. Visit https://huggingface.co/settings/tokens to create a token"
        echo "2. Add it to backend/.env as HF_AUTH_TOKEN=your_token"
    else
        echo "✅ Found Hugging Face token"
        
        # Pre-download models for image generation
        echo "Pre-downloading image generation models..."
        python3 -c "
from diffusers import FluxPipeline, StableDiffusionXLPipeline
import os
import sys
from tqdm import tqdm

class TqdmPrinter:
    def write(self, s):
        tqdm.write(s, end='')

sys.stdout = TqdmPrinter()
os.environ['HF_AUTH_TOKEN'] = '$HF_TOKEN'

try:
    print('Downloading Flux model...')
    FluxPipeline.from_pretrained('aoxo/flux.1dev-abliteratedv2', 
                                use_auth_token=True, 
                                cache_dir='models/diffusers/flux')
    
    print('Downloading SDXL model...')
    StableDiffusionXLPipeline.from_pretrained('stabilityai/stable-diffusion-xl-base-1.0', 
                                             use_auth_token=True,
                                             cache_dir='models/diffusers/sdxl')
    
    print('✅ Models downloaded successfully')
except Exception as e:
    print(f'⚠️ Failed to download models: {str(e)}')
    print('You can still run the application, but image generation may be limited.')
"
    fi
else
    echo "⚠️ backend/.env file not found"
fi

echo "✅ Setup completed successfully!"
echo "You can now run start.sh to launch the application."
echo "For troubleshooting, check the logs in the backend/logs directory."
