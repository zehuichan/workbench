import type { Plugin } from 'vite';

import type { CreateMockAppOptions } from './app.ts';

import { toNodeHandler } from 'h3/node';

import { createMockApp } from './app.ts';

const API_PREFIX = '/api/';

/**
 * Serves `createMockApp(options)` for `/api/*` on the Vite dev server, so `pnpm dev` stays one process on one port.
 * Build and preview output never contains it.
 */
export function mockServer(options: CreateMockAppOptions = {}): Plugin {
  return {
    apply: 'serve',
    configureServer(server) {
      const handle = toNodeHandler(createMockApp(options));
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith(API_PREFIX)) {
          next();
          return;
        }
        Promise.resolve(handle(req, res)).catch(next);
      });
    },
    name: 'workbench:mock-server',
  };
}
