import { createApp } from 'vue';

import App from './App.vue';

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

// global css
import './assets/design';

import { router } from './router';

async function bootstrap() {
  const app = createApp(App);

  app.use(ElementPlus);
  app.use(router);
  app.mount('#app');
}

bootstrap();
