import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Capsule } from './Capsule';

describe('Capsule', () => {
  it('affiche le contenu enfant', () => {
    render(<Capsule>TSA</Capsule>);
    expect(screen.getByText('TSA')).toBeInTheDocument();
  });

  it('applique la className passée en prop', () => {
    render(<Capsule className="bg-orange-25">TDAH</Capsule>);
    expect(screen.getByText('TDAH')).toHaveClass('bg-orange-25');
  });

  it('conserve les classes de base sans className', () => {
    render(<Capsule>DYS</Capsule>);
    const el = screen.getByText('DYS');
    expect(el).toHaveClass('inline-flex', 'uppercase', 'font-semibold');
  });

  it('fusionne className avec les classes de base', () => {
    render(<Capsule className="bg-vert-25">TDI</Capsule>);
    const el = screen.getByText('TDI');
    expect(el).toHaveClass('inline-flex', 'bg-vert-25');
  });
});
