import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import {VSkeletonLoader} from 'vuetify/lib/labs/VSkeletonLoader';

export const vuetify = createVuetify({
  components: {
    ...components,
    VSkeletonLoader,
  },
  directives,
});
