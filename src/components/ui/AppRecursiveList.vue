<template>
  <v-list v-model:opened="open">
    <AppRecursiveListItem v-for="item in items" :item="item" :children-field-name="childrenFieldName" :key="item.id"/>
  </v-list>
</template>

<script setup>
import AppRecursiveListItem from '@/components/ui/AppRecursiveListItem.vue';
import {ref} from 'vue';

const open = ref([]);
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  childrenFieldName: String,
});
</script>

<style scoped>

</style>
