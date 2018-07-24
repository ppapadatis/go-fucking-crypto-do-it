import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import ElementUI from 'element-ui';
import locale from 'element-ui/lib/locale/lang/en';

import App from './App.vue';
import { routes } from './routes';
import { store } from './store/index';

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(ElementUI, { locale });

Vue.http.options.root = process.env.FIREBASE_URL;

Vue.filter('currency', value => `$ ${value.toLocaleString()}`);

const router = new VueRouter({
  mode: 'history',
  routes,
});

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
});
