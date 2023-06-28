<template>
  <v-list
    density="compact"
    @click:select="(e) => emit('click:selected', e)"
  >
    <v-item-group v-model="selected" selected-class="bg-primary" @update:model-value="emit('click:selected', selected)">
      <AppRecursiveListItem
        v-for="item in items"
        :item="item"
        :children-field-name="childrenFieldName"
        :key="item.id"
      />
    </v-item-group>
  </v-list>
</template>

<script setup>
import AppRecursiveListItem from '@/components/ui/AppRecursiveListItem.vue';
import {defineEmits, ref, watchEffect} from 'vue';

const emit = defineEmits(['click:selected']);

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  childrenFieldName: String,
});

const selected = ref(null);
</script>

<style scoped>

</style>
