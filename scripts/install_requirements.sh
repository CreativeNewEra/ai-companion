#!/bin/bash

# Create and activate virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install PyTorch with CUDA support
pip3 install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# Install other requirements
pip install -r requirements.txt

# Install optional dependencies for better performance
pip install xformers --index-url https://download.pytorch.org/whl/cu118
pip install bitsandbytes

# Create model directories if they don't exist
mkdir -p models/{diffusers,safetensors,checkpoints,gguf}

echo "Installation complete! The system is ready for model downloads and image generation."
