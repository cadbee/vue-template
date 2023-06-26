import {apolloClient} from '@/plugins/vue-apollo';
import signs from '@/graphql/queries/Signs.gql';

export default {
  namespaced: true,
  state: {
    signs: [],
  },
  getters: {
    getSigns(state) {
      return state.signs;
    },
  },
  mutations: {
    setSigns(state, signsList) {
      state.signs = signsList;
    },
  },
  actions: {

  },
};
