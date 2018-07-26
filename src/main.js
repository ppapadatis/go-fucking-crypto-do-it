import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import ElementUI from 'element-ui';
import locale from 'element-ui/lib/locale/lang/en';

import App from './App.vue';
import { routes } from './routes';
import { store } from './store/index';
import { mapState } from 'vuex';
import { ACTION_TYPES } from './util/constants';
import monitorWeb3 from './util/web3/monitorWeb3';

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(ElementUI, { locale });

Vue.http.options.root = process.env.FIREBASE_URL;

Vue.filter('currency', (value) => `$ ${value.toLocaleString()}`);

const router = new VueRouter({
  mode: 'history',
  routes,
});

new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App),
  beforeCreate: function() {
    this.$store
      .dispatch(ACTION_TYPES.REGISTER_WEB3_INSTANCE)
      .then((result) => {
        let state = result.state;
        monitorWeb3(state);
      })
      .catch((result = {}) => {
        let state = result.state;
        monitorWeb3(state);
        console.error(result, 'Unable to REGISTER_WEB3_INSTANCE');
      });
  },
  computed: {
    ...mapState({
      hasInjectedWeb3: (state) => state.web3.isInjected,
      hasWeb3InjectedBrowser: (state) => state.user.hasWeb3InjectedBrowser,
      isConnectedToApprovedNetwork: (state) =>
        state.user.isConnectedToApprovedNetwork,
      hasCoinbase: (state) => state.user.hasCoinbase,
      networkId: (state) => state.web3.networkId,
      coinbase: (state) => state.web3.coinbase,
    }),
  },
  watch: {
    hasInjectedWeb3(web3ConnectionValue) {
      console.log('hasInjectedWeb3: ', web3ConnectionValue);
    },
    networkId(networkId) {
      console.log('networkId: ', networkId);
    },
    coinbase(coinbase) {
      console.log('coinbase: ', coinbase);
    },
  },
});
