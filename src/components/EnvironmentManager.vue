<template>
  <v-card class="d-flex flex-column ma-1">
    <v-card-title class="text-left pa-2">Менеджер обстановок</v-card-title>

    <v-card-actions class="pa-0 ma-0 justify-center">
      <v-btn-group class="flex-wrap h-auto justify-space-around">
        <v-btn
          class="ml-0"
          min-height="30"
          title="Добавить обстановку"
          rounded="0"
          icon
          @click="isAdding = !isAdding"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-btn class="ml-0" min-height="30" title="Редактировать обстановку" rounded="0" icon>
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          class="ml-0"
          min-height="30"
          title="Удалить текущую обстановку"
          rounded="0"
          icon
          @click="deleteLayer"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <v-btn class="ml-0" min-height="30" title="???" rounded="0" icon>
          <v-icon>mdi-email-arrow-right-outline</v-icon>
        </v-btn>
        <v-btn class="ml-0" min-height="30" title="???" rounded="0" icon>
          <v-icon>mdi-file-document-arrow-right-outline</v-icon>
        </v-btn>
      </v-btn-group>
    </v-card-actions>
    <v-card-actions class="pa-2" style="height: 30px;">
      <v-btn
        variant="text"
        text="Обстановки"
        size="small"
        @click="isEnvironmentListShown = !isEnvironmentListShown"
      />
      <v-spacer/>
      <v-btn
        :icon="isEnvironmentListShown ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        size="small"
        @click="isEnvironmentListShown = !isEnvironmentListShown"
      />
    </v-card-actions>
    <v-expand-transition>
      <v-skeleton-loader class="w-100 pa-0 ma-0 overflow-auto d-block" :loading="isLoading" v-if="isEnvironmentListShown" type="article">
        <v-row class="position-sticky bg-grey-lighten-5 pa-0 ma-0 pl-2 pt-2" style="top: 0; z-index: 2" :dense="true">
          <v-col class="text-left" align-self="center" cols="4">Название</v-col>
          <v-col cols="4">Видимость</v-col>
          <v-col cols="4">Текущая</v-col>
        </v-row>
        <v-row class="pa-0 ma-0 pl-2 pt-2 pr-2" v-if="isAdding">
          <v-col class="pa-0 ma-0" cols="12">
            <v-text-field
              class="pa-0 ma-0"
              label="Layer title"
              :rules="layerTitleRules"
              v-model="newLayerTitle"
              append-icon="mdi-send"
              @click:append="addLayer"
              hide-details="auto"
              variant="solo"
            />
          </v-col>
        </v-row>
        <v-row class="pa-0 ma-0 pl-2 pt-2" v-for="layer in layers" :key="layer?.id" :dense="true">
          <v-col class="text-left" align-self="center" cols="4">{{ layer?.title }}</v-col>
          <v-col cols="4" align-self="center">
            <v-checkbox-btn
              class="d-flex justify-center align-center"
              :model-value="layer.visible"
              @click="changeLayerVisibleMutation({ id: layer?.id })"/>
          </v-col>
          <v-col cols="4" align-self="center">
            <v-checkbox-btn
              class="d-flex justify-center align-center"
              :model-value="layer.current"
              @click="changeCurrentLayerMutation({ id: layer.id, value: !layer.current })"/>
          </v-col>
        </v-row>
      </v-skeleton-loader>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import {computed, ref} from 'vue';
import {useStore} from 'vuex';
import {useMutation} from '@vue/apollo-composable';
import gql from 'graphql-tag';

const layersQuery = require('@/graphql/queries/Layers.gql');
const layerFragment = require('@/graphql/fragments/LayerFragment.gql');

const isEnvironmentListShown = ref(true);

const store = useStore();
const layers = computed(() => store.state.layers.layers);

const isLoading = computed(() => store.state.layers.isLoading);
const isAdding = ref(true);
const newLayerTitle = ref('');
const layerTitleRules = [
  (value) => !!value || 'Required.',
  (value) => (value && value.length >= 3) || 'Min 3 characters',
];

const {mutate: changeLayerVisibleMutation} = useMutation(require('@/graphql/mutations/LayerVisibleChange.gql'), {
  update(cache, {data: {changeLayerVisibility}}) {
    cache.modify({
      fields: {
        layers(existingLayers = []) {
          const newLayers = cache.readQuery({query: layersQuery}).layers;
          store.commit('layers/setLayers', newLayers);
          return [...existingLayers];
        },
      },
    });
  },
  onQueryUpdated(observableQuery) {
    return false;
  },
});
const {mutate: changeCurrentLayerMutation} = useMutation(require('@/graphql/mutations/LayerChangeCurrent.gql'), {
  update(cache, {data: {changeCurrentLayer}}) {
    cache.modify({
      fields: {
        layers(existingLayers = []) {
          const newLayers = cache.readQuery({query: layersQuery}).layers;
          store.commit('layers/setLayers', newLayers);
          store.commit('layers/setCurrentLayer', newLayers.find((layer) => layer.current === true)?.id);
          return [...existingLayers];
        },
      },
    });
  },
  onQueryUpdated(observableQuery) {
    return false;
  },
});

const {mutate: addLayerMutation} = useMutation(require('@/graphql/mutations/AddLayer.gql'), {
  update(cache, {data: {addLayer}}) {
    cache.modify({
      fields: {
        layers(existingLayers = []) {
          const newLayerRef = cache.writeFragment({
            data: addLayer,
            fragment: layerFragment,
          });
          return [...existingLayers, newLayerRef];
        },
      },
    });
  },
});

const {mutate: deleteLayerMutation} = useMutation(require('@/graphql/mutations/DeleteLayer.gql'), {
  update(cache, {data: {deleteLayer}}) {
    const normalizedId = cache.identify({id: deleteLayer.id, __typename: 'Layer'});
    cache.evict({id: normalizedId});
    cache.gc();
  },
});

const addLayer = () => {
  if (newLayerTitle.value && newLayerTitle.value.length >= 3) {
    addLayerMutation({
      input: {
        title: newLayerTitle.value,
        content: '',
      },
    });
    newLayerTitle.value = '';
    isAdding.value = false;
  }
};

const deleteLayer = () => {
  const layerIdToDelete = store.state.layers.current;
  if (layerIdToDelete) {
    deleteLayerMutation({
      id: layerIdToDelete,
    });
  }
};
</script>

<style scoped>

</style>
