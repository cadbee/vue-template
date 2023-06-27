export default {
  namespaced: true,
  state: {
    troops: [],
    activeTroopId: '',
  },
  getters: {
    getTroops(state) {
      return state.troops;
    },
  },
  mutations: {
    setTroops(state, troopsList) {
      state.troops = troopsList;
    },
    setActiveTroop(state, troopId) {
      state.activeTroopId = troopId;
    },
  },
  actions: {},
};
