import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../ThemeContext';

// Test component that uses the theme context
const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

describe('ThemeContext', () => {
  // Mock localStorage
  const mockStorage = {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
  };

  beforeEach(() => {
    // Reset mocks
    mockStorage.getItem.mockReset();
    mockStorage.setItem.mockReset();

    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true
    });

    // Mock matchMedia
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('uses light theme by default', () => {
    render(<ThemeProvider><TestComponent /></ThemeProvider>);
    
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
  });

  it('persists theme choice', async () => {
    const user = userEvent.setup();
    render(<ThemeProvider><TestComponent /></ThemeProvider>);
    
    await user.click(screen.getByText('Toggle Theme'));
    
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('loads saved theme from localStorage', () => {
    mockStorage.getItem.mockReturnValue('dark');
    render(<ThemeProvider><TestComponent /></ThemeProvider>);
    
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('uses dark theme when system prefers dark mode', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<ThemeProvider><TestComponent /></ThemeProvider>);
    
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('throws error when useTheme is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');
    
    consoleError.mockRestore();
  });
});
