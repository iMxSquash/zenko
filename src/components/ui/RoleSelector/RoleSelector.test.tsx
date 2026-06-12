import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RoleSelector } from './RoleSelector';

describe('RoleSelector', () => {
  it('affiche les trois rôles', () => {
    render(<RoleSelector value={null} onChange={vi.fn()} />);
    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.getByText('Enseignant·e')).toBeInTheDocument();
    expect(screen.getByText('Expert·e')).toBeInTheDocument();
  });

  it('appelle onChange avec le rôle sélectionné', () => {
    const onChange = vi.fn();
    render(<RoleSelector value={null} onChange={onChange} />);
    fireEvent.click(screen.getByText('Expert·e').closest('button') as HTMLElement);
    expect(onChange).toHaveBeenCalledWith('expert');
  });

  it('marque le rôle actif via aria-pressed', () => {
    render(<RoleSelector value="parent" onChange={vi.fn()} />);
    expect(screen.getByText('Parent').closest('button')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Expert·e').closest('button')).toHaveAttribute('aria-pressed', 'false');
  });
});
