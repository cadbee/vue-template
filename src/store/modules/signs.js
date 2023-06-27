export default {
  namespaced: true,
  state: {
    signs: [],
    activeSignId: '',
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
    setActiveSign(state, signId) {
      state.activeSignId = signId;
    },
  },
  actions: {

  },
};
