import Vue from 'vue'
import App from './App.vue'
import router from './router'

import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI, { locale })
Vue.use(require('vue-moment'))
Vue.config.productionTip = false

/* eslint-disable no-new */
window.Event = new Vue()

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
