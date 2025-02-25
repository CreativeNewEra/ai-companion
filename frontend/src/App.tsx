import { useState, useEffect } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { ThemeProvider } from './context/ThemeContext';
import { ModelProvider } from './context/ModelContext';
import ModelService from './services/ModelService';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
  contextScore?: number;
  type?: 'text' | 'image';
  imageData?: {
    base64: string;
    prompt: string;
    generationTime: number;
  };
}

function App() {
  const modelService = ModelService.getInstance();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch initial messages
    fetch(`${modelService.baseUrl}/messages`)
      .then(res => res.json())
      .then(data => {
        setMessages(data.map((msg: any) => ({
          id: crypto.randomUUID(),
          content: msg.content,
          isUser: msg.is_user,
          timestamp: msg.timestamp,
          status: 'sent'
        })));
      })
      .catch(err => {
        console.error('Failed to fetch messages:', err);
        setError('Failed to load messages');
      });
  }, []);

  const handleSubmit = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      isUser: true,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError('');

    try {
      // Check if this is an image generation message
      if (content.startsWith('Generated image:')) {
        // Extract prompt from the message
        const prompt = content.replace('Generated image:', '').trim();
        
        // Update user message status and add image type
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'sent', type: 'text' } : msg
        ));

        // Add AI image message
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          content: prompt,
          isUser: false,
          timestamp: new Date().toISOString(),
          status: 'sent',
          type: 'image',
          imageData: {
            base64: content.split(',')[1], // Extract base64 from the content
            prompt: prompt,
            generationTime: 0 // This will be set by the ImageGenerator component
          }
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Regular chat message
        const data = await modelService.sendMessage(content);
        
        // Update user message status
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        ));

        // Add AI response
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          content: data.response,
          isUser: false,
          timestamp: new Date().toISOString(),
          status: 'sent',
          type: 'text'
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
      // Update user message status to error
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <ModelProvider modelService={modelService}>
        <ChatWindow 
          messages={messages}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          modelService={modelService}
        />
      </ModelProvider>
    </ThemeProvider>
  );
}

export default App;
