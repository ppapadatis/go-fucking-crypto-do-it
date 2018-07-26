import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersist from 'vuex-persist';
import state from './state';
import actions from './actions';
import mutations from './mutations';

Vue.use(Vuex);

const vuexLocalStorage = new VuexPersist({
  key: 'vuex',
  storage: window.localStorage,
  reducer: (state) => ({ user: state.user }),
});

export const store = new Vuex.Store({
  strict: true,
  plugins: [vuexLocalStorage.plugin],
  state,
  mutations,
  actions,
});
