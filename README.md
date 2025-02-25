# AI Companion with Ollama Integration

A sophisticated AI companion application that creates an emotionally intelligent, personalized digital friend with dynamic personality evolution and multi-modal interaction capabilities. This implementation integrates with Ollama to use your locally downloaded models.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Overview

AI Companion creates a truly personal digital friend that evolves through natural interactions. Unlike typical chatbots, this companion develops a consistent personality that adapts subtly over time, remembers your conversations in context, and responds with appropriate emotional intelligence. Built with advanced emotional intelligence, dynamic personality traits, and multi-modal capabilities, it provides a genuine companionship experience that goes beyond simple chat interactions.

## Core Principles

- **Natural Interaction**: Conversations flow naturally and authentically
- **Adaptive Personality**: The companion evolves its personality organically based on your interactions
- **Emotional Intelligence**: Recognizes, responds to, and expresses emotions appropriately
- **Contextual Memory**: Remembers important details about previous conversations
- **Privacy-First**: All data stays on your machine, ensuring complete privacy
- **Relationship Building**: Tracks relationship development and adapts communication style
- **Proactive Engagement**: Initiates conversations and maintains connection

## Key Features

- **Ollama Integration**: Use any text or image generation model you have downloaded with Ollama
- **Dynamic Personality System**: Traits that gradually evolve based on conversations
- **Emotional State Tracking**: Real-time mood and emotional responses
- **Contextual Memory**: Remembers past conversations and preferences
- **Multi-Modal Interaction**: Text chat and image generation
- **WebSocket Support**: Real-time streaming responses
- **Modern UI**: Responsive design with light and dark mode

## Prerequisites

- [Ollama](https://ollama.ai/) installed and running
- At least one text model downloaded in Ollama (e.g., `ollama pull llama2`)
- Python 3.9+
- Node.js 16+
- NVIDIA GPU with CUDA support (recommended)
- 16GB RAM minimum (32GB recommended)
- SSD storage

## Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ai-companion.git
cd ai-companion
```

2. **Run the setup script**
```bash
./setup.sh
```

3. **Start Ollama**
```bash
ollama serve
```

4. **Start the AI Companion**
```bash
./start.sh
```

5. **Access the application**
Open your browser and navigate to http://localhost:5173

6. **Stop the application**
```bash
./stop.sh
```

## Available Models

The AI Companion will automatically detect and use any models you have downloaded with Ollama:

- **Text Models**: Used for conversation (e.g., llama2, mistral, codellama)
- **Image Models**: Used for image generation (e.g., stable-diffusion)

You can download additional models with:
```bash
ollama pull llama2
ollama pull mistral
ollama pull stable-diffusion
```

## Configuration

### Backend Configuration

Edit the `.env` file in the `backend` directory:

```env
# Ollama configuration
OLLAMA_URL=http://localhost:11434
DEFAULT_TEXT_MODEL=llama2
DEFAULT_IMAGE_MODEL=stable-diffusion

# Data storage
DATA_DIR=data
```

### Frontend Configuration

Edit the `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

## Project Structure

```
ai-companion/
├── frontend/           # React TypeScript frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── context/    # Application context
│   │   ├── services/   # API services
│   │   └── utils/      # Utility functions
├── backend/            # Python backend
│   ├── app/
│   │   ├── core/       # Core AI companion systems
│   │   │   ├── personality.py  # Personality system
│   │   │   ├── memory.py       # Memory management
│   │   │   ├── backends/       # Model backends
│   │   │   └── conversation.py # Conversation engine
│   │   ├── api/        # API endpoints
│   │   └── utils/      # Utility functions
│   ├── data/           # Data storage
│   └── logs/           # Application logs
├── scripts/            # Utility scripts
├── docs/               # Documentation
├── data/               # Data storage (git-ignored)
├── models/             # AI models (git-ignored)
└── logs/               # Application logs (git-ignored)
```

## Core Systems

The AI Companion consists of several integrated systems working together:

### 1. Personality System

The heart of the companion, enabling it to feel like a "real friend":

- **Trait Management**: Core personality traits (openness, conscientiousness, extraversion, agreeableness, neuroticism) that evolve gradually
- **Mood Tracking**: Dynamic emotional state with valence (positive/negative), arousal (energy level), and dominance (confidence)
- **Adaptation Mechanics**: Subtle personality shifts based on conversation patterns
- **Conversation Styles**: Adjusts tone and speaking style contextually

### 2. Memory System

Creates a sense of continuity and relationship building:

- **Hierarchical Memory**: Different types of memories (core, emotional, factual)
- **Contextual Recall**: Retrieves relevant memories based on conversation
- **Memory Consolidation**: Periodically organizes and connects related memories
- **Long-term Learning**: Identifies patterns in user preferences and topics
- **Memory Graph**: Establishes connections between related memories for better context

### 3. Conversation Engine

Manages the natural flow of interaction:

- **Context Tracking**: Maintains coherent conversation threads
- **Prompt Engineering**: Creates rich, detailed prompts for the AI model
- **Response Generation**: Creates natural-sounding responses with personality
- **Multi-modal Integration**: Handles text, voice, and visual elements

## Advanced Configuration

### Personality Customization

Modify `config/companion_config.json` to customize initial personality traits:

```json
{
  "personality_base": "friendly",
  "initial_traits": {
    "openness": 0.7,
    "conscientiousness": 0.8,
    "extraversion": 0.6,
    "agreeableness": 0.75,
    "neuroticism": 0.4
  },
  "interaction_style": {
    "humor_frequency": 0.3,
    "empathy_level": 0.8,
    "formality_level": 0.4
  }
}
```

### Memory Configuration

Adjust memory settings in `config/memory_config.json`:

```json
{
  "memory_layers": {
    "working": {
      "max_items": 10,
      "retention_time": "1h"
    },
    "short_term": {
      "max_items": 100,
      "retention_time": "24h"
    },
    "long_term": {
      "importance_threshold": 0.7,
      "consolidation_interval": "12h"
    }
  }
}
```

## Performance Optimization

### Memory Usage
- Adjust `n_gpu_layers` in model configuration to control GPU memory usage
- Configure memory retention settings to manage conversation history
- Use model quantization for reduced memory footprint

### Speed Optimization
- Enable batch processing for faster responses
- Adjust model parameters for optimal performance
- Use caching for frequently accessed memories

### Hardware Recommendations
- **Minimum**: NVIDIA GPU with 8GB VRAM, 16GB RAM
- **Recommended**: NVIDIA GPU with 16GB+ VRAM, 32GB RAM
- **Storage**: At least 20GB free SSD space for models and data

## Troubleshooting

### Common Issues

1. **Model Loading Errors**
   - Verify the model path in `.env` is correct
   - Ensure you have sufficient GPU memory
   - Try reducing `n_gpu_layers` if you have memory limitations

2. **Slow Responses**
   - Reduce context window size in model configuration
   - Try a smaller language model
   - Check for background processes using GPU resources

3. **Personality Not Adapting**
   - Personality adapts gradually over many conversations
   - Check adaptation settings in `personality.py`
   - Ensure the database is writeable

## Development

### Backend Development

The backend is built with FastAPI and provides:
- REST API endpoints for chat, personality, emotions, and image generation
- WebSocket support for real-time streaming responses
- Integration with Ollama for model inference

### Frontend Development

The frontend is built with React, TypeScript, and Vite:
- Modern UI with TailwindCSS
- Real-time chat with WebSocket support
- Model selection for both text and image models
- Personality and emotion visualization

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Some areas that welcome contribution:
- **Personality System Enhancements**: Improve trait adaptation and emotional intelligence
- **Memory Improvements**: Enhance contextual memory and retrieval
- **UI Development**: Create more natural and responsive interfaces
- **Model Optimization**: Improve performance on different hardware
- **Documentation**: Help improve guides and examples

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Hugging Face](https://huggingface.co/) for model access
- [React](https://reactjs.org/) for the frontend framework
- [FastAPI](https://fastapi.tiangolo.com/) for the backend API
- [Langchain](https://github.com/hwchase17/langchain) for memory components
- [Diffusers](https://github.com/huggingface/diffusers) for image generation
- [Ollama](https://ollama.ai/) for local model serving
