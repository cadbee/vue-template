<template>
  <v-skeleton-loader class="w-100" :loading="loading" type="article">
    <v-card class="h-auto d-flex flex-column ma-1  w-100">
      <v-card-title class="text-left pa-2">Свои войска</v-card-title>

      <AppRecursiveList
        :items="troops"
        :children-field-name="'troops'"
        @click:selected="selectTroop"
      />
    </v-card>
  </v-skeleton-loader>
</template>

<script setup>
import {useStore} from 'vuex';
import AppRecursiveList from '@/components/ui/AppRecursiveList.vue';
import {useQuery} from '@vue/apollo-composable';
import {computed} from 'vue';

const store = useStore();

const selectTroop = (selectedId) => {
  store.commit('troops/setActiveTroop', selectedId);
};

const {onResult, loading} = useQuery(require('@/graphql/queries/Troops.gql'));

onResult((data) => {
  store.commit('troops/setTroops', data.data?.troops ?? []);
});

const troops = computed(() => store.state.troops.troops);

const items = [
  {
    id: '10000',
    title: 'Title 1',
    items: [
      {
        id: '11000',
        title: 'SubTitle 1',
        items: [
          {
            id: '11100',
            title: 'SubSubTitle 1',
            items: [],
          },
          {
            id: '11200',
            title: 'SubSubTitle 2',
            items: [],
          },
        ],
      },
      {
        id: '12000',
        title: 'SubTitle 2',
        items: [
          {
            id: '12100',
            title: 'SubSubTitle 1',
            items: [],
          },
          {
            id: '12200',
            title: 'SubSubTitle 2',
            items: [],
          },
        ],
      },
    ],
  },
  {
    id: '20000',
    title: 'Title 2',
    items: [
      {
        id: '21000',
        title: 'SubTitle 2',
        items: [
          {
            id: '21100',
            title: 'SubSubTitle 2',
            items: [],
          },
          {
            id: '21200',
            title: 'SubSubTitle 2',
            items: [],
          },
        ],
      },
      {
        id: '22000',
        title: 'SubTitle 2',
        items: [
          {
            id: '22100',
            title: 'SubSubTitle 2',
            items: [],
          },
          {
            id: '22200',
            title: 'SubSubTitle 2',
            items: [],
          },
        ],
      },
    ],
  },
];
</script>

<style scoped>

</style>
