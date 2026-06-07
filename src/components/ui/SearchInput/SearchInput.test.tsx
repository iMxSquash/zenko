import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  it('affiche la valeur initiale', () => {
    render(<SearchInput value="test" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveValue('test');
  });

  it('affiche le placeholder', () => {
    render(<SearchInput value="" onChange={vi.fn()} placeholder="Rechercher..." />);
    expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument();
  });

  it('appelle onChange avec la nouvelle valeur', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'TSA' } });
    expect(onChange).toHaveBeenCalledWith('TSA');
  });

  it('appelle onChange une seule fois par frappe', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('applique la className passée en prop', () => {
    const { container } = render(<SearchInput value="" onChange={vi.fn()} className="w-64" />);
    expect(container.firstChild).toHaveClass('w-64');
  });
});
