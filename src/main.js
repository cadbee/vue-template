import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import {vuetify} from "@/plugins/vuetify"
import OpenLayersMap from "@/plugins/vue3-openlayers";

createApp(App)
    .use(store)
    .use(router)
    .use(vuetify)
    .use(OpenLayersMap)
    .mount('#app')
