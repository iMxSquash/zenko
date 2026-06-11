import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TextInput } from './TextInput';

describe('TextInput', () => {
  it('affiche le label', () => {
    render(<TextInput label="Prénom" value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Prénom')).toBeInTheDocument();
  });

  it('appelle onChange à la saisie', () => {
    const onChange = vi.fn();
    render(<TextInput label="Prénom" value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Prénom'), { target: { value: 'Alex' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("affiche le message d'erreur et marque le champ invalide", () => {
    render(<TextInput label="Email" value="" onChange={vi.fn()} error="Email invalide" />);
    expect(screen.getByText('Email invalide')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('ne marque pas le champ invalide sans erreur', () => {
    render(<TextInput label="Email" value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'false');
  });
});
