import { createStore } from 'vuex';
import {apolloClient} from '@/plugins/vue-apollo';
import layers from '@/store/modules/layers';
import signs from '@/store/modules/signs';

export default createStore({
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    layers,
    signs,
  },

  strict: process.env.NODE_ENV !== 'production',
});
