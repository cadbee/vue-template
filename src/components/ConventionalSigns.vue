<template>
  <v-container class="h-100 d-flex flex-column w-100 pa-0 ma-0">
    <v-container class="pa-0 ma-0">
      <v-btn-toggle
        class="flex-wrap h-auto mb-2 w-100 justify-space-around pa-1"
        v-model="toggleOneButton"
        rounded="0"
        variant="plain"
        color="primary"
      >
        <v-btn
          height="40"
          title="Режим поиска условных знаков на карте"
          icon
        >
          <v-icon>mdi-format-align-left</v-icon>
        </v-btn>
        <v-btn
          height="40"
          title="???"
          icon
        >
          <v-icon>mdi-format-align-center</v-icon>
        </v-btn>
        <v-btn
          height="40"
          title="???"
          icon
        >
          <v-icon>mdi-format-align-right</v-icon>
        </v-btn>
        <v-btn
          height="40"
          title="???"
          icon
        >
          <v-icon>mdi-format-align-justify</v-icon>
        </v-btn>
      </v-btn-toggle>
    </v-container>

    <v-skeleton-loader class="w-100" :loading="loading" type="article">
      <v-card class="h-auto w-100 ma-1 ml-2 d-flex flex-column">
        <v-card-title class="text-left pa-2">Классификатор</v-card-title>

        <AppRecursiveList :items="signs" :children-field-name="'signs'" @click:selected="selectSign"/>
      </v-card>
    </v-skeleton-loader>

  </v-container>
</template>

<script setup>
import {computed, ref} from 'vue';
import AppRecursiveList from '@/components/ui/AppRecursiveList.vue';
import {useStore} from 'vuex';
import {useQuery} from '@vue/apollo-composable';

const store = useStore();
const toggleOneButton = ref(null);

const {onResult, loading} = useQuery(require('@/graphql/queries/Signs.gql'));

onResult((data) => {
  store.commit('signs/setSigns', data.data?.signs ?? []);
});

const signs = computed(() => store.state.signs.signs);

const selectSign = (event) => {
  if (event.value) {
    store.commit('signs/setActiveSign', event.id);
  } else {
    store.commit('signs/setActiveSign', '');
  }
};
</script>

<style scoped>

</style>
