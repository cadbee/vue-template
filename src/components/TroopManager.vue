<template>
  <v-card class="h-auto d-flex flex-column ma-1">
    <v-card-title class="text-left pa-2">Свои войска</v-card-title>

    <AppRecursiveList :items="items" :children-field-name="'items'"/>
  </v-card>
</template>

<script setup>
import AppRecursiveList from '@/components/ui/AppRecursiveList.vue';

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
        id: '2200',
        title: 'SubTitle 2',
        items: [
          {
            id: '2210',
            title: 'SubSubTitle 2',
            items: [],
          },
          {
            id: '2220',
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
