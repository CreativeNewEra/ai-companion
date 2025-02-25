import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Sidebar } from '../Sidebar';
import { useModel, useModelCapabilities } from '../../context/ModelContext';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

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

// Mock the ModelContext hooks
vi.mock('../../context/ModelContext', () => ({
  useModel: vi.fn(),
  useModelCapabilities: vi.fn()
}));

describe('Sidebar', () => {
  const mockOnToggle = vi.fn();
  const mockSwitchModel = vi.fn();

  const defaultProps = {
    isExpanded: true,
    onToggle: mockOnToggle,
    onPersonalityClick: vi.fn()
  };

  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <ThemeProvider>
        {children}
      </ThemeProvider>
    );
  };

  const mockModelService = {
    getModels: vi.fn().mockReturnValue({
      'ollama:llama2': {
        name: 'llama2',
        capabilities: ['chat', 'instruction_following'],
        groups: ['ollama']
      },
      'ollama:mistral': {
        name: 'mistral',
        capabilities: ['chat', 'instruction_following'],
        groups: ['ollama']
      }
    }),
    getCapabilityDescription: vi.fn().mockReturnValue('Test description'),
    getCurrentModel: vi.fn().mockReturnValue('ollama:llama2'),
    setCurrentModel: mockSwitchModel
  };

  const mockModelContext = {
    currentModel: 'ollama:llama2',
    setCurrentModel: mockSwitchModel,
    modelService: mockModelService
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useModel as any).mockReturnValue(mockModelContext);
    (useModelCapabilities as any).mockReturnValue([
      { name: 'chat', description: 'Test description' },
      { name: 'instruction_following', description: 'Test description' }
    ]);
  });

  it('renders correctly when expanded', () => {
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText('AI Companion')).toBeInTheDocument();
    expect(screen.getByText('Current Model')).toBeInTheDocument();
  });

  it('renders correctly when collapsed', () => {
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} isExpanded={false} />
      </TestWrapper>
    );
    expect(screen.queryByText('AI Companion')).not.toBeVisible();
  });

  it('toggles sidebar visibility', () => {
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} />
      </TestWrapper>
    );
    const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
    fireEvent.click(toggleButton);
    expect(mockOnToggle).toHaveBeenCalled();
  });

  it('displays loading state', () => {
    (useModel as any).mockReturnValue({
      ...mockModelContext,
      isLoading: true
    });
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays error state', () => {
    (useModel as any).mockReturnValue({
      ...mockModelContext,
      error: 'Failed to load models'
    });
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText('Failed to load models')).toBeInTheDocument();
  });

  it('switches model when selection changes', () => {
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} />
      </TestWrapper>
    );
    const select = screen.getByRole('combobox', { name: /select ollama model/i });
    fireEvent.change(select, { target: { value: 'ollama:mistral' } });
    expect(mockSwitchModel).toHaveBeenCalledWith('ollama', 'mistral');
  });

  it('displays model capabilities', () => {
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText('chat')).toBeInTheDocument();
    expect(screen.getByText('instruction_following')).toBeInTheDocument();
  });

  it('displays model groups correctly', () => {
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText('Ollama Models')).toBeInTheDocument();
  });
});
