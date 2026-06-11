import { describe, expect, it } from 'vitest';
import { assertValidSocialUrl } from './socialLinks';

describe('assertValidSocialUrl', () => {
  it('allows an empty value', () => {
    expect(() => assertValidSocialUrl('', 'linkedin', 'LinkedIn')).not.toThrow();
  });

  it('accepts a valid LinkedIn url', () => {
    expect(() =>
      assertValidSocialUrl('https://www.linkedin.com/in/jane-doe', 'linkedin', 'LinkedIn')
    ).not.toThrow();
  });

  it('accepts a valid Instagram url', () => {
    expect(() =>
      assertValidSocialUrl('https://instagram.com/jane.doe', 'instagram', 'Instagram')
    ).not.toThrow();
  });

  it('accepts twitter.com and x.com urls', () => {
    expect(() =>
      assertValidSocialUrl('https://x.com/jane_doe', 'twitter', 'Twitter / X')
    ).not.toThrow();
    expect(() =>
      assertValidSocialUrl('https://twitter.com/jane_doe', 'twitter', 'Twitter / X')
    ).not.toThrow();
  });

  it('accepts a valid Doctolib url', () => {
    expect(() =>
      assertValidSocialUrl(
        'https://www.doctolib.fr/psychologue/paris/jane-doe',
        'doctolib',
        'Doctolib'
      )
    ).not.toThrow();
  });

  it('rejects a url for the wrong platform', () => {
    expect(() =>
      assertValidSocialUrl('https://www.facebook.com/jane.doe', 'linkedin', 'LinkedIn')
    ).toThrow('Lien LinkedIn invalide.');
  });

  it('rejects a non-url value', () => {
    expect(() => assertValidSocialUrl('jane-doe', 'instagram', 'Instagram')).toThrow(
      'Lien Instagram invalide.'
    );
  });
});
