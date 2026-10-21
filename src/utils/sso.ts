import type { ConfigurableWindow } from '@vueuse/core';

import type { Router } from 'vue-router';

import { defaultWindow } from '@vueuse/core';

import { removeToken, setToken } from './auth';
import { defined } from './defined';

// 三个都在才认定是 SSO 回调；清理时只抹敏感项，username 留着方便排查
const MUST = ['username', 'roles', 'accessToken'] as const;
const SENSITIVE = ['roles', 'accessToken'] as const;

export type SsoOptions = ConfigurableWindow;

interface Credentials {
  /** 凭证所在位置，决定清理哪一段 query，避免动到另一段 */
  from: 'hash' | 'search';
  params: URLSearchParams;
}

function getHashQuery(hash: string): URLSearchParams {
  const start = hash.indexOf('?');
  return new URLSearchParams(start === -1 ? '' : hash.slice(start + 1));
}

function readCredentials(url: URL): Credentials | null {
  const hashParams = getHashQuery(url.hash);
  if (MUST.every((key) => hashParams.get(key)))
    return { params: hashParams, from: 'hash' };
  if (MUST.every((key) => url.searchParams.get(key))) {
    return { params: url.searchParams, from: 'search' };
  }
  return null;
}

function buildCleanLocation(url: URL, { params, from }: Credentials): string {
  const next = new URLSearchParams(params);
  for (const key of SENSITIVE) {
    next.delete(key);
  }
  const query = next.toString();

  if (from === 'hash') {
    const hashPath = url.hash.slice(0, url.hash.indexOf('?'));
    url.hash = query ? `${hashPath}?${query}` : hashPath;
  } else {
    url.search = query ? `?${query}` : '';
  }

  return url.pathname + url.search + url.hash;
}

/**
 * Frontend single sign-on handoff.
 *
 * Detects a callback carrying `username`, `roles`, and `accessToken`, stores the
 * credentials locally, then strips the sensitive params through the router's
 * history. The address bar and the location the router recorded at creation
 * change together, without a reload. The credentials are read from whichever
 * query of the router's location holds them, and only that one is cleaned.
 *
 * Call it before `app.use(router)`. Editing the address bar behind the router lets
 * its first navigation write the credentials back.
 *
 * Local check (history mode):
 * `http://localhost:8000/?username=sso&roles=admin&accessToken=eyJhbGciOiJIUzUxMiJ9.demo`
 *
 * Hash mode, credentials trailing the route:
 * `http://localhost:8000/#/home?username=sso&roles=admin&accessToken=eyJhbGciOiJIUzUxMiJ9.demo`
 *
 * @returns whether the current URL was handled as an SSO callback.
 *
 * @example
 * import { sso } from '@/utils/sso'
 * import { router } from './router'
 *
 * sso(router)
 * createApp(App).use(router).mount('#app')
 */
export function sso(router: Router, options: SsoOptions = {}): boolean {
  const { window = defaultWindow } = options;
  if (!window) return false;

  const { history } = router.options;
  const url = new URL(history.location, window.location.origin);
  const credentials = readCredentials(url);
  if (!credentials) return false;

  const { params } = credentials;
  removeToken();
  setToken({
    accessToken: defined(params.get('accessToken')),
    username: defined(params.get('username')),
    roles: defined(params.get('roles'))
      .split(/[,\s]+/)
      .filter(Boolean),
  });

  history.replace(buildCleanLocation(url, credentials));
  return true;
}
