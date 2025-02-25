# AI Companion: Your Digital Friend

A sophisticated AI companion application that creates an emotionally intelligent, personalized digital friend with dynamic personality evolution and multi-modal interaction capabilities.

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

### Intelligent Companionship
- **Dynamic Personality System**: Traits that gradually evolve based on conversations
- **Emotional State Tracking**: Real-time mood and emotional responses
- **Contextual Memory**: Remembers past conversations and preferences
- **Natural Conversations**: Fluid transitions between casual chat and deep topics
- **Genuine Evolution**: Companion develops consistent but evolving identity
- **Proactive Engagement**: Initiates conversations and suggests topics of interest

### Multi-Modal Interaction
- **Natural Conversation**: Human-like dialogue with contextual understanding
- **Visual Intelligence**: Image recognition and generation capabilities
- **Voice Interaction**: Speech recognition and natural voice responses (planned)
- **Empathetic Responses**: Recognition and appropriate reaction to emotional states
- **Contextual Humor**: Ability to understand and generate appropriate humor

### Advanced Memory System
- **Hierarchical Memory**: Multi-layered system for different types of memories (core, emotional, factual)
- **Contextual Recall**: Retrieves relevant memories based on conversation
- **Memory Consolidation**: Periodically organizes and connects related memories
- **Long-term Learning**: Identifies patterns in user preferences and topics
- **Memory Visualization**: Interactive tools to explore shared experiences
- **Semantic Search**: Vector-based similarity search for relevant memory retrieval

### Technical Features
- **Local-First Architecture**: Runs entirely on your computer for privacy
- **Flexible Model Support**: Compatible with multiple model formats (GGUF, Diffusers, Safetensors)
- **Efficient Resource Management**: Smart memory management for optimal performance
- **Model Switching**: Seamless switching between different AI models
- **Modern UI**: Responsive interface with real-time updates and typing indicators
- **Theme Support**: Light and dark mode with customizable themes

## Architecture

```
ai-companion/
├── frontend/           # React TypeScript frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── context/    # Application context
│   │   ├── hooks/      # Custom React hooks
│   │   └── utils/      # Utility functions
├── backend/            # Python backend
│   ├── app/
│   │   ├── core/       # Core AI companion systems
│   │   │   ├── personality.py  # Personality system
│   │   │   ├── memory.py       # Memory management
│   │   │   └── conversation.py # Conversation engine
│   │   ├── api/        # API endpoints
│   │   └── utils/      # Utility functions
│   ├── data/           # Data storage
│   ├── models/         # AI model storage
│   └── config/         # Configuration files
├── data/              # Data storage (git-ignored)
├── models/            # AI models (git-ignored)
└── logs/             # Application logs (git-ignored)
```

## Prerequisites

- Python 3.9+
- Node.js 16+
- NVIDIA GPU with CUDA support (recommended)
- 16GB RAM minimum (32GB recommended)
- SSD storage

## Getting Started

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ai-companion.git
cd ai-companion
```

2. **Create a Python virtual environment**
```bash
cd backend
python -m venv env
source env/bin/activate  # On Windows use: env\Scripts\activate
```

3. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
Create a `.env` file in the backend directory:
```env
HF_AUTH_TOKEN=your_hugging_face_token  # Optional for private models
DATABASE_PATH=data/memory.db
VECTOR_STORE_PATH=data/vector_store
MODEL_DIR=models
```

5. **Download initial models**
```bash
python download_models.py
```

### Frontend Setup

1. **Navigate to the frontend directory**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure environment**
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

## Running the Application

### Start the Backend
```bash
cd backend
./start.sh
```

### Start the Frontend
```bash
cd frontend
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Core Systems

The AI Companion consists of several integrated systems working together:

### 1. Personality System

The heart of the companion, enabling it to feel like a "real friend":

- **Trait Management**: Core personality traits (openness, conscientiousness, extraversion, agreeableness, neuroticism) that evolve gradually
- **Mood Tracking**: Dynamic emotional state with valence (positive/negative), arousal (energy level), and dominance (confidence)
- **Adaptation Mechanics**: Subtle personality shifts based on conversation patterns
- **Conversation Styles**: Adjusts tone and speaking style contextually

```
User Input → Sentiment Analysis → Trait Adjustment → Mood Update → Response Styling
```

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

### Model Configuration

Configure your language model in `backend/app/core/llm_manager.py`:

```python
llm_manager.add_model(GGUFConfig(
    name="your-model-name",
    path="/path/to/your/model.gguf",
    n_gpu_layers=-1,  # Use all available GPU layers
    n_ctx=8192,       # Context window size
    temperature=0.7   # Response randomness (higher = more creative)
))
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

## Advanced Features

### Dynamic Personality Evolution

The companion's personality evolves gradually based on your interactions:

- **Trait Momentum**: Changes build up slowly over time
- **Contextual Adaptation**: Different conversation topics affect traits differently
- **Pattern Recognition**: Identifies recurring themes in your communication
- **Mood Influence**: Current emotional state affects personality expression

### Emotional Intelligence

The companion recognizes and responds to your emotional state:

- **Sentiment Analysis**: Detects the emotional tone of your messages
- **Appropriate Responses**: Adjusts responses based on emotional context
- **Emotion Memory**: Remembers emotionally significant interactions
- **Empathy Modeling**: Responds with appropriate level of empathy

### Contextual Memory System

The companion builds a sophisticated network of memories:

- **Memory Types**: Episodic (events), semantic (facts), emotional (feelings)
- **Relevance Calculation**: Determines which memories to recall in context
- **Memory Consolidation**: Connects related memories over time
- **Learning Preferences**: Remembers your likes, dislikes, and interests

## Development Roadmap

### Near-term Goals
- Voice interaction implementation
- Advanced emotion recognition
- Enhanced proactive engagement
- Improved contextual humor

### Mid-term Goals
- Multi-user memory spaces
- Advanced relationship modeling
- Real-time emotion analysis
- Mobile companion applications

### Long-term Vision
- Full multi-modal interaction
- Advanced personality development
- Deep emotional understanding
- True companionship experience

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
- This project builds on research in affective computing and personality psychology
- Inspiration drawn from concepts of digital companions in science fiction

---

Built with ❤️ by [Your Name/Team]
