import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('affiche le texte enfant', () => {
    render(<Button>Découvrir</Button>);
    expect(screen.getByRole('button', { name: 'Découvrir' })).toBeInTheDocument();
  });

  it('applique la variante primary par défaut', () => {
    render(<Button>Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-brand-100');
  });

  it('applique la variante outline', () => {
    render(<Button variant="outline">Outline</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('border', 'border-border-default', 'bg-transparent');
    expect(btn).not.toHaveClass('bg-brand-100');
  });

  it('transmet les props natives (type, onClick)', () => {
    const onClick = vi.fn();
    render(
      <Button type="submit" onClick={onClick}>
        Envoyer
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('type', 'submit');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('est désactivé quand disabled', () => {
    render(<Button disabled>Désactivé</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveClass('disabled:opacity-40');
  });

  it('fusionne la className avec les classes de base', () => {
    render(<Button className="w-full">Plein</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full', 'bg-brand-100');
  });
});
