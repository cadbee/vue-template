<template>
  <v-container class="fill-height" :fluid="true" align="center">
    <OlMap />
  </v-container>
</template>

<script>
// @ is an alias to /src
import OlMap from '@/components/OlMap.vue';

export default {
  name: 'HomeView',
  components: {
    OlMap,
  },
};
</script>
