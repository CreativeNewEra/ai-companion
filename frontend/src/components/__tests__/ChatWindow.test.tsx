import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatWindow } from '../ChatWindow';
import { vi } from 'vitest';
import { ModelProvider, type ModelService } from '../../context/ModelContext';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock ModelService
const mockModelService: ModelService = {
  getCapabilityDescription: (capability: string) => `Description for ${capability}`,
  getModels: () => ({
    'gpt-4': {
      name: 'GPT-4',
      capabilities: ['chat', 'completion'],
      groups: ['featured']
    }
  }),
  getCurrentModel: () => 'gpt-4',
  setCurrentModel: vi.fn()
};

// Mock messages with correct types
const mockMessages = [
  {
    id: '1',
    content: 'Hello!',
    role: 'user' as const,
    timestamp: new Date().toISOString(),
    status: 'sent' as const
  },
  {
    id: '2',
    content: 'Hi there! How can I help you today?',
    role: 'assistant' as const,
    timestamp: new Date().toISOString(),
    contextScore: 0.8
  }
];

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <ModelProvider modelService={mockModelService}>
        {children}
      </ModelProvider>
    </ThemeProvider>
  );
};

describe('ChatWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful fetch responses
    mockFetch.mockImplementation((url) => {
      if (url === '/api/personality/current') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            traits: {
              openness: 0.8,
              conscientiousness: 0.7,
              extraversion: 0.6,
              agreeableness: 0.9,
              neuroticism: 0.3
            }
          })
        });
      }
      if (url === '/api/emotions/current') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            primary: {
              type: 'joy',
              intensity: 0.8
            },
            secondary: {
              type: 'trust',
              intensity: 0.4
            }
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  it('renders correctly', async () => {
    render(
      <TestWrapper>
        <ChatWindow
          messages={mockMessages}
          onSubmit={() => {}}
          isLoading={false}
          error=""
        />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    });
  });

  it('handles message input and submission', async () => {
    const onSubmit = vi.fn();
    render(
      <TestWrapper>
        <ChatWindow
          messages={mockMessages}
          onSubmit={onSubmit}
          isLoading={false}
          error=""
        />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Test message' } });
    
    const sendButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendButton);

    expect(onSubmit).toHaveBeenCalledWith('Test message');
  });

  it('displays loading state while waiting for response', async () => {
    render(
      <TestWrapper>
        <ChatWindow
          messages={mockMessages}
          onSubmit={() => {}}
          isLoading={true}
          error=""
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    const errorMessage = 'Failed to get AI response. Please try again.';
    
    render(
      <TestWrapper>
        <ChatWindow
          messages={mockMessages}
          onSubmit={() => {}}
          isLoading={false}
          error={errorMessage}
        />
      </TestWrapper>
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows character count when typing', async () => {
    render(
      <TestWrapper>
        <ChatWindow
          messages={mockMessages}
          onSubmit={() => {}}
          isLoading={false}
          error=""
        />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello' } });

    expect(screen.getByText('5 / 2000')).toBeInTheDocument();
  });

  it('shows warning when approaching character limit', async () => {
    render(
      <TestWrapper>
        <ChatWindow
          messages={mockMessages}
          onSubmit={() => {}}
          isLoading={false}
          error=""
        />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('Type your message...');
    const longMessage = 'a'.repeat(1900);
    fireEvent.change(input, { target: { value: longMessage } });

    expect(screen.getByText(`${1900} / 2000`)).toBeInTheDocument();
    expect(screen.getByText(/approaching character limit/i)).toBeInTheDocument();
  });

  it('handles Enter key press for message submission', async () => {
    const onSubmit = vi.fn();
    render(
      <TestWrapper>
        <ChatWindow
          messages={mockMessages}
          onSubmit={onSubmit}
          isLoading={false}
          error=""
        />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(onSubmit).toHaveBeenCalledWith('Test message');
  });

  it('clears input after message submission', async () => {
    render(
      <TestWrapper>
        <ChatWindow
          messages={mockMessages}
          onSubmit={() => {}}
          isLoading={false}
          error=""
        />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('Type your message...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Test message' } });
    
    const sendButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendButton);

    expect(input.value).toBe('');
  });

  it('toggles sidebar visibility', async () => {
    render(
      <TestWrapper>
        <ChatWindow
          messages={mockMessages}
          onSubmit={() => {}}
          isLoading={false}
          error=""
        />
      </TestWrapper>
    );
    
    const toggleButton = screen.getByRole('button', { name: /expand sidebar/i });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeInTheDocument();
    });
  });
});
