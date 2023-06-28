export default {
  namespaced: true,
  state: {
    troops: [],
    activeTroopId: undefined,
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
      console.log('Active troop ID: ', troopId);
      state.activeTroopId = troopId;
    },
  },
  actions: {},
};
