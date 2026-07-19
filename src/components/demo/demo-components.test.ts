import ElementPlus from 'element-plus';
import { createApp, h, nextTick } from 'vue';
import { createMemoryHistory, createRouter, type Router } from 'vue-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DemoApiTable from './demo-api-table.vue';
import DemoBlock from './demo-block.vue';
import DemoCode from './demo-code.vue';
import DemoPage from './demo-page.vue';
import { highlightCode, resolveLang } from './demo-highlighter';

describe('demo components', () => {
  const mounted: Array<{ app: ReturnType<typeof createApp>; host: Element }> =
    [];

  async function mount(
    component: Parameters<typeof createApp>[0],
    router?: Router,
  ) {
    const host = document.createElement('div');
    document.body.append(host);
    const app = createApp(component);
    app.use(ElementPlus);
    if (router) app.use(router);
    app.mount(host);
    await nextTick();
    mounted.push({ app, host });
    return host;
  }

  afterEach(() => {
    for (const { app, host } of mounted.splice(0)) {
      app.unmount();
      host.remove();
    }
  });

  it('renders API table chrome around rich row slots', async () => {
    const host = await mount({
      render: () =>
        h(
          DemoApiTable,
          { title: 'Events', headers: ['名称', '载荷', '说明'] },
          {
            default: () =>
              h('tr', [
                h('td', [h('code', 'page-change')]),
                h('td', [h('code', '{ page, pageSize }')]),
                h('td', '分页变化'),
              ]),
          },
        ),
    });

    expect(host.querySelector('.demo__api-title')?.textContent).toBe('Events');
    expect(
      [...host.querySelectorAll('th')].map((cell) => cell.textContent),
    ).toEqual(['名称', '载荷', '说明']);
    expect(host.querySelector('tbody code')?.textContent).toBe('page-change');
  });

  it('uses route metadata for the page title and wraps rich description', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          component: { render: () => null },
          meta: { title: '路由标题' },
        },
      ],
    });
    await router.push('/');
    await router.isReady();
    const host = await mount(
      {
        render: () =>
          h(
            DemoPage,
            { width: 'wide' },
            {
              description: () => ['说明 ', h('code', 'rich')],
              default: () => h('div', 'content'),
            },
          ),
      },
      router,
    );

    expect(host.querySelector('.demo__title')?.textContent).toBe('路由标题');
    expect(host.querySelector('.demo__desc code')?.textContent).toBe('rich');
  });

  it('wraps the DemoBlock hint slot once', async () => {
    const host = await mount({
      render: () =>
        h(DemoBlock, null, {
          hint: () => ['提示 ', h('code', 'value')],
          default: () => h('div', 'content'),
        }),
    });

    expect(host.querySelectorAll('.demo__hint')).toHaveLength(1);
    expect(host.querySelector('.demo__hint code')?.textContent).toBe('value');
  });

  it('renders highlighted code with line spans', async () => {
    const host = await mount({
      render: () =>
        h(DemoCode, { code: 'const a = 1\nconst b = 2', lang: 'ts' }),
    });

    await vi.waitFor(() => {
      expect(host.querySelector('.shiki')).not.toBeNull();
    });
    expect(host.querySelectorAll('.line').length).toBeGreaterThanOrEqual(2);
  });

  it('copies the full source when the copy button is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText },
    });

    const source = 'const hello = "world"';
    const host = await mount({
      render: () => h(DemoCode, { code: source, lang: 'ts' }),
    });

    await vi.waitFor(() => {
      expect(host.querySelector('.shiki')).not.toBeNull();
    });

    const button = host.querySelector('button');
    expect(button).not.toBeNull();
    button!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(source);
    });

    vi.unstubAllGlobals();
  });
});

describe('demo-highlighter', () => {
  it('resolves common language aliases', () => {
    expect(resolveLang('ts')).toBe('typescript');
    expect(resolveLang('js')).toBe('javascript');
    expect(resolveLang('vue')).toBe('vue');
  });

  it('highlights typescript into shiki html with line spans', async () => {
    const html = await highlightCode('const x = 1\nconst y = 2', 'ts');
    expect(html).toContain('class="shiki');
    expect(html.match(/class="line"/g)?.length).toBeGreaterThanOrEqual(2);
  });
});
