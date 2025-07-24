import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('renders welcome message', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Welcome to AIAlpha')).toBeInTheDocument();
    expect(screen.getByText('Multi-tenant SaaS Data Visualization Platform')).toBeInTheDocument();
  });

  it('renders getting started section', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText(/Your development environment is ready/)).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    render(<HomePage />);
    
    const container = screen.getByText('Welcome to AIAlpha').closest('div');
    expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
  });
});