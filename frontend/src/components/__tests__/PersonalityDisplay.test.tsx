import React from 'react';
import { render, screen } from '@testing-library/react';
import PersonalityDisplay from '../PersonalityDisplay';

const mockTraits = {
  openness: {
    name: 'openness',
    value: 0.6,
    description: 'Openness to new experiences',
    last_updated: '2025-02-22T19:00:00Z',
    history: []
  },
  conscientiousness: {
    name: 'conscientiousness',
    value: 0.7,
    description: 'Organization and responsibility',
    last_updated: '2025-02-22T19:00:00Z',
    history: []
  },
  extraversion: {
    name: 'extraversion',
    value: 0.5,
    description: 'Social engagement and energy',
    last_updated: '2025-02-22T19:00:00Z',
    history: []
  },
  agreeableness: {
    name: 'agreeableness',
    value: 0.8,
    description: 'Compassion and cooperativeness',
    last_updated: '2025-02-22T19:00:00Z',
    history: []
  },
  neuroticism: {
    name: 'neuroticism',
    value: 0.3,
    description: 'Emotional sensitivity and stability',
    last_updated: '2025-02-22T19:00:00Z',
    history: []
  },
  timestamp: '2025-02-22T19:00:00Z'
};

describe('PersonalityDisplay', () => {
  it('renders personality traits with correct values', () => {
    render(<PersonalityDisplay traits={mockTraits} />);

    // Check if title is rendered
    expect(screen.getByText('Personality Profile')).toBeInTheDocument();

    // Check if all traits are rendered
    expect(screen.getByText('openness')).toBeInTheDocument();
    expect(screen.getByText('conscientiousness')).toBeInTheDocument();
    expect(screen.getByText('extraversion')).toBeInTheDocument();
    expect(screen.getByText('agreeableness')).toBeInTheDocument();
    expect(screen.getByText('neuroticism')).toBeInTheDocument();

    // Check if trait values are rendered correctly
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();

    // Check if descriptions are rendered
    expect(screen.getByText('Openness to new experiences')).toBeInTheDocument();
    expect(screen.getByText('Organization and responsibility')).toBeInTheDocument();
    expect(screen.getByText('Social engagement and energy')).toBeInTheDocument();
    expect(screen.getByText('Compassion and cooperativeness')).toBeInTheDocument();
    expect(screen.getByText('Emotional sensitivity and stability')).toBeInTheDocument();
  });

  it('applies custom className prop', () => {
    const { container } = render(
      <PersonalityDisplay traits={mockTraits} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders progress bars with correct widths', () => {
    const { container } = render(<PersonalityDisplay traits={mockTraits} />);
    
    const progressBars = container.querySelectorAll('.rounded-full');
    const widths = Array.from(progressBars).map(bar => 
      (bar as HTMLElement).style.width
    );

    expect(widths).toContain('60%');
    expect(widths).toContain('70%');
    expect(widths).toContain('50%');
    expect(widths).toContain('80%');
    expect(widths).toContain('30%');
  });
});
