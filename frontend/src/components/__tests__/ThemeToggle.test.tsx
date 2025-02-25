import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../ThemeToggle';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock framer-motion to avoid animation-related issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>{children}</button>
    ),
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
  },
}));

describe('ThemeToggle', () => {
  const renderWithTheme = (initialTheme = 'light') => {
    // Mock localStorage for initial theme
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(initialTheme),
      setItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      })),
    });

    return render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
  };

  it('renders in light mode correctly', () => {
    renderWithTheme('light');
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');
    
    // Moon icon should be visible in light mode
    const moonPath = screen.getByRole('button').querySelector('path[d*="M20.354 15.354"]');
    expect(moonPath).toBeInTheDocument();
  });

  it('renders in dark mode correctly', () => {
    renderWithTheme('dark');
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to light theme');
    
    // Sun icon should be visible in dark mode
    const sunPath = screen.getByRole('button').querySelector('path[d*="M12 3v1m"]');
    expect(sunPath).toBeInTheDocument();
  });

  it('toggles theme when clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme('light');
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Should now show dark mode UI
    expect(button).toHaveAttribute('aria-label', 'Switch to light theme');
    const sunPath = button.querySelector('path[d*="M12 3v1m"]');
    expect(sunPath).toBeInTheDocument();
  });

  it('applies correct styles based on theme', () => {
    renderWithTheme('light');
    const button = screen.getByRole('button');
    
    // Check for light mode specific classes
    expect(button).toHaveClass(
      'from-white/50',
      'to-white/30',
      'hover:from-primary-ice/20',
      'hover:to-primary-royal/5'
    );
  });

  it('shows status indicator with correct color', () => {
    renderWithTheme('light');
    
    const statusIndicator = screen.getByRole('button').querySelector('div[class*="absolute -top-1"]');
    expect(statusIndicator).toHaveClass('bg-primary-royal');
  });

  it('maintains accessibility attributes', () => {
    renderWithTheme('light');
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  it('shows hover effects', async () => {
    const user = userEvent.setup();
    renderWithTheme('light');
    
    const button = screen.getByRole('button');
    const glowEffect = button.querySelector('div[class*="opacity-0 group-hover:opacity-100"]');
    
    expect(glowEffect).toBeInTheDocument();
    expect(glowEffect).toHaveClass('opacity-0', 'group-hover:opacity-100');
  });

  it('handles theme toggle animation states', async () => {
    const user = userEvent.setup();
    renderWithTheme('light');
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // After toggle, should show sun icon with animation classes
    const iconContainer = button.querySelector('div');
    expect(iconContainer).toHaveAttribute('animate');
  });

  it('preserves theme selection across re-renders', async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithTheme('light');
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Re-render the component
    rerender(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    // Should maintain dark theme
    expect(button).toHaveAttribute('aria-label', 'Switch to light theme');
  });
});
