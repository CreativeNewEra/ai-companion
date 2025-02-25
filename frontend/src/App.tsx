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
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Fetch initial messages
    modelService.getMessages()
      .then(data => {
        setMessages(data.map((msg: any) => ({
          id: msg.id || crypto.randomUUID(),
          content: msg.content,
          isUser: msg.isUser,
          timestamp: msg.timestamp,
          status: 'sent'
        })));
      })
      .catch(err => {
        console.error('Failed to fetch messages:', err);
        setError('Failed to load messages');
      });
      
    // Setup WebSocket connection
    const ws = modelService.createWebSocketConnection();
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'typing_indicator') {
          // Handle typing indicator
          setIsLoading(data.is_typing);
        } else if (data.type === 'response' || data.type === 'response_complete') {
          // Handle complete response
          const aiMessage: Message = {
            id: crypto.randomUUID(),
            content: data.content,
            isUser: false,
            timestamp: new Date().toISOString(),
            status: 'sent',
            type: 'text'
          };
          setMessages(prev => [...prev, aiMessage]);
          setIsLoading(false);
        } else if (data.type === 'error') {
          // Handle error
          setError(data.message || 'An error occurred');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };
    
    setWebSocket(ws);
    
    // Cleanup WebSocket on unmount
    return () => {
      ws.close();
    };
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
        setIsLoading(false);
      } else {
        // Regular chat message - try WebSocket first, fall back to HTTP
        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
          // Update user message status
          setMessages(prev => prev.map(msg => 
            msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
          ));
          
          // Send via WebSocket
          webSocket.send(JSON.stringify({
            content,
            model_id: modelService.getCurrentTextModel(),
            stream: true
          }));
        } else {
          // Fall back to HTTP API
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
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
      // Update user message status to error
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
      ));
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
