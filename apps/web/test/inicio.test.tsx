import { render, screen } from '@testing-library/react';
import Inicio from '../src/app/page';
import { expect, test } from '@jest/globals';

test('identifica a página inicial por um título acessível', () => {
  render(<Inicio />);
  expect(screen.getByRole('heading', { name: 'Compras domésticas' })).toBeDefined();
});
