import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    badge?: string;
    group?: string;
    order?: number;
    title?: string;
  }
}
