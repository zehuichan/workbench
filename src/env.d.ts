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

interface ImportMetaEnv {
  readonly VITE_WECHAT_APPID?: string;
  readonly VITE_JSSDK_ENABLED?: string;
  readonly VITE_WW_JSSDK_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Minimal Weixin JSSDK surface used by useWeixin / useWorkWeixin. */
interface WeixinJsSdk {
  config: (config: Record<string, unknown>) => void;
  ready: (fn: () => void) => void;
  error: (fn: (err: unknown) => void) => void;
  agentConfig: (config: Record<string, unknown>) => void;
  scanQRCode?: (options: Record<string, unknown>) => void;
}

interface Window {
  wx?: WeixinJsSdk;
}
