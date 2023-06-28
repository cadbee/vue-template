export default {
  namespaced: true,
  state: {
    signs: [],
    activeSignType: undefined,
    mode: 'Draw',
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
    setActiveSign(state, signType) {
      state.activeSignType = signType;
    },
    setMode(state, newMode) {
      state.mode = newMode;
    },
  },
  actions: {

  },
};
