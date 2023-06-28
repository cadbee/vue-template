<template>
  <v-item v-slot="{ selectedClass, toggle }" :value="item.id">
    <v-list-group v-if="item[childrenFieldName]?.length" @click.stop="toggle" color="#7E57C2">
      <template #activator="{ props }">
        <v-list-item :class="['text-left', selectedClass]" :title="item.title" >
          <template #append>
            <v-icon v-bind="props" @click.stop/>
          </template>
        </v-list-item>
      </template>
      <AppRecursiveListItem v-for="child in item[childrenFieldName]" :key="child.id" :item="child" :children-field-name="childrenFieldName"/>
    </v-list-group>
    <v-list-item v-else :class="['text-left', selectedClass]" :title="item.title" @click.stop="toggle"/>
  </v-item>
</template>

<script setup>
import {ref} from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  childrenFieldName: String,
});

const emit = defineEmits(['click:selectGroup']);

const isOpened = ref(false);
</script>

<style scoped>

</style>
