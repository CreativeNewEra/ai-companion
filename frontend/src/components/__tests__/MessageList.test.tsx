import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageList } from '../MessageList';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Avatar component
vi.mock('../Avatar', () => ({
  Avatar: ({ isUser }: { isUser: boolean }) => (
    <div data-testid={`avatar-${isUser ? 'user' : 'ai'}`}>
      Avatar
    </div>
  ),
}));

// Mock scroll behavior
Element.prototype.scrollIntoView = vi.fn();

describe('MessageList', () => {
  const mockMessages = [
    {
      id: 1,
      content: 'Hello!',
      isUser: true,
      timestamp: '2025-02-22T18:25:00',
      status: 'sent' as const,
    },
    {
      id: 2,
      content: 'Hi there! How can I help you today?',
      isUser: false,
      timestamp: '2025-02-22T18:25:30',
      contextScore: 0.8,
    },
    {
      id: 3,
      content: 'I have a question.',
      isUser: true,
      timestamp: '2025-02-22T18:26:00',
      status: 'sending' as const,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all messages correctly', () => {
    render(<MessageList messages={mockMessages} />);
    
    mockMessages.forEach(message => {
      expect(screen.getByText(message.content)).toBeInTheDocument();
    });
  });

  it('displays correct avatars for user and AI messages', () => {
    render(<MessageList messages={mockMessages} />);
    
    const userAvatars = screen.getAllByTestId('avatar-user');
    const aiAvatars = screen.getAllByTestId('avatar-ai');
    
    expect(userAvatars).toHaveLength(2); // Two user messages
    expect(aiAvatars).toHaveLength(1); // One AI message
  });

  it('shows message status indicators for user messages', () => {
    render(<MessageList messages={mockMessages} />);
    
    const sentMessage = screen.getByText('Hello!').parentElement?.parentElement;
    const sendingMessage = screen.getByText('I have a question.').parentElement?.parentElement;
    
    const sentStatus = sentMessage?.querySelector('.bg-green-400');
    const sendingStatus = sendingMessage?.querySelector('.bg-blue-400');
    
    expect(sentStatus).toBeInTheDocument();
    expect(sendingStatus).toBeInTheDocument();
  });

  it('shows context score indicator for AI messages', () => {
    render(<MessageList messages={mockMessages} />);
    
    const aiMessage = screen.getByText('Hi there! How can I help you today?').closest('div');
    const contextIndicator = aiMessage?.querySelector('[class*="bg-primary-electric"]');
    
    expect(contextIndicator).toBeInTheDocument();
    expect(contextIndicator).toHaveStyle({ opacity: '0.8' });
  });

  it('displays relative timestamps', () => {
    render(<MessageList messages={mockMessages} />);
    
    // Using regex to match the expected timestamp formats
    expect(screen.getAllByText(/just now|[0-9]+[mhs] ago/)).toHaveLength(mockMessages.length);
  });

  it('scrolls to bottom when new messages arrive', () => {
    render(<MessageList messages={mockMessages} />);
    
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('applies correct styling for user and AI messages', () => {
    render(<MessageList messages={mockMessages} />);
    
    const userMessage = screen.getByText('Hello!').closest('div');
    const aiMessage = screen.getByText('Hi there! How can I help you today?').closest('div');
    
    expect(userMessage).toHaveClass('bg-gradient-to-br');
    expect(aiMessage).toHaveClass('bg-white', 'dark:bg-dark-700');
  });

  it('handles empty message list', () => {
    render(<MessageList messages={[]} />);
    
    expect(screen.queryByTestId('avatar-user')).not.toBeInTheDocument();
    expect(screen.queryByTestId('avatar-ai')).not.toBeInTheDocument();
  });

  it('maintains message order', () => {
    render(<MessageList messages={mockMessages} />);
    
    const messages = screen.getAllByText(/Hello!|Hi there!|I have a question./);
    expect(messages[0]).toHaveTextContent('Hello!');
    expect(messages[1]).toHaveTextContent('Hi there! How can I help you today?');
    expect(messages[2]).toHaveTextContent('I have a question.');
  });

  it('shows exact time on hover', () => {
    render(<MessageList messages={mockMessages} />);
    
    const timeElements = screen.getAllByText(/6:25 PM/);
    expect(timeElements.length).toBeGreaterThan(0);
    timeElements.forEach(element => {
      expect(element).toHaveClass('opacity-0', 'group-hover:opacity-100');
    });
  });
});
