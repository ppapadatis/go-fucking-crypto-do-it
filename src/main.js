import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Vuetify from 'vuetify'

import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import '@fortawesome/fontawesome-free/css/all.css'

import Raven from 'raven-js'
import RavenVue from 'raven-js/plugins/vue'
Raven.config('https://160cf0f372d94b8391b38e13ea5a0bdd@sentry.io/1259476')
  .addPlugin(RavenVue, Vue)
  .install()

Vue.use(Vuetify)
Vue.use(require('vue-moment'))
Vue.config.productionTip = false

Vue.filter('etherprice', function(value, unit = 'ether') {
  if (!value) return ''
  return window.web3.fromWei(value.toString(), unit)
})

/* eslint-disable no-new */
window.Event = new Vue()

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
