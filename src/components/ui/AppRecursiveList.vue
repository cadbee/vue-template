<template>
  <v-list
    density="compact"
    @click:select="(e) => emit('click:selected', e)"
  >
    <AppRecursiveListItem v-for="item in items" :item="item" :children-field-name="childrenFieldName" :key="item.id"/>
  </v-list>
</template>

<script setup>
import AppRecursiveListItem from '@/components/ui/AppRecursiveListItem.vue';
import {defineEmits} from 'vue';

const emit = defineEmits(['click:selected']);

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
