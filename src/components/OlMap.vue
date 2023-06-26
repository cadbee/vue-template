<template>
  <ol-map
    ref="map"
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
    class="h-100 w-100"
  >
    <ol-view
      ref="view"
      :rotation="rotation"
      :projection="projection"
    />

    <ol-tile-layer
      v-for="layer in bingMapsLayers"
      :base-layer="true"
      :title="layer.imagerySet"
      :visible="layer.isVisible"
      :key="layer.imagerySet"
    >
      <ol-source-bingmaps :apiKey="bingMapsKey" :imagerySet="layer.imagerySet" culture="ru"/>
    </ol-tile-layer>
  </ol-map>
  <input
    style="display: none"
    ref="uploadGeoJSONInput"
    type="file"
    @change="uploadGeoJSON"
  />
</template>

<script setup>
import {
  onMounted, ref, watchEffect,
} from 'vue';
import {useStore} from 'vuex';
import {useMutation, useQuery} from '@vue/apollo-composable';

import LayerSwitcherImage from 'ol-ext/control/LayerSwitcherImage';
import Bar from 'ol-ext/control/Bar';
import EditBar from 'ol-ext/control/EditBar';
import GeolocationButton from 'ol-ext/control/GeolocationButton';
import Toggle from 'ol-ext/control/Toggle';
import Button from 'ol-ext/control/Button';

import {FullScreen, Rotate, Zoom} from 'ol/control';
import {Vector as VectorLayer} from 'ol/layer';
import {Vector as SourceVector} from 'ol/source';
import {GeoJSON} from 'ol/format';
import {
  Icon, Style,
} from 'ol/style';

const projection = ref('EPSG:3857');
const rotation = ref(0);
const map = ref(null);
const view = ref(null);
const uploadGeoJSONInput = ref(null);
const bingMapsKey = 'AmVsq9RuMAPsJd1ASWEyfQEU5izCXRwGG1vaIw5eZ_nKoiCxZqN9PPZYoYYsFGQS';
const bingMapsLayers = [
  {
    isVisible: true,
    imagerySet: 'RoadOnDemand',
  },
  {
    isVisible: false,
    imagerySet: 'Aerial',
  },
  {
    isVisible: false,
    imagerySet: 'AerialWithLabelsOnDemand',
  },
  {
    isVisible: false,
    imagerySet: 'CanvasDark',
  },
  {
    isVisible: false,
    imagerySet: 'CanvasLight',
  },
  {
    isVisible: false,
    imagerySet: 'CanvasGray',
  },
];

const layersQuery = require('@/graphql/queries/Layers.gql');

const store = useStore();

const {mutate: changeLayerVisibleMutation} = useMutation(require('@/graphql/mutations/LayerVisibleChange.gql'), {
  update(cache, {data: {changeLayerVisibility}}) {
    cache.modify({
      fields: {
        layers(existingLayers = []) {
          const newLayers = cache.readQuery({query: layersQuery}).layers;
          store.commit('layers/setLayers', newLayers);
          return [...existingLayers];
        },
      },
    });
  },
  onQueryUpdated(observableQuery) {
    return false;
  },
});

watchEffect(() => {
  const {visibleLayers} = store.state.layers;
  if (map.value) {
    map.value.map.getAllLayers().forEach((layer) => {
      if (visibleLayers.includes(layer.get('id'))) {
        layer.setVisible(true);
      } else if (layer instanceof VectorLayer) {
        layer.setVisible(false);
      }
    });
  }
});

let editBar = null;
const toggleMove = new Toggle({
  html: '<i class="mdi-cursor-move mdi v-icon notranslate v-theme--light v-icon--size-small" aria-hidden="true" style="cursor: pointer;"></i>',
});

watchEffect(() => {
  const {current} = store.state.layers;
  if (map.value) {
    const currentLayer = map.value.map.getAllLayers().find((el) => el.get('id') === current);
    map.value.map.removeControl(editBar);
    if (currentLayer) {
      const editBarOptions = {
        source: currentLayer.getSource(),
        interactions: {
          Info: false,
        },
      };
      editBar = new EditBar(editBarOptions);
      editBar.getInteraction('DrawPoint').on('drawstart', (event) => {
        const {feature} = event;
        const newStyle = new Style({
          image: new Icon({
            src: './signs/flag-variant-outline.svg',
            opacity: 1,
            scale: 2,
          }),
        });
        feature.setStyle(newStyle);
      });
      editBar.getInteraction('DrawPoint').on('change:active', (event) => {
        const pickedInteraction = event.target;
        if (pickedInteraction.getActive()) {
          const newStyle = new Style({
            image: new Icon({
              src: './signs/flag-variant-outline.png',
              opacity: 1,
              scale: 0.1,
            }),
          });
          pickedInteraction.getOverlay().setStyle(newStyle);
        }
      });
      toggleMove.setActive(true);
      editBar.addControl(toggleMove);
      map.value.map.addControl(editBar);
    }
  }
});

onMounted(() => {
  // Remove default controls
  map.value.map.getControls().clear();

  const {onResult} = useQuery(layersQuery);

  onResult((queryResult) => {
    store.commit('layers/setLoading', queryResult.loading);
    console.log('Query updating');
    if (queryResult?.data?.layers) {
      store.commit('layers/setLayers', queryResult.data.layers);
      const {layers} = store.state.layers;
      for (const layer of layers) {
        const mapLayersIds = map.value.map.getAllLayers().map((el) => el.get('id'));
        if (!mapLayersIds.includes(layer.id)) {
          let geojson;
          let newVector;
          try {
            geojson = JSON.parse(layer.content);
            newVector = new SourceVector({
              features: new GeoJSON().readFeatures(geojson),
            });
          } catch (e) {
            newVector = new SourceVector();
          }
          const newLayer = new VectorLayer({
            title: layer.title,
            visible: layer.visible,
          });
          if (layer.current) {
            store.commit('layers/setCurrentLayer', layer.id);
          }
          newLayer.set('id', layer.id);
          newLayer.setVisible(layer.visible);
          newLayer.setSource(newVector);
          map.value.map.addLayer(newLayer);
        }
      }
    }
  });

  const saveGeoJSONControl = new Button({
    html: '<i class="mdi-download mdi v-icon notranslate v-theme--light v-icon--size-small" aria-hidden="true" style="cursor: pointer"></i>',
    title: 'Save as GeoJSON',
    handleClick: () => {
      const layerToSave = map.value.map.getLayers().getArray().find((el) => el.get('id') === store.state.layers.current);
      const vectorFeatures = layerToSave.getSource().getFeatures();
      const features = [];
      vectorFeatures.forEach((feature) => {
        feature.setProperties({style: feature.getStyle()});
        features.push(feature);
      });
      console.log(layerToSave.getStyle());
      const geoJson = new GeoJSON().writeFeatures(features);
      const a = document.createElement('a');
      const file = new Blob([JSON.stringify(geoJson)], {type: 'application/json'});
      a.href = URL.createObjectURL(file);
      a.download = 'GeoJSON_Example.json';
      a.click();
      a.remove();
    },
  });
  const importGeoJSONControl = new Button({
    html: '<i class="mdi-import mdi v-icon notranslate v-theme--light v-icon--size-small" aria-hidden="true" style="cursor: pointer"></i>',
    title: 'Import from GeoJSON',
    handleClick: () => {
      uploadGeoJSONInput.value.click();
    },
  });

  const barControl = new Bar({
    controls: [
      new FullScreen(),
      new Zoom(),
      new Rotate(),
      new GeolocationButton({delay: 10000}),
      saveGeoJSONControl,
      importGeoJSONControl,
    ],
  });
  barControl.setPosition('top-left');
  map.value.map.addControl(barControl);

  const layerSwitchImageControl = new LayerSwitcherImage();
  layerSwitchImageControl.on('layer:visible', (event) => {
    const {layer} = event;
    if (layer instanceof VectorLayer) {
      const storeLayer = store.state.layers.layers.find((el) => el.id === layer.get('id'));
      if (storeLayer && storeLayer.visible !== layer.getVisible()) {
        changeLayerVisibleMutation({id: storeLayer.id});
      }
    }
  });
  map.value.map.on('loadend', () => {
    // Sources need to become 'ready' before the tiles can be accessed and layer.getPreview working
    map.value.map.addControl(layerSwitchImageControl);
  });
});

const uploadGeoJSON = (event) => {
  const geoJsonFile = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (res) => {
    const geojson = JSON.parse(res.target.result);
    const newVectorLayer = new VectorLayer({
      title: 'Imported',
      source: new SourceVector({
        features: new GeoJSON().readFeatures(geojson),
      }),
    });
    newVectorLayer.getSource().forEachFeature((feature) => {
      const featureProperties = feature.getProperties();
      if ('style' in featureProperties && featureProperties.style !== null) {
        feature.setGeometry(featureProperties.geometry);
        const newStyle = new Style({
          image: new Icon({
            src: featureProperties.style.image_.iconImage_.src_,
            opacity: featureProperties.style.image_.opacity_,
            scale: featureProperties.style.image_.scale_,
          }),
        });
        feature.setStyle(newStyle);
      }
    });
    map.value.map.addLayer(newVectorLayer);
  };
  reader.readAsText(geoJsonFile);
};
</script>

<style>

</style>
