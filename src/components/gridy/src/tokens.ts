import type { InjectionKey } from 'vue';

import type { GridyContext } from './use-gridy';

import { inject } from 'vue';

export type { GridyContext } from './use-gridy';

export const GRIDY_CONTEXT_KEY: InjectionKey<GridyContext> = Symbol('GridyContext');

export function useGridyContext(): GridyContext {
  const ctx = inject(GRIDY_CONTEXT_KEY);
  if (!ctx) {
    throw new Error('[Gridy] useGridyContext() must be used inside <Gridy> component tree.');
  }
  return ctx;
}
