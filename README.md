# AI Companion

A full-stack AI companion application with real-time chat, emotion indicators, and image generation capabilities.

## Features

- Real-time chat interface with AI
- Emotion indicators for AI responses
- Image generation capabilities
- Personality customization
- Theme toggle (light/dark mode)
- Responsive design

## Project Structure

```
.
├── frontend/           # React TypeScript frontend
├── backend/           # Python backend
├── data/             # Data storage (git-ignored)
├── models/           # AI models (git-ignored)
└── logs/             # Application logs (git-ignored)
```

## Prerequisites

- Node.js (16.x or higher)
- Python (3.8 or higher)
- npm or yarn

## Installation

### Backend Setup

1. Create a Python virtual environment:
```bash
python -m venv env
source env/bin/activate  # On Windows use: env\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

## Configuration

1. Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:5000
```

## Running the Application

### Start the Backend

```bash
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

## Development

- Frontend is built with React, TypeScript, and Vite
- Backend uses Python with RESTful APIs
- Uses SQLite for data storage
- Implements real-time chat capabilities
- Includes comprehensive test suite

## Testing

### Frontend Tests
```bash
cd frontend
npm test
# or
yarn test
```

### Backend Tests
```bash
cd backend
python -m pytest
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
