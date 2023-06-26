import {apolloClient} from '@/plugins/vue-apollo';
import layers from '@/graphql/queries/Layers.gql';

export default {
  namespaced: true,
  state: {
    layers: null,
    visibleLayers: [],
    isLoading: false,
    current: '',
  },
  getters: {
    getLayers(state) {
      return state.layers;
    },
  },
  mutations: {
    setLayers(state, layersList) {
      state.layers = layersList;
      state.visibleLayers = [];
      layersList.forEach((el) => {
        if (el.visible) {
          state.visibleLayers.push(el.id);
        }
      });
    },
    setCurrentLayer(state, currentId) {
      state.current = currentId;
    },
    setLoading(state, value) {
      state.isLoading = value;
    },
  },
  actions: {
  },
};
