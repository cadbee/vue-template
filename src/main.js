import {createApp} from 'vue';
import {vuetify} from '@/plugins/vuetify';
import OpenLayersMap from '@/plugins/vue3-openlayers';
import {apolloClient} from '@/plugins/vue-apollo';
import {DefaultApolloClient} from '@vue/apollo-composable';
import store from './store';
import router from './router';
import App from './App.vue';

createApp(App)
  .use(store)
  .use(router)
  .use(vuetify)
  .use(OpenLayersMap)
  .provide(DefaultApolloClient, apolloClient)
  .mount('#app');
