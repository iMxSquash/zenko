import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AvatarPicker } from './AvatarPicker';

const AVATARS = ['https://example.com/avatar-1.png', 'https://example.com/avatar-2.png'];

describe('AvatarPicker', () => {
  it('affiche un avatar par image', () => {
    render(<AvatarPicker avatars={AVATARS} value={null} onChange={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('appelle onChange avec l’url sélectionnée', () => {
    const onChange = vi.fn();
    render(<AvatarPicker avatars={AVATARS} value={null} onChange={onChange} />);
    fireEvent.click(screen.getAllByRole('button')[1]);
    expect(onChange).toHaveBeenCalledWith(AVATARS[1]);
  });

  it('marque l’avatar sélectionné comme actif', () => {
    render(<AvatarPicker avatars={AVATARS} value={AVATARS[0]} onChange={vi.fn()} />);
    expect(screen.getAllByRole('button')[0]).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('button')[1]).toHaveAttribute('aria-pressed', 'false');
  });

  it('affiche un message si aucun avatar disponible', () => {
    render(<AvatarPicker avatars={[]} value={null} onChange={vi.fn()} />);
    expect(screen.getByText('Aucun avatar disponible.')).toBeInTheDocument();
  });
});
