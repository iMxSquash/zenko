import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CapsuleFiche } from './CapsuleFiche';

describe('CapsuleFiche', () => {
  it('affiche le label de la catégorie', () => {
    render(<CapsuleFiche category="TSA" />);
    expect(screen.getByText('TSA')).toBeInTheDocument();
  });

  it.each([
    ['TSA', 'bg-orange-25'],
    ['DYS', 'bg-jaune-50'],
    ['TDAH', 'bg-vert-25'],
    ['TDI', 'bg-bleu-25'],
  ] as const)('applique bg-%s correctement', (category, expectedClass) => {
    render(<CapsuleFiche category={category} />);
    expect(screen.getByText(category)).toHaveClass(expectedClass);
  });

  it('fusionne la className passée en prop', () => {
    render(<CapsuleFiche category="TDAH" className="mt-2" />);
    expect(screen.getByText('TDAH')).toHaveClass('mt-2', 'bg-vert-25');
  });
});
