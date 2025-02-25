# AI Companion

A sophisticated AI companion application with dynamic personality, advanced memory systems, and multi-modal capabilities.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Overview

AI Companion creates a personalized, emotionally intelligent digital assistant that evolves through interactions. Featuring a dynamic personality system, contextual memory, and multi-modal capabilities, it runs efficiently on your local hardware while offering seamless integration with cloud services when needed.

## Key Features

### Personality System
- **Dynamic Traits**: Evolving personality traits that adapt to user interactions
- **Emotional Intelligence**: Real-time mood tracking and emotional state visualization
- **Contextual Adaptation**: Response style that adjusts based on conversation context

### Advanced Memory
- **Hierarchical Memory**: Multi-layered memory system with context-aware retrieval
- **Semantic Search**: Vector-based similarity search for relevant memory retrieval
- **Memory Visualization**: Interactive tools to explore and manage memories

### Multi-Modal Capabilities
- **Text Chat**: Natural and engaging text conversations
- **Image Generation**: Create custom images from text descriptions
- **Voice Integration**: Text-to-speech and speech recognition (planned)

### Resource Management
- **Flexible Model Support**: Compatible with multiple model formats (GGUF, Diffusers, Safetensors)
- **Efficient Resource Allocation**: Smart memory management for optimal performance
- **Model Switching**: Seamless switching between different AI models

### Modern UI/UX
- **Real-time Interface**: Responsive chat interface with typing indicators
- **Personality Visualization**: Interactive displays of companion's traits and mood
- **Memory Exploration**: Tools to browse and search conversation history
- **Customizable Themes**: Light and dark mode support

## Architecture

```
ai-companion/
├── backend/
│   ├── app/
│   │   ├── core/           # Core AI companion systems
│   │   ├── api/            # API endpoints and websockets
│   │   └── utils/          # Utility functions and helpers
│   ├── data/               # Data storage
│   ├── models/             # AI model storage
│   └── config/             # Configuration files
└── frontend/
    └── src/
        ├── components/     # React components
        ├── hooks/          # Custom React hooks
        └── utils/          # Frontend utilities
```

### Core Components

1. **Personality Core**: Manages traits, mood, and behavioral adaptation
2. **Memory Manager**: Handles storage and retrieval of conversations and learned preferences
3. **Model Manager**: Controls loading, unloading and resource allocation for AI models
4. **Prompt Engine**: Creates dynamic, context-aware prompts for the AI models

## Setup

### Prerequisites
- Python 3.9+
- Node.js 16+
- NVIDIA GPU with CUDA support (recommended)
- 16GB RAM minimum (32GB recommended)
- SSD storage

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/ai-companion.git
cd ai-companion
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Configure environment variables:
Create a `.env` file in the backend directory with:
```env
HF_AUTH_TOKEN=your_hugging_face_token  # Optional for private models
DATABASE_PATH=data/memory.db
VECTOR_STORE_PATH=data/vector_store
MODEL_DIR=models
```

5. Download initial models:
```bash
python download_models.py
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure environment:
Create a `.env` file in the frontend directory with:
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

3. Start development server:
```bash
npm run dev
```

### Running the Application

1. Start the backend:
```bash
cd backend
python main.py
```

2. In a new terminal, start the frontend:
```bash
cd frontend
npm start
```

3. Access the application at http://localhost:5173

## Usage Examples

### Text Conversation

```python
# Using the Python API client
from ai_companion.client import CompanionClient

client = CompanionClient("http://localhost:8000")
response = await client.send_message("Tell me about emotional intelligence")

print(response["response"])  # The text response
print(response["personality"])  # Current personality traits
print(response["mood"])  # Current emotional state
```

### Image Generation

```python
# Using the Python API client
from ai_companion.client import CompanionClient

client = CompanionClient("http://localhost:8000")
image_b64 = await client.generate_image("A serene mountain landscape with a lake")

# Save image to file
import base64
with open("generated_image.png", "wb") as f:
    f.write(base64.b64decode(image_b64))
```

### Web Interface

The web interface provides:
- Real-time chat with your AI companion
- Personality trait visualization
- Mood tracking
- Memory exploration
- Image generation requests
- Settings configuration

## Advanced Configuration

### Personality Customization

Modify `config/companion_config.json` to customize initial personality traits:

```json
{
  "name": "AI Companion",
  "personality_base": "friendly",
  "initial_traits": {
    "openness": 0.7,
    "conscientiousness": 0.8,
    "extraversion": 0.6,
    "agreeableness": 0.75,
    "neuroticism": 0.4
  }
}
```

### Prompt Templates

Customize conversation prompts in `config/prompt_templates.json`:

```json
{
  "empathetic_conversation": {
    "name": "empathetic_conversation",
    "template": "You are a warm and empathetic companion with these traits:\n{personality}\n\nYou're currently feeling:\n{emotional_state}\n\nRemembering these relevant moments:\n{memories}\n\nRecent conversation:\n{recent_context}\n\nRespond with empathy to: {user_message}",
    "variables": ["personality", "emotional_state", "memories", "recent_context", "user_message"],
    "description": "Empathetic and emotional response prompt",
    "category": "emotional"
  }
}
```

### Model Configuration

Configure your AI models in `config/model_config.json`:

```json
{
  "llama3-8b": {
    "name": "llama3-8b",
    "path": "models/gguf/llama3-8b.gguf",
    "type": "text",
    "format": "gguf",
    "device": "cuda",
    "config": {
      "n_gpu_layers": -1,
      "n_ctx": 4096,
      "n_batch": 512
    }
  },
  "sdxl": {
    "name": "sdxl",
    "path": "models/diffusers/stable-diffusion-xl-base-1.0",
    "type": "image",
    "format": "diffusers",
    "device": "cuda"
  }
}
```

## Performance Optimization

### Memory Usage

- Adjust `n_gpu_layers` in model configuration to control GPU memory usage
- Set `memory_retention` in companion configuration to limit conversation history

### Speed Optimization

- For faster image generation, reduce `num_inference_steps` (default: 30)
- For faster text responses, adjust `max_tokens` in model configuration

### Hardware Recommendations

- **Minimum**: NVIDIA GPU with 8GB VRAM, 16GB RAM
- **Recommended**: NVIDIA GPU with 16GB+ VRAM, 32GB RAM
- **Storage**: At least 20GB free SSD space for models and data

## Future Roadmap

- **Voice Integration**: Two-way voice communication
- **Multi-user Memory**: Separate memory spaces for different users
- **Advanced Emotion Analysis**: More nuanced emotional understanding
- **Public/Private Cloud Mode**: Easy deployment to cloud services
- **Mobile Integration**: Companion mobile applications

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Hugging Face](https://huggingface.co/) for model access
- [React](https://reactjs.org/) for the frontend framework
- [FastAPI](https://fastapi.tiangolo.com/) for the backend API
- [Langchain](https://github.com/hwchase17/langchain) for memory components
- [Diffusers](https://github.com/huggingface/diffusers) for image generation
