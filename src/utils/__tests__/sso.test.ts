import type { RouterHistory } from 'vue-router';

import { createApp } from 'vue';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getToken, removeToken, TOKEN_KEY } from '../auth';
import { sso } from '../sso';

function visit(path: string) {
  window.history.replaceState(null, '', path);
}

function currentPath() {
  return window.location.href.slice(window.location.origin.length);
}

function createTestRouter(history: RouterHistory = createWebHistory()) {
  return createRouter({
    history,
    routes: [{ path: '/:path(.*)*', component: { render: () => null } }],
  });
}

describe('sso', () => {
  beforeEach(() => {
    removeToken();
  });

  afterEach(() => {
    removeToken();
    visit('/');
  });

  it('no-ops when required query keys are missing', () => {
    visit('/home?from=demo');

    expect(sso(createTestRouter())).toBe(false);
    expect(getToken()).toBeNull();
    expect(currentPath()).toBe('/home?from=demo');
  });

  it('clears old token, stores SSO payload, and strips the URL in place', () => {
    localStorage.setItem(TOKEN_KEY, JSON.stringify({ accessToken: 'old' }));
    visit('/home?username=sso&roles=admin,editor&accessToken=tok&from=demo');

    expect(sso(createTestRouter())).toBe(true);
    expect(getToken()).toEqual({
      accessToken: 'tok',
      username: 'sso',
      roles: ['admin', 'editor'],
    });
    expect(currentPath()).toBe('/home?username=sso&from=demo');
  });

  it('reads credentials from the hash query', () => {
    visit('/#/permission/page?username=sso&roles=admin&accessToken=eyJ');

    sso(createTestRouter());

    expect(getToken()?.accessToken).toBe('eyJ');
    expect(currentPath()).toBe('/#/permission/page?username=sso');
  });

  it('reads hash credentials even when the base URL already has a query', () => {
    visit(
      '/?tenant=acme#/permission/page?username=sso&roles=admin&accessToken=eyJ',
    );

    sso(createTestRouter());

    expect(getToken()?.accessToken).toBe('eyJ');
    expect(currentPath()).toBe('/?tenant=acme#/permission/page?username=sso');
  });

  it('keeps the hash route intact when credentials arrive in the search string', () => {
    visit(
      '/?username=sso&roles=admin&accessToken=eyJ#/permission/page?tab=list',
    );

    sso(createTestRouter());

    expect(getToken()?.accessToken).toBe('eyJ');
    expect(currentPath()).toBe('/?username=sso#/permission/page?tab=list');
  });

  it('cleans the route query of a hash-history router', () => {
    visit('/#/permission/page?username=sso&roles=admin&accessToken=eyJ');

    sso(createTestRouter(createWebHashHistory()));

    expect(getToken()?.accessToken).toBe('eyJ');
    expect(currentPath()).toBe('/#/permission/page?username=sso');
  });

  it('keeps credentials out of the first navigation', async () => {
    visit('/home?username=sso&roles=admin&accessToken=tok');
    const router = createTestRouter();

    sso(router);
    createApp({ render: () => null }).use(router);
    await router.isReady();

    expect(router.currentRoute.value.fullPath).toBe('/home?username=sso');
    expect(currentPath()).toBe('/home?username=sso');
  });

  it('bails out without a window (SSR)', () => {
    expect(
      sso(createTestRouter(createMemoryHistory()), { window: undefined }),
    ).toBe(false);
    expect(getToken()).toBeNull();
  });
});
