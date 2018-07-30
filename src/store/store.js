import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'
import state from './state'

Vue.use(Vuex)

const vuexLocalStorage = new VuexPersist({
  key: 'vuex',
  storage: window.localStorage,
  reducer: (state) => ({ user: state.user })
})

export default new Vuex.Store({
  plugins: [vuexLocalStorage.plugin],
  state,
  actions: {},
  getters: {},
  mutations: {}
})
