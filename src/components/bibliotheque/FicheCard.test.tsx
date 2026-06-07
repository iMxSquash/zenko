import type { Fiche } from '@/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FicheCard } from './FicheCard';

const mockFiche: Fiche = {
  slug: 'adapter-consignes',
  title: 'Adapter les consignes longues en 3 pictogrammes',
  description: 'Méthode visuelle pour segmenter les instructions. Modèle imprimable inclus.',
  category: 'TDAH',
  author: 'Dr Lambert',
};

describe('FicheCard', () => {
  it('affiche le titre', () => {
    render(<FicheCard fiche={mockFiche} />);
    expect(screen.getByText(mockFiche.title)).toBeInTheDocument();
  });

  it('affiche la description', () => {
    render(<FicheCard fiche={mockFiche} />);
    expect(screen.getByText(mockFiche.description)).toBeInTheDocument();
  });

  it("affiche le nom de l'auteur", () => {
    render(<FicheCard fiche={mockFiche} />);
    expect(screen.getByText('Dr Lambert')).toBeInTheDocument();
  });

  it('affiche la CapsuleFiche avec la bonne catégorie', () => {
    render(<FicheCard fiche={mockFiche} />);
    expect(screen.getByText('TDAH')).toBeInTheDocument();
  });

  it('affiche la couverture avec la couleur de la catégorie', () => {
    const { container } = render(<FicheCard fiche={mockFiche} />);
    const cover = container.querySelector('.bg-vert-75');
    expect(cover).toBeInTheDocument();
  });

  it('affiche un avatar placeholder quand authorAvatarUrl est absent', () => {
    const { container } = render(<FicheCard fiche={mockFiche} />);
    expect(container.querySelector('.bg-neutral-100')).toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it("affiche l'image avatar quand authorAvatarUrl est fourni", () => {
    const { container } = render(
      <FicheCard fiche={{ ...mockFiche, authorAvatarUrl: '/avatar.png' }} />
    );
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/avatar.png');
  });
});
