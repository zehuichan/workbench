<script setup lang="ts">
import { useTemplateRef } from 'vue';

import { ArrowRightIcon, LayersIcon } from '@lucide/vue';

import { useInkBand } from '@/layouts/site-ink-band';
import { Button } from '@/ui/button';

import { vReveal } from './use-reveal';

defineOptions({ name: 'HomeCta' });

useInkBand(useTemplateRef<HTMLElement>('band'));
</script>

<template>
  <section
    ref="band"
    class="dark relative isolate overflow-hidden bg-background text-foreground"
  >
    <div
      class="site-ink-aura absolute inset-0 -z-10 opacity-70"
      aria-hidden="true"
    ></div>
    <div
      class="site-dot-grid site-mask-fade-y absolute inset-0 -z-10 opacity-70"
      aria-hidden="true"
    ></div>

    <div
      v-reveal
      class="mx-auto w-full max-w-[1200px] px-6 py-28 text-center lg:py-36"
    >
      <p
        class="font-mono text-[11px] font-medium tracking-[0.08em] text-[var(--playground-accent)]"
      >
        READY
      </p>

      <h2
        class="mt-5 text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.15] font-semibold tracking-[-0.02em]"
      >
        从一张表格开始。
      </h2>

      <p
        class="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-muted-foreground"
      >
        打开 Playground，把可编辑表格、字段联动与草稿保存接进你的业务单据。
      </p>

      <div class="mt-9 flex flex-wrap items-center justify-center gap-2.5">
        <Button as-child size="lg" class="h-10 rounded-full px-4.5">
          <RouterLink to="/plus-table/basic-editing">
            打开 Playground
            <ArrowRightIcon class="size-4" aria-hidden="true" />
          </RouterLink>
        </Button>
        <Button
          as-child
          size="lg"
          variant="outline"
          class="h-10 rounded-full px-4"
        >
          <RouterLink to="/composables/use-form-draft">
            <LayersIcon class="size-4" aria-hidden="true" />
            浏览 Composables
          </RouterLink>
        </Button>
        <Button
          as-child
          size="lg"
          variant="outline"
          class="h-10 rounded-full px-4"
        >
          <a
            href="https://github.com/zehuichan/workbench"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="size-4"
              aria-hidden="true"
            >
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>
            GitHub
          </a>
        </Button>
      </div>
    </div>
  </section>
</template>
