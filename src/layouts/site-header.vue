<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { cn } from '@/utils';

import logoMarkup from '../assets/logo.svg?raw';
import { inkBandActive } from './site-ink-band';

defineOptions({ name: 'SiteHeader' });

const scrolled = ref(false);

function syncScrolled() {
  scrolled.value = window.scrollY > 8;
}

onMounted(() => {
  if (typeof window === 'undefined') return;
  syncScrolled();
  window.addEventListener('scroll', syncScrolled, { passive: true });
});

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return;
  window.removeEventListener('scroll', syncScrolled);
});
</script>

<template>
  <header
    :class="
      cn(
        'sticky top-0 z-30 border-b transition-colors duration-300',
        inkBandActive && 'dark text-foreground',
        scrolled
          ? 'border-border bg-[var(--site-nav)] backdrop-blur-md supports-[backdrop-filter]:bg-[var(--site-nav)]'
          : 'border-transparent bg-transparent',
      )
    "
  >
    <div
      class="mx-auto flex h-14 w-full max-w-[1200px] items-center gap-6 px-6"
    >
      <RouterLink to="/" class="flex items-center" aria-label="Workbench 首页">
        <span
          class="text-foreground [&_svg]:block [&_svg]:h-7 [&_svg]:w-[122.5px] [&_text]:[fill:currentColor]"
          aria-hidden="true"
          v-html="logoMarkup"
        ></span>
      </RouterLink>

      <a
        href="https://github.com/zehuichan/workbench"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub repository"
        class="ml-auto flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
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
      </a>
    </div>
  </header>
</template>
