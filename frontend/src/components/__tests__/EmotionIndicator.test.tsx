import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import EmotionIndicator, { EmotionType } from '../EmotionIndicator';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, style, className }: any) => (
      <div style={style} className={className}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockEmotion = {
  primary: 'JOY' as EmotionType,
  intensity: 0.8,
  secondary: 'TRUST' as EmotionType,
  secondaryIntensity: 0.4,
  timestamp: '2025-02-22T19:00:00Z',
  trigger_message_id: 1
};

describe('EmotionIndicator', () => {
  it('renders primary emotion with correct intensity', () => {
    render(<EmotionIndicator emotion={mockEmotion} />);

    // Check if primary emotion is rendered
    expect(screen.getByText('Joy')).toBeInTheDocument();
    expect(screen.getByText('Intensity: 80%')).toBeInTheDocument();

    // Check if emoji is rendered
    expect(screen.getByRole('img', { name: 'joy' })).toBeInTheDocument();
  });

  it('renders secondary emotion when present', () => {
    render(<EmotionIndicator emotion={mockEmotion} />);

    // Check if secondary emotion is rendered with intensity
    expect(screen.getByText(/with Trust/)).toBeInTheDocument();
    expect(screen.getByText(/\(40%\)/)).toBeInTheDocument();
  });

  it('does not render secondary emotion when not present', () => {
    const emotionWithoutSecondary = {
      ...mockEmotion,
      secondary: undefined,
      secondaryIntensity: undefined
    };
    
    render(<EmotionIndicator emotion={emotionWithoutSecondary} />);

    // Check that secondary emotion is not rendered
    expect(screen.queryByText(/with/)).not.toBeInTheDocument();
  });

  it('applies custom className prop', () => {
    const { container } = render(
      <EmotionIndicator emotion={mockEmotion} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders intensity bar with correct width', () => {
    const { container } = render(<EmotionIndicator emotion={mockEmotion} />);
    
    const intensityBar = container.querySelector('.h-full.rounded-full');
    expect(intensityBar).toHaveStyle({ width: '80%' });
  });

  it('renders different emotions with correct colors', () => {
    const emotions = [
      { emotion: 'NEUTRAL' as EmotionType, expectedColor: '#9CA3AF' },
      { emotion: 'JOY' as EmotionType, expectedColor: '#FCD34D' },
      { emotion: 'SADNESS' as EmotionType, expectedColor: '#60A5FA' },
      { emotion: 'ANGER' as EmotionType, expectedColor: '#EF4444' },
      { emotion: 'FEAR' as EmotionType, expectedColor: '#7C3AED' },
      { emotion: 'SURPRISE' as EmotionType, expectedColor: '#F472B6' },
      { emotion: 'TRUST' as EmotionType, expectedColor: '#34D399' },
      { emotion: 'ANTICIPATION' as EmotionType, expectedColor: '#F59E0B' }
    ];

    emotions.forEach(({ emotion, expectedColor }) => {
      const { container } = render(
        <EmotionIndicator
          emotion={{
            ...mockEmotion,
            primary: emotion
          }}
        />
      );

      const emotionIndicator = container.querySelector('.rounded-full');
      expect(emotionIndicator).toHaveStyle({ backgroundColor: expectedColor });
    });
  });

  it('renders correct emoji for each emotion type', () => {
    const emotions = [
      { type: 'NEUTRAL' as EmotionType, emoji: '😐' },
      { type: 'JOY' as EmotionType, emoji: '😊' },
      { type: 'SADNESS' as EmotionType, emoji: '😢' },
      { type: 'ANGER' as EmotionType, emoji: '😠' },
      { type: 'FEAR' as EmotionType, emoji: '😨' },
      { type: 'SURPRISE' as EmotionType, emoji: '😮' },
      { type: 'TRUST' as EmotionType, emoji: '🤝' },
      { type: 'ANTICIPATION' as EmotionType, emoji: '🤔' }
    ];

    emotions.forEach(({ type, emoji }) => {
      const { container } = render(
        <EmotionIndicator
          emotion={{
            ...mockEmotion,
            primary: type
          }}
        />
      );

      const emojiElement = container.querySelector('[role="img"]');
      expect(emojiElement).toHaveTextContent(emoji);
    });
  });

  it('handles low intensity emotions', () => {
    const lowIntensityEmotion = {
      ...mockEmotion,
      intensity: 0.1
    };

    render(<EmotionIndicator emotion={lowIntensityEmotion} />);
    expect(screen.getByText('Intensity: 10%')).toBeInTheDocument();
  });

  it('formats emotion names correctly', () => {
    render(<EmotionIndicator emotion={mockEmotion} />);
    
    // Check if emotion name is properly capitalized
    const emotionName = screen.getByText('Joy');
    expect(emotionName.textContent).toBe('Joy');
    expect(emotionName.textContent).not.toBe('JOY');
  });
});
