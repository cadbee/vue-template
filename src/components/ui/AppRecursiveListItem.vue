<template>
  <v-list-group v-if="item[childrenFieldName]?.length" :value="item.id">
    <template v-slot:activator="{ props }">
      <v-list-item class="text-left" :title="item.title" v-bind="props"/>
    </template>
    <AppRecursiveListItem v-for="item in item[childrenFieldName]" :key="item.id" :item="item" :children-field-name="childrenFieldName"/>
  </v-list-group>
  <v-list-item v-else class="text-left" :title="item.title"/>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  childrenFieldName: String,
});
</script>

<style scoped>

</style>
