import { createStore } from 'vuex';
import layers from '@/store/modules/layers';
import signs from '@/store/modules/signs';
import troops from '@/store/modules/troops';

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
    troops,
  },

  strict: process.env.NODE_ENV !== 'production',
});
