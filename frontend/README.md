# AI Companion Frontend

A modern React-based chat interface for interacting with an AI companion. Built with React, TypeScript, Vite, and TailwindCSS.

## Features

- 💬 Real-time chat interface with AI responses
- 🎨 Modern, responsive design with dark mode support
- 📱 Collapsible sidebar for better mobile experience
- 🔄 Multiple AI model support with easy switching
- ⚡ Fast development with Vite and HMR
- 🎯 Type safety with TypeScript
- 🎨 Styling with TailwindCSS
- 🌓 Dark/Light theme support

## Components

### Core Components

- **ChatWindow**: Main chat interface component
  - Handles message display and interaction
  - Manages API communication
  - Implements auto-scrolling and loading states

- **Sidebar**: Collapsible navigation component
  - Model selection
  - Navigation options (Personality, Memory, Settings)
  - Theme toggle integration

- **MessageInput**: Enhanced input component
  - Text input with Enter key support
  - AI suggestions button
  - Send message functionality

### Additional Features

- Real-time error handling and notifications
- Smooth animations and transitions
- Accessibility support with ARIA labels
- Responsive design for all screen sizes

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Development

The project uses several modern tools and libraries:

- **Vite**: For fast development and building
- **TypeScript**: For type safety
- **TailwindCSS**: For styling
- **Framer Motion**: For animations
- **Lucide React**: For icons

### Project Structure

```
src/
├── components/        # React components
├── context/          # React context providers
├── utils/            # Utility functions
└── assets/           # Static assets
```

## Configuration

- **TypeScript**: Configuration in `tsconfig.json`
- **Vite**: Configuration in `vite.config.ts`
- **TailwindCSS**: Configuration in `tailwind.config.js`
- **ESLint**: Configuration in `eslint.config.js`

## API Integration

The frontend communicates with a FastAPI backend for:
- Fetching message history
- Sending and receiving messages
- Error handling and status updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
