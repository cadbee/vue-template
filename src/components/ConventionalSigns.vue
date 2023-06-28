<template>
  <v-container class="h-100 d-flex flex-column w-100 pa-0 ma-0">
    <v-container class="pa-0 ma-0">
      <v-radio-group
        v-model="mode"
        :inline="true"
        :hide-details="true"
        color="deep-purple-lighten-1"
        @change="changeMode"
      >
        <v-radio
          label="Поиск"
          value="Search"
        />
        <v-radio
          label="Нанесение"
          value="Draw"
        />
      </v-radio-group>
      <v-row class="pa-0 ma-0 text-left text-h6">
        <v-col>
          Нанести на карту/Найти на карте:
        </v-col>
      </v-row>
      <v-btn-toggle
        class="flex-wrap h-auto mb-2 justify-space-around pa-1"
        v-model="toggleOneButton"
        @update:model-value="selectSignType"
        color="#B39DDB"
      >
        <v-btn
          height="40"
          title="DrawPoint"
          value="DrawPoint"
          icon
        >
          <v-img width="30" height="30" src="./signs/flag-variant-outline.svg"/>
        </v-btn>
        <v-btn
          height="40"
          title="DrawPolygon"
          value="DrawPolygon"
          icon
        >
          <v-img width="30" height="30" src="./signs/vector-polygon.svg"/>
        </v-btn>
        <v-btn
          height="40"
          title="DrawLine"
          value="DrawLine"
          icon
        >
          <v-img width="30" height="30" src="./signs/vector-line.svg"/>
        </v-btn>
        <v-btn
          height="40"
          title="DrawRegular"
          value="DrawRegular"
          icon
        >
          <v-img width="30" height="30" src="./signs/square-outline.svg"/>
        </v-btn>
      </v-btn-toggle>
    </v-container>

    <v-skeleton-loader class="w-100" :loading="loading" type="article">
      <v-card class="h-auto w-100 ma-1 ml-2 d-flex flex-column">
        <v-card-title class="text-left pa-2 text-decoration-line-through">Классификатор</v-card-title>

        <AppRecursiveList :items="signs" :children-field-name="'signs'"/>
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
const mode = ref('Draw');

const {onResult, loading} = useQuery(require('@/graphql/queries/Signs.gql'));

onResult((data) => {
  store.commit('signs/setSigns', data.data?.signs ?? []);
});

const signs = computed(() => store.state.signs.signs);

const selectSignType = () => {
  store.commit('signs/setActiveSign', toggleOneButton.value);
};

const changeMode = () => {
  store.commit('signs/setMode', mode.value);
};
</script>

<style scoped>

</style>
