import { createApp, h, nextTick } from 'vue';
import { createMemoryHistory, createRouter, RouterLink } from 'vue-router';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { defined } from '@/utils/defined';

import PlaygroundHeader from '../playground-header.vue';

describe('playground-header', () => {
  const mounted: Array<{ app: ReturnType<typeof createApp>; host: Element }> =
    [];

  async function mountHeader(
    props: {
      activeCategory: string;
      categories: { groups: readonly string[]; key: string }[];
    },
    onSelect = vi.fn(),
  ) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div />' } }],
    });
    await router.push('/');
    await router.isReady();

    const host = document.createElement('div');
    document.body.append(host);
    const app = createApp({
      render: () =>
        h(PlaygroundHeader, {
          ...props,
          onSelect: (key: string) => onSelect(key),
        }),
    });
    app.use(router);
    app.component('RouterLink', RouterLink);
    app.mount(host);
    await nextTick();
    mounted.push({ app, host });
    return { host, onSelect };
  }

  afterEach(() => {
    for (const { app, host } of mounted.splice(0)) {
      app.unmount();
      host.remove();
    }
  });

  const categories = [
    { key: 'components', groups: ['PlusTable'] },
    { key: 'composables', groups: ['Form'] },
    { key: 'packages', groups: [] as string[] },
  ] as const;

  it('renders category labels', async () => {
    const { host } = await mountHeader({
      categories: [...categories],
      activeCategory: 'composables',
    });
    expect(host.textContent).toContain('components');
    expect(host.textContent).toContain('composables');
    expect(host.textContent).toContain('packages');
  });

  it('emits select when an enabled category is clicked', async () => {
    const { host, onSelect } = await mountHeader({
      categories: [...categories],
      activeCategory: 'composables',
    });
    const button = [...host.querySelectorAll('button, a')].find((el) =>
      el.textContent?.includes('components'),
    );
    expect(button).toBeInstanceOf(HTMLElement);
    if (!(button instanceof HTMLElement)) return;
    button.click();
    await nextTick();
    expect(onSelect).toHaveBeenCalledWith('components');
  });

  it('does not emit select for empty-groups category', async () => {
    const { host, onSelect } = await mountHeader({
      categories: [...categories],
      activeCategory: 'composables',
    });
    const packagesEl = [...host.querySelectorAll('button, a')].find((el) =>
      el.textContent?.includes('packages'),
    ) as HTMLElement | undefined;
    expect(packagesEl).toBeTruthy();
    defined(packagesEl).click();
    await nextTick();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('links the brand lockup back to the site home', async () => {
    const { host } = await mountHeader({
      categories: [...categories],
      activeCategory: 'components',
    });
    const brand = host.querySelector('a[href="/"]') as HTMLAnchorElement | null;
    expect(brand).toBeTruthy();
    expect(
      defined(brand).querySelector('svg')?.getAttribute('aria-label'),
    ).toBe('Workbench');
  });

  it('renders a GitHub repository link', async () => {
    const { host } = await mountHeader({
      categories: [...categories],
      activeCategory: 'composables',
    });
    const githubLink = host.querySelector(
      'a[href="https://github.com/zehuichan/workbench"]',
    ) as HTMLAnchorElement | null;
    expect(githubLink).toBeTruthy();
    expect(defined(githubLink).target).toBe('_blank');
    expect(defined(githubLink).rel).toContain('noopener');
    expect(defined(githubLink).getAttribute('aria-label')).toBe(
      'GitHub repository',
    );
  });
});
