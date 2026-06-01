// AntTable 在开发态日志中使用 `import.meta.env.DEV`（由 Vite 等打包器注入）。
// 这里仅声明用到的字段，避免组件包强依赖 vite/client。
interface ImportMetaEnv {
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
