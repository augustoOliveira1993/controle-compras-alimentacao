import { createElement, type ReactNode } from 'react';

export function PageTitle({ children }: { children: ReactNode }) {
  return createElement('h1', { className: 'text-2xl font-semibold' }, children);
}
