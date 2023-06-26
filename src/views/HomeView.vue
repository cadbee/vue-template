<template>
  <v-container class="flex-nowrap pa-0 ma-0" :fluid="true" style="height: 95%">
    <DragCol class="h-100 w-100 pa-0 ma-0" :left-percent="25" :slider-width="10" slider-bg-color="#e6e6e6" slider-bg-hover-color="black">
      <template #left>
        <v-container class="h-100 d-flex flex-column w-100 pa-0">
          <TroopManager/>
          <EnvironmentManager />
        </v-container>
      </template>
      <template #right>
        <DragCol class="h-100 w-100 pa-0" :left-percent="75" :slider-width="10" slider-bg-color="#e6e6e6" slider-bg-hover-color="black">
          <template #left>
            <OlMap/>
          </template>
          <template #right>
            <ConventionalSigns/>
          </template>
        </DragCol>
      </template>
    </DragCol>
  </v-container>
</template>

<script>
// @ is an alias to /src
import OlMap from '@/components/OlMap.vue';
import {DragCol} from 'vue-resizer';
import TroopManager from '@/components/TroopManager.vue';
import EnvironmentManager from '@/components/EnvironmentManager.vue';
import ConventionalSigns from '@/components/ConventionalSigns.vue';

export default {
  name: 'HomeView',
  components: {
    ConventionalSigns,
    EnvironmentManager,
    TroopManager,
    DragCol,
    OlMap,
  },
};
</script>

<style>
.drager_left {
  padding-right: 5px;
}

.drager_right {
  padding-left: 5px;
}
</style>
