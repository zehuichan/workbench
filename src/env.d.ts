/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    unknown
  >;
  export default component;
}

/** Allow side-effect style imports under noUncheckedSideEffectImports (TS 5.6+/6). */
declare module '*.css' {}
declare module '*.scss' {}
