import { createApp } from 'vue';

import App from './App.vue';

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';

// global css
import './assets/design/index.css';

import { router } from './router';

async function bootstrap() {
  const app = createApp(App);

  app.use(ElementPlus);
  app.use(router);
  app.mount('#app');
}

bootstrap();
